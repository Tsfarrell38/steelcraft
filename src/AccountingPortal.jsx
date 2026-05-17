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
  ['today', 'Today', 'What needs attention right now'],
  ['money-in', 'Money In', 'Invoices, customer payments, and money owed to us'],
  ['money-out', 'Money Out', 'Vendor bills, checks, and money we owe'],
  ['banking', 'Banking + Cards', 'Bank accounts, debit cards, bank feed, and AI bookkeeping review'],
  ['projects', 'Projects', 'Project financial health, job cost, and margin'],
  ['reports', 'Reports', 'Simple owner-ready financial reports'],
  ['setup', 'Setup', 'Customers, vendors, invoice numbers, tax, and accounting controls']
];

const defaultSection = 'today';
const validSections = new Set(accountingSections.map(([id]) => id));
const invoiceSettingsKey = 'steelcraft_invoice_number_settings_v1';
const taxSettingsKey = 'steelcraft_tax_settings_v1';

const defaultInvoiceSettings = { prefix: 'SCB-INV-', nextNumber: 1001, allowCustomInvoiceNumber: false };
const defaultTaxSettings = { state: 'FL', county: 'Orange', city: 'Orlando', stateRate: 6, countyRate: 0.5, cityRate: 0, defaultTaxable: true };

function sectionFromPath() {
  const match = window.location.pathname.replace(/\/$/, '').match(/^\/portal\/accounting\/?([^/]*)/);
  const section = match?.[1] || defaultSection;
  return validSections.has(section) ? section : defaultSection;
}
function accountingUrl(section) { return `/portal/accounting/${section}`; }
function sectionMeta(section) { return accountingSections.find(([id]) => id === section) || accountingSections[0]; }
function money(value) { return Number(value || 0).toLocaleString(undefined, { style: 'currency', currency: 'USD' }); }
function today() { return new Date().toISOString().slice(0, 10); }
function dueIn(days) { const d = new Date(); d.setDate(d.getDate() + days); return d.toISOString().slice(0, 10); }
function numberOrNull(value) { const number = Number(value); return Number.isFinite(number) && value !== '' ? number : null; }
function loadJson(key, fallback) { try { return { ...fallback, ...(JSON.parse(localStorage.getItem(key)) || {}) }; } catch { return fallback; } }
function saveJson(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function formatInvoiceNumber(settings) { return `${settings.prefix || ''}${String(settings.nextNumber || 1).padStart(4, '0')}`; }
function taxRate(settings) { return (Number(settings.stateRate || 0) + Number(settings.countyRate || 0) + Number(settings.cityRate || 0)) / 100; }

async function apiPost(url, payload) {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ actor: 'accounting', ...payload }) });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.ok === false) throw new Error(json.error || `Request failed: ${res.status}`);
  return json;
}

function StatCard({ label, value, detail }) { return <article className="accounting-stat panel"><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>; }
function Field({ label, children, hint }) { return <label className="brand-field"><span>{label}</span>{children}{hint && <small className="field-hint">{hint}</small>}</label>; }
function FormCard({ title, description, children, onSubmit, submitLabel = 'Save', busy }) { return <article className="feature panel accounting-form-card"><h2>{title}</h2>{description && <p>{description}</p>}<form className="accounting-live-form" onSubmit={onSubmit}>{children}<button type="submit" disabled={busy}>{busy ? 'Saving...' : submitLabel}</button></form></article>; }
function ActionCard({ title, text, onClick }) { return <button className="feature panel accounting-workflow-card" onClick={onClick}><h2>{title}</h2><p>{text}</p></button>; }
function FormSection({ title, children }) { return <section className="accounting-card-section"><h3>{title}</h3><div className="accounting-card-grid">{children}</div></section>; }
function TableCard({ title, rows, emptyLabel, actions }) { return <article className="feature panel accounting-table-card"><h2>{title}</h2>{rows.length ? <div className="accounting-table">{rows.map((row) => <div className="accounting-table-row" key={row.id || row.invoice_number || row.bill_number || row.entry_number || row.check_number}><strong>{row.invoice_number || row.bill_number || row.entry_number || row.account_code || row.check_number || row.customer_name || row.vendor_name || `#${row.id}`}</strong><span>{row.customer_name || row.vendor_name || row.payee_name || row.account_name || row.description || row.status}</span><b>{row.total ? money(row.total) : row.amount ? money(row.amount) : row.balance_due ? money(row.balance_due) : row.account_type || row.status}</b>{actions ? actions(row) : null}</div>)}</div> : <div className="accounting-empty">{emptyLabel}</div>}</article>; }

