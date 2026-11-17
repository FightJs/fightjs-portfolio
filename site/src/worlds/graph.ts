import { anim, clamp, cssVar, el, env, fitCanvas, qs, qsa, rand, reset, runDemo, Scope } from '../env';
import { icon } from '../icons';
import { narrHTML, swapNarr, switchView, type NarrCopy } from '../narr';
import { buildShell, phaseHTML, setPhase, type WorldDef, type WorldInst } from '../types';

const COPY: NarrCopy[] = [
  { proj: 'GraphRAG-Agent', h: '资料散在八种格式里', p: 'PDF、DOCX、XLSX、PPTX、HTML、TXT、Markdown、CSV。问一句话，得翻遍每个文件。', note: '架构设计：基于 FastAPI 异步任务队列与 React 18 前端协同，统一接入八类常见办公与技术文档。' },
  { proj: 'GraphRAG-Agent', h: '文档变成实体与关系', p: '五阶段异步索引：解析、Markdown、分块、图谱抽取、向量化。图谱可以浏览，也能增量编辑。', note: '图谱引擎：支持主干概览、局部探索与完整图谱切换，实体与关系支持在画布内增量编辑。' },
  { proj: 'GraphRAG-Agent', h: '按范围提问，三种检索', p: 'KG-Only 只看图谱。RRF Agentic 拆出子查询，向量、关键词、图谱三路召回再融合，给出可溯源片段。Auto 按图谱规模自动选。', note: '检索与安全：流式回答附带精准段落引用，支持 Fernet 加密的 BYOK 凭据本地存储与校验。' },
];

const DOCS: [string, string, string][] = [
  ['pdf', 'PDF', '季度复盘.pdf'], ['docx', 'DOCX', '评审会纪要.docx'], ['xlsx', 'XLSX', '预算表.xlsx'], ['pptx', 'PPTX', '产品路线图.pptx'],
  ['html', 'HTML', '官网说明.html'], ['md', 'MD', '部署笔记.md'], ['csv', 'CSV', '供应商清单.csv'], ['txt', 'TXT', '日志摘录.txt'],
];

type T = 'person' | 'place' | 'concept' | 'org' | 'date' | 'other';
const NODE_DEFS: [string, T, number][] = [
  ['云舟计划', 'concept', 2], ['林岚', 'person', 1], ['周远', 'person', 1], ['许乔', 'person', 1], ['陈简', 'person', 1], ['方知', 'person', 1],
  ['海屿科技', 'org', 1], ['北辰实验室', 'org', 1], ['苏州', 'place', 1], ['深圳', 'place', 1],
  ['预算评审', 'concept', 1.15], ['数据合规', 'concept', 1.15], ['供应链', 'concept', 1.15], ['向量索引', 'concept', 1.1], ['知识图谱', 'concept', 1],
  ['2026年Q1', 'date', 1], ['2026年Q2', 'date', 1], ['评审会纪要', 'other', 1], ['预算表', 'other', 1], ['部署笔记', 'other', 1], ['报价单', 'other', 1],
];
const LINKS: [string, string][] = [
  ['云舟计划', '林岚'], ['云舟计划', '周远'], ['云舟计划', '许乔'], ['云舟计划', '陈简'], ['云舟计划', '方知'], ['云舟计划', '海屿科技'], ['云舟计划', '北辰实验室'],
  ['云舟计划', '预算评审'], ['云舟计划', '数据合规'], ['云舟计划', '供应链'], ['云舟计划', '向量索引'], ['云舟计划', '2026年Q1'],
  ['林岚', '预算评审'], ['周远', '供应链'], ['许乔', '数据合规'], ['陈简', '向量索引'], ['海屿科技', '供应链'], ['海屿科技', '苏州'], ['北辰实验室', '深圳'],
  ['预算评审', '预算表'], ['预算评审', '评审会纪要'], ['数据合规', '评审会纪要'], ['供应链', '报价单'], ['向量索引', '知识图谱'], ['知识图谱', '部署笔记'],
  ['2026年Q1', '预算评审'], ['2026年Q2', '数据合规'], ['方知', '北辰实验室'], ['报价单', '海屿科技'],
];
const LEGEND: [T, string][] = [['person', '人物'], ['place', '地点'], ['concept', '概念'], ['org', '公司'], ['date', '日期'], ['other', '其他']];
const STAGES = ['解析', 'Markdown', '分块', '图谱抽取', '向量化'];

