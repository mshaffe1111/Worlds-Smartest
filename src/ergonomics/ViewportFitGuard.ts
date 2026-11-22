// ============================================================================
// WORLD'S SMARTEST — Hard Anti-Crop Viewport Fit Guard & Runtime QA Auditor
// PITCH_BIBLE.md §5.1 (Three-Zone Ergonomic Framing & Multi-Viewport Fit)
// ============================================================================
//
// Computes & publishes live responsive CSS custom properties on :root:
//   --ws-vw           Exact visual viewport width (px)
//   --ws-vh           Exact visual viewport height (px)
//   --ws-ui-scale     Calibrated UI scale factor across 390px..4K [0.86..1.52]
//   --ws-top-h        Zone 1: Top Stage & Story Plane height budget (px)
//   --ws-spotlight-h  Zone 2: Unobstructed 3D Veritas Prism Spotlight Plane (px)
//   --ws-dock-h       Zone 3: Bottom Ergonomic Thumb Arc Broadcast Dock (px)
//
// Explicit first-class mobile-first & desktop profiles:
//   • PORTRAIT_MOBILE    (320×568, 360×640, 375×667, 390×844, 430×932)
//   • PORTRAIT_TABLET    (768×1024 iPad Portrait)
//   • LANDSCAPE_MOBILE   (844×390 Phone Landscape)
//   • SQUARE_SPLIT_PANE  (1050×1080 — prevents "SOUND" -> "SOU" pill clip!)
//   • LAPTOP_COMPACT     (1280×800 / 1366×768 tight vertical budget)
//   • DESKTOP_HD         (1920×1080 / 1440×900 / 2560×1440)
//   • DESKTOP_4K         (3840×2160 UHD broadcast wall)
//
// Exposes `window.__wsAuditLayout()` for automated Playwright/CDP & live QA:
//   Scans all visible interactive elements, `[data-facet-idx]` buttons, and cards:
//   1) 0 elements clip outside [0..innerWidth] / [0..innerHeight]
//   2) 0 utility/control button labels truncate horizontally ("SOUND" -> "SOU")
//   3) 100% of enabled touch targets meet ergonomic size targets
//   4) 0 hidden/covered `[data-facet-idx]` answers (`height >= 34`, `bottom <= innerHeight`,
//      0 intersection/occlusion with `.ws-dock-pinned-actions`, `#ws-btn-overclock`,
//      `#ws-btn-next-q`, `#ws-btn-bookmark`, `#ws-btn-peel`)
//   5) 0 nested visible bordered boxes (`nestedBoxViolations === 0`)
// ============================================================================

export type ViewportOrientation = 'portrait' | 'landscape';

export type ViewportProfileId =
  | 'PORTRAIT_MOBILE'
  | 'PORTRAIT_TABLET'
  | 'LANDSCAPE_MOBILE'
  | 'SQUARE_SPLIT_PANE'
  | 'LAPTOP_COMPACT'
  | 'DESKTOP_HD'
  | 'DESKTOP_4K';

export interface AuditViewportPreset {
  readonly id: string;
  readonly label: string;
  readonly width: number;
  readonly height: number;
  readonly expectedProfile: ViewportProfileId;
}

export const MOBILE_FIRST_AUDIT_VIEWPORTS: readonly AuditViewportPreset[] = [
  { id: 'mobile-320', label: 'iPhone SE 1st Gen', width: 320, height: 568, expectedProfile: 'PORTRAIT_MOBILE' },
  { id: 'mobile-360', label: 'Compact Android', width: 360, height: 640, expectedProfile: 'PORTRAIT_MOBILE' },
  { id: 'mobile-375', label: 'iPhone SE', width: 375, height: 667, expectedProfile: 'PORTRAIT_MOBILE' },
  { id: 'mobile-390', label: 'iPhone 15', width: 390, height: 844, expectedProfile: 'PORTRAIT_MOBILE' },
  { id: 'mobile-430', label: 'iPhone Pro Max', width: 430, height: 932, expectedProfile: 'PORTRAIT_MOBILE' },
  { id: 'tablet-768', label: 'iPad Portrait', width: 768, height: 1024, expectedProfile: 'PORTRAIT_TABLET' },
  { id: 'landscape-844', label: 'Phone Landscape', width: 844, height: 390, expectedProfile: 'LANDSCAPE_MOBILE' },
  { id: 'split-1050', label: 'Square Split-Pane', width: 1050, height: 1080, expectedProfile: 'SQUARE_SPLIT_PANE' },
  { id: 'laptop-1280', label: 'Laptop Compact', width: 1280, height: 800, expectedProfile: 'LAPTOP_COMPACT' },
] as const;

export interface ComputedViewportMetrics {
  profile: ViewportProfileId;
  orientation: ViewportOrientation;
  vw: number;
  vh: number;
  dpr: number;
  aspect: number;
  uiScale: number;
  topH: number;
  spotlightH: number;
  dockH: number;
  spotlightMinH: number;
  dockMaxH: number;
  chyronMaxW: number;
  touchMinPx: 44;
}

export interface LayoutClipViolation {
  selector: string;
  tag: string;
  id: string;
  textSample: string;
  reason:
    | 'LEFT_CLIP'
    | 'RIGHT_CLIP'
    | 'TOP_CLIP'
    | 'BOTTOM_CLIP'
    | 'LABEL_TRUNCATED';
  rect: {
    left: number;
    top: number;
    right: number;
    bottom: number;
    width: number;
    height: number;
  };
  viewport: { width: number; height: number };
}

export interface TouchTargetViolation {
  selector: string;
  tag: string;
  id: string;
  textSample: string;
  width: number;
  height: number;
  requiredMinPx: number;
}

export interface HiddenOrCoveredFacetViolation {
  facetIdx: number;
  selector: string;
  textSample: string;
  reason:
    | 'HEIGHT_TOO_SMALL'
    | 'OUTSIDE_VIEWPORT'
    | 'CLIPPED_BY_CONTAINER'
    | 'OCCLUDED_BY_ACTION';
  visibleHeight: number;
  minRequiredHeight: number;
  occludedBy?: string;
  overlapPx?: { width: number; height: number };
  rect: {
    left: number;
    top: number;
    right: number;
    bottom: number;
    width: number;
    height: number;
  };
  viewport: { width: number; height: number };
}

