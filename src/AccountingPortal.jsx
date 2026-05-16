import React, { useEffect, useMemo, useState } from 'react';

const fallbackSummary = {
  ar_open: '0.00',
  ap_open: '0.00',
  cash_received_mtd: '0.00',
  cash_paid_mtd: '0.00',
  open_invoice_count: 0,
  open_bill_count: 0,
  active_account_count: 0
};

const accountingSections = [
  ['dashboard', 'Dashboard', 'Accounting control center'],
  ['ar', 'AR / Customer Billing', 'Receivables, invoices, aging, collections'],
  ['ap', 'AP / Vendor Bills', 'Bills, approvals, vendor balances'],
  ['payments', 'Payments', 'Customer receipts and vendor payments'],
  ['project-financials', 'Project Financials', 'Job cost, billing, retainage, change orders'],
  ['general-ledger', 'General Ledger', 'Journal entries and accounting periods'],
  ['chart-of-accounts', 'Chart of Accounts', 'Ledger accounts and coding'],
  ['reports', 'Reports', 'AR/AP aging, GL, cash, project financials'],
  ['settings', 'Settings', 'Terms, numbering, periods, infrastructure']
];

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

function AccountingNav({ activeSection, setActiveSection }) {
  return <nav className="accounting-section-nav panel accounting-compact-nav">
    <div className="accounting-nav-row">
      <label>
        <span>Accounting area</span>
        <select value={activeSection} onChange={(event) => setActiveSection(event.target.value)}>
          {accountingSections.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
        </select>
      </label>
      <div className="accounting-header-actions compact"><button>New invoice</button><button>Enter bill</button><button>Record payment</button></div>
    </div>
    <div className="accounting-tabs">
      {accountingSections.slice(0, 7).map(([id, label]) => <button key={id} className={activeSection === id ? 'active' : ''} onClick={() => setActiveSection(id)}>{label}</button>)}
    </div>
  </nav>;
}

function DashboardView({ summary, invoices, bills, accounts }) {
  return <>
    <section className="accounting-stat-grid">
      <StatCard label="Open AR" value={money(summary.ar_open)} detail={`${summary.open_invoice_count || 0} open invoices`} />
      <StatCard label="Open AP" value={money(summary.ap_open)} detail={`${summary.open_bill_count || 0} open bills`} />
      <StatCard label="Cash received MTD" value={money(summary.cash_received_mtd)} detail="Customer payments this month" />
      <StatCard label="Cash paid MTD" value={money(summary.cash_paid_mtd)} detail="Vendor payments this month" />
    </section>
    <section className="accounting-workspace-grid">
      <WorkflowCard title="AR / Customer Billing" steps={['Create customer invoice from project, SOV, estimate, or change order.', 'Review retainage, tax, terms, due date, and billing status.', 'Send invoice, record payment, and update balance due.', 'Track aging and escalate overdue accounts.']} />
      <WorkflowCard title="AP / Vendor Bills" steps={['Enter vendor bill or match against purchase order.', 'Code cost to project, material, labor, subcontractor, equipment, or overhead.', 'Approve bill for payment.', 'Record payment and keep AP aging current.']} />
      <WorkflowCard title="General Ledger" steps={['Maintain chart of accounts.', 'Post journal entries from invoices, bills, payments, and adjustments.', 'Review debit and credit balance.', 'Close accounting periods after reconciliation.']} />
      <WorkflowCard title="Project Financials" steps={['Tie estimates, invoices, bills, POs, change orders, and payments back to projects.', 'Track job cost and billing status.', 'Monitor retainage and insurance-related costs.', 'Prepare financial reports for owners/admin.']} />
    </section>
    <section className="accounting-data-grid">
      <TableCard title="Recent invoices" rows={invoices} emptyLabel="No invoices yet. Use New invoice after customer/project records are ready." />
      <TableCard title="Recent bills" rows={bills} emptyLabel="No bills yet. Enter vendor bills or connect purchasing/PO flow." />
      <TableCard title="Chart of accounts" rows={accounts.slice(0, 12)} emptyLabel="Chart of accounts will seed from /api/accounting/status." />
    </section>
  </>;
}

function SectionView({ activeSection, summary, invoices, bills, accounts, status }) {
  if (activeSection === 'dashboard') return <DashboardView summary={summary} invoices={invoices} bills={bills} accounts={accounts} />;

  if (activeSection === 'ar') return <section className="accounting-focus-grid">
    <WorkflowCard title="AR / Customer Billing" steps={['Create invoice from project, SOV, estimate, subscription, or change order.', 'Track open receivables, due dates, retainage, and customer balances.', 'Record customer payments and apply them to invoices.', 'Run AR aging and escalate overdue accounts.']} />
    <TableCard title="Open customer invoices" rows={invoices} emptyLabel="No AR invoices yet." />
    <article className="feature panel"><h2>AR controls next</h2><div className="accounting-actions-list"><button>New invoice</button><button>Record customer payment</button><button>Run AR aging</button><button>Send statement</button></div></article>
  </section>;

  if (activeSection === 'ap') return <section className="accounting-focus-grid">
    <WorkflowCard title="AP / Vendor Bills" steps={['Enter vendor bill or pull it from PO/receiving.', 'Code bill to project, material, labor, subcontractor, equipment, or overhead.', 'Approve bill for payment.', 'Pay vendor and keep AP aging current.']} />
    <TableCard title="Open vendor bills" rows={bills} emptyLabel="No AP bills yet." />
    <article className="feature panel"><h2>AP controls next</h2><div className="accounting-actions-list"><button>Enter bill</button><button>Approve bill</button><button>Record vendor payment</button><button>Run AP aging</button></div></article>
  </section>;

  if (activeSection === 'payments') return <section className="accounting-focus-grid">
    <WorkflowCard title="Payments" steps={['Record customer receipts.', 'Apply payments to invoices.', 'Record vendor payments against bills.', 'Keep cash activity tied to AR/AP and the general ledger.']} />
    <article className="feature panel"><h2>Cash movement</h2><div className="accounting-stat-grid mini"><StatCard label="Received MTD" value={money(summary.cash_received_mtd)} detail="Customer receipts" /><StatCard label="Paid MTD" value={money(summary.cash_paid_mtd)} detail="Vendor payments" /></div></article>
  </section>;

  if (activeSection === 'project-financials') return <section className="accounting-focus-grid">
    <WorkflowCard title="Project Financials" steps={['Tie estimates, invoices, bills, purchase orders, payments, and change orders to the project.', 'Track billed vs collected vs cost to date.', 'Track retainage, deposits, insurance, and change order exposure.', 'Prepare project financial status for admin/owner review.']} />
    <article className="feature panel"><h2>Project financial controls next</h2><p>Next build: project financial summary by project, including contract value, approved changes, billed-to-date, paid-to-date, open AR, open AP, and job cost.</p></article>
  </section>;

  if (activeSection === 'general-ledger') return <section className="accounting-focus-grid">
    <WorkflowCard title="General Ledger" steps={['Post journal entries from accounting actions.', 'Validate debit and credit balance.', 'Track source repo, source commit, packet, runner, and DAG event linkage.', 'Close periods after review.']} />
    <article className="feature panel"><h2>GL controls next</h2><div className="accounting-actions-list"><button>New journal entry</button><button>Review trial balance</button><button>Close period</button></div></article>
  </section>;

  if (activeSection === 'chart-of-accounts') return <section className="accounting-focus-grid">
    <TableCard title="Chart of accounts" rows={accounts} emptyLabel="No ledger accounts found." />
    <article className="feature panel"><h2>Chart controls next</h2><p>Next build: add/edit ledger account, account type, normal balance, active/inactive, and tenant-specific account mapping.</p></article>
  </section>;

  if (activeSection === 'reports') return <section className="accounting-focus-grid">
    <WorkflowCard title="Accounting Reports" steps={['AR aging.', 'AP aging.', 'Cash activity.', 'General ledger detail.', 'Project financial summary.', 'Period close package.']} />
  </section>;

  return <section className="accounting-focus-grid">
    <article className="feature panel"><h2>Accounting Settings</h2><p>Module status, tenant accounting settings, numbering, DAG linkage, and extraction readiness.</p><pre className="accounting-json-preview">{JSON.stringify(status.infrastructure || {}, null, 2)}</pre></article>
  </section>;
}

export default function AccountingPortal() {
  const [status, setStatus] = useState({ summary: fallbackSummary, tables: [], ok: false });
  const [accounts, setAccounts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [bills, setBills] = useState([]);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('ar');

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
  useMemo(() => accountingSections.find(([id]) => id === activeSection) || accountingSections[0], [activeSection]);

  return <>
    <AccountingNav activeSection={activeSection} setActiveSection={setActiveSection} />

    {error && <div className="notice">{error}</div>}

    <SectionView activeSection={activeSection} summary={summary} invoices={invoices} bills={bills} accounts={accounts} status={status} />
  </>;
}
