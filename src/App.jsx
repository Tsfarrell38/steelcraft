import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const topPortals = [
  ['admin', 'Admin', 'System control center', 'Users, roles, permissions, database status, integrations, tenant controls, and global settings.'],
  ['sales', 'Sales Portal', 'Sales pipeline', 'Leads, opportunities, customers, handoff notes, quote requests, and follow-up.'],
  ['estimating', 'Estimating Portal', 'Estimating workflow', 'Estimate intake, scope builder, cost build, margin review, quote generation, and bid handoff.'],
  ['projects', 'Projects Portal', 'Project execution', 'Contracted jobs, engineering, material, fabrication, delivery, erection schedule, punch, and closeout.'],
  ['planning', 'Planning Portal', 'Operations planning', 'Job readiness, resources, schedule blockers, internal handoffs, and production/field readiness.'],
  ['accounting', 'Accounting Portal', 'Financial control', 'Billing, insurance, invoices, SOV, payments, AR, AP, change order billing, and reporting.'],
  ['purchasing', 'Purchasing Portal', 'Procurement and POs', 'Purchase orders, vendor assignment, material purchasing, approvals, due dates, and receiving.'],
  ['hr', 'HR Portal', 'Human resources', 'Salary employee records, PTO, handbook, HR support, onboarding, and training modules. No time clock.'],
  ['contacts', 'Contacts / CRM', 'Relationships', 'Companies, customer contacts, vendor contacts, contractor contacts, project contacts, and account history.'],
  ['vendor', 'Vendor Portal', 'Outside vendors', 'Assigned packages, vendor-facing PO visibility, due dates, upload slots, and packet status.'],
  ['customer', 'Customer Portal', 'Outside customers', 'Approved project status, documents, quotes, contracts, change orders, payments, approvals, and uploads.'],
  ['employee', 'Employee Self-Service', 'Employee access', 'Personal profile, PTO requests, handbook acknowledgements, training assignments, and employee documents.']
];

const initialProfiles = [
  { id: 'admin-owner', name: 'Admin / Owner', email: 'admin@steelcraft.local', description: 'Full ERP access. Admin users can see every portal and manage role permissions.', portals: topPortals.map(([id]) => id) },
  { id: 'accounting', name: 'Accounting', email: 'accounting@steelcraft.local', description: 'Financial team access.', portals: ['accounting', 'purchasing', 'contacts', 'employee'] },
  { id: 'purchasing', name: 'Purchasing', email: 'purchasing@steelcraft.local', description: 'Purchasing and vendor coordination access.', portals: ['purchasing', 'accounting', 'projects', 'planning', 'vendor', 'contacts', 'employee'] },
  { id: 'projects', name: 'Projects', email: 'projects@steelcraft.local', description: 'Project management and customer coordination access.', portals: ['projects', 'planning', 'sales', 'estimating', 'customer', 'contacts', 'employee'] },
  { id: 'sales', name: 'Sales', email: 'sales@steelcraft.local', description: 'Sales and CRM access.', portals: ['sales', 'estimating', 'contacts', 'customer', 'employee'] },
  { id: 'hr', name: 'HR', email: 'hr@steelcraft.local', description: 'HR and employee self-service administration.', portals: ['hr', 'employee', 'contacts'] },
  { id: 'employee', name: 'Employee', email: 'employee@steelcraft.local', description: 'Employee self-service only.', portals: ['employee'] },
  { id: 'vendor', name: 'Vendor User', email: 'vendor@steelcraft.local', description: 'External vendor access only.', portals: ['vendor'] },
  { id: 'customer', name: 'Customer User', email: 'customer@steelcraft.local', description: 'External customer access only.', portals: ['customer'] }
];

