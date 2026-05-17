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
function today() { return new Date().toISOString().slice(0, 10); }
function dueIn(days) { const d = new Date(); d.setDate(d.getDate() + days); return d.toISOString().slice(0, 10); }
function numberOrNull(value) { const number = Number(value); return Number.isFinite(number) && value !== '' ? number : null; }

async function apiPost(url, payload) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ actor: 'accounting', ...payload })
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.ok === false) throw new Error(json.error || `Request failed: ${res.status}`);
  return json;
}

function StatCard({ label, value, detail }) {
  return <article className="accounting-stat panel"><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>;
}

function WorkflowCard({ title, steps }) {
  return <article className="feature panel accounting-workflow-card"><h2>{title}</h2><div className="accounting-steps">{steps.map((step, index) => <div className="accounting-step" key={step}><b>{index + 1}</b><span>{step}</span></div>)}</div></article>;
}

function TableCard({ title, rows, emptyLabel, actions }) {
  return <article className="feature panel accounting-table-card"><h2>{title}</h2>{rows.length ? <div className="accounting-table">{rows.map((row) => <div className="accounting-table-row" key={row.id || row.invoice_number || row.bill_number || row.entry_number || row.check_number}><strong>{row.invoice_number || row.bill_number || row.entry_number || row.account_code || row.check_number || row.customer_name || row.vendor_name || `#${row.id}`}</strong><span>{row.customer_name || row.vendor_name || row.payee_name || row.account_name || row.description || row.status}</span><b>{row.total ? money(row.total) : row.amount ? money(row.amount) : row.balance_due ? money(row.balance_due) : row.account_type || row.status}</b>{actions ? actions(row) : null}</div>)}</div> : <div className="accounting-empty">{emptyLabel}</div>}</article>;
}

function Field({ label, children }) {
  return <label className="brand-field"><span>{label}</span>{children}</label>;
}

function FormCard({ title, description, children, onSubmit, submitLabel = 'Save', busy }) {
  return <article className="feature panel accounting-form-card"><h2>{title}</h2>{description && <p>{description}</p>}<form className="accounting-live-form" onSubmit={onSubmit}>{children}<button type="submit" disabled={busy}>{busy ? 'Saving...' : submitLabel}</button></form></article>;
}