function AccountingNav({ activeSection, openSection }) {
  return <nav className="accounting-section-nav panel accounting-compact-nav">
    <div className="accounting-room-title"><span>Portal / Accounting /</span><strong>{sectionMeta(activeSection)[1]}</strong><small>{accountingUrl(activeSection)}</small></div>
    <div className="accounting-nav-row">
      <label><span>Simple accounting room</span><select value={activeSection} onChange={(event) => openSection(event.target.value)}>{accountingSections.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
      <div className="accounting-header-actions compact"><button onClick={() => openSection('money-in')}>Create invoice</button><button onClick={() => openSection('money-out')}>Enter bill</button><button onClick={() => openSection('banking')}>Review bank feed</button></div>
    </div>
    <div className="accounting-tabs">{accountingSections.map(([id, label]) => <button key={id} className={activeSection === id ? 'active' : ''} onClick={() => openSection(id)}>{label}</button>)}</div>
  </nav>;
}

function InvoiceNumberSettings({ settings, setSettings }) {
  const update = (key) => (event) => {
    const value = key === 'nextNumber' ? Number(event.target.value || 1) : key === 'allowCustomInvoiceNumber' ? event.target.checked : event.target.value;
    const next = { ...settings, [key]: value };
    setSettings(next);
    saveJson(invoiceSettingsKey, next);
  };
  return <article className="feature panel accounting-form-card"><h2>Invoice numbers</h2><p>Set where invoice numbers start. After that, Neroa keeps running the number automatically.</p><div className="accounting-card-grid"><Field label="Prefix"><input value={settings.prefix} onChange={update('prefix')} /></Field><Field label="Next number"><input type="number" min="1" value={settings.nextNumber} onChange={update('nextNumber')} /></Field><Field label="Next invoice"><input value={formatInvoiceNumber(settings)} readOnly /></Field><Field label="Custom override"><label className="inline-check"><input type="checkbox" checked={settings.allowCustomInvoiceNumber} onChange={update('allowCustomInvoiceNumber')} /> Allow manual invoice number</label></Field></div></article>;
}

function TaxSettings({ settings, setSettings }) {
  const update = (key) => (event) => {
    const value = key === 'defaultTaxable' ? event.target.checked : ['stateRate', 'countyRate', 'cityRate'].includes(key) ? event.target.value : event.target.value;
    const next = { ...settings, [key]: value };
    setSettings(next);
    saveJson(taxSettingsKey, next);
  };
  return <article className="feature panel accounting-form-card"><h2>Tax location</h2><p>Foundation for city, county, and state tax. Later this becomes a real tax table by jurisdiction.</p><div className="accounting-card-grid"><Field label="State"><input value={settings.state} onChange={update('state')} /></Field><Field label="County"><input value={settings.county} onChange={update('county')} /></Field><Field label="City"><input value={settings.city} onChange={update('city')} /></Field><Field label="State tax %"><input type="number" step="0.001" value={settings.stateRate} onChange={update('stateRate')} /></Field><Field label="County tax %"><input type="number" step="0.001" value={settings.countyRate} onChange={update('countyRate')} /></Field><Field label="City tax %"><input type="number" step="0.001" value={settings.cityRate} onChange={update('cityRate')} /></Field><Field label="Combined rate"><input value={`${(taxRate(settings) * 100).toFixed(3)}%`} readOnly /></Field><Field label="Default taxable"><label className="inline-check"><input type="checkbox" checked={settings.defaultTaxable} onChange={update('defaultTaxable')} /> New invoices taxable by default</label></Field></div></article>;
}

function CustomerForm({ submitAction, message }) {
  const [form, setForm] = useState({ customerName: '', contactName: '', email: '', phone: '', terms: 'Net 30' });
  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  async function submit(event) { event.preventDefault(); await submitAction('/api/accounting/customers', form, 'Customer created.'); setForm({ customerName: '', contactName: '', email: '', phone: '', terms: 'Net 30' }); }
  return <FormCard title="Add customer" description="Only add what you need. You can finish details later." onSubmit={submit} submitLabel="Add customer" busy={message.busy}><FormSection title="Customer card"><Field label="Customer name"><input value={form.customerName} onChange={update('customerName')} required /></Field><Field label="Contact"><input value={form.contactName} onChange={update('contactName')} /></Field><Field label="Email"><input type="email" value={form.email} onChange={update('email')} /></Field><Field label="Phone"><input value={form.phone} onChange={update('phone')} /></Field><Field label="Terms"><select value={form.terms} onChange={update('terms')}><option>Due on receipt</option><option>Net 15</option><option>Net 30</option><option>Net 45</option></select></Field></FormSection></FormCard>;
}

function VendorForm({ submitAction, message }) {
  const [form, setForm] = useState({ vendorName: '', contactName: '', email: '', phone: '', terms: 'Net 30' });
  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  async function submit(event) { event.preventDefault(); await submitAction('/api/accounting/vendors', form, 'Vendor created.'); setForm({ vendorName: '', contactName: '', email: '', phone: '', terms: 'Net 30' }); }
  return <FormCard title="Add vendor" description="Add a vendor for bills, debit card charges, checks, and payments." onSubmit={submit} submitLabel="Add vendor" busy={message.busy}><FormSection title="Vendor card"><Field label="Vendor name"><input value={form.vendorName} onChange={update('vendorName')} required /></Field><Field label="Contact"><input value={form.contactName} onChange={update('contactName')} /></Field><Field label="Email"><input type="email" value={form.email} onChange={update('email')} /></Field><Field label="Phone"><input value={form.phone} onChange={update('phone')} /></Field><Field label="Terms"><select value={form.terms} onChange={update('terms')}><option>Due on receipt</option><option>Net 15</option><option>Net 30</option><option>Net 45</option></select></Field></FormSection></FormCard>;
}

function InvoiceForm({ customers, submitAction, message, invoiceSettings, setInvoiceSettings, taxSettings }) {
  const [form, setForm] = useState({ customerId: '', invoiceNumber: '', invoiceType: 'progress', status: 'sent', issueDate: today(), dueDate: dueIn(30), subtotal: '', taxableAmount: '', nonTaxableAmount: '0', taxable: taxSettings.defaultTaxable, tax: '0', retainage: '0', notes: '' });
  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: key === 'taxable' ? event.target.checked : event.target.value }));
  const subtotal = numberOrNull(form.subtotal) || 0;
  const taxableAmount = form.taxable ? (numberOrNull(form.taxableAmount) ?? subtotal) : 0;
  const calculatedTax = taxableAmount * taxRate(taxSettings);
  const retainage = numberOrNull(form.retainage) || 0;
  const total = subtotal + calculatedTax - retainage;
  const nextInvoiceNumber = formatInvoiceNumber(invoiceSettings);
  async function submit(event) {
    event.preventDefault();
    const invoiceNumber = invoiceSettings.allowCustomInvoiceNumber && form.invoiceNumber ? form.invoiceNumber : nextInvoiceNumber;
    await submitAction('/api/accounting/invoices', { ...form, invoiceNumber, customerId: numberOrNull(form.customerId), subtotal, tax: calculatedTax, retainage, total, raw: { taxLocation: taxSettings, taxableAmount, nonTaxableAmount: numberOrNull(form.nonTaxableAmount) || 0 } }, 'Invoice created.');
    if (!(invoiceSettings.allowCustomInvoiceNumber && form.invoiceNumber)) {
      const next = { ...invoiceSettings, nextNumber: Number(invoiceSettings.nextNumber || 1) + 1 };
      setInvoiceSettings(next);
      saveJson(invoiceSettingsKey, next);
    }
    setForm({ customerId: '', invoiceNumber: '', invoiceType: 'progress', status: 'sent', issueDate: today(), dueDate: dueIn(30), subtotal: '', taxableAmount: '', nonTaxableAmount: '0', taxable: taxSettings.defaultTaxable, tax: '0', retainage: '0', notes: '' });
  }
  return <FormCard title="Create invoice" description="Organized cards. Invoice number runs automatically after the starting number is set." onSubmit={submit} submitLabel="Create invoice" busy={message.busy}>
    <FormSection title="Customer + invoice"><Field label="Customer"><select value={form.customerId} onChange={update('customerId')}><option value="">Select customer</option>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.customer_name}</option>)}</select></Field><Field label="Invoice number" hint="Auto unless custom override is enabled in Setup."><input value={invoiceSettings.allowCustomInvoiceNumber ? form.invoiceNumber : nextInvoiceNumber} onChange={update('invoiceNumber')} readOnly={!invoiceSettings.allowCustomInvoiceNumber} /></Field><Field label="Invoice type"><select value={form.invoiceType} onChange={update('invoiceType')}><option value="progress">Progress</option><option value="deposit">Deposit</option><option value="final">Final</option><option value="change_order">Change order</option><option value="subscription">Subscription</option></select></Field><Field label="Due date"><input type="date" value={form.dueDate} onChange={update('dueDate')} /></Field></FormSection>
    <FormSection title="Amounts + tax"><Field label="Invoice amount"><input type="number" step="0.01" value={form.subtotal} onChange={update('subtotal')} required /></Field><Field label="Taxable"><label className="inline-check"><input type="checkbox" checked={form.taxable} onChange={update('taxable')} /> This invoice has taxable items</label></Field><Field label="Taxable amount"><input type="number" step="0.01" value={form.taxableAmount} onChange={update('taxableAmount')} placeholder="Uses full amount if blank" disabled={!form.taxable} /></Field><Field label="Non-taxable amount"><input type="number" step="0.01" value={form.nonTaxableAmount} onChange={update('nonTaxableAmount')} /></Field><Field label={`${taxSettings.city}, ${taxSettings.county}, ${taxSettings.state} tax`}><input value={money(calculatedTax)} readOnly /></Field><Field label="Retainage"><input type="number" step="0.01" value={form.retainage} onChange={update('retainage')} /></Field><Field label="Invoice total"><input value={money(total)} readOnly /></Field></FormSection>
    <FormSection title="Notes"><Field label="Notes"><textarea value={form.notes} onChange={update('notes')} /></Field></FormSection>
  </FormCard>;
}

