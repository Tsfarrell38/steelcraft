import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Activity, AlertTriangle, ArrowRight, BriefcaseBusiness, CheckCircle2, Clock3, Cpu, Database, Gauge, Handshake, HardDrive, HardHat, LayoutDashboard, Lock, Mail, Megaphone, Server, ShieldAlert, ShieldCheck, Sparkles, Timer, UserCheck, UsersRound, Wifi, Workflow } from 'lucide-react';
import './styles.css';

const portals = [
  { id: 'admin', title: 'Admin Portal', label: 'Executive Command', icon: LayoutDashboard, description: 'Ownership view for company controls, users, approvals, reporting, and operational oversight.', bullets: ['Company dashboard', 'User access', 'Approval queue'] },
  { id: 'hr', title: 'HR Portal', label: 'People Operations', icon: UsersRound, description: 'A polished entrance for employee records, onboarding, HR documents, time off, and internal requests.', bullets: ['Employee records', 'Onboarding', 'HR requests'] },
  { id: 'projects', title: 'Projects Portal', label: 'Fabrication Pipeline', icon: BriefcaseBusiness, description: 'The front door for jobs, milestones, drawings, field status, installation tracking, and project documents.', bullets: ['Active jobs', 'Milestones', 'Project files'] },
  { id: 'sales', title: 'Sales & Marketing Portal', label: 'Revenue Engine', icon: Megaphone, description: 'A sleek workspace entrance for leads, bids, quotes, customer follow-up, and marketing activity.', bullets: ['Leads', 'Quotes', 'Campaigns'] },
  { id: 'vendor', title: 'Vendor Portal', label: 'Supply Network', icon: Handshake, description: 'A dedicated partner entrance for vendor documents, material requests, delivery status, and supplier updates.', bullets: ['Material requests', 'Delivery status', 'Vendor docs'] }
];

const crew = [
  { name: 'Mason Reed', role: 'Shop Lead', status: 'Clocked in', time: '6:42 AM', area: 'Fabrication Bay' },
  { name: 'Elena Cruz', role: 'Project Coordinator', status: 'On site', time: '7:05 AM', area: 'Install Schedule' },
  { name: 'Derek Miles', role: 'Field Crew', status: 'En route', time: '7:18 AM', area: 'Ocala Jobsite' },
  { name: 'Avery Stone', role: 'HR / Admin', status: 'Available', time: '7:30 AM', area: 'Office' }
];

const portalSnapshots = {
  admin: ['14 approvals pending', '3 active departments', '98% documentation complete'],
  hr: ['12 employees active', '4 timecards awaiting review', '2 onboarding packets open'],
  projects: ['7 projects in motion', '3 installs scheduled', '11 drawings under review'],
  sales: ['$184K quoted this week', '9 follow-ups due', '3 campaigns active'],
  vendor: ['5 deliveries inbound', '2 material requests pending', '8 vendor docs current']
};

const capacityCards = [
  { title: 'Platform Health', icon: Activity, status: 'Healthy', value: '94%', items: ['Uptime 99.97%', 'Response 186ms', 'Error rate 0.08%'] },
  { title: 'Tenant Load', icon: UsersRound, status: 'Watch', value: '18 orgs', items: ['214 users', '76 active sessions', '2 customers near plan limits'] },
  { title: 'App Server Load', icon: Server, status: 'Good', value: '42% CPU', items: ['Memory 61%', 'Disk 38%', 'Active requests 31'] },
  { title: 'Database Load', icon: Database, status: 'Watch', value: '68%', items: ['DB size 14.2GB', 'Pool usage 72%', '4 slow queries flagged'] },
  { title: 'API Traffic', icon: Gauge, status: 'Good', value: '1.8k rpm', items: ['9 failed requests', 'Peak customer: Ocala Ops', 'Rate-limit warnings 2'] },
  { title: 'Sensor Ingestion', icon: Wifi, status: 'Watch', value: '12k/min', items: ['Queue backlog 340', 'Offline devices 7', 'Failed payloads 18'] },
  { title: 'Storage Usage', icon: HardDrive, status: 'Good', value: '41%', items: ['Logo uploads 18', 'Work photos 9.6GB', 'Large files 12'] },
  { title: 'Email Health', icon: Mail, status: 'Good', value: '482 sent', items: ['Failed emails 3', 'Bounces 2', 'Invite health normal'] },
  { title: 'Worker Queue', icon: Workflow, status: 'Watch', value: '126 jobs', items: ['Retries 14', 'Avg job 1.8s', 'Stuck jobs 1'] },
  { title: 'Security Signals', icon: ShieldAlert, status: 'Review', value: '6 alerts', items: ['Failed login spike', 'API key failures 3', 'Suspicious IPs 2'] }
];