function AccountingNav({ activeSection, openSection }) {
  return <nav className="accounting-section-nav panel accounting-compact-nav">
    <div className="accounting-room-title"><span>Portal / Accounting /</span><strong>{sectionMeta(activeSection)[1]}</strong><small>{accountingUrl(activeSection)}</small></div>
    <div className="accounting-nav-row">
      <label><span>Accounting room</span><select value={activeSection} onChange={(event) => openSection(event.target.value)}>{accountingSections.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
      <div className="accounting-header-actions compact"><button onClick={() => openSection('invoices')}>New invoice</button><button onClick={() => openSection('bills')}>Enter bill</button><button onClick={() => openSection('payments')}>Record payment</button><button onClick={() => openSection('checks')}>Write check</button></div>
    </div>
    <div className="accounting-tabs">{accountingSections.slice(0, 10).map(([id, label]) => <button key={id} className={activeSection === id ? 'active' : ''} onClick={() => openSection(id)}>{label}</button>)}</div>
  </nav>;
}

function CustomerForm({ onSaved, submitAction, message }) {
  const [form, setForm] = useState({ customerName: '', contactName: '', email: '', phone: '', terms: 'Net 30' });
  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  async function submit(event) {
    event.preventDefault();
    const result = await submitAction('/api/accounting/customers', form, 'Customer created.');
    if (result?.customer) onSaved?.(result.customer);
    setForm({ customerName: '', contactName: '', email: '', phone: '', terms: 'Net 30' });
  }
  return <FormCard title="New customer" description="Create a billing customer for AR, invoices, payments, and statements." onSubmit={submit} submitLabel="Create customer" busy={message.busy}>
    <Field label="Customer name"><input value={form.customerName} onChange={update('customerName')} placeholder="Customer company" required /></Field>
    <Field label="Contact"><input value={form.contactName} onChange={update('contactName')} placeholder="Primary contact" /></Field>
    <Field label="Email"><input type="email" value={form.email} onChange={update('email')} placeholder="billing@example.com" /></Field>
    <Field label="Phone"><input value={form.phone} onChange={update('phone')} placeholder="Phone" /></Field>
    <Field label="Terms"><select value={form.terms} onChange={update('terms')}><option>Due on receipt</option><option>Net 15</option><option>Net 30</option><option>Net 45</option></select></Field>
  </FormCard>;
}

function VendorForm({ onSaved, submitAction, message }) {
  const [form, setForm] = useState({ vendorName: '', contactName: '', email: '', phone: '', terms: 'Net 30' });
  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  async function submit(event) {
    event.preventDefault();
    const result = await submitAction('/api/accounting/vendors', form, 'Vendor created.');
    if (result?.vendor) onSaved?.(result.vendor);
    setForm({ vendorName: '', contactName: '', email: '', phone: '', terms: 'Net 30' });
  }
  return <FormCard title="New vendor" description="Create a vendor for AP, bills, checks, and vendor payments." onSubmit={submit} submitLabel="Create vendor" busy={message.busy}>
    <Field label="Vendor name"><input value={form.vendorName} onChange={update('vendorName')} placeholder="Vendor company" required /></Field>
    <Field label="Contact"><input value={form.contactName} onChange={update('contactName')} placeholder="Primary contact" /></Field>
    <Field label="Email"><input type="email" value={form.email} onChange={update('email')} placeholder="ap@example.com" /></Field>
    <Field label="Phone"><input value={form.phone} onChange={update('phone')} placeholder="Phone" /></Field>
    <Field label="Terms"><select value={form.terms} onChange={update('terms')}><option>Due on receipt</option><option>Net 15</option><option>Net 30</option><option>Net 45</option></select></Field>
  </FormCard>;
}

function InvoiceForm({ customers, accounts, submitAction, message }) {
  const revenueAccount = accounts.find((account) => account.account_code === '4000') || accounts.find((account) => account.account_type === 'income') || accounts[0];
  const [form, setForm] = useState({ customerId: '', invoiceNumber: '', invoiceType: 'progress', status: 'sent', issueDate: today(), dueDate: dueIn(30), subtotal: '', tax: '0', retainage: '0', notes: '' });
  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  async function submit(event) {
    event.preventDefault();
    const subtotal = numberOrNull(form.subtotal) || 0;
    const tax = numberOrNull(form.tax) || 0;
    const retainage = numberOrNull(form.retainage) || 0;
    await submitAction('/api/accounting/invoices', { ...form, customerId: numberOrNull(form.customerId), subtotal, tax, retainage, total: subtotal + tax - retainage, accountId: revenueAccount?.id || null }, 'Invoice created.');
    setForm({ customerId: '', invoiceNumber: '', invoiceType: 'progress', status: 'sent', issueDate: today(), dueDate: dueIn(30), subtotal: '', tax: '0', retainage: '0', notes: '' });
  }
  return <FormCard title="New invoice" description="Create a customer invoice and emit an accounting.invoice.created proof event." onSubmit={submit} submitLabel="Create invoice" busy={message.busy}>
    <Field label="Customer"><select value={form.customerId} onChange={update('customerId')}><option value="">No customer selected</option>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.customer_name}</option>)}</select></Field>
    <Field label="Invoice number"><input value={form.invoiceNumber} onChange={update('invoiceNumber')} placeholder="Auto if blank" /></Field>
    <Field label="Type"><select value={form.invoiceType} onChange={update('invoiceType')}><option value="progress">Progress</option><option value="deposit">Deposit</option><option value="final">Final</option><option value="change_order">Change order</option><option value="subscription">Subscription</option></select></Field>
    <Field label="Status"><select value={form.status} onChange={update('status')}><option value="draft">Draft</option><option value="sent">Sent</option><option value="approved">Approved</option></select></Field>
    <Field label="Issue date"><input type="date" value={form.issueDate} onChange={update('issueDate')} /></Field>
    <Field label="Due date"><input type="date" value={form.dueDate} onChange={update('dueDate')} /></Field>
    <Field label="Subtotal"><input type="number" step="0.01" value={form.subtotal} onChange={update('subtotal')} placeholder="0.00" required /></Field>
    <Field label="Tax"><input type="number" step="0.01" value={form.tax} onChange={update('tax')} /></Field>
    <Field label="Retainage"><input type="number" step="0.01" value={form.retainage} onChange={update('retainage')} /></Field>
    <Field label="Notes"><textarea value={form.notes} onChange={update('notes')} placeholder="Invoice notes" /></Field>
  </FormCard>;
}

