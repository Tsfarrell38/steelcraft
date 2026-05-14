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
  { id: 'admin-owner', name: 'Admin / Owner', description: 'Full system access. Admin users see every portal and manage permissions.', portals: ['admin', 'employee', 'accounting', 'vendor', 'customer'] },
  { id: 'accounting', name: 'Accounting', description: 'Accounting staff can work internally and manage financial workflows.', portals: ['employee', 'accounting'] },
  { id: 'purchasing', name: 'Purchasing', description: 'Purchasing can work internally, manage accounting/PO workflows, and see vendor access.', portals: ['employee', 'accounting', 'vendor'] },
  { id: 'project-manager', name: 'Project Manager', description: 'Project managers work internally and may access customer-facing project views.', portals: ['employee', 'customer'] },
  { id: 'employee', name: 'Employee', description: 'Standard internal employee access.', portals: ['employee'] },
  { id: 'vendor', name: 'Vendor User', description: 'External vendor access only.', portals: ['vendor'] },
  { id: 'customer', name: 'Customer User', description: 'External customer access only.', portals: ['customer'] }
];

const navLayouts = [
  ['dock-left', 'Left slide-out dock', 'Hamburger opens a dock from the left side. Default ERP setup.'],
  ['dock-right', 'Right slide-out dock', 'Hamburger opens a dock from the right side.'],
  ['top-rail', 'Top rail buttons', 'Portal buttons stay visible in a compact top rail.'],
  ['bottom-dock', 'Bottom dock', 'Portal controls sit in a bottom dock like a desktop app.'],
  ['left-sidebar', 'Left sidebar', 'Permanent left navigation for admin-heavy work.'],
  ['right-sidebar', 'Right sidebar', 'Permanent right navigation for review/approval workflows.'],
  ['command-center', 'Command center', 'Floating command/menu panel opened from a centered dock button.']
];

const uiThemes = [
  ['dark-industrial', 'Dark industrial', 'Steel Craft dark ERP look.'],
  ['light-steel', 'Light steel', 'Bright manufacturing office look.'],
  ['clean-saas', 'Clean SaaS', 'Minimal white-label software look.'],
  ['field-ops', 'Field operations', 'High-contrast jobsite layout.'],
  ['executive', 'Executive', 'Calm dashboard style for leadership.'],
  ['glass', 'Glass panels', 'Modern translucent interface.'],
  ['high-contrast', 'High contrast', 'Accessibility-forward high contrast mode.']
];

const colorControls = [
  ['primaryColor', 'Primary / brand base'],
  ['accentColor', 'Accent / action'],
  ['panelColor', 'Panel background'],
  ['pageBgColor', 'Page background'],
  ['surfaceColor', 'Surface'],
  ['surfaceAltColor', 'Surface alternate'],
  ['textColor', 'Main text'],
  ['mutedTextColor', 'Muted text'],
  ['borderColor', 'Borders'],
  ['buttonColor', 'Button background'],
  ['buttonTextColor', 'Button text'],
  ['successColor', 'Success'],
  ['warningColor', 'Warning'],
  ['dangerColor', 'Danger'],
  ['infoColor', 'Info'],
  ['sidebarColor', 'Sidebar / dock'],
  ['topbarColor', 'Topbar'],
  ['cardColor', 'Card background'],
  ['inputColor', 'Input background'],
  ['shadowColor', 'Shadow / glow']
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
  navLayout: 'dock-left',
  uiTheme: 'dark-industrial',
  primaryColor: '#0f1014',
  accentColor: '#9f3d42',
  panelColor: '#151519',
  pageBgColor: '#030303',
  surfaceColor: '#141418',
  surfaceAltColor: '#1e1e24',
  textColor: '#f6f0ea',
  mutedTextColor: '#b7aaa3',
  borderColor: '#343036',
  buttonColor: '#9f3d42',
  buttonTextColor: '#ffffff',
  successColor: '#3fb56f',
  warningColor: '#d99b34',
  dangerColor: '#d34b4b',
  infoColor: '#4c9bd9',
  sidebarColor: '#111116',
  topbarColor: '#111116',
  cardColor: '#151519',
  inputColor: '#202026',
  shadowColor: '#000000',
  loadSteelCraftData: false,
  loadMondayBoards: false,
  loadExcelWorkbook: false
};