function BillForm({ vendors, submitAction, message }) {
  const [form, setForm] = useState({ vendorId: '', billNumber: '', poNumber: '', status: 'received', billDate: today(), dueDate: dueIn(30), subtotal: '', tax: '0', notes: '' });
  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  async function submit(event) { event.preventDefault(); const subtotal = numberOrNull(form.subtotal) || 0; const tax = numberOrNull(form.tax) || 0; await submitAction('/api/accounting/bills', { ...form, vendorId: numberOrNull(form.vendorId), subtotal, tax, total: subtotal + tax }, 'Bill entered.'); setForm({ vendorId: '', billNumber: '', poNumber: '', status: 'received', billDate: today(), dueDate: dueIn(30), subtotal: '', tax: '0', notes: '' }); }
  return <FormCard title="Enter bill" description="Vendor bill fields are grouped into smaller cards." onSubmit={submit} submitLabel="Save bill" busy={message.busy}><FormSection title="Vendor + bill"><Field label="Vendor"><select value={form.vendorId} onChange={update('vendorId')}><option value="">Select vendor</option>{vendors.map((vendor) => <option key={vendor.id} value={vendor.id}>{vendor.vendor_name}</option>)}</select></Field><Field label="Bill number"><input value={form.billNumber} onChange={update('billNumber')} placeholder="Auto if blank" /></Field><Field label="PO number"><input value={form.poNumber} onChange={update('poNumber')} /></Field><Field label="Due date"><input type="date" value={form.dueDate} onChange={update('dueDate')} /></Field></FormSection><FormSection title="Amounts"><Field label="Amount"><input type="number" step="0.01" value={form.subtotal} onChange={update('subtotal')} required /></Field><Field label="Tax"><input type="number" step="0.01" value={form.tax} onChange={update('tax')} /></Field><Field label="Total"><input value={money((numberOrNull(form.subtotal) || 0) + (numberOrNull(form.tax) || 0))} readOnly /></Field></FormSection><FormSection title="Notes"><Field label="Notes"><textarea value={form.notes} onChange={update('notes')} /></Field></FormSection></FormCard>;
}

