import { anim, cssVar, env, fitCanvas, qs, qsa, reset, runDemo, Scope } from '../env';
import { icon } from '../icons';
import { narrHTML, swapNarr, switchView, type NarrCopy } from '../narr';
import { buildShell, phaseHTML, setPhase, type WorldDef, type WorldInst } from '../types';

const NOTE = '示意演示：对话与方案均为预置，不调用 AI，不是真实咨询或交付结果。';
const COPY: NarrCopy[] = [
  { proj: '直播间智能搭建 Live Craft', h: '需求散在聊天里', p: '品牌、品类、预算、场地、设备，被说成一句句零散的话，没人替你整理。', note: NOTE },
  { proj: '直播间智能搭建 Live Craft', h: '把聊天变成一张调研表', p: '调研表状态机决定下一句问什么；跑题时纠偏，选择题给快捷选项，中断后能续接。产出唯一需求真相源 form_state。', note: NOTE },
  { proj: '直播间智能搭建 Live Craft', h: '从调研表到交付包', p: '方案文档是唯一真相源：三视图、环绕视频、设备清单都从它派生，打包前交叉校验。', note: '示意演示：设备、方案与画面均为预置示意，不是真实生成或供应商交付结果。' },
];

const FIELDS: [string, string][] = [['role', '身份'], ['vertical', '品类'], ['space', '场地'], ['budget', '预算档'], ['goal', '目标']];
const PIPE = ['调研表', '知识库检索', '方案文档', '三视图', '环绕视频', '交付包'];
const EQUIP: [string, string, string][] = [
  ['灯光', '柔光箱 / 柔光罩', '柔化主光，降低硬阴影'],
  ['相机', '微单相机', '主机位稳定出画，支持长时间直播'],
  ['镜头', '标准变焦镜头', '覆盖半身与商品特写'],
  ['支架', '灯架 / 三脚架', '固定灯光与相机，保证机位稳定'],
  ['背景', '背景墙 / 背景布', '建立品牌视觉层次，避免杂乱背景'],
];
const TIERS: [string, string][] = [['性价比', '预算优先'], ['进阶', '均衡'], ['高配', '画质优先']];
const PACK: [string, string][] = [['file', '设备与规划 PDF'], ['image', '三视图预览图'], ['clapper', '环绕预览视频'], ['layers', '设备清单 Excel']];

function planSVG(): string {
  return `<svg class="plan" viewBox="0 0 200 150" role="img" aria-label="直播间空间示意平面图，预置示例">
    <g class="plan-g">
      <rect class="p-room" x="22" y="14" width="156" height="118" rx="3"/>
      <rect class="p-wall" x="22" y="14" width="156" height="7"/>
      <path class="p-beam" d="M46 62 L96 82 L90 104 Z"/>
      <path class="p-beam" d="M154 62 L104 82 L110 104 Z"/>
      <rect class="p-light" x="40" y="55" width="14" height="6" rx="1.5"/>
      <rect class="p-light" x="146" y="55" width="14" height="6" rx="1.5"/>
      <circle class="p-host" cx="100" cy="86" r="6.5"/>
      <rect class="p-desk" x="84" y="96" width="32" height="8" rx="2"/>
      <path class="p-cam" d="M100 126 L92 138 L108 138 Z"/>
      <path class="p-fov" d="M100 126 L58 40 M100 126 L142 40"/>
    </g>
    <text class="p-label" x="100" y="148" text-anchor="middle" data-view-label>正面 0°</text>
  </svg>`;
}

