import React, { useEffect, useMemo, useState } from 'react';

const fallbackSummary = {
  ar_open: '0.00', ap_open: '0.00', cash_received_mtd: '0.00', cash_paid_mtd: '0.00', open_invoice_count: 0, open_bill_count: 0, active_account_count: 0
};

const accountingSections = [
  ['dashboard', 'Dashboard', 'Accounting control center'],
  ['ar', 'AR / Customer Billing', 'Receivables, invoices, aging, collections'],
  ['invoices', 'Invoices', 'Customer invoice list and invoice creation'],
  ['ap', 'AP / Vendor Bills', 'Bills, approvals, vendor balances'],
  ['bills', 'Bills', 'Vendor bill list and bill entry'],
  ['payments', 'Payments', 'Customer receipts and vendor payments'],
  ['checks', 'Checks', 'Check writing and printed check history'],
  ['project-financials', 'Project Financials', 'Job cost, billing, retainage, change orders'],
  ['general-ledger', 'General Ledger', 'Journal entries and accounting periods'],
  ['chart-of-accounts', 'Chart of Accounts', 'Ledger accounts and coding'],
  ['reports', 'Reports', 'AR/AP aging, GL, cash, project financials'],
  ['settings', 'Settings', 'Terms, numbering, periods, infrastructure']
];

const defaultSection = 'ar';
const validSections = new Set(accountingSections.map(([id]) => id));
function sectionFromPath() {
  const match = window.location.pathname.replace(/\/$/, '').match(/^\/portal\/accounting\/?([^/]*)/);
  const section = match?.[1] || defaultSection;
  return validSections.has(section) ? section : defaultSection;
}
function accountingUrl(section) { return `/portal/accounting/${section}`; }
function money(value) { return Number(value || 0).toLocaleString(undefined, { style: 'currency', currency: 'USD' }); }
function sectionMeta(section) { return accountingSections.find(([id]) => id === section) || accountingSections[1]; }

function StatCard({ label, value, detail }) { return <article className="accounting-stat panel"><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>; }
function WorkflowCard({ title, steps }) { return <article className="feature panel accounting-workflow-card"><h2>{title}</h2><div className="accounting-steps">{steps.map((step, index) => <div className="accounting-step" key={step}><b>{index + 1}</b><span>{step}</span></div>)}</div></article>; }
function TableCard({ title, rows, emptyLabel }) { return <article className="feature panel accounting-table-card"><h2>{title}</h2>{rows.length ? <div className="accounting-table">{rows.map((row) => <div className="accounting-table-row" key={row.id || row.invoice_number || row.bill_number || row.entry_number || row.check_number}><strong>{row.invoice_number || row.bill_number || row.entry_number || row.account_code || row.check_number || `#${row.id}`}</strong><span>{row.customer_name || row.vendor_name || row.payee_name || row.account_name || row.description || row.status}</span><b>{row.total ? money(row.total) : row.amount ? money(row.amount) : row.balance_due ? money(row.balance_due) : row.account_type || row.status}</b></div>)}</div> : <div className="accounting-empty">{emptyLabel}</div>}</article>; }

