import { html } from './env';

export type WorldId = 'void' | 'graph' | 'studio' | 'comic' | 'finale';

export interface WorldInst {
  el: HTMLElement;
  show(beat: number, dir: 1 | -1, instant: boolean): Promise<void>;
  nextLabel(beat: number): string;
  title(beat: number): string;
  focusEl(): HTMLElement | null;
  /** True while this beat's demo timeline is playing and advancing forward should wait. */
  demoBusy?: boolean;
  /** Assigned by Story to refresh footer controls when demoBusy changes. */
  onDemoChange?: () => void;
  /** called once the world is visible and settled */
  settled?(): void;
  destroy(): void;
}

export interface WorldDef {
  id: WorldId;
  beats: number;
  create(): WorldInst;
}

export const TOTAL_STEPS = 12;

/** Shared world shell: nav slot, main slot, controls. */
export function buildShell(id: WorldId, label: string, nav: string, main: string, ctlExtra = ''): HTMLElement {
  const root = document.createElement('section');
  root.className = 'world';
  root.dataset.world = id;
  root.setAttribute('aria-label', label);
  const ticks = Array.from({ length: TOTAL_STEPS }, () => '<span></span>').join('');
  const isFinale = id === 'finale';
  const primaryAct = isFinale ? 'restart' : 'next';
  const primaryLabel = isFinale ? '重新体验主线' : '继续';
  const primaryKey = isFinale ? '↺' : '空格';
  root.innerHTML = html`
    <header class="wnav"><div class="frame">${nav}</div></header>
    <div class="wmain"><div class="frame">${main}</div></div>
    <footer class="wctl">
      <div class="frame">
        <button class="btn btn-quiet" type="button" data-act="prev"><span class="btn-key" aria-hidden="true">←</span><span>返回</span></button>
        <div class="ctl-mid">
          <span class="step-counter num" data-step-counter>01 / ${TOTAL_STEPS}</span>
          <div class="progress" aria-hidden="true">${ticks}</div>
        </div>
        <div class="ctl-right">${ctlExtra}
          <button class="btn btn-cue" type="button" data-act="${primaryAct}"><span data-next-label>${primaryLabel}</span><span aria-hidden="true">→</span><span class="btn-key">${primaryKey}</span></button>
        </div>
      </div>
    </footer>`;
  return root;
}

export const PHASES = ['问题', '能力', '产出'];
export function phaseHTML(): string {
  return `<ol class="phase" aria-label="本项目的三个阶段">${PHASES.map((p) => `<li>${p}</li>`).join('')}</ol>`;
}
export function setPhase(root: HTMLElement, beat: number) {
  root.querySelectorAll<HTMLElement>('.phase li').forEach((li, i) => {
    if (i === beat) li.setAttribute('aria-current', 'step');
    else li.removeAttribute('aria-current');
    li.classList.toggle('is-done', i < beat);
  });
}
