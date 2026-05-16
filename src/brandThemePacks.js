const KEY = 'steelcraft_brand_controls_v1';
const LOCK_KEY = 'steelcraft_brand_ui_locked_v1';

const launchStyles = [
  {
    name: 'Luxury',
    description: 'Premium executive look with larger cards and a boardroom feel.',
    layout: 'command-center',
    light: {
      uiTheme:'locked-luxury-light', navLayout:'command-center', radius:30, buttonRadius:999, cardPadding:34, density:20, logoSize:82, portalButtonHeight:108, cardMaxWidth:94, headerHeight:96,
      accentColor:'#b9914b', buttonColor:'#b9914b', pageBgColor:'#f5f0e8', surfaceColor:'#fffaf0', surfaceAltColor:'#eee2cc', cardColor:'#fffaf0', inputColor:'#fff7e8', textColor:'#16110a', mutedTextColor:'#6e604b', borderColor:'#d8c49f', sidebarColor:'#fffaf0', topbarColor:'#fffaf0', shadowColor:'#7d6a4d'
    },
    dark: {
      uiTheme:'locked-luxury-dark', navLayout:'command-center', radius:30, buttonRadius:999, cardPadding:34, density:20, logoSize:82, portalButtonHeight:108, cardMaxWidth:94, headerHeight:96,
      accentColor:'#b9914b', buttonColor:'#b9914b', pageBgColor:'#050505', surfaceColor:'#0c0a07', surfaceAltColor:'#17120a', cardColor:'#11100d', inputColor:'#15110a', textColor:'#fff7e6', mutedTextColor:'#b9a98a', borderColor:'#4c3a1a', sidebarColor:'#0c0a07', topbarColor:'#0c0a07', shadowColor:'#000000'
    },
    palettes: [
      ['Black Gold', { accentColor:'#b9914b', buttonColor:'#b9914b' }],
      ['Copper', { accentColor:'#b46b48', buttonColor:'#b46b48' }],
      ['Platinum', { accentColor:'#c7c7c7', buttonColor:'#71717a' }]
    ]
  },
  {
    name: 'Industrial',
    description: 'Steel shop, practical panels, strong operations feel.',
    layout: 'dock-left',
    light: {
      uiTheme:'locked-industrial-light', navLayout:'dock-left', radius:6, buttonRadius:4, cardPadding:22, density:12, logoSize:64, portalButtonHeight:82, cardMaxWidth:100, headerHeight:76,
      accentColor:'#9f3d42', buttonColor:'#9f3d42', pageBgColor:'#f0f2f4', surfaceColor:'#ffffff', surfaceAltColor:'#e5e8ec', cardColor:'#ffffff', inputColor:'#ffffff', textColor:'#111827', mutedTextColor:'#566174', borderColor:'#c9d0d8', sidebarColor:'#ffffff', topbarColor:'#ffffff', shadowColor:'#9aa3ad'
    },
    dark: {
      uiTheme:'locked-industrial-dark', navLayout:'dock-left', radius:6, buttonRadius:4, cardPadding:22, density:12, logoSize:64, portalButtonHeight:82, cardMaxWidth:100, headerHeight:76,
      accentColor:'#9f3d42', buttonColor:'#9f3d42', pageBgColor:'#030303', surfaceColor:'#141418', surfaceAltColor:'#1e1e24', cardColor:'#151519', inputColor:'#202026', textColor:'#f6f0ea', mutedTextColor:'#b7aaa3', borderColor:'#343036', sidebarColor:'#111116', topbarColor:'#111116', shadowColor:'#000000'
    },
    palettes: [
      ['Steel Red', { accentColor:'#9f3d42', buttonColor:'#9f3d42' }],
      ['Safety Amber', { accentColor:'#d99b34', buttonColor:'#d99b34' }],
      ['Weld Blue', { accentColor:'#4c9bd9', buttonColor:'#335c81' }]
    ]
  },
  {
    name: 'Executive',
    description: 'Clean office ERP, readable, calm, and professional.',
    layout: 'top-rail',
    light: {
      uiTheme:'locked-executive-light', navLayout:'top-rail', radius:16, buttonRadius:10, cardPadding:22, density:12, logoSize:58, portalButtonHeight:54, cardMaxWidth:100, headerHeight:72,
      accentColor:'#1f4f82', buttonColor:'#1f4f82', pageBgColor:'#f5f7fb', surfaceColor:'#ffffff', surfaceAltColor:'#eef2f7', cardColor:'#ffffff', inputColor:'#ffffff', textColor:'#162033', mutedTextColor:'#5c6678', borderColor:'#d7dee8', sidebarColor:'#ffffff', topbarColor:'#ffffff', shadowColor:'#aeb7c5'
    },
    dark: {
      uiTheme:'locked-executive-dark', navLayout:'top-rail', radius:16, buttonRadius:10, cardPadding:22, density:12, logoSize:58, portalButtonHeight:54, cardMaxWidth:100, headerHeight:72,
      accentColor:'#7aa2d8', buttonColor:'#295d96', pageBgColor:'#07111f', surfaceColor:'#0d1726', surfaceAltColor:'#142033', cardColor:'#101b2b', inputColor:'#142033', textColor:'#f3f7ff', mutedTextColor:'#9fb0c4', borderColor:'#2c3c52', sidebarColor:'#0d1726', topbarColor:'#0d1726', shadowColor:'#000000'
    },
    palettes: [
      ['Navy', { accentColor:'#1f4f82', buttonColor:'#1f4f82' }],
      ['Slate', { accentColor:'#475569', buttonColor:'#334155' }],
      ['Burgundy', { accentColor:'#7f1d1d', buttonColor:'#7f1d1d' }]
    ]
  },
  {
    name: 'Field',
    description: 'Large touch targets for shop, tablet, and field work.',
    layout: 'bottom-dock',
    light: {
      uiTheme:'locked-field-light', navLayout:'bottom-dock', radius:18, buttonRadius:12, cardPadding:34, density:24, logoSize:86, portalButtonHeight:145, cardMaxWidth:100, headerHeight:118,
      accentColor:'#d99b34', buttonColor:'#d99b34', pageBgColor:'#f5f1e9', surfaceColor:'#fffaf0', surfaceAltColor:'#eee5d4', cardColor:'#fffaf0', inputColor:'#fff7e8', textColor:'#1f2718', mutedTextColor:'#67705a', borderColor:'#d8c7a5', sidebarColor:'#fffaf0', topbarColor:'#fffaf0', shadowColor:'#9c896a'
    },
    dark: {
      uiTheme:'locked-field-dark', navLayout:'bottom-dock', radius:18, buttonRadius:12, cardPadding:34, density:24, logoSize:86, portalButtonHeight:145, cardMaxWidth:100, headerHeight:118,
      accentColor:'#d99b34', buttonColor:'#d99b34', pageBgColor:'#10120f', surfaceColor:'#171a14', surfaceAltColor:'#202719', cardColor:'#171c13', inputColor:'#202719', textColor:'#f5f8ed', mutedTextColor:'#b9c2ad', borderColor:'#3e4b2f', sidebarColor:'#171a14', topbarColor:'#171a14', shadowColor:'#000000'
    },
    palettes: [
      ['Caution Gold', { accentColor:'#d99b34', buttonColor:'#d99b34' }],
      ['Work Green', { accentColor:'#5f8d3b', buttonColor:'#5f8d3b' }],
      ['Field Blue', { accentColor:'#4c9bd9', buttonColor:'#335c81' }]
    ]
  }
];