const navLayouts = [
  ['dock-left', 'Left slide-out dock', 'Menu opens a dock from the left side.'],
  ['dock-right', 'Right slide-out dock', 'Menu opens a dock from the right side.'],
  ['top-rail', 'Top rail buttons', 'Portal buttons stay visible in the top rail.'],
  ['bottom-dock', 'Bottom dock', 'Portal controls sit in a bottom dock.'],
  ['left-sidebar', 'Left sidebar', 'Permanent left navigation.'],
  ['right-sidebar', 'Right sidebar', 'Permanent right navigation.'],
  ['command-center', 'Command center', 'Centered command panel from the top-bar menu.']
];
const uiThemes = [['dark-industrial', 'Dark industrial', 'Steel Craft dark ERP look.'], ['light-steel', 'Light steel', 'Bright manufacturing office look.'], ['clean-saas', 'Clean SaaS', 'Minimal white-label software look.'], ['field-ops', 'Field operations', 'High-contrast jobsite layout.'], ['executive', 'Executive', 'Calm dashboard style.'], ['glass', 'Glass panels', 'Modern translucent interface.'], ['high-contrast', 'High contrast', 'Accessibility-forward mode.']];
const colorControls = [['primaryColor', 'Primary / brand base'], ['accentColor', 'Accent / action'], ['panelColor', 'Panel background'], ['pageBgColor', 'Page background'], ['surfaceColor', 'Surface'], ['surfaceAltColor', 'Surface alternate'], ['textColor', 'Main text'], ['mutedTextColor', 'Muted text'], ['borderColor', 'Borders'], ['buttonColor', 'Button background'], ['buttonTextColor', 'Button text'], ['successColor', 'Success'], ['warningColor', 'Warning'], ['dangerColor', 'Danger'], ['infoColor', 'Info'], ['sidebarColor', 'Sidebar / dock'], ['topbarColor', 'Topbar'], ['cardColor', 'Card background'], ['inputColor', 'Input background'], ['shadowColor', 'Shadow / glow']];

const portalDetails = {
  admin: [['Users and roles', 'Create users, roles, and portal access rules.', 'Admin'], ['Tenant controls', 'Branding, module visibility, and clean template controls.', 'Admin'], ['Integrations', 'Monday, storage, email, e-signature, and future APIs.', 'Admin']],
  sales: [['Lead intake', 'New opportunities and customer requests.', 'Sales'], ['Pipeline', 'Opportunity stages, next steps, and follow-up.', 'Sales'], ['Sales handoff', 'Move qualified work into estimating.', 'Sales']],
  estimating: [['Estimate intake', 'Scope request, files, drawings, and notes.', 'Estimating'], ['Scope builder', 'Labor, material, options, and exclusions.', 'Estimating'], ['Quote generation', 'Final quote, margin review, and approval.', 'Estimating']],
  projects: [['Project dashboard', 'Contracted jobs and project status.', 'Projects'], ['Erection schedule', 'Crew planning, erection dates, field readiness, and schedule conflicts.', 'Projects'], ['Closeout', 'Punch, documents, approvals, and closeout tasks.', 'Projects']],
  planning: [['Job readiness', 'Checklist before fabrication, delivery, erection, and closeout.', 'Planning'], ['Resource planning', 'Internal capacity, blockers, and schedule readiness.', 'Planning'], ['Handoffs', 'Sales to estimating, estimating to projects, project to field.', 'Planning']],
  accounting: [['Billing', 'Invoices, deposits, draws, billing status, and collections.', 'Accounting'], ['Insurance', 'COIs, job requirements, expirations, and compliance.', 'Accounting'], ['Financial reports', 'Revenue, cost, margin, AR/AP, and exports.', 'Accounting']],
  purchasing: [['Purchase orders', 'PO creation, approvals, due dates, and status.', 'Purchasing'], ['Vendor assignment', 'Assign vendors to materials, scopes, and packages.', 'Purchasing'], ['Receiving', 'Track ordered, shipped, received, and backordered items.', 'Purchasing']],
  hr: [['Employee records', 'Salary employee profiles, start dates, anniversaries, and documents.', 'HR'], ['PTO', 'PTO requests, balances, approvals, and history.', 'HR'], ['Training', 'Training modules, assignments, and completion tracking.', 'HR']],
  contacts: [['Accounts', 'Customer, vendor, contractor, and company accounts.', 'CRM'], ['People', 'Contacts tied to jobs, estimates, customers, and vendors.', 'CRM'], ['History', 'Relationship history, notes, and communication trail.', 'CRM']],
  vendor: [['Assigned packages', 'Vendor project/package details.', 'Vendor'], ['PO visibility', 'Vendor-facing PO details only.', 'Limited'], ['Uploads', 'Submittals, packets, and documents.', 'Vendor']],
  customer: [['Project status', 'Approved customer-facing status.', 'Customer'], ['Documents', 'Approved documents, contracts, and change orders.', 'Customer'], ['Approvals', 'Customer approvals and uploads.', 'Customer']],
  employee: [['Profile', 'Employee profile, start date, and documents.', 'Self-service'], ['PTO requests', 'Submit and view PTO requests.', 'Self-service'], ['Handbook and training', 'Acknowledge handbook and complete assigned training.', 'Self-service']]
};

