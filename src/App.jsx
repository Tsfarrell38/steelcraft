import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Activity, AlertTriangle, ArrowRight, BriefcaseBusiness, Building2, CheckCircle2, Clock3, Cpu, Database, FileCheck2, FileText, Gauge, Handshake, HardDrive, HardHat, LayoutDashboard, Lock, Mail, Megaphone, Server, ShieldAlert, ShieldCheck, Sparkles, Timer, UserCheck, UsersRound, Wifi, Workflow } from 'lucide-react';
import './styles.css';

const portals = [
  { id: 'admin', title: 'Admin Portal', label: 'Executive Command', icon: LayoutDashboard, description: 'Company-wide control for users, customers, projects, documents, billing visibility, vendors, reports, and workflow settings.', bullets: ['Company dashboard', 'User access', 'Approval queue'] },
  { id: 'sales', title: 'Sales & Marketing Portal', label: 'Revenue Engine', icon: Megaphone, description: 'Lead intake, quote follow-up, campaign source tracking, sales stages, close-rate visibility, and quote-to-project handoff.', bullets: ['Leads', 'Quotes', 'Campaigns'] },
  { id: 'vendor', title: 'Vendor Portal', label: 'Supply Network', icon: Handshake, description: 'Vendor directory, PO tracking, assigned project files, supplier uploads, due dates, terms, and quality/timing notes.', bullets: ['Material requests', 'Delivery status', 'Vendor docs'] },
  { id: 'customer', title: 'Customer Portal', label: 'Project Visibility', icon: Building2, description: 'Customer-facing project status, approved files, contracts, change orders, payment/draw visibility, and next steps.', bullets: ['Project status', 'Approvals', 'Payments'] },
  { id: 'employee', title: 'Employee Portal', label: 'Field + Office Work', icon: UsersRound, description: 'Internal CRM, estimating, project workboards, erection schedule, tasks, HR/time/training, punch lists, notes, and uploads.', bullets: ['Assigned work', 'Time + HR', 'Field uploads'] }
];

const adminStats = [
  { label: 'Active Projects', value: '7', note: '3 nearing billing trigger', icon: BriefcaseBusiness },
  { label: 'Quote Follow-Ups', value: '9', note: 'Sales lane needs attention', icon: Megaphone },
  { label: 'Customer Files', value: '18', note: '6 awaiting approval', icon: FileText },
  { label: 'Vendor Items', value: '5', note: '2 due this week', icon: Handshake }
];

const workflowStages = [
  'New Lead',
  'Design',
  'Quote Sent',
  'Client Review',
  'Revisions',
  'PO Signed / Contracted',
  'Engineering',
  'Production',
  'Delivery',
  'Erection',
  'Close-Out'
];

const customers = [
  { company: 'Ocala Commerce Center', contact: 'Dana Miller', email: 'dana@example.com', projects: 2, status: 'Customer portal pending' },
  { company: 'Marion Industrial Park', contact: 'Chris Walker', email: 'chris@example.com', projects: 1, status: 'Quote review' },
  { company: 'Sun State Builders', contact: 'Morgan Lane', email: 'morgan@example.com', projects: 4, status: 'Active project' }
];

const documents = [
  { name: 'Quote SCB-1042.pdf', project: 'Ocala Commerce Center', vault: 'Customer-facing', status: 'Ready to send' },
  { name: 'Internal Estimate Workbook.xlsx', project: 'Marion Industrial Park', vault: 'Employee only', status: 'Estimator review' },
  { name: 'Vendor Steel Package.pdf', project: 'Sun State Builders', vault: 'Vendor assigned', status: 'PO pending' },
  { name: 'Draw Notice M-1.pdf', project: 'Ocala Commerce Center', vault: 'Admin only', status: 'Billing review' }
];

const salesLane = [
  { stage: 'New Leads', count: 12, action: 'Import from AirBuildr / website / manual entry' },
  { stage: 'Design', count: 4, action: 'Attach design files and notes' },
  { stage: 'Quote Sent', count: 8, action: 'Follow-up reminders and quote status' },
  { stage: 'Client Review', count: 3, action: 'Track customer questions and revisions' },
  { stage: 'PO Signed / Contracted', count: 2, action: 'Convert to project delivery board' }
];

const vendorRows = [
  { vendor: 'Steel Supplier A', po: 'PO-2201', project: 'Sun State Builders', due: 'This week', access: 'Assigned files only' },
  { vendor: 'Door Vendor B', po: 'PO-2202', project: 'Ocala Commerce Center', due: 'Next week', access: 'Door package only' },
  { vendor: 'Insulation Vendor C', po: 'PO-2203', project: 'Marion Industrial Park', due: 'Pending quote', access: 'Bid packet only' }
];