function BillForm({ vendors, accounts, submitAction, message }) {
  const expenseAccount = accounts.find((account) => account.account_code === '5000') || accounts.find((account) => account.account_type === 'expense') || accounts[0];
  const [form, setForm] = useState({ vendorId: '', billNumber: '', poNumber: '', status: 'received', billDate: today(), dueDate: dueIn(30), subtotal: '', tax: '0', notes: '' });
  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  async function submit(event) {
    event.preventDefault();
    const subtotal = numberOrNull(form.subtotal) || 0;
    const tax = numberOrNull(form.tax) || 0;
    await submitAction('/api/accounting/bills', { ...form, vendorId: numberOrNull(form.vendorId), subtotal, tax, total: subtotal + tax, accountId: expenseAccount?.id || null }, 'Bill entered.');
    setForm({ vendorId: '', billNumber: '', poNumber: '', status: 'received', billDate: today(), dueDate: dueIn(30), subtotal: '', tax: '0', notes: '' });
  }
  return <FormCard title="Enter bill" description="Enter a vendor bill and emit an accounting.bill.created proof event." onSubmit={submit} submitLabel="Save bill" busy={message.busy}>
    <Field label="Vendor"><select value={form.vendorId} onChange={update('vendorId')}><option value="">No vendor selected</option>{vendors.map((vendor) => <option key={vendor.id} value={vendor.id}>{vendor.vendor_name}</option>)}</select></Field>
    <Field label="Bill number"><input value={form.billNumber} onChange={update('billNumber')} placeholder="Auto if blank" /></Field>
    <Field label="PO number"><input value={form.poNumber} onChange={update('poNumber')} placeholder="Optional" /></Field>
    <Field label="Status"><select value={form.status} onChange={update('status')}><option value="draft">Draft</option><option value="received">Received</option><option value="approved">Approved</option></select></Field>
    <Field label="Bill date"><input type="date" value={form.billDate} onChange={update('billDate')} /></Field>
    <Field label="Due date"><input type="date" value={form.dueDate} onChange={update('dueDate')} /></Field>
    <Field label="Subtotal"><input type="number" step="0.01" value={form.subtotal} onChange={update('subtotal')} placeholder="0.00" required /></Field>
    <Field label="Tax"><input type="number" step="0.01" value={form.tax} onChange={update('tax')} /></Field>
    <Field label="Notes"><textarea value={form.notes} onChange={update('notes')} placeholder="Bill notes" /></Field>
  </FormCard>;
}