const brandDefaults = { tenantName: 'Steel Craft', platformName: 'Operations Portal', logoText: 'Steel Craft', logoSubtext: 'Operations Portal', navLayout: 'dock-left', uiTheme: 'dark-industrial', primaryColor: '#0f1014', accentColor: '#9f3d42', panelColor: '#151519', pageBgColor: '#030303', surfaceColor: '#141418', surfaceAltColor: '#1e1e24', textColor: '#f6f0ea', mutedTextColor: '#b7aaa3', borderColor: '#343036', buttonColor: '#9f3d42', buttonTextColor: '#ffffff', successColor: '#3fb56f', warningColor: '#d99b34', dangerColor: '#d34b4b', infoColor: '#4c9bd9', sidebarColor: '#111116', topbarColor: '#111116', cardColor: '#151519', inputColor: '#202026', shadowColor: '#000000', loadSteelCraftData: false, loadMondayBoards: false, loadExcelWorkbook: false };
function loadBrand() { try { return { ...brandDefaults, ...(JSON.parse(localStorage.getItem('steelcraft_brand_controls_v1')) || {}) }; } catch { return brandDefaults; } }
function saveBrand(next) { localStorage.setItem('steelcraft_brand_controls_v1', JSON.stringify(next)); }
function portalMeta(id) { return topPortals.find(([portalId]) => portalId === id) || topPortals[0]; }
function brandStyle(brand) { return { '--brand-primary': brand.primaryColor, '--brand-accent': brand.accentColor, '--brand-panel': brand.panelColor, '--page-bg': brand.pageBgColor, '--surface': brand.surfaceColor, '--surface-alt': brand.surfaceAltColor, '--text': brand.textColor, '--muted': brand.mutedTextColor, '--line': brand.borderColor, '--button': brand.buttonColor, '--button-text': brand.buttonTextColor, '--success': brand.successColor, '--warning': brand.warningColor, '--danger': brand.dangerColor, '--info': brand.infoColor, '--sidebar': brand.sidebarColor, '--topbar': brand.topbarColor, '--card': brand.cardColor, '--input': brand.inputColor, '--shadow': brand.shadowColor }; }
function BrandMark({ brand }) { return <div className="brand"><div className="mark"><span>S</span><span className="beam">C</span><span>B</span></div><div><strong>{brand.logoText}</strong><small>{brand.logoSubtext}</small></div></div>; }
function StatusCard({ label, value, detail }) { return <article className="stat-card panel"><div className="icon-box">▣</div><strong>{value}</strong><span>{label}</span><small>{detail}</small></article>; }
function PortalNavList({ allowedPortals, activePortal, openPortal }) { return <div className="nav-list">{allowedPortals.map(([id, title, audience, purpose]) => <button key={id} className={id === activePortal ? 'active' : ''} onClick={() => openPortal(id)}><strong>{title}</strong><span>{audience}</span><small>{purpose}</small></button>)}</div>; }