function PaymentForm({ invoices, bills, submitAction, message }) {
  const [form, setForm] = useState({ paymentDirection: 'received', invoiceId: '', billId: '', amount: '', paymentDate: today(), paymentMethod: 'manual', referenceNumber: '', notes: '' });
  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  const isReceived = form.paymentDirection === 'received';
  const selectedInvoice = invoices.find((invoice) => String(invoice.id) === String(form.invoiceId));
  const selectedBill = bills.find((bill) => String(bill.id) === String(form.billId));
  async function submit(event) { event.preventDefault(); await submitAction('/api/accounting/payments', { paymentDirection: form.paymentDirection, invoiceId: isReceived ? numberOrNull(form.invoiceId) : null, billId: isReceived ? null : numberOrNull(form.billId), customerId: isReceived ? numberOrNull(selectedInvoice?.customer_id) : null, vendorId: isReceived ? null : numberOrNull(selectedBill?.vendor_id), amount: numberOrNull(form.amount) || 0, paymentDate: form.paymentDate, paymentMethod: form.paymentMethod, referenceNumber: form.referenceNumber, notes: form.notes }, isReceived ? 'Customer payment recorded.' : 'Vendor payment recorded.'); setForm({ paymentDirection: 'received', invoiceId: '', billId: '', amount: '', paymentDate: today(), paymentMethod: 'manual', referenceNumber: '', notes: '' }); }
  return <FormCard title="Record payment" description="Payment fields are now grouped into cards too." onSubmit={submit} submitLabel="Record payment" busy={message.busy}><FormSection title="Payment"><Field label="Payment type"><select value={form.paymentDirection} onChange={update('paymentDirection')}><option value="received">Customer paid us</option><option value="sent">We paid a vendor</option></select></Field>{isReceived ? <Field label="Invoice"><select value={form.invoiceId} onChange={update('invoiceId')}><option value="">Select invoice</option>{invoices.filter((invoice) => Number(invoice.balance_due || invoice.total || 0) > 0).map((invoice) => <option key={invoice.id} value={invoice.id}>{invoice.invoice_number} · {invoice.customer_name || 'Customer'} · {money(invoice.balance_due || invoice.total)}</option>)}</select></Field> : <Field label="Bill"><select value={form.billId} onChange={update('billId')}><option value="">Select bill</option>{bills.filter((bill) => Number(bill.balance_due || bill.total || 0) > 0).map((bill) => <option key={bill.id} value={bill.id}>{bill.bill_number} · {bill.vendor_name || 'Vendor'} · {money(bill.balance_due || bill.total)}</option>)}</select></Field>}<Field label="Amount"><input type="number" step="0.01" value={form.amount} onChange={update('amount')} required /></Field><Field label="Method"><select value={form.paymentMethod} onChange={update('paymentMethod')}><option value="manual">Manual</option><option value="check">Check</option><option value="debit_card">Debit card</option><option value="ach">ACH</option><option value="credit_card">Credit card</option><option value="wire">Wire</option></select></Field><Field label="Reference"><input value={form.referenceNumber} onChange={update('referenceNumber')} /></Field></FormSection><FormSection title="Notes"><Field label="Notes"><textarea value={form.notes} onChange={update('notes')} /></Field></FormSection></FormCard>;
}