export interface NestedBoxViolation {
  childSelector: string;
  parentCardSelector: string;
  childTextSample: string;
  childBorderWidthPx: number;
  parentBorderWidthPx: number;
  childRect: {
    left: number;
    top: number;
    right: number;
    bottom: number;
    width: number;
    height: number;
  };
  parentRect: {
    left: number;
    top: number;
    right: number;
    bottom: number;
    width: number;
    height: number;
  };
}

export interface LayoutAuditOptions {
  /** Minimum CSS pixel width & height required for interactive touch targets (default: 44) */
  minTouchTargetPx?: number;
  /** Minimum CSS pixel height required for every `[data-facet-idx]` answer button (default: 34) */
  minFacetHeightPx?: number;
  /** Sub-pixel tolerance in CSS pixels for high-DPR fractional rounding (default: 0.75) */
  subpixelTolerancePx?: number;
  /** Root element to scan (default: document.body) */
  root?: ParentNode;
  /** Whether `nestedBoxViolations > 0` fails `report.pass` (default: true) */
  failOnNestedBoxes?: boolean;
  /** When true, throws an Error if `pass === false` (useful in strict CI assertions) */
  throwOnFailure?: boolean;
}

export interface LayoutAuditReport {
  pass: boolean;
  timestampIso: string;
  profile: ViewportProfileId;
  orientation: ViewportOrientation;
  viewport: {
    width: number;
    height: number;
    dpr: number;
    aspect: number;
    orientation: ViewportOrientation;
  };
  cssVars: {
    vw: string;
    vh: string;
    uiScale: string;
    topH: string;
    spotlightH: string;
    dockH: string;
  };
  scannedInteractiveCount: number;
  scannedFacetCount: number;
  clippedCount: number;
  labelTruncatedCount: number;
  undersizedTouchTargetCount: number;
  hiddenOrCoveredFacetCount: number;
  nestedBoxViolations: number;
  clippedElements: LayoutClipViolation[];
  truncatedLabels: LayoutClipViolation[];
  undersizedTouchTargets: TouchTargetViolation[];
  hiddenOrCoveredFacets: HiddenOrCoveredFacetViolation[];
  nestedBoxDetails: NestedBoxViolation[];
  summary: string;
}

export interface ViewportFitGuardConfig {
  /** Injects non-invasive anti-crop & >=44px touch-target guard CSS (default: true) */
  injectGuardCss?: boolean;
  /** Registers `window.__wsAuditLayout` globally (default: true) */
  exposeWindowAuditHelper?: boolean;
  /** Optional listener invoked whenever viewport metrics recompute */
  onMetricsChanged?: (metrics: ComputedViewportMetrics) => void;
  /** Optional listener invoked whenever portrait <-> landscape orientation flips */
  onOrientationChanged?: (
    orientation: ViewportOrientation,
    metrics: ComputedViewportMetrics,
  ) => void;
}

declare global {
  interface Window {
    __wsAuditLayout: (options?: LayoutAuditOptions) => LayoutAuditReport;
  }
}

const GUARD_STYLE_ELEMENT_ID = 'ws-ergonomics-viewport-fit-guard';

const INTERACTIVE_SELECTOR = [
  'button:not(:disabled)',
  'a[href]',
  'input:not([type="hidden"]):not(:disabled)',
  'select:not(:disabled)',
  'textarea:not(:disabled)',
  '[role="button"]:not([aria-disabled="true"])',
  '[role="tab"]:not([aria-disabled="true"])',
  'summary',
].join(', ');

const CRITICAL_HUD_CONTAINERS_SELECTOR = [
  '.ws-topbar',
  '.ws-utility-cluster',
  '.ws-broadcast-dock',
  '.ws-stage-story-strip',
  '.ws-modal-panel',
  '.ws-title-dock',
  '.ws-vault-drawer.is-open',
].join(', ');

// Pills/controls whose text label must NEVER horizontally clip ("SOUND" -> "SOU")
const NON_TRUNCATING_PILL_SELECTOR = [
  '.ws-util-pill',
  '.ws-peel-btn',
  '.ws-step-btn',
  '.ws-cone-pill',
  '.ws-btn-gold',
  '.ws-vault-trigger',
  '.ws-topbar-back',
].join(', ');

// Pinned action zones & buttons that must NEVER overlap/occlude any `[data-facet-idx]` answer
const FACET_OCCLUDER_SELECTOR = [
  '.ws-dock-pinned-actions',
  '#ws-btn-overclock',
  '#ws-btn-next-q',
  '#ws-btn-bookmark',
  '#ws-btn-peel',
].join(', ');

function clamp(v: number, min: number, max: number): number {
  if (!Number.isFinite(v)) return min;
  return Math.max(min, Math.min(max, v));
}

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}

function round4(v: number): number {
  return Math.round(v * 10000) / 10000;
}

/**
 * Pure deterministic calculator for any `(vw, vh, dpr)` tuple!
 * Supports live hot-rotation across all 9 mobile-first & desktop viewports:
 *   • PORTRAIT_MOBILE   (320×568, 360×640, 375×667, 390×844, 430×932)
 *   • PORTRAIT_TABLET   (768×1024)
 *   • LANDSCAPE_MOBILE  (height <= 520 && aspect >= 1.35, e.g. 844×390, 800×360, 932×430)
 *   • SQUARE_SPLIT_PANE (1050×1080)
 *   • LAPTOP_COMPACT    (1280×800)
 *   • DESKTOP_HD        (1920×1080)
 *   • DESKTOP_4K        (3840×2160)
 */
