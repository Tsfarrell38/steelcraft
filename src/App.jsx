import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import AccountingPortal from './AccountingPortal.jsx';
import { canonicalPortals, defaultTenantModuleMap, getTenantPortals, industryPacks } from './portalRegistry.js';
import './styles.css';
import './brandGeometry.js';
import './brandThemePacks.js';

const brandKey = 'steelcraft_brand_controls_v1';
const enabledKey = 'steelcraft_enabled_portals_v1';
const developerUnlockKey = 'steelcraft_developer_room_unlocked';

function portalTuple(portal) {
  return [portal.id, portal.title, portal.kind, portal.description, portal];
}

const tenantModuleMap = defaultTenantModuleMap;
const portalRecords = getTenantPortals(tenantModuleMap);
const portals = portalRecords.map(portalTuple);
const developerMeta = ['developer','Developer Room','System builder controls','Brand Room, portal controls, tenant setup, integrations, infrastructure, and module enablement.'];
const customerPortalIds = portalRecords.map((portal) => portal.id);
const canonicalPortalIds = canonicalPortals.map((portal) => portal.id);
const industryPortalIds = industryPacks[tenantModuleMap.industryPack].portals.map((portal) => portal.id);
const defaultEnabledPortals = customerPortalIds;

const baseProfiles = [
  { id:'developer', name:'Max Developer', email:'developer@steelcraft.local', portals: ['developer', ...customerPortalIds] },
  { id:'admin', name:'Admin / Owner', email:'admin@steelcraft.local', portals: customerPortalIds },
  { id:'accounting', name:'Accounting', email:'accounting@steelcraft.local', portals:['accounting','contacts','employee'] },
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
function loadEnabledPortals(){ try { const saved = JSON.parse(localStorage.getItem(enabledKey)); return Array.isArray(saved) && saved.length ? saved.filter((id) => customerPortalIds.includes(id)) : defaultEnabledPortals; } catch { return defaultEnabledPortals; } }
function saveEnabledPortals(next){ localStorage.setItem(enabledKey, JSON.stringify(next)); }
function unlockBrandRoom(){ sessionStorage.setItem(developerUnlockKey, 'true'); }
function lockBrandRoom(){ sessionStorage.removeItem(developerUnlockKey); }
function routePath(){ return location.pathname.replace(/\/$/,'') || '/'; }
function portalUrl(id){ return `/portal/${id}`; }
function pathPortalId(){ const match = routePath().match(/^\/portal\/([^/]+)$/); return match ? match[1] : null; }
function goTo(path){ history.pushState({}, '', path); window.dispatchEvent(new PopStateEvent('popstate')); }
function styleVars(b){ return { '--brand-accent':b.accentColor, '--page-bg':b.pageBgColor, '--surface':b.surfaceColor, '--surface-alt':b.surfaceAltColor, '--text':b.textColor, '--muted':b.mutedTextColor, '--line':b.borderColor, '--button':b.buttonColor, '--button-text':b.buttonTextColor, '--sidebar':b.sidebarColor, '--topbar':b.topbarColor, '--card':b.cardColor, '--input':b.inputColor, '--shadow':b.shadowColor, '--radius':`${b.radius}px`, '--button-radius':`${b.buttonRadius}px`, '--card-padding':`${b.cardPadding}px`, '--gap':`${b.density}px`, '--border-width':`${b.borderWidth}px`, '--shadow-strength':`${b.shadowStrength}%`, '--font-scale':`${b.fontScale}%`, '--logo-size':`${b.logoSize}px` }; }
function meta(id){ return id === 'developer' ? developerMeta : (portals.find(([pid])=>pid===id) || portals[0]); }
function portalRecord(id){ return meta(id)?.[4] || null; }
function initials(text){ return (text || 'Brand').split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase(); }
function enabledPortalMeta(enabledPortals){ return portals.filter(([id]) => enabledPortals.includes(id)); }
function portalPackageLabel(id) { const record = portalRecord(id); return record?.scope === 'industry' ? 'Metal Buildings' : 'Canonical Core'; }

function LogoGlyph({brand}){ if (brand.logoMode === 'none') return null; if (brand.logoMode === 'image' && brand.logoUrl) return <img className={`brand-logo-img logo-${brand.logoShape}`} src={brand.logoUrl} alt={`${brand.logoText} logo`} />; if (brand.logoMode === 'text') return null; return <div className={`brand-initials logo-${brand.logoShape}`}>{initials(brand.logoText)}</div>; }
function BrandMark({brand}){ return <div className={`brand logo-mode-${brand.logoMode}`}><LogoGlyph brand={brand}/><div><strong>{brand.logoText}</strong><small>{brand.logoSubtext}</small></div></div>; }
function DockButton({onClick}){ return <button className="dock-trigger" onClick={onClick} aria-label="Open portal dock"><span></span><span></span><span></span></button>; }
function PortalList({items, active, open}){ return <div className="nav-list">{items.map(([id,title,kind,desc])=><button key={id} className={active===id?'active':''} onClick={()=>open(id)}><strong>{title}</strong><span>{kind}</span><small>{desc}</small></button>)}</div>; }

function Shell({brand,user,active,signOut,children,enabledPortals}){
  const [open,setOpen]=useState(false);
  const allowed=portals.filter(([id]) => user.portals.includes(id) && enabledPortals.includes(id));
  const current=meta(active);
  const permanent=['top-rail','bottom-dock','left-sidebar','right-sidebar'].includes(brand.navLayout);
  const choose=id=>{goTo(portalUrl(id));setOpen(false)};
  return <main className={`dashboard layout-${brand.navLayout} theme-${brand.uiTheme}`} style={styleVars(brand)}><header className="erp-topbar panel"><BrandMark brand={brand}/><div className="topbar-meta"><span>Signed in as</span><strong>{user.name}</strong><small>{allowed.length} portals available</small></div>{brand.navLayout==='top-rail'&&<PortalList items={allowed} active={active} open={choose}/>}<div className="current-portal"><span>Current portal</span><strong>{current[1]}</strong></div><button className="sign-out" onClick={signOut}>Sign out</button></header>{brand.navLayout!=='top-rail'&&<DockButton onClick={()=>setOpen(true)}/>} {(brand.navLayout==='left-sidebar'||brand.navLayout==='right-sidebar')&&<aside className="persistent-sidebar panel"><p className="eyebrow">Portal navigation</p><PortalList items={allowed} active={active} open={choose}/></aside>} {brand.navLayout==='bottom-dock'&&<nav className="bottom-nav panel"><PortalList items={allowed} active={active} open={choose}/></nav>}<div className={`dock-backdrop ${open?'open':''}`} onClick={()=>setOpen(false)}/>{!permanent&&<aside className={`portal-dock panel ${open?'open':''}`}><div className="dock-head"><div><p className="eyebrow">Portal dock</p><h2>Available workspaces</h2></div><button onClick={()=>setOpen(false)}>×</button></div><PortalList items={allowed} active={active} open={choose}/></aside>}<section className="workspace">{children}</section></main>;
}

function DeveloperShell({brand,user,signOut,children}){
  return <main className="dashboard layout-dock-left theme-steelcraft-dark developer-route" style={styleVars(brand)}><header className="erp-topbar panel"><BrandMark brand={brand}/><div className="topbar-meta"><span>Signed in as</span><strong>{user.name}</strong><small>developer-only system area</small></div><div className="current-portal"><span>Current room</span><strong>Developer</strong></div><button className="sign-out" onClick={signOut}>Sign out</button></header><section className="workspace">{children}</section></main>;
}

function Header({id}){ const [,title,kind,desc]=meta(id); return <header className="workspace-header panel"><div><p className="eyebrow">{kind}</p><h1>{title}</h1><p>{desc}</p></div><div className="live-badge">{portalPackageLabel(id)}</div></header>; }
function RecordList({title,rows}){ return <article className="feature panel"><h2>{title}</h2><div className="data-rows">{rows.map(([a,b,c])=><div className="data-row" key={a}><div><strong>{a}</strong><span>{b}</span></div><b>{c}</b></div>)}</div></article>; }
function Portal({id}){ const record = portalRecord(id); const rows = record?.scope === 'industry' ? [[record.title,`${record.canonicalKey} lives in the ${industryPacks[tenantModuleMap.industryPack].title} industry pack.`,record.package],['Data boundary', id === 'projects' ? 'Steel Craft project data should map into metal_building_projects over the canonical project record.' : 'Industry-specific tables should extend the canonical record when needed.','Industry']] : [[record?.title || 'Workspace',`${record?.canonicalKey || id} is part of the reusable core package.`, 'Core'],['Data boundary','Reusable across tenants and industry packs.','Canonical']]; return <><Header id={id}/><div className="workspace-grid"><article className="feature panel large"><p className="eyebrow">{record?.scope === 'industry' ? 'Industry portal' : 'Canonical portal'}</p><h2>{meta(id)[1]}</h2><p>{meta(id)[3]}</p>{id==='projects'&&<div className="notice">Metal Buildings Projects should hold Steel Craft-specific project fields while linking back to the canonical project record.</div>}</article><RecordList title="Portal registry" rows={rows}/></div></>; }

function DeveloperRoom({enabledPortals,setEnabledPortals}) {
  const togglePortal = (portalId) => setEnabledPortals((current) => {
    const next = current.includes(portalId) ? current.filter((id) => id !== portalId) : [...current, portalId];
    saveEnabledPortals(next);
    return next;
  });
  const rows = [
    ['Core Package','Admin, Accounting, Contacts, HR, Vendor, Customer, Employee.','Canonical'],
    ['Industry Pack','Sales, Estimating, Projects, Planning, Purchasing.','Metal Buildings'],
    ['Portal URLs','Each portal has its own route under /portal/{portal-id}.','Live'],
    ['Tenant Module Map',`${tenantModuleMap.tenantName} uses ${tenantModuleMap.industryPack}.`,'Live']
  ];
  const canonicalRows = portals.filter(([id]) => canonicalPortalIds.includes(id));
  const industryRows = portals.filter(([id]) => industryPortalIds.includes(id));
  return <>
    <Header id="developer" />
    <div className="workspace-grid">
      <article className="feature panel large"><p className="eyebrow">Max developer controls</p><h2>System builder room</h2><p>This room lives at /developer and now reads from the tenant module map. Canonical portals are reusable core modules. Sales, Estimating, Projects, Planning, and Purchasing are Metal Buildings industry-pack portals.</p><div className="quote-actions"><button type="button" onClick={() => { unlockBrandRoom(); goTo('/brand'); }}>Open Brand Room</button><button type="button" onClick={() => goTo('/portal/admin')}>Preview Admin Portal</button></div></article>
      <RecordList title="Module map" rows={rows} />
    </div>
    <article className="feature panel access-manager"><p className="eyebrow">Canonical Core</p><h2>Reusable portals every tenant can share</h2><p>Build these first until they are strong enough to branch out and connect quickly across future tenants.</p><div className="portal-permission-grid">{canonicalRows.map(([id,title,kind])=><label className="permission-toggle" key={id}><input type="checkbox" checked={enabledPortals.includes(id)} onChange={()=>togglePortal(id)}/><span><strong>{title}</strong><small>{kind} · core · {portalUrl(id)}</small></span></label>)}</div></article>
    <article className="feature panel access-manager"><p className="eyebrow">Industry Pack / Metal Buildings</p><h2>Steel Craft-specific workflow portals</h2><p>These portals carry industry-specific project, estimating, purchasing, planning, and sales workflow for metal buildings.</p><div className="portal-permission-grid">{industryRows.map(([id,title,kind])=><label className="permission-toggle" key={id}><input type="checkbox" checked={enabledPortals.includes(id)} onChange={()=>togglePortal(id)}/><span><strong>{title}</strong><small>{kind} · metal_buildings · {portalUrl(id)}</small></span></label>)}</div></article>
  </>;
}

function Admin({profiles,setProfiles,enabledPortals}){
  const customerProfiles = profiles.filter((profile) => profile.id !== 'developer');
  const [selected,setSelected]=useState(customerProfiles[0]?.id || 'admin');
  const profile=profiles.find(p=>p.id===selected)||customerProfiles[0];
  const availablePortals = enabledPortalMeta(enabledPortals);
  const toggle=pid=>setProfiles(all=>all.map(p=>p.id!==profile.id?p:{...p, portals:p.portals.includes(pid)?p.portals.filter(x=>x!==pid):[...p.portals,pid]}));
  return <><Header id="admin"/><div className="workspace-grid"><article className="feature panel access-manager"><p className="eyebrow">Admin permissions</p><h2>Assign available portals</h2><p>Admin can assign or restrict user access only within the portals that Max Developer enabled for this tenant.</p><label>Role / user<select value={selected} onChange={e=>setSelected(e.target.value)}>{customerProfiles.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label><div className="portal-permission-grid">{availablePortals.map(([id,title,kind])=><label className="permission-toggle" key={id}><input type="checkbox" checked={profile?.portals.includes(id)} onChange={()=>toggle(id)}/><span><strong>{title}</strong><small>{kind} · {portalPackageLabel(id)}</small></span></label>)}</div></article><RecordList title="Current enabled access" rows={customerProfiles.map(p=>[p.name,p.email,p.portals.filter((id)=>enabledPortals.includes(id)).map(id=>meta(id)[1]).join(', ') || 'No enabled portals'])}/></div></>;
}

function Auth({brand,profiles,onSignIn}){ const [email,setEmail]=useState(''); const [secret,setSecret]=useState(''); const profile=profiles.find(p=>p.email.toLowerCase()===email.toLowerCase()); return <main className={`landing-dark auth-page theme-${brand.uiTheme}`} style={styleVars(brand)}><section className="landing-card panel auth-only"><BrandMark brand={brand}/><p className="eyebrow">Secure authentication</p><h1>{brand.logoText} ERP Login</h1><p>Sign in to continue. Portals use separate URLs and access is assigned by role.</p><label>Email<input value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@company.com"/></label><label>Password<input type="password" value={secret} onChange={e=>setSecret(e.target.value)} placeholder="Password"/></label><button className="auth-submit" onClick={()=>onSignIn(profile||profiles[0])}>Sign in</button></section></main>; }

function BrandControls(){
  if (sessionStorage.getItem(developerUnlockKey) !== 'true') {
    window.location.replace('/developer');
    return null;
  }
  const [brand,setBrand]=useState(loadBrand);
  const update=(k,v)=>{const next={...brand,[k]:v};setBrand(next);saveBrand(next)};
  const upload=e=>{const file=e.target.files?.[0]; if(!file)return; const reader=new FileReader(); reader.onload=()=>update('logoUrl', reader.result); reader.readAsDataURL(file);};
  return <main className={`dashboard brand-controls layout-${brand.navLayout} theme-${brand.uiTheme}`} style={styleVars(brand)}><section className="workspace solo"><header className="workspace-header panel brand-studio-header"><div><p className="eyebrow">Max Developer / Brand Room</p><h1>White-label Design Studio</h1><p>This room belongs under Developer Room. It stays stable while choosing tenant UI/UX, logo, and colors.</p></div><button onClick={()=>{ goTo('/developer'); }}>Back to Developer</button></header><div className="brand-studio-grid"><article className="feature panel"><h2>Logo controls</h2><BrandMark brand={brand}/><label>Upload logo<input type="file" accept="image/*" onChange={upload}/></label><label>Logo URL<input value={brand.logoUrl} onChange={e=>update('logoUrl',e.target.value)} placeholder="https://..."/></label><label>Logo text<input value={brand.logoText} onChange={e=>update('logoText',e.target.value)}/></label><label>Logo subtext<input value={brand.logoSubtext} onChange={e=>update('logoSubtext',e.target.value)}/></label><label>Logo shape<select value={brand.logoShape} onChange={e=>update('logoShape',e.target.value)}><option value="square">Square</option><option value="rounded">Rounded</option><option value="circle">Circle</option><option value="wide">Wide</option></select></label><label className="range-control"><span>Logo size <b>{brand.logoSize}</b></span><input type="range" min="28" max="160" value={brand.logoSize} onChange={e=>update('logoSize',Number(e.target.value))}/></label></article></div></section></main>;
}

function App(){
  const [profiles,setProfiles]=useState(baseProfiles);
  const [enabledPortals,setEnabledPortals]=useState(loadEnabledPortals);
  const [userId,setUserId]=useState(null);
  const [path,setPath]=useState(routePath());
  const brand=useMemo(loadBrand,[]);
  const user=profiles.find(p=>p.id===userId);
  React.useEffect(() => { const onPop = () => setPath(routePath()); window.addEventListener('popstate', onPop); return () => window.removeEventListener('popstate', onPop); }, []);

  if(path === '/brand') return <BrandControls/>;
  const requestedPortal = pathPortalId();
  const isDeveloperPath = path === '/developer';

  if(!user) return <Auth brand={brand} profiles={profiles} onSignIn={p=>{
    setUserId(p.id);
    if (p.id !== 'developer') lockBrandRoom();
    if (isDeveloperPath && p.id === 'developer') return;
    if (requestedPortal && p.portals.includes(requestedPortal) && enabledPortals.includes(requestedPortal)) return;
    const first = p.id === 'developer' ? '/developer' : portalUrl(p.portals.find((id)=>enabledPortals.includes(id)) || 'admin');
    goTo(first);
  }}/>;

  if (isDeveloperPath) {
    if (user.id !== 'developer') goTo(portalUrl(user.portals.find((id)=>enabledPortals.includes(id)) || 'admin'));
    return <DeveloperShell brand={brand} user={user} signOut={()=>{ lockBrandRoom(); setUserId(null); goTo('/'); }}><DeveloperRoom enabledPortals={enabledPortals} setEnabledPortals={setEnabledPortals}/></DeveloperShell>;
  }

  const active = requestedPortal && user.portals.includes(requestedPortal) && enabledPortals.includes(requestedPortal) ? requestedPortal : (user.portals.find((id)=>enabledPortals.includes(id)) || 'admin');
  if (!requestedPortal || requestedPortal !== active) goTo(portalUrl(active));

  return <Shell brand={brand} user={user} active={active} signOut={()=>{ lockBrandRoom(); setUserId(null); goTo('/'); }} enabledPortals={enabledPortals}>{active==='admin'?<Admin profiles={profiles} setProfiles={setProfiles} enabledPortals={enabledPortals}/>:active==='accounting'?<AccountingPortal/>:<Portal id={active}/>}</Shell>;
}

createRoot(document.getElementById('root')).render(<App/>);
