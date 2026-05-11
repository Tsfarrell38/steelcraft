import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowRight, BriefcaseBusiness, Building2, CheckCircle2, FileText, Handshake, HardHat, LayoutDashboard, Lock, Megaphone, ShieldCheck, Sparkles, UsersRound } from 'lucide-react';
import './styles.css';

const portals = [
  { id: 'admin', title: 'Admin Portal', label: 'Executive Command', icon: LayoutDashboard, description: 'Ownership view for company controls, users, approvals, reporting, and operational oversight.', bullets: ['Company dashboard', 'User access', 'Approval queue'] },
  { id: 'hr', title: 'HR Portal', label: 'People Operations', icon: UsersRound, description: 'A polished entrance for employee records, onboarding, HR documents, time off, and internal requests.', bullets: ['Employee records', 'Onboarding', 'HR requests'] },
  { id: 'projects', title: 'Projects Portal', label: 'Fabrication Pipeline', icon: BriefcaseBusiness, description: 'The front door for jobs, milestones, drawings, field status, installation tracking, and project documents.', bullets: ['Active jobs', 'Milestones', 'Project files'] },
  { id: 'sales', title: 'Sales & Marketing Portal', label: 'Revenue Engine', icon: Megaphone, description: 'A sleek workspace entrance for leads, bids, quotes, customer follow-up, and marketing activity.', bullets: ['Leads', 'Quotes', 'Campaigns'] },
  { id: 'vendor', title: 'Vendor Portal', label: 'Supply Network', icon: Handshake, description: 'A dedicated partner entrance for vendor documents, material requests, delivery status, and supplier updates.', bullets: ['Material requests', 'Delivery status', 'Vendor docs'] }
];

function BrandMark() {
  return <div className="brand"><div className="mark"><span>S</span><span className="beam">C</span><span>B</span></div><div><strong>Steel Craft</strong><small>Iron sharpens iron</small></div></div>;
}

function Landing({ goAuth }) {
  return <main className="page landing">
    <header className="nav panel"><BrandMark /><nav><a href="#portals">Portals</a><a href="#verify">UI/UX Review</a><button onClick={goAuth}>Enter Preview</button></nav></header>
    <section className="hero">
      <div className="heroText">
        <p className="eyebrow"><Sparkles size={16}/> Steel Craft portal preview lane</p>
        <h1>Luxury futuristic portal entrances for Steel Craft.</h1>
        <p>This first worktree is only for UI/UX verification and the beginning entrance of each portal. No deep functionality is being built yet.</p>
        <div className="actions"><button onClick={goAuth}>Open portal preview <ArrowRight size={18}/></button><a href="#portals">Review modules</a></div>
        <div className="chips"><span><ShieldCheck size={16}/> Role based</span><span><HardHat size={16}/> Steel operations</span><span><CheckCircle2 size={16}/> Review first</span></div>
      </div>
      <div className="heroVisual panel"><div className="steelPlate"><div className="redRail"/><h2>SCB</h2><p>Black. Iron red. White. Metallic luxury.</p></div></div>
    </section>
    <section id="portals" className="portalGrid">{portals.map((p) => <PortalCard key={p.id} portal={p} />)}</section>
    <section id="verify" className="review panel"><div><p className="eyebrow">Lane 00</p><h2>UI/UX verification gate</h2><p>Approve the visual direction before deeper portal workflows begin.</p></div><div className="reviewSteps"><span>Landing</span><ArrowRight size={15}/><span>Authentication</span><ArrowRight size={15}/><span>Portal Entrances</span><ArrowRight size={15}/><span>Approval</span></div></section>
  </main>;
}

function PortalCard({ portal }) {
  const Icon = portal.icon;
  return <article className="portalCard panel"><div className="icon"><Icon size={24}/></div><p className="eyebrow">{portal.label}</p><h3>{portal.title}</h3><p>{portal.description}</p><div className="miniList">{portal.bullets.map((b) => <span key={b}>{b}</span>)}</div></article>;
}

function Auth({ enter }) {
  return <main className="auth page"><section className="authCard panel"><BrandMark /><p className="eyebrow"><Lock size={15}/> Secure preview entrance</p><h1>Choose a portal entrance to inspect.</h1><p>This simulates authentication and role routing for visual approval.</p><div className="roleButtons">{portals.map((p) => { const Icon = p.icon; return <button key={p.id} onClick={() => enter(p.id)}><Icon size={20}/><span>{p.title}</span><ArrowRight size={16}/></button>; })}</div></section></main>;
}

function Dashboard({ active, setActive, back }) {
  const selected = useMemo(() => portals.find((p) => p.id === active) || portals[0], [active]);
  const Icon = selected.icon;
  return <main className="dashboard">
    <aside className="side panel"><BrandMark />{portals.map((p) => { const PIcon = p.icon; return <button className={p.id === active ? 'active' : ''} key={p.id} onClick={() => setActive(p.id)}><PIcon size={18}/>{p.title}</button>; })}<button className="back" onClick={back}>Back to landing</button></aside>
    <section className="workspace"><header className="workspaceHeader panel"><div><p className="eyebrow">Portal entrance preview</p><h1>{selected.title}</h1><p>{selected.description}</p></div><div className="liveBadge"><Icon size={22}/> Visual only</div></header><div className="workspaceGrid"><article className="feature panel large"><h2>{selected.label}</h2><p>This is the first-look entrance for client review. The next lane begins only after the visual direction is approved and hardened.</p><div className="miniList strong">{selected.bullets.map((b) => <span key={b}>{b}</span>)}</div></article><article className="feature panel"><h2>Review Checklist</h2><ul><li>Color scheme matches SCB logo.</li><li>Luxury futuristic style is consistent.</li><li>Each portal has a clear entrance.</li><li>No deep functionality yet.</li></ul></article><article className="feature panel"><h2>Next Gate</h2><p>After approval, this lane will be hardened, then the next dedicated worktree will begin.</p></article></div></section>
  </main>;
}

function App() {
  const [screen, setScreen] = useState('landing');
  const [active, setActive] = useState('admin');
  if (screen === 'auth') return <Auth enter={(id) => { setActive(id); setScreen('dashboard'); }} />;
  if (screen === 'dashboard') return <Dashboard active={active} setActive={setActive} back={() => setScreen('landing')} />;
  return <Landing goAuth={() => setScreen('auth')} />;
}

createRoot(document.getElementById('root')).render(<App />);