function Shell({ brand, activePortal, setActivePortal, user, signOut, children }) {
  const [dockOpen, setDockOpen] = useState(false);
  const allowedPortals = topPortals.filter(([id]) => user.portals.includes(id));
  const currentPortal = portalMeta(activePortal);
  const persistentNav = ['top-rail', 'bottom-dock', 'left-sidebar', 'right-sidebar'].includes(brand.navLayout);
  function openPortal(id) { setActivePortal(id); setDockOpen(false); }
  return <main className={`dashboard layout-${brand.navLayout} theme-${brand.uiTheme}`} style={brandStyle(brand)}>
    <header className="erp-topbar panel"><BrandMark brand={brand} /><div className="topbar-meta"><span>Signed in as</span><strong>{user.name}</strong><small>{user.portals.length} portal{user.portals.length === 1 ? '' : 's'} available</small></div>{brand.navLayout === 'top-rail' && <PortalNavList allowedPortals={allowedPortals} activePortal={activePortal} openPortal={openPortal} />}<div className="current-portal"><span>Current portal</span><strong>{currentPortal[1]}</strong></div><button className="sign-out" onClick={signOut}>Sign out</button>{!persistentNav && <button className="dock-trigger dock-trigger-right" onClick={() => setDockOpen(true)} aria-label="Open portal dock"><span></span><span></span><span></span></button>}</header>
    {(brand.navLayout === 'left-sidebar' || brand.navLayout === 'right-sidebar') && <aside className="persistent-sidebar panel"><p className="eyebrow">Portal navigation</p><PortalNavList allowedPortals={allowedPortals} activePortal={activePortal} openPortal={openPortal} /><a className="dock-brand-link" href="/brand">Hidden /brand controls</a></aside>}
    {brand.navLayout === 'bottom-dock' && <nav className="bottom-nav panel"><PortalNavList allowedPortals={allowedPortals} activePortal={activePortal} openPortal={openPortal} /></nav>}
    <div className={`dock-backdrop ${dockOpen ? 'open' : ''}`} onClick={() => setDockOpen(false)} />
    {!persistentNav && <aside className={`portal-dock panel ${dockOpen ? 'open' : ''}`}><div className="dock-head"><div><p className="eyebrow">Portal dock</p><h2>Available workspaces</h2></div><button onClick={() => setDockOpen(false)}>×</button></div><div className="dock-user"><span>Role</span><strong>{user.name}</strong><small>Admin controls which portals appear here.</small></div><PortalNavList allowedPortals={allowedPortals} activePortal={activePortal} openPortal={openPortal} /><a className="dock-brand-link" href="/brand">Hidden /brand controls</a></aside>}
    <section className="workspace">{children}</section>
  </main>;
}

function WorkspaceHeader({ eyebrow, title, description, badge = 'Backend connected' }) { return <header className="workspace-header panel"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p></div><div className="live-badge">♢ {badge}</div></header>; }
function RecordList({ title, rows }) { return <article className="feature panel"><h2>{title}</h2><div className="data-rows">{rows.map(([name, detail, status]) => <div className="data-row" key={name}><div><strong>{name}</strong><span>{detail}</span></div><b>{status}</b></div>)}</div></article>; }
function GenericPortal({ id }) { const [, title, audience, description] = portalMeta(id); const rows = portalDetails[id] || []; return <><WorkspaceHeader eyebrow={audience} title={title} description={description} badge={id === 'vendor' || id === 'customer' ? 'External access' : 'Backend connected'} /><div className="stats-grid"><StatusCard label="Portal" value={title.split(' ')[0]} detail={audience} /><StatusCard label="Access" value="role based" detail="Controlled by Admin" /><StatusCard label="Workflow" value="ERP lane" detail="Standalone portal" /><StatusCard label="Status" value="scaffold" detail="Ready to build" /></div><div className="workspace-grid"><article className="feature panel large"><p className="eyebrow">ERP work portal</p><h2>{title}</h2><p>{description}</p>{id === 'projects' && <div className="notice">Erection Schedule now lives here under Projects.</div>}{id === 'employee' && <div className="notice">Employee Self-Service is not the operations bucket. It is only personal employee access.</div>}</article><RecordList title={`${title} map`} rows={rows} /></div></>; }

