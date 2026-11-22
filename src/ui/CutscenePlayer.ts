// ============================================================================
// WORLD'S SMARTEST — Full-Screen Illustrated Act Cutscene Player
// Plays act0..act5.jpg w/ smooth Ken-Burns pan, reactive portrait cutout,
// synced studio neural VO (cutscene_act0..5_*.mp3), and verbatim subtitles.
// ============================================================================

import type { StudioAudioEngine } from '../audio/StudioAudioEngine';
import type { HapticsEngine } from '../audio/HapticsEngine';

export interface CutsceneLineItem {
  id: string;
  speaker: string;
  speaker_name: string;
  expression?: string;
  voice_clip?: string;
  text: string;
}

export interface CutsceneSpec {
  id: string;
  act_index?: number;
  title: string;
  location?: string;
  image: string;
  ken_burns?: {
    start_scale?: number;
    end_scale?: number;
    pan_x?: number;
    pan_y?: number;
  };
  lines: CutsceneLineItem[];
}

function toWebAssetPath(raw: string): string {
  if (!raw) return '';
  if (raw.startsWith('res://')) return `./${raw.slice('res://'.length)}`;
  if (raw.startsWith('/assets/')) return `.${raw}`;
  if (raw.startsWith('assets/')) return `./${raw}`;
  return raw;
}