function PaymentForm({ invoices, bills, submitAction, message }) {
  const [form, setForm] = useState({ paymentDirection: 'received', invoiceId: '', billId: '', amount: '', paymentDate: today(), paymentMethod: 'manual', referenceNumber: '', notes: '' });
  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  const isReceived = form.paymentDirection === 'received';
  const selectedInvoice = invoices.find((invoice) => String(invoice.id) === String(form.invoiceId));
  const selectedBill = bills.find((bill) => String(bill.id) === String(form.billId));
  async function submit(event) {
    event.preventDefault();
    await submitAction('/api/accounting/payments', {
      paymentDirection: form.paymentDirection,
      invoiceId: isReceived ? numberOrNull(form.invoiceId) : null,
      billId: isReceived ? null : numberOrNull(form.billId),
      customerId: isReceived ? numberOrNull(selectedInvoice?.customer_id) : null,
      vendorId: isReceived ? null : numberOrNull(selectedBill?.vendor_id),
      amount: numberOrNull(form.amount) || 0,
      paymentDate: form.paymentDate,
      paymentMethod: form.paymentMethod,
      referenceNumber: form.referenceNumber,
      notes: form.notes
    }, isReceived ? 'Customer payment recorded.' : 'Vendor payment recorded.');
    setForm({ paymentDirection: 'received', invoiceId: '', billId: '', amount: '', paymentDate: today(), paymentMethod: 'manual', referenceNumber: '', notes: '' });
  }
  return <FormCard title="Record payment" description="Apply cash received to AR or cash sent to AP." onSubmit={submit} submitLabel="Record payment" busy={message.busy}>
    <Field label="Payment type"><select value={form.paymentDirection} onChange={update('paymentDirection')}><option value="received">Customer payment received</option><option value="sent">Vendor payment sent</option></select></Field>
    {isReceived ? <Field label="Apply to invoice"><select value={form.invoiceId} onChange={update('invoiceId')}><option value="">No invoice selected</option>{invoices.filter((invoice) => Number(invoice.balance_due || invoice.total || 0) > 0).map((invoice) => <option key={invoice.id} value={invoice.id}>{invoice.invoice_number} · {invoice.customer_name || 'Customer'} · {money(invoice.balance_due || invoice.total)}</option>)}</select></Field> : <Field label="Apply to bill"><select value={form.billId} onChange={update('billId')}><option value="">No bill selected</option>{bills.filter((bill) => Number(bill.balance_due || bill.total || 0) > 0).map((bill) => <option key={bill.id} value={bill.id}>{bill.bill_number} · {bill.vendor_name || 'Vendor'} · {money(bill.balance_due || bill.total)}</option>)}</select></Field>}
    <Field label="Amount"><input type="number" step="0.01" value={form.amount} onChange={update('amount')} placeholder="0.00" required /></Field>
    <Field label="Payment date"><input type="date" value={form.paymentDate} onChange={update('paymentDate')} /></Field>
    <Field label="Method"><select value={form.paymentMethod} onChange={update('paymentMethod')}><option value="manual">Manual</option><option value="check">Check</option><option value="ach">ACH</option><option value="credit_card">Credit card</option><option value="wire">Wire</option></select></Field>
    <Field label="Reference"><input value={form.referenceNumber} onChange={update('referenceNumber')} placeholder="Check, ACH, or receipt number" /></Field>
    <Field label="Notes"><textarea value={form.notes} onChange={update('notes')} placeholder="Payment notes" /></Field>
  </FormCard>;
}

function CheckForm({ vendors, bills, submitAction, message }) {
  const [form, setForm] = useState({ vendorId: '', billId: '', payeeName: '', checkNumber: '', checkDate: today(), amount: '', memo: '', status: 'draft' });
  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  const selectedBill = bills.find((bill) => String(bill.id) === String(form.billId));
  async function submit(event) {
    event.preventDefault();
    await submitAction('/api/accounting/checks', { ...form, vendorId: numberOrNull(form.vendorId || selectedBill?.vendor_id), billId: numberOrNull(form.billId), amount: numberOrNull(form.amount) || 0 }, 'Check drafted.');
    setForm({ vendorId: '', billId: '', payeeName: '', checkNumber: '', checkDate: today(), amount: '', memo: '', status: 'draft' });
  }
  return <FormCard title="Write check" description="Draft a check for a vendor or bill, then mark it printed when ready." onSubmit={submit} submitLabel="Draft check" busy={message.busy}>
    <Field label="Vendor"><select value={form.vendorId} onChange={update('vendorId')}><option value="">No vendor selected</option>{vendors.map((vendor) => <option key={vendor.id} value={vendor.id}>{vendor.vendor_name}</option>)}</select></Field>
    <Field label="Bill"><select value={form.billId} onChange={(event) => { const bill = bills.find((item) => String(item.id) === event.target.value); setForm((current) => ({ ...current, billId: event.target.value, vendorId: bill?.vendor_id || current.vendorId, payeeName: bill?.vendor_name || current.payeeName, amount: bill?.balance_due || current.amount })); }}><option value="">No bill selected</option>{bills.filter((bill) => Number(bill.balance_due || bill.total || 0) > 0).map((bill) => <option key={bill.id} value={bill.id}>{bill.bill_number} · {bill.vendor_name || 'Vendor'} · {money(bill.balance_due || bill.total)}</option>)}</select></Field>
    <Field label="Payee"><input value={form.payeeName} onChange={update('payeeName')} placeholder="Payee name" required /></Field>
    <Field label="Check number"><input value={form.checkNumber} onChange={update('checkNumber')} placeholder="Auto if blank" /></Field>
    <Field label="Check date"><input type="date" value={form.checkDate} onChange={update('checkDate')} /></Field>
    <Field label="Amount"><input type="number" step="0.01" value={form.amount} onChange={update('amount')} placeholder="0.00" required /></Field>
    <Field label="Memo"><textarea value={form.memo} onChange={update('memo')} placeholder="Memo" /></Field>
  </FormCard>;
}