const tenantRows = [
  { org: 'SteelCraft Demo', users: '24 / 50', modules: '6 enabled', sessions: 12, plan: 'Shared SaaS', usage: '48%' },
  { org: 'Ocala Fabrication', users: '88 / 100', modules: '8 enabled', sessions: 31, plan: 'Dedicated candidate', usage: '88%' },
  { org: 'FieldOps Private', users: '102 / 250', modules: '10 enabled', sessions: 54, plan: 'Enterprise private', usage: '41%' }
];

const recommendations = [
  'Add a worker server if queue depth stays above 250 for 15 minutes.',
  'Increase database size before storage reaches 80%.',
  'Move high-volume customers to dedicated tenant when usage exceeds shared limits twice in a billing cycle.',
  'Apply API rate limits for suspicious spikes and repeated token failures.',
  'Plan read replicas once dashboard query latency exceeds 500ms under normal load.'
];

function BrandMark() {
  return <div className="brand"><div className="mark"><span>S</span><span className="beam">C</span><span>B</span></div><div><strong>Steel Craft</strong><small>Iron sharpens iron</small></div></div>;
}

function Landing({ goAuth }) {
  return <main className="page landing"><header className="nav panel"><BrandMark /><nav><a href="#portals">Portals</a><a href="#verify">UI/UX Review</a><button onClick={goAuth}>Enter Preview</button></nav></header><section className="hero"><div className="heroText"><p className="eyebrow"><Sparkles size={16}/> Steel Craft portal preview lane</p><h1>Luxury futuristic portal entrances for Steel Craft.</h1><p>This first worktree is only for UI/UX verification and the beginning entrance of each portal. No deep functionality is being built yet.</p><div className="actions"><button onClick={goAuth}>Open portal preview <ArrowRight size={18}/></button><a href="#portals">Review modules</a></div><div className="chips"><span><ShieldCheck size={16}/> Role based</span><span><HardHat size={16}/> Steel operations</span><span><CheckCircle2 size={16}/> Review first</span></div></div><div className="heroVisual panel"><div className="steelPlate"><div className="redRail"/><h2>SCB</h2><p>Black. Iron red. White. Metallic luxury.</p></div></div></section><section id="portals" className="portalGrid">{portals.map((p) => <PortalCard key={p.id} portal={p} />)}</section><section id="verify" className="review panel"><div><p className="eyebrow">Lane 00</p><h2>UI/UX verification gate</h2><p>Approve the visual direction before deeper portal workflows begin.</p></div><div className="reviewSteps"><span>Landing</span><ArrowRight size={15}/><span>Authentication</span><ArrowRight size={15}/><span>Portal Entrances</span><ArrowRight size={15}/><span>Approval</span></div></section></main>;
}

function PortalCard({ portal }) { const Icon = portal.icon; return <article className="portalCard panel"><div className="icon"><Icon size={24}/></div><p className="eyebrow">{portal.label}</p><h3>{portal.title}</h3><p>{portal.description}</p><div className="miniList">{portal.bullets.map((b) => <span key={b}>{b}</span>)}</div></article>; }

function Auth({ enter }) { return <main className="auth page"><section className="authCard panel"><BrandMark /><p className="eyebrow"><Lock size={15}/> Secure preview entrance</p><h1>Choose a portal entrance to inspect.</h1><p>This simulates authentication and role routing for visual approval.</p><div className="roleButtons">{portals.map((p) => { const Icon = p.icon; return <button key={p.id} onClick={() => enter(p.id)}><Icon size={20}/><span>{p.title}</span><ArrowRight size={16}/></button>; })}</div></section></main>; }

function CrewPreview() { return <article className="feature panel crewCard"><div className="sectionTitle"><div><p className="eyebrow"><UserCheck size={14}/> Crew pulse</p><h2>Today&apos;s employee board</h2></div><span className="timePill"><Clock3 size={15}/> 7:34 AM</span></div><div className="crewList">{crew.map((member) => <div className="crewRow" key={member.name}><div><strong>{member.name}</strong><span>{member.role} • {member.area}</span></div><div className="crewStatus"><b>{member.status}</b><small>{member.time}</small></div></div>)}</div></article>; }

function TimeClockPreview() { return <article className="feature panel timeClockCard"><p className="eyebrow"><Timer size={14}/> Time clock preview</p><h2>Shop floor clock-in</h2><div className="clockFace"><span>07</span><i>:</i><span>34</span><small>AM</small></div><div className="clockActions"><button>Clock In</button><button className="ghost">Start Break</button></div><p className="microcopy">Preview only — final time clock rules, payroll logic, and approvals come in a later lane.</p></article>; }