const crew = [
  { name: 'Mason Reed', role: 'Shop Lead', status: 'Clocked in', time: '6:42 AM', area: 'Fabrication Bay' },
  { name: 'Elena Cruz', role: 'Project Coordinator', status: 'On site', time: '7:05 AM', area: 'Install Schedule' },
  { name: 'Derek Miles', role: 'Field Crew', status: 'En route', time: '7:18 AM', area: 'Ocala Jobsite' },
  { name: 'Avery Stone', role: 'HR / Admin', status: 'Available', time: '7:30 AM', area: 'Office' }
];

const capacityCards = [
  { title: 'Platform Health', icon: Activity, status: 'Healthy', value: '94%', items: ['Uptime 99.97%', 'Response 186ms', 'Error rate 0.08%'] },
  { title: 'Tenant Load', icon: UsersRound, status: 'Watch', value: '18 orgs', items: ['214 users', '76 active sessions', '2 customers near plan limits'] },
  { title: 'App Server Load', icon: Server, status: 'Good', value: '42% CPU', items: ['Memory 61%', 'Disk 38%', 'Active requests 31'] },
  { title: 'Database Load', icon: Database, status: 'Watch', value: '68%', items: ['DB size 14.2GB', 'Pool usage 72%', '4 slow queries flagged'] },
  { title: 'Storage Usage', icon: HardDrive, status: 'Good', value: '41%', items: ['Quote uploads 18', 'Work photos 9.6GB', 'Large files 12'] },
  { title: 'Security Signals', icon: ShieldAlert, status: 'Review', value: '6 alerts', items: ['Failed login spike', 'API key failures 3', 'Suspicious IPs 2'] }
];

function BrandMark() {
  return <div className="brand"><div className="mark"><span>S</span><span className="beam">C</span><span>B</span></div><div><strong>Steel Craft</strong><small>Iron sharpens iron</small></div></div>;
}

function PortalCard({ portal, enter }) {
  const Icon = portal.icon;
  return <article className="portalCard panel"><div className="icon"><Icon size={24}/></div><p className="eyebrow">{portal.label}</p><h3>{portal.title}</h3><p>{portal.description}</p><div className="miniList">{portal.bullets.map((b) => <span key={b}>{b}</span>)}</div><button className="inlineAction" onClick={() => enter(portal.id)}>Open {portal.title}<ArrowRight size={15}/></button></article>;
}

function Landing({ enter }) {
  return <main className="page landing"><header className="nav panel"><BrandMark /><nav><a href="#portals">Portals</a><a href="#roadmap">Roadmap</a><button onClick={() => enter('admin')}>Open Admin Portal</button></nav></header><section className="hero"><div className="heroText"><p className="eyebrow"><Sparkles size={16}/> Lane 01 foundation</p><h1>Admin-first portal operating system for Steel Craft.</h1><p>The UI/UX lane is approved. This lane opens the Admin Portal and frames the next operational build: users, customers, projects, documents, permissions, sales, vendors, customer visibility, and employee workboards.</p><div className="actions"><button onClick={() => enter('admin')}>Open administration portal <ArrowRight size={18}/></button><a href="#roadmap">View build order</a></div><div className="chips"><span><ShieldCheck size={16}/> Role based</span><span><Database size={16}/> Database ready</span><span><HardDrive size={16}/> Spaces storage path</span></div></div><div className="heroVisual panel"><div className="steelPlate"><div className="redRail"/><h2>SCB</h2><p>Admin controls the portals.</p></div></div></section><section id="portals" className="portalGrid">{portals.map((p) => <PortalCard key={p.id} portal={p} enter={enter} />)}</section><section id="roadmap" className="review panel"><div><p className="eyebrow">Build roadmap</p><h2>Admin first, then Sales, Vendor, Customer, Employee.</h2><p>The first functional milestone is admin login, customer/project creation, document upload, customer-facing visibility, and customer approval.</p></div><div className="reviewSteps"><span>Admin</span><ArrowRight size={15}/><span>Sales</span><ArrowRight size={15}/><span>Vendor</span><ArrowRight size={15}/><span>Customer</span><ArrowRight size={15}/><span>Employee</span></div></section></main>;
}

function StatCard({ item }) {
  const Icon = item.icon;
  return <article className="statCard panel"><div className="icon"><Icon size={22}/></div><strong>{item.value}</strong><span>{item.label}</span><small>{item.note}</small></article>;
}

function WorkflowBoard() {
  return <article className="feature panel fullSpan"><div className="sectionTitle"><div><p className="eyebrow"><Workflow size={14}/> Connected workflow</p><h2>Sales to close-out stage map</h2></div><span className="timePill">Lane 01</span></div><div className="stageRail">{workflowStages.map((stage, index) => <div className="stage" key={stage}><b>{String(index + 1).padStart(2, '0')}</b><span>{stage}</span></div>)}</div></article>;
}

