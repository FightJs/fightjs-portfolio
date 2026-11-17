import { anim, bridgeElements, env } from './env';
import { TOTAL_STEPS, type WorldDef, type WorldId, type WorldInst } from './types';
import { openWorld } from './worlds/open';
import { graphWorld } from './worlds/graph';
import { studioWorld } from './worlds/studio';
import { comicWorld } from './worlds/comic';
import { finaleWorld } from './worlds/finale';

const DEFS: WorldDef[] = [openWorld, graphWorld, studioWorld, comicWorld, finaleWorld];
const STEPS: { world: WorldId; beat: number }[] = DEFS.flatMap((d) => Array.from({ length: d.beats }, (_, b) => ({ world: d.id, beat: b })));
if (STEPS.length !== TOTAL_STEPS) throw new Error('step count mismatch ' + STEPS.length);

type Edge = 'slit' | 'iris' | 'slash' | 'turn';
const EDGES: Record<string, Edge> = { 'void>graph': 'slit', 'graph>studio': 'iris', 'studio>comic': 'slash', 'comic>finale': 'turn' };

const POLY = {
  slashA: 'polygon(-40% 0%, -30% 0%, -50% 100%, -60% 100%)',
  slashB: 'polygon(-40% 0%, 140% 0%, 120% 100%, -60% 100%)',
  slashSliverA: 'polygon(-42% 0%, -37% 0%, -57% 100%, -62% 100%)',
  slashSliverB: 'polygon(136% 0%, 141% 0%, 116% 100%, 111% 100%)',
  turnA: 'polygon(112% 0%, 122% 0%, 102% 100%, 92% 100%)',
  turnB: 'polygon(-30% 0%, 122% 0%, 102% 100%, -50% 100%)',
  turnSliverA: 'polygon(121% 0%, 126% 0%, 101% 100%, 96% 100%)',
  turnSliverB: 'polygon(-34% 0%, -29% 0%, -54% 100%, -59% 100%)',
};

export class Story {
  private i = 0;
  private busy = false;
  private cur!: WorldInst;
  private curId!: WorldId;
  private host: HTMLElement;
  private live: HTMLElement;
  private lastPoint: { x: number; y: number } | null = null;
  private guard = 0;

  constructor(host: HTMLElement, live: HTMLElement) {
    this.host = host;
    this.live = live;
  }

  async start() {
    const def = DEFS[0];
    this.cur = this.make(def);
    this.curId = def.id;
    this.host.appendChild(this.cur.el);
    await this.safeShow(this.cur, 0, 1, true);
    this.sync();
    this.cur.settled?.();
    this.bind();
  }

  private make(def: WorldDef): WorldInst {
    try {
      const w = def.create();
      w.onDemoChange = () => {
        if (w === this.cur) this.syncControls();
      };
      return w;
    } catch (err) {
      console.error('world failed', def.id, err);
      return fallbackWorld(def);
    }
  }

  private async safeShow(w: WorldInst, beat: number, dir: 1 | -1, instant: boolean) {
    try {
      await w.show(beat, dir, instant);
    } catch (err) {
      console.error('beat failed', err);
      const main = w.el.querySelector('.wmain .frame');
      if (main && !main.querySelector('.scene-fallback')) {
        const f = document.createElement('div');
        f.className = 'scene-fallback';
        f.innerHTML = `<h2>${w.title(beat)}</h2><p>这一幕的动态画面没能加载，可以继续前进。</p>`;
        main.appendChild(f);
      }
    }
  }

  private pulseAt(x: number, y: number) {
    if (env.reduced || env.low) return;
    const d = document.createElement('div');
    d.className = 'click-pulse';
    d.setAttribute('aria-hidden', 'true');
    d.style.left = `${x}px`;
    d.style.top = `${y}px`;
    this.cur.el.appendChild(d);
    void anim(
      d,
      [
        { transform: 'scale(0.35)', opacity: 0.75 },
        { transform: 'scale(1.9)', opacity: 0 },
      ],
      { duration: 480, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'both' },
    ).then(() => d.remove());
  }

