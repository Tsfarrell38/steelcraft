const KEY = 'steelcraft_brand_controls_v1';
const OLD_LOCK_KEY = 'steelcraft_brand_ui_locked_v1';

const baseDark = {
  pageBgColor:'#06070b', surfaceColor:'#11141c', surfaceAltColor:'#1a202b', cardColor:'#121722', inputColor:'#171f2b',
  textColor:'#f5f7fb', mutedTextColor:'#a8b2c2', borderColor:'#2d3748', sidebarColor:'#10141d', topbarColor:'#10141d', shadowColor:'#000000'
};
const baseLight = {
  pageBgColor:'#f4f6f8', surfaceColor:'#ffffff', surfaceAltColor:'#edf1f5', cardColor:'#ffffff', inputColor:'#ffffff',
  textColor:'#152033', mutedTextColor:'#5d6678', borderColor:'#d7dee8', sidebarColor:'#ffffff', topbarColor:'#ffffff', shadowColor:'#aeb7c5'
};

const styleDefs = [
  ['Luxury','Premium executive, larger cards, boardroom spacing.','command-center',30,999,34,20,82,'#b9914b'],
  ['Industrial','Steel shop, practical panels, strong operations feel.','dock-left',6,4,22,12,64,'#9f3d42'],
  ['Executive','Clean office ERP, readable, calm, professional.','top-rail',16,10,22,12,58,'#1f4f82'],
  ['Field','Large touch targets for shop, tablet, and field work.','bottom-dock',18,12,34,24,86,'#d99b34'],
  ['Sport','Sharp, energetic, high-contrast operations style.','bottom-dock',10,6,28,18,74,'#e84a5f'],
  ['Architectural','Clean grid, blueprint feel, square technical lines.','left-sidebar',0,0,20,10,60,'#4c9bd9'],
  ['Modern','Rounded SaaS look with balanced dashboard spacing.','dock-right',24,999,26,16,66,'#7c4dff'],
  ['Client Soft','Warm customer-facing style with softer edges.','top-rail',32,999,30,18,66,'#8a4e32'],
  ['Finance Ledger','Compact table-first accounting and reporting view.','left-sidebar',4,4,16,6,48,'#5db0ff'],
  ['Command Center','Dark control-room dashboard, status focused.','command-center',24,999,28,18,70,'#38bdf8'],
  ['Minimal Grid','Quiet, thin-border ERP with simple flat panels.','top-rail',2,2,16,8,54,'#64748b'],
  ['Warm Studio','Soft creative workspace with warm neutral surfaces.','dock-left',26,20,28,18,70,'#b7794d']
];

const palettes = {
  Luxury:[['Black Gold','#b9914b'],['Copper','#b46b48'],['Platinum','#a3a3a3'],['Champagne','#d6b66d']],
  Industrial:[['Steel Red','#9f3d42'],['Safety Amber','#d99b34'],['Weld Blue','#4c9bd9'],['Iron Gray','#71717a']],
  Executive:[['Navy','#1f4f82'],['Slate','#475569'],['Burgundy','#7f1d1d'],['Boardroom Green','#2f5d50']],
  Field:[['Caution Gold','#d99b34'],['Work Green','#5f8d3b'],['Field Blue','#4c9bd9'],['Safety Orange','#f97316']],
  Sport:[['Redline','#e84a5f'],['Track Orange','#f97316'],['Electric Lime','#84cc16'],['Race Blue','#2563eb']],
  Architectural:[['Blueprint','#4c9bd9'],['Graphite','#94a3b8'],['Concrete Tan','#b59b7a'],['Ink Black','#111827']],
  Modern:[['Violet','#7c4dff'],['Cyan','#38bdf8'],['Rose','#c45f7d'],['Emerald','#10b981']],
  'Client Soft':[['Warm Brown','#8a4e32'],['Soft Green','#4f7b5b'],['Quiet Navy','#335c81'],['Clay','#b7794d']],
  'Finance Ledger':[['Ledger Blue','#5db0ff'],['Bank Green','#3fb56f'],['Audit Slate','#64748b'],['Deep Navy','#1d4ed8']],
  'Command Center':[['Control Cyan','#38bdf8'],['Signal Purple','#8b5cf6'],['Alert Amber','#f59e0b'],['Ops Green','#22c55e']],
  'Minimal Grid':[['Slate','#64748b'],['Black','#111827'],['Blue Gray','#475569'],['Neutral','#737373']],
  'Warm Studio':[['Clay','#b7794d'],['Terracotta','#c56a4a'],['Olive','#6b7d4f'],['Coffee','#7c4a2d']]
};

