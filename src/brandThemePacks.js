const KEY = 'steelcraft_brand_controls_v1';

const uiStyles = [
  ['Luxury', 'Executive, premium, larger cards.', { uiTheme:'style-luxury', navLayout:'command-center', radius:30, buttonRadius:999, cardPadding:34, density:20, logoSize:82, portalButtonHeight:108, cardMaxWidth:94, headerHeight:96, accentColor:'#b9914b', buttonColor:'#b9914b', pageBgColor:'#050505', surfaceColor:'#0c0a07', surfaceAltColor:'#17120a', cardColor:'#11100d', inputColor:'#15110a', textColor:'#fff7e6', mutedTextColor:'#b9a98a', borderColor:'#4c3a1a' }],
  ['Sport', 'Sharp, energetic, high contrast.', { uiTheme:'style-sport', navLayout:'bottom-dock', radius:10, buttonRadius:6, cardPadding:28, density:18, logoSize:74, portalButtonHeight:92, cardMaxWidth:100, headerHeight:88, accentColor:'#e84a5f', buttonColor:'#e84a5f', pageBgColor:'#070708', surfaceColor:'#111114', surfaceAltColor:'#1d1d22', cardColor:'#131318', inputColor:'#1b1b21', textColor:'#fafafa', mutedTextColor:'#a8a8b3', borderColor:'#34343c' }],
  ['Architectural', 'Clean grid, square edges, blueprint feel.', { uiTheme:'style-architectural', navLayout:'left-sidebar', radius:0, buttonRadius:0, cardPadding:20, density:10, logoSize:60, portalButtonHeight:72, cardMaxWidth:100, headerHeight:78, accentColor:'#4c9bd9', buttonColor:'#335c81', pageBgColor:'#07111f', surfaceColor:'#0c2238', surfaceAltColor:'#0b1b2c', cardColor:'#0b1b2c', inputColor:'#0f253b', textColor:'#edf7ff', mutedTextColor:'#9fb4c9', borderColor:'#2d5f91' }],
  ['Industrial', 'Steel shop, dark, practical, strong panels.', { uiTheme:'style-industrial', navLayout:'dock-left', radius:4, buttonRadius:2, cardPadding:22, density:12, logoSize:64, portalButtonHeight:82, cardMaxWidth:100, headerHeight:76, accentColor:'#9f3d42', buttonColor:'#9f3d42', pageBgColor:'#030303', surfaceColor:'#141418', surfaceAltColor:'#1e1e24', cardColor:'#151519', inputColor:'#202026', textColor:'#f6f0ea', mutedTextColor:'#b7aaa3', borderColor:'#343036' }],
  ['Executive', 'Clean office ERP, readable and calm.', { uiTheme:'style-executive', navLayout:'top-rail', radius:16, buttonRadius:10, cardPadding:22, density:12, logoSize:58, portalButtonHeight:54, cardMaxWidth:100, headerHeight:72, accentColor:'#1f4f82', buttonColor:'#1f4f82', pageBgColor:'#f5f7fb', surfaceColor:'#ffffff', surfaceAltColor:'#eef2f7', cardColor:'#ffffff', inputColor:'#ffffff', textColor:'#162033', mutedTextColor:'#5c6678', borderColor:'#d7dee8' }],
  ['Modern', 'Balanced SaaS style with rounded cards.', { uiTheme:'style-modern', navLayout:'dock-right', radius:24, buttonRadius:999, cardPadding:26, density:16, logoSize:66, portalButtonHeight:86, cardMaxWidth:96, headerHeight:82, accentColor:'#7c4dff', buttonColor:'#4b63d8', pageBgColor:'#080910', surfaceColor:'#12141e', surfaceAltColor:'#1a1e2c', cardColor:'#151824', inputColor:'#1d2230', textColor:'#f3f5ff', mutedTextColor:'#a6aec2', borderColor:'#2f3446' }],
  ['Field', 'Tablet friendly, large targets.', { uiTheme:'style-field', navLayout:'bottom-dock', radius:18, buttonRadius:12, cardPadding:34, density:24, logoSize:86, portalButtonHeight:145, cardMaxWidth:100, headerHeight:118, accentColor:'#d99b34', buttonColor:'#d99b34', pageBgColor:'#10120f', surfaceColor:'#171a14', surfaceAltColor:'#202719', cardColor:'#171c13', inputColor:'#202719', textColor:'#f5f8ed', mutedTextColor:'#b9c2ad', borderColor:'#3e4b2f' }],
  ['Client Soft', 'Warm, customer-facing, less heavy.', { uiTheme:'style-client-soft', navLayout:'top-rail', radius:32, buttonRadius:999, cardPadding:30, density:18, logoSize:66, portalButtonHeight:68, cardMaxWidth:96, headerHeight:86, accentColor:'#8a4e32', buttonColor:'#8a4e32', pageBgColor:'#f3eee6', surfaceColor:'#fffaf4', surfaceAltColor:'#efe5d7', cardColor:'#fffaf4', inputColor:'#fffaf4', textColor:'#1c2c27', mutedTextColor:'#6d625a', borderColor:'#dfc5aa' }]
];