function JournalForm({ accounts, submitAction, message }) {
  const defaultDebit = accounts.find((account) => account.normal_balance === 'debit') || accounts[0];
  const defaultCredit = accounts.find((account) => account.normal_balance === 'credit') || accounts[1] || accounts[0];
  const [form, setForm] = useState({ entryNumber: '', entryDate: today(), description: '', debitAccountId: defaultDebit?.id || '', creditAccountId: defaultCredit?.id || '', amount: '', memo: '' });
  useEffect(() => { setForm((current) => ({ ...current, debitAccountId: current.debitAccountId || defaultDebit?.id || '', creditAccountId: current.creditAccountId || defaultCredit?.id || '' })); }, [defaultDebit?.id, defaultCredit?.id]);
  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  async function submit(event) {
    event.preventDefault();
    const amount = numberOrNull(form.amount) || 0;
    await submitAction('/api/accounting/journal', { entryNumber: form.entryNumber, entryDate: form.entryDate, description: form.description || 'Manual journal entry', lines: [{ accountId: numberOrNull(form.debitAccountId), debit: amount, credit: 0, memo: form.memo || 'Debit' }, { accountId: numberOrNull(form.creditAccountId), debit: 0, credit: amount, memo: form.memo || 'Credit' }] }, 'Journal entry posted.');
    setForm({ entryNumber: '', entryDate: today(), description: '', debitAccountId: defaultDebit?.id || '', creditAccountId: defaultCredit?.id || '', amount: '', memo: '' });
  }
  return <FormCard title="New journal entry" description="Post a balanced debit/credit journal entry." onSubmit={submit} submitLabel="Post journal entry" busy={message.busy}>
    <Field label="Entry number"><input value={form.entryNumber} onChange={update('entryNumber')} placeholder="Auto if blank" /></Field>
    <Field label="Entry date"><input type="date" value={form.entryDate} onChange={update('entryDate')} /></Field>
    <Field label="Description"><input value={form.description} onChange={update('description')} placeholder="Description" /></Field>
    <Field label="Debit account"><select value={form.debitAccountId} onChange={update('debitAccountId')}>{accounts.map((account) => <option key={account.id} value={account.id}>{account.account_code} · {account.account_name}</option>)}</select></Field>
    <Field label="Credit account"><select value={form.creditAccountId} onChange={update('creditAccountId')}>{accounts.map((account) => <option key={account.id} value={account.id}>{account.account_code} · {account.account_name}</option>)}</select></Field>
    <Field label="Amount"><input type="number" step="0.01" value={form.amount} onChange={update('amount')} placeholder="0.00" required /></Field>
    <Field label="Memo"><textarea value={form.memo} onChange={update('memo')} placeholder="Memo" /></Field>
  </FormCard>;
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
    <button className="feature panel accounting-workflow-card" onClick={() => openSection('payments')}><h2>Payments</h2><p>Record customer receipts and vendor payments.</p></button>
    <button className="feature panel accounting-workflow-card" onClick={() => openSection('checks')}><h2>Checks</h2><p>Draft checks and mark printed checks.</p></button>
    <button className="feature panel accounting-workflow-card" onClick={() => openSection('general-ledger')}><h2>General Ledger</h2><p>Journal entries, chart activity, debit/credit balance, and period close.</p></button>
    <button className="feature panel accounting-workflow-card" onClick={() => openSection('project-financials')}><h2>Project Financials</h2><p>Project billing, job cost, retainage, change orders, and margin control.</p></button>
  </section>
  <section className="accounting-data-grid"><TableCard title="Recent invoices" rows={invoices} emptyLabel="No invoices yet." /><TableCard title="Recent bills" rows={bills} emptyLabel="No bills yet." /><TableCard title="Chart of accounts" rows={accounts.slice(0, 12)} emptyLabel="Chart of accounts will seed from /api/accounting/status." /></section>
</>; }