function panelHTML(): string {
  return `
  <div class="st-app" data-panel>
    <section class="st-view" data-view="chat">
      <div class="st-chat">
        <header class="st-chead"><span class="st-avatar">${icon('ring', 18)}</span><b>小搭 · 直播间搭建助手</b><span class="st-sp"></span><span class="st-pill">提前结束并提交</span></header>
        <div class="st-thread" data-thread></div>
        <div class="st-input" aria-hidden="true"><span>示意界面，不可输入</span><span class="st-send">${icon('send', 15)}</span></div>
      </div>
      <aside class="st-form">
        <h4>AI 结构化内容</h4>
        <p class="st-sub">进度仅统计必填信息</p>
        <div class="st-meter" role="img" aria-label="必填信息进度"><span data-fill></span></div>
        <ul class="st-fields">${FIELDS.map(([k, n]) => `<li data-k="${k}"><span class="k">${n}</span><span class="v">待采集</span></li>`).join('')}</ul>
        <pre class="st-json" data-json aria-label="form_state 示意"></pre>
      </aside>
    </section>
    <section class="st-view" data-view="plan" hidden>
      <ol class="st-pipe" aria-label="方案管线">${PIPE.map((p) => `<li>${p}</li>`).join('')}</ol>
      <div class="st-body">
        <section class="st-eq"><h4>设备清单（示例）</h4>
          <ul>${EQUIP.map(([k, n, d]) => `<li><span class="k">${k}</span><b>${n}</b><span class="d">${d}</span></li>`).join('')}</ul>
          <div class="st-tiers" aria-label="推荐套餐">${TIERS.map(([n, d]) => `<span><b>${n}</b>${d}</span>`).join('')}</div>
        </section>
        <section class="st-views"><h4>三视图</h4>${planSVG()}
          <div class="st-angles" aria-hidden="true"><span data-a="0">0°</span><span data-a="120">120°</span><span data-a="240">240°</span></div></section>
        <section class="st-pack"><h4>交付包</h4>
          <ul>${PACK.map(([ic, n]) => `<li>${icon(ic, 16)}${n}</li>`).join('')}</ul>
          <div class="st-zip">${icon('box', 20)}<b>交付包 ZIP</b><span>方案、图、视频、清单一次拿走</span></div>
        </section>
      </div>
    </section>
  </div>`;
}