function read(){ try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } }
function write(next){ localStorage.setItem(KEY, JSON.stringify(next)); }
function isLocked(){ return localStorage.getItem(LOCK_KEY) === 'true'; }
function save(patch, options = {}) {
  const next = { ...read(), ...patch };
  if (options.lock) localStorage.setItem(LOCK_KEY, 'true');
  write(next);
  location.reload();
}
function selectedStyle(){ return read().brandStyle || 'Industrial'; }
function selectedMode(){ return read().brandMode || 'dark'; }
function styleByName(name){ return launchStyles.find((item) => item.name === name) || launchStyles[1]; }
function currentStylePatch(style){ return style[selectedMode()] || style.dark; }

function hideOriginalBrandPanels(){
  document.querySelectorAll('.brand-studio-grid > article').forEach((panel) => {
    if (!panel.classList.contains('locked-brand-room')) panel.style.display = 'none';
  });
}

function simpleColor(label, key){
  const wrap = document.createElement('label');
  const current = read()[key] || currentStylePatch(styleByName(selectedStyle()))[key] || '#000000';
  wrap.className = 'locked-color-control';
  wrap.innerHTML = `<span>${label}</span><input type="color" value="${current}" />`;
  wrap.querySelector('input').oninput = (e) => {
    const currentBrand = read();
    currentBrand[key] = e.target.value;
    if (key === 'accentColor') currentBrand.buttonColor = e.target.value;
    write(currentBrand);
    location.reload();
  };
  return wrap;
}