export function computeViewportMetrics(
  rawVw: number,
  rawVh: number,
  rawDpr = 1,
): ComputedViewportMetrics {
  const vw = Math.max(280, Math.round(rawVw || 1280));
  const vh = Math.max(260, Math.round(rawVh || 720));
  const dpr = clamp(rawDpr || 1, 1, 4);
  const aspect = round4(vw / vh);
  const orientation: ViewportOrientation = vw >= vh ? 'landscape' : 'portrait';

  // 1. Landscape Mobile (#168: height <= 520px && aspect >= 1.35, e.g. 844×390, 800×360, 932×430)
  if (vh <= 520 && aspect >= 1.35) {
    const topH = 44;
    const dockH = 92;
    const spotlightH = Math.max(120, vh - topH - dockH);
    const spotlightMinH = Math.max(108, Math.min(168, vh - 190));
    const dockMaxH = Math.max(220, vh - topH - 12);
    const chyronMaxW = Math.max(180, Math.min(360, Math.round(vw * 0.38)));
    return {
      profile: 'LANDSCAPE_MOBILE',
      orientation,
      vw,
      vh,
      dpr,
      aspect,
      uiScale: 0.84,
      topH,
      spotlightH,
      dockH,
      spotlightMinH,
      dockMaxH,
      chyronMaxW,
      touchMinPx: 44,
    };
  }

  let profile: ViewportProfileId;
  let uiScale: number;
  let topRatio: number;
  let spotlightRatio: number;
  let spotlightMinH: number;
  let dockMaxRatio: number;
  let chyronMaxW: number;

  if (vw < 640) {
    // 2. Portrait Mobile (320×568, 360×640, 375×667, 390×844, 430×932)
    profile = 'PORTRAIT_MOBILE';
    const isCompactPortrait = vh <= 740;
    uiScale = round4(clamp(Math.min(vw / 412, vh / 860), isCompactPortrait ? 0.78 : 0.88, 1.0));
    topRatio = isCompactPortrait ? 0.16 : 0.20;
    spotlightRatio = isCompactPortrait ? 0.36 : 0.42;
    spotlightMinH = isCompactPortrait
      ? Math.round(clamp(vh * 0.22, 112, 160))
      : Math.round(clamp(vh * 0.23, 160, 224));
    // Generous portrait ceiling so Live (<=58dvh) & Reveal (<=64..68dvh) NEVER clip A–D facets!
    dockMaxRatio = isCompactPortrait ? 0.68 : 0.64;
    chyronMaxW = Math.max(160, vw - 56);
  } else if (aspect < 0.88) {
    // 3. Portrait Tablet (e.g. 768×1024 iPad Mini/Air, 820×1180)
    profile = 'PORTRAIT_TABLET';
    uiScale = round4(clamp(Math.min(vw / 768, vh / 1024), 0.94, 1.06));
    topRatio = 0.22;
    spotlightRatio = 0.46;
    spotlightMinH = Math.round(clamp(vh * 0.28, 220, 340));
    dockMaxRatio = 0.58;
    chyronMaxW = Math.max(240, Math.round(vw * 0.43));
  } else if (aspect >= 0.88 && aspect <= 1.18) {
    // 4. Square / Split-Pane (e.g. 1050×1080 — exact pane where "SOUND" clipped to "SOU"!)
    profile = 'SQUARE_SPLIT_PANE';
    uiScale = round4(clamp(Math.min(vw / 1120, vh / 1040), 0.9, 1.02));
    topRatio = 0.22;
    spotlightRatio = 0.46;
    spotlightMinH = Math.round(clamp(vh * 0.28, 180, 320));
    dockMaxRatio = 0.58;
    // Reserve >= 56% of horizontal width for the utility pill cluster so zero pills ever squeeze!
    chyronMaxW = Math.max(220, Math.min(440, Math.round(vw * 0.41)));
  } else if (vh <= 860) {
    // 5. Compact Widescreen Laptop (e.g. 1280×800, 1366×768)
    profile = 'LAPTOP_COMPACT';
    uiScale = round4(clamp(Math.min(vw / 1360, vh / 860), 0.88, 1.0));
    topRatio = 0.20;
    spotlightRatio = 0.46;
    spotlightMinH = Math.round(clamp(vh * 0.24, 156, 220));
    dockMaxRatio = 0.58;
    chyronMaxW = Math.max(260, Math.min(540, Math.round(vw * 0.44)));
  } else if (vw >= 2560 && vh >= 1400) {
    // 6. 4K / Ultra-HD Desktop (e.g. 3840×2160)
    profile = 'DESKTOP_4K';
    uiScale = round4(clamp(Math.min(vw / 2400, vh / 1440), 1.15, 1.52));
    topRatio = 0.20;
    spotlightRatio = 0.48;
    spotlightMinH = Math.round(vh * 0.32);
    dockMaxRatio = 0.56;
    chyronMaxW = Math.min(920, Math.round(vw * 0.45));
  } else {
    // 7. Standard 1080p / QHD Desktop (e.g. 1920×1080)
    profile = 'DESKTOP_HD';
    uiScale = round4(clamp(Math.min(vw / 1680, vh / 1020), 0.96, 1.1));
    topRatio = 0.20;
    spotlightRatio = 0.48;
    spotlightMinH = Math.round(clamp(vh * 0.28, 190, 340));
    dockMaxRatio = 0.56;
    chyronMaxW = Math.min(620, Math.round(vw * 0.46));
  }

  const topH = Math.round(vh * topRatio);
  const spotlightH = Math.max(spotlightMinH, Math.round(vh * spotlightRatio));
  const dockH = Math.max(160, vh - topH - spotlightH);
  const dockMaxH = Math.max(240, Math.round(vh * dockMaxRatio));

  return {
    profile,
    orientation,
    vw,
    vh,
    dpr,
    aspect,
    uiScale,
    topH,
    spotlightH,
    dockH,
    spotlightMinH,
    dockMaxH,
    chyronMaxW,
    touchMinPx: 44,
  };
}

function buildElementSelector(el: Element): string {
  const tag = el.tagName.toLowerCase();
  if (el.id) {
    return `${tag}#${el.id}`;
  }
  const facetIdx = el.getAttribute('data-facet-idx');
  const cls =
    typeof el.className === 'string' && el.className.trim().length > 0
      ? '.' +
        el.className
          .trim()
          .split(/\s+/)
          .slice(0, 2)
          .join('.')
      : '';
  return facetIdx !== null ? `${tag}${cls}[data-facet-idx="${facetIdx}"]` : `${tag}${cls}`;
}

function serializeRect(r: DOMRect | { left: number; top: number; right: number; bottom: number; width: number; height: number }) {
  return {
    left: round2(r.left),
    top: round2(r.top),
    right: round2(r.right),
    bottom: round2(r.bottom),
    width: round2(r.width),
    height: round2(r.height),
  };
}