function RoleAccessManager({ profiles, setProfiles }) {
  const [selectedId, setSelectedId] = useState(profiles[0].id);
  const selected = profiles.find((profile) => profile.id === selectedId) || profiles[0];
  function togglePortal(portalId) {
    setProfiles((current) => current.map((profile) => {
      if (profile.id !== selected.id) return profile;
      const hasPortal = profile.portals.includes(portalId);
      const nextPortals = hasPortal ? profile.portals.filter((id) => id !== portalId) : [...profile.portals, portalId];
      return { ...profile, portals: nextPortals.length ? nextPortals : profile.portals };
    }));
  }
  return <article className="feature panel access-manager"><p className="eyebrow">Live admin permissions</p><h2>Control who sees what</h2><label>Role / user profile<select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>{profiles.map((profile) => <option value={profile.id} key={profile.id}>{profile.name}</option>)}</select></label><p>{selected.description}</p><div className="portal-permission-grid">{topPortals.map(([id, title, audience]) => <label className="permission-toggle" key={id}><input type="checkbox" checked={selected.portals.includes(id)} onChange={() => togglePortal(id)} /><span><strong>{title}</strong><small>{audience}</small></span></label>)}</div></article>;
}

function AdminPortal({ profiles, setProfiles }) { return <><WorkspaceHeader eyebrow="ERP admin" title="Admin Panel" description="System controls for users, roles, permissions, database setup, integrations, workflow mapping, portal foundation, and white-label configuration." /><div className="stats-grid"><StatusCard label="Database" value="connected" detail="Ready" /><StatusCard label="ERP Portals" value="12 lanes" detail="Admin controls access" /><StatusCard label="Role Access" value="live" detail="Portal visibility by role" /><StatusCard label="Design Studio" value="/brand" detail="White-label controls" /></div><div className="workspace-grid"><RoleAccessManager profiles={profiles} setProfiles={setProfiles} /><RecordList title="Current access rules" rows={profiles.map((role) => [role.name, role.description, role.portals.map((id) => portalMeta(id)[1]).join(', ')])} /></div></>; }

function AuthLanding({ brand, profiles, onSignIn }) { const [email, setEmail] = useState('admin@steelcraft.local'); const [password, setPassword] = useState(''); const matched = profiles.find((profile) => profile.email === email); return <main className={`landing-dark auth-page theme-${brand.uiTheme}`} style={brandStyle(brand)}><section className="landing-card panel auth-layout"><div className="auth-copy"><BrandMark brand={brand} /><p className="eyebrow">Secure authentication</p><h1>{brand.logoText} ERP Login</h1><p>This is the first page from the website link. The user signs in, then permissions set in Admin decide which ERP portals appear.</p><label>Email<input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" /></label><label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" /></label><button className="auth-submit" onClick={() => onSignIn(matched || profiles[0])}>Sign in</button>{matched && <div className="selected-access"><span>Access after sign-in</span><strong>{matched.name}</strong><small>{matched.portals.map((id) => portalMeta(id)[1]).join(' · ')}</small></div>}</div><div className="role-panel"><p className="eyebrow">Demo credentials</p><h2>Temporary login list</h2><p>These are placeholders until the real authentication backend is connected.</p><div className="role-list">{profiles.map((profile) => <button key={profile.id} className={email === profile.email ? 'active' : ''} onClick={() => setEmail(profile.email)}><strong>{profile.name}</strong><span>{profile.email}</span><small>{profile.portals.map((id) => portalMeta(id)[1]).join(' · ')}</small></button>)}</div></div></section></main>; }