function loadBrand() {
  try { return { ...brandDefaults, ...(JSON.parse(localStorage.getItem('steelcraft_brand_controls_v1')) || {}) }; } catch { return brandDefaults; }
}
function saveBrand(next) { localStorage.setItem('steelcraft_brand_controls_v1', JSON.stringify(next)); }
function portalMeta(id) { return topPortals.find(([portalId]) => portalId === id) || topPortals[0]; }
function brandStyle(brand) {
  return {
    '--brand-primary': brand.primaryColor,
    '--brand-accent': brand.accentColor,
    '--brand-panel': brand.panelColor,
    '--page-bg': brand.pageBgColor,
    '--surface': brand.surfaceColor,
    '--surface-alt': brand.surfaceAltColor,
    '--text': brand.textColor,
    '--muted': brand.mutedTextColor,
    '--line': brand.borderColor,
    '--button': brand.buttonColor,
    '--button-text': brand.buttonTextColor,
    '--success': brand.successColor,
    '--warning': brand.warningColor,
    '--danger': brand.dangerColor,
    '--info': brand.infoColor,
    '--sidebar': brand.sidebarColor,
    '--topbar': brand.topbarColor,
    '--card': brand.cardColor,
    '--input': brand.inputColor,
    '--shadow': brand.shadowColor
  };
}

function BrandMark({ brand }) {
  return <div className="brand"><div className="mark"><span>S</span><span className="beam">C</span><span>B</span></div><div><strong>{brand.logoText}</strong><small>{brand.logoSubtext}</small></div></div>;
}
function IconBox({ children }) { return <div className="icon-box">{children}</div>; }
function StatusCard({ label, value, detail }) { return <article className="stat-card panel"><IconBox>▣</IconBox><strong>{value}</strong><span>{label}</span><small>{detail}</small></article>; }

function PortalNavList({ allowedPortals, activePortal, openPortal }) {
  return <div className="nav-list">{allowedPortals.map(([id, title, audience, purpose]) => <button key={id} className={id === activePortal ? 'active' : ''} onClick={() => openPortal(id)}><strong>{title}</strong><span>{audience}</span><small>{purpose}</small></button>)}</div>;
}

