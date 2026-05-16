const STORAGE_KEY = 'steelcraft_brand_controls_v1';

const themePacks = [
  {
    id: 'luxury-black-gold',
    name: 'Luxury Black Gold',
    tagline: 'Premium executive ERP with dark surfaces, gold accents, and boardroom spacing.',
    layout: 'command-center',
    patch: {
      uiTheme: 'luxury-black-gold', navLayout: 'command-center', logoShape: 'wide',
      pageBgColor: '#050505', surfaceColor: '#0c0a07', surfaceAltColor: '#17120a', cardColor: '#11100d', inputColor: '#15110a',
      textColor: '#fff7e6', mutedTextColor: '#b9a98a', borderColor: '#4c3a1a', accentColor: '#c99a3e', buttonColor: '#c99a3e', buttonTextColor: '#14100a', shadowColor: '#000000',
      radius: 28, buttonRadius: 999, cardPadding: 34, density: 20, borderWidth: 1, shadowStrength: 84, fontScale: 102, logoSize: 82,
      bubbleWidth: 86, bubbleMinHeight: 120, portalButtonHeight: 112, portalButtonPaddingX: 28, portalButtonPaddingY: 22, cardMinHeight: 360, cardMaxWidth: 92, workspaceColumns: 105, headerHeight: 96
    }
  },
  {
    id: 'executive-light',
    name: 'Executive Light',
    tagline: 'Clean professional office ERP with white panels, navy text, and tighter business controls.',
    layout: 'top-rail',
    patch: {
      uiTheme: 'executive-light', navLayout: 'top-rail', logoShape: 'rounded',
      pageBgColor: '#f5f7fb', surfaceColor: '#ffffff', surfaceAltColor: '#eef2f7', cardColor: '#ffffff', inputColor: '#ffffff',
      textColor: '#162033', mutedTextColor: '#5c6678', borderColor: '#d7dee8', accentColor: '#1f4f82', buttonColor: '#1f4f82', buttonTextColor: '#ffffff', shadowColor: '#9aa7b8',
      radius: 16, buttonRadius: 10, cardPadding: 22, density: 12, borderWidth: 1, shadowStrength: 20, fontScale: 96, logoSize: 58,
      bubbleWidth: 100, bubbleMinHeight: 0, portalButtonHeight: 52, portalButtonPaddingX: 16, portalButtonPaddingY: 8, cardMinHeight: 210, cardMaxWidth: 100, workspaceColumns: 160, headerHeight: 72
    }
  },
  {
    id: 'field-ops-tablet',
    name: 'Field Ops Tablet',
    tagline: 'Large touch targets, high contrast status cards, and jobsite-friendly spacing.',
    layout: 'bottom-dock',
    patch: {
      uiTheme: 'field-ops-tablet', navLayout: 'bottom-dock', logoShape: 'square',
      pageBgColor: '#0d100c', surfaceColor: '#14180f', surfaceAltColor: '#1d2317', cardColor: '#171c13', inputColor: '#202719',
      textColor: '#f5f8ed', mutedTextColor: '#b9c2ad', borderColor: '#3e4b2f', accentColor: '#e0a72e', buttonColor: '#e0a72e', buttonTextColor: '#191407', shadowColor: '#000000',
      radius: 10, buttonRadius: 6, cardPadding: 34, density: 24, borderWidth: 2, shadowStrength: 58, fontScale: 112, logoSize: 86,
      bubbleWidth: 100, bubbleMinHeight: 185, portalButtonHeight: 150, portalButtonPaddingX: 32, portalButtonPaddingY: 28, cardMinHeight: 420, cardMaxWidth: 100, workspaceColumns: 100, headerHeight: 118
    }
  },
  {
    id: 'finance-ledger',
    name: 'Finance Ledger',
    tagline: 'Accounting-first layout with compact rows, sharp borders, and table-heavy density.',
    layout: 'left-sidebar',
    patch: {
      uiTheme: 'finance-ledger', navLayout: 'left-sidebar', logoShape: 'rounded',
      pageBgColor: '#0b0d10', surfaceColor: '#101318', surfaceAltColor: '#151922', cardColor: '#101318', inputColor: '#0d1118',
      textColor: '#f2f5f8', mutedTextColor: '#93a0ad', borderColor: '#2b3440', accentColor: '#5db0ff', buttonColor: '#245c96', buttonTextColor: '#ffffff', shadowColor: '#000000',
      radius: 2, buttonRadius: 2, cardPadding: 16, density: 6, borderWidth: 1, shadowStrength: 12, fontScale: 90, logoSize: 48,
      bubbleWidth: 100, bubbleMinHeight: 0, portalButtonHeight: 46, portalButtonPaddingX: 10, portalButtonPaddingY: 6, cardMinHeight: 140, cardMaxWidth: 100, workspaceColumns: 170, headerHeight: 64
    }
  },
  {
    id: 'command-center-pro',
    name: 'Command Center Pro',
    tagline: 'Dark operations center with floating dock, status-heavy cards, and glass panels.',
    layout: 'command-center',
    patch: {
      uiTheme: 'command-center-pro', navLayout: 'command-center', logoShape: 'circle',
      pageBgColor: '#050914', surfaceColor: '#0d1424', surfaceAltColor: '#121d31', cardColor: '#0f1828', inputColor: '#131f35',
      textColor: '#eef6ff', mutedTextColor: '#9fb2c8', borderColor: '#24364d', accentColor: '#38bdf8', buttonColor: '#2563eb', buttonTextColor: '#ffffff', shadowColor: '#000000',
      radius: 24, buttonRadius: 999, cardPadding: 28, density: 18, borderWidth: 1, shadowStrength: 76, fontScale: 100, logoSize: 70,
      bubbleWidth: 88, bubbleMinHeight: 95, portalButtonHeight: 96, portalButtonPaddingX: 24, portalButtonPaddingY: 18, cardMinHeight: 330, cardMaxWidth: 94, workspaceColumns: 120, headerHeight: 88
    }
  },
  {
    id: 'vertical-side-rail',
    name: 'Vertical Side Rail',
    tagline: 'Side-up ERP with strong rail navigation and narrow workspace cards.',
    layout: 'right-sidebar',
    patch: {
      uiTheme: 'vertical-side-rail', navLayout: 'right-sidebar', logoShape: 'wide',
      pageBgColor: '#08080a', surfaceColor: '#111114', surfaceAltColor: '#1b1b20', cardColor: '#121217', inputColor: '#1b1b21',
      textColor: '#fafafa', mutedTextColor: '#a8a8b3', borderColor: '#30303a', accentColor: '#e84a5f', buttonColor: '#e84a5f', buttonTextColor: '#ffffff', shadowColor: '#000000',
      radius: 18, buttonRadius: 12, cardPadding: 22, density: 12, borderWidth: 1, shadowStrength: 48, fontScale: 98, logoSize: 64,
      bubbleWidth: 72, bubbleMinHeight: 70, portalButtonHeight: 104, portalButtonPaddingX: 16, portalButtonPaddingY: 18, cardMinHeight: 240, cardMaxWidth: 82, workspaceColumns: 95, headerHeight: 80
    }
  },
  {
    id: 'client-portal-soft',
    name: 'Client Portal Soft',
    tagline: 'Warm customer-facing style with softer cards, friendly spacing, and lower visual noise.',
    layout: 'top-rail',
    patch: {
      uiTheme: 'client-portal-soft', navLayout: 'top-rail', logoShape: 'rounded',
      pageBgColor: '#f7f1e8', surfaceColor: '#fffaf3', surfaceAltColor: '#f0e4d6', cardColor: '#fffaf3', inputColor: '#fffdf8',
      textColor: '#1f2a25', mutedTextColor: '#74685f', borderColor: '#decab4', accentColor: '#9a5b36', buttonColor: '#9a5b36', buttonTextColor: '#ffffff', shadowColor: '#b9a18a',
      radius: 32, buttonRadius: 999, cardPadding: 30, density: 18, borderWidth: 1, shadowStrength: 22, fontScale: 102, logoSize: 66,
      bubbleWidth: 100, bubbleMinHeight: 0, portalButtonHeight: 68, portalButtonPaddingX: 20, portalButtonPaddingY: 12, cardMinHeight: 280, cardMaxWidth: 96, workspaceColumns: 100, headerHeight: 86
    }
  },
  {
    id: 'split-screen-ops',
    name: 'Split Screen Ops',
    tagline: 'Two-column operations cockpit with balanced panels and dense portal switching.',
    layout: 'dock-left',
    patch: {
      uiTheme: 'split-screen-ops', navLayout: 'dock-left', logoShape: 'square',
      pageBgColor: '#090b0e', surfaceColor: '#10141a', surfaceAltColor: '#171d25', cardColor: '#111720', inputColor: '#171e28',
      textColor: '#f4f7fb', mutedTextColor: '#aab4c0', borderColor: '#2b3542', accentColor: '#7dd3fc', buttonColor: '#0f76a8', buttonTextColor: '#ffffff', shadowColor: '#000000',
      radius: 12, buttonRadius: 8, cardPadding: 20, density: 10, borderWidth: 1, shadowStrength: 38, fontScale: 95, logoSize: 58,
      bubbleWidth: 100, bubbleMinHeight: 0, portalButtonHeight: 74, portalButtonPaddingX: 14, portalButtonPaddingY: 10, cardMinHeight: 260, cardMaxWidth: 100, workspaceColumns: 100, headerHeight: 76
    }
  }
];