function BrandControls() { const [brand, setBrand] = useState(loadBrand); function update(field, value) { const next = { ...brand, [field]: value }; setBrand(next); saveBrand(next); } function reset() { setBrand(brandDefaults); saveBrand(brandDefaults); } return <main className={`dashboard brand-controls layout-${brand.navLayout} theme-${brand.uiTheme}`} style={brandStyle(brand)}><section className="workspace solo"><WorkspaceHeader eyebrow="Hidden /brand controls" title="White-label Design Studio" description="Customize the ERP skin while keeping the core nuts-and-bolts workflows underneath. This route is not linked from normal customer navigation." badge="Hidden route" /><div className="brand-studio-grid"><article className="feature panel"><h2>Identity</h2><label>Tenant name<input value={brand.tenantName} onChange={(e) => update('tenantName', e.target.value)} /></label><label>Logo text<input value={brand.logoText} onChange={(e) => update('logoText', e.target.value)} /></label><label>Logo subtext<input value={brand.logoSubtext} onChange={(e) => update('logoSubtext', e.target.value)} /></label><label>Platform name<input value={brand.platformName} onChange={(e) => update('platformName', e.target.value)} /></label></article><article className="feature panel"><h2>Navigation formats</h2><div className="choice-grid">{navLayouts.map(([id, title, detail]) => <button key={id} className={brand.navLayout === id ? 'active' : ''} onClick={() => update('navLayout', id)}><strong>{title}</strong><span>{detail}</span></button>)}</div></article><article className="feature panel"><h2>UI / UX themes</h2><div className="choice-grid">{uiThemes.map(([id, title, detail]) => <button key={id} className={brand.uiTheme === id ? 'active' : ''} onClick={() => update('uiTheme', id)}><strong>{title}</strong><span>{detail}</span></button>)}</div></article><article className="feature panel color-panel"><h2>Color system</h2><p>Twenty configurable color tokens drive the shell, cards, buttons, text, statuses, inputs, and navigation.</p><div className="color-grid">{colorControls.map(([field, label]) => <label key={field}>{label}<input type="color" value={brand[field]} onChange={(e) => update(field, e.target.value)} /></label>)}</div></article><article className="feature panel"><h2>Clean tenant rules</h2><label className="check-row"><input type="checkbox" checked={brand.loadSteelCraftData} onChange={(e) => update('loadSteelCraftData', e.target.checked)} /> Load Steel Craft records</label><label className="check-row"><input type="checkbox" checked={brand.loadMondayBoards} onChange={(e) => update('loadMondayBoards', e.target.checked)} /> Load Steel Craft Monday boards</label><label className="check-row"><input type="checkbox" checked={brand.loadExcelWorkbook} onChange={(e) => update('loadExcelWorkbook', e.target.checked)} /> Load Steel Craft Excel workbook data</label><div className="notice">Default for new customers: ERP structure only, no Steel Craft data.</div><button onClick={reset}>Reset Steel Craft defaults</button></article></div></section></main>; }

function App() {
  const isBrandRoute = window.location.pathname.replace(/\/$/, '') === '/brand';
  const [profiles, setProfiles] = useState(initialProfiles);
  const [userId, setUserId] = useState(null);
  const [activePortal, setActivePortal] = useState('admin');
  const brand = useMemo(loadBrand, []);
  const user = profiles.find((profile) => profile.id === userId);
  const safeActivePortal = user?.portals.includes(activePortal) ? activePortal : user?.portals[0] || 'admin';
  function signIn(profile) { setUserId(profile.id); setActivePortal(profile.portals[0]); }
  function signOut() { setUserId(null); setActivePortal('admin'); }
  if (isBrandRoute) return <BrandControls />;
  if (!user) return <AuthLanding brand={brand} profiles={profiles} onSignIn={signIn} />;
  return <Shell brand={brand} user={user} signOut={signOut} activePortal={safeActivePortal} setActivePortal={setActivePortal}>{safeActivePortal === 'admin' ? <AdminPortal profiles={profiles} setProfiles={setProfiles} /> : <GenericPortal id={safeActivePortal} />}</Shell>;
}

createRoot(document.getElementById('root')).render(<App />);
