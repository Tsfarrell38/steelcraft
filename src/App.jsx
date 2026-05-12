import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowRight, BadgeCheck, Building2, CalendarDays, CheckCircle2, ClipboardList, Clock3, Database, FileText, GraduationCap, Handshake, HardHat, HeartPulse, LayoutDashboard, Megaphone, RefreshCw, ShieldCheck, UserCog, UsersRound, Workflow } from 'lucide-react';
import './styles.css';

const modules = [
  { id: 'admin', title: 'Admin', icon: LayoutDashboard },
  { id: 'sales', title: 'Sales & Estimating', icon: Megaphone },
  { id: 'projects', title: 'Project Portal', icon: ClipboardList },
  { id: 'employee', title: 'Employee Portal', icon: HardHat },
  { id: 'hr', title: 'HR Portal', icon: UserCog },
  { id: 'accounts', title: 'Accounts', icon: Building2 },
  { id: 'contacts', title: 'Contacts', icon: UsersRound },
  { id: 'erection', title: 'Erection Schedule', icon: Workflow },
  { id: 'billing', title: 'Billing & Insurance', icon: FileText },
  { id: 'vendors', title: 'Vendors / POs', icon: Handshake }
];

const workflowStages = ['New Lead', 'Design', 'Quote Sent', 'Client Review', 'Revisions', 'PO Signed / Contracted', 'Engineering', 'Production', 'Delivery', 'Erection', 'Close-Out'];
const projectStages = ['Contracted', 'Engineering', 'Material', 'Fabrication', 'Delivery', 'Erection', 'Punch', 'Closeout'];
const estimateSteps = ['Project Info', 'Scope Builder', 'Cost Build', 'Margin Review', 'Quote Generator', 'Checklist', 'Convert to Project'];

const projectRows = [
  { name: 'Marion Industrial Park', detail: 'Engineering review - PEMB package pending', status: 'Engineering' },
  { name: 'Ocala Commerce Center', detail: 'Customer quote approved - billing setup next', status: 'Contracted' },
  { name: 'Sun State Builders', detail: 'Vendor packet needed - delivery window open', status: 'Material' }
];

const estimateRows = [
  { name: 'Estimate Intake', detail: 'Project info, customer, location, tax rate, square footage, estimator', status: 'estimates' },
  { name: 'Cost Builder', detail: 'Material, labor, markup, tax, alternates, internal notes', status: 'estimate_cost_lines' },
  { name: 'Quote Generator', detail: 'F&E and EO quote versions without showing spreadsheet tabs', status: 'quotation_versions' },
  { name: 'Deposit Schedule', detail: 'Contract, materials, labor, final draw, custom payment terms', status: 'estimate_deposit_schedule' },
  { name: 'Project Checklist', detail: 'Release status, delivery dates, quantities, and handoff items', status: 'project_checklist_items' },
  { name: 'SOV / Billing', detail: 'Material and labor SOV lines, invoices, draw billing support', status: 'schedule_of_values' },
  { name: 'Change Orders', detail: 'CO sent, returned, authorized amount, billing/draw status', status: 'change_orders' }
];

const employeeRows = [
  { name: 'Today\'s Assigned Work', detail: 'Project tasks, schedule, jobsite notes, and punch items', status: 'Live view' },
  { name: 'Daily Logs', detail: 'Work notes, photos, issues, materials, and supervisor review', status: 'Build lane' },
  { name: 'Employee Documents', detail: 'Assigned SOPs, safety docs, and required acknowledgements', status: 'Planned' }
];

const hrRows = [
  { name: 'Employee Records', detail: 'Role, contact info, emergency contact, start date, status', status: 'Foundation' },
  { name: 'Training & Certifications', detail: 'Safety, equipment, welding, field requirements, renewal dates', status: 'Monday import target' },
  { name: 'PTO / Attendance', detail: 'Requests, approvals, schedule visibility, and payroll-ready notes', status: 'Planned' },
  { name: 'Onboarding', detail: 'Offer, handbook, policy acknowledgement, first-week checklist', status: 'Planned' }
];