function styleCard(style){
  const locked = isLocked();
  const active = selectedStyle() === style.name;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `locked-style-card ${active ? 'active' : ''}`;
  button.disabled = locked && !active;
  button.innerHTML = `
    <span class="locked-style-preview locked-${style.name.toLowerCase().replace(/\s+/g, '-')}"><i></i><i></i><i></i></span>
    <strong>${style.name}</strong>
    <small>${style.description}</small>
    <b>${style.layout.replace('-', ' ')}</b>
  `;
  button.onclick = () => save({ ...currentStylePatch(style), brandStyle: style.name, brandMode: selectedMode() }, { lock: true });
  return button;
}

function modeButton(mode){
  const style = styleByName(selectedStyle());
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `locked-mode-button ${selectedMode() === mode ? 'active' : ''}`;
  button.textContent = mode === 'dark' ? 'Dark mode' : 'Light mode';
  button.onclick = () => save({ ...style[mode], brandStyle: style.name, brandMode: mode });
  return button;
}

function paletteButton(name, patch){
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'locked-palette-button';
  button.innerHTML = `<strong>${name}</strong><small>Accent set</small>`;
  button.onclick = () => save(patch);
  return button;
}

function logoSection(){
  const brand = read();
  const section = document.createElement('section');
  section.className = 'locked-logo-section';
  section.innerHTML = `
    <div>
      <p class="eyebrow">Logo stays fixed</p>
      <h2>Logo room</h2>
      <p>Logo controls stay in this position and do not move when the app UI style changes.</p>
    </div>
    <div class="locked-logo-card">
      <div class="locked-logo-preview">${brand.logoUrl ? `<img src="${brand.logoUrl}" alt="Logo preview" />` : `<strong>${(brand.logoText || 'Steel Craft').slice(0,2).toUpperCase()}</strong>`}</div>
      <label>Logo text<input id="lockedLogoText" value="${brand.logoText || 'Steel Craft'}" /></label>
      <label>Subtext<input id="lockedLogoSubtext" value="${brand.logoSubtext || 'Operations Portal'}" /></label>
      <label>Upload logo<input id="lockedLogoUpload" type="file" accept="image/*" /></label>
    </div>
  `;
  section.querySelector('#lockedLogoText').onchange = (e) => save({ logoText: e.target.value });
  section.querySelector('#lockedLogoSubtext').onchange = (e) => save({ logoSubtext: e.target.value });
  section.querySelector('#lockedLogoUpload').onchange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => save({ logoUrl: reader.result, logoMode: 'image' });
    reader.readAsDataURL(file);
  };
  return section;
}