function create(): WorldInst {
  const nav = `<span class="st-brand" data-bridge="brand">${icon('ring', 24)}<b>Livestream Studio Setup Assistant</b></span>${phaseHTML()}`;
  const main = `<div class="st-grid">${narrHTML()}<div class="st-stage">${panelHTML()}</div></div>`;
  const root = buildShell('studio', '直播间智能搭建展示', nav, main);
  const cv = document.createElement('canvas');
  cv.className = 'ambient';
  cv.setAttribute('aria-hidden', 'true');
  root.prepend(cv);

  const narr = qs(root, '[data-narr]');
  const panel = qs(root, '[data-panel]');
  const stage = qs(root, '.st-stage');
  let scope = new Scope();
  let beat = -1;

  /* ---------- ambient: broadcast rings ---------- */
  const ctx = cv.getContext('2d');
  let W = 0, H = 0, D = 1, raf = 0, run = false;
  const rings = env.low ? 5 : 8;
  function draw(t: number) {
    if (!ctx) return;
    ctx.setTransform(D, 0, 0, D, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const cx = W * 0.66, cy = H * 0.54;
    const R = Math.hypot(W, H) * 0.62;
    ctx.strokeStyle = cssVar(root, '--ring');
    for (let i = 0; i < rings; i++) {
      const p = env.reduced ? (i + 0.5) / rings : ((t * 0.00007 + i / rings) % 1);
      const r = R * p;
      ctx.globalAlpha = Math.pow(1 - p, 1.6) * 0.5;
      ctx.lineWidth = 1 + (1 - p) * 1.4;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, 6.283);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  function loop(t: number) {
    if (!run) return;
    draw(t);
    raf = requestAnimationFrame(loop);
  }
  function startAmbient() {
    if (!ctx || run) return;
    const f = fitCanvas(cv);
    W = f.w; H = f.h; D = f.dpr;
    if (env.reduced) { draw(0); return; }
    run = true;
    raf = requestAnimationFrame(loop);
  }
  const onResize = () => { if (ctx) { const f = fitCanvas(cv); W = f.w; H = f.h; D = f.dpr; if (!run) draw(0); } };
  window.addEventListener('resize', onResize);

  /* ---------- timelines ---------- */
  const thread = qs(root, '[data-thread]');
  const fill = qs(root, '[data-fill]');
  const json = qs(root, '[data-json]');
  const field = (k: string) => qs(root, `.st-fields [data-k="${k}"]`);

  const bubble = (who: 'user' | 'ai', text: string, extra = ''): HTMLElement => {
    const b = document.createElement('div');
    b.className = `bub ${who}`;
    b.innerHTML = text + extra;
    thread.appendChild(b);
    return b;
  };
  const rise = (n: Element | null, d = 480) => anim(n, [{ opacity: 0, transform: 'translateY(14px) scale(0.98)' }, { opacity: 1, transform: 'none' }], { duration: d });
  const setProgress = (n: number) => { fill.style.transform = `scaleX(${n})`; };
  const fillField = (k: string, v: string) => {
    const li = field(k);
    li.classList.add('done');
    qs(li, '.v').textContent = v;
    void anim(li, [{ backgroundColor: 'var(--ui-accent-soft)' }, { backgroundColor: 'transparent' }], { duration: 900 });
  };
  const resetForm = () => {
    FIELDS.forEach(([k]) => { const li = field(k); li.classList.remove('done'); qs(li, '.v').textContent = '待采集'; });
    setProgress(0);
    json.textContent = '';
  };

  const MESSY = ['想做个好看的直播间', '预算大概三四万吧', '卖鞋的，主要放抖音', '场地不大，随便搭搭', '灯光要显白，别太亮', '之前买过设备，不知道还能不能用'];
  async function tlMessy(sc: Scope) {
    thread.innerHTML = '';
    resetForm();
    const lean = [-18, 22, -6, 30, -26, 10];
    let lastAnim: Promise<void> = Promise.resolve();
    for (let i = 0; i < MESSY.length; i++) {
      const b = bubble('user', MESSY[i]);
      b.style.marginLeft = `${lean[i]}%`;
      lastAnim = anim(b, [{ opacity: 0, transform: `translate(${lean[i] > 0 ? 60 : -60}px, 24px) rotate(${(i % 2 ? 2 : -2)}deg)` }, { opacity: 1, transform: 'none' }], { duration: 700 });
      if (!(await sc.sleep(520))) return;
    }
    await lastAnim;
  }

  const chipsHTML = (opts: string[]) => `<div class="chips" aria-hidden="true">${opts.map((o) => `<span>${o}</span>`).join('')}</div>`;
  async function ask(sc: Scope, q: string, opts: string[], pick: number, k: string, v: string, prog: number): Promise<boolean> {
    const a = bubble('ai', q, chipsHTML(opts));
    void rise(a);
    if (!(await sc.sleep(720))) return false;
    const chip = qsa(a, '.chips span')[pick];
    chip.classList.add('on');
    if (!(await sc.sleep(360))) return false;
    const u = bubble('user', opts[pick]);
    void rise(u, 380);
    fillField(k, v);
    setProgress(prog);
    return sc.sleep(440);
  }

  const FINAL_JSON = '{\n  "role": "主理人",\n  "vertical": "鞋靴",\n  "budget": "2到4万"\n}';
  async function tlTalk(sc: Scope) {
    thread.innerHTML = '';
    resetForm();
    if (env.reduced) {
      bubble('ai', '请问您的身份是？', chipsHTML(['主理人（老板）', '主播', '运营', '其他']));
      bubble('user', '主理人（老板）');
      bubble('ai', '预算档大概是？', chipsHTML(['2万内', '2到4万', '4万以上']));
      bubble('user', '2到4万');
      fillField('role', '主理人'); fillField('vertical', '鞋靴'); fillField('budget', '2到4万');
      setProgress(0.6);
      json.textContent = FINAL_JSON;
      return;
    }
    if (!(await sc.sleep(240))) return;
    if (!(await ask(sc, '请问您的身份是？', ['主理人（老板）', '主播', '运营', '其他'], 0, 'role', '主理人', 0.2))) return;
    if (!(await ask(sc, '主要卖什么品类？', ['鞋靴', '美妆', '食品', '科技'], 0, 'vertical', '鞋靴', 0.4))) return;
    const off = bubble('user', '能便宜点吗？');
    void rise(off, 380);
    if (!(await sc.sleep(600))) return;
    const back = bubble('ai', '报价会在方案里给出，先把预算档定下来。', '<span class="tag">路由纠偏</span>');
    void rise(back);
    if (!(await sc.sleep(900))) return;
    if (!(await ask(sc, '预算档大概是？', ['2万内', '2到4万', '4万以上'], 1, 'budget', '2到4万', 0.6))) return;
    json.textContent = '';
    for (let i = 1; i <= FINAL_JSON.length; i++) {
      json.textContent = FINAL_JSON.slice(0, i);
      if (!(await sc.sleep(20))) return;
    }
  }

  async function tlPlan(sc: Scope, onIntroDone?: () => void) {
    const pipe = qsa(root, '.st-pipe li');
    const eq = qsa(root, '.st-eq li');
    const tiers = qsa(root, '.st-tiers span');
    const packs = qsa(root, '.st-pack li');
    const zip = qs(root, '.st-zip');
    const g = qs(root, '.plan-g');
    const label = qs(root, '[data-view-label]');
    const angles = qsa(root, '.st-angles span');
    pipe.forEach((p) => p.classList.remove('on'));
    [...eq, ...tiers, ...packs, zip].forEach((n) => reset(n));
    const setAngle = (deg: number, instant = false) => {
      angles.forEach((a) => a.classList.toggle('on', Number(a.dataset.a) === deg));
      label.textContent = deg === 0 ? '正面 0°' : deg === 120 ? '左侧 120°' : '背面 240°';
      if (instant || env.reduced) { g.style.transform = `rotate(${deg}deg)`; return Promise.resolve(); }
      return anim(g, [{ transform: g.style.transform || 'rotate(0deg)' }, { transform: `rotate(${deg}deg)` }], { duration: 900, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', fill: 'forwards' }).then(() => { g.style.transform = `rotate(${deg}deg)`; reset(g); });
    };
    setAngle(0, true);
    if (env.reduced) {
      pipe.forEach((p) => p.classList.add('on'));
      onIntroDone?.();
      return;
    }
    eq.forEach((n, i) => void anim(n, [{ opacity: 0.7, transform: 'translateX(-10px)' }, { opacity: 1, transform: 'none' }], { duration: 420, delay: i * 60 }));
    tiers.forEach((n, i) => void anim(n, [{ opacity: 0.7, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 420, delay: 160 + i * 60 }));
    packs.forEach((n, i) => void anim(n, [{ opacity: 0.7, transform: 'translateX(10px)' }, { opacity: 1, transform: 'none' }], { duration: 420, delay: 200 + i * 60 }));
    void anim(zip, [{ opacity: 0.7, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 480, delay: 320 });
    for (let i = 0; i < pipe.length; i++) {
      pipe[i].classList.add('on');
      if (!(await sc.sleep(420))) return;
    }
    onIntroDone?.();
    // the three views take turns until the viewer moves on
    let a = 0;
    const seq = [120, 240, 0];
    while (sc.alive && !env.reduced) {
      if (!(await sc.sleep(1500))) return;
      await setAngle(seq[a % 3]);
      a++;
    }
  }

  const views = ['chat', 'chat', 'plan'];
  const inst: WorldInst = {
    el: root,
    nextLabel: (b) => (b === 2 ? '下一个世界' : b === 0 ? '看它如何整理' : '看最终产出'),
    title: (b) => `直播间智能搭建，${['问题', '能力', '产出'][b]}：${COPY[b].h}`,
    focusEl: () => qs(root, '[data-n="h"]'),
    settled() { startAmbient(); },
    async show(b, dir, instant) {
      scope.cancel();
      scope = new Scope();
      const sc = scope;
      inst.demoBusy = false;
      inst.onDemoChange?.();
      const first = beat < 0;
      beat = b;
      setPhase(root, b);
      if (first) startAmbient();
      if (first && !env.reduced) {
        void anim(stage, [{ opacity: 0, transform: 'translateY(30px)' }, { opacity: 1, transform: 'none' }], { duration: 1000, delay: 250, fill: 'backwards' });
      }
      const sameView = views[b] === views[Math.max(0, b - dir)] && !first;
      await Promise.all([swapNarr(narr, COPY[b], instant || first, dir), sameView ? Promise.resolve() : switchView(panel, views[b], instant || first)]);
      if (b === 0) void runDemo(inst, sc, () => tlMessy(sc));
      if (b === 1) void runDemo(inst, sc, () => tlTalk(sc));
      if (b === 2) {
        if (!env.reduced) {
          inst.demoBusy = true;
          inst.onDemoChange?.();
        }
        void tlPlan(sc, () => {
          if (sc.alive && inst.demoBusy) {
            inst.demoBusy = false;
            inst.onDemoChange?.();
          }
        });
      }
    },
    destroy() {
      scope.cancel();
      inst.demoBusy = false;
      run = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    },
  };
  return inst;
}

export const studioWorld: WorldDef = { id: 'studio', beats: 3, create };