interface GNode { id: string; t: T; r: number; x: number; y: number; vx: number; vy: number; born: number; k: number }

function rows(): string {
  return DOCS.map(([f, tag, n]) => `<li class="gr-row"><span class="fmt" data-f="${f}">${tag}</span><span class="fn">${n}</span><span class="st">待索引</span></li>`).join('');
}

function panelHTML(): string {
  return `
  <div class="gr-app" data-panel>
    <div class="gr-top"><span class="gr-logo">G</span><b>GraphRAG Agent</b><span class="gr-spacer"></span>${icon('bell', 16)}<span class="gr-user"><i>o</i>owner</span></div>
    <div class="gr-body">
      <aside class="gr-side">
        <div class="gr-kb"><span>云舟项目知识库</span><small>8 份关联文档</small></div>
        <ul class="gr-nav">
          <li data-nav="docs">${icon('file', 16)}文档库</li>
          <li data-nav="graph">${icon('graph', 16)}知识图谱</li>
          <li data-nav="qa">${icon('chat', 16)}智能问答</li>
          <li>${icon('history', 16)}问答历史</li>
        </ul>
        <div class="gr-set">${icon('gear', 16)}设置</div>
      </aside>
      <div class="gr-content">
        <section class="gr-view" data-view="docs">
          <header class="gr-vhead"><h3>文档库</h3><span class="gr-sub" data-docs-stat>8 个文件，尚未建立索引</span></header>
          <ul class="gr-rows">${rows()}</ul>
        </section>
        <section class="gr-view" data-view="graph" hidden>
          <header class="gr-vhead"><h3>知识图谱</h3><span class="gr-sub" data-gstat>等待抽取</span>
            <div class="gr-seg" aria-hidden="true"><span class="on">主干概览</span><span>局部探索</span><span>完整图谱</span></div></header>
          <ol class="gr-stages" aria-label="五阶段索引">${STAGES.map((s) => `<li>${s}</li>`).join('')}</ol>
          <div class="gr-canvaswrap"><canvas class="gr-canvas" role="img" aria-label="云舟项目知识图谱可视化"></canvas></div>
          <ul class="gr-legend" aria-label="实体类型">${LEGEND.map(([t, n]) => `<li data-t="${t}">${n}</li>`).join('')}</ul>
        </section>
        <section class="gr-view" data-view="qa" hidden>
          <div class="qa">
            <div class="qa-docs"><h4>选择文档</h4><p class="gr-sub">已选 2 / 2 份</p>
              <ul><li class="on"><i></i>评审会纪要.docx</li><li class="on"><i></i>预算表.xlsx</li></ul></div>
            <div class="qa-chat">
              <header class="qa-head"><div><b>知识库联合问答</b><p class="gr-sub">已选 2 份文档参与检索</p></div>
                <div class="gr-seg" role="img" aria-label="检索模式：KG-Only、RRF Agentic、Auto"><span data-m="kg">KG-Only</span><span data-m="rrf">RRF Agentic</span><span data-m="auto">Auto</span></div></header>
              <div class="qa-thread"><div class="bub user" data-user></div><div class="bub ai" data-ai></div></div>
              <div class="qa-input" aria-hidden="true"><span>输入问题，检索已选文档与关联图谱…</span><span class="send">${icon('send', 14)}发送</span></div>
            </div>
            <aside class="qa-side" data-no-advance><h4>检索详情</h4><div class="qa-side-body"><div class="qa-mode" data-mode></div><details class="qa-fold" data-sub-fold open hidden><summary>子查询拆解</summary><ul class="qa-sub" data-sub></ul></details><details class="qa-fold" data-src-fold open hidden><summary>溯源片段</summary><ul class="qa-src" data-src></ul></details></div></aside>
          </div>
        </section>
      </div>
    </div>
  </div>`;
}

