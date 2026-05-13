import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const { Pool } = pg;
const app = express();
const port = process.env.PORT || 8080;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json({ limit: '2mb' }));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false },
});

function toCamel(row) {
  if (!row) return row;
  const out = {};
  for (const [key, value] of Object.entries(row)) {
    out[key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())] = value;
  }
  return out;
}

function rows(result) {
  return result.rows.map(toCamel);
}

async function query(text, params = []) {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured');
  return pool.query(text, params);
}

async function initHrSchema() {
  await query(`
    CREATE TABLE IF NOT EXISTS employees (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      title TEXT NOT NULL DEFAULT '',
      department TEXT NOT NULL DEFAULT '',
      manager TEXT NOT NULL DEFAULT '',
      employment_type TEXT NOT NULL DEFAULT 'Salary',
      start_date DATE NOT NULL DEFAULT CURRENT_DATE,
      pto_balance NUMERIC NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'Active',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS pto_requests (
      id SERIAL PRIMARY KEY,
      employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
      type TEXT NOT NULL DEFAULT 'PTO',
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      hours NUMERIC NOT NULL DEFAULT 0,
      reason TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'Pending',
      admin_note TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS hr_support_requests (
      id SERIAL PRIMARY KEY,
      employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
      category TEXT NOT NULL DEFAULT 'Other',
      summary TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'Open',
      assigned_to TEXT NOT NULL DEFAULT 'HR Admin',
      resolution TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS handbook_documents (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL DEFAULT 'Steel Craft Employee Handbook',
      version TEXT NOT NULL,
      effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
      content_url TEXT NOT NULL DEFAULT '',
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS handbook_acknowledgements (
      id SERIAL PRIMARY KEY,
      handbook_id INTEGER REFERENCES handbook_documents(id) ON DELETE CASCADE,
      employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
      acknowledged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(handbook_id, employee_id)
    );

    CREATE TABLE IF NOT EXISTS training_courses (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'General',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS training_lessons (
      id SERIAL PRIMARY KEY,
      course_id INTEGER REFERENCES training_courses(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS employee_training_assignments (
      id SERIAL PRIMARY KEY,
      course_id INTEGER REFERENCES training_courses(id) ON DELETE CASCADE,
      employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
      completed_at TIMESTAMPTZ,
      assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(course_id, employee_id)
    );
  `);
}

