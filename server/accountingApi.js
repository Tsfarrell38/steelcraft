import { createAccountingInvoice, getAccountingSummary, listAccountingTables, seedAccountingDefaults } from './accountingSchema.js';
import { appendLedgerEvent, getDagEventId, getLedgerProofFields } from './neroaLedgerClient.js';
import { attachDagEvent, ensureAccountingDagSchema } from './accountingDagSchema.js';
import { ensureAccountingInfrastructure, getAccountingInfrastructureStatus, recordAccountingModuleCheck, enqueueAccountingEvent } from './accountingInfrastructure.js';

async function ensureAccountingReady(db) {
  await seedAccountingDefaults(db);
  await ensureAccountingDagSchema(db);
  await ensureAccountingInfrastructure(db);
}

async function updateAccountingProofFields(db, tableName, id, proof) {
  const allowed = new Set(['accounting_invoices', 'accounting_bills', 'accounting_payments', 'accounting_journal_entries', 'accounting_customers', 'accounting_vendors']);
  if (!allowed.has(tableName)) throw new Error(`Invalid proof table: ${tableName}`);
  await db.query(
    `update ${tableName}
     set source_repo = $1,
         source_commit_sha = $2,
         source_packet_id = $3,
         source_runner_id = $4,
         updated_at = now()
     where id = $5`,
    [proof.sourceRepo || null, proof.sourceCommitSha || null, proof.sourcePacketId || null, proof.sourceRunnerId || null, id]
  );
}

export function registerAccountingRoutes(app, requireDatabase, ensureSchema) {
  app.post('/api/accounting/setup', async (req, res, next) => {
    try {
      await ensureSchema();
      const db = requireDatabase();
      await ensureAccountingReady(db);
      const tables = await listAccountingTables(db);
      const infrastructure = await getAccountingInfrastructureStatus(db);
      await db.query(
        `insert into portal_activity_logs (actor, action, entity_type, metadata)
         values ($1, $2, $3, $4)`,
        [req.body?.actor || 'system', 'accounting_schema_initialized', 'accounting', { tables, dagLinked: true, infrastructure }]
      );
      res.json({ ok: true, message: 'Accounting portal schema initialized with tenant-ready infrastructure and DAG proof linkage.', tables, infrastructure });
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/accounting/status', async (req, res, next) => {
    try {
      await ensureSchema();
      const db = requireDatabase();
      await ensureAccountingReady(db);
      const tables = await listAccountingTables(db);
      const summary = await getAccountingSummary(db);
      const infrastructure = await getAccountingInfrastructureStatus(db);
      res.json({ ok: true, tables, summary, infrastructure, ledger: { configured: Boolean(process.env.NEROA_LEDGER_URL && process.env.NEROA_LEDGER_API_KEY) } });
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/accounting/infrastructure/status', async (req, res, next) => {
    try {
      await ensureSchema();
      const db = requireDatabase();
      await ensureAccountingReady(db);
      const infrastructure = await getAccountingInfrastructureStatus(db);
      res.json({ ok: true, infrastructure });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/accounting/infrastructure/checks', async (req, res, next) => {
    try {
      await ensureSchema();
      const db = requireDatabase();
      await ensureAccountingReady(db);
      const check = await recordAccountingModuleCheck(
        db,
        req.body?.checkKey || 'manual.infrastructure.review',
        req.body?.checkStatus || 'passed',
        req.body?.detail || 'Accounting infrastructure reviewed.',
        req.body?.metadata || {}
      );
      res.json({ ok: true, check });
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/accounting/accounts', async (req, res, next) => {
    try {
      await ensureSchema();
      const db = requireDatabase();
      await ensureAccountingReady(db);
      const result = await db.query(
        `select id, tenant_id, account_code, account_name, account_type, normal_balance, is_active, dag_event_id, source_repo, source_commit_sha, source_packet_id, source_runner_id
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
      await ensureAccountingReady(db);
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
      await ensureAccountingReady(db);
      const proof = getLedgerProofFields(req.body || {});
      const invoice = await createAccountingInvoice(db, { ...(req.body || {}), ...proof });
      await updateAccountingProofFields(db, 'accounting_invoices', invoice.id, proof);
      const ledgerEvent = await appendLedgerEvent({
        type: 'accounting.invoice.created',
        actor: req.body?.actor || 'system',
        projectId: invoice.project_id ? String(invoice.project_id) : undefined,
        parentEventIds: req.body?.parentEventIds || [],
        payload: {
          invoiceId: String(invoice.id),
          invoiceNumber: invoice.invoice_number,
          customerId: invoice.customer_id ? String(invoice.customer_id) : null,
          amount: Number(invoice.total || 0),
          currency: invoice.currency || req.body?.currency || 'USD',
          sourceRepo: proof.sourceRepo,
          sourceCommitSha: proof.sourceCommitSha,
          sourcePacketId: proof.sourcePacketId,
          sourceRunnerId: proof.sourceRunnerId
        }
      });
      const dagEventId = getDagEventId(ledgerEvent);
      const linkedInvoice = await attachDagEvent(db, 'accounting_invoices', invoice.id, dagEventId) || invoice;
      await enqueueAccountingEvent(db, {
        eventType: 'accounting.invoice.created',
        entityType: 'accounting_invoice',
        entityId: String(invoice.id),
        payload: { invoice: linkedInvoice, proof },
        dagEventId,
        status: dagEventId ? 'processed' : 'pending'
      });
      await db.query(
        `insert into portal_activity_logs (actor, action, entity_type, entity_id, metadata)
         values ($1, $2, $3, $4, $5)`,
        [req.body?.actor || 'accounting', 'accounting_invoice_created', 'accounting_invoice', String(invoice.id), { invoice: linkedInvoice, ledgerEvent }]
      );
      res.json({ ok: true, invoice: linkedInvoice, ledgerEvent });
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/accounting/bills', async (req, res, next) => {
    try {
      await ensureSchema();
      const db = requireDatabase();
      await ensureAccountingReady(db);
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
      await ensureAccountingReady(db);
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
      await ensureAccountingReady(db);
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