function injectFixedCss(){
  if (document.getElementById('locked-brand-room-css')) return;
  const style = document.createElement('style');
  style.id = 'locked-brand-room-css';
  style.textContent = `
    .brand-controls{--brand-room-bg:#07111f!important;--brand-room-panel:#0d1726!important;--brand-room-card:#101b2b!important;--brand-room-text:#f3f7ff!important;--brand-room-muted:#9fb0c4!important;--brand-room-line:#2f4b68!important;--brand-room-accent:#5aa2dc!important;background:#07111f!important;color:#f3f7ff!important;}
    .brand-controls .brand-studio-grid{display:grid!important;grid-template-columns:1fr!important;gap:18px!important;max-width:1320px!important;margin:0 auto!important;width:100%!important;}
    .brand-controls .workspace-header,.brand-controls .locked-brand-room{background:#0d1726!important;color:#f3f7ff!important;border:1px solid #2f4b68!important;border-radius:18px!important;box-shadow:none!important;}
    .locked-brand-room{display:grid!important;gap:22px!important;padding:24px!important;grid-column:1/-1!important;}
    .locked-brand-room h2{font-size:clamp(26px,3vw,38px)!important;line-height:1!important;letter-spacing:-.04em!important;margin:0 0 8px!important;color:#f3f7ff!important;}
    .locked-brand-room p,.locked-brand-room small{color:#9fb0c4!important;line-height:1.45!important;}
    .locked-brand-room .eyebrow{color:#5aa2dc!important;letter-spacing:.16em!important;text-transform:uppercase!important;font-size:12px!important;font-weight:900!important;}
    .locked-logo-section,.locked-selection-section,.locked-color-section{display:grid!important;gap:16px!important;border:1px solid #2f4b68!important;border-radius:16px!important;background:#101b2b!important;padding:20px!important;}
    .locked-logo-section{grid-template-columns:minmax(260px,.8fr) minmax(360px,1.2fr)!important;align-items:start!important;}
    .locked-logo-card{display:grid!important;grid-template-columns:110px 1fr 1fr!important;gap:12px!important;align-items:end!important;}
    .locked-logo-card label,.locked-color-control{display:grid!important;gap:7px!important;color:#f3f7ff!important;font-weight:800!important;margin:0!important;}
    .locked-logo-card input,.locked-color-control input{background:#07111f!important;color:#f3f7ff!important;border:1px solid #2f4b68!important;border-radius:10px!important;padding:10px!important;width:100%!important;}
    .locked-logo-preview{width:96px!important;height:96px!important;border:1px solid #5aa2dc!important;border-radius:16px!important;background:#07111f!important;display:grid!important;place-items:center!important;overflow:hidden!important;color:#f3f7ff!important;}
    .locked-logo-preview img{max-width:100%!important;max-height:100%!important;object-fit:contain!important;}
    .locked-style-grid{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:14px!important;}
    .locked-style-card{min-height:190px!important;text-align:left!important;border:1px solid #2f4b68!important;background:#0d1726!important;color:#f3f7ff!important;border-radius:16px!important;padding:16px!important;display:grid!important;gap:10px!important;align-content:start!important;white-space:normal!important;}
    .locked-style-card strong{font-size:20px!important;line-height:1.05!important;color:#fff!important;display:block!important;}
    .locked-style-card small{font-size:13px!important;line-height:1.35!important;display:block!important;}
    .locked-style-card b{justify-self:start!important;margin-top:auto!important;background:#16324c!important;color:#d8ecff!important;border:1px solid #2f4b68!important;border-radius:999px!important;padding:6px 9px!important;font-size:11px!important;text-transform:uppercase!important;letter-spacing:.08em!important;}
    .locked-style-card.active,.locked-style-card:hover{border-color:#5aa2dc!important;background:#132640!important;}
    .locked-style-card:disabled{opacity:.55!important;cursor:not-allowed!important;}
    .locked-style-preview{height:58px!important;border-radius:12px!important;display:grid!important;grid-template-columns:1.4fr 1fr 1fr!important;gap:6px!important;padding:8px!important;background:#07111f!important;border:1px solid #2f4b68!important;}
    .locked-style-preview i{display:block!important;border-radius:8px!important;background:#5aa2dc!important;}.locked-style-preview i:first-child{grid-column:1/-1!important;}
    .locked-luxury i{background:#b9914b!important}.locked-industrial i{background:#9f3d42!important}.locked-executive i{background:#1f4f82!important}.locked-field i{background:#d99b34!important}
    .locked-mode-grid,.locked-palette-grid,.locked-color-grid{display:grid!important;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:12px!important;}
    .locked-mode-grid{grid-template-columns:repeat(2,minmax(0,180px))!important;}
    .locked-mode-button,.locked-palette-button{border:1px solid #2f4b68!important;background:#0d1726!important;color:#f3f7ff!important;border-radius:12px!important;padding:13px!important;text-align:left!important;font-weight:900!important;white-space:normal!important;}
    .locked-mode-button.active,.locked-mode-button:hover,.locked-palette-button:hover{background:#16324c!important;border-color:#5aa2dc!important;}
    .locked-color-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important;}
    .locked-brand-notice{border:1px solid #5aa2dc!important;background:#0a2238!important;border-radius:14px!important;padding:14px!important;color:#d8ecff!important;font-weight:800!important;line-height:1.45!important;}
    @media(max-width:1000px){.locked-style-grid,.locked-logo-section,.locked-logo-card,.locked-color-grid,.locked-palette-grid{grid-template-columns:1fr!important;}.locked-mode-grid{grid-template-columns:1fr 1fr!important;}}
  `;
  document.head.appendChild(style);
}

