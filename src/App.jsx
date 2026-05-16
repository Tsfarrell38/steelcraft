import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import AccountingPortal from './AccountingPortal.jsx';
import './styles.css';
import './brandGeometry.js';
import './brandThemePacks.js';

const brandKey = 'steelcraft_brand_controls_v1';
const enabledKey = 'steelcraft_enabled_portals_v1';

const portals = [
  ['developer','Developer Room','System builder controls','Brand Room, portal controls, tenant setup, integrations, infrastructure, and module enablement.'],
  ['admin','Admin','Customer admin controls','Users, roles, portal access, and customer-facing admin settings.'],
  ['sales','Sales Portal','Sales pipeline','Leads, opportunities, customers, quote requests, handoff notes, and follow-up.'],
  ['estimating','Estimating Portal','Estimating workflow','Estimate intake, scope builder, cost build, margin review, quote generation, and bid handoff.'],
  ['projects','Projects Portal','Project execution','Contracted jobs, engineering, material, fabrication, delivery, erection schedule, punch, and closeout.'],
  ['planning','Planning Portal','Operations planning','Job readiness, resources, schedule blockers, handoffs, and production/field readiness.'],
  ['accounting','Accounting','Accounting workflow','AR, AP, invoices, bills, payments, chart of accounts, GL, reporting, retainage, and project financials.'],
  ['purchasing','Purchasing Portal','Procurement and POs','Purchase orders, vendor assignment, material purchasing, approvals, due dates, and receiving.'],
  ['hr','HR Portal','Human resources','Salary employee records, PTO, handbook, HR support, onboarding, and training modules. No time clock.'],
  ['contacts','Contacts / CRM','Relationships','Companies, customer contacts, vendor contacts, contractor contacts, project contacts, and account history.'],
  ['vendor','Vendor Portal','Outside vendors','Assigned packages, vendor-facing PO visibility, due dates, upload slots, and packet status.'],
  ['customer','Customer Portal','Outside customers','Approved project status, documents, quotes, contracts, change orders, payments, approvals, and uploads.'],
  ['employee','Employee Self-Service','Employee access','Personal profile, PTO requests, handbook acknowledgements, training assignments, and employee documents.']
];
const customerPortalIds = portals.map(([id]) => id).filter((id) => id !== 'developer');
const defaultEnabledPortals = customerPortalIds;

const baseProfiles = [
  { id:'developer', name:'Developer / Builder', email:'developer@steelcraft.local', portals: portals.map(([id]) => id) },
  { id:'admin', name:'Admin / Owner', email:'admin@steelcraft.local', portals: customerPortalIds },
  { id:'accounting', name:'Accounting', email:'accounting@steelcraft.local', portals:['accounting','purchasing','contacts','employee'] },
  { id:'purchasing', name:'Purchasing', email:'purchasing@steelcraft.local', portals:['purchasing','accounting','projects','planning','vendor','contacts','employee'] },
  { id:'projects', name:'Projects', email:'projects@steelcraft.local', portals:['projects','planning','sales','estimating','customer','contacts','employee'] },
  { id:'sales', name:'Sales', email:'sales@steelcraft.local', portals:['sales','estimating','contacts','customer','employee'] },
  { id:'employee', name:'Employee', email:'employee@steelcraft.local', portals:['employee'] },
  { id:'vendor', name:'Vendor User', email:'vendor@steelcraft.local', portals:['vendor'] },
  { id:'customer', name:'Customer User', email:'customer@steelcraft.local', portals:['customer'] }
];

const brandDefaults = {
  tenantName:'Steel Craft', logoText:'Steel Craft', logoSubtext:'Operations Portal', logoUrl:'', logoMode:'initials', logoShape:'square', navLayout:'dock-left', uiTheme:'steelcraft-dark',
  primaryColor:'#0f1014', accentColor:'#9f3d42', pageBgColor:'#030303', surfaceColor:'#141418', surfaceAltColor:'#1e1e24', textColor:'#f6f0ea', mutedTextColor:'#b7aaa3', borderColor:'#343036', buttonColor:'#9f3d42', buttonTextColor:'#ffffff', successColor:'#3fb56f', warningColor:'#d99b34', dangerColor:'#d34b4b', infoColor:'#4c9bd9', sidebarColor:'#111116', topbarColor:'#111116', cardColor:'#151519', inputColor:'#202026', shadowColor:'#000000',
  radius:22, buttonRadius:999, cardPadding:24, density:14, borderWidth:1, shadowStrength:58, fontScale:100, logoSize:44
};