function PortalSnapshot({ active }) { const items = portalSnapshots[active] || portalSnapshots.admin; return <article className="feature panel"><p className="eyebrow">Portal snapshot</p><h2>Operational spice layer</h2><div className="snapshotList">{items.map((item) => <span key={item}>{item}</span>)}</div></article>; }

function Dashboard({ active, setActive, back }) {
  const selected = useMemo(() => portals.find((p) => p.id === active) || portals[0], [active]); const Icon = selected.icon;
  return <main className="dashboard"><aside className="side panel"><BrandMark />{portals.map((p) => { const PIcon = p.icon; return <button className={p.id === active ? 'active' : ''} key={p.id} onClick={() => setActive(p.id)}><PIcon size={18}/>{p.title}</button>; })}<button className="back" onClick={back}>Back to landing</button></aside><section className="workspace"><header className="workspaceHeader panel"><div><p className="eyebrow">Portal entrance preview</p><h1>{selected.title}</h1><p>{selected.description}</p></div><div className="liveBadge"><Icon size={22}/> Visual only</div></header><div className="workspaceGrid"><article className="feature panel large"><h2>{selected.label}</h2><p>This is the first-look entrance for client review. The next lane begins only after the visual direction is approved and hardened.</p><div className="miniList strong">{selected.bullets.map((b) => <span key={b}>{b}</span>)}</div></article><CrewPreview /><TimeClockPreview /><PortalSnapshot active={active} /><article className="feature panel"><h2>Review Checklist</h2><ul><li>Color scheme matches SCB logo.</li><li>Luxury futuristic style is consistent.</li><li>Each portal has a clear entrance.</li><li>No deep functionality yet.</li></ul></article><article className="feature panel"><h2>Next Gate</h2><p>After approval, this lane will be hardened, then the next dedicated worktree will begin.</p></article></div></section></main>;
}

function CapacityCard({ card }) { const Icon = card.icon; return <article className={`capacityCard panel ${card.status.toLowerCase()}`}><div className="capacityCardTop"><div className="icon"><Icon size={22}/></div><span>{card.status}</span></div><h3>{card.title}</h3><strong>{card.value}</strong><div className="capacityItems">{card.items.map((item) => <small key={item}>{item}</small>)}</div></article>; }

function CapacityMonitor() {
  return <main className="capacityPage page"><header className="capacityHero panel"><BrandMark /><div><p className="eyebrow"><Cpu size={15}/> Hidden Developer/Admin Portal</p><h1>Capacity Monitor</h1><p>Operational preview for multi-tenant scale planning. This shows health signals by customer without exposing private business records.</p></div><div className="capacityPath">/internal/capacity</div></header><section className="capacityGrid">{capacityCards.map((card) => <CapacityCard card={card} key={card.title} />)}</section><section className="capacitySplit"><article className="panel capacityTable"><p className="eyebrow">Tenant capacity</p><h2>Customer / organization load</h2><div className="tenantRows">{tenantRows.map((row) => <div className="tenantRow" key={row.org}><strong>{row.org}</strong><span>{row.users}</span><span>{row.modules}</span><span>{row.sessions} sessions</span><span>{row.plan}</span><b>{row.usage}</b></div>)}</div></article><article className="panel capacityRules"><p className="eyebrow"><AlertTriangle size={15}/> Scale recommendations</p><h2>When to scale</h2>{recommendations.map((item) => <div className="recommendation" key={item}>{item}</div>)}</article></section><section className="panel capacityPolicy"><h2>Multi-tenant rule</h2><p>Do not split the repo per customer. Use one multi-tenant codebase. Use this monitor to decide when to scale infrastructure, apply rate limits, add workers, increase database/storage capacity, or move a customer to dedicated tenant / enterprise private deployment.</p><div className="pricingLadder"><span>Shared SaaS</span><ArrowRight size={15}/><span>Dedicated tenant</span><ArrowRight size={15}/><span>Enterprise private deployment</span></div><p className="microcopy">Privacy guardrail: deeper customer workspace access requires support approval, logged reason, and audit trail.</p></section></main>;
}

function App() {
  const [screen, setScreen] = useState('landing'); const [active, setActive] = useState('admin');
  if (window.location.pathname === '/internal/capacity') return <CapacityMonitor />;
  if (screen === 'auth') return <Auth enter={(id) => { setActive(id); setScreen('dashboard'); }} />;
  if (screen === 'dashboard') return <Dashboard active={active} setActive={setActive} back={() => setScreen('landing')} />;
  return <Landing goAuth={() => setScreen('auth')} />;
}

createRoot(document.getElementById('root')).render(<App />);