function CustomerTable() {
  return <article className="feature panel"><p className="eyebrow"><Building2 size={14}/> Customer setup</p><h2>Customer records to import</h2><div className="dataRows">{customers.map((row) => <div className="dataRow" key={row.company}><div><strong>{row.company}</strong><span>{row.contact} • {row.email}</span></div><b>{row.projects} projects</b><small>{row.status}</small></div>)}</div></article>;
}

function DocumentVault() {
  return <article className="feature panel"><p className="eyebrow"><FileCheck2 size={14}/> Document vaults</p><h2>Visibility rules</h2><div className="dataRows">{documents.map((doc) => <div className="dataRow" key={doc.name}><div><strong>{doc.name}</strong><span>{doc.project}</span></div><b>{doc.vault}</b><small>{doc.status}</small></div>)}</div></article>;
}

function AdminPortal() {
  return <section className="workspace"><header className="workspaceHeader panel"><div><p className="eyebrow">Operational portal</p><h1>Admin Portal</h1><p>Company-wide oversight of users, customers, projects, employees, documents, billing visibility, vendors, workflow settings, and reporting.</p></div><div className="liveBadge"><ShieldCheck size={22}/> Foundation open</div></header><div className="statsGrid">{adminStats.map((item) => <StatCard item={item} key={item.label} />)}</div><div className="workspaceGrid"><article className="feature panel large"><p className="eyebrow"><LayoutDashboard size={14}/> Control center</p><h2>First operational milestone</h2><p>Admin creates a customer, creates a project, uploads a quote or document, marks it customer-facing, and the customer can view or approve it through the portal.</p><div className="miniList strong"><span>Users + roles</span><span>Customers</span><span>Projects</span><span>Documents</span><span>Permissions</span><span>Activity log</span></div></article><CustomerTable /><DocumentVault /><WorkflowBoard /></div></section>;
}

function SalesPortal() {
  return <section className="workspace"><header className="workspaceHeader panel"><div><p className="eyebrow">Revenue module</p><h1>Sales & Marketing Portal</h1><p>Lead intake, AirBuildr handoff, quote tracking, follow-up reminders, source attribution, close rate, and conversion into contracted jobs.</p></div><div className="liveBadge"><Megaphone size={22}/> Next module</div></header><div className="laneBoard">{salesLane.map((lane) => <article className="lane panel" key={lane.stage}><strong>{lane.count}</strong><h3>{lane.stage}</h3><p>{lane.action}</p></article>)}</div></section>;
}

function VendorPortal() {
  return <section className="workspace"><header className="workspaceHeader panel"><div><p className="eyebrow">Supply network</p><h1>Vendor Portal</h1><p>Vendor access must be tightly permissioned: vendors see only assigned projects, assigned files, PO details, due dates, and upload slots.</p></div><div className="liveBadge"><Handshake size={22}/> Permission-first</div></header><article className="feature panel fullSpan"><p className="eyebrow">Vendor / PO tracking</p><h2>Assigned access preview</h2><div className="vendorRows">{vendorRows.map((row) => <div className="tenantRow" key={row.po}><strong>{row.vendor}</strong><span>{row.po}</span><span>{row.project}</span><span>{row.due}</span><span>{row.access}</span><b>Admin controlled</b></div>)}</div></article></section>;
}

function CustomerPortal() {
  return <section className="workspace"><header className="workspaceHeader panel"><div><p className="eyebrow">Customer visibility</p><h1>Customer Portal</h1><p>Customers see their project status, approved documents, contracts, change orders, payment/draw status, uploads, and next steps.</p></div><div className="liveBadge"><Building2 size={22}/> Secure view</div></header><article className="feature panel large"><h2>Customer-facing rules</h2><p>The customer does not see the master project folder. The portal shows a filtered view approved by admin or assigned employee roles.</p><div className="miniList strong"><span>Approved quote</span><span>Contracts</span><span>Change orders</span><span>Payment draws</span><span>Status barometer</span></div></article></section>;
}

function EmployeePortal() {
  return <section className="workspace"><header className="workspaceHeader panel"><div><p className="eyebrow">Employee operations</p><h1>Employee Portal</h1><p>Internal CRM, estimating, project workboards, erection schedule, tasks, punch lists, notes, field photos, HR/time/training, and payroll-ready records.</p></div><div className="liveBadge"><UsersRound size={22}/> Internal only</div></header><div className="workspaceGrid"><CrewPreview /><TimeClockPreview /></div></section>;
}