function loadBrand(){ try { return { ...brandDefaults, ...(JSON.parse(localStorage.getItem(brandKey)) || {}) }; } catch { return brandDefaults; } }
function saveBrand(next){ localStorage.setItem(brandKey, JSON.stringify(next)); }
function loadEnabledPortals(){ try { const saved = JSON.parse(localStorage.getItem(enabledKey)); return Array.isArray(saved) && saved.length ? saved : defaultEnabledPortals; } catch { return defaultEnabledPortals; } }
function saveEnabledPortals(next){ localStorage.setItem(enabledKey, JSON.stringify(next)); }
function styleVars(b){ return { '--brand-accent':b.accentColor, '--page-bg':b.pageBgColor, '--surface':b.surfaceColor, '--surface-alt':b.surfaceAltColor, '--text':b.textColor, '--muted':b.mutedTextColor, '--line':b.borderColor, '--button':b.buttonColor, '--button-text':b.buttonTextColor, '--sidebar':b.sidebarColor, '--topbar':b.topbarColor, '--card':b.cardColor, '--input':b.inputColor, '--shadow':b.shadowColor, '--radius':`${b.radius}px`, '--button-radius':`${b.buttonRadius}px`, '--card-padding':`${b.cardPadding}px`, '--gap':`${b.density}px`, '--border-width':`${b.borderWidth}px`, '--shadow-strength':`${b.shadowStrength}%`, '--font-scale':`${b.fontScale}%`, '--logo-size':`${b.logoSize}px` }; }
function meta(id){ return portals.find(([pid])=>pid===id) || portals[0]; }
function initials(text){ return (text || 'Brand').split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase(); }
function enabledPortalMeta(enabledPortals){ return portals.filter(([id]) => id !== 'developer' && enabledPortals.includes(id)); }

function LogoGlyph({brand}){ if (brand.logoMode === 'none') return null; if (brand.logoMode === 'image' && brand.logoUrl) return <img className={`brand-logo-img logo-${brand.logoShape}`} src={brand.logoUrl} alt={`${brand.logoText} logo`} />; if (brand.logoMode === 'text') return null; return <div className={`brand-initials logo-${brand.logoShape}`}>{initials(brand.logoText)}</div>; }
function BrandMark({brand}){ return <div className={`brand logo-mode-${brand.logoMode}`}><LogoGlyph brand={brand}/><div><strong>{brand.logoText}</strong><small>{brand.logoSubtext}</small></div></div>; }
function DockButton({onClick}){ return <button className="dock-trigger" onClick={onClick} aria-label="Open portal dock"><span></span><span></span><span></span></button>; }
function PortalList({items, active, open}){ return <div className="nav-list">{items.map(([id,title,kind,desc])=><button key={id} className={active===id?'active':''} onClick={()=>open(id)}><strong>{title}</strong><span>{kind}</span><small>{desc}</small></button>)}</div>; }

function Shell({brand,user,active,setActive,signOut,children,enabledPortals}){
  const [open,setOpen]=useState(false);
  const allowed=portals.filter(([id]) => user.portals.includes(id) && (id === 'developer' || enabledPortals.includes(id)));
  const current=meta(active);
  const permanent=['top-rail','bottom-dock','left-sidebar','right-sidebar'].includes(brand.navLayout);
  const choose=id=>{setActive(id);setOpen(false)};
  return <main className={`dashboard layout-${brand.navLayout} theme-${brand.uiTheme}`} style={styleVars(brand)}><header className="erp-topbar panel"><BrandMark brand={brand}/><div className="topbar-meta"><span>Signed in as</span><strong>{user.name}</strong><small>{allowed.length} portals available</small></div>{brand.navLayout==='top-rail'&&<PortalList items={allowed} active={active} open={choose}/>}<div className="current-portal"><span>Current portal</span><strong>{current[1]}</strong></div><button className="sign-out" onClick={signOut}>Sign out</button></header>{brand.navLayout!=='top-rail'&&<DockButton onClick={()=>setOpen(true)}/>} {(brand.navLayout==='left-sidebar'||brand.navLayout==='right-sidebar')&&<aside className="persistent-sidebar panel"><p className="eyebrow">Portal navigation</p><PortalList items={allowed} active={active} open={choose}/></aside>} {brand.navLayout==='bottom-dock'&&<nav className="bottom-nav panel"><PortalList items={allowed} active={active} open={choose}/></nav>}<div className={`dock-backdrop ${open?'open':''}`} onClick={()=>setOpen(false)}/>{!permanent&&<aside className={`portal-dock panel ${open?'open':''}`}><div className="dock-head"><div><p className="eyebrow">Portal dock</p><h2>Available workspaces</h2></div><button onClick={()=>setOpen(false)}>×</button></div><PortalList items={allowed} active={active} open={choose}/></aside>}<section className="workspace">{children}</section></main>;
}