function Shell({ brand, activePortal, setActivePortal, user, signOut, children }) {
  const [dockOpen, setDockOpen] = useState(false);
  const allowedPortals = topPortals.filter(([id]) => user.portals.includes(id));
  const currentPortal = portalMeta(activePortal);
  const persistentNav = ['top-rail', 'bottom-dock', 'left-sidebar', 'right-sidebar'].includes(brand.navLayout);

  function openPortal(id) {
    setActivePortal(id);
    setDockOpen(false);
  }

  return (
    <main className={`dashboard layout-${brand.navLayout} theme-${brand.uiTheme}`} style={brandStyle(brand)}>
      <header className="erp-topbar panel">
        {!persistentNav && <button className="dock-trigger" onClick={() => setDockOpen(true)} aria-label="Open portal dock"><span></span><span></span><span></span></button>}
        <BrandMark brand={brand} />
        <div className="topbar-meta"><span>Signed in as</span><strong>{user.name}</strong><small>{user.portals.length} portal{user.portals.length === 1 ? '' : 's'} available</small></div>
        {brand.navLayout === 'top-rail' && <PortalNavList allowedPortals={allowedPortals} activePortal={activePortal} openPortal={openPortal} />}
        <div className="current-portal"><span>Current portal</span><strong>{currentPortal[1]}</strong></div>
        <button className="sign-out" onClick={signOut}>Sign out</button>
      </header>

      {(brand.navLayout === 'left-sidebar' || brand.navLayout === 'right-sidebar') && <aside className="persistent-sidebar panel"><p className="eyebrow">Portal navigation</p><PortalNavList allowedPortals={allowedPortals} activePortal={activePortal} openPortal={openPortal} /><a className="dock-brand-link" href="/brand">Hidden /brand controls</a></aside>}
      {brand.navLayout === 'bottom-dock' && <nav className="bottom-nav panel"><PortalNavList allowedPortals={allowedPortals} activePortal={activePortal} openPortal={openPortal} /></nav>}

      {!persistentNav && <button className={`floating-dock-button ${brand.navLayout === 'command-center' ? 'centered' : ''}`} onClick={() => setDockOpen(true)} aria-label="Open portal dock"><span></span><span></span><span></span></button>}
      <div className={`dock-backdrop ${dockOpen ? 'open' : ''}`} onClick={() => setDockOpen(false)} />
      {!persistentNav && <aside className={`portal-dock panel ${dockOpen ? 'open' : ''}`}>
        <div className="dock-head"><div><p className="eyebrow">Portal dock</p><h2>Available workspaces</h2></div><button onClick={() => setDockOpen(false)}>×</button></div>
        <div className="dock-user"><span>Role</span><strong>{user.name}</strong><small>Admin controls which portals appear here.</small></div>
        <PortalNavList allowedPortals={allowedPortals} activePortal={activePortal} openPortal={openPortal} />
        <a className="dock-brand-link" href="/brand">Hidden /brand controls</a>
      </aside>}

      <section className="workspace">{children}</section>
    </main>
  );
}

function WorkspaceHeader({ eyebrow, title, description, badge = 'Backend connected' }) {
  return <header className="workspace-header panel"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p></div><div className="live-badge">♢ {badge}</div></header>;
}

function AdminPortal() {
  return <><WorkspaceHeader eyebrow="Steel Craft admin" title="Admin Panel" description="System controls for users, roles, permissions, database setup, integrations, workflow mapping, and portal foundation." /><div className="stats-grid"><StatusCard label="Database" value="connected" detail="Ready" /><StatusCard label="Portal Shell" value="5 portals" detail="Admin, Employee, Accounting, Vendor, Customer" /><StatusCard label="Role Access" value="active" detail="Portal visibility by role" /><StatusCard label="Storage" value="not set" detail="Needs attention" /></div><div className="workspace-grid"><article className="feature panel large"><p className="eyebrow">Admin controls</p><h2>Role-based portal access</h2><p>Admins assign which portals each role can see. A user can have one portal, several portals, or all five portals.</p><div className="pill-row"><span>User management</span><span>Role access</span><span>Portal permissions</span><span>Integrations</span></div></article><RecordList title="Example access rules" rows={demoRoles.map((role) => [role.name, role.description, role.portals.map((id) => portalMeta(id)[1]).join(', ')])} /></div></>;
}

function EmployeePortal() {
  const [activeModule, setActiveModule] = useState('sales');
  const current = employeeModules.find(([id]) => id === activeModule) || employeeModules[0];
  return <><WorkspaceHeader eyebrow="Internal operations" title="Employee Portal" description="Internal Steel Craft workspace for sales, estimating, projects, planning, HR, accounts, contacts, and erection schedule." /><div className="tab-row">{employeeModules.map(([id, title]) => <button key={id} className={activeModule === id ? 'active' : ''} onClick={() => setActiveModule(id)}>{title}</button>)}</div><div className="workspace-grid"><article className="feature panel large"><p className="eyebrow">Employee module</p><h2>{current[1]}</h2><p>{current[2]}</p>{activeModule === 'hr' && <div className="notice">No time clock. HR is for salary employees: PTO, handbook, support, onboarding, and training.</div>}{activeModule === 'planning' && <div className="notice">Planning is job readiness only. Billing, insurance, and POs live in Accounting.</div>}</article><RecordList title="Employee portal map" rows={employeeModules.map(([, title, detail]) => [title, detail, 'Employee'])} /></div></>;
}