function inject(){
  if(location.pathname.replace(/\/$/,'') !== '/brand') return;
  injectFixedCss();
  const grid = document.querySelector('.brand-studio-grid');
  if(!grid) return;
  hideOriginalBrandPanels();
  if(document.querySelector('.locked-brand-room')) return;

  const current = styleByName(selectedStyle());
  const locked = isLocked();
  const panel = document.createElement('article');
  panel.className = 'feature panel locked-brand-room';
  panel.innerHTML = `
    <div>
      <p class="eyebrow">Brand room is locked</p>
      <h2>Initial UI/UX setup</h2>
      <p>This room does not inherit the app UI/UX. Pick the customer style at setup, lock it, then only adjust logo and colors after that.</p>
    </div>
    <div class="locked-brand-notice">${locked ? `UI/UX style is locked to ${selectedStyle()} / ${selectedMode()} mode. This prevents ongoing style changes from breaking the app architecture.` : 'Choose one launch style below. Selecting a style locks the UI/UX architecture for this tenant.'}</div>
  `;

  panel.appendChild(logoSection());

  const selectSection = document.createElement('section');
  selectSection.className = 'locked-selection-section';
  selectSection.innerHTML = '<div><p class="eyebrow">Step 1</p><h2>Choose one launch style</h2><p>These are intentionally limited. We can show 3–4 versions during onboarding, then lock the choice.</p></div><div class="locked-style-grid"></div><div><p class="eyebrow">Step 2</p><h2>Light / dark mode for selected style</h2><div class="locked-mode-grid"></div></div><div><p class="eyebrow">Step 3</p><h2>Good alternate accents</h2><div class="locked-palette-grid"></div></div>';
  selectSection.querySelector('.locked-style-grid').append(...launchStyles.map(styleCard));
  selectSection.querySelector('.locked-mode-grid').append(modeButton('light'), modeButton('dark'));
  selectSection.querySelector('.locked-palette-grid').append(...current.palettes.map(([name, patch]) => paletteButton(name, patch)));
  panel.appendChild(selectSection);

  const colorSection = document.createElement('section');
  colorSection.className = 'locked-color-section';
  colorSection.innerHTML = '<div><p class="eyebrow">Small color edits only</p><h2>Manual colors</h2><p>Use these for cleanup. The UI/UX architecture stays locked.</p></div><div class="locked-color-grid"></div>';
  const colors = colorSection.querySelector('.locked-color-grid');
  [['Background','pageBgColor'],['Card','cardColor'],['Bubble / Accent','accentColor'],['Surface','surfaceColor'],['Text','textColor'],['Border','borderColor']].forEach(([label,key]) => colors.appendChild(simpleColor(label,key)));
  panel.appendChild(colorSection);

  grid.prepend(panel);
}

function start(){ inject(); new MutationObserver(inject).observe(document.documentElement,{childList:true,subtree:true}); }
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', start); else start();