const paletteByStyle = {
  Luxury: [['Black Gold',{accentColor:'#b9914b',buttonColor:'#b9914b',pageBgColor:'#050505',cardColor:'#11100d',surfaceColor:'#0c0a07'}],['Charcoal Copper',{accentColor:'#b46b48',buttonColor:'#b46b48',pageBgColor:'#080605',cardColor:'#17110e',surfaceColor:'#120d0a'}],['Dark Platinum',{accentColor:'#c7c7c7',buttonColor:'#c7c7c7',pageBgColor:'#050506',cardColor:'#121216',surfaceColor:'#0d0d10'}]],
  Sport: [['Redline',{accentColor:'#e84a5f',buttonColor:'#e84a5f'}],['Orange Track',{accentColor:'#f97316',buttonColor:'#f97316'}],['Electric Lime',{accentColor:'#84cc16',buttonColor:'#65a30d'}]],
  Architectural: [['Blueprint',{accentColor:'#4c9bd9',buttonColor:'#335c81'}],['Graphite',{accentColor:'#94a3b8',buttonColor:'#475569'}],['Concrete Tan',{accentColor:'#b59b7a',buttonColor:'#8b7355'}]],
  Industrial: [['Steel Craft Red',{accentColor:'#9f3d42',buttonColor:'#9f3d42'}],['Safety Amber',{accentColor:'#d99b34',buttonColor:'#d99b34'}],['Weld Blue',{accentColor:'#4c9bd9',buttonColor:'#335c81'}]],
  Executive: [['Navy',{accentColor:'#1f4f82',buttonColor:'#1f4f82'}],['Slate',{accentColor:'#475569',buttonColor:'#334155'}],['Burgundy',{accentColor:'#7f1d1d',buttonColor:'#7f1d1d'}]],
  Modern: [['Violet',{accentColor:'#7c4dff',buttonColor:'#4b63d8'}],['Cyan',{accentColor:'#38bdf8',buttonColor:'#0f76a8'}],['Rose',{accentColor:'#c45f7d',buttonColor:'#b14f6e'}]],
  Field: [['Caution Gold',{accentColor:'#d99b34',buttonColor:'#d99b34'}],['Work Green',{accentColor:'#5f8d3b',buttonColor:'#5f8d3b'}],['Field Blue',{accentColor:'#4c9bd9',buttonColor:'#335c81'}]],
  'Client Soft': [['Warm Brown',{accentColor:'#8a4e32',buttonColor:'#8a4e32'}],['Soft Green',{accentColor:'#4f7b5b',buttonColor:'#4f7b5b'}],['Quiet Navy',{accentColor:'#335c81',buttonColor:'#335c81'}]]
};

function read(){ try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } }
function save(patch){ localStorage.setItem(KEY, JSON.stringify({ ...read(), ...patch })); location.reload(); }
function makeButton(label, sub, patch, cls){ const b=document.createElement('button'); b.type='button'; b.className=cls; b.innerHTML=`<strong>${label}</strong><small>${sub||''}</small>`; b.onclick=()=>save(patch); return b; }
function simpleColor(label, key){ const wrap=document.createElement('label'); const current=read()[key] || '#000000'; wrap.innerHTML=`${label}<input type="color" value="${current}" />`; wrap.querySelector('input').oninput=(e)=>{ const currentBrand=read(); currentBrand[key]=e.target.value; if(key==='accentColor') currentBrand.buttonColor=e.target.value; localStorage.setItem(KEY, JSON.stringify(currentBrand)); document.querySelectorAll('.dashboard,.landing-dark').forEach(root=>root.style.setProperty(`--${key==='accentColor'?'brand-accent':key.replace('Color','').replace(/[A-Z]/g,m=>'-'+m.toLowerCase())}`,e.target.value)); }; return wrap; }
function hideAdvanced(){ document.querySelectorAll('.slider-panel,.color-panel,.geometry-panel,.dramatic-theme-panel,.theme-panel:not(.simple-brand-styles)').forEach(p=>{p.style.display='none';}); }
function inject(){
  if(location.pathname.replace(/\/$/,'')!=='/brand') return;
  const grid=document.querySelector('.brand-studio-grid'); if(!grid || document.querySelector('.simple-brand-styles')) return;
  hideAdvanced();
  const panel=document.createElement('article'); panel.className='feature panel theme-panel simple-brand-styles';
  panel.innerHTML='<p class="eyebrow">Simple Brand Room</p><h2>Pick a style</h2><p>Pick one style. It loads the UI/UX and good default colors. Then use the color boxes below for small changes.</p><div class="simple-style-grid"></div><h2>Good alternate colors</h2><div class="simple-palette-grid"></div><h2>Manual colors</h2><div class="simple-color-grid"></div>';
  const styles=panel.querySelector('.simple-style-grid');
  uiStyles.forEach(([name,desc,patch])=>styles.appendChild(makeButton(name,desc,{...patch,brandStyle:name},'simple-style-button')));
  const active=read().brandStyle || 'Industrial';
  const palettes=panel.querySelector('.simple-palette-grid');
  (paletteByStyle[active]||paletteByStyle.Industrial).forEach(([name,patch])=>palettes.appendChild(makeButton(name,'Works with '+active,patch,'simple-palette-button')));
  const colors=panel.querySelector('.simple-color-grid');
  [['Background','pageBgColor'],['Card','cardColor'],['Bubble / Accent','accentColor'],['Surface','surfaceColor'],['Text','textColor'],['Border','borderColor']].forEach(([label,key])=>colors.appendChild(simpleColor(label,key)));
  grid.prepend(panel);
}
function start(){ inject(); new MutationObserver(inject).observe(document.documentElement,{childList:true,subtree:true}); }
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', start); else start();
