import express from 'express';
import multer from 'multer';
import { Pool } from 'pg';
import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ensureEstimatingSchema } from './server/estimatingSchema.js';
import { ensureHrSchema } from './server/hrSchema.js';
import { ensureQuoteWorkbookSchema, importQuoteWorkbook } from './server/quoteWorkbook.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024 } });
const port = process.env.PORT || 8080;
const mondayApiUrl = process.env.MONDAY_API_URL || 'https://api.monday.com/v2';

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'dist')));

function getDatabaseUrl() {
  if (!process.env.DATABASE_URL) return null;
  const url = new URL(process.env.DATABASE_URL);
  url.searchParams.delete('sslmode');
  return url.toString();
}

const databaseUrl = getDatabaseUrl();
const pool = databaseUrl ? new Pool({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } }) : null;

function requireDatabase() {
  if (!pool) {
    const error = new Error('DATABASE_URL is not configured.');
    error.statusCode = 500;
    throw error;
  }
  return pool;
}

function requireMondayToken() {
  if (!process.env.MONDAY_API_TOKEN) {
    const error = new Error('MONDAY_API_TOKEN is not configured.');
    error.statusCode = 500;
    throw error;
  }
  return process.env.MONDAY_API_TOKEN;
}

function safeJson(value) {
  try {
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

async function mondayQuery(query, variables = {}) {
  const token = requireMondayToken();
  const response = await fetch(mondayApiUrl, {
    method: 'POST',
    headers: { Authorization: token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables })
  });
  const payload = await response.json();
  if (!response.ok || payload.errors) {
    const message = payload.errors?.map((item) => item.message).join('; ') || `Monday API returned ${response.status}`;
    const error = new Error(message);
    error.statusCode = response.status || 502;
    throw error;
  }
  return payload.data;
}

async function ensureSchema() {
  const db = requireDatabase();
  await db.query(`
    create table if not exists monday_boards (
      id text primary key,
      name text not null,
      workspace_name text,
      board_kind text,
      state text,
      raw jsonb not null,
      pulled_at timestamptz not null default now()
    );
    create table if not exists monday_columns (
      id text not null,
      board_id text not null references monday_boards(id) on delete cascade,
      title text not null,
      type text,
      settings jsonb,
      raw jsonb not null,
      pulled_at timestamptz not null default now(),
      primary key (board_id, id)
    );
    create table if not exists monday_items (
      id text primary key,
      board_id text not null references monday_boards(id) on delete cascade,
      name text not null,
      group_title text,
      raw jsonb not null,
      pulled_at timestamptz not null default now()
    );
    create table if not exists companies (
      id bigserial primary key,
      source text default 'manual',
      source_id text,
      name text not null,
      company_type text,
      email text,
      phone text,
      raw jsonb,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      unique (source, source_id)
    );
    create table if not exists projects (
      id bigserial primary key,
      source text default 'manual',
      source_id text,
      name text not null,
      status text,
      company_id bigint references companies(id),
      raw jsonb,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      unique (source, source_id)
    );
    create table if not exists portal_activity_logs (
      id bigserial primary key,
      actor text,
      action text not null,
      entity_type text,
      entity_id text,
      metadata jsonb,
      created_at timestamptz not null default now()
    );
  `);
  await ensureEstimatingSchema(db);
  await ensureQuoteWorkbookSchema(db);
  await ensureHrSchema(db);
}

async function pullMondayBoards() {
  return mondayQuery(`
    query SteelCraftBoards {
      boards(limit: 100) {
        id
        name
        board_kind
        state
        workspace { id name }
        columns { id title type settings_str }
      }
    }
  `);
}

async function syncMondayBoards() {
  await ensureSchema();
  const data = await pullMondayBoards();
  for (const board of data.boards) {
    await pool.query(
      `insert into monday_boards (id, name, workspace_name, board_kind, state, raw, pulled_at)
       values ($1, $2, $3, $4, $5, $6, now())
       on conflict (id) do update set name = excluded.name, workspace_name = excluded.workspace_name, board_kind = excluded.board_kind, state = excluded.state, raw = excluded.raw, pulled_at = now()`,
      [board.id, board.name, board.workspace?.name || null, board.board_kind, board.state, board]
    );
    for (const column of board.columns || []) {
      await pool.query(
        `insert into monday_columns (id, board_id, title, type, settings, raw, pulled_at)
         values ($1, $2, $3, $4, $5, $6, now())
         on conflict (board_id, id) do update set title = excluded.title, type = excluded.type, settings = excluded.settings, raw = excluded.raw, pulled_at = now()`,
        [column.id, board.id, column.title, column.type, safeJson(column.settings_str), column]
      );
    }
  }
  await pool.query(`insert into portal_activity_logs (actor, action, entity_type, metadata) values ($1, $2, $3, $4)`, ['system', 'monday_boards_synced', 'monday', { board_count: data.boards.length }]);
  return data.boards;
}

app.get('/api/health', async (req, res) => {
  const checks = { app: 'ok', database: 'not_configured', monday: process.env.MONDAY_API_TOKEN ? 'configured' : 'not_configured', spaces: process.env.DO_SPACES_BUCKET ? 'configured' : 'not_configured' };
  try {
    if (pool) {
      await pool.query('select 1 as ok');
      checks.database = 'connected';
    }
  } catch (error) {
    checks.database = `error: ${error.message}`;
  }
  res.json({ ok: checks.database === 'connected', checks });
});

app.post('/api/setup/schema', async (req, res, next) => {
  try {
    await ensureSchema();
    await pool.query(`insert into portal_activity_logs (actor, action, entity_type, metadata) values ($1, $2, $3, $4)`, ['system', 'schema_initialized', 'database', { estimating: true, quoteWorkbooks: true, hr: true }]);
    res.json({ ok: true, message: 'Steel Craft portal schema initialized, including estimating, quote workbook, and HR portal tables.' });
  } catch (error) {
    next(error);
  }
});

app.get('/api/estimating/schema/status', async (req, res, next) => {
  try {
    await ensureSchema();
    const db = requireDatabase();
    const tables = await db.query(`
      select table_name from information_schema.tables
      where table_schema = 'public'
        and table_name in ('estimates', 'estimate_cost_lines', 'estimate_deposit_schedule', 'quotation_versions', 'quotation_lines', 'project_checklist_items', 'invoices', 'invoice_lines', 'schedule_of_values', 'change_orders', 'quote_workbooks', 'quote_workbook_sheets')
      order by table_name
    `);
    res.json({ ok: true, tables: tables.rows.map((row) => row.table_name) });
  } catch (error) {
    next(error);
  }
});

app.post('/api/estimating/quote-workbooks', upload.single('workbook'), async (req, res, next) => {
  try {
    await ensureSchema();
    const db = requireDatabase();
    const result = await importQuoteWorkbook(db, req.file, req.body.actor || 'estimating');
    res.json({ ok: true, ...result });
  } catch (error) {
    next(error);
  }
});

app.get('/api/estimating/quote-workbooks', async (req, res, next) => {
  try {
    await ensureSchema();
    const db = requireDatabase();
    const workbooks = await db.query(`
      select qw.id, qw.original_filename, qw.file_size, qw.sheet_count, qw.detected_total, qw.status, qw.estimate_id, qw.created_at,
             e.project_name, qv.id as quotation_id, qv.total as quote_total
      from quote_workbooks qw
      left join estimates e on e.id = qw.estimate_id
      left join quotation_versions qv on qv.estimate_id = e.id
      order by qw.created_at desc
      limit 20
    `);
    res.json({ ok: true, workbooks: workbooks.rows });
  } catch (error) {
    next(error);
  }
});

app.get('/api/estimating/quote-workbooks/:id', async (req, res, next) => {
  try {
    await ensureSchema();
    const db = requireDatabase();
    const workbook = await db.query(`select * from quote_workbooks where id = $1`, [req.params.id]);
    if (!workbook.rows[0]) return res.status(404).json({ ok: false, error: 'Quote workbook not found.' });
    const sheets = await db.query(`select sheet_name, row_count, column_count, detected_numbers, preview_rows from quote_workbook_sheets where workbook_id = $1 order by id`, [req.params.id]);
    res.json({ ok: true, workbook: workbook.rows[0], sheets: sheets.rows });
  } catch (error) {
    next(error);
  }
});

app.get('/api/hr/schema/status', async (req, res, next) => {
  try {
    await ensureSchema();
    const db = requireDatabase();
    const tables = await db.query(`
      select table_name from information_schema.tables
      where table_schema = 'public'
        and table_name in ('employees', 'pto_policies', 'pto_balances', 'pto_requests', 'company_holidays', 'handbook_documents', 'handbook_acknowledgements', 'onboarding_checklists', 'onboarding_tasks', 'training_courses', 'training_lessons', 'employee_training_assignments')
      order by table_name
    `);
    res.json({ ok: true, tables: tables.rows.map((row) => row.table_name) });
  } catch (error) {
    next(error);
  }
});

app.get('/api/monday/boards', async (req, res, next) => {
  try {
    const data = await pullMondayBoards();
    res.json({ ok: true, boards: data.boards });
  } catch (error) {
    next(error);
  }
});

app.post('/api/monday/sync-boards', async (req, res, next) => {
  try {
    const boards = await syncMondayBoards();
    res.json({ ok: true, syncedBoards: boards.length });
  } catch (error) {
    next(error);
  }
});

app.get('/api/monday/migration/start', async (req, res, next) => {
  try {
    const boards = await syncMondayBoards();
    res.json({ ok: true, message: 'Monday migration pass 1 complete: board and column structure synced.', syncedBoards: boards.length, next: 'Review /api/monday/migration/summary, then choose board IDs for ERP portal migration.' });
  } catch (error) {
    next(error);
  }
});

app.get('/api/monday/migration/summary', async (req, res, next) => {
  try {
    await ensureSchema();
    const boards = await pool.query(`
      select b.id, b.name, b.workspace_name, b.board_kind, b.state, b.pulled_at, count(c.id)::int as column_count
      from monday_boards b left join monday_columns c on c.board_id = b.id
      group by b.id
      order by lower(b.name)
    `);
    res.json({ ok: true, boards: boards.rows });
  } catch (error) {
    next(error);
  }
});

app.get('/api/spaces/status', async (req, res, next) => {
  try {
    if (!process.env.DO_SPACES_KEY || !process.env.DO_SPACES_SECRET || !process.env.DO_SPACES_ENDPOINT) return res.json({ ok: false, configured: false });
    const client = new S3Client({ endpoint: process.env.DO_SPACES_ENDPOINT, region: process.env.DO_SPACES_REGION || 'us-east-1', credentials: { accessKeyId: process.env.DO_SPACES_KEY, secretAccessKey: process.env.DO_SPACES_SECRET } });
    await client.send(new ListBucketsCommand({}));
    res.json({ ok: true, configured: true, bucket: process.env.DO_SPACES_BUCKET || null });
  } catch (error) {
    next(error);
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  res.status(status).json({ ok: false, error: error.message });
});

app.listen(port, () => {
  console.log(`Steel Craft portal server listening on ${port}`);
});