function Header({id}){ const [,title,kind,desc]=meta(id); return <header className="workspace-header panel"><div><p className="eyebrow">{kind}</p><h1>{title}</h1><p>{desc}</p></div><div className="live-badge">Backend connected</div></header>; }
function RecordList({title,rows}){ return <article className="feature panel"><h2>{title}</h2><div className="data-rows">{rows.map(([a,b,c])=><div className="data-row" key={a}><div><strong>{a}</strong><span>{b}</span></div><b>{c}</b></div>)}</div></article>; }
function Portal({id}){ const rows = id==='projects' ? [['Erection schedule','Crew planning, erection dates, field readiness, and conflicts.','Projects'],['Project dashboard','Contracted jobs and project status.','Projects']] : [['Workspace','Role-based ERP lane.','Ready'],['Next build','Forms, tables, records, and workflow actions.','Scaffold']]; return <><Header id={id}/><div className="workspace-grid"><article className="feature panel large"><p className="eyebrow">ERP work portal</p><h2>{meta(id)[1]}</h2><p>{meta(id)[3]}</p>{id==='projects'&&<div className="notice">Erection Schedule lives under Projects.</div>}</article><RecordList title="Portal map" rows={rows}/></div></>; }

function DeveloperRoom({enabledPortals,setEnabledPortals,setActive}) {
  const togglePortal = (portalId) => setEnabledPortals((current) => {
    const next = current.includes(portalId) ? current.filter((id) => id !== portalId) : [...current, portalId];
    saveEnabledPortals(next);
    return next;
  });
  const rows = [
    ['Brand Room','Open the locked/stable Brand Room for logo, UI/UX style, color, and tenant look.','/brand'],
    ['Portal Controls','Turn customer portals on/off before Admin can assign users.','Live'],
    ['Tenant Settings','Tenant name, modules, accounting infrastructure, integrations, and DAG/ledger rails.','Next'],
    ['Infrastructure','Accounting, packets, runners, QC, approval logs, and proof events.','Next']
  ];
  return <>
    <Header id="developer" />
    <div className="workspace-grid">
      <article className="feature panel large"><p className="eyebrow">Developer controls</p><h2>System builder room</h2><p>This is where the powerful controls live. Brand Room and portal enablement are developer-level. Admin only sees the customer portals enabled here.</p><div className="quote-actions"><button type="button" onClick={() => { window.location.href = '/brand'; }}>Open Brand Room</button><button type="button" onClick={() => setActive('admin')}>Review Admin Portal</button></div></article>
      <RecordList title="Developer areas" rows={rows} />
    </div>
    <article className="feature panel access-manager"><p className="eyebrow">Portal Controls</p><h2>Choose which portals exist for this tenant</h2><p>Disabled portals disappear from Admin and from user navigation, even if a profile has that portal in its access list.</p><div className="portal-permission-grid">{enabledPortalMeta(defaultEnabledPortals).map(([id,title,kind])=><label className="permission-toggle" key={id}><input type="checkbox" checked={enabledPortals.includes(id)} onChange={()=>togglePortal(id)}/><span><strong>{title}</strong><small>{kind}</small></span></label>)}</div></article>
  </>;
}