function CheckForm({ vendors, bills, submitAction, message }) {
  const [form, setForm] = useState({ vendorId: '', billId: '', payeeName: '', checkNumber: '', checkDate: today(), amount: '', memo: '' });
  const selectedBill = bills.find((bill) => String(bill.id) === String(form.billId));
  async function submit(event) { event.preventDefault(); await submitAction('/api/accounting/checks', { ...form, vendorId: numberOrNull(form.vendorId || selectedBill?.vendor_id), billId: numberOrNull(form.billId), amount: numberOrNull(form.amount) || 0 }, 'Check drafted.'); setForm({ vendorId: '', billId: '', payeeName: '', checkNumber: '', checkDate: today(), amount: '', memo: '' }); }
  return <FormCard title="Write check" description="Draft a check. Printing/approval stays tracked." onSubmit={submit} submitLabel="Draft check" busy={message.busy}><FormSection title="Check card"><Field label="Vendor"><select value={form.vendorId} onChange={(e) => setForm({ ...form, vendorId: e.target.value })}><option value="">Select vendor</option>{vendors.map((vendor) => <option key={vendor.id} value={vendor.id}>{vendor.vendor_name}</option>)}</select></Field><Field label="Bill"><select value={form.billId} onChange={(event) => { const bill = bills.find((item) => String(item.id) === event.target.value); setForm((current) => ({ ...current, billId: event.target.value, vendorId: bill?.vendor_id || current.vendorId, payeeName: bill?.vendor_name || current.payeeName, amount: bill?.balance_due || current.amount })); }}><option value="">Select bill</option>{bills.filter((bill) => Number(bill.balance_due || bill.total || 0) > 0).map((bill) => <option key={bill.id} value={bill.id}>{bill.bill_number} · {bill.vendor_name || 'Vendor'} · {money(bill.balance_due || bill.total)}</option>)}</select></Field><Field label="Payee"><input value={form.payeeName} onChange={(e) => setForm({ ...form, payeeName: e.target.value })} required /></Field><Field label="Amount"><input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required /></Field><Field label="Memo"><textarea value={form.memo} onChange={(e) => setForm({ ...form, memo: e.target.value })} /></Field></FormSection></FormCard>;
}

