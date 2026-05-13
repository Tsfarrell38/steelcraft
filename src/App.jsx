import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const topPortals = [
  {
    id: 'admin',
    title: 'Admin Portal',
    audience: 'Owner / system admin',
    purpose: 'Users, roles, permissions, database status, integrations, schema setup, audit controls, and global settings.'
  },
  {
    id: 'employee',
    title: 'Employee Portal',
    audience: 'Internal team',
    purpose: 'Internal operations for sales, estimating, projects, planning, HR, accounts, contacts, and erection schedule.'
  },
  {
    id: 'accounting',
    title: 'Accounting Portal',
    audience: 'Accounting / finance team',
    purpose: 'Full financial control center for billing, insurance, POs, invoices, SOV, payments, AR, AP, and reporting.'
  },
  {
    id: 'vendor',
    title: 'Vendor Portal',
    audience: 'Outside vendors',
    purpose: 'External vendor access for assigned project packages, PO visibility, due dates, uploads, and packet status.'
  },
  {
    id: 'customer',
    title: 'Customer Portal',
    audience: 'Outside customers',
    purpose: 'External customer access for approved project status, documents, quotes, contracts, change orders, payments, and approvals.'
  }
];

const employeeModules = [
  ['sales', 'Sales & Estimating', 'Estimate intake, scope builder, cost build, margin review, quote generator, and project checklist.'],
  ['projects', 'Project Portal', 'Contracted jobs, engineering, material, fabrication, delivery, erection, punch, and closeout.'],
  ['planning', 'Planning Portal', 'Internal job readiness, handoffs, production planning, field readiness, and schedule blockers.'],
  ['hr', 'HR Portal', 'Salary employee records, PTO, handbook, HR support, onboarding, and training modules. No time clock.'],
  ['accounts', 'Accounts', 'Customer, vendor, contractor, and company account records. Financial transactions live in Accounting.'],
  ['contacts', 'Contacts', 'People tied to customers, vendors, contractors, internal teams, jobs, and estimates.'],
  ['erection', 'Erection Schedule', 'Crew planning, erection dates, field readiness, milestones, and schedule conflicts.']
];

const accountingModules = [
  ['Billing', 'Invoices, deposits, draws, billing status, and collection visibility.'],
  ['Insurance', 'COIs, insurance requirements, expiration tracking, and compliance checks.'],
  ['Purchase Orders / POs', 'PO creation, vendor assignment, approvals, due dates, and internal PO management.'],
  ['Accounts Receivable', 'Customer invoices, open balances, payments received, aging, and follow-up.'],
  ['Accounts Payable', 'Vendor bills, subcontractor invoices, approvals, due dates, and payments.'],
  ['Schedule of Values', 'Material SOV, labor SOV, draw schedule, progress billing, and contract values.'],
  ['Change Order Billing', 'Approved change orders, pending billing, margin impact, and billing status.'],
  ['Financial Reports', 'Revenue, cost, margin, open AR/AP, project financial health, and exports.']
];

const brandDefaults = {
  tenantName: 'New Customer',
  platformName: 'White Label Operations Portal',
  primaryColor: '#172033',
  accentColor: '#bb2e2e',
  loadSteelCraftData: false,
  loadMondayBoards: false,
  loadExcelWorkbook: false
};

function Badge({ children }) {
  return <span className="badge">{children}</span>;
}

function Card({ children, className = '' }) {
  return <section className={`card ${className}`}>{children}</section>;
}

function PortalCard({ portal, activePortal, setActivePortal }) {
  return (
    <article className="portal-card">
      <Badge>{portal.audience}</Badge>
      <h3>{portal.title}</h3>
      <p>{portal.purpose}</p>
      <button onClick={() => setActivePortal(portal.id)} className={activePortal === portal.id ? 'active' : ''}>
        Open {portal.title}
      </button>
    </article>
  );
}

function AuthLanding({ onEnter }) {
  return (
    <main className="auth-shell">
      <section className="auth-card">
        <Badge>Authentication page</Badge>
        <h1>Steel Craft Operations Portal</h1>
        <p>
          This is the outside login gateway. After authentication, users are routed into one of five portals:
          Admin, Employee, Accounting, Vendor, or Customer.
        </p>
        <div className="portal-grid">
          {topPortals.map((portal) => <PortalCard key={portal.id} portal={portal} activePortal="" setActivePortal={() => onEnter(portal.id)} />)}
        </div>
      </section>
    </main>
  );
}

function PortalTabs({ activePortal, setActivePortal }) {
  return (
    <nav className="portal-tabs">
      {topPortals.map((portal) => (
        <button key={portal.id} className={activePortal === portal.id ? 'active' : ''} onClick={() => setActivePortal(portal.id)}>
          {portal.title}
        </button>
      ))}
    </nav>
  );
}

function AdminPortal() {
  return (
    <Card>
      <Badge>Admin Portal</Badge>
      <h2>System control center</h2>
      <p>Admin owns users, roles, permissions, integrations, schema setup, audit logs, database status, and global settings.</p>
      <div className="module-grid">
        {['User management', 'Role and portal access', 'Database/schema setup', 'Monday integration', 'File storage', 'Audit logs', 'Workflow rules', 'Tenant settings'].map((item) => (
          <article className="module" key={item}><h3>{item}</h3><p>Admin-only configuration area.</p></article>
        ))}
      </div>
    </Card>
  );
}