function AccountingPortal() {
  return <><WorkspaceHeader eyebrow="Financial control" title="Accounting Portal" description="Full accounting center for billing, insurance, POs, AR, AP, SOV, change order billing, project financial health, and reporting." /><div className="stats-grid"><StatusCard label="Billing" value="ready" detail="Invoices, draws, deposits" /><StatusCard label="Purchase Orders" value="inside" detail="Accounting portal" /><StatusCard label="Insurance" value="tracked" detail="COIs and expirations" /><StatusCard label="Reports" value="planned" detail="Financial exports" /></div><RecordList title="Accounting modules" rows={accountingModules.map(([title, detail]) => [title, detail, 'Accounting'])} /></>;
}

function ExternalPortal({ type }) {
  const vendor = type === 'Vendor';
  return <><WorkspaceHeader eyebrow={`${type} access`} title={`${type} Portal`} description={vendor ? 'External vendor access for assigned project packages, relevant PO visibility, due dates, upload slots, and packet status.' : 'External customer access for approved project status, documents, quotes, contracts, change orders, payments, approvals, and uploads.'} badge="External access" /><div className="workspace-grid"><article className="feature panel large"><p className="eyebrow">Outside portal</p><h2>{type} workspace</h2><p>{vendor ? 'Vendors stay outside the employee portal and only see assigned package information.' : 'Customers stay outside the employee portal and only see approved customer-facing information.'}</p></article><RecordList title="Visible areas" rows={vendor ? [['Assigned packages', 'Project/vendor packet details', 'Vendor'], ['PO visibility', 'Vendor-facing PO details only', 'Limited'], ['Uploads', 'Submittals, packets, and documents', 'Vendor']] : [['Project status', 'Approved customer-facing status', 'Customer'], ['Documents', 'Approved documents and contracts', 'Customer'], ['Approvals', 'Customer approvals and uploads', 'Customer']]} /></div></>;
}

function RecordList({ title, rows }) {
  return <article className="feature panel"><h2>{title}</h2><div className="data-rows">{rows.map(([name, detail, status]) => <div className="data-row" key={name}><div><strong>{name}</strong><span>{detail}</span></div><b>{status}</b></div>)}</div></article>;
}

function AuthLanding({ brand, onSignIn }) {
  const [selectedRoleId, setSelectedRoleId] = useState('admin-owner');
  const selectedRole = demoRoles.find((role) => role.id === selectedRoleId) || demoRoles[0];
  return <main className={`landing-dark theme-${brand.uiTheme}`} style={brandStyle(brand)}><section className="landing-card panel auth-layout"><div className="auth-copy"><BrandMark brand={brand} /><p className="eyebrow">Authentication page</p><h1>{brand.logoText} Operations Portal</h1><p>This link comes from the finished website. Users authenticate here first, then the app routes them into the portal access assigned to their role.</p><div className="selected-access"><span>Selected role</span><strong>{selectedRole.name}</strong><small>{selectedRole.portals.map((id) => portalMeta(id)[1]).join(' · ')}</small></div><button className="auth-submit" onClick={() => onSignIn(selectedRole)}>Sign in and route by role</button></div><div className="role-panel"><p className="eyebrow">Demo role selector</p><h2>Portal access is admin-controlled</h2><div className="role-list">{demoRoles.map((role) => <button key={role.id} className={selectedRoleId === role.id ? 'active' : ''} onClick={() => setSelectedRoleId(role.id)}><strong>{role.name}</strong><span>{role.description}</span><small>{role.portals.map((id) => portalMeta(id)[1]).join(' · ')}</small></button>)}</div></div></section></main>;
}

