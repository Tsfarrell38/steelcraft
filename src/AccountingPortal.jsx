import React, { useEffect, useState } from 'react';

const fallbackSummary = {
  ar_open: '0.00',
  ap_open: '0.00',
  cash_received_mtd: '0.00',
  cash_paid_mtd: '0.00',
  open_invoice_count: 0,
  open_bill_count: 0,
  active_account_count: 0
};

function money(value) {
  const number = Number(value || 0);
  return number.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
}

function StatCard({ label, value, detail }) {
  return <article className="accounting-stat panel"><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>;
}

function WorkflowCard({ title, steps }) {
  return <article className="feature panel accounting-workflow-card"><h2>{title}</h2><div className="accounting-steps">{steps.map((step, index) => <div className="accounting-step" key={step}><b>{index + 1}</b><span>{step}</span></div>)}</div></article>;
}

function TableCard({ title, rows, emptyLabel }) {
  return <article className="feature panel accounting-table-card"><h2>{title}</h2>{rows.length ? <div className="accounting-table">{rows.map((row) => <div className="accounting-table-row" key={row.id || row.invoice_number || row.bill_number || row.entry_number}><strong>{row.invoice_number || row.bill_number || row.entry_number || row.account_code}</strong><span>{row.customer_name || row.vendor_name || row.account_name || row.description || row.status}</span><b>{row.total ? money(row.total) : row.balance_due ? money(row.balance_due) : row.account_type || row.status}</b></div>)}</div> : <div className="accounting-empty">{emptyLabel}</div>}</article>;
}

export default function AccountingPortal() {
  const [status, setStatus] = useState({ summary: fallbackSummary, tables: [], ok: false });
  const [accounts, setAccounts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [bills, setBills] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const [statusRes, accountRes, invoiceRes, billRes] = await Promise.all([
          fetch('/api/accounting/status'),
          fetch('/api/accounting/accounts'),
          fetch('/api/accounting/invoices'),
          fetch('/api/accounting/bills')
        ]);
        const [statusJson, accountJson, invoiceJson, billJson] = await Promise.all([statusRes.json(), accountRes.json(), invoiceRes.json(), billRes.json()]);
        if (!alive) return;
        setStatus(statusJson.ok ? statusJson : { summary: fallbackSummary, tables: [], ok: false });
        setAccounts(accountJson.accounts || []);
        setInvoices(invoiceJson.invoices || []);
        setBills(billJson.bills || []);
      } catch (err) {
        if (alive) setError(err.message || 'Accounting data could not be loaded.');
      }
    }
    load();
    return () => { alive = false; };
  }, []);

  const summary = status.summary || fallbackSummary;

  return <>
    <header className="workspace-header panel accounting-header">
      <div>
        <p className="eyebrow">Accounting</p>
        <h1>Accounting</h1>
        <p>Standard accounting workflow for AR, AP, billing, payments, chart of accounts, general ledger, month-end, and project financial control.</p>
      </div>
      <div className="accounting-header-actions"><button>New invoice</button><button>Enter bill</button><button>Record payment</button></div>
    </header>

    {error && <div className="notice">{error}</div>}

    <section className="accounting-stat-grid">
      <StatCard label="Open AR" value={money(summary.ar_open)} detail={`${summary.open_invoice_count || 0} open invoices`} />
      <StatCard label="Open AP" value={money(summary.ap_open)} detail={`${summary.open_bill_count || 0} open bills`} />
      <StatCard label="Cash received MTD" value={money(summary.cash_received_mtd)} detail="Customer payments this month" />
      <StatCard label="Cash paid MTD" value={money(summary.cash_paid_mtd)} detail="Vendor payments this month" />
    </section>

    <section className="accounting-workspace-grid">
      <WorkflowCard title="AR / Customer billing" steps={['Create customer invoice from project, SOV, estimate, or change order.', 'Review retainage, tax, terms, due date, and billing status.', 'Send invoice, record payment, and update balance due.', 'Track aging and escalate overdue accounts.']} />
      <WorkflowCard title="AP / Vendor bills" steps={['Enter vendor bill or match against purchase order.', 'Code cost to project, material, labor, subcontractor, equipment, or overhead.', 'Approve bill for payment.', 'Record payment and keep AP aging current.']} />
      <WorkflowCard title="General ledger" steps={['Maintain chart of accounts.', 'Post journal entries from invoices, bills, payments, and adjustments.', 'Review debit and credit balance.', 'Close accounting periods after reconciliation.']} />
      <WorkflowCard title="Project financials" steps={['Tie estimates, invoices, bills, POs, change orders, and payments back to projects.', 'Track job cost and billing status.', 'Monitor retainage and insurance-related costs.', 'Prepare financial reports for owners/admin.']} />
    </section>

    <section className="accounting-data-grid">
      <TableCard title="Recent invoices" rows={invoices} emptyLabel="No invoices yet. Use New invoice after customer/project records are ready." />
      <TableCard title="Recent bills" rows={bills} emptyLabel="No bills yet. Enter vendor bills or connect purchasing/PO flow." />
      <TableCard title="Chart of accounts" rows={accounts.slice(0, 12)} emptyLabel="Chart of accounts will seed from /api/accounting/status." />
    </section>
  </>;
}
