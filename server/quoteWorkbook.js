import * as XLSX from 'xlsx';

function text(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function number(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return 0;
  const parsed = Number(value.replace(/[$,%\s,]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function cell(sheet, address) {
  const item = sheet?.[address];
  if (!item) return null;
  return item.v ?? null;
}

function sheetRows(sheet) {
  return XLSX.utils.sheet_to_json(sheet, { header: 1, blankrows: false, defval: '' });
}

function readWorkbook(buffer, originalName) {
  const wb = XLSX.read(buffer, { type: 'buffer', cellFormula: true, cellDates: true });
  const s = (name) => wb.Sheets[name];
  const estimate = s('Estimate Sheet');
  const projectInfo = s('Project Info');
  const feQuote = s('F&E Quotation');
  const eoQuote = s('EO Quotation');

  const baseCostRows = [11, 12, 13, 14, 15, 16, 17, 18].map((row) => ({
    section: 'base_costs',
    lineType: text(cell(estimate, `B${row}`)),
    description: text(cell(estimate, `B${row}`)),
    cost: number(cell(estimate, `C${row}`)),
    markupRate: number(cell(estimate, `E${row}`)),
    total: number(cell(estimate, `F${row}`)),
    sortOrder: row
  })).filter((line) => line.description);

  const alternateRows = Array.from({ length: 10 }, (_, index) => index + 32).map((row) => ({
    section: 'alternates',
    lineType: 'alternate',
    description: text(cell(estimate, `B${row}`)),
    cost: number(cell(estimate, `C${row}`)),
    markupRate: number(cell(estimate, `D${row}`)),
    total: number(cell(estimate, `J${row}`)),
    laborAmount: number(cell(estimate, `I${row}`)),
    taxRate: number(cell(estimate, `G${row}`)),
    tax: number(cell(estimate, `H${row}`)),
    sortOrder: row,
    isOptional: true
  })).filter((line) => line.description);

  const depositRows = [
    ['material', 'First Material Deposit', 'I18', 'J18', 1],
    ['material', 'Second Material Deposit', 'I19', 'J19', 2],
    ['material', 'Third Material Deposit', 'I20', 'J20', 3],
    ['material', 'Final Material Deposit', 'I21', 'J21', 4],
    ['material', 'Extra Material Deposit', 'I22', 'J22', 5],
    ['material', 'Total MATERIALS Deposit', 'I24', null, 6],
    ['labor', 'First LABOR Deposit', 'I25', 'J25', 7],
    ['labor', 'Second LABOR Deposit', 'I26', 'J26', 8],
    ['labor', 'Total LABOR Deposit', 'I27', null, 9]
  ].map(([type, label, amountCell, pctCell, sort]) => ({
    depositType: type,
    label,
    amount: number(cell(estimate, amountCell)),
    percentage: pctCell ? number(cell(estimate, pctCell)) : 0,
    sortOrder: sort
  }));

  const quoteLines = (sheetName, startRow, endRow) => {
    const sheet = s(sheetName);
    return Array.from({ length: endRow - startRow + 1 }, (_, index) => startRow + index).map((row) => ({
      qty: number(cell(sheet, `D${row}`)) || 1,
      description: text(cell(sheet, `F${row}`)),
      unitPrice: number(cell(sheet, `I${row}`)),
      lineTotal: number(cell(sheet, `K${row}`)),
      sortOrder: row,
      raw: { sheetName, row }
    })).filter((line) => line.description || line.lineTotal);
  };

  const projectChecklistRows = Array.from({ length: 15 }, (_, index) => index + 7).map((row) => ({
    itemName: text(cell(s('Project Checklist'), `A${row}`)),
    scopeStatus: text(cell(s('Project Checklist'), `D${row}`)) || 'select option',
    provider: text(cell(s('Project Checklist'), `E${row}`)),
    releasedStatus: text(cell(s('Project Checklist'), `F${row}`)) || 'select option',
    quantity: number(cell(s('Project Checklist'), `I${row}`)),
    sortOrder: row
  })).filter((item) => item.itemName);

  const invoiceRows = Array.from({ length: 6 }, (_, index) => index + 3).map((row) => ({
    invoiceName: text(cell(s('Invoice'), `AB${row}`)),
    invoiceNumber: text(cell(s('Invoice'), `X${row}`)),
    invoiceType: text(cell(s('Invoice'), `Y${row}`)),
    subtotal: number(cell(s('Invoice'), `Z${row}`)),
    tax: number(cell(s('Invoice'), `AA${row}`)),
    total: number(cell(s('Invoice'), `Z${row}`)) + number(cell(s('Invoice'), `AA${row}`)),
    raw: { sourceSelection: text(cell(s('Invoice'), `W${row}`)) }
  })).filter((invoice) => invoice.invoiceName);

  const sovRows = ['Material SOV 1', 'Material SOV 2', 'Material SOV 3', 'Material SOV 4', 'Labor SOV 1', 'Labor SOV 2'].flatMap((sheetName) => {
    const sheet = s(sheetName);
    return Array.from({ length: 20 }, (_, index) => index + 8).map((row) => ({
      sovType: sheetName,
      drawNumber: number(sheetName.match(/(\d+)/)?.[1] || 0),
      lineNumber: row,
      description: text(cell(sheet, `B${row}`)) || text(cell(sheet, `C${row}`)),
      scheduledValue: number(cell(sheet, `E${row}`)),
      previousBilled: number(cell(sheet, `F${row}`)),
      thisPeriod: number(cell(sheet, `G${row}`)),
      balanceToFinish: number(cell(sheet, `H${row}`)),
      retainage: number(cell(sheet, `I${row}`)),
      raw: { sheetName, row }
    })).filter((item) => item.description || item.scheduledValue || item.thisPeriod);
  });

  const changeOrderRows = Array.from({ length: 10 }, (_, index) => index + 8).map((row, index) => ({
    coNumber: text(cell(s('CO Totals'), `A${row}`)) || `CO${index + 1}`,
    description: text(cell(s('CO Totals'), `B${row}`)),
    dateSent: cell(s('CO Totals'), `D${row}`),
    amountCharged: number(cell(s('CO Totals'), `E${row}`)),
    result: text(cell(s('CO Totals'), `F${row}`)) || 'pending',
    dateReturned: cell(s('CO Totals'), `G${row}`),
    issuedNumber: text(cell(s('CO Totals'), `H${row}`)),
    authorizedAmount: number(cell(s('CO Totals'), `I${row}`)),
    billedOnDraw: text(cell(s('CO Totals'), `J${row}`)),
    raw: { sourceSheet: `CO${index + 1}` }
  }));

  const doorCatalog = sheetRows(s('Dynamic Doors')).slice(2).map((row) => ({
    doorSize: text(row[1]),
    modelA: text(row[2]),
    withChainA: number(row[3]),
    noChainA: number(row[4]),
    leadTimeA: text(row[5]),
    modelB: text(row[6]),
    withChainB: number(row[7]),
    noChainB: number(row[8]),
    leadTimeB: text(row[9])
  })).filter((item) => item.doorSize);

  const sheets = wb.SheetNames.map((name) => {
    const rows = sheetRows(s(name));
    return {
      name,
      rowCount: rows.length,
      columnCount: rows.reduce((max, row) => Math.max(max, row.length), 0),
      previewRows: rows.slice(0, 8)
    };
  });

  const totals = {
    buildingCost: number(cell(estimate, 'I6')),
    alternateCost: number(cell(estimate, 'I7')),
    costWithAlternates: number(cell(estimate, 'I8')),
    erectionPrice: number(cell(estimate, 'F23')),
    projectPrice: number(cell(estimate, 'F24')),
    totalWithAlternates: number(cell(estimate, 'F25')),
    grossProfit: number(cell(estimate, 'I15')),
    materialDepositTotal: number(cell(estimate, 'I24')),
    laborDepositTotal: number(cell(estimate, 'I27')),
    feSubtotal: number(cell(feQuote, 'K42')),
    feTax: number(cell(feQuote, 'K43')),
    feLabor: number(cell(feQuote, 'K44')),
    feTotal: number(cell(feQuote, 'K45')),
    feTotalWithAlternates: number(cell(feQuote, 'K46')),
    eoMaterialSubtotal: number(cell(eoQuote, 'K25')),
    eoTax: number(cell(eoQuote, 'K26')),
    eoLabor: number(cell(eoQuote, 'K27')),
    eoTotal: number(cell(eoQuote, 'K28'))
  };

  const automations = [
    { key: 'workbook_imported', label: 'Workbook uploaded and parsed', status: 'ready', source: originalName },
    { key: 'project_info_to_estimate', label: 'Project Info populates estimate header and customer fields', status: 'mapped' },
    { key: 'estimate_to_fe_quote', label: 'Estimate Sheet pushes totals into F&E Quotation', status: 'mapped' },
    { key: 'estimate_to_eo_quote', label: 'Estimate Sheet pushes erection-only totals into EO Quotation', status: 'mapped' },
    { key: 'estimate_to_checklist', label: 'Estimate creates project checklist scope items', status: 'mapped' },
    { key: 'deposit_to_sov_invoice', label: 'Deposit schedule creates SOV and invoice draw workflow', status: 'mapped' },
    { key: 'change_order_rollup', label: 'CO1-CO10 roll up to CO Totals and draw billing', status: 'mapped' },
    { key: 'handoff', label: 'Approved quote can hand off to Projects, Accounting, and Purchasing', status: 'next' }
  ];

  return {
    originalName,
    sheetCount: wb.SheetNames.length,
    project: {
      estimateNumber: text(cell(estimate, 'F7')),
      projectName: text(cell(estimate, 'C5')) || text(cell(projectInfo, 'F7')) || originalName.replace(/\.[^.]+$/, ''),
      estimatorName: text(cell(estimate, 'C6')),
      quotePo: text(cell(estimate, 'F7')),
      squareFeet: number(cell(estimate, 'F5')),
      localTaxRate: number(cell(estimate, 'C7')) || 0.075,
      customerCompany: text(cell(projectInfo, 'G12')),
      customerContact: text(cell(projectInfo, 'E14')),
      customerPhone: text(cell(projectInfo, 'K14')),
      customerEmail: text(cell(projectInfo, 'E19')),
      projectAddress: text(cell(projectInfo, 'E9')),
      cityStateZip: text(cell(projectInfo, 'E10')),
      billingAddress: text(cell(projectInfo, 'E16')),
      accountsPayable: text(cell(projectInfo, 'J24')),
      accountsPayableEmail: text(cell(projectInfo, 'J25'))
    },
    totals,
    baseCostRows,
    alternateRows,
    depositRows,
    quotationVersions: [
      { quoteType: 'furnish_and_erect', salesperson: text(cell(feQuote, 'D16')), paymentTerms: text(cell(feQuote, 'H16')), notes: text(cell(feQuote, 'J16')), subtotal: totals.feSubtotal, tax: totals.feTax, laborTotal: totals.feLabor, total: totals.feTotal, lines: quoteLines('F&E Quotation', 24, 46) },
      { quoteType: 'erection_only', salesperson: text(cell(eoQuote, 'D16')), paymentTerms: text(cell(eoQuote, 'H16')), notes: text(cell(eoQuote, 'J16')), subtotal: totals.eoMaterialSubtotal, tax: totals.eoTax, laborTotal: totals.eoLabor, total: totals.eoTotal, lines: quoteLines('EO Quotation', 18, 28) }
    ],
    projectChecklistRows,
    invoiceRows,
    sovRows,
    changeOrderRows,
    doorCatalog,
    sheets,
    automations
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
    create table if not exists quote_workbook_automations (
      id bigserial primary key,
      workbook_id bigint references quote_workbooks(id) on delete cascade,
      automation_key text not null,
      label text not null,
      status text not null default 'mapped',
      metadata jsonb,
      created_at timestamptz not null default now()
    );
  `);
}

async function insertQuotation(db, estimateId, quotationData, summary) {
  const quoteResult = await db.query(
    `insert into quotation_versions (estimate_id, quote_type, status, salesperson, payment_terms, notes, subtotal, tax, labor_total, total, raw)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     returning id, quote_type, subtotal, tax, labor_total, total`,
    [estimateId, quotationData.quoteType, 'draft', quotationData.salesperson, quotationData.paymentTerms, quotationData.notes, quotationData.subtotal, quotationData.tax, quotationData.laborTotal, quotationData.total, summary]
  );
  const quote = quoteResult.rows[0];
  for (const line of quotationData.lines) {
    await db.query(
      `insert into quotation_lines (quotation_id, qty, description, unit_price, line_total, sort_order, raw)
       values ($1, $2, $3, $4, $5, $6, $7)`,
      [quote.id, line.qty, line.description || 'Quoted line', line.unitPrice, line.lineTotal, line.sortOrder, line.raw]
    );
  }
  return quote;
}

export async function importQuoteWorkbook(db, file, actor = 'estimating') {
  if (!file?.buffer?.length) {
    const error = new Error('No workbook file was uploaded.');
    error.statusCode = 400;
    throw error;
  }

  const summary = readWorkbook(file.buffer, file.originalname);
  const p = summary.project;

  const estimateResult = await db.query(
    `insert into estimates (
       estimate_number, project_name, estimator_name, customer_company, customer_contact,
       customer_email, customer_phone, project_address, city_state_zip, local_tax_rate,
       square_feet, status, quote_po, payment_terms, scope_notes, source_workbook, raw
     ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
     returning id, estimate_number, project_name, status`,
    [p.estimateNumber, p.projectName, p.estimatorName || actor, p.customerCompany, p.customerContact, p.customerEmail, p.customerPhone, p.projectAddress, p.cityStateZip, p.localTaxRate, p.squareFeet, 'draft', p.quotePo, summary.quotationVersions[0]?.paymentTerms || null, summary.quotationVersions[0]?.notes || null, file.originalname, summary]
  );
  const estimate = estimateResult.rows[0];

  for (const line of [...summary.baseCostRows, ...summary.alternateRows]) {
    await db.query(
      `insert into estimate_cost_lines (estimate_id, section, line_type, description, cost, markup_rate, tax_rate, labor_amount, sort_order, is_optional, raw)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [estimate.id, line.section, line.lineType || line.description, line.description, line.cost, line.markupRate || 0, line.taxRate || 0, line.laborAmount || 0, line.sortOrder, Boolean(line.isOptional), line]
    );
  }

  for (const deposit of summary.depositRows) {
    await db.query(
      `insert into estimate_deposit_schedule (estimate_id, deposit_type, label, percentage, amount, sort_order)
       values ($1, $2, $3, $4, $5, $6)`,
      [estimate.id, deposit.depositType, deposit.label, deposit.percentage, deposit.amount, deposit.sortOrder]
    );
  }

  const quotations = [];
  for (const quoteData of summary.quotationVersions) {
    quotations.push(await insertQuotation(db, estimate.id, quoteData, summary));
  }

  for (const item of summary.projectChecklistRows) {
    await db.query(
      `insert into project_checklist_items (estimate_id, item_name, scope_status, provider, released_status, quantity, sort_order, raw)
       values ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [estimate.id, item.itemName, item.scopeStatus, item.provider, item.releasedStatus, item.quantity, item.sortOrder, item]
    );
  }

  for (const invoice of summary.invoiceRows) {
    await db.query(
      `insert into invoices (estimate_id, invoice_name, invoice_number, invoice_type, payment_terms, status, subtotal, tax, total, raw)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [estimate.id, invoice.invoiceName, invoice.invoiceNumber, invoice.invoiceType, invoice.invoiceType, 'draft', invoice.subtotal, invoice.tax, invoice.total, invoice.raw]
    );
  }

  for (const sov of summary.sovRows) {
    await db.query(
      `insert into schedule_of_values (estimate_id, sov_type, draw_number, line_number, description, scheduled_value, previous_billed, this_period, balance_to_finish, retainage, raw)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [estimate.id, sov.sovType, sov.drawNumber, sov.lineNumber, sov.description || sov.sovType, sov.scheduledValue, sov.previousBilled, sov.thisPeriod, sov.balanceToFinish, sov.retainage, sov.raw]
    );
  }

  for (const co of summary.changeOrderRows) {
    await db.query(
      `insert into change_orders (estimate_id, co_number, description, date_sent, amount_charged, result, date_returned, issued_number, authorized_amount, billed_on_draw, raw)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [estimate.id, co.coNumber, co.description, co.dateSent || null, co.amountCharged, co.result, co.dateReturned || null, co.issuedNumber, co.authorizedAmount, co.billedOnDraw, co.raw]
    );
  }

  const workbookResult = await db.query(
    `insert into quote_workbooks (original_filename, file_size, sheet_count, detected_total, estimate_id, status, summary)
     values ($1, $2, $3, $4, $5, $6, $7)
     returning id, original_filename, sheet_count, detected_total, status, estimate_id, created_at`,
    [file.originalname, file.size || file.buffer.length, summary.sheetCount, summary.totals.totalWithAlternates || summary.totals.feTotal || summary.totals.eoTotal, estimate.id, 'parsed', summary]
  );
  const workbook = workbookResult.rows[0];

  for (const sheet of summary.sheets) {
    await db.query(
      `insert into quote_workbook_sheets (workbook_id, sheet_name, row_count, column_count, preview_rows)
       values ($1, $2, $3, $4, $5)`,
      [workbook.id, sheet.name, sheet.rowCount, sheet.columnCount, sheet.previewRows]
    );
  }

  for (const automation of summary.automations) {
    await db.query(
      `insert into quote_workbook_automations (workbook_id, automation_key, label, status, metadata)
       values ($1, $2, $3, $4, $5)`,
      [workbook.id, automation.key, automation.label, automation.status, automation]
    );
  }

  await db.query(
    `insert into portal_activity_logs (actor, action, entity_type, entity_id, metadata)
     values ($1, $2, $3, $4, $5)`,
    [actor, 'quote_workbook_imported_without_monday', 'quote_workbook', String(workbook.id), { estimateId: estimate.id, filename: file.originalname, sheetCount: summary.sheetCount }]
  );

  return {
    workbook,
    estimate,
    quotations,
    summary: {
      project: summary.project,
      totals: summary.totals,
      sheetCount: summary.sheetCount,
      sheets: summary.sheets.map((sheet) => ({ name: sheet.name, rowCount: sheet.rowCount, columnCount: sheet.columnCount })),
      baseCostCount: summary.baseCostRows.length,
      alternateCount: summary.alternateRows.length,
      depositCount: summary.depositRows.length,
      quotationCount: quotations.length,
      invoiceCount: summary.invoiceRows.length,
      sovLineCount: summary.sovRows.length,
      changeOrderCount: summary.changeOrderRows.length,
      automationCount: summary.automations.length,
      automations: summary.automations
    }
  };
}