function parseCssColorAlpha(raw: string): number {
  const s = (raw || '').trim().toLowerCase();
  if (!s || s === 'transparent' || s === 'none') return 0;
  const rgbaComma = s.match(/^rgba\(\s*[^,]+,\s*[^,]+,\s*[^,]+,\s*([0-9.]+%?)\s*\)$/);
  if (rgbaComma) {
    const token = rgbaComma[1];
    return token.endsWith('%') ? parseFloat(token) / 100 : parseFloat(token);
  }
  const slashMatch = s.match(/\/\s*([0-9.]+%?)\s*\)$/);
  if (slashMatch) {
    const token = slashMatch[1];
    return token.endsWith('%') ? parseFloat(token) / 100 : parseFloat(token);
  }
  return 1;
}

function measureVisibleBoxBorder(style: CSSStyleDeclaration): {
  isBoxBorder: boolean;
  maxBorderWidth: number;
  visibleSides: number;
} {
  const sides: Array<{ width: string; bStyle: string; color: string }> = [
    { width: style.borderTopWidth, bStyle: style.borderTopStyle, color: style.borderTopColor },
    { width: style.borderRightWidth, bStyle: style.borderRightStyle, color: style.borderRightColor },
    { width: style.borderBottomWidth, bStyle: style.borderBottomStyle, color: style.borderBottomColor },
    { width: style.borderLeftWidth, bStyle: style.borderLeftStyle, color: style.borderLeftColor },
  ];

  let visibleSides = 0;
  let maxBorderWidth = 0;
  for (const side of sides) {
    const w = parseFloat(side.width || '0');
    const st = (side.bStyle || 'none').toLowerCase();
    const alpha = parseCssColorAlpha(side.color || '');
    if (w >= 0.95 && st !== 'none' && st !== 'hidden' && alpha > 0.02) {
      visibleSides += 1;
      if (w > maxBorderWidth) maxBorderWidth = w;
    }
  }

  // Catch legacy NinePatch border-image frames as visible boxes as well
  const hasBorderImage =
    Boolean(style.borderImageSource) &&
    style.borderImageSource !== 'none' &&
    Math.max(
      parseFloat(style.borderTopWidth || '0'),
      parseFloat(style.borderRightWidth || '0'),
      parseFloat(style.borderBottomWidth || '0'),
      parseFloat(style.borderLeftWidth || '0'),
    ) >= 0.95;

  if (hasBorderImage) {
    const imgBorderW = Math.max(
      maxBorderWidth,
      parseFloat(style.borderTopWidth || '0'),
      parseFloat(style.borderBottomWidth || '0'),
    );
    return { isBoxBorder: true, maxBorderWidth: round2(imgBorderW), visibleSides: 4 };
  }

  // Single-edge 1px hairlines (1 side) or parallel row rules (2 sides) are sleek dividers, not boxes;
  // >= 3 visible bordered sides (>= 1px) constitute a bordered box/card!
  return {
    isBoxBorder: visibleSides >= 3,
    maxBorderWidth: round2(maxBorderWidth),
    visibleSides,
  };
}

function isExplicitlyHiddenByStyleOrAttr(el: Element): boolean {
  if (!(el instanceof HTMLElement || el instanceof SVGElement)) return true;
  if (el.closest('[hidden], [aria-hidden="true"]')) return true;
  let cur: Element | null = el;
  while (cur && cur !== document.documentElement) {
    const style = window.getComputedStyle(cur);
    if (
      style.display === 'none' ||
      style.visibility === 'hidden' ||
      style.visibility === 'collapse'
    ) {
      return true;
    }
    cur = cur.parentElement;
  }
  return false;
}

function computeVisibleClippedRect(
  el: Element,
  vw: number,
  vh: number,
): { left: number; top: number; right: number; bottom: number; width: number; height: number } {
  const r = el.getBoundingClientRect();
  let left = Math.max(r.left, 0);
  let top = Math.max(r.top, 0);
  let right = Math.min(r.right, vw);
  let bottom = Math.min(r.bottom, vh);

  let ancestor = el.parentElement;
  while (ancestor && ancestor !== document.documentElement) {
    const st = window.getComputedStyle(ancestor);
    const clipsY =
      st.overflowY === 'hidden' ||
      st.overflowY === 'auto' ||
      st.overflowY === 'scroll' ||
      st.overflowY === 'clip';
    const clipsX =
      st.overflowX === 'hidden' ||
      st.overflowX === 'auto' ||
      st.overflowX === 'scroll' ||
      st.overflowX === 'clip';
    if (clipsY || clipsX) {
      const ar = ancestor.getBoundingClientRect();
      if (clipsY) {
        top = Math.max(top, ar.top);
        bottom = Math.min(bottom, ar.bottom);
      }
      if (clipsX) {
        left = Math.max(left, ar.left);
        right = Math.min(right, ar.right);
      }
    }
    ancestor = ancestor.parentElement;
  }

  return {
    left,
    top,
    right,
    bottom,
    width: Math.max(0, right - left),
    height: Math.max(0, bottom - top),
  };
}

function extractTextSample(el: Element): string {
  if (el instanceof HTMLInputElement) {
    return (el.value || el.placeholder || el.type || 'input').trim().slice(0, 36);
  }
  const raw = (el.textContent || el.getAttribute('aria-label') || el.getAttribute('title') || '')
    .replace(/\s+/g, ' ')
    .trim();
  return raw.slice(0, 42);
}

function isElementVisiblyRendered(el: Element): boolean {
  if (!(el instanceof HTMLElement || el instanceof SVGElement)) return false;
  if (el.closest('[hidden], [aria-hidden="true"]')) return false;

  let cur: Element | null = el;
  while (cur && cur !== document.documentElement) {
    const style = window.getComputedStyle(cur);
    if (
      style.display === 'none' ||
      style.visibility === 'hidden' ||
      style.visibility === 'collapse' ||
      parseFloat(style.opacity || '1') <= 0.01
    ) {
      return false;
    }
    cur = cur.parentElement;
  }

  const rect = el.getBoundingClientRect();
  return rect.width > 0.5 && rect.height > 0.5;
}