  private bind() {
    this.host.addEventListener('click', (e) => {
      const t = e.target as HTMLElement;
      const act = t.closest<HTMLElement>('[data-act]')?.dataset.act;
      this.lastPoint = { x: e.clientX, y: e.clientY };
      if (act === 'next') return void this.go(1);
      if (act === 'prev') return void this.go(-1);
      if (act === 'restart') return void this.restart();
      if (t.closest('a, button, input, [data-no-advance]')) return;
      if (this.curId === 'finale') return;
      if (this.busy || this.cur.demoBusy) return;
      this.pulseAt(e.clientX, e.clientY);
      this.go(1);
    });
    window.addEventListener('keydown', (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement;
      const onControl = !!t.closest('a, button, input');
      if (e.key === 'ArrowRight' || (e.key === ' ' && !onControl) || (e.key === 'Enter' && !onControl) || e.key === 'PageDown') {
        e.preventDefault();
        this.lastPoint = null;
        this.go(1);
      } else if (e.key === 'ArrowLeft' || e.key === 'Backspace' || e.key === 'PageUp') {
        e.preventDefault();
        this.lastPoint = null;
        this.go(-1);
      }
    });
  }

  get index() {
    return this.i;
  }

  async restart() {
    if (this.busy || this.i === 0) return;
    this.busy = true;
    const token = ++this.guard;
    try {
      const old = this.cur;
      const def = DEFS[0];
      const nu = this.make(def);
      old.el.inert = true;
      nu.el.inert = true;
      nu.el.classList.add('is-incoming');
      this.host.appendChild(nu.el);
      await this.safeShow(nu, 0, 1, true);
      await anim(nu.el, [{ opacity: 0 }, { opacity: 1 }], { duration: 600, easing: 'ease-out' });
      nu.el.classList.remove('is-incoming');
      old.destroy();
      old.el.remove();
      nu.el.inert = false;
      this.cur = nu;
      this.curId = def.id;
      this.i = 0;
      this.sync();
      this.cur.settled?.();
      this.focusHead();
    } catch (err) {
      console.error(err);
    } finally {
      if (this.guard === token) this.busy = false;
    }
  }

  /** One step at a time. Input during a transition is dropped, never queued. */
  async go(delta: 1 | -1) {
    if (this.busy) return;
    if (delta === 1 && this.cur.demoBusy) return;
    const next = this.i + delta;
    if (next < 0 || next >= STEPS.length) return;
    this.busy = true;
    this.syncControls();
    const token = ++this.guard;
    const watchdog = window.setTimeout(() => {
      if (this.busy && this.guard === token) {
        this.busy = false;
        this.guard++;
        this.syncControls();
      }
    }, 5000);
    try {
      const from = STEPS[this.i];
      const to = STEPS[next];
      if (from.world === to.world) {
        await this.safeShow(this.cur, to.beat, delta, false);
      } else {
        await this.cross(from.world, to.world, to.beat, delta);
      }
      this.i = next;
      this.sync();
      this.cur.settled?.();
      this.focusHead();
    } catch (err) {
      console.error(err);
    } finally {
      window.clearTimeout(watchdog);
      if (this.guard === token) {
        this.busy = false;
        this.syncControls();
      }
    }
  }

  private async cross(fromId: WorldId, toId: WorldId, _beat: number, dir: 1 | -1) {
    const toDef = DEFS.find((d) => d.id === toId)!;
    const old = this.cur;
    const nu = this.make(toDef);
    const edge = EDGES[dir === 1 ? `${fromId}>${toId}` : `${toId}>${fromId}`];
    const nuBeat = dir === 1 ? 0 : toDef.beats - 1;
    const sh = this.shape(edge);
    old.el.inert = true;
    nu.el.inert = true;
    if (dir === 1) {
      nu.el.style.clipPath = sh.a;
      nu.el.classList.add('is-incoming');
      this.host.appendChild(nu.el);
    } else {
      this.host.insertBefore(nu.el, old.el);
      old.el.classList.add('is-incoming');
    }
    await this.safeShow(nu, nuBeat, dir, true);
    const top = dir === 1 ? nu : old;
    const bridge = this.bridge(old.el, nu.el);
    await Promise.all([this.reveal(top.el, edge, dir, sh), bridge]);
    if (dir === 1) {
      top.el.getAnimations().forEach((a) => a.cancel());
      top.el.style.clipPath = '';
    }
    top.el.classList.remove('is-incoming');
    old.destroy();
    old.el.remove();
    nu.el.inert = false;
    this.cur = nu;
    this.curId = toId;
  }