export function resolvePortraitCutoutUrl(actorId: string, expression = 'neutral'): string {
  const id = (actorId || 'vance').toLowerCase();
  const expr = (expression || 'neutral').toLowerCase();
  if (id === 'vance' && (expr === 'intense' || expr === 'shocked' || expr === 'tense')) {
    return './assets/portraits_cutout/vance_intense.png';
  }
  if (id === 'nadia' && (expr === 'shocked' || expr === 'rattled')) {
    return './assets/portraits_cutout/nadia_shocked.png';
  }
  if (id === 'soren' && expr === 'smirk') {
    return './assets/portraits_cutout/soren_smirk.png';
  }
  if (id === 'teo' && (expr === 'intense' || expr === 'shocked' || expr === 'tense')) {
    return './assets/portraits_cutout/teo_intense.png';
  }
  const validActors = new Set(['vance', 'nadia', 'soren', 'teo', 'lindqvist', 'tariq']);
  const safeActor = validActors.has(id) ? id : 'vance';
  return `./assets/portraits_cutout/${safeActor}.png`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export class CutscenePlayer {
  private audio: StudioAudioEngine;
  private haptics: HapticsEngine;
  private activeOverlay: HTMLElement | null = null;

  constructor(audio: StudioAudioEngine, haptics: HapticsEngine) {
    this.audio = audio;
    this.haptics = haptics;
  }

  public isActive(): boolean {
    return this.activeOverlay !== null;
  }

  public play(
    cutscene: CutsceneSpec,
    challengerName: string,
    onComplete: () => void,
  ): void {
    this.close();

    const lines = cutscene.lines?.length ? cutscene.lines : [];
    if (lines.length === 0) {
      onComplete();
      return;
    }

    let lineIndex = 0;
    const kb = cutscene.ken_burns ?? { start_scale: 1.03, end_scale: 1.13, pan_x: 0.025, pan_y: -0.02 };
    const startScale = kb.start_scale ?? 1.03;
    const endScale = kb.end_scale ?? 1.13;
    const panX = (kb.pan_x ?? 0.02) * 100;
    const panY = (kb.pan_y ?? -0.02) * 100;

    const overlay = document.createElement('div');
    overlay.className = 'ws-cutscene-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', cutscene.title);

    const imgUrl = toWebAssetPath(cutscene.image);
    const displayPlayerName = challengerName?.trim() || 'Challenger';

    overlay.innerHTML = `
      <div class="ws-cutscene-art" id="ws-cs-art" style="background-image:url('${escapeHtml(imgUrl)}');transform:scale(${startScale}) translate3d(0px,0px,0px);"></div>
      <div class="ws-cutscene-vignette"></div>

      <div style="position:relative;z-index:2;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;">
        <div class="ws-chyron">
          <span class="ws-chyron-dot"></span>
          <span class="ws-chyron-title">${escapeHtml(cutscene.title)}</span>
          ${cutscene.location ? `<span class="ws-chyron-sub">· ${escapeHtml(cutscene.location)}</span>` : ''}
        </div>
        <button type="button" class="ws-util-pill" id="ws-cs-skip">SKIP CINEMA ⏭</button>
      </div>

      <div style="position:relative;z-index:2;width:100%;max-width:920px;margin:0 auto;">
        <div class="ws-frame-cinema" style="padding:clamp(12px,2vw,20px);display:flex;flex-direction:column;gap:12px;">
          <div style="display:flex;align-items:center;gap:14px;">
            <div class="ws-actor-cutout-wrap" style="width:68px;height:68px;border-radius:12px;">
              <img id="ws-cs-portrait" class="ws-actor-cutout-img" src="" alt="" />
            </div>
            <div style="flex:1 1 auto;min-width:0;">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
                <span id="ws-cs-speaker" style="font-family:var(--font-display);font-weight:700;font-size:clamp(13px,1.4vw,16px);color:var(--gold-bright);letter-spacing:0.06em;"></span>
                <span id="ws-cs-step" style="font-family:var(--font-mono);font-size:11.5px;color:var(--ivory-muted);"></span>
              </div>
              <p id="ws-cs-text" style="margin:6px 0 0;font-size:clamp(14px,1.55vw,18px);line-height:1.42;color:var(--ivory-primary);font-weight:500;"></p>
            </div>
          </div>

          <div style="display:flex;align-items:center;justify-content:flex-end;gap:10px;">
            <button type="button" class="ws-btn-gold" id="ws-cs-next">CONTINUE ▶</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    this.activeOverlay = overlay;
    this.audio.playSfx('cutscene_whoosh');

    // Trigger smooth Ken-Burns drift on next animation frame
    requestAnimationFrame(() => {
      const artEl = overlay.querySelector<HTMLElement>('#ws-cs-art');
      if (artEl) {
        artEl.style.transform = `scale(${endScale}) translate3d(${panX.toFixed(2)}%, ${panY.toFixed(2)}%, 0px)`;
      }
    });

    const portraitEl = overlay.querySelector<HTMLImageElement>('#ws-cs-portrait');
    const speakerEl = overlay.querySelector<HTMLElement>('#ws-cs-speaker');
    const stepEl = overlay.querySelector<HTMLElement>('#ws-cs-step');
    const textEl = overlay.querySelector<HTMLElement>('#ws-cs-text');
    const nextBtn = overlay.querySelector<HTMLButtonElement>('#ws-cs-next');
    const skipBtn = overlay.querySelector<HTMLButtonElement>('#ws-cs-skip');

    const finish = () => {
      this.audio.stopVoice();
      this.close();
      onComplete();
    };

    const renderLine = (idx: number) => {
      const line = lines[idx];
      if (!line) {
        finish();
        return;
      }
      const interpolated = line.text
        .replace(/\{player\}|\{name\}|<CHALLENGER>/gi, displayPlayerName);

      if (portraitEl) {
        portraitEl.src = resolvePortraitCutoutUrl(line.speaker, line.expression);
        portraitEl.alt = line.speaker_name;
      }
      if (speakerEl) speakerEl.textContent = line.speaker_name.toUpperCase();
      if (stepEl) stepEl.textContent = `SCENE ${idx + 1} / ${lines.length}`;
      if (textEl) textEl.textContent = `“${interpolated}”`;
      if (nextBtn) {
        nextBtn.textContent = idx + 1 >= lines.length ? 'ENTER STAGE ▶' : 'NEXT LINE ▶';
      }

      if (line.voice_clip) {
        this.audio.playVoice(line.voice_clip);
      }
    };

    nextBtn?.addEventListener('click', () => {
      this.haptics.uiTap();
      this.audio.playSfx('ui_tap');
      lineIndex += 1;
      if (lineIndex >= lines.length) {
        finish();
      } else {
        renderLine(lineIndex);
      }
    });

    skipBtn?.addEventListener('click', () => {
      this.haptics.uiTap();
      this.audio.playSfx('ui_tap');
      finish();
    });

    renderLine(0);
  }

  public close(): void {
    if (this.activeOverlay) {
      this.activeOverlay.remove();
      this.activeOverlay = null;
    }
  }
}