function readBrand() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch { return {}; }
}

function saveBrand(patch) {
  const next = { ...readBrand(), ...patch };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

function createThemeButton(pack) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `theme-card theme-pack-card preview-${pack.id}`;
  button.innerHTML = `<span class="theme-preview"><i></i><i></i><i></i></span><strong>${pack.name}</strong><small>${pack.tagline}</small>`;
  button.addEventListener('click', () => {
    saveBrand(pack.patch);
    window.location.reload();
  });
  return button;
}

function injectThemePacks() {
  if (location.pathname.replace(/\/$/, '') !== '/brand') return;
  if (document.querySelector('[data-brand-theme-packs="true"]')) return;
  const grid = document.querySelector('.brand-studio-grid');
  if (!grid) return;
  const panel = document.createElement('article');
  panel.className = 'feature panel theme-panel dramatic-theme-panel';
  panel.dataset.brandThemePacks = 'true';
  panel.innerHTML = `
    <p class="eyebrow">Tenant SaaS theme engines</p>
    <h2>8 dramatic UI / UX modes</h2>
    <p>These change the whole product feel: navigation, density, card shape, workspace balance, header behavior, color system, and logo scale. They are tenant-ready presets, not simple color swaps.</p>
    <div class="theme-grid dramatic-theme-grid"></div>
  `;
  const list = panel.querySelector('.dramatic-theme-grid');
  themePacks.forEach((pack) => list.appendChild(createThemeButton(pack)));
  grid.prepend(panel);
}

function start() {
  injectThemePacks();
  const observer = new MutationObserver(injectThemePacks);
  observer.observe(document.documentElement, { childList: true, subtree: true });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
else start();
