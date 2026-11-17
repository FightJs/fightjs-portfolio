export const env = {
  reduced: false,
  low: false,
};

const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
env.reduced = mq.matches;
mq.addEventListener('change', (e) => {
  env.reduced = e.matches;
  document.documentElement.toggleAttribute('data-reduced', e.matches);
});
document.documentElement.toggleAttribute('data-reduced', env.reduced);
if ((navigator.hardwareConcurrency || 8) <= 2) env.low = true;

/** Rolling frame monitor. Flags low-performance once, worlds read env.low. */
export function watchPerformance() {
  let last = performance.now();
  let acc = 0;
  let n = 0;
  const tick = (t: number) => {
    const d = t - last;
    last = t;
    if (d < 200) {
      acc += d;
      n += 1;
      if (n === 90) {
        if (acc / n > 30) env.low = true;
        acc = 0;
        n = 0;
      }
    }
    if (!env.low) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

export const cssVar = (el: Element, name: string) => getComputedStyle(el).getPropertyValue(name).trim();

/** A cancellable timeline scope; every beat owns one. */
export class Scope {
  private ctl = new AbortController();
  get alive() {
    return !this.ctl.signal.aborted;
  }
  cancel() {
    this.ctl.abort();
  }
  sleep(ms: number): Promise<boolean> {
    if (env.reduced) return Promise.resolve(this.alive);
    return new Promise((resolve) => {
      const id = window.setTimeout(() => resolve(this.alive), ms);
      this.ctl.signal.addEventListener('abort', () => {
        window.clearTimeout(id);
        resolve(false);
      }, { once: true });
    });
  }
}

type KF = Keyframe[] | PropertyIndexedKeyframes;

/** Web Animations helper that collapses to the end state under reduced motion. */
export function anim(el: Element | null, kf: KF, opts: KeyframeAnimationOptions = {}): Promise<void> {
  if (!el) return Promise.resolve();
  const o: KeyframeAnimationOptions = { fill: 'both', easing: 'cubic-bezier(0.16, 1, 0.3, 1)', duration: 600, ...opts };
  if (env.reduced) {
    o.duration = 1;
    o.delay = 0;
    o.iterations = 1;
  }
  try {
    (el as HTMLElement).getAnimations().forEach((x) => {
      if (x.playState === 'finished') x.cancel();
    });
    const a = (el as HTMLElement).animate(kf, o);
    return a.finished.then(
      () => undefined,
      () => undefined,
    );
  } catch {
    return Promise.resolve();
  }
}

export function qs<T extends HTMLElement = HTMLElement>(root: ParentNode, sel: string): T {
  const el = root.querySelector<T>(sel);
  if (!el) throw new Error('missing ' + sel);
  return el;
}
export function qsa<T extends HTMLElement = HTMLElement>(root: ParentNode, sel: string): T[] {
  return Array.from(root.querySelectorAll<T>(sel));
}

export function html(strings: TemplateStringsArray, ...vals: unknown[]): string {
  return strings.reduce((a, s, i) => a + s + (i < vals.length ? String(vals[i]) : ''), '');
}

export function el<T extends HTMLElement = HTMLElement>(markup: string): T {
  const t = document.createElement('template');
  t.innerHTML = markup.trim();
  return t.content.firstElementChild as T;
}

export const rand = (a: number, b: number) => a + Math.random() * (b - a);
export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/** Size a canvas to its box with a capped, performance-aware pixel ratio. */
export function fitCanvas(c: HTMLCanvasElement): { w: number; h: number; dpr: number } {
  const r = c.getBoundingClientRect();
  const dpr = env.low ? 1 : Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.max(1, Math.round(r.width));
  const h = Math.max(1, Math.round(r.height));
  if (c.width !== w * dpr || c.height !== h * dpr) {
    c.width = w * dpr;
    c.height = h * dpr;
  }
  return { w, h, dpr };
}

/** Drop any held animation end-states so an element returns to its CSS. */
export function reset(...els: (Element | null | undefined)[]) {
  els.forEach((e) => (e as HTMLElement | null | undefined)?.getAnimations().forEach((a) => a.cancel()));
}

/** FLIP-bridge a shared visual anchor across world transitions. */
export async function bridgeElements(
  fromEl: HTMLElement | null,
  toEl: HTMLElement | null,
  host: HTMLElement,
  dur = 720,
): Promise<void> {
  if (!fromEl || !toEl || env.reduced || env.low) return;
  const r1 = fromEl.getBoundingClientRect();
  const r2 = toEl.getBoundingClientRect();
  if (r1.width === 0 || r2.width === 0) return;

  const clone = fromEl.cloneNode(true) as HTMLElement;
  clone.setAttribute('aria-hidden', 'true');
  clone.style.cssText = `position:fixed;left:${r1.left}px;top:${r1.top}px;width:${r1.width}px;height:${r1.height}px;margin:0;z-index:var(--z-hint);pointer-events:none;transform-origin:top left;`;
  host.appendChild(clone);

  const prevOpacity = toEl.style.opacity;
  toEl.style.opacity = '0';
  const dx = r2.left - r1.left;
  const dy = r2.top - r1.top;
  const sx = r2.width / r1.width;
  const sy = r2.height / r1.height;

  await Promise.all([
    anim(
      clone,
      [
        { transform: 'translate3d(0, 0, 0) scale(1, 1)', opacity: 0.9 },
        { transform: `translate3d(${dx}px, ${dy}px, 0) scale(${sx}, ${sy})`, opacity: 0 },
      ],
      { duration: dur, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'both' },
    ),
    anim(
      toEl,
      [{ opacity: 0 }, { opacity: 1 }],
      { duration: Math.round(dur * 0.35), delay: Math.round(dur * 0.65), easing: 'ease-out', fill: 'both' },
    ),
  ]);
  clone.remove();
  reset(toEl);
  toEl.style.opacity = prevOpacity;
}

/** Run a beat's demo timeline while gating forward navigation until it completes. */
export async function runDemo(
  inst: { demoBusy?: boolean; onDemoChange?: () => void },
  sc: Scope,
  fn: () => Promise<void>,
): Promise<void> {
  if (env.reduced) {
    await fn();
    if (inst.demoBusy) {
      inst.demoBusy = false;
      inst.onDemoChange?.();
    }
    return;
  }
  inst.demoBusy = true;
  inst.onDemoChange?.();
  try {
    await fn();
  } finally {
    if (sc.alive) {
      inst.demoBusy = false;
      inst.onDemoChange?.();
    }
  }
}