async function seedHrData() {
  const employeeCount = await query('SELECT COUNT(*)::int AS count FROM employees');
  if (employeeCount.rows[0].count === 0) {
    await query(`
      INSERT INTO employees (name, title, department, manager, employment_type, start_date, pto_balance, status) VALUES
      ('Avery Taylor', 'Project Manager', 'Operations', 'Seth Farrell', 'Salary', '2024-01-08', 88, 'Active'),
      ('Jordan Lee', 'Estimator', 'Sales & Estimating', 'Seth Farrell', 'Salary', '2023-08-21', 64, 'Active'),
      ('Morgan Wells', 'Shop Lead', 'Fabrication', 'Seth Farrell', 'Salary', '2022-03-14', 112, 'Active')
    `);
  }

  const handbookCount = await query('SELECT COUNT(*)::int AS count FROM handbook_documents');
  if (handbookCount.rows[0].count === 0) {
    await query(`INSERT INTO handbook_documents (title, version, effective_date, is_active) VALUES ('Steel Craft Employee Handbook', '2026.1', CURRENT_DATE, TRUE)`);
  }

  const trainingCount = await query('SELECT COUNT(*)::int AS count FROM training_courses');
  if (trainingCount.rows[0].count === 0) {
    const courses = [
      ['Company Process', 'Process', ['Portal overview', 'Internal communication', 'Daily project flow']],
      ['Safety', 'Safety', ['Jobsite basics', 'Shop safety', 'Incident reporting']],
      ['Software', 'Software', ['Monday workflows', 'Portal records', 'File procedures']],
      ['Estimating Workflow', 'Estimating', ['Estimate intake', 'Scope builder', 'Quote handoff']],
    ];
    const employees = await query('SELECT id FROM employees ORDER BY id');
    for (const [title, category, lessons] of courses) {
      const course = await query('INSERT INTO training_courses (title, category) VALUES ($1, $2) RETURNING id', [title, category]);
      const courseId = course.rows[0].id;
      for (let index = 0; index < lessons.length; index += 1) {
        await query('INSERT INTO training_lessons (course_id, title, sort_order) VALUES ($1, $2, $3)', [courseId, lessons[index], index + 1]);
      }
      for (const employee of employees.rows) {
        await query('INSERT INTO employee_training_assignments (course_id, employee_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [courseId, employee.id]);
      }
    }
  }
}

async function hrPayload() {
  const employees = rows(await query('SELECT * FROM employees ORDER BY id'));
  const ptoRequests = rows(await query('SELECT * FROM pto_requests ORDER BY created_at DESC, id DESC'));
  const supportRequests = rows(await query('SELECT * FROM hr_support_requests ORDER BY created_at DESC, id DESC'));
  const handbookRow = toCamel((await query('SELECT * FROM handbook_documents WHERE is_active = TRUE ORDER BY created_at DESC LIMIT 1')).rows[0]);
  const acknowledged = handbookRow ? rows(await query('SELECT employee_id FROM handbook_acknowledgements WHERE handbook_id = $1', [handbookRow.id])).map((row) => row.employeeId) : [];
  const courseRows = rows(await query('SELECT * FROM training_courses ORDER BY id'));
  const lessonRows = rows(await query('SELECT * FROM training_lessons ORDER BY sort_order, id'));
  const assignmentRows = rows(await query('SELECT * FROM employee_training_assignments ORDER BY id'));
  const training = courseRows.map((course) => ({
    ...course,
    lessons: lessonRows.filter((lesson) => lesson.courseId === course.id).map((lesson) => lesson.title),
    assignedTo: assignmentRows.filter((assignment) => assignment.courseId === course.id).map((assignment) => assignment.employeeId),
    completedBy: assignmentRows.filter((assignment) => assignment.courseId === course.id && assignment.completedAt).map((assignment) => assignment.employeeId),
  }));
  return {
    employees,
    ptoRequests,
    supportRequests,
    handbook: handbookRow ? { ...handbookRow, acknowledgedBy: acknowledged } : null,
    training,
  };
}

app.get('/api/health', async (_req, res) => {
  try {
    await query('SELECT 1');
    res.json({ ok: true, checks: { app: 'ok', database: 'connected' } });
  } catch (error) {
    res.status(500).json({ ok: false, checks: { app: 'ok', database: 'error' }, error: error.message });
  }
});

app.post('/api/setup/schema', async (_req, res) => {
  try {
    await initHrSchema();
    await seedHrData();
    res.json({ ok: true, message: 'HR schema initialized and seeded' });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

app.get('/api/hr/schema/status', async (_req, res) => {
  try {
    const result = await query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('employees','pto_requests','hr_support_requests','handbook_documents','handbook_acknowledgements','training_courses','training_lessons','employee_training_assignments')
      ORDER BY table_name
    `);
    res.json({ ok: true, tables: result.rows.map((row) => row.table_name) });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

app.get('/api/hr', async (_req, res) => {
  try {
    await initHrSchema();
    await seedHrData();
    res.json(await hrPayload());
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

app.get('/api/hr/employees', async (_req, res) => {
  try { res.json(rows(await query('SELECT * FROM employees ORDER BY id'))); } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/hr/employees', async (req, res) => {
  try {
    const { name, title = '', department = '', manager = '', startDate, ptoBalance = 0, status = 'Active' } = req.body;
    const result = await query(
      'INSERT INTO employees (name, title, department, manager, employment_type, start_date, pto_balance, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [name, title, department, manager, 'Salary', startDate || new Date().toISOString().slice(0, 10), ptoBalance, status]
    );
    res.status(201).json(toCamel(result.rows[0]));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/hr/pto/requests', async (req, res) => {
  try {
    const { employeeId, type, startDate, endDate, hours, reason } = req.body;
    const result = await query(
      'INSERT INTO pto_requests (employee_id, type, start_date, end_date, hours, reason, status) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [employeeId, type, startDate, endDate, hours, reason || '', 'Pending']
    );
    res.status(201).json(toCamel(result.rows[0]));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/hr/pto/requests/:id/approve', async (req, res) => {
  try {
    const result = await query('UPDATE pto_requests SET status = $1, admin_note = COALESCE($2, admin_note), updated_at = NOW() WHERE id = $3 RETURNING *', ['Approved', req.body?.adminNote || '', req.params.id]);
    res.json(toCamel(result.rows[0]));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/hr/pto/requests/:id/deny', async (req, res) => {
  try {
    const result = await query('UPDATE pto_requests SET status = $1, admin_note = COALESCE($2, admin_note), updated_at = NOW() WHERE id = $3 RETURNING *', ['Denied', req.body?.adminNote || '', req.params.id]);
    res.json(toCamel(result.rows[0]));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/hr/concerns', async (req, res) => {
  try {
    const { employeeId, category, summary } = req.body;
    const result = await query('INSERT INTO hr_support_requests (employee_id, category, summary, status, assigned_to) VALUES ($1,$2,$3,$4,$5) RETURNING *', [employeeId, category, summary, 'Open', 'HR Admin']);
    res.status(201).json(toCamel(result.rows[0]));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.patch('/api/hr/concerns/:id', async (req, res) => {
  try {
    const { status = 'Resolved', resolution = 'Resolved by HR Admin' } = req.body;
    const result = await query('UPDATE hr_support_requests SET status = $1, resolution = $2, updated_at = NOW() WHERE id = $3 RETURNING *', [status, resolution, req.params.id]);
    res.json(toCamel(result.rows[0]));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/hr/handbook', async (_req, res) => {
  try {
    const payload = await hrPayload();
    res.json(payload.handbook);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/hr/handbook/acknowledge', async (req, res) => {
  try {
    const handbook = await query('SELECT id FROM handbook_documents WHERE is_active = TRUE ORDER BY created_at DESC LIMIT 1');
    const handbookId = handbook.rows[0].id;
    await query('INSERT INTO handbook_acknowledgements (handbook_id, employee_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [handbookId, req.body.employeeId]);
    res.status(201).json({ ok: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/hr/training/modules', async (req, res) => {
  try {
    const { title, category, lessons = [] } = req.body;
    const course = await query('INSERT INTO training_courses (title, category) VALUES ($1, $2) RETURNING *', [title, category]);
    const courseId = course.rows[0].id;
    for (let index = 0; index < lessons.length; index += 1) {
      await query('INSERT INTO training_lessons (course_id, title, sort_order) VALUES ($1,$2,$3)', [courseId, lessons[index], index + 1]);
    }
    const employees = await query('SELECT id FROM employees');
    for (const employee of employees.rows) {
      await query('INSERT INTO employee_training_assignments (course_id, employee_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [courseId, employee.id]);
    }
    res.status(201).json(toCamel(course.rows[0]));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.patch('/api/hr/training/assignments/:courseId/complete', async (req, res) => {
  try {
    await query('UPDATE employee_training_assignments SET completed_at = NOW() WHERE course_id = $1 AND employee_id = $2', [req.params.courseId, req.body.employeeId]);
    res.json({ ok: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Steel Craft portal listening on ${port}`);
});