function AccountingNav({ activeSection, openSection }) {
  return <nav className="accounting-section-nav panel accounting-compact-nav">
    <div className="accounting-room-title"><span>Portal / Accounting /</span><strong>{sectionMeta(activeSection)[1]}</strong><small>{accountingUrl(activeSection)}</small></div>
    <div className="accounting-nav-row">
      <label><span>Accounting room</span><select value={activeSection} onChange={(event) => openSection(event.target.value)}>{accountingSections.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
      <div className="accounting-header-actions compact"><button onClick={() => openSection('invoices')}>New invoice</button><button onClick={() => openSection('bills')}>Enter bill</button><button onClick={() => openSection('payments')}>Record payment</button></div>
    </div>
    <div className="accounting-tabs">{accountingSections.slice(0, 10).map(([id, label]) => <button key={id} className={activeSection === id ? 'active' : ''} onClick={() => openSection(id)}>{label}</button>)}</div>
  </nav>;
}

function DashboardView({ summary, invoices, bills, accounts, openSection }) { return <>
  <section className="accounting-stat-grid">
    <StatCard label="Open AR" value={money(summary.ar_open)} detail={`${summary.open_invoice_count || 0} open invoices`} />
    <StatCard label="Open AP" value={money(summary.ap_open)} detail={`${summary.open_bill_count || 0} open bills`} />
    <StatCard label="Cash received MTD" value={money(summary.cash_received_mtd)} detail="Customer payments this month" />
    <StatCard label="Cash paid MTD" value={money(summary.cash_paid_mtd)} detail="Vendor payments this month" />
  </section>
  <section className="accounting-workspace-grid">
    <button className="feature panel accounting-workflow-card" onClick={() => openSection('ar')}><h2>AR / Customer Billing</h2><p>Open receivables, invoices, payment collection, aging, and customer balances.</p></button>
    <button className="feature panel accounting-workflow-card" onClick={() => openSection('ap')}><h2>AP / Vendor Bills</h2><p>Vendor bills, approvals, bill payment, and AP aging.</p></button>
    <button className="feature panel accounting-workflow-card" onClick={() => openSection('general-ledger')}><h2>General Ledger</h2><p>Journal entries, chart activity, debit/credit balance, and period close.</p></button>
    <button className="feature panel accounting-workflow-card" onClick={() => openSection('project-financials')}><h2>Project Financials</h2><p>Project billing, job cost, retainage, change orders, and margin control.</p></button>
  </section>
  <section className="accounting-data-grid"><TableCard title="Recent invoices" rows={invoices} emptyLabel="No invoices yet." /><TableCard title="Recent bills" rows={bills} emptyLabel="No bills yet." /><TableCard title="Chart of accounts" rows={accounts.slice(0, 12)} emptyLabel="Chart of accounts will seed from /api/accounting/status." /></section>
</>; }

function SectionView({ activeSection, summary, invoices, bills, checks, accounts, journalEntries, status, openSection }) {
  if (activeSection === 'dashboard') return <DashboardView summary={summary} invoices={invoices} bills={bills} accounts={accounts} openSection={openSection} />;
  if (activeSection === 'ar') return <section className="accounting-focus-grid"><WorkflowCard title="AR / Customer Billing" steps={['Create invoices from project, SOV, estimate, subscription, or change order.', 'Track open receivables, due dates, retainage, and customer balances.', 'Record customer payments and apply them to invoices.', 'Run AR aging and escalate overdue accounts.']} /><TableCard title="Open customer invoices" rows={invoices} emptyLabel="No AR invoices yet." /><article className="feature panel"><h2>AR actions</h2><div className="accounting-actions-list"><button onClick={() => openSection('invoices')}>New invoice</button><button onClick={() => openSection('payments')}>Record customer payment</button><button onClick={() => openSection('reports')}>Run AR aging</button><button>Send statement</button></div></article></section>;
  if (activeSection === 'invoices') return <section className="accounting-focus-grid"><article className="feature panel"><h2>New invoice</h2><p>This is now its own accounting room at /portal/accounting/invoices. Next build wires the form submit to POST /api/accounting/invoices.</p><div className="accounting-actions-list"><button>Draft invoice</button><button>Save and send</button><button onClick={() => openSection('payments')}>Record payment</button></div></article><TableCard title="Customer invoices" rows={invoices} emptyLabel="No invoices yet." /></section>;
  if (activeSection === 'ap') return <section className="accounting-focus-grid"><WorkflowCard title="AP / Vendor Bills" steps={['Enter vendor bill or pull it from PO/receiving.', 'Code bill to project, material, labor, subcontractor, equipment, or overhead.', 'Approve bill for payment.', 'Pay vendor and keep AP aging current.']} /><TableCard title="Open vendor bills" rows={bills} emptyLabel="No AP bills yet." /><article className="feature panel"><h2>AP actions</h2><div className="accounting-actions-list"><button onClick={() => openSection('bills')}>Enter bill</button><button>Approve bill</button><button onClick={() => openSection('checks')}>Write check</button><button onClick={() => openSection('payments')}>Record vendor payment</button></div></article></section>;
  if (activeSection === 'bills') return <section className="accounting-focus-grid"><article className="feature panel"><h2>Enter bill</h2><p>This is now its own accounting room at /portal/accounting/bills. Next build wires the form submit to POST /api/accounting/bills.</p><div className="accounting-actions-list"><button>Save bill</button><button>Save and approve</button><button onClick={() => openSection('checks')}>Write check</button></div></article><TableCard title="Vendor bills" rows={bills} emptyLabel="No bills yet." /></section>;
  if (activeSection === 'payments') return <section className="accounting-focus-grid"><WorkflowCard title="Payments" steps={['Record customer receipts.', 'Apply payments to invoices.', 'Record vendor payments against bills.', 'Keep cash activity tied to AR/AP and the general ledger.']} /><article className="feature panel"><h2>Record payment</h2><div className="accounting-actions-list"><button>Customer payment</button><button>Vendor payment</button><button onClick={() => openSection('checks')}>Write check</button></div><div className="accounting-stat-grid mini"><StatCard label="Received MTD" value={money(summary.cash_received_mtd)} detail="Customer receipts" /><StatCard label="Paid MTD" value={money(summary.cash_paid_mtd)} detail="Vendor payments" /></div></article></section>;
  if (activeSection === 'checks') return <section className="accounting-focus-grid"><article className="feature panel"><h2>Write check</h2><p>Check writing has its own room at /portal/accounting/checks and is backed by /api/accounting/checks.</p><div className="accounting-actions-list"><button>Draft check</button><button>Print check</button><button>Mark printed</button></div></article><TableCard title="Checks" rows={checks} emptyLabel="No checks written yet." /></section>;
  if (activeSection === 'project-financials') return <section className="accounting-focus-grid"><WorkflowCard title="Project Financials" steps={['Tie estimates, invoices, bills, purchase orders, payments, and change orders to the project.', 'Track billed vs collected vs cost to date.', 'Track retainage, deposits, insurance, and change order exposure.', 'Prepare project financial status for admin/owner review.']} /><article className="feature panel"><h2>Project financial controls</h2><p>Project financial summary will show contract value, approved changes, billed-to-date, paid-to-date, open AR, open AP, and job cost.</p></article></section>;
  if (activeSection === 'general-ledger') return <section className="accounting-focus-grid"><WorkflowCard title="General Ledger" steps={['Post journal entries from accounting actions.', 'Validate debit and credit balance.', 'Track source repo, source commit, packet, runner, and DAG event linkage.', 'Close periods after review.']} /><TableCard title="Journal entries" rows={journalEntries} emptyLabel="No journal entries yet." /><article className="feature panel"><h2>GL actions</h2><div className="accounting-actions-list"><button>New journal entry</button><button>Review trial balance</button><button>Close period</button></div></article></section>;
  if (activeSection === 'chart-of-accounts') return <section className="accounting-focus-grid"><TableCard title="Chart of accounts" rows={accounts} emptyLabel="No ledger accounts found." /><article className="feature panel"><h2>Chart controls</h2><p>Add/edit ledger account, account type, normal balance, active/inactive, and tenant-specific account mapping.</p></article></section>;
  if (activeSection === 'reports') return <section className="accounting-focus-grid"><WorkflowCard title="Accounting Reports" steps={['AR aging.', 'AP aging.', 'Cash activity.', 'General ledger detail.', 'Project financial summary.', 'Period close package.']} /></section>;
  return <section className="accounting-focus-grid"><article className="feature panel"><h2>Accounting Settings</h2><p>Module status, tenant accounting settings, numbering, DAG linkage, and extraction readiness.</p><pre className="accounting-json-preview">{JSON.stringify(status.infrastructure || {}, null, 2)}</pre></article></section>;
}

export default function AccountingPortal() {
  const [status, setStatus] = useState({ summary: fallbackSummary, tables: [], ok: false });
  const [accounts, setAccounts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [bills, setBills] = useState([]);
  const [checks, setChecks] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState(sectionFromPath);

  function openSection(section) {
    const safe = validSections.has(section) ? section : defaultSection;
    history.pushState({}, '', accountingUrl(safe));
    setActiveSection(safe);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }

  useEffect(() => {
    const sync = () => setActiveSection(sectionFromPath());
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const [statusRes, accountRes, invoiceRes, billRes, checkRes, journalRes] = await Promise.all([
          fetch('/api/accounting/status'), fetch('/api/accounting/accounts'), fetch('/api/accounting/invoices'), fetch('/api/accounting/bills'), fetch('/api/accounting/checks'), fetch('/api/accounting/journal')
        ]);
        const [statusJson, accountJson, invoiceJson, billJson, checkJson, journalJson] = await Promise.all([statusRes.json(), accountRes.json(), invoiceRes.json(), billRes.json(), checkRes.json(), journalRes.json()]);
        if (!alive) return;
        setStatus(statusJson.ok ? statusJson : { summary: fallbackSummary, tables: [], ok: false });
        setAccounts(accountJson.accounts || []); setInvoices(invoiceJson.invoices || []); setBills(billJson.bills || []); setChecks(checkJson.checks || []); setJournalEntries(journalJson.journalEntries || []);
      } catch (err) { if (alive) setError(err.message || 'Accounting data could not be loaded.'); }
    }
    load();
    return () => { alive = false; };
  }, []);

  const summary = status.summary || fallbackSummary;
  const activeMeta = useMemo(() => sectionMeta(activeSection), [activeSection]);

  return <>
    <AccountingNav activeSection={activeSection} openSection={openSection} />
    <header className="workspace-header panel accounting-subroom-header"><div><p className="eyebrow">Accounting room</p><h1>{activeMeta[1]}</h1><p>{activeMeta[2]}</p></div><div className="live-badge">{accountingUrl(activeSection)}</div></header>
    {error && <div className="notice">{error}</div>}
    <SectionView activeSection={activeSection} summary={summary} invoices={invoices} bills={bills} checks={checks} accounts={accounts} journalEntries={journalEntries} status={status} openSection={openSection} />
  </>;
}