function ReportsView({ summary, invoices, bills, payments, checks }) {
  const overdueInvoices = invoices.filter((invoice) => invoice.due_date && new Date(invoice.due_date) < new Date() && Number(invoice.balance_due || 0) > 0);
  const openBills = bills.filter((bill) => Number(bill.balance_due || 0) > 0);
  return <section className="accounting-focus-grid">
    <WorkflowCard title="Accounting Reports" steps={['AR aging is live from open invoice balances.', 'AP aging is live from open vendor bill balances.', 'Cash activity is live from payment records.', 'Check history is live from check records.']} />
    <article className="feature panel"><h2>Report snapshot</h2><div className="accounting-stat-grid mini"><StatCard label="Open AR" value={money(summary.ar_open)} detail={`${invoices.length} total invoices`} /><StatCard label="Overdue AR" value={money(overdueInvoices.reduce((sum, invoice) => sum + Number(invoice.balance_due || 0), 0))} detail={`${overdueInvoices.length} overdue invoices`} /><StatCard label="Open AP" value={money(summary.ap_open)} detail={`${openBills.length} open bills`} /><StatCard label="Checks" value={checks.length} detail="Check records" /></div></article>
    <TableCard title="Cash activity" rows={payments} emptyLabel="No payments recorded yet." />
  </section>;
}

function ProjectFinancialsView({ invoices, bills }) {
  const totalBilled = invoices.reduce((sum, invoice) => sum + Number(invoice.total || 0), 0);
  const totalCollected = invoices.reduce((sum, invoice) => sum + (Number(invoice.total || 0) - Number(invoice.balance_due || 0)), 0);
  const totalCost = bills.reduce((sum, bill) => sum + Number(bill.total || 0), 0);
  const openAp = bills.reduce((sum, bill) => sum + Number(bill.balance_due || 0), 0);
  return <section className="accounting-focus-grid"><WorkflowCard title="Project Financials" steps={['Tie invoices, bills, purchase orders, payments, and change orders to the project.', 'Track billed vs collected vs cost to date.', 'Track retainage, deposits, insurance, and change order exposure.', 'Prepare project financial status for admin/owner review.']} /><article className="feature panel"><h2>Project financial summary</h2><div className="accounting-stat-grid mini"><StatCard label="Billed to date" value={money(totalBilled)} detail="Invoice total" /><StatCard label="Collected" value={money(totalCollected)} detail="Paid invoice amount" /><StatCard label="Cost to date" value={money(totalCost)} detail="Vendor bills" /><StatCard label="Open AP" value={money(openAp)} detail="Bill balance due" /></div></article><TableCard title="Project invoices" rows={invoices} emptyLabel="No project invoices yet." /><TableCard title="Project bills" rows={bills} emptyLabel="No project bills yet." /></section>;
}