function BankingView({ payments, summary, openSection }) {
  const mockSuggestions = [['Bank deposit', 'Match incoming deposit to open invoice', 'AI suggestion'], ['Debit card charge', 'Route vendor charge to Material Costs or G&A', 'Needs approval'], ['ACH payment', 'Match outgoing payment to vendor bill', 'Ready']];
  return <section className="accounting-focus-grid"><article className="feature panel large"><p className="eyebrow">AI-assisted bookkeeping</p><h2>Review, approve, done</h2><p>Bank accounts and debit cards feed this room. Naroa runners suggest customer, vendor, invoice, bill, project, and ledger account. The user approves instead of doing bookkeeping from scratch.</p><div className="accounting-actions-list"><button>Connect bank account</button><button>Add debit card</button><button>Run AI bookkeeping review</button><button>Approve high-confidence matches</button></div></article><article className="feature panel"><h2>Bookkeeping runner rules</h2><div className="accounting-steps"><div className="accounting-step"><b>1</b><span>Import bank and debit card transactions.</span></div><div className="accounting-step"><b>2</b><span>AI suggests match, category, project, and account.</span></div><div className="accounting-step"><b>3</b><span>Human approves or edits.</span></div><div className="accounting-step"><b>4</b><span>System posts and records proof.</span></div></div></article><TableCard title="Bookkeeping review queue" rows={mockSuggestions.map(([a,b,c], index) => ({ id: index + 1, invoice_number: a, description: b, status: c }))} emptyLabel="No bank transactions need review." /><TableCard title="Recent cash activity" rows={payments} emptyLabel="No payments yet." /><article className="feature panel"><h2>Banking snapshot</h2><div className="accounting-stat-grid mini"><StatCard label="Cash in MTD" value={money(summary.cash_received_mtd)} detail="Customer deposits" /><StatCard label="Cash out MTD" value={money(summary.cash_paid_mtd)} detail="Vendor payments / card charges" /></div><button onClick={() => openSection('reports')}>View cash report</button></article></section>;
}

function TodayView({ summary, invoices, bills, payments, checks, openSection }) {
  const overdueInvoices = invoices.filter((invoice) => invoice.due_date && new Date(invoice.due_date) < new Date() && Number(invoice.balance_due || 0) > 0);
  const openBills = bills.filter((bill) => Number(bill.balance_due || 0) > 0);
  return <><section className="accounting-stat-grid"><StatCard label="Who owes us" value={money(summary.ar_open)} detail={`${summary.open_invoice_count || 0} open invoices`} /><StatCard label="Who we owe" value={money(summary.ap_open)} detail={`${summary.open_bill_count || 0} open bills`} /><StatCard label="Needs review" value={overdueInvoices.length + openBills.length} detail="Invoices or bills needing attention" /><StatCard label="Checks" value={checks.length} detail="Drafted or printed" /></section><section className="accounting-workspace-grid"><ActionCard title="Money In" text="Create invoices, record customer payments, and see who owes us." onClick={() => openSection('money-in')} /><ActionCard title="Money Out" text="Enter bills, write checks, and see who we owe." onClick={() => openSection('money-out')} /><ActionCard title="Banking + Cards" text="Review bank feed, debit cards, and AI bookkeeping suggestions." onClick={() => openSection('banking')} /><ActionCard title="Projects" text="See billed, collected, costs, and margin." onClick={() => openSection('projects')} /></section><section className="accounting-data-grid"><TableCard title="Unpaid invoices" rows={invoices.slice(0, 6)} emptyLabel="No invoices yet." /><TableCard title="Unpaid bills" rows={bills.slice(0, 6)} emptyLabel="No bills yet." /><TableCard title="Recent payments" rows={payments.slice(0, 6)} emptyLabel="No payments yet." /></section></>;
}