function findVerticallyScrollableAncestor(el: Element): HTMLElement | null {
  let parent = el.parentElement;
  while (parent && parent !== document.body && parent !== document.documentElement) {
    const st = window.getComputedStyle(parent);
    const oy = st.overflowY;
    if (
      (oy === 'auto' || oy === 'scroll') &&
      parent.scrollHeight > parent.clientHeight + 1
    ) {
      return parent;
    }
    parent = parent.parentElement;
  }
  return null;
}

/**
 * Runs a full live DOM geometry, facet-occlusion, nested-box, & touch-ergonomics audit!
 */
export function runWorkspaceLayoutAudit(options: LayoutAuditOptions = {}): LayoutAuditReport {
  const minTouchPx = options.minTouchTargetPx ?? 44;
  const minFacetHeightPx = options.minFacetHeightPx ?? 34;
  const strictNestedBoxes = options.failOnNestedBoxes ?? true;
  const eps = options.subpixelTolerancePx ?? 0.75;
  const vw = Math.round(window.visualViewport?.width ?? window.innerWidth ?? 1280);
  const vh = Math.round(window.visualViewport?.height ?? window.innerHeight ?? 720);
  const innerH = Math.round(window.innerHeight || vh);
  const viewportH = Math.min(vh, innerH);
  const dpr = window.devicePixelRatio || 1;
  const metrics = computeViewportMetrics(vw, vh, dpr);

  const rootNode: ParentNode = options.root ?? document.body;
  const rootStyle = window.getComputedStyle(document.documentElement);
  const cssVars = {
    vw: rootStyle.getPropertyValue('--ws-vw').trim() || `${vw}px`,
    vh: rootStyle.getPropertyValue('--ws-vh').trim() || `${vh}px`,
    uiScale: rootStyle.getPropertyValue('--ws-ui-scale').trim() || String(metrics.uiScale),
    topH: rootStyle.getPropertyValue('--ws-top-h').trim() || `${metrics.topH}px`,
    spotlightH:
      rootStyle.getPropertyValue('--ws-spotlight-h').trim() || `${metrics.spotlightH}px`,
    dockH: rootStyle.getPropertyValue('--ws-dock-h').trim() || `${metrics.dockH}px`,
  };

  const clippedElements: LayoutClipViolation[] = [];
  const truncatedLabels: LayoutClipViolation[] = [];
  const undersizedTouchTargets: TouchTargetViolation[] = [];
  const hiddenOrCoveredFacets: HiddenOrCoveredFacetViolation[] = [];
  const nestedBoxDetails: NestedBoxViolation[] = [];

  const interactiveNodes = Array.from(rootNode.querySelectorAll(INTERACTIVE_SELECTOR));
  const containerNodes = Array.from(rootNode.querySelectorAll(CRITICAL_HUD_CONTAINERS_SELECTOR));

  let scannedInteractiveCount = 0;
  let scannedFacetCount = 0;

  const checkBoundaryClip = (el: Element) => {
    const r = el.getBoundingClientRect();
    const scrollParent = findVerticallyScrollableAncestor(el);

    // 1. Horizontal clipping outside [0..vw] is NEVER permitted!
    if (r.left < -eps) {
      clippedElements.push({
        selector: buildElementSelector(el),
        tag: el.tagName.toLowerCase(),
        id: el.id || '',
        textSample: extractTextSample(el),
        reason: 'LEFT_CLIP',
        rect: serializeRect(r),
        viewport: { width: vw, height: vh },
      });
    } else if (r.right > vw + eps) {
      clippedElements.push({
        selector: buildElementSelector(el),
        tag: el.tagName.toLowerCase(),
        id: el.id || '',
        textSample: extractTextSample(el),
        reason: 'RIGHT_CLIP',
        rect: serializeRect(r),
        viewport: { width: vw, height: vh },
      });
    }

    // 2. Vertical clipping outside [0..vh] for non-scrolled elements (or if scroll container itself clips!)
    const verticalRefRect = scrollParent ? scrollParent.getBoundingClientRect() : r;
    if (verticalRefRect.top < -eps) {
      clippedElements.push({
        selector: buildElementSelector(scrollParent ?? el),
        tag: (scrollParent ?? el).tagName.toLowerCase(),
        id: (scrollParent ?? el).id || '',
        textSample: extractTextSample(el),
        reason: 'TOP_CLIP',
        rect: serializeRect(verticalRefRect),
        viewport: { width: vw, height: vh },
      });
    } else if (verticalRefRect.bottom > vh + eps) {
      clippedElements.push({
        selector: buildElementSelector(scrollParent ?? el),
        tag: (scrollParent ?? el).tagName.toLowerCase(),
        id: (scrollParent ?? el).id || '',
        textSample: extractTextSample(el),
        reason: 'BOTTOM_CLIP',
        rect: serializeRect(verticalRefRect),
        viewport: { width: vw, height: vh },
      });
    }
  };

  // Deduplicate scroll-container clip reports
  const seenClipKeys = new Set<string>();

  for (const el of interactiveNodes) {
    if (!isElementVisiblyRendered(el)) continue;
    scannedInteractiveCount += 1;

    checkBoundaryClip(el);

    const r = el.getBoundingClientRect();
    const allowCompact = el.hasAttribute('data-ws-allow-compact');
    const isCompactFacet = el.hasAttribute('data-facet-idx') && viewportH <= 740;
    const requiredHeightPx = isCompactFacet ? Math.min(minTouchPx, minFacetHeightPx) : minTouchPx;
    if (!allowCompact && (r.width < minTouchPx - eps || r.height < requiredHeightPx - eps)) {
      undersizedTouchTargets.push({
        selector: buildElementSelector(el),
        tag: el.tagName.toLowerCase(),
        id: el.id || '',
        textSample: extractTextSample(el),
        width: round2(r.width),
        height: round2(r.height),
        requiredMinPx: requiredHeightPx,
      });
    }

    // Check internal horizontal label truncation (catches "SOUND" -> "SOU"!)
    if (
      el instanceof HTMLElement &&
      el.matches(NON_TRUNCATING_PILL_SELECTOR) &&
      !el.hasAttribute('data-ws-allow-ellipsis')
    ) {
      if (el.scrollWidth > el.clientWidth + 2) {
        truncatedLabels.push({
          selector: buildElementSelector(el),
          tag: el.tagName.toLowerCase(),
          id: el.id || '',
          textSample: extractTextSample(el),
          reason: 'LABEL_TRUNCATED',
          rect: serializeRect(r),
          viewport: { width: vw, height: vh },
        });
      }
    }
  }

  for (const container of containerNodes) {
    if (!isElementVisiblyRendered(container)) continue;
    checkBoundaryClip(container);
  }

  // 3. Strict Mobile-First Facet Visibility & Zero-Occlusion Assertion (`[data-facet-idx]`)
  // Scans BOTH live and disabled/revealed facets so Reveal actions can never cover A–D!
  const facetNodes = Array.from(rootNode.querySelectorAll('[data-facet-idx]'));
  const occluderNodes = Array.from(rootNode.querySelectorAll(FACET_OCCLUDER_SELECTOR)).filter(
    (el: Element) => isElementVisiblyRendered(el),
  );

  for (const facetEl of facetNodes) {
    if (isExplicitlyHiddenByStyleOrAttr(facetEl)) continue;
    scannedFacetCount += 1;

    const r = facetEl.getBoundingClientRect();
    const facetIdxRaw = Number(facetEl.getAttribute('data-facet-idx'));
    const facetIdx = Number.isFinite(facetIdxRaw) ? facetIdxRaw : -1;
    const selector = buildElementSelector(facetEl);
    const textSample = extractTextSample(facetEl);
    const visibleClip = computeVisibleClippedRect(facetEl, vw, viewportH);
    const serialized = serializeRect(r);

    let geometryFailed = false;
    if (r.height < minFacetHeightPx - eps) {
      geometryFailed = true;
      hiddenOrCoveredFacets.push({
        facetIdx,
        selector,
        textSample,
        reason: 'HEIGHT_TOO_SMALL',
        visibleHeight: round2(visibleClip.height),
        minRequiredHeight: minFacetHeightPx,
        rect: serialized,
        viewport: { width: vw, height: viewportH },
      });
    }

    if (r.top < -eps || r.bottom > viewportH + eps || r.left < -eps || r.right > vw + eps) {
      geometryFailed = true;
      hiddenOrCoveredFacets.push({
        facetIdx,
        selector,
        textSample,
        reason: 'OUTSIDE_VIEWPORT',
        visibleHeight: round2(visibleClip.height),
        minRequiredHeight: minFacetHeightPx,
        rect: serialized,
        viewport: { width: vw, height: viewportH },
      });
    }

    if (!geometryFailed && visibleClip.height < minFacetHeightPx - eps) {
      hiddenOrCoveredFacets.push({
        facetIdx,
        selector,
        textSample,
        reason: 'CLIPPED_BY_CONTAINER',
        visibleHeight: round2(visibleClip.height),
        minRequiredHeight: minFacetHeightPx,
        rect: serialized,
        viewport: { width: vw, height: viewportH },
      });
    }

    // Zero intersection / occlusion with `.ws-dock-pinned-actions`, `#ws-btn-overclock`,
    // `#ws-btn-next-q`, `#ws-btn-bookmark`, or `#ws-btn-peel`!
    for (const occ of occluderNodes) {
      if (occ === facetEl || occ.contains(facetEl) || facetEl.contains(occ)) continue;
      const or = occ.getBoundingClientRect();
      const overlapW = Math.min(r.right, or.right) - Math.max(r.left, or.left);
      const overlapH = Math.min(r.bottom, or.bottom) - Math.max(r.top, or.top);
      if (overlapW > eps && overlapH > eps) {
        hiddenOrCoveredFacets.push({
          facetIdx,
          selector,
          textSample,
          reason: 'OCCLUDED_BY_ACTION',
          visibleHeight: round2(Math.max(0, visibleClip.height - overlapH)),
          minRequiredHeight: minFacetHeightPx,
          occludedBy: buildElementSelector(occ),
          overlapPx: { width: round2(overlapW), height: round2(overlapH) },
          rect: serialized,
          viewport: { width: vw, height: viewportH },
        });
      }
    }
  }

  // 4. Anti-Boxiness Assertion (`nestedBoxViolations`):
  // Count visible elements with borderWidth >= 1px (>= 3 visible sides or border-image box)
  // nested inside another visible bordered card!
  const borderedCards = new Map<HTMLElement, { borderWidthPx: number; rect: DOMRect }>();
  const allElements = Array.from(rootNode.querySelectorAll('*'));

  for (const node of allElements) {
    if (!(node instanceof HTMLElement)) continue;
    if (node.tagName === 'SCRIPT' || node.tagName === 'STYLE' || node.tagName === 'LINK') {
      continue;
    }
    if (!isElementVisiblyRendered(node)) continue;

    const r = node.getBoundingClientRect();
    if (r.width < 24 || r.height < 24) continue;

    const st = window.getComputedStyle(node);
    const borderInfo = measureVisibleBoxBorder(st);
    if (!borderInfo.isBoxBorder) continue;

    let ancestor = node.parentElement;
    let enclosingCard: { el: HTMLElement; borderWidthPx: number; rect: DOMRect } | null = null;
    while (ancestor && ancestor !== document.documentElement) {
      const hit = borderedCards.get(ancestor);
      if (hit && hit.rect.width >= 60 && hit.rect.height >= 36) {
        enclosingCard = { el: ancestor, ...hit };
        break;
      }
      ancestor = ancestor.parentElement;
    }

    if (enclosingCard) {
      nestedBoxDetails.push({
        childSelector: buildElementSelector(node),
        parentCardSelector: buildElementSelector(enclosingCard.el),
        childTextSample: extractTextSample(node),
        childBorderWidthPx: borderInfo.maxBorderWidth,
        parentBorderWidthPx: enclosingCard.borderWidthPx,
        childRect: serializeRect(r),
        parentRect: serializeRect(enclosingCard.rect),
      });
    }

    borderedCards.set(node, { borderWidthPx: borderInfo.maxBorderWidth, rect: r });
  }

  const dedupedClips = clippedElements.filter((item) => {
    const key = `${item.selector}|${item.reason}|${item.rect.left}|${item.rect.top}`;
    if (seenClipKeys.has(key)) return false;
    seenClipKeys.add(key);
    return true;
  });

  const nestedBoxViolations = nestedBoxDetails.length;
  const pass =
    dedupedClips.length === 0 &&
    truncatedLabels.length === 0 &&
    undersizedTouchTargets.length === 0 &&
    hiddenOrCoveredFacets.length === 0 &&
    (!strictNestedBoxes || nestedBoxViolations === 0);

  const summary = pass
    ? `PASS [${metrics.profile} · ${metrics.orientation} · ${vw}×${vh}]: ${scannedInteractiveCount} interactive + ${scannedFacetCount} facets verified — 0 clips, 0 truncated labels, 0 undersized targets, 0 hidden/covered facets, 0 nested boxes.`
    : `FAIL [${metrics.profile} · ${metrics.orientation} · ${vw}×${vh}]: ${dedupedClips.length} clips, ${truncatedLabels.length} truncated labels, ${undersizedTouchTargets.length} undersized targets, ${hiddenOrCoveredFacets.length} hidden/covered facets, ${nestedBoxViolations} nested boxes.`;

  const report: LayoutAuditReport = {
    pass,
    timestampIso: new Date().toISOString(),
    profile: metrics.profile,
    orientation: metrics.orientation,
    viewport: {
      width: vw,
      height: vh,
      dpr,
      aspect: metrics.aspect,
      orientation: metrics.orientation,
    },
    cssVars,
    scannedInteractiveCount,
    scannedFacetCount,
    clippedCount: dedupedClips.length,
    labelTruncatedCount: truncatedLabels.length,
    undersizedTouchTargetCount: undersizedTouchTargets.length,
    hiddenOrCoveredFacetCount: hiddenOrCoveredFacets.length,
    nestedBoxViolations,
    clippedElements: dedupedClips,
    truncatedLabels,
    undersizedTouchTargets,
    hiddenOrCoveredFacets,
    nestedBoxDetails,
    summary,
  };

  if (!pass && options.throwOnFailure) {
    throw new Error(summary);
  }

  return report;
}