function SectionView(props) {
  const { activeSection, summary, customers, vendors, invoices, bills, payments, checks, accounts, journalEntries, status, openSection, submitAction, message, reloadData, markCheckPrinted } = props;
  if (activeSection === 'dashboard') return <DashboardView summary={summary} invoices={invoices} bills={bills} accounts={accounts} openSection={openSection} />;
  if (activeSection === 'ar') return <section className="accounting-focus-grid"><WorkflowCard title="AR / Customer Billing" steps={['Create customers and invoices.', 'Track open receivables, due dates, retainage, and customer balances.', 'Record customer payments and apply them to invoices.', 'Run AR aging and escalate overdue accounts.']} /><CustomerForm submitAction={submitAction} message={message} onSaved={reloadData} /><TableCard title="Open customer invoices" rows={invoices} emptyLabel="No AR invoices yet." /><article className="feature panel"><h2>AR actions</h2><div className="accounting-actions-list"><button onClick={() => openSection('invoices')}>New invoice</button><button onClick={() => openSection('payments')}>Record customer payment</button><button onClick={() => openSection('reports')}>Run AR aging</button></div></article></section>;
  if (activeSection === 'invoices') return <section className="accounting-focus-grid"><InvoiceForm customers={customers} accounts={accounts} submitAction={submitAction} message={message} /><TableCard title="Customer invoices" rows={invoices} emptyLabel="No invoices yet." /></section>;
  if (activeSection === 'ap') return <section className="accounting-focus-grid"><WorkflowCard title="AP / Vendor Bills" steps={['Create vendors and enter bills.', 'Code bill to project, material, labor, subcontractor, equipment, or overhead.', 'Approve bill for payment.', 'Pay vendor and keep AP aging current.']} /><VendorForm submitAction={submitAction} message={message} onSaved={reloadData} /><TableCard title="Open vendor bills" rows={bills} emptyLabel="No AP bills yet." /><article className="feature panel"><h2>AP actions</h2><div className="accounting-actions-list"><button onClick={() => openSection('bills')}>Enter bill</button><button onClick={() => openSection('checks')}>Write check</button><button onClick={() => openSection('payments')}>Record vendor payment</button></div></article></section>;
  if (activeSection === 'bills') return <section className="accounting-focus-grid"><BillForm vendors={vendors} accounts={accounts} submitAction={submitAction} message={message} /><TableCard title="Vendor bills" rows={bills} emptyLabel="No bills yet." /></section>;
  if (activeSection === 'payments') return <section className="accounting-focus-grid"><PaymentForm invoices={invoices} bills={bills} submitAction={submitAction} message={message} /><TableCard title="Payments" rows={payments} emptyLabel="No payments recorded yet." /><article className="feature panel"><h2>Cash movement</h2><div className="accounting-stat-grid mini"><StatCard label="Received MTD" value={money(summary.cash_received_mtd)} detail="Customer receipts" /><StatCard label="Paid MTD" value={money(summary.cash_paid_mtd)} detail="Vendor payments" /></div></article></section>;
  if (activeSection === 'checks') return <section className="accounting-focus-grid"><CheckForm vendors={vendors} bills={bills} submitAction={submitAction} message={message} /><TableCard title="Checks" rows={checks} emptyLabel="No checks written yet." actions={(check) => check.status === 'printed' ? null : <button type="button" onClick={() => markCheckPrinted(check.id)}>Mark printed</button>} /></section>;
  if (activeSection === 'project-financials') return <ProjectFinancialsView invoices={invoices} bills={bills} />;
  if (activeSection === 'general-ledger') return <section className="accounting-focus-grid"><JournalForm accounts={accounts} submitAction={submitAction} message={message} /><TableCard title="Journal entries" rows={journalEntries} emptyLabel="No journal entries yet." /><WorkflowCard title="General Ledger" steps={['Post journal entries from accounting actions.', 'Validate debit and credit balance.', 'Track source repo, source commit, packet, runner, and DAG event linkage.', 'Close periods after review.']} /></section>;
  if (activeSection === 'chart-of-accounts') return <section className="accounting-focus-grid"><TableCard title="Chart of accounts" rows={accounts} emptyLabel="No ledger accounts found." /><article className="feature panel"><h2>Chart controls</h2><p>The seeded chart is live from /api/accounting/accounts. Account editing will be the next backend endpoint after core accounting transactions are stable.</p></article></section>;
  if (activeSection === 'reports') return <ReportsView summary={summary} invoices={invoices} bills={bills} payments={payments} checks={checks} />;
  return <section className="accounting-focus-grid"><article className="feature panel"><h2>Accounting Settings</h2><p>Module status, tenant accounting settings, numbering, DAG linkage, and extraction readiness.</p><pre className="accounting-json-preview">{JSON.stringify(status.infrastructure || {}, null, 2)}</pre></article></section>;
}