function create(): WorldInst {
  const nav = `<span class="gr-brand" data-bridge="brand"><span class="gr-mark">G</span><span>GraphRAG-Agent</span></span>${phaseHTML()}`;
  const main = `<div class="gr-grid">${narrHTML()}<div class="gr-stage">${panelHTML()}</div></div>`;
  const root = buildShell('graph', 'GraphRAG-Agent 展示', nav, main);
  const amb = document.createElement('canvas');
  amb.className = 'ambient';
  amb.setAttribute('aria-hidden', 'true');
  root.prepend(amb);

  const narr = qs(root, '[data-narr]');
  const panel = qs(root, '[data-panel]');
  const stage = qs(root, '.gr-stage');

  let scope = new Scope();
  let beat = -1;

  /* ---------- ambient: document shards that gather into a graph ---------- */
  const actx = amb.getContext('2d');
  const fmtKeys = ['--fmt-pdf', '--fmt-docx', '--fmt-xlsx', '--fmt-pptx', '--fmt-html', '--fmt-md', '--fmt-csv', '--fmt-txt'];
  interface Sh { sx: number; sy: number; gx: number; gy: number; x: number; y: number; vx: number; vy: number; rot: number; vr: number; c: string; ph: number; link: number[] }
  let shards: Sh[] = [];
  let aW = 0, aH = 0, aD = 1;
  let aRaf = 0, aRun = false, aMorph = 0, aTarget = 0;
  const aptr = { x: -999, y: -999 };

  function initAmbient() {
    if (!actx) return;
    const f = fitCanvas(amb);
    aW = f.w; aH = f.h; aD = f.dpr;
    const n = env.low ? 26 : 46;
    const cols = fmtKeys.map((k) => cssVar(root, k));
    shards = Array.from({ length: n }, (_, i) => {
      const a = i * 2.399963;
      const rad = 0.32 + 0.62 * Math.sqrt((i + 0.5) / n);
      return {
        sx: rand(0, aW), sy: rand(0, aH),
        gx: aW * 0.5 + Math.cos(a) * rad * aW * 0.62, gy: aH * 0.52 + Math.sin(a) * rad * aH * 0.62,
        x: rand(-80, aW + 80), y: rand(-80, aH + 80), vx: 0, vy: 0, rot: rand(-0.6, 0.6), vr: rand(-0.004, 0.004),
        c: cols[i % cols.length], ph: rand(0, 6.28), link: [],
      };
    });
    shards.forEach((s, i) => {
      const near = shards.map((o, j) => ({ j, d: (o.gx - s.gx) ** 2 + (o.gy - s.gy) ** 2 })).filter((o) => o.j !== i).sort((a, b) => a.d - b.d).slice(0, 2);
      s.link = near.map((o) => o.j);
    });
  }

  function aStep(t: number) {
    if (!actx || !aRun) return;
    aMorph += (aTarget - aMorph) * 0.03;
    actx.setTransform(aD, 0, 0, aD, 0, 0);
    actx.clearRect(0, 0, aW, aH);
    const interact = !env.low && !env.reduced;
    actx.lineWidth = 1;
    actx.strokeStyle = cssVar(root, '--edge');
    if (aMorph > 0.05) {
      actx.globalAlpha = 0.34 * aMorph;
      actx.beginPath();
      shards.forEach((s) => s.link.forEach((j) => { actx.moveTo(s.x, s.y); actx.lineTo(shards[j].x, shards[j].y); }));
      actx.stroke();
    }
    for (const s of shards) {
      const tx = aTarget ? s.gx : s.sx + Math.sin(t * 0.0004 + s.ph) * 30;
      const ty = aTarget ? s.gy : s.sy + Math.cos(t * 0.00035 + s.ph) * 24;
      let ax = (tx - s.x) * 0.012;
      let ay = (ty - s.y) * 0.012;
      if (interact) {
        const dx = s.x - aptr.x, dy = s.y - aptr.y, d2 = dx * dx + dy * dy;
        if (d2 < 14000) { const d = Math.sqrt(d2) || 1; const f = (1 - d2 / 14000) * 0.9; ax += (dx / d) * f; ay += (dy / d) * f; }
      }
      s.vx = (s.vx + ax) * 0.9; s.vy = (s.vy + ay) * 0.9;
      s.x += s.vx; s.y += s.vy;
      s.rot += s.vr * (1 - aMorph);
      actx.save();
      actx.translate(s.x, s.y);
      actx.rotate(s.rot * (1 - aMorph));
      actx.fillStyle = s.c;
      actx.globalAlpha = 0.42;
      const w = 15, h = 19, m = aMorph;
      const rr = (Math.min(w, h) / 2) * m + 2 * (1 - m);
      const ww = w + (11 - w) * m, hh = h + (11 - h) * m;
      actx.beginPath();
      actx.roundRect(-ww / 2, -hh / 2, ww, hh, rr);
      actx.fill();
      if (m < 0.6) {
        actx.globalAlpha = 0.5 * (1 - m);
        actx.fillStyle = cssVar(root, '--color-paper');
        for (let k = 0; k < 3; k++) actx.fillRect(-w / 2 + 3, -h / 2 + 5 + k * 4, w - 6 - (k === 2 ? 4 : 0), 1.4);
      }
      actx.restore();
    }
    actx.globalAlpha = 1;
    aRaf = requestAnimationFrame(aStep);
  }
  function runAmbient() {
    if (!actx || aRun) return;
    initAmbient();
    if (env.reduced) {
      aMorph = aTarget;
      shards.forEach((s) => { s.x = aTarget ? s.gx : s.sx; s.y = aTarget ? s.gy : s.sy; });
      aRun = true; aStep(0); aRun = false;
      return;
    }
    aRun = true;
    aRaf = requestAnimationFrame(aStep);
  }
  const onPtr = (e: PointerEvent) => {
    const r = amb.getBoundingClientRect();
    aptr.x = e.clientX - r.left; aptr.y = e.clientY - r.top;
    if (!env.reduced && !env.low) {
      const rx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ry = (e.clientY / window.innerHeight - 0.5) * 2;
      panel.style.transform = `perspective(1600px) rotateY(${(-rx * 2.2).toFixed(2)}deg) rotateX(${(ry * 1.6).toFixed(2)}deg)`;
    }
  };
  root.addEventListener('pointermove', onPtr);
  const onResizeAmb = () => { if (actx && (aRun || env.reduced)) { const was = aRun; aRun = false; cancelAnimationFrame(aRaf); initAmbient(); aRun = was; if (was) aRaf = requestAnimationFrame(aStep); } };
  window.addEventListener('resize', onResizeAmb);

  /* ---------- in-panel knowledge graph ---------- */
  const gcv = qs<HTMLCanvasElement>(root, '.gr-canvas');
  const gctx = gcv.getContext('2d');
  const nodes: GNode[] = NODE_DEFS.map(([id, t, k]) => ({ id, t, r: 10 * k, k, x: 0, y: 0, vx: 0, vy: 0, born: Infinity }));
  const idx = new Map(nodes.map((n, i) => [n.id, i]));
  const links = LINKS.map(([a, b]) => [idx.get(a)!, idx.get(b)!] as [number, number]);
  let gW = 0, gH = 0, gD = 1, gRaf = 0, gRun = false, gLaid = false;
  const nodeColor: Record<string, string> = {};

  function layout() {
    const f = fitCanvas(gcv);
    gW = f.w; gH = f.h; gD = f.dpr;
    LEGEND.forEach(([t]) => (nodeColor[t] = cssVar(root, `--node-${t}`)));
    const s = Math.min(gW, gH) / 330;
    nodes.forEach((n, i) => {
      const a = i * 2.399963;
      const rad = i === 0 ? 0 : 60 + 90 * Math.sqrt(i / nodes.length);
      n.x = gW / 2 + Math.cos(a) * rad * s; n.y = gH / 2 + Math.sin(a) * rad * s; n.vx = 0; n.vy = 0;
      n.r = 10 * n.k * Math.max(0.8, s);
    });
    for (let it = 0; it < 320; it++) {
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          let dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy + 0.01;
          const f2 = (4600 * s * s) / d2;
          const d = Math.sqrt(d2);
          dx /= d; dy /= d;
          a.vx += dx * f2; a.vy += dy * f2; b.vx -= dx * f2; b.vy -= dy * f2;
        }
      }
      links.forEach(([i, j]) => {
        const a = nodes[i], b = nodes[j];
        const dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
        const k = (d - 88 * s) * 0.012;
        a.vx += (dx / d) * k * 20; a.vy += (dy / d) * k * 20; b.vx -= (dx / d) * k * 20; b.vy -= (dy / d) * k * 20;
      });
      nodes.forEach((n) => {
        n.vx += (gW / 2 - n.x) * 0.006; n.vy += (gH / 2 - n.y) * 0.006;
        n.x += clamp(n.vx, -4, 4) * 0.5; n.y += clamp(n.vy, -4, 4) * 0.5;
        n.vx *= 0.82; n.vy *= 0.82;
        n.x = clamp(n.x, n.r + 14, gW - n.r - 14); n.y = clamp(n.y, n.r + 14, gH - n.r - 26);
      });
    }
    gLaid = true;
  }

  const visCount = () => nodes.filter((n) => n.born <= performance.now()).length;
  let lastCount = -1;
  const gstat = qs(root, '[data-gstat]');

  function gDraw(t: number) {
    if (!gctx || !gLaid) return;
    const now = performance.now();
    gctx.setTransform(gD, 0, 0, gD, 0, 0);
    gctx.clearRect(0, 0, gW, gH);
    const al = (n: GNode) => clamp((now - n.born) / 420, 0, 1);
    gctx.strokeStyle = cssVar(root, '--edge');
    gctx.lineWidth = 1.2;
    links.forEach(([i, j]) => {
      const a = nodes[i], b = nodes[j];
      const p = Math.min(al(a), al(b));
      if (p <= 0) return;
      gctx.globalAlpha = 0.65 * p;
      gctx.beginPath();
      gctx.moveTo(a.x, a.y);
      gctx.lineTo(a.x + (b.x - a.x) * p, a.y + (b.y - a.y) * p);
      gctx.stroke();
    });
    const ink = cssVar(root, '--ui-ink');
    gctx.textAlign = 'center';
    gctx.textBaseline = 'middle';
    nodes.forEach((n, i) => {
      const a = al(n);
      if (a <= 0) return;
      const e = 1 - Math.pow(1 - a, 3);
      const fx = n.x + (env.reduced ? 0 : Math.sin(t * 0.0009 + i) * 1.8);
      const fy = n.y + (env.reduced ? 0 : Math.cos(t * 0.0011 + i * 1.3) * 1.8);
      if (a < 1 && !env.reduced) {
        gctx.globalAlpha = (1 - a) * 0.5;
        gctx.strokeStyle = nodeColor[n.t];
        gctx.lineWidth = 2;
        gctx.beginPath();
        gctx.arc(fx, fy, n.r * (1 + 1.8 * a), 0, 6.283);
        gctx.stroke();
      }
      gctx.globalAlpha = e;
      gctx.fillStyle = nodeColor[n.t];
      gctx.beginPath();
      gctx.arc(fx, fy, n.r * e, 0, 6.283);
      gctx.fill();
      gctx.fillStyle = i === 0 ? cssVar(root, '--ui-accent-ink') : ink;
      const fs = i === 0 ? Math.max(11, n.r * 0.62) : Math.max(10.5, n.r * 0.95);
      gctx.font = `600 ${fs}px ${cssVar(root, '--font-body')}`;
      if (i === 0) gctx.fillText(n.id, fx, fy);
      else gctx.fillText(n.id, fx, fy + n.r + fs * 0.95);
    });
    gctx.globalAlpha = 1;
    const c = nodes.filter((n) => n.born <= now).length;
    if (c !== lastCount) {
      lastCount = c;
      gstat.textContent = c === 0 ? '等待抽取' : `显示 ${c} / ${nodes.length} 个实体，共 ${links.filter(([i, j]) => nodes[i].born <= now && nodes[j].born <= now).length} 条关系`;
    }
  }
  function gStep(t: number) {
    if (!gRun) return;
    gDraw(t);
    gRaf = requestAnimationFrame(gStep);
  }
  function gStart() {
    if (gRun) return;
    layout();
    if (env.reduced) { gDraw(0); return; }
    gRun = true;
    gRaf = requestAnimationFrame(gStep);
  }
  function gStop() { gRun = false; cancelAnimationFrame(gRaf); }
  const onResizeG = () => { if (gLaid) { layout(); gDraw(performance.now()); } };
  window.addEventListener('resize', onResizeG);

  /* ---------- beat timelines ---------- */
  const setNav = (name: string) => qsa(root, '[data-nav]').forEach((li) => li.classList.toggle('on', li.dataset.nav === name));

  async function tlDocs(sc: Scope) {
    const rowEls = qsa(root, '.gr-row');
    const stat = qs(root, '[data-docs-stat]');
    stat.textContent = '8 个文件，尚未建立索引';
    rowEls.forEach((r, i) => {
      reset(r);
      const dx = (i % 2 ? 1 : -1) * rand(40, 140);
      void anim(r, [{ opacity: 0, transform: `translate(${dx}px, ${rand(-60, 60)}px) rotate(${rand(-8, 8)}deg)` }, { opacity: 1, transform: 'none' }], { duration: 900, delay: 120 + i * 80 });
    });
    if (!(await sc.sleep(1500))) return;
    await Promise.all(
      rowEls.map((r) => anim(r.querySelector('.st'), [{ opacity: 1 }, { opacity: 0.45 }, { opacity: 1 }], { duration: 900, easing: 'ease-in-out' })),
    );
  }

  async function tlGraph(sc: Scope) {
    gStart();
    const order = bfsOrder();
    nodes.forEach((n) => (n.born = Infinity));
    // Core hub and first 4 entities appear immediately on frame 0
    order.slice(0, 5).forEach((ni) => (nodes[ni].born = -1e9));
    lastCount = -1;
    const stages = qsa(root, '.gr-stages li');
    stages.forEach((s) => s.classList.remove('on', 'done'));
    if (env.reduced) {
      nodes.forEach((n) => (n.born = -1e9));
      stages.forEach((s) => s.classList.add('done'));
      gDraw(0);
      return;
    }
    gDraw(performance.now());
    for (let i = 0; i < stages.length; i++) {
      stages[i].classList.add('on');
      if (i === 3) {
        const t0 = performance.now() + 60;
        order.slice(5).forEach((ni, k) => (nodes[ni].born = t0 + k * 95));
      }
      if (!(await sc.sleep(i === 3 ? (order.length - 5) * 95 + 420 : 420))) return;
      stages[i].classList.remove('on');
      stages[i].classList.add('done');
    }
  }

  function bfsOrder(): number[] {
    const seen = new Set<number>([0]);
    const q = [0];
    const out: number[] = [];
    while (q.length) {
      const v = q.shift()!;
      out.push(v);
      links.forEach(([a, b]) => {
        const o = a === v ? b : b === v ? a : -1;
        if (o >= 0 && !seen.has(o)) { seen.add(o); q.push(o); }
      });
    }
    return out;
  }

  async function typeInto(node: HTMLElement, text: string, sc: Scope, per = 38): Promise<boolean> {
    if (env.reduced) { node.textContent = text; return sc.alive; }
    node.textContent = '';
    for (let i = 1; i <= text.length; i++) {
      node.textContent = text.slice(0, i);
      if (!(await sc.sleep(per))) return false;
    }
    return true;
  }

  async function tlQA(sc: Scope) {
    const user = qs(root, '[data-user]');
    const ai = qs(root, '[data-ai]');
    const mode = qs(root, '[data-mode]');
    const sub = qs(root, '[data-sub]');
    const src = qs(root, '[data-src]');
    const subFold = qs<HTMLDetailsElement>(root, '[data-sub-fold]');
    const srcFold = qs<HTMLDetailsElement>(root, '[data-src-fold]');
    const segs = qsa(root, '.qa .gr-seg span');
    const setSeg = (m: string) => segs.forEach((s) => s.classList.toggle('on', s.dataset.m === m));
    user.textContent = ''; ai.innerHTML = ''; mode.textContent = ''; sub.innerHTML = ''; src.innerHTML = '';
    subFold.hidden = true; srcFold.hidden = true; subFold.open = true; srcFold.open = true;
    user.classList.remove('show'); ai.classList.remove('show'); setSeg('');
    const Q = '预算评审为什么延期了？';
    const A1 = '预算评审与数据合规评审相关联，并依赖海屿科技的供应链报价。';
    const A2 = '预算评审延期，是因为海屿科技的供应链报价迟到；数据合规评审依赖同一份报价。';
    const srcs = ['评审会纪要.docx，第 3 段', '预算表.xlsx，报价核对页'];
    const subs = ['预算评审 延期原因', '供应链报价 到达时间', '数据合规 依赖项'];

    const finalState = () => {
      user.textContent = Q; user.classList.add('show');
      ai.classList.add('show');
      ai.innerHTML = `${A2}<span class="cite">1</span><span class="cite">2</span>`;
      setSeg('auto');
      mode.innerHTML = '<b>Auto</b>当前知识库共 312 个图节点，超过 200 阈值，自动选择 RRF Agentic。';
      subFold.hidden = false;
      srcFold.hidden = false;
      sub.innerHTML = subs.map((s) => `<li>${s}</li>`).join('');
      src.innerHTML = srcs.map((s, i) => `<li><span class="cite">${i + 1}</span>${s}</li>`).join('');
    };
    if (env.reduced) return finalState();

    user.textContent = Q;
    user.classList.add('show');
    setSeg('kg');
    mode.innerHTML = '<b>KG-Only</b>命中实体后取两跳子图作答，不带文档来源。';
    ai.classList.add('show');
    ai.textContent = A1;
    if (!(await sc.sleep(320))) return;
    ai.insertAdjacentHTML('beforeend', '<span class="tag">无文档来源</span>');
    if (!(await sc.sleep(1100))) return;

    setSeg('rrf');
    mode.innerHTML = '<b>RRF Agentic</b>拆出最多 3 个子查询，向量、关键词、图谱三路召回，再 RRF 融合。';
    ai.textContent = '';
    subFold.hidden = false;
    for (const s of subs) {
      sub.insertAdjacentHTML('beforeend', `<li>${s}</li>`);
      void anim(sub.lastElementChild, [{ opacity: 0, transform: 'translateX(14px)' }, { opacity: 1, transform: 'none' }], { duration: 420 });
      if (!(await sc.sleep(240))) return;
    }
    if (!(await typeInto(ai, A2, sc, 28))) return;
    srcFold.hidden = false;
    for (let i = 0; i < srcs.length; i++) {
      ai.insertAdjacentHTML('beforeend', `<span class="cite">${i + 1}</span>`);
      src.insertAdjacentHTML('beforeend', `<li><span class="cite">${i + 1}</span>${srcs[i]}</li>`);
      void anim(src.lastElementChild, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 420 });
      if (!(await sc.sleep(300))) return;
    }
    if (!(await sc.sleep(1100))) return;

    setSeg('auto');
    mode.innerHTML = '<b>Auto</b>当前知识库共 312 个图节点，超过 200 阈值，自动选择 RRF Agentic。';
    await anim(mode, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 480 });
  }

  const views = ['docs', 'graph', 'qa'];

  const inst: WorldInst = {
    el: root,
    nextLabel: (b) => (b === 2 ? '下一个世界' : b === 0 ? '看它如何运作' : '看最终产出'),
    title: (b) => `GraphRAG-Agent，${['问题', '能力', '产出'][b]}：${COPY[b].h}`,
    focusEl: () => qs(root, '[data-n="h"]'),
    settled() { runAmbient(); },
    async show(b, dir, instant) {
      scope.cancel();
      scope = new Scope();
      const sc = scope;
      inst.demoBusy = false;
      inst.onDemoChange?.();
      const first = beat < 0;
      beat = b;
      setPhase(root, b);
      setNav(views[b]);
      aTarget = b === 0 ? 0 : 1;
      if (!actx || first) runAmbient();
      if (b !== 1) gStop();
      if (first && !env.reduced) {
        void anim(panel, [{ opacity: 0, transform: 'perspective(1600px) rotateY(-16deg) rotateX(5deg) translateX(60px)' }, { opacity: 1, transform: 'perspective(1600px) rotateY(0) rotateX(0) translateX(0)' }], { duration: 1300, delay: 250, fill: 'backwards' });
        void anim(stage, [{ opacity: 0 }, { opacity: 1 }], { duration: 600, delay: 150, fill: 'backwards' });
      }
      await Promise.all([swapNarr(narr, COPY[b], instant || first, dir), switchView(panel, views[b], instant || first)]);
      if (b === 0) void runDemo(inst, sc, () => tlDocs(sc));
      if (b === 1) void runDemo(inst, sc, () => tlGraph(sc));
      if (b === 2) void runDemo(inst, sc, () => tlQA(sc));
    },
    destroy() {
      scope.cancel();
      inst.demoBusy = false;
      gStop();
      aRun = false;
      cancelAnimationFrame(aRaf);
      window.removeEventListener('resize', onResizeAmb);
      window.removeEventListener('resize', onResizeG);
    },
  };
  void el;
  return inst;
}

export const graphWorld: WorldDef = { id: 'graph', beats: 3, create };