const GUARD_STYLESHEET_CONTENT = `
/* ==========================================================================
   WORLD'S SMARTEST — Runtime ViewportFitGuard Anti-Crop & Touch Guard
   Zero-specificity :where(...) baselines so sovereign.css 2026 mobile-first
   rules ALWAYS win cleanly (zero dock max-height cascade clobbering!).
   ========================================================================== */
:root {
  --ws-touch-min: 44px;
}

/* 1. Prevent utility pill squeeze on Square Split-Pane & Mobile */
:where(.ws-topbar) {
  max-width: 100%;
  box-sizing: border-box;
}

:where(.ws-chyron) {
  min-width: 0;
  flex: 0 1 auto;
}

:where(.ws-chyron-title) {
  max-width: var(--ws-chyron-max-w, min(46vw, 480px));
}

:where(.ws-utility-cluster) {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
}

:where(.ws-util-pill) {
  flex-shrink: 0;
  white-space: nowrap;
  overflow: visible;
  text-overflow: clip;
  min-height: var(--ws-touch-min, 44px);
  min-width: var(--ws-touch-min, 44px);
  justify-content: center;
}

/* 2. Baseline >= 44px × 44px hit-boxes (deferring compact overrides to sovereign.css) */
:where(
  button:not([data-ws-allow-compact]),
  [role="button"]:not([data-ws-allow-compact]),
  .ws-btn-gold,
  .ws-btn-obsidian,
  .ws-peel-btn,
  .ws-overclock-bar,
  .ws-facet-pill,
  .ws-step-btn,
  .ws-cone-pill,
  .ws-mode-tab,
  .ws-city-card,
  .ws-cat-card,
  .ws-clue-pin,
  .ws-name-input
) {
  min-height: var(--ws-touch-min, 44px);
  min-width: var(--ws-touch-min, 44px);
}

:where(.ws-step-btn, .ws-cone-pill, .ws-clue-pin) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* Give native <input type="range"> a full 44px thumb hit-lane without fattening the visual track */
:where(.ws-range-slider, input[type="range"]) {
  min-height: var(--ws-touch-min, 44px);
  margin: 0;
  background: transparent;
}

/* 3. Three-Zone Gameplay Fit & Unobstructed 3D Spotlight Pass-Through */
:where(#ui-root, .ws-gameplay-layout, .ws-spotlight-plane, .ws-stage-story-strip) {
  background: transparent;
  pointer-events: none;
}

:where(.ws-gameplay-layout) {
  grid-template-rows: auto minmax(var(--ws-spotlight-min-h, 140px), 1fr) auto;
  min-height: 0;
  max-height: 100%;
}

/* Clamp Dossier corkboard pins strictly inside the board width while allowing 2-line wrap */
:where(.ws-clue-pin) {
  max-width: min(195px, calc(var(--ws-vw, 100vw) - 36px));
}

/* 4. 100vh + 100dvh Fallback & Landscape Mobile Safe Area Baseline */
:where(#app, #ui-root) {
  height: 100vh;
  height: 100dvh;
}

@media (max-height: 520px) and (orientation: landscape) {
  :where(#ui-root) {
    padding:
      max(4px, env(safe-area-inset-top, 0px))
      max(12px, env(safe-area-inset-right, 0px))
      max(4px, env(safe-area-inset-bottom, 0px))
      max(12px, env(safe-area-inset-left, 0px));
  }

  :where(.ws-gameplay-layout) {
    grid-template-rows: auto minmax(var(--ws-spotlight-min-h, 108px), 1fr) auto;
  }
}
`;

