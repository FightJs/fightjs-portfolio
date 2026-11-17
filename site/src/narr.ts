import { anim, qs, qsa, reset } from './env';

export interface NarrCopy { proj: string; h: string; p: string; note?: string }

export function narrHTML(): string {
  return `<div class="narr" data-narr>
    <p class="proj narr-line" data-n="proj"></p>
    <h2 class="narr-line" data-n="h" data-focus tabindex="-1"></h2>
    <p class="narr-line" data-n="p"></p>
    <p class="note narr-line" data-n="note"></p>
  </div>`;
}

function fill(box: HTMLElement, c: NarrCopy) {
  qs(box, '[data-n="proj"]').textContent = c.proj;
  qs(box, '[data-n="h"]').textContent = c.h;
  qs(box, '[data-n="p"]').textContent = c.p;
  const n = qs(box, '[data-n="note"]');
  n.textContent = c.note ?? '';
  n.hidden = !c.note;
}

/** Swap the narrative: lines leave upward, new lines rise in, staggered. */
export async function swapNarr(box: HTMLElement, c: NarrCopy, instant: boolean, dir: 1 | -1 = 1) {
  const lines = qsa(box, '.narr-line');
  if (instant) {
    fill(box, c);
    lines.forEach((l) => anim(l, [{ opacity: 1 }, { opacity: 1 }], { duration: 1 }));
    return;
  }
  await Promise.all(lines.map((l, i) => anim(l, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `translateY(${-10 * dir}px)` }], { duration: 220, delay: i * 25, easing: 'ease-in' })));
  fill(box, c);
  await Promise.all(lines.map((l, i) => anim(l, [{ opacity: 0, transform: `translateY(${18 * dir}px)` }, { opacity: 1, transform: 'none' }], { duration: 700, delay: 60 + i * 90 })));
}

/** Crossfade between named views inside a panel. */
export async function switchView(root: HTMLElement, name: string, instant: boolean, sel = '[data-view]') {
  const views = qsa(root, sel);
  const next = views.find((v) => v.dataset.view === name);
  const prev = views.find((v) => !v.hidden && v !== next);
  if (!next) return;
  if (instant) {
    views.forEach((v) => {
      reset(v);
      v.hidden = v !== next;
    });
    return;
  }
  if (prev) {
    await anim(prev, [{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: 'ease-in' });
    prev.hidden = true;
  }
  reset(next);
  next.hidden = false;
  await anim(next, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 480 });
}