function read(){ try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } }
function write(patch){ localStorage.removeItem(OLD_LOCK_KEY); localStorage.setItem(KEY, JSON.stringify({ ...read(), ...patch })); }
function reload(patch){ write(patch); location.reload(); }
function mode(){ return read().brandMode || 'dark'; }
function styleName(){ return read().brandStyle || 'Industrial'; }
function styleRecord(name){ return styleDefs.find(([n]) => n === name) || styleDefs[1]; }
function stylePatch(name, requestedMode = mode()){
  const [style, description, navLayout, radius, buttonRadius, cardPadding, density, logoSize, accent] = styleRecord(name);
  const base = requestedMode === 'light' ? baseLight : baseDark;
  return {
    ...base,
    brandStyle: style,
    brandMode: requestedMode,
    uiTheme: `brand-${style.toLowerCase().replace(/\s+/g,'-')}-${requestedMode}`,
    navLayout, radius, buttonRadius, cardPadding, density, logoSize,
    borderWidth: 1,
    shadowStrength: requestedMode === 'light' ? 22 : 58,
    fontScale: style === 'Field' ? 112 : style === 'Finance Ledger' ? 90 : 100,
    portalButtonHeight: style === 'Field' ? 145 : style === 'Finance Ledger' ? 46 : style === 'Executive' ? 54 : style === 'Luxury' ? 108 : 82,
    cardMaxWidth: style === 'Luxury' ? 94 : style === 'Client Soft' ? 96 : 100,
    headerHeight: style === 'Field' ? 118 : style === 'Luxury' ? 96 : 76,
    accentColor: accent,
    buttonColor: accent,
    buttonTextColor: '#ffffff'
  };
}

function injectFixedCss(){
  if (document.getElementById('fixed-brand-room-css')) return;
  const s = document.createElement('style');
  s.id = 'fixed-brand-room-css';
  s.textContent = `
    .brand-controls{background:#07111f!important;color:#f3f7ff!important;}
    .brand-controls .workspace-header,.brand-controls .fixed-brand-room{background:#0d1726!important;color:#f3f7ff!important;border:1px solid #2f4b68!important;border-radius:18px!important;box-shadow:none!important;}
    .brand-controls .brand-studio-grid{display:grid!important;grid-template-columns:1fr!important;gap:18px!important;max-width:1380px!important;margin:0 auto!important;width:100%!important;}
    .brand-studio-grid>article:not(.fixed-brand-room){display:none!important;}
    .fixed-brand-room{display:grid!important;gap:20px!important;padding:24px!important;grid-column:1/-1!important;}
    .fixed-brand-room h2{font-size:clamp(25px,3vw,38px)!important;line-height:1!important;letter-spacing:-.04em!important;margin:0 0 8px!important;color:#f3f7ff!important;}
    .fixed-brand-room p,.fixed-brand-room small{color:#9fb0c4!important;line-height:1.45!important;}
    .fixed-brand-room .eyebrow{color:#5aa2dc!important;letter-spacing:.16em!important;text-transform:uppercase!important;font-size:12px!important;font-weight:900!important;}
    .brand-section{display:grid!important;gap:16px!important;border:1px solid #2f4b68!important;border-radius:16px!important;background:#101b2b!important;padding:20px!important;}
    .logo-section{grid-template-columns:minmax(260px,.7fr) minmax(520px,1.3fr)!important;align-items:start!important;}
    .logo-controls{display:grid!important;grid-template-columns:120px repeat(2,minmax(0,1fr))!important;gap:12px!important;align-items:end!important;}
    .logo-preview{width:108px!important;height:108px!important;border:1px solid #5aa2dc!important;border-radius:16px!important;background:#07111f!important;display:grid!important;place-items:center!important;overflow:hidden!important;color:#f3f7ff!important;}
    .logo-preview img{max-width:100%!important;max-height:100%!important;object-fit:contain!important;}
    .brand-field{display:grid!important;gap:7px!important;color:#f3f7ff!important;font-weight:800!important;margin:0!important;}
    .brand-field input,.brand-field select{background:#07111f!important;color:#f3f7ff!important;border:1px solid #2f4b68!important;border-radius:10px!important;padding:10px!important;width:100%!important;}
    .brand-field input[type=range]{accent-color:#5aa2dc!important;padding:0!important;}
    .style-grid{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:14px!important;}
    .style-card{min-height:205px!important;text-align:left!important;border:1px solid #2f4b68!important;background:#0d1726!important;color:#f3f7ff!important;border-radius:16px!important;padding:16px!important;display:grid!important;gap:10px!important;align-content:start!important;white-space:normal!important;}
    .style-card strong{font-size:20px!important;line-height:1.05!important;color:#fff!important;display:block!important;}
    .style-card small{font-size:13px!important;line-height:1.35!important;display:block!important;}
    .style-card b{justify-self:start!important;margin-top:auto!important;background:#16324c!important;color:#d8ecff!important;border:1px solid #2f4b68!important;border-radius:999px!important;padding:6px 9px!important;font-size:11px!important;text-transform:uppercase!important;letter-spacing:.08em!important;}
    .style-card.active,.style-card:hover{border-color:#5aa2dc!important;background:#132640!important;}
    .style-preview{height:64px!important;border-radius:12px!important;display:grid!important;grid-template-columns:1.4fr 1fr 1fr!important;gap:6px!important;padding:8px!important;background:#07111f!important;border:1px solid #2f4b68!important;}
    .style-preview i{display:block!important;border-radius:8px!important;background:var(--preview-accent,#5aa2dc)!important;}.style-preview i:first-child{grid-column:1/-1!important;}
    .mode-grid{display:grid!important;grid-template-columns:repeat(2,minmax(0,180px))!important;gap:12px!important;}.palette-grid,.color-grid-simple{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:12px!important;}
    .mode-button,.palette-button{border:1px solid #2f4b68!important;background:#0d1726!important;color:#f3f7ff!important;border-radius:12px!important;padding:13px!important;text-align:left!important;font-weight:900!important;white-space:normal!important;}
    .mode-button.active,.mode-button:hover,.palette-button:hover{background:#16324c!important;border-color:#5aa2dc!important;}
    .notice-fixed{border:1px solid #5aa2dc!important;background:#0a2238!important;border-radius:14px!important;padding:14px!important;color:#d8ecff!important;font-weight:800!important;line-height:1.45!important;}
    @media(max-width:1100px){.style-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;}.logo-section,.logo-controls,.palette-grid,.color-grid-simple{grid-template-columns:1fr!important;}}
    @media(max-width:650px){.style-grid{grid-template-columns:1fr!important;}.mode-grid{grid-template-columns:1fr 1fr!important;}}
  `;
  document.head.appendChild(s);
}