function Admin({profiles,setProfiles,enabledPortals}){
  const customerProfiles = profiles.filter((profile) => profile.id !== 'developer');
  const [selected,setSelected]=useState(customerProfiles[0]?.id || 'admin');
  const profile=profiles.find(p=>p.id===selected)||customerProfiles[0];
  const availablePortals = enabledPortalMeta(enabledPortals);
  const toggle=pid=>setProfiles(all=>all.map(p=>p.id!==profile.id?p:{...p, portals:p.portals.includes(pid)?p.portals.filter(x=>x!==pid):[...p.portals,pid]}));
  return <><Header id="admin"/><div className="workspace-grid"><article className="feature panel access-manager"><p className="eyebrow">Admin permissions</p><h2>Assign enabled portals only</h2><p>Developer Room controls which portals exist. Admin can only assign access inside that enabled set.</p><label>Role / user<select value={selected} onChange={e=>setSelected(e.target.value)}>{customerProfiles.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label><div className="portal-permission-grid">{availablePortals.map(([id,title,kind])=><label className="permission-toggle" key={id}><input type="checkbox" checked={profile?.portals.includes(id)} onChange={()=>toggle(id)}/><span><strong>{title}</strong><small>{kind}</small></span></label>)}</div></article><RecordList title="Current enabled access" rows={customerProfiles.map(p=>[p.name,p.email,p.portals.filter((id)=>enabledPortals.includes(id)).map(id=>meta(id)[1]).join(', ') || 'No enabled portals'])}/></div></>;
}

function Auth({brand,profiles,onSignIn}){ const [email,setEmail]=useState(''); const [secret,setSecret]=useState(''); const profile=profiles.find(p=>p.email.toLowerCase()===email.toLowerCase()); return <main className={`landing-dark auth-page theme-${brand.uiTheme}`} style={styleVars(brand)}><section className="landing-card panel auth-only"><BrandMark brand={brand}/><p className="eyebrow">Secure authentication</p><h1>{brand.logoText} ERP Login</h1><p>Sign in to continue. Portal access is assigned by the administrator after authentication.</p><label>Email<input value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@company.com"/></label><label>Password<input type="password" value={secret} onChange={e=>setSecret(e.target.value)} placeholder="Password"/></label><button className="auth-submit" onClick={()=>onSignIn(profile||profiles[0])}>Sign in</button></section></main>; }

function BrandControls(){
  const [brand,setBrand]=useState(loadBrand);
  const update=(k,v)=>{const next={...brand,[k]:v};setBrand(next);saveBrand(next)};
  const upload=e=>{const file=e.target.files?.[0]; if(!file)return; const reader=new FileReader(); reader.onload=()=>update('logoUrl', reader.result); reader.readAsDataURL(file);};
  return <main className={`dashboard brand-controls layout-${brand.navLayout} theme-${brand.uiTheme}`} style={styleVars(brand)}><section className="workspace solo"><header className="workspace-header panel brand-studio-header"><div><p className="eyebrow">Developer / Brand Room</p><h1>White-label Design Studio</h1><p>This room belongs under Developer Room. It stays stable while choosing tenant UI/UX, logo, and colors.</p></div><button onClick={()=>{ window.location.href='/'; }}>Back to ERP</button></header><div className="brand-studio-grid"><article className="feature panel"><h2>Logo controls</h2><BrandMark brand={brand}/><label>Upload logo<input type="file" accept="image/*" onChange={upload}/></label><label>Logo URL<input value={brand.logoUrl} onChange={e=>update('logoUrl',e.target.value)} placeholder="https://..."/></label><label>Logo text<input value={brand.logoText} onChange={e=>update('logoText',e.target.value)}/></label><label>Logo subtext<input value={brand.logoSubtext} onChange={e=>update('logoSubtext',e.target.value)}/></label><label>Logo shape<select value={brand.logoShape} onChange={e=>update('logoShape',e.target.value)}><option value="square">Square</option><option value="rounded">Rounded</option><option value="circle">Circle</option><option value="wide">Wide</option></select></label><label className="range-control"><span>Logo size <b>{brand.logoSize}</b></span><input type="range" min="28" max="160" value={brand.logoSize} onChange={e=>update('logoSize',Number(e.target.value))}/></label></article></div></section></main>;
}

function App(){
  const [profiles,setProfiles]=useState(baseProfiles);
  const [enabledPortals,setEnabledPortals]=useState(loadEnabledPortals);
  const [userId,setUserId]=useState(null);
  const [active,setActive]=useState('developer');
  const brand=useMemo(loadBrand,[]);
  const user=profiles.find(p=>p.id===userId);
  if(location.pathname.replace(/\/$/,'')==='/brand') return <BrandControls/>;
  if(!user) return <Auth brand={brand} profiles={profiles} onSignIn={p=>{setUserId(p.id); const first=p.portals.find((id)=>id==='developer'||enabledPortals.includes(id)) || 'admin'; setActive(first);}}/>;
  const allowed = user.portals.filter((id) => id === 'developer' || enabledPortals.includes(id));
  const safe=allowed.includes(active)?active:allowed[0]||'admin';
  return <Shell brand={brand} user={user} active={safe} setActive={setActive} signOut={()=>setUserId(null)} enabledPortals={enabledPortals}>{safe==='developer'?<DeveloperRoom enabledPortals={enabledPortals} setEnabledPortals={setEnabledPortals} setActive={setActive}/>:safe==='admin'?<Admin profiles={profiles} setProfiles={setProfiles} enabledPortals={enabledPortals}/>:safe==='accounting'?<AccountingPortal/>:<Portal id={safe}/>}</Shell>;
}

createRoot(document.getElementById('root')).render(<App/>);