  private async bridge(fromWorld: HTMLElement, toWorld: HTMLElement) {
    await bridgeElements(
      fromWorld.querySelector<HTMLElement>('[data-bridge="brand"]'),
      toWorld.querySelector<HTMLElement>('[data-bridge="brand"]'),
      this.host,
    );
  }

  private shape(edge: Edge): { a: string; b: string; dur: number } {
    const W = this.host.clientWidth;
    const H = this.host.clientHeight;
    if (edge === 'slit') return { a: 'inset(50% 0% 50% 0%)', b: 'inset(0% 0% 0% 0%)', dur: 900 };
    if (edge === 'iris') {
      const p = this.lastPoint ?? { x: W - 120, y: H - 42 };
      const r = Math.hypot(Math.max(p.x, W - p.x), Math.max(p.y, H - p.y)) + 40;
      return { a: `circle(0px at ${p.x}px ${p.y}px)`, b: `circle(${r}px at ${p.x}px ${p.y}px)`, dur: 1000 };
    }
    if (edge === 'slash') return { a: POLY.slashA, b: POLY.slashB, dur: 950 };
    return { a: POLY.turnA, b: POLY.turnB, dur: 1000 };
  }

  private async reveal(el: HTMLElement, edge: Edge, dir: 1 | -1, sh: { a: string; b: string; dur: number }) {
    const { a, b, dur } = sh;
    const kf = dir === 1 ? [{ clipPath: a }, { clipPath: b }] : [{ clipPath: b }, { clipPath: a }];
    const slashes = edge === 'slash' || edge === 'turn' ? this.slashLayer(edge, dir, dur) : this.edgeLine(edge, dir, dur);
    const easing = 'cubic-bezier(0.77, 0, 0.18, 1)';
    const inner = el.querySelector<HTMLElement>('.wmain');
    const settle = dir === 1 ? anim(inner, [{ transform: 'scale(1.05)' }, { transform: 'scale(1)' }], { duration: dur + 250, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }) : Promise.resolve();
    await Promise.all([anim(el, kf, { duration: dur, easing }), slashes, settle]);
  }

  /** a hairline in the incoming world's hue rides the slit and iris reveals */
  private edgeLine(edge: Edge, dir: 1 | -1, dur: number): Promise<void> {
    if (env.reduced || (edge !== 'slit' && edge !== 'iris')) return Promise.resolve();
    const W = this.host.clientWidth;
    const H = this.host.clientHeight;
    if (edge === 'slit') {
      const mkBeam = (sign: 1 | -1) => {
        const d = document.createElement('div');
        d.setAttribute('aria-hidden', 'true');
        d.style.cssText = 'position:absolute;left:0;right:0;top:50%;height:2px;margin-top:-1px;background:var(--hue-graph);z-index:var(--z-curtain);pointer-events:none;';
        this.host.appendChild(d);
        const y = sign * (H / 2);
        const kf = dir === 1
          ? [{ transform: 'translateY(0)', opacity: 1 }, { transform: `translateY(${y}px)`, opacity: 0 }]
          : [{ transform: `translateY(${y}px)`, opacity: 0 }, { transform: 'translateY(0)', opacity: 1 }];
        return anim(d, kf, { duration: dur, easing: 'cubic-bezier(0.77, 0, 0.18, 1)', fill: 'both' }).then(() => d.remove());
      };
      return Promise.all([mkBeam(-1), mkBeam(1)]).then(() => undefined);
    }
    const p = this.lastPoint ?? { x: W - 120, y: H - 42 };
    const r = Math.hypot(Math.max(p.x, W - p.x), Math.max(p.y, H - p.y)) + 40;
    const d = document.createElement('div');
    d.setAttribute('aria-hidden', 'true');
    d.style.cssText = `position:absolute;left:${p.x - r}px;top:${p.y - r}px;width:${r * 2}px;height:${r * 2}px;border-radius:50%;border:2px solid var(--hue-studio);z-index:var(--z-curtain);pointer-events:none;`;
    this.host.appendChild(d);
    const kf = dir === 1
      ? [{ transform: 'scale(0)', opacity: 1 }, { transform: 'scale(1)', opacity: 0 }]
      : [{ transform: 'scale(1)', opacity: 0 }, { transform: 'scale(0)', opacity: 1 }];
    return anim(d, kf, { duration: dur, easing: 'cubic-bezier(0.77, 0, 0.18, 1)', fill: 'both' }).then(() => d.remove());
  }