function CrewPreview() { return <article className="feature panel crewCard"><div className="sectionTitle"><div><p className="eyebrow"><UserCheck size={14}/> Crew pulse</p><h2>Today's employee board</h2></div><span className="timePill"><Clock3 size={15}/> 7:34 AM</span></div><div className="crewList">{crew.map((member) => <div className="crewRow" key={member.name}><div><strong>{member.name}</strong><span>{member.role} • {member.area}</span></div><div className="crewStatus"><b>{member.status}</b><small>{member.time}</small></div></div>)}</div></article>; }

function TimeClockPreview() { return <article className="feature panel timeClockCard"><p className="eyebrow"><Timer size={14}/> Time clock preview</p><h2>Shop floor clock-in</h2><div className="clockFace"><span>07</span><i>:</i><span>34</span><small>AM</small></div><div className="clockActions"><button>Clock In</button><button className="ghost">Start Break</button></div><p className="microcopy">Preview only — payroll rules and approvals come in a later lane.</p></article>; }

function CapacityCard({ card }) { const Icon = card.icon; return <article className={`capacityCard panel ${card.status.toLowerCase()}`}><div className="capacityCardTop"><div className="icon"><Icon size={22}/></div><span>{card.status}</span></div><h3>{card.title}</h3><strong>{card.value}</strong><div className="capacityItems">{card.items.map((item) => <small key={item}>{item}</small>)}</div></article>; }

function CapacityMonitor() {
  return <main className="capacityPage page"><header className="capacityHero panel"><BrandMark /><div><p className="eyebrow"><Cpu size={15}/> Hidden Developer/Admin Portal</p><h1>Capacity Monitor</h1><p>Operational preview for multi-tenant scale planning without exposing private business records.</p></div><div className="capacityPath">/internal/capacity</div></header><section className="capacityGrid">{capacityCards.map((card) => <CapacityCard card={card} key={card.title} />)}</section><section className="panel capacityPolicy"><h2>Multi-tenant rule</h2><p>Do not split the repo per customer. Use one multi-tenant codebase. Scale infrastructure, rate limits, workers, database/storage capacity, or dedicated tenant deployments as customer usage grows.</p><div className="pricingLadder"><span>Shared SaaS</span><ArrowRight size={15}/><span>Dedicated tenant</span><ArrowRight size={15}/><span>Enterprise private deployment</span></div></section></main>;
}

function Shell({ active, setActive, back }) {
  const selected = useMemo(() => portals.find((p) => p.id === active) || portals[0], [active]);
  const renderPortal = () => {
    if (active === 'sales') return <SalesPortal />;
    if (active === 'vendor') return <VendorPortal />;
    if (active === 'customer') return <CustomerPortal />;
    if (active === 'employee') return <EmployeePortal />;
    return <AdminPortal />;
  };
  return <main className="dashboard"><aside className="side panel"><BrandMark /><p className="sideLabel">Portal suite</p>{portals.map((p) => { const PIcon = p.icon; return <button className={p.id === active ? 'active' : ''} key={p.id} onClick={() => setActive(p.id)}><PIcon size={18}/>{p.title}</button>; })}<div className="sideMeta"><span>Active:</span><strong>{selected.label}</strong></div><button className="back" onClick={back}>Back to landing</button></aside>{renderPortal()}</main>;
}

function Auth({ enter }) { return <main className="auth page"><section className="authCard panel"><BrandMark /><p className="eyebrow"><Lock size={15}/> Secure preview entrance</p><h1>Choose a portal entrance to inspect.</h1><p>This currently simulates authentication and role routing while Lane 01 adds the real auth/database/storage foundation.</p><div className="roleButtons">{portals.map((p) => { const Icon = p.icon; return <button key={p.id} onClick={() => enter(p.id)}><Icon size={20}/><span>{p.title}</span><ArrowRight size={16}/></button>; })}</div></section></main>; }

function App() {
  const initialPath = window.location.pathname.replace('/', '');
  const initialPortal = portals.some((p) => p.id === initialPath) ? initialPath : 'admin';
  const [screen, setScreen] = useState(initialPath && initialPath !== 'internal/capacity' ? 'dashboard' : 'landing');
  const [active, setActiveRaw] = useState(initialPortal);
  const setActive = (id) => { setActiveRaw(id); window.history.replaceState(null, '', `/${id}`); };
  const enter = (id) => { setActive(id); setScreen('dashboard'); };
  if (window.location.pathname === '/internal/capacity') return <CapacityMonitor />;
  if (screen === 'auth') return <Auth enter={enter} />;
  if (screen === 'dashboard') return <Shell active={active} setActive={setActive} back={() => { window.history.replaceState(null, '', '/'); setScreen('landing'); }} />;
  return <Landing enter={enter} />;
}

createRoot(document.getElementById('root')).render(<App />);