function BrandControls() {
  const [brand, setBrand] = useState(loadBrand);
  function update(field, value) { const next = { ...brand, [field]: value }; setBrand(next); saveBrand(next); }
  function reset() { setBrand(brandDefaults); saveBrand(brandDefaults); }
  return <main className={`dashboard brand-controls layout-${brand.navLayout} theme-${brand.uiTheme}`} style={brandStyle(brand)}><section className="workspace solo"><WorkspaceHeader eyebrow="Hidden /brand controls" title="White-label Design Studio" description="Customize the ERP skin while keeping the core nuts-and-bolts workflows underneath. This route is not linked from normal customer navigation." badge="Hidden route" />
    <div className="brand-studio-grid">
      <article className="feature panel"><h2>Identity</h2><label>Tenant name<input value={brand.tenantName} onChange={(e) => update('tenantName', e.target.value)} /></label><label>Logo text<input value={brand.logoText} onChange={(e) => update('logoText', e.target.value)} /></label><label>Logo subtext<input value={brand.logoSubtext} onChange={(e) => update('logoSubtext', e.target.value)} /></label><label>Platform name<input value={brand.platformName} onChange={(e) => update('platformName', e.target.value)} /></label></article>
      <article className="feature panel"><h2>Navigation formats</h2><div className="choice-grid">{navLayouts.map(([id, title, detail]) => <button key={id} className={brand.navLayout === id ? 'active' : ''} onClick={() => update('navLayout', id)}><strong>{title}</strong><span>{detail}</span></button>)}</div></article>
      <article className="feature panel"><h2>UI / UX themes</h2><div className="choice-grid">{uiThemes.map(([id, title, detail]) => <button key={id} className={brand.uiTheme === id ? 'active' : ''} onClick={() => update('uiTheme', id)}><strong>{title}</strong><span>{detail}</span></button>)}</div></article>
      <article className="feature panel color-panel"><h2>Color system</h2><p>Twenty configurable color tokens drive the shell, cards, buttons, text, statuses, inputs, and navigation.</p><div className="color-grid">{colorControls.map(([field, label]) => <label key={field}>{label}<input type="color" value={brand[field]} onChange={(e) => update(field, e.target.value)} /></label>)}</div></article>
      <article className="feature panel"><h2>Clean tenant rules</h2><label className="check-row"><input type="checkbox" checked={brand.loadSteelCraftData} onChange={(e) => update('loadSteelCraftData', e.target.checked)} /> Load Steel Craft records</label><label className="check-row"><input type="checkbox" checked={brand.loadMondayBoards} onChange={(e) => update('loadMondayBoards', e.target.checked)} /> Load Steel Craft Monday boards</label><label className="check-row"><input type="checkbox" checked={brand.loadExcelWorkbook} onChange={(e) => update('loadExcelWorkbook', e.target.checked)} /> Load Steel Craft Excel workbook data</label><div className="notice">Default for new customers: ERP structure only, no Steel Craft data.</div><button onClick={reset}>Reset Steel Craft defaults</button></article>
    </div>
  </section></main>;
}

function App() {
  const isBrandRoute = window.location.pathname.replace(/\/$/, '') === '/brand';
  const [user, setUser] = useState(null);
  const [activePortal, setActivePortal] = useState('admin');
  const brand = useMemo(loadBrand, []);
  function signIn(role) { setUser(role); setActivePortal(role.portals[0]); }
  function signOut() { setUser(null); setActivePortal('admin'); }
  if (isBrandRoute) return <BrandControls />;
  if (!user) return <AuthLanding brand={brand} onSignIn={signIn} />;
  return <Shell brand={brand} user={user} signOut={signOut} activePortal={activePortal} setActivePortal={setActivePortal}>{activePortal === 'admin' && <AdminPortal />}{activePortal === 'employee' && <EmployeePortal />}{activePortal === 'accounting' && <AccountingPortal />}{activePortal === 'vendor' && <ExternalPortal type="Vendor" />}{activePortal === 'customer' && <ExternalPortal type="Customer" />}</Shell>;
}

createRoot(document.getElementById('root')).render(<App />);