function styleCard(def){
  const [name, desc, layout,,,,,, accent] = def;
  const b = document.createElement('button');
  b.type = 'button';
  b.className = `style-card ${styleName() === name ? 'active' : ''}`;
  b.style.setProperty('--preview-accent', accent);
  b.innerHTML = `<span class="style-preview"><i></i><i></i><i></i></span><strong>${name}</strong><small>${desc}</small><b>${layout.replace('-', ' ')}</b>`;
  b.onclick = () => reload(stylePatch(name, mode()));
  return b;
}
function modeButton(m){
  const b = document.createElement('button');
  b.type = 'button';
  b.className = `mode-button ${mode() === m ? 'active' : ''}`;
  b.textContent = m === 'dark' ? 'Dark mode' : 'Light mode';
  b.onclick = () => reload(stylePatch(styleName(), m));
  return b;
}
function paletteButton(name, color){
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'palette-button';
  b.innerHTML = `<strong>${name}</strong><small>${color}</small>`;
  b.onclick = () => reload({ accentColor: color, buttonColor: color });
  return b;
}
function colorControl(label, key){
  const brand = read();
  const fallback = stylePatch(styleName(), mode())[key] || '#000000';
  const wrap = document.createElement('label');
  wrap.className = 'brand-field';
  wrap.innerHTML = `<span>${label}</span><input type="color" value="${brand[key] || fallback}" />`;
  wrap.querySelector('input').oninput = (e) => reload({ [key]: e.target.value, ...(key === 'accentColor' ? { buttonColor: e.target.value } : {}) });
  return wrap;
}
function logoSection(){
  const brand = read();
  const section = document.createElement('section');
  section.className = 'brand-section logo-section';
  const size = Number(brand.logoSize || stylePatch(styleName(), mode()).logoSize || 64);
  section.innerHTML = `
    <div><p class="eyebrow">Logo controls</p><h2>Logo room</h2><p>This area stays fixed. Logo size, shape, text, and upload stay available while you test UI/UX styles.</p></div>
    <div class="logo-controls">
      <div class="logo-preview">${brand.logoUrl ? `<img src="${brand.logoUrl}" alt="Logo preview" />` : `<strong>${(brand.logoText || 'SC').slice(0,2).toUpperCase()}</strong>`}</div>
      <label class="brand-field">Logo text<input id="logoText" value="${brand.logoText || 'Steel Craft'}" /></label>
      <label class="brand-field">Subtext<input id="logoSubtext" value="${brand.logoSubtext || 'Operations Portal'}" /></label>
      <label class="brand-field">Logo URL<input id="logoUrl" value="${brand.logoUrl || ''}" placeholder="https://..." /></label>
      <label class="brand-field">Logo shape<select id="logoShape"><option value="square">Square</option><option value="rounded">Rounded</option><option value="circle">Circle</option><option value="wide">Wide</option></select></label>
      <label class="brand-field">Upload logo<input id="logoUpload" type="file" accept="image/*" /></label>
      <label class="brand-field" style="grid-column:1/-1">Logo size <b>${size}px</b><input id="logoSize" type="range" min="28" max="160" value="${size}" /></label>
    </div>`;
  section.querySelector('#logoShape').value = brand.logoShape || 'square';
  section.querySelector('#logoText').onchange = e => reload({ logoText:e.target.value });
  section.querySelector('#logoSubtext').onchange = e => reload({ logoSubtext:e.target.value });
  section.querySelector('#logoUrl').onchange = e => reload({ logoUrl:e.target.value, logoMode:e.target.value ? 'image' : (brand.logoMode || 'initials') });
  section.querySelector('#logoShape').onchange = e => reload({ logoShape:e.target.value });
  section.querySelector('#logoSize').onchange = e => reload({ logoSize:Number(e.target.value) });
  section.querySelector('#logoUpload').onchange = e => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => reload({ logoUrl: reader.result, logoMode:'image' });
    reader.readAsDataURL(file);
  };
  return section;
}
function inject(){
  if(location.pathname.replace(/\/$/,'') !== '/brand') return;
  injectFixedCss();
  const grid = document.querySelector('.brand-studio-grid');
  if(!grid || document.querySelector('.fixed-brand-room')) return;

  const panel = document.createElement('article');
  panel.className = 'feature panel fixed-brand-room';
  panel.innerHTML = `<div><p class="eyebrow">Stable Brand Room</p><h2>Pick and preview the tenant UI/UX</h2><p>This room is hard-coded so it does not morph while testing styles. Nothing is locked yet. Pick from 12 UI/UX types, test light/dark, adjust logo size, then we can harden the final choice later.</p></div><div class="notice-fixed">Current selection: ${styleName()} / ${mode()} mode. You can still change it while we are getting this right.</div>`;
  panel.appendChild(logoSection());

  const styleSection = document.createElement('section');
  styleSection.className = 'brand-section';
  styleSection.innerHTML = `<div><p class="eyebrow">UI/UX styles</p><h2>12 style types</h2><p>Click a style to preview what it does. Later, after approval, we lock the chosen architecture.</p></div><div class="style-grid"></div><div><p class="eyebrow">Mode</p><h2>Light / dark for selected style</h2><div class="mode-grid"></div></div><div><p class="eyebrow">Good accents</p><h2>Alternate colors for ${styleName()}</h2><div class="palette-grid"></div></div>`;
  styleSection.querySelector('.style-grid').append(...styleDefs.map(styleCard));
  styleSection.querySelector('.mode-grid').append(modeButton('light'), modeButton('dark'));
  const pal = palettes[styleName()] || palettes.Industrial;
  styleSection.querySelector('.palette-grid').append(...pal.map(([name,color]) => paletteButton(name,color)));
  panel.appendChild(styleSection);

  const colorSection = document.createElement('section');
  colorSection.className = 'brand-section';
  colorSection.innerHTML = `<div><p class="eyebrow">Manual colors</p><h2>Small color cleanup</h2><p>Use these after picking the style. They do not change the architecture.</p></div><div class="color-grid-simple"></div>`;
  const colors = colorSection.querySelector('.color-grid-simple');
  [['Background','pageBgColor'],['Card','cardColor'],['Bubble / Accent','accentColor'],['Surface','surfaceColor'],['Text','textColor'],['Border','borderColor']].forEach(([label,key]) => colors.appendChild(colorControl(label,key)));
  panel.appendChild(colorSection);

  grid.prepend(panel);
}
function start(){ inject(); new MutationObserver(inject).observe(document.documentElement,{childList:true,subtree:true}); }
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', start); else start();
