import * as XLSX from 'xlsx';

function money(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return 0;
  const cleaned = value.replace(/[$,%\s,]/g, '');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function looksLikeTotal(label) {
  return /total|subtotal|tax|labor|material|deposit|margin|markup|quote|price|amount|cost/i.test(String(label || ''));
}

function detectNumbers(rows) {
  const numbers = [];
  for (const row of rows) {
    for (let index = 0; index < row.length; index += 1) {
      const value = row[index];
      const amount = money(value);
      if (!amount) continue;
      const left = row[index - 1] || row[index - 2] || '';
      const right = row[index + 1] || '';
      const label = looksLikeTotal(left) ? left : looksLikeTotal(right) ? right : '';
      numbers.push({ label: String(label || 'Detected number'), amount, columnIndex: index });
    }
  }
  return numbers.slice(0, 100);
}

function pickTotal(numbers) {
  const totalCandidate = numbers.find((item) => /grand total|quote total|total/i.test(item.label));
  if (totalCandidate) return totalCandidate.amount;
  return numbers.reduce((max, item) => Math.max(max, item.amount), 0);
}

function sheetToRows(sheet) {
  return XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: false, defval: '' });
}

function summarizeWorkbook(buffer, originalName) {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellFormula: true, cellDates: true });
  const sheets = workbook.SheetNames.map((name) => {
    const rows = sheetToRows(workbook.Sheets[name]);
    const numbers = detectNumbers(rows);
    return {
      name,
      rowCount: rows.length,
      columnCount: rows.reduce((max, row) => Math.max(max, row.length), 0),
      numbers,
      previewRows: rows.slice(0, 12)
    };
  });

  const allNumbers = sheets.flatMap((sheet) => sheet.numbers.map((number) => ({ ...number, sheet: sheet.name })));
  const quoteTotal = pickTotal(allNumbers);
  const subtotal = allNumbers.find((item) => /subtotal/i.test(item.label))?.amount || quoteTotal;
  const tax = allNumbers.find((item) => /tax/i.test(item.label))?.amount || 0;
  const laborTotal = allNumbers.find((item) => /labor/i.test(item.label))?.amount || 0;

  return {
    originalName,
    sheetCount: sheets.length,
    sheets,
    detectedNumbers: allNumbers.slice(0, 40),
    totals: {
      subtotal,
      tax,
      laborTotal,
      quoteTotal
    }
  };
}

export async function ensureQuoteWorkbookSchema(db) {
  await db.query(`
    create table if not exists quote_workbooks (
      id bigserial primary key,
      original_filename text not null,
      file_size bigint not null default 0,
      sheet_count integer not null default 0,
      detected_total numeric(14,2) not null default 0,
      estimate_id bigint references estimates(id) on delete set null,
      status text not null default 'uploaded',
      summary jsonb not null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    );

    create table if not exists quote_workbook_sheets (
      id bigserial primary key,
      workbook_id bigint not null references quote_workbooks(id) on delete cascade,
      sheet_name text not null,
      row_count integer not null default 0,
      column_count integer not null default 0,
      detected_numbers jsonb not null default '[]'::jsonb,
      preview_rows jsonb not null default '[]'::jsonb,
      created_at timestamptz not null default now()
    );
  `);
}

export async function importQuoteWorkbook(db, file, actor = 'estimating') {
  if (!file?.buffer?.length) {
    const error = new Error('No workbook file was uploaded.');
    error.statusCode = 400;
    throw error;
  }

  const summary = summarizeWorkbook(file.buffer, file.originalname);

  const estimateResult = await db.query(
    `insert into estimates (project_name, estimator_name, status, source_workbook, raw)
     values ($1, $2, $3, $4, $5)
     returning id, estimate_number, project_name, status`,
    [file.originalname.replace(/\.[^.]+$/, ''), actor, 'draft', file.originalname, summary]
  );
  const estimate = estimateResult.rows[0];

  const quoteResult = await db.query(
    `insert into quotation_versions (estimate_id, quote_type, status, subtotal, tax, labor_total, total, raw)
     values ($1, $2, $3, $4, $5, $6, $7, $8)
     returning id, subtotal, tax, labor_total, total`,
    [estimate.id, 'workbook_import', 'draft', summary.totals.subtotal, summary.totals.tax, summary.totals.laborTotal, summary.totals.quoteTotal, summary]
  );
  const quotation = quoteResult.rows[0];

  const workbookResult = await db.query(
    `insert into quote_workbooks (original_filename, file_size, sheet_count, detected_total, estimate_id, status, summary)
     values ($1, $2, $3, $4, $5, $6, $7)
     returning id, original_filename, sheet_count, detected_total, status, estimate_id, created_at`,
    [file.originalname, file.size || file.buffer.length, summary.sheetCount, summary.totals.quoteTotal, estimate.id, 'parsed', summary]
  );
  const workbook = workbookResult.rows[0];

  for (const sheet of summary.sheets) {
    await db.query(
      `insert into quote_workbook_sheets (workbook_id, sheet_name, row_count, column_count, detected_numbers, preview_rows)
       values ($1, $2, $3, $4, $5, $6)`,
      [workbook.id, sheet.name, sheet.rowCount, sheet.columnCount, sheet.numbers, sheet.previewRows]
    );
  }

  await db.query(
    `insert into portal_activity_logs (actor, action, entity_type, entity_id, metadata)
     values ($1, $2, $3, $4, $5)`,
    [actor, 'quote_workbook_imported', 'quote_workbook', String(workbook.id), { estimateId: estimate.id, quotationId: quotation.id, filename: file.originalname }]
  );

  return {
    workbook,
    estimate,
    quotation,
    summary: {
      sheetCount: summary.sheetCount,
      sheets: summary.sheets.map((sheet) => ({ name: sheet.name, rowCount: sheet.rowCount, columnCount: sheet.columnCount, detectedNumberCount: sheet.numbers.length })),
      detectedNumbers: summary.detectedNumbers,
      totals: summary.totals
    }
  };
}
