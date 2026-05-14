import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const topPortals = [
  ['admin', 'Admin', 'System control center', 'Users, roles, permissions, database status, integrations, schema setup, audit controls, and global settings.'],
  ['employee', 'Employee Portal', 'Internal operations', 'Sales, estimating, projects, planning, HR, accounts, contacts, and erection schedule.'],
  ['accounting', 'Accounting Portal', 'Financial control', 'Billing, insurance, POs, invoices, SOV, payments, AR, AP, and reporting.'],
  ['vendor', 'Vendor Portal', 'Outside vendors', 'Assigned project packages, PO visibility, due dates, uploads, and packet status.'],
  ['customer', 'Customer Portal', 'Outside customers', 'Approved project status, documents, quotes, contracts, change orders, payments, and approvals.']
];

const demoRoles = [
  {
    id: 'admin-owner',
    name: 'Admin / Owner',
    description: 'Full system access. Admin users see every portal and manage permissions.',
    portals: ['admin', 'employee', 'accounting', 'vendor', 'customer']
  },
  {
    id: 'accounting',
    name: 'Accounting',
    description: 'Accounting staff can work internally and manage financial workflows.',
    portals: ['employee', 'accounting']
  },
  {
    id: 'purchasing',
    name: 'Purchasing',
    description: 'Purchasing can work internally, manage accounting/PO workflows, and see vendor access.',
    portals: ['employee', 'accounting', 'vendor']
  },
  {
    id: 'project-manager',
    name: 'Project Manager',
    description: 'Project managers work internally and may access customer-facing project views.',
    portals: ['employee', 'customer']
  },
  {
    id: 'employee',
    name: 'Employee',
    description: 'Standard internal employee access.',
    portals: ['employee']
  },
  {
    id: 'vendor',
    name: 'Vendor User',
    description: 'External vendor access only.',
    portals: ['vendor']
  },
  {
    id: 'customer',
    name: 'Customer User',
    description: 'External customer access only.',
    portals: ['customer']
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
  tenantName: 'Steel Craft',
  platformName: 'Operations Portal',
  logoText: 'Steel Craft',
  logoSubtext: 'Operations Portal',
  primaryColor: '#0f1014',
  accentColor: '#9f3d42',
  panelColor: '#151519',
  loadSteelCraftData: false,
  loadMondayBoards: false,
  loadExcelWorkbook: false
};

function loadBrand() {
  try {
    return { ...brandDefaults, ...(JSON.parse(localStorage.getItem('steelcraft_brand_controls_v1')) || {}) };
  } catch {
    return brandDefaults;
  }
}

function saveBrand(next) {
  localStorage.setItem('steelcraft_brand_controls_v1', JSON.stringify(next));
}

function brandStyle(brand) {
  return {
    '--brand-primary': brand.primaryColor,
    '--brand-accent': brand.accentColor,
    '--brand-panel': brand.panelColor
  };
}

function portalMeta(id) {
  return topPortals.find(([portalId]) => portalId === id) || topPortals[0];
}

function BrandMark({ brand }) {
  return (
    <div className="brand">
      <div className="mark"><span>S</span><span className="beam">C</span><span>B</span></div>
      <div><strong>{brand.logoText}</strong><small>{brand.logoSubtext}</small></div>
    </div>
  );
}

function IconBox({ children }) {
  return <div className="icon-box">{children}</div>;
}

function StatusCard({ label, value, detail }) {
  return (
    <article className="stat-card panel">
      <IconBox>▣</IconBox>
      <strong>{value}</strong>
      <span>{label}</span>
      <small>{detail}</small>
    </article>
  );
}

function Shell({ brand, activePortal, setActivePortal, user, signOut, children }) {
  const allowedPortals = topPortals.filter(([id]) => user.portals.includes(id));
  return (
    <main className="dashboard" style={brandStyle(brand)}>
      <aside className="side panel">
        <BrandMark brand={brand} />
        <p className="side-label">{brand.tenantName}</p>
        <div className="side-meta">
          <span>Signed in as</span>
          <strong>{user.name}</strong>
          <small>{user.portals.length} portal{user.portals.length === 1 ? '' : 's'} available</small>
        </div>
        {allowedPortals.map(([id, title]) => (
          <button key={id} className={id === activePortal ? 'active' : ''} onClick={() => setActivePortal(id)}>
            <span className="nav-dot">▦</span>{title}
          </button>
        ))}
        <div className="side-footer">
          <span>White-label controls</span>
          <a href="/brand">/brand</a>
          <button className="sign-out" onClick={signOut}>Sign out</button>
        </div>
      </aside>
      <section className="workspace">{children}</section>
    </main>
  );
}

function WorkspaceHeader({ eyebrow, title, description, badge = 'Backend connected' }) {
  return (
    <header className="workspace-header panel">
      <div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p></div>
      <div className="live-badge">♢ {badge}</div>
    </header>
  );
}

function AdminPortal() {
  return (
    <>
      <WorkspaceHeader eyebrow="Steel Craft admin" title="Admin Panel" description="System controls for users, roles, permissions, database setup, integrations, workflow mapping, and portal foundation." />
      <div className="stats-grid">
        <StatusCard label="Database" value="connected" detail="Ready" />
        <StatusCard label="Portal Shell" value="5 portals" detail="Admin, Employee, Accounting, Vendor, Customer" />
        <StatusCard label="Role Access" value="active" detail="Portal visibility by role" />
        <StatusCard label="Storage" value="not set" detail="Needs attention" />
      </div>
      <div className="workspace-grid">
        <article className="feature panel large"><p className="eyebrow">Admin controls</p><h2>Role-based portal access</h2><p>Admins assign which portals each role can see. A user can have one portal, several portals, or all five portals.</p><div className="pill-row"><span>User management</span><span>Role access</span><span>Portal permissions</span><span>Integrations</span></div></article>
        <RecordList title="Example access rules" rows={demoRoles.map((role) => [role.name, role.description, role.portals.map((id) => portalMeta(id)[1]).join(', ')])} />
      </div>
    </>
  );
}

function EmployeePortal() {
  const [activeModule, setActiveModule] = useState('sales');
  const current = employeeModules.find(([id]) => id === activeModule) || employeeModules[0];
  return (
    <>
      <WorkspaceHeader eyebrow="Internal operations" title="Employee Portal" description="Internal Steel Craft workspace for sales, estimating, projects, planning, HR, accounts, contacts, and erection schedule." />
      <div className="tab-row">{employeeModules.map(([id, title]) => <button key={id} className={activeModule === id ? 'active' : ''} onClick={() => setActiveModule(id)}>{title}</button>)}</div>
      <div className="workspace-grid">
        <article className="feature panel large"><p className="eyebrow">Employee module</p><h2>{current[1]}</h2><p>{current[2]}</p>{activeModule === 'hr' && <div className="notice">No time clock. HR is for salary employees: PTO, handbook, support, onboarding, and training.</div>}{activeModule === 'planning' && <div className="notice">Planning is job readiness only. Billing, insurance, and POs live in Accounting.</div>}</article>
        <RecordList title="Employee portal map" rows={employeeModules.map(([, title, detail]) => [title, detail, 'Employee'])} />
      </div>
    </>
  );
}

function AccountingPortal() {
  return (
    <>
      <WorkspaceHeader eyebrow="Financial control" title="Accounting Portal" description="Full accounting center for billing, insurance, POs, AR, AP, SOV, change order billing, project financial health, and reporting." />
      <div className="stats-grid">
        <StatusCard label="Billing" value="ready" detail="Invoices, draws, deposits" />
        <StatusCard label="Purchase Orders" value="inside" detail="Accounting portal" />
        <StatusCard label="Insurance" value="tracked" detail="COIs and expirations" />
        <StatusCard label="Reports" value="planned" detail="Financial exports" />
      </div>
      <RecordList title="Accounting modules" rows={accountingModules.map(([title, detail]) => [title, detail, 'Accounting'])} />
    </>
  );
}

function ExternalPortal({ type }) {
  const vendor = type === 'Vendor';
  return (
    <>
      <WorkspaceHeader eyebrow={`${type} access`} title={`${type} Portal`} description={vendor ? 'External vendor access for assigned project packages, relevant PO visibility, due dates, upload slots, and packet status.' : 'External customer access for approved project status, documents, quotes, contracts, change orders, payments, approvals, and uploads.'} badge="External access" />
      <div className="workspace-grid"><article className="feature panel large"><p className="eyebrow">Outside portal</p><h2>{type} workspace</h2><p>{vendor ? 'Vendors stay outside the employee portal and only see assigned package information.' : 'Customers stay outside the employee portal and only see approved customer-facing information.'}</p></article><RecordList title="Visible areas" rows={vendor ? [['Assigned packages', 'Project/vendor packet details', 'Vendor'], ['PO visibility', 'Vendor-facing PO details only', 'Limited'], ['Uploads', 'Submittals, packets, and documents', 'Vendor']] : [['Project status', 'Approved customer-facing status', 'Customer'], ['Documents', 'Approved documents and contracts', 'Customer'], ['Approvals', 'Customer approvals and uploads', 'Customer']]} /></div>
    </>
  );
}

function RecordList({ title, rows }) {
  return <article className="feature panel"><h2>{title}</h2><div className="data-rows">{rows.map(([name, detail, status]) => <div className="data-row" key={name}><div><strong>{name}</strong><span>{detail}</span></div><b>{status}</b></div>)}</div></article>;
}

function AuthLanding({ brand, onSignIn }) {
  const [selectedRoleId, setSelectedRoleId] = useState('admin-owner');
  const selectedRole = demoRoles.find((role) => role.id === selectedRoleId) || demoRoles[0];
  return (
    <main className="landing-dark" style={brandStyle(brand)}>
      <section className="landing-card panel auth-layout">
        <div className="auth-copy">
          <BrandMark brand={brand} />
          <p className="eyebrow">Authentication page</p>
          <h1>{brand.logoText} Operations Portal</h1>
          <p>This link comes from the finished website. Users authenticate here first, then the app routes them into the portal access assigned to their role.</p>
          <div className="selected-access">
            <span>Selected role</span>
            <strong>{selectedRole.name}</strong>
            <small>{selectedRole.portals.map((id) => portalMeta(id)[1]).join(' · ')}</small>
          </div>
          <button className="auth-submit" onClick={() => onSignIn(selectedRole)}>Sign in and route by role</button>
        </div>
        <div className="role-panel">
          <p className="eyebrow">Demo role selector</p>
          <h2>Portal access is admin-controlled</h2>
          <div className="role-list">
            {demoRoles.map((role) => (
              <button key={role.id} className={selectedRoleId === role.id ? 'active' : ''} onClick={() => setSelectedRoleId(role.id)}>
                <strong>{role.name}</strong>
                <span>{role.description}</span>
                <small>{role.portals.map((id) => portalMeta(id)[1]).join(' · ')}</small>
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function BrandControls() {
  const [brand, setBrand] = useState(loadBrand);
  function update(field, value) {
    const next = { ...brand, [field]: value };
    setBrand(next);
    saveBrand(next);
  }
  function reset() {
    setBrand(brandDefaults);
    saveBrand(brandDefaults);
  }
  return (
    <main className="dashboard brand-controls" style={brandStyle(brand)}>
      <section className="workspace solo">
        <WorkspaceHeader eyebrow="Hidden /brand controls" title="White-label Brand Controls" description="Operator-only controls for brand appearance and clean customer templates. This route is not linked from normal customer navigation." badge="Hidden route" />
        <div className="workspace-grid">
          <article className="feature panel"><h2>Main brand controls</h2><label>Tenant name<input value={brand.tenantName} onChange={(e) => update('tenantName', e.target.value)} /></label><label>Logo text<input value={brand.logoText} onChange={(e) => update('logoText', e.target.value)} /></label><label>Logo subtext<input value={brand.logoSubtext} onChange={(e) => update('logoSubtext', e.target.value)} /></label><label>Platform name<input value={brand.platformName} onChange={(e) => update('platformName', e.target.value)} /></label></article>
          <article className="feature panel"><h2>Theme and data rules</h2><label>Primary color<input type="color" value={brand.primaryColor} onChange={(e) => update('primaryColor', e.target.value)} /></label><label>Accent color<input type="color" value={brand.accentColor} onChange={(e) => update('accentColor', e.target.value)} /></label><label>Panel color<input type="color" value={brand.panelColor} onChange={(e) => update('panelColor', e.target.value)} /></label><label className="check-row"><input type="checkbox" checked={brand.loadSteelCraftData} onChange={(e) => update('loadSteelCraftData', e.target.checked)} /> Load Steel Craft records</label><label className="check-row"><input type="checkbox" checked={brand.loadMondayBoards} onChange={(e) => update('loadMondayBoards', e.target.checked)} /> Load Steel Craft Monday boards</label><label className="check-row"><input type="checkbox" checked={brand.loadExcelWorkbook} onChange={(e) => update('loadExcelWorkbook', e.target.checked)} /> Load Steel Craft Excel workbook data</label><div className="notice">Default for new customers: structure only, no Steel Craft data.</div><button onClick={reset}>Reset Steel Craft defaults</button></article>
        </div>
      </section>
    </main>
  );
}

function App() {
  const isBrandRoute = window.location.pathname.replace(/\/$/, '') === '/brand';
  const [user, setUser] = useState(null);
  const [activePortal, setActivePortal] = useState('admin');
  const brand = useMemo(loadBrand, []);

  function signIn(role) {
    setUser(role);
    setActivePortal(role.portals[0]);
  }

  function signOut() {
    setUser(null);
    setActivePortal('admin');
  }

  if (isBrandRoute) return <BrandControls />;
  if (!user) return <AuthLanding brand={brand} onSignIn={signIn} />;

  return (
    <Shell brand={brand} user={user} signOut={signOut} activePortal={activePortal} setActivePortal={setActivePortal}>
      {activePortal === 'admin' && <AdminPortal />}
      {activePortal === 'employee' && <EmployeePortal />}
      {activePortal === 'accounting' && <AccountingPortal />}
      {activePortal === 'vendor' && <ExternalPortal type="Vendor" />}
      {activePortal === 'customer' && <ExternalPortal type="Customer" />}
    </Shell>
  );
}

createRoot(document.getElementById('root')).render(<App />);