export default function AccountingPortal() {
  const [status, setStatus] = useState({ summary: fallbackSummary, tables: [], ok: false });
  const [accounts, setAccounts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [bills, setBills] = useState([]);
  const [payments, setPayments] = useState([]);
  const [checks, setChecks] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '', busy: false });
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState(sectionFromPath);

  function openSection(section) {
    const safe = validSections.has(section) ? section : defaultSection;
    history.pushState({}, '', accountingUrl(safe));
    setActiveSection(safe);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }

  async function loadData() {
    const [statusRes, accountRes, customerRes, vendorRes, invoiceRes, billRes, paymentRes, checkRes, journalRes] = await Promise.all([
      fetch('/api/accounting/status'), fetch('/api/accounting/accounts'), fetch('/api/accounting/customers'), fetch('/api/accounting/vendors'), fetch('/api/accounting/invoices'), fetch('/api/accounting/bills'), fetch('/api/accounting/payments'), fetch('/api/accounting/checks'), fetch('/api/accounting/journal')
    ]);
    const [statusJson, accountJson, customerJson, vendorJson, invoiceJson, billJson, paymentJson, checkJson, journalJson] = await Promise.all([statusRes.json(), accountRes.json(), customerRes.json(), vendorRes.json(), invoiceRes.json(), billRes.json(), paymentRes.json(), checkRes.json(), journalRes.json()]);
    setStatus(statusJson.ok ? statusJson : { summary: fallbackSummary, tables: [], ok: false });
    setAccounts(accountJson.accounts || []);
    setCustomers(customerJson.customers || []);
    setVendors(vendorJson.vendors || []);
    setInvoices(invoiceJson.invoices || []);
    setBills(billJson.bills || []);
    setPayments(paymentJson.payments || []);
    setChecks(checkJson.checks || []);
    setJournalEntries(journalJson.journalEntries || []);
  }

  async function submitAction(url, payload, successText) {
    setMessage({ text: '', type: '', busy: true });
    try {
      const result = await apiPost(url, payload);
      await loadData();
      setMessage({ text: successText, type: 'success', busy: false });
      return result;
    } catch (err) {
      setMessage({ text: err.message || 'Accounting action failed.', type: 'error', busy: false });
      return null;
    }
  }

  async function markCheckPrinted(checkId) {
    await submitAction(`/api/accounting/checks/${checkId}/print`, { status: 'printed' }, 'Check marked printed.');
  }

  useEffect(() => {
    const sync = () => setActiveSection(sectionFromPath());
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  useEffect(() => {
    let alive = true;
    loadData().catch((err) => { if (alive) setError(err.message || 'Accounting data could not be loaded.'); });
    return () => { alive = false; };
  }, []);

  const summary = status.summary || fallbackSummary;
  const activeMeta = useMemo(() => sectionMeta(activeSection), [activeSection]);

  return <>
    <AccountingNav activeSection={activeSection} openSection={openSection} />
    <header className="workspace-header panel accounting-subroom-header"><div><p className="eyebrow">Accounting room</p><h1>{activeMeta[1]}</h1><p>{activeMeta[2]}</p></div><div className="live-badge">{accountingUrl(activeSection)}</div></header>
    {error && <div className="notice">{error}</div>}
    {message.text && <div className="notice">{message.text}</div>}
    <SectionView activeSection={activeSection} summary={summary} customers={customers} vendors={vendors} invoices={invoices} bills={bills} payments={payments} checks={checks} accounts={accounts} journalEntries={journalEntries} status={status} openSection={openSection} submitAction={submitAction} message={message} reloadData={loadData} markCheckPrinted={markCheckPrinted} />
  </>;
}