const placeholderRows = [
  { name: 'Accounts', detail: 'Customers, GCs, suppliers, fabricators', status: 'Monday import target' },
  { name: 'Contacts', detail: 'People attached to accounts and projects', status: 'Monday import target' },
  { name: 'Project Delivery', detail: 'Contracted jobs and delivery stages', status: 'Monday import target' },
  { name: 'Erection Schedule', detail: 'Field schedule and install milestones', status: 'Monday import target' }
];

function BrandMark() {
  return <div className="brand"><div className="mark"><span>S</span><span className="beam">C</span><span>B</span></div><div><strong>Steel Craft</strong><small>Operations portal</small></div></div>;
}

function JsonBox({ value }) {
  if (!value) return <p className="microcopy">No response yet.</p>;
  return <pre className="apiBox">{JSON.stringify(value, null, 2)}</pre>;
}

function StatusCard({ label, value, icon: Icon }) {
  const clean = String(value).replace('not_configured', 'not set');
  return <article className="statCard panel"><div className="icon"><Icon size={22}/></div><strong>{clean}</strong><span>{label}</span><small>{clean === 'connected' || clean === 'configured' ? 'Ready' : 'Needs attention'}</small></article>;
}

function AdminPortal() {
  const [health, setHealth] = useState(null);
  const [summary, setSummary] = useState(null);
  const [lastAction, setLastAction] = useState(null);
  const [loading, setLoading] = useState('');

  async function callApi(label, url, options = {}) {
    setLoading(label);
    setLastAction(null);
    try {
      const response = await fetch(url, options);
      const data = await response.json();
      setLastAction({ label, data });
      if (url.includes('health')) setHealth(data);
      if (url.includes('summary')) setSummary(data);
      return data;
    } catch (error) {
      setLastAction({ label, data: { ok: false, error: error.message } });
    } finally {
      setLoading('');
    }
  }

  useEffect(() => { callApi('Health Check', '/api/health'); }, []);

  const healthChecks = health?.checks || {};
  const boardCount = summary?.boards?.length || 0;

  return <section className="workspace"><header className="workspaceHeader panel"><div><p className="eyebrow">Steel Craft admin</p><h1>Admin Panel</h1><p>This is the working control panel for the Monday migration, database setup, workflow mapping, and portal foundation.</p></div><div className="liveBadge"><ShieldCheck size={22}/> Backend connected</div></header>
    <div className="statsGrid">
      <StatusCard label="Database" value={healthChecks.database || 'checking'} icon={Database} />
      <StatusCard label="Monday API" value={healthChecks.monday || 'checking'} icon={RefreshCw} />
      <StatusCard label="Synced Boards" value={String(boardCount)} icon={ClipboardList} />
      <StatusCard label="Storage" value={healthChecks.spaces || 'later'} icon={FileText} />
    </div>
    <div className="workspaceGrid">
      <article className="feature panel large"><p className="eyebrow"><Database size={14}/> One-day migration controls</p><h2>Monday migration actions</h2><p>Start by initializing the database, then sync Monday board structure. Once Seth provides a token with board access, the board list will populate here.</p><div className="buttonRow"><button onClick={() => callApi('Health Check', '/api/health')} disabled={!!loading}>Health check</button><button onClick={() => callApi('Initialize Schema', '/api/setup/schema', { method: 'POST' })} disabled={!!loading}>Initialize database</button><button onClick={() => callApi('Sync Monday Boards', '/api/monday/sync-boards', { method: 'POST' })} disabled={!!loading}>Sync Monday boards</button><button onClick={() => callApi('Load Summary', '/api/monday/migration/summary')} disabled={!!loading}>Load summary</button></div>{loading && <p className="microcopy">Running: {loading}...</p>}<JsonBox value={lastAction?.data} /></article>
      <article className="feature panel"><p className="eyebrow"><ClipboardList size={14}/> Synced Monday boards</p><h2>Board summary</h2>{summary?.boards?.length ? <div className="dataRows">{summary.boards.map((board) => <div className="dataRow" key={board.id}><div><strong>{board.name}</strong><span>{board.workspace_name || 'No workspace'} - {board.id}</span></div><b>{board.column_count} columns</b><small>{board.state}</small></div>)}</div> : <p>No boards synced yet. The current Monday token may not have access to Steel Craft's boards.</p>}</article>
    </div>
    <article className="feature panel fullSpan"><p className="eyebrow"><Workflow size={14}/> Target Monday workflow map</p><h2>Migration targets</h2><div className="stageRail">{workflowStages.map((stage, index) => <div className="stage" key={stage}><b>{String(index + 1).padStart(2, '0')}</b><span>{stage}</span></div>)}</div></article>
  </section>;
}

function SalesPortal() {
  return <section className="workspace"><header className="workspaceHeader panel"><div><p className="eyebrow">Sales and estimating</p><h1>Sales & Estimating</h1><p>This turns the estimate workbook logic into a clean platform flow: estimate intake, cost build, margin review, quote generation, checklist, billing preview, and change orders.</p></div><div className="liveBadge"><Megaphone size={22}/> Estimating engine</div></header>
    <div className="statsGrid"><StatusCard label="Estimate Tables" value="live" icon={Database} /><StatusCard label="Quote Versions" value="ready" icon={FileText} /><StatusCard label="SOV / Billing" value="ready" icon={ClipboardList} /><StatusCard label="Change Orders" value="ready" icon={Workflow} /></div>
    <div className="workspaceGrid"><article className="feature panel large"><p className="eyebrow"><Workflow size={14}/> Platform flow</p><h2>Estimate to project path</h2><p>The workbook stays behind the scenes as database logic. The estimator sees a guided platform experience instead of tabs, formulas, and duplicate sheets.</p><div className="stageRail">{estimateSteps.map((stage, index) => <div className="stage" key={stage}><b>{String(index + 1).padStart(2, '0')}</b><span>{stage}</span></div>)}</div><div className="buttonRow"><button>New Estimate</button><button>Build Quote</button><button>Margin Review</button><button>Convert to Project</button></div></article><RecordList title="Workbook logic mapped to platform" rows={estimateRows} /></div>
    <article className="feature panel fullSpan"><p className="eyebrow"><FileText size={14}/> Quote builder preview</p><h2>What the estimator should work through</h2><div className="dataRows"><div className="dataRow"><div><strong>1. Project and customer info</strong><span>Job number, name, city/zip, customer, contact, estimator, project address, tax rate.</span></div><b>Estimate intake</b></div><div className="dataRow"><div><strong>2. Scope and cost build</strong><span>Material lines, labor lines, markups, tax, deposits, alternates, and internal-only notes.</span></div><b>Cost builder</b></div><div className="dataRow"><div><strong>3. Quote output</strong><span>F&E quotation, EO quotation, customer-facing line items, exclusions, payment terms, and approval status.</span></div><b>Quote generator</b></div><div className="dataRow"><div><strong>4. Project handoff</strong><span>Checklist, SOV, invoice prep, change order center, and conversion into Project Portal.</span></div><b>Handoff</b></div></div></article>
  </section>;
}

function ProjectPortal() {
  return <section className="workspace"><header className="workspaceHeader panel"><div><p className="eyebrow">Project delivery</p><h1>Project Portal</h1><p>The project portal replaces the operational Monday project boards: contracted jobs, engineering, material, fabrication, delivery, erection, punch, and closeout.</p></div><div className="liveBadge"><ClipboardList size={22}/> Delivery workflow</div></header>
    <div className="statsGrid"><StatusCard label="Open Projects" value="Monday" icon={ClipboardList} /><StatusCard label="Erection Links" value="mapped" icon={Workflow} /><StatusCard label="Billing Triggers" value="planned" icon={FileText} /><StatusCard label="Documents" value="Egnyte" icon={FileText} /></div>
    <div className="workspaceGrid"><article className="feature panel large"><p className="eyebrow"><Workflow size={14}/> Project stages</p><h2>Delivery board</h2><p>Each contracted job will move through these stages and trigger the proper handoff to billing, erection, vendors, and customer-facing documents.</p><div className="stageRail">{projectStages.map((stage, index) => <div className="stage" key={stage}><b>{String(index + 1).padStart(2, '0')}</b><span>{stage}</span></div>)}</div></article><RecordList title="Project records" rows={projectRows} /></div>
  </section>;
}

function TimeClockPanel() {
  const [clockedIn, setClockedIn] = useState(false);
  const [selectedProject, setSelectedProject] = useState('Shop / General');
  const [selectedTask, setSelectedTask] = useState('Fabrication');

  return <article className="feature panel large timeClockCard"><p className="eyebrow"><Clock3 size={14}/> One tap time clock</p><h2>{clockedIn ? 'You are clocked in' : 'Clock in to start work'}</h2><p>Make this the first thing employees see. No scraping QuickBooks Time, no hunting through another app. The portal captures the punch, project, task, and notes cleanly.</p>
    <div className="clockFace"><span>{clockedIn ? 'IN' : 'OFF'}</span><small>{clockedIn ? 'ACTIVE SHIFT' : 'READY'}</small></div>
    <div className="dataRows">
      <label className="dataRow"><div><strong>Project / cost code</strong><span>Where should this time be charged?</span></div><select value={selectedProject} onChange={(event) => setSelectedProject(event.target.value)}><option>Shop / General</option><option>Marion Industrial Park</option><option>Ocala Commerce Center</option><option>Sun State Builders</option></select></label>
      <label className="dataRow"><div><strong>Work type</strong><span>Simple task category for job costing</span></div><select value={selectedTask} onChange={(event) => setSelectedTask(event.target.value)}><option>Fabrication</option><option>Engineering</option><option>Delivery</option><option>Erection</option><option>Punch / Service</option><option>Admin / Office</option></select></label>
    </div>
    <div className="clockActions"><button onClick={() => setClockedIn(!clockedIn)}>{clockedIn ? 'Clock Out' : 'Clock In'}</button><button className="ghost">Start Break</button><button className="ghost">Add Note</button></div>
    <p className="microcopy">Next build step: save time punches to PostgreSQL, route supervisor approvals, and export payroll/job-cost records.</p>
  </article>;
}

function EmployeePortal() {
  return <section className="workspace"><header className="workspaceHeader panel"><div><p className="eyebrow">Employee operations</p><h1>Employee Portal</h1><p>The employee portal gives field and office staff their time clock, assigned work, project tasks, daily logs, uploads, schedule visibility, and required acknowledgements.</p></div><div className="liveBadge"><HardHat size={22}/> Internal access</div></header>
    <div className="workspaceGrid"><TimeClockPanel /><article className="feature panel"><p className="eyebrow"><CalendarDays size={14}/> Daily work center</p><h2>Employee dashboard</h2><p>Employees should land here and immediately clock in, choose the project/cost code, see today’s assigned work, and add jobsite notes without fighting another system.</p><div className="miniList strong"><span>Time clock</span><span>Assigned projects</span><span>Daily logs</span><span>Field uploads</span><span>Punch items</span></div></article><RecordList title="Employee portal sections" rows={employeeRows} /></div>
  </section>;
}

function HrPortal() {
  return <section className="workspace"><header className="workspaceHeader panel"><div><p className="eyebrow">HR and training</p><h1>HR Portal</h1><p>The HR portal holds employee records, onboarding, training, certifications, PTO/attendance planning, and payroll-ready visibility.</p></div><div className="liveBadge"><UserCog size={22}/> HR foundation</div></header>
    <div className="statsGrid"><StatusCard label="Employee Records" value="planned" icon={UsersRound} /><StatusCard label="Training" value="Monday" icon={GraduationCap} /><StatusCard label="Certifications" value="tracked" icon={BadgeCheck} /><StatusCard label="PTO" value="planned" icon={HeartPulse} /></div>
    <div className="workspaceGrid"><article className="feature panel large"><p className="eyebrow"><GraduationCap size={14}/> Training migration</p><h2>HR records and training</h2><p>Training and resources from Monday will be mapped here. The goal is to know who has completed what, what is expiring, and what documents employees still need to acknowledge.</p><div className="miniList strong"><span>Onboarding</span><span>Training</span><span>Certifications</span><span>PTO</span><span>Policy sign-off</span></div></article><RecordList title="HR portal sections" rows={hrRows} /></div>
  </section>;
}

function RecordList({ title, rows }) {
  return <article className="feature panel"><h2>{title}</h2><div className="dataRows">{rows.map((row) => <div className="dataRow" key={row.name}><div><strong>{row.name}</strong><span>{row.detail}</span></div><b>{row.status}</b></div>)}</div></article>;
}

function ModulePage({ active }) {
  const current = modules.find((m) => m.id === active) || modules[0];
  const Icon = current.icon;
  if (active === 'admin') return <AdminPortal />;
  if (active === 'sales') return <SalesPortal />;
  if (active === 'projects') return <ProjectPortal />;
  if (active === 'employee') return <EmployeePortal />;
  if (active === 'hr') return <HrPortal />;
  return <section className="workspace"><header className="workspaceHeader panel"><div><p className="eyebrow">Steel Craft module</p><h1>{current.title}</h1><p>This module will be populated from Monday after the migration mapping is confirmed.</p></div><div className="liveBadge"><Icon size={22}/> Build lane</div></header><div className="workspaceGrid"><article className="feature panel large"><h2>What belongs here</h2><p>We will map the matching Monday board into this module, preserve the useful statuses, and replace manual handoffs with portal workflow rules.</p><div className="miniList strong"><span>Monday import</span><span>Column mapping</span><span>Permissions</span><span>Automations</span></div></article><RecordList title="Initial records" rows={placeholderRows} /></div></section>;
}

function Landing({ enter }) {
  return <main className="page landing"><header className="nav panel"><BrandMark /><nav><a href="#modules">Modules</a><button onClick={() => enter('admin')}>Open Admin</button></nav></header><section className="hero"><div className="heroText"><p className="eyebrow"><CheckCircle2 size={16}/> Steel Craft migration lane</p><h1>Monday migration and portal foundation.</h1><p>The backend, database, and Monday connection are in place. The admin panel controls setup, and the Sales, Project, Employee, and HR portals are now framed for the working build.</p><div className="actions"><button onClick={() => enter('admin')}>Open admin panel <ArrowRight size={18}/></button></div><div className="chips"><span><Database size={16}/> PostgreSQL connected</span><span><RefreshCw size={16}/> Monday ready for Seth token</span><span><HardHat size={16}/> Employee + HR portals</span></div></div><div className="heroVisual panel"><div className="steelPlate"><div className="redRail"/><h2>SCB</h2><p>Monday to portal migration</p></div></div></section><section id="modules" className="portalGrid">{modules.map((module) => { const Icon = module.icon; return <article className="portalCard panel" key={module.id}><div className="icon"><Icon size={24}/></div><p className="eyebrow">Module</p><h3>{module.title}</h3><p>Mapped from the existing Steel Craft Monday workspace.</p><button className="inlineAction" onClick={() => enter(module.id)}>Open <ArrowRight size={15}/></button></article>; })}</section></main>;
}

function Shell({ active, setActive, back }) {
  return <main className="dashboard"><aside className="side panel"><BrandMark /><p className="sideLabel">Steel Craft</p>{modules.map((m) => { const Icon = m.icon; return <button className={m.id === active ? 'active' : ''} key={m.id} onClick={() => setActive(m.id)}><Icon size={18}/>{m.title}</button>; })}<button className="back" onClick={back}>Back to landing</button></aside><ModulePage active={active} /></main>;
}

function App() {
  const initialPath = window.location.pathname.replace('/', '');
  const initialModule = modules.some((m) => m.id === initialPath) ? initialPath : 'admin';
  const [screen, setScreen] = useState(initialPath ? 'dashboard' : 'landing');
  const [active, setActiveRaw] = useState(initialModule);
  const setActive = (id) => { setActiveRaw(id); window.history.replaceState(null, '', `/${id}`); };
  const enter = (id) => { setActive(id); setScreen('dashboard'); };
  if (screen === 'dashboard') return <Shell active={active} setActive={setActive} back={() => { window.history.replaceState(null, '', '/'); setScreen('landing'); }} />;
  return <Landing enter={enter} />;
}

createRoot(document.getElementById('root')).render(<App />);