export class ViewportFitGuard {
  private readonly cfg: Required<
    Omit<ViewportFitGuardConfig, 'onMetricsChanged' | 'onOrientationChanged'>
  >;
  private onMetricsChanged?: (metrics: ComputedViewportMetrics) => void;
  private onOrientationChanged?: (
    orientation: ViewportOrientation,
    metrics: ComputedViewportMetrics,
  ) => void;

  private currentMetrics: ComputedViewportMetrics;
  private installed = false;
  private resizeObserver: ResizeObserver | null = null;
  private rafPending = false;
  private rotationSettleTimers: Set<ReturnType<typeof setTimeout>> = new Set();

  private readonly onResizeScheduleBound = () => this.scheduleRecompute();
  private readonly onHotRotationBound = () => this.handleHotRotation();

  constructor(config: ViewportFitGuardConfig = {}) {
    this.cfg = {
      injectGuardCss: config.injectGuardCss ?? true,
      exposeWindowAuditHelper: config.exposeWindowAuditHelper ?? true,
    };
    this.onMetricsChanged = config.onMetricsChanged;
    this.onOrientationChanged = config.onOrientationChanged;

    const initialVw =
      typeof window !== 'undefined'
        ? window.visualViewport?.width ?? window.innerWidth ?? 1280
        : 1280;
    const initialVh =
      typeof window !== 'undefined'
        ? window.visualViewport?.height ?? window.innerHeight ?? 720
        : 720;
    const initialDpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

    this.currentMetrics = computeViewportMetrics(initialVw, initialVh, initialDpr);
  }