  /** two coloured slivers lead the wipe edge for the slash and page-turn transitions */
  private slashLayer(edge: Edge, dir: 1 | -1, dur: number): Promise<void> {
    if (env.reduced) return Promise.resolve();
    const A = edge === 'slash' ? POLY.slashSliverA : POLY.turnSliverA;
    const B = edge === 'slash' ? POLY.slashSliverB : POLY.turnSliverB;
    const mk = (colorVar: string, delay: number) => {
      const d = document.createElement('div');
      d.setAttribute('aria-hidden', 'true');
      const startClip = dir === 1 ? A : B;
      d.style.cssText = `position:absolute;inset:0;z-index:var(--z-curtain);background:var(${colorVar});clip-path:${startClip};pointer-events:none;opacity:0.9;`;
      this.host.appendChild(d);
      const kf = dir === 1 ? [{ clipPath: A }, { clipPath: B }] : [{ clipPath: B }, { clipPath: A }];
      return anim(d, kf, { duration: dur, delay, easing: 'cubic-bezier(0.77, 0, 0.18, 1)', fill: 'both' }).then(() => d.remove());
    };
    const c1 = edge === 'slash' ? '--hue-comic' : '--hue-graph';
    const c2 = edge === 'slash' ? '--hue-studio' : '--hue-comic';
    return Promise.all([mk(c2, 0), mk(c1, 60)]).then(() => undefined);
  }

  private syncControls() {
    const demoBusy = !!this.cur.demoBusy;
    const nextLocked = this.busy || demoBusy;
    document.querySelectorAll<HTMLElement>('[data-act="prev"]').forEach((b) => {
      b.toggleAttribute('disabled', this.i === 0 || this.busy);
    });
    document.querySelectorAll<HTMLElement>('[data-act="next"]').forEach((b) => {
      b.toggleAttribute('disabled', this.i === STEPS.length - 1 || nextLocked);
      b.classList.toggle('is-demo-busy', nextLocked && this.i < STEPS.length - 1);
    });
  }

  private sync() {
    const s = STEPS[this.i];
    const stepStr = `${String(this.i + 1).padStart(2, '0')} / ${TOTAL_STEPS}`;
    document.querySelectorAll<HTMLElement>('[data-step-counter]').forEach((el) => {
      el.textContent = stepStr;
    });
    document.querySelectorAll<HTMLElement>('.progress').forEach((p) => {
      Array.from(p.children).forEach((c, k) => {
        c.classList.toggle('is-on', k < this.i);
        c.classList.toggle('is-cur', k === this.i);
      });
    });
    this.syncControls();
    document.querySelectorAll<HTMLElement>('[data-next-label]').forEach((n) => {
      n.textContent = this.cur.nextLabel(s.beat);
    });
    this.live.textContent = `${this.cur.title(s.beat)}，第 ${this.i + 1} 幕，共 ${STEPS.length} 幕`;
  }

  private focusHead() {
    const f = this.cur.focusEl();
    if (f) {
      f.setAttribute('tabindex', '-1');
      f.focus({ preventScroll: true });
    }
  }
}

function fallbackWorld(def: WorldDef): WorldInst {
  const el = document.createElement('section');
  el.className = 'world';
  el.dataset.world = def.id;
  el.innerHTML = `<div></div><div class="wmain"><div class="frame"><div class="scene-fallback"><h2>这一幕没能加载</h2><p>可以继续前进，主线不会中断。</p></div></div></div>
  <footer class="wctl"><div class="frame"><button class="btn btn-quiet" data-act="prev"><span class="btn-key" aria-hidden="true">←</span><span>返回</span></button><div></div><button class="btn btn-cue" data-act="next"><span data-next-label>继续</span><span aria-hidden="true">→</span></button></div></footer>`;
  return {
    el,
    show: async () => undefined,
    nextLabel: () => '继续',
    title: () => '加载失败的一幕',
    focusEl: () => el.querySelector('h2'),
    destroy: () => undefined,
  };
}