function EmployeePortal() {
  const [activeModule, setActiveModule] = useState('sales');
  const current = employeeModules.find(([id]) => id === activeModule) || employeeModules[0];
  return (
    <>
      <Card>
        <Badge>Employee Portal</Badge>
        <h2>Internal operating portal</h2>
        <p>Sales & Estimating, Project Portal, Planning, HR, Accounts, Contacts, and Erection Schedule live here. Financial control lives in Accounting.</p>
      </Card>
      <nav className="module-tabs">
        {employeeModules.map(([id, title]) => <button key={id} className={activeModule === id ? 'active' : ''} onClick={() => setActiveModule(id)}>{title}</button>)}
      </nav>
      <Card>
        <Badge>Employee module</Badge>
        <h2>{current[1]}</h2>
        <p>{current[2]}</p>
        {activeModule === 'hr' && <div className="notice">HR is for salary employees only: PTO, handbook, HR support, onboarding, and training. No time clock.</div>}
        {activeModule === 'planning' && <div className="notice">Planning is internal job readiness. Billing, insurance, and POs have moved to Accounting.</div>}
      </Card>
    </>
  );
}

function AccountingPortal() {
  return (
    <Card>
      <Badge>Accounting Portal</Badge>
      <h2>Full financial control center</h2>
      <p>Accounting is a top-level portal. Billing, insurance, POs, AR, AP, SOV, change order billing, and financial reporting live here.</p>
      <div className="module-grid accounting-grid">
        {accountingModules.map(([title, detail]) => <article className="module" key={title}><h3>{title}</h3><p>{detail}</p></article>)}
      </div>
    </Card>
  );
}

function ExternalPortal({ type }) {
  const vendor = type === 'Vendor';
  return (
    <Card>
      <Badge>{type} Portal</Badge>
      <h2>{type} access stays outside Employee</h2>
      <p>{vendor ? 'Vendors only see assigned project packages, relevant PO visibility, due dates, upload slots, and vendor packet status.' : 'Customers only see approved project status, customer-facing documents, quotes, contracts, change orders, payments, approvals, and uploads.'}</p>
    </Card>
  );
}

function BrandControls() {
  const [brand, setBrand] = useState(() => {
    try { return JSON.parse(localStorage.getItem('steelcraft_brand_controls_v1')) || brandDefaults; } catch { return brandDefaults; }
  });
  function update(field, value) {
    const next = { ...brand, [field]: value };
    setBrand(next);
    localStorage.setItem('steelcraft_brand_controls_v1', JSON.stringify(next));
  }
  return (
    <main className="app-shell">
      <header className="hero">
        <div><Badge>Hidden /brand controls</Badge><h1>White-label brand controls</h1><p>Hidden operator setup for clean customer templates. This is not linked from customer-facing navigation.</p></div>
        <aside className="hero-panel"><span>Tenant preview</span><strong>{brand.tenantName}</strong><small>{brand.platformName}</small></aside>
      </header>
      <div className="two-column">
        <Card><h2>Main controls</h2><label>Tenant name<input value={brand.tenantName} onChange={(e) => update('tenantName', e.target.value)} /></label><label>Platform name<input value={brand.platformName} onChange={(e) => update('platformName', e.target.value)} /></label><label>Primary color<input type="color" value={brand.primaryColor} onChange={(e) => update('primaryColor', e.target.value)} /></label><label>Accent color<input type="color" value={brand.accentColor} onChange={(e) => update('accentColor', e.target.value)} /></label></Card>
        <Card><h2>Clean new-customer rules</h2><label><input type="checkbox" checked={brand.loadSteelCraftData} onChange={(e) => update('loadSteelCraftData', e.target.checked)} /> Load Steel Craft records</label><label><input type="checkbox" checked={brand.loadMondayBoards} onChange={(e) => update('loadMondayBoards', e.target.checked)} /> Load Steel Craft Monday boards</label><label><input type="checkbox" checked={brand.loadExcelWorkbook} onChange={(e) => update('loadExcelWorkbook', e.target.checked)} /> Load Steel Craft Excel workbook data</label><div className="notice">Default for new customers: five-portal structure only. No Steel Craft data.</div></Card>
      </div>
    </main>
  );
}

function App() {
  const isBrandRoute = window.location.pathname.replace(/\/$/, '') === '/brand';
  const [authenticated, setAuthenticated] = useState(false);
  const [activePortal, setActivePortal] = useState('employee');

  if (isBrandRoute) return <BrandControls />;
  if (!authenticated) return <AuthLanding onEnter={(portalId) => { setActivePortal(portalId); setAuthenticated(true); }} />;

  return (
    <main className="app-shell">
      <header className="hero">
        <div><Badge>Five-portal architecture</Badge><h1>Steel Craft Portal Gateway</h1><p>Authenticated entry into five portals: Admin, Employee, Accounting, Vendor, and Customer.</p></div>
        <aside className="hero-panel"><span>Signed in view</span><strong>{topPortals.find((portal) => portal.id === activePortal)?.title}</strong><small>Architecture corrected on staging branch</small></aside>
      </header>
      <PortalTabs activePortal={activePortal} setActivePortal={setActivePortal} />
      {activePortal === 'admin' && <AdminPortal />}
      {activePortal === 'employee' && <EmployeePortal />}
      {activePortal === 'accounting' && <AccountingPortal />}
      {activePortal === 'vendor' && <ExternalPortal type="Vendor" />}
      {activePortal === 'customer' && <ExternalPortal type="Customer" />}
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