function MoneyInView({ customers, invoices, submitAction, message, openSection, invoiceSettings, setInvoiceSettings, taxSettings }) { return <section className="accounting-focus-grid"><article className="feature panel large"><h2>Money In</h2><p>Simple question: who owes us, what needs invoiced, and who paid?</p><div className="accounting-actions-list"><button onClick={() => openSection('setup')}>Invoice number + tax setup</button><button onClick={() => openSection('banking')}>Review deposits</button><button onClick={() => openSection('reports')}>AR report</button></div></article><InvoiceForm customers={customers} submitAction={submitAction} message={message} invoiceSettings={invoiceSettings} setInvoiceSettings={setInvoiceSettings} taxSettings={taxSettings} /><CustomerForm submitAction={submitAction} message={message} /><TableCard title="Customer invoices" rows={invoices} emptyLabel="No invoices yet." /></section>; }
function MoneyOutView({ vendors, bills, checks, submitAction, message, markCheckPrinted, openSection }) { return <section className="accounting-focus-grid"><article className="feature panel large"><h2>Money Out</h2><p>Simple question: who do we owe, what needs approval, and what needs paid?</p><div className="accounting-actions-list"><button onClick={() => openSection('banking')}>Review card charges</button><button onClick={() => openSection('reports')}>AP report</button></div></article><BillForm vendors={vendors} submitAction={submitAction} message={message} /><PaymentForm invoices={[]} bills={bills} submitAction={submitAction} message={message} /><CheckForm vendors={vendors} bills={bills} submitAction={submitAction} message={message} /><VendorForm submitAction={submitAction} message={message} /><TableCard title="Vendor bills" rows={bills} emptyLabel="No bills yet." /><TableCard title="Checks" rows={checks} emptyLabel="No checks written yet." actions={(check) => check.status === 'printed' ? null : <button type="button" onClick={() => markCheckPrinted(check.id)}>Mark printed</button>} /></section>; }
function ProjectView({ invoices, bills }) { const billed = invoices.reduce((s, i) => s + Number(i.total || 0), 0); const collected = invoices.reduce((s, i) => s + Number(i.total || 0) - Number(i.balance_due || 0), 0); const cost = bills.reduce((s, b) => s + Number(b.total || 0), 0); return <section className="accounting-focus-grid"><article className="feature panel large"><h2>Projects</h2><p>Simple question: are we making money on the job?</p><div className="accounting-stat-grid mini"><StatCard label="Billed" value={money(billed)} detail="Invoice total" /><StatCard label="Collected" value={money(collected)} detail="Paid invoices" /><StatCard label="Costs" value={money(cost)} detail="Vendor bills" /><StatCard label="Margin" value={money(collected - cost)} detail="Collected minus costs" /></div></article><TableCard title="Project invoices" rows={invoices} emptyLabel="No project invoices yet." /><TableCard title="Project bills" rows={bills} emptyLabel="No project bills yet." /></section>; }
function ReportsView({ summary, invoices, bills, payments, checks }) { return <section className="accounting-focus-grid"><article className="feature panel large"><h2>Reports</h2><p>Owner-ready reports without burying the user in accounting menus.</p><div className="accounting-stat-grid mini"><StatCard label="Money owed to us" value={money(summary.ar_open)} detail="AR" /><StatCard label="Money we owe" value={money(summary.ap_open)} detail="AP" /><StatCard label="Cash in MTD" value={money(summary.cash_received_mtd)} detail="Deposits" /><StatCard label="Cash out MTD" value={money(summary.cash_paid_mtd)} detail="Payments/cards" /></div></article><TableCard title="Invoices" rows={invoices} emptyLabel="No invoices yet." /><TableCard title="Bills" rows={bills} emptyLabel="No bills yet." /><TableCard title="Payments" rows={payments} emptyLabel="No payments yet." /><TableCard title="Checks" rows={checks} emptyLabel="No checks yet." /></section>; }
function SetupView({ customers, vendors, accounts, submitAction, message, status, invoiceSettings, setInvoiceSettings, taxSettings, setTaxSettings }) { return <section className="accounting-focus-grid"><InvoiceNumberSettings settings={invoiceSettings} setSettings={setInvoiceSettings} /><TaxSettings settings={taxSettings} setSettings={setTaxSettings} /><CustomerForm submitAction={submitAction} message={message} /><VendorForm submitAction={submitAction} message={message} /><TableCard title="Customers" rows={customers} emptyLabel="No customers yet." /><TableCard title="Vendors" rows={vendors} emptyLabel="No vendors yet." /><TableCard title="Chart of accounts" rows={accounts} emptyLabel="No ledger accounts found." /><article className="feature panel"><h2>Advanced setup</h2><p>Chart of accounts, periods, numbering, and proof linkage stay here so normal users are not forced through them.</p><pre className="accounting-json-preview">{JSON.stringify(status.infrastructure || {}, null, 2)}</pre></article></section>; }