  /**
   * Installs CSS custom-property bindings on `:root`, attaches `window` & `visualViewport`
   * resize observers, injects anti-crop/44px guard CSS, and exposes `window.__wsAuditLayout()`.
   */
  public install(): ComputedViewportMetrics {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return this.currentMetrics;
    }

    if (this.cfg.injectGuardCss) {
      this.injectGuardStylesheet();
    }

    if (this.cfg.exposeWindowAuditHelper) {
      window.__wsAuditLayout = (opts?: LayoutAuditOptions) => this.auditLayout(opts);
    }

    if (!this.installed) {
      this.installed = true;
      window.addEventListener('resize', this.onResizeScheduleBound, { passive: true });
      window.addEventListener('orientationchange', this.onHotRotationBound, { passive: true });
      window.screen?.orientation?.addEventListener?.('change', this.onHotRotationBound);
      window.visualViewport?.addEventListener('resize', this.onResizeScheduleBound, {
        passive: true,
      });
      window.visualViewport?.addEventListener('scroll', this.onResizeScheduleBound, {
        passive: true,
      });

      if (typeof ResizeObserver !== 'undefined') {
        this.resizeObserver = new ResizeObserver(() => this.scheduleRecompute());
        this.resizeObserver.observe(document.documentElement);
      }
    }

    return this.recomputeNow();
  }

  public recomputeNow(): ComputedViewportMetrics {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return this.currentMetrics;
    }

    const prevOrientation = this.currentMetrics.orientation;
    const prevProfile = this.currentMetrics.profile;
    const prevVw = this.currentMetrics.vw;
    const prevVh = this.currentMetrics.vh;

    const vw = window.visualViewport?.width ?? window.innerWidth ?? 1280;
    const vh = window.visualViewport?.height ?? window.innerHeight ?? 720;
    const dpr = window.devicePixelRatio || 1;
    const metrics = computeViewportMetrics(vw, vh, dpr);
    this.currentMetrics = metrics;

    const root = document.documentElement;
    const uiScaleStr = String(Number(metrics.uiScale.toFixed(4)));
    root.style.setProperty('--ws-vw', `${metrics.vw}px`);
    root.style.setProperty('--ws-vh', `${metrics.vh}px`);
    root.style.setProperty('--ws-ui-scale', uiScaleStr);
    root.style.setProperty('--ws-top-h', `${metrics.topH}px`);
    root.style.setProperty('--ws-spotlight-h', `${metrics.spotlightH}px`);
    root.style.setProperty('--ws-dock-h', `${metrics.dockH}px`);
    root.style.setProperty('--ws-spotlight-min-h', `${metrics.spotlightMinH}px`);
    root.style.setProperty('--ws-dock-max-h', `${metrics.dockMaxH}px`);
    root.style.setProperty('--ws-chyron-max-w', `${metrics.chyronMaxW}px`);
    root.style.setProperty('--ws-touch-min', '44px');
    root.style.setProperty('--ws-orientation', metrics.orientation);
    root.dataset.wsViewport = metrics.profile;
    root.dataset.wsOrientation = metrics.orientation;

    const changed =
      prevVw !== metrics.vw ||
      prevVh !== metrics.vh ||
      prevProfile !== metrics.profile ||
      prevOrientation !== metrics.orientation;

    if (prevOrientation !== metrics.orientation) {
      this.onOrientationChanged?.(metrics.orientation, metrics);
    }
    this.onMetricsChanged?.(metrics);

    if (changed && typeof CustomEvent === 'function') {
      window.dispatchEvent(new CustomEvent('ws:viewport-fit', { detail: metrics }));
    }

    return metrics;
  }

  public getMetrics(): ComputedViewportMetrics {
    return this.currentMetrics;
  }

  public auditLayout(options?: LayoutAuditOptions): LayoutAuditReport {
    this.recomputeNow();
    return runWorkspaceLayoutAudit(options);
  }

  public dispose(): void {
    for (const timer of this.rotationSettleTimers) {
      clearTimeout(timer);
    }
    this.rotationSettleTimers.clear();

    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.onResizeScheduleBound);
      window.removeEventListener('orientationchange', this.onHotRotationBound);
      window.screen?.orientation?.removeEventListener?.('change', this.onHotRotationBound);
      window.visualViewport?.removeEventListener('resize', this.onResizeScheduleBound);
      window.visualViewport?.removeEventListener('scroll', this.onResizeScheduleBound);
    }
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.installed = false;

    if (typeof document !== 'undefined') {
      document.getElementById(GUARD_STYLE_ELEMENT_ID)?.remove();
    }
  }

  private handleHotRotation(): void {
    // Recompute synchronously, then re-settle across mobile browser address-bar reflow frames!
    this.recomputeNow();
    this.scheduleRecompute();
    for (const delayMs of [80, 220]) {
      const timer = setTimeout(() => {
        this.rotationSettleTimers.delete(timer);
        if (this.installed) {
          this.recomputeNow();
        }
      }, delayMs);
      this.rotationSettleTimers.add(timer);
    }
  }

  private scheduleRecompute(): void {
    if (this.rafPending) return;
    this.rafPending = true;
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => {
        this.rafPending = false;
        this.recomputeNow();
      });
    } else {
      this.rafPending = false;
      this.recomputeNow();
    }
  }

  private injectGuardStylesheet(): void {
    if (typeof document === 'undefined') return;
    if (document.getElementById(GUARD_STYLE_ELEMENT_ID)) return;

    const styleEl = document.createElement('style');
    styleEl.id = GUARD_STYLE_ELEMENT_ID;
    styleEl.textContent = GUARD_STYLESHEET_CONTENT;
    document.head.appendChild(styleEl);
  }
}
