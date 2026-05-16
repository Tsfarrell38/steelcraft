import { createAccountingInvoice, getAccountingSummary, listAccountingTables, seedAccountingDefaults } from './accountingSchema.js';

export function registerAccountingRoutes(app, requireDatabase, ensureSchema) {
  app.post('/api/accounting/setup', async (req, res, next) => {
    try {
      await ensureSchema();
      const db = requireDatabase();
      await seedAccountingDefaults(db);
      const tables = await listAccountingTables(db);
      await db.query(
        `insert into portal_activity_logs (actor, action, entity_type, metadata)
         values ($1, $2, $3, $4)`,
        [req.body?.actor || 'system', 'accounting_schema_initialized', 'accounting', { tables }]
      );
      res.json({ ok: true, message: 'Accounting portal schema initialized with standard chart of accounts.', tables });
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/accounting/status', async (req, res, next) => {
    try {
      await ensureSchema();
      const db = requireDatabase();
      await seedAccountingDefaults(db);
      const tables = await listAccountingTables(db);
      const summary = await getAccountingSummary(db);
      res.json({ ok: true, tables, summary });
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/accounting/accounts', async (req, res, next) => {
    try {
      await ensureSchema();
      const db = requireDatabase();
      await seedAccountingDefaults(db);
      const result = await db.query(
        `select id, account_code, account_name, account_type, normal_balance, is_active
         from accounting_accounts
         order by account_code`
      );
      res.json({ ok: true, accounts: result.rows });
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/accounting/invoices', async (req, res, next) => {
    try {
      await ensureSchema();
      const db = requireDatabase();
      await seedAccountingDefaults(db);
      const result = await db.query(
        `select ai.*, ac.customer_name, p.name as project_name
         from accounting_invoices ai
         left join accounting_customers ac on ac.id = ai.customer_id
         left join projects p on p.id = ai.project_id
         order by ai.created_at desc
         limit 100`
      );
      res.json({ ok: true, invoices: result.rows });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/accounting/invoices', async (req, res, next) => {
    try {
      await ensureSchema();
      const db = requireDatabase();
      await seedAccountingDefaults(db);
      const invoice = await createAccountingInvoice(db, req.body || {});
      await db.query(
        `insert into portal_activity_logs (actor, action, entity_type, entity_id, metadata)
         values ($1, $2, $3, $4, $5)`,
        [req.body?.actor || 'accounting', 'accounting_invoice_created', 'accounting_invoice', String(invoice.id), invoice]
      );
      res.json({ ok: true, invoice });
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/accounting/bills', async (req, res, next) => {
    try {
      await ensureSchema();
      const db = requireDatabase();
      await seedAccountingDefaults(db);
      const result = await db.query(
        `select ab.*, av.vendor_name, p.name as project_name
         from accounting_bills ab
         left join accounting_vendors av on av.id = ab.vendor_id
         left join projects p on p.id = ab.project_id
         order by ab.created_at desc
         limit 100`
      );
      res.json({ ok: true, bills: result.rows });
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/accounting/payments', async (req, res, next) => {
    try {
      await ensureSchema();
      const db = requireDatabase();
      await seedAccountingDefaults(db);
      const result = await db.query(
        `select * from accounting_payments
         order by payment_date desc, id desc
         limit 100`
      );
      res.json({ ok: true, payments: result.rows });
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/accounting/journal', async (req, res, next) => {
    try {
      await ensureSchema();
      const db = requireDatabase();
      await seedAccountingDefaults(db);
      const result = await db.query(
        `select aje.*, coalesce(sum(ajl.debit),0)::numeric(14,2) as debit_total,
                coalesce(sum(ajl.credit),0)::numeric(14,2) as credit_total
         from accounting_journal_entries aje
         left join accounting_journal_lines ajl on ajl.journal_entry_id = aje.id
         group by aje.id
         order by aje.entry_date desc, aje.id desc
         limit 100`
      );
      res.json({ ok: true, journalEntries: result.rows });
    } catch (error) {
      next(error);
    }
  });
}