function SectionView(props) {
  const { activeSection, summary, customers, vendors, invoices, bills, payments, checks, accounts, status, openSection, submitAction, message, markCheckPrinted, invoiceSettings, setInvoiceSettings, taxSettings, setTaxSettings } = props;
  if (activeSection === 'today') return <TodayView summary={summary} invoices={invoices} bills={bills} payments={payments} checks={checks} openSection={openSection} />;
  if (activeSection === 'money-in') return <MoneyInView customers={customers} invoices={invoices} submitAction={submitAction} message={message} openSection={openSection} invoiceSettings={invoiceSettings} setInvoiceSettings={setInvoiceSettings} taxSettings={taxSettings} />;
  if (activeSection === 'money-out') return <MoneyOutView vendors={vendors} bills={bills} checks={checks} submitAction={submitAction} message={message} markCheckPrinted={markCheckPrinted} openSection={openSection} />;
  if (activeSection === 'banking') return <BankingView payments={payments} summary={summary} openSection={openSection} />;
  if (activeSection === 'projects') return <ProjectView invoices={invoices} bills={bills} />;
  if (activeSection === 'reports') return <ReportsView summary={summary} invoices={invoices} bills={bills} payments={payments} checks={checks} />;
  return <SetupView customers={customers} vendors={vendors} accounts={accounts} submitAction={submitAction} message={message} status={status} invoiceSettings={invoiceSettings} setInvoiceSettings={setInvoiceSettings} taxSettings={taxSettings} setTaxSettings={setTaxSettings} />;
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
  const [message, setMessage] = useState({ text: '', type: '', busy: false });
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState(sectionFromPath);
  const [invoiceSettings, setInvoiceSettings] = useState(() => loadJson(invoiceSettingsKey, defaultInvoiceSettings));
  const [taxSettings, setTaxSettings] = useState(() => loadJson(taxSettingsKey, defaultTaxSettings));

  function openSection(section) { const safe = validSections.has(section) ? section : defaultSection; history.pushState({}, '', accountingUrl(safe)); setActiveSection(safe); window.dispatchEvent(new PopStateEvent('popstate')); }
  async function loadData() {
    const [statusRes, accountRes, customerRes, vendorRes, invoiceRes, billRes, paymentRes, checkRes] = await Promise.all([fetch('/api/accounting/status'), fetch('/api/accounting/accounts'), fetch('/api/accounting/customers'), fetch('/api/accounting/vendors'), fetch('/api/accounting/invoices'), fetch('/api/accounting/bills'), fetch('/api/accounting/payments'), fetch('/api/accounting/checks')]);
    const [statusJson, accountJson, customerJson, vendorJson, invoiceJson, billJson, paymentJson, checkJson] = await Promise.all([statusRes.json(), accountRes.json(), customerRes.json(), vendorRes.json(), invoiceRes.json(), billRes.json(), paymentRes.json(), checkRes.json()]);
    setStatus(statusJson.ok ? statusJson : { summary: fallbackSummary, tables: [], ok: false });
    setAccounts(accountJson.accounts || []); setCustomers(customerJson.customers || []); setVendors(vendorJson.vendors || []); setInvoices(invoiceJson.invoices || []); setBills(billJson.bills || []); setPayments(paymentJson.payments || []); setChecks(checkJson.checks || []);
  }
  async function submitAction(url, payload, successText) { setMessage({ text: '', type: '', busy: true }); try { const result = await apiPost(url, payload); await loadData(); setMessage({ text: successText, type: 'success', busy: false }); return result; } catch (err) { setMessage({ text: err.message || 'Accounting action failed.', type: 'error', busy: false }); return null; } }
  async function markCheckPrinted(checkId) { await submitAction(`/api/accounting/checks/${checkId}/print`, { status: 'printed' }, 'Check marked printed.'); }

  useEffect(() => { const sync = () => setActiveSection(sectionFromPath()); window.addEventListener('popstate', sync); return () => window.removeEventListener('popstate', sync); }, []);
  useEffect(() => { let alive = true; loadData().catch((err) => { if (alive) setError(err.message || 'Accounting data could not be loaded.'); }); return () => { alive = false; }; }, []);

  const summary = status.summary || fallbackSummary;
  const activeMeta = useMemo(() => sectionMeta(activeSection), [activeSection]);
  return <><AccountingNav activeSection={activeSection} openSection={openSection} /><header className="workspace-header panel accounting-subroom-header"><div><p className="eyebrow">Simple accounting</p><h1>{activeMeta[1]}</h1><p>{activeMeta[2]}</p></div><div className="live-badge">{accountingUrl(activeSection)}</div></header>{error && <div className="notice">{error}</div>}{message.text && <div className="notice">{message.text}</div>}<SectionView activeSection={activeSection} summary={summary} customers={customers} vendors={vendors} invoices={invoices} bills={bills} payments={payments} checks={checks} accounts={accounts} status={status} openSection={openSection} submitAction={submitAction} message={message} markCheckPrinted={markCheckPrinted} invoiceSettings={invoiceSettings} setInvoiceSettings={setInvoiceSettings} taxSettings={taxSettings} setTaxSettings={setTaxSettings} /></>;
}
