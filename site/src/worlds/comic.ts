import { anim, cssVar, env, fitCanvas, qs, qsa, rand, reset, runDemo, Scope } from '../env';
import { icon } from '../icons';
import { narrHTML, swapNarr, type NarrCopy } from '../narr';
import { buildShell, phaseHTML, setPhase, type WorldDef, type WorldInst } from '../types';

const COPY: NarrCopy[] = [
  { proj: '条漫 Agent', h: '长篇小说，要变成一格一格的画面', p: '原著、版本、分镜散在不同工具里来回搬运。每一次改动，都得靠人记住改了哪里。', note: '本地持久化：基于 FastAPI 与 SQLite 管理原著原件、解析快照与卷章摘要，保持全书上下文连贯。' },
  { proj: '条漫 Agent', h: '改编、分镜、画面，在一处完成', p: '从原著整理到骨架、细纲、逐格脚本和生图包。模型给出的是候选，人工采用之后才成为正式内容。', note: '协同工作流：集成 Tiptap 细纲编辑器与 Pi SDK 编排能力，所有模型产出以候选态呈现并支持对比。' },
  { proj: '条漫 Agent', h: '候选、版本、审核，一格不漏', p: '图片工作区集中管理候选与历史，清晰标注来源与版本状态，每一格都经人工核对。', note: '画布与审核：图片工作区基于 Konva 构建，支持点选、框选、保护区涂抹及版本检查点回溯。' },
];

const STAGE_META = [
  {
    mode: 'prep',
    modeLabel: '全书前期准备',
    title: '理解与记忆',
    crumb: '<b>演示 · 旧院来信</b> › 全书前期准备 › 理解与记忆',
    tabs: ['小说原著', '理解与关系'],
    activeTab: 0,
    dash: 0,
    scope: '本机工作区 / 全书范围',
  },
  {
    mode: 'prep',
    modeLabel: '全书前期准备',
    title: '改编与画风',
    crumb: '<b>演示 · 旧院来信</b> › 全书前期准备 › 改编与细纲',
    tabs: ['改编骨架', '三版画风'],
    activeTab: 1,
    dash: 2,
    scope: '本机工作区 / 第 1 话脚本已备',
  },
  {
    mode: 'batch',
    modeLabel: '批次制作',
    title: '图片工作区',
    crumb: '<b>演示 · 旧院来信</b> › 第 1–10 话 › 图片工作区',
    tabs: ['当前 10 话', '交付核对'],
    activeTab: 1,
    dash: 2,
    scope: '本机工作区 / 第 1 话 · 第 1 格',
  },
];

const FINAL = 'polygon(1% 0%, 100% 0%, 99% 100%, 0% 100%)';
const FROM = 'polygon(0% 0%, 0% 0%, -2% 100%, -2% 100%)';
const TO = 'polygon(100% 0%, 100% 0%, 98% 100%, 98% 100%)';

let artUid = 0;

function art(kind: 'rooftop' | 'hall' | 'street', label: string): string {
  const uid = `${kind}-${++artUid}`;
  if (kind === 'rooftop') {
    const defs = `<defs><linearGradient id="sky-${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--art-sky-top)"/><stop offset="0.55" style="stop-color:var(--art-sky-mid)"/><stop offset="1" style="stop-color:var(--art-sky-low)"/></linearGradient></defs>`;
    return `<svg class="art" viewBox="0 0 400 320" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${label}">${defs}
      <rect width="400" height="320" fill="url(#sky-${uid})"/>
      <circle cx="292" cy="92" r="46" class="a-moon"/>
      <path class="a-far" d="M0 210 L0 170 L34 170 L34 140 L70 140 L70 176 L110 176 L110 122 L150 122 L150 168 L196 168 L196 150 L240 150 L240 186 L290 186 L290 134 L330 134 L330 172 L400 172 L400 320 L0 320 Z"/>
      <path class="a-near" d="M0 320 L0 236 L58 236 L58 214 L132 214 L132 240 L214 240 L214 224 L400 224 L400 320 Z"/>
      <g class="a-win">${Array.from({ length: 14 }, (_, i) => `<rect x="${64 + (i % 7) * 11}" y="${222 + Math.floor(i / 7) * 10}" width="5" height="6"/>`).join('')}</g>
      <g transform="translate(250 190)">
        <circle class="a-skin" cx="0" cy="-34" r="9"/><path class="a-fig-a" d="M-14 36 L-10 -22 Q0 -30 10 -22 L14 36 Z"/>
        <circle class="a-skin" cx="38" cy="-26" r="8"/><path class="a-fig-b" d="M24 36 L28 -15 Q38 -22 48 -15 L52 36 Z"/>
      </g>
      <g class="a-speed"><path d="M20 60 L180 20M10 110 L150 66M40 20 L210 4"/></g>
    </svg>`;
  }
  if (kind === 'hall') {
    const defs = `<defs><linearGradient id="hall-${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--art-hall-a)"/><stop offset="1" style="stop-color:var(--art-hall-b)"/></linearGradient></defs>`;
    return `<svg class="art" viewBox="0 0 400 320" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${label}">${defs}
      <rect width="400" height="320" fill="url(#hall-${uid})"/>
      <path class="a-floor" d="M0 320 L400 320 L252 190 L148 190 Z"/>
      <path class="a-wall-l" d="M0 0 L148 120 L148 190 L0 320 Z"/>
      <path class="a-wall-r" d="M400 0 L252 120 L252 190 L400 320 Z"/>
      <rect class="a-door" x="148" y="120" width="104" height="70"/>
      ${[0, 1, 2, 3].map((i) => `<ellipse class="a-lamp" cx="200" cy="${30 + i * 22}" rx="${60 - i * 12}" ry="${6 - i}"/>`).join('')}
      <g transform="translate(200 186)"><circle class="a-fig-a" cx="0" cy="-20" r="5"/><path class="a-fig-a" d="M-6 10 L-4 -14 Q0 -17 4 -14 L6 10 Z"/></g>
    </svg>`;
  }
  return `<svg class="art" viewBox="0 0 400 320" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${label}">
      <rect width="400" height="320" class="a-night"/>
      <path class="a-near" d="M0 320 L0 120 L90 120 L90 70 L170 70 L170 150 L250 150 L250 100 L340 100 L340 130 L400 130 L400 320 Z"/>
      <rect class="a-sign" x="100" y="86" width="56" height="22" rx="2"/>
      <g class="a-win">${Array.from({ length: 18 }, (_, i) => `<rect x="${24 + (i % 6) * 50}" y="${160 + Math.floor(i / 6) * 40}" width="14" height="20"/>`).join('')}</g>
      <rect class="a-puddle" x="0" y="262" width="400" height="58"/>
      <g class="a-speed"><path d="M30 10 L60 120M90 0 L122 130M160 8 L186 110M230 0 L262 120M300 12 L330 130"/></g>
    </svg>`;
}

function panels(): string {
  const b0 = `
    <div class="pn b0a"><div class="pn-in novel">
      <div class="pn-head"><h4>小说原著</h4><span class="cm-pill" data-parse-stat>解析 v1 · 待抽取</span></div>
      <div class="cm-doc-bar"><span>示例原著.txt · 97 字 · 2 章</span><span>在全书中查找…</span></div>
      <div class="cm-chap-list" aria-hidden="true"><span class="on">第一章 旧院来信</span><span>第二章 未说完的话</span></div>
      <div class="cm-reader">
        <p><mark class="cm-ent" data-ent="0">阿青</mark>推开<mark class="cm-ent" data-ent="1">旧院</mark>的木门。老树下，<mark class="cm-ent" data-ent="2">一封信</mark>静静地躺在石桌上。</p>
        <p>“<mark class="cm-ent" data-ent="3">林先生</mark>回来了吗？”她望向空荡荡的窗。</p>
      </div>
      <div class="cm-ent-bar" aria-hidden="true">
        <span class="cm-ent-chip" data-echip="0">人物 · 阿青</span>
        <span class="cm-ent-chip" data-echip="1">场景 · 旧院</span>
        <span class="cm-ent-chip" data-echip="2">道具 · 石桌来信</span>
        <span class="cm-ent-chip" data-echip="3">线索 · 林先生</span>
      </div>
    </div></div>
    <div class="pn b0b"><div class="pn-in">
      <div class="pn-head"><h4>原著版本</h4><span class="cm-pill sim">只读原件</span></div>
      <ul class="vers">
        <li><span>原件 TXT</span><b data-vstat>待锁定</b></li>
        <li><span>章节解析 v1</span><b class="ok">已完成</b></li>
        <li><span>第 1 至 10 话摘要</span><b class="warn">待成图</b></li>
      </ul>
    </div></div>
    <div class="pn b0c"><div class="pn-in">
      <div class="pn-head"><h4>要拆成逐格画面</h4><span class="cm-pill">第 1 话 · 6 格空槽</span></div>
      <div class="frames" aria-hidden="true">
        ${['01 格', '02 格', '03 格', '04 格', '05 格', '06 格'].map((n, i) => `<div class="slot" data-slot="${i}"><b>${n}</b><small>景别机位待拆</small></div>`).join('')}
      </div>
    </div></div>`;

  const b1 = `
    <div class="pn b1a"><div class="pn-in">
      <div class="pn-head"><h4>理解与关系 · 知识图谱</h4><span class="cm-pill ok">剧情关系</span></div>
      <div class="cm-kg-wrap">
        <svg class="kg" viewBox="0 0 240 168" preserveAspectRatio="xMidYMid meet" role="img" aria-label="原著人物与场景关系图谱">
          <g class="kg-l">
            <path d="M120 78 L52 38"/><path d="M120 78 L188 38"/><path d="M120 78 L54 126"/><path d="M120 78 L188 124"/><path d="M52 38 L54 126"/>
          </g>
          <circle class="kg-n c1" cx="120" cy="78" r="19"/><circle class="kg-n c2" cx="52" cy="38" r="12"/><circle class="kg-n c3" cx="188" cy="38" r="12"/><circle class="kg-n c2" cx="54" cy="126" r="11"/><circle class="kg-n c3" cx="188" cy="124" r="11"/>
          <text class="on-dark" x="120" y="82" text-anchor="middle">阿青</text>
          <text x="52" y="62" text-anchor="middle">旧院</text>
          <text x="188" y="62" text-anchor="middle">一封信</text>
          <text x="54" y="151" text-anchor="middle">老树</text>
          <text x="188" y="149" text-anchor="middle">林先生</text>
        </svg>
      </div>
      <div class="chips-row"><span>人物</span><span>场景</span><span>伏笔</span><span class="ok">图谱已保存 v1</span></div>
    </div></div>
    <div class="pn b1b"><div class="pn-in">
      <div class="pn-head"><h4>改编细纲与画风</h4><span class="cm-pill sim">骨架 v7 · 模拟</span></div>
      <div class="cm-styles" aria-hidden="true">
        <div class="cm-style-card" data-style="0">
          <div class="cm-swatch"><i style="background:var(--art-sky-top)"></i><i style="background:var(--art-teal)"></i><i style="background:var(--ui-olive)"></i></div>
          <b>方案A · 墨青</b><small data-style-lbl>待比较</small>
        </div>
        <div class="cm-style-card" data-style="1">
          <div class="cm-swatch"><i style="background:var(--art-hall-a)"></i><i style="background:var(--art-hall-b)"></i><i style="background:var(--art-skin)"></i></div>
          <b>方案B · 暖褐</b><small>备选</small>
        </div>
        <div class="cm-style-card" data-style="2">
          <div class="cm-swatch"><i style="background:var(--art-sky-mid)"></i><i style="background:var(--art-sky-low)"></i><i style="background:var(--art-moon)"></i></div>
          <b>方案C · 暮色</b><small>备选</small>
        </div>
      </div>
    </div></div>
    <div class="pn b1c"><div class="pn-in">
      <div class="pn-head"><h4>脚本审核 · 逐格候选</h4><span class="cm-pill">第 1 话 · 3 格</span></div>
      <ul class="script">
        <li data-srow="0"><b>1话/01格</b><span>中景 平视 · 阿青停在旧院木门前</span><em data-cand>候选</em></li>
        <li data-srow="1"><b>1话/02格</b><span>特写 俯拍 · 石桌泛黄信封字迹</span><em data-cand>候选</em></li>
        <li data-srow="2"><b>1话/03格</b><span>远景 仰视 · 风动枝叶空窗棂</span><em>待审核</em></li>
      </ul>
    </div></div>`;

  const b2 = `
    <div class="pn b2a"><div class="pn-in canvas">
      <div class="cm-ws-head">
        <b>1话 · 1格</b>
        <span class="cm-ws-pill">v2 · 采用</span>
        <span class="cm-ws-pill" data-cmp-btn>新旧对比</span>
        <span class="cm-ws-pill warn">示意 · 非模型实图</span>
      </div>
      <div class="tools" aria-hidden="true">
        <span class="on" data-tool="pick">${icon('pointer', 12)}点选</span>
        <span data-tool="box">${icon('frame', 12)}框选</span>
        <span>${icon('brush', 12)}画笔</span>
        <span data-tool="shield">${icon('shield', 12)}保护区</span>
        <span class="zoom">64%</span>
      </div>
      <div class="cm-ws-body">
        <div class="cm-thumbs" aria-hidden="true">
          <div class="cm-thumb on" data-thumb="0">${art('rooftop', '第 1 格缩略图')}<span>1格 · v2</span></div>
          <div class="cm-thumb" data-thumb="1">${art('hall', '第 2 格缩略图')}<span>2格 · v1</span></div>
          <div class="cm-thumb" data-thumb="2">${art('street', '第 3 格缩略图')}<span>3格 · v1</span></div>
        </div>
        <div class="art-wrap">
          ${art('rooftop', '分镜画面：黄昏屋顶上的两个人影')}
          <span class="art-tag" aria-hidden="true">模拟 · 示意画面</span>
          <div class="cm-anno-box" data-anno-box aria-hidden="true"></div>
          <div class="cm-anno-shield" data-anno-shield aria-hidden="true"></div>
          <div class="cm-cmp-line" data-cmp-line aria-hidden="true"></div>
        </div>
      </div>
      <div class="art-cap"><span>原图 640×900 · 标注单存</span><span data-anno-stat>批注与保护区 0 处</span></div>
    </div></div>
    <div class="pn b2b"><div class="pn-in">
      <div class="pn-head"><h4>当前底图区域批注</h4><span class="cm-pill ok" data-audit-pill>v2 已采用</span></div>
      <div class="cm-notes">
        <div class="cm-note-row" data-note="1"><span class="cm-note-badge coral">1</span><span>修改区域 · 保留轮廓，细化袖口褶皱</span></div>
        <div class="cm-note-row" data-note="2"><span class="cm-note-badge shield">2</span><span>保护区 · 锁定人物神态与视线</span></div>
      </div>
      <div class="cm-audit-bar"><span>交付完整性核对</span><span>第 1 批 · 3 格已对齐</span></div>
    </div></div>
    <div class="pn b2c"><div class="pn-in strip">
      <div class="pn-head"><h4>本话条漫成片序列</h4><div class="cm-head-pills"><span class="cm-pill sim">模拟 · 示意</span><span class="cm-pill">第 1 话 1–3 格</span></div></div>
      <div class="strip-row">
        <div class="strip-cell" data-scell="0">${art('rooftop', '第 1 话 第 1 格')}<span class="strip-badge">01 已采用</span></div>
        <div class="strip-cell" data-scell="1">${art('hall', '第 1 话 第 2 格')}<span class="strip-badge">02 保护区</span></div>
        <div class="strip-cell" data-scell="2">${art('street', '第 1 话 第 3 格')}<span class="strip-badge">03 待终审</span></div>
      </div>
    </div></div>`;

  return [b0, b1, b2].map((s) => s.replace(/\s*\n\s*/g, '')).join('');
}

function create(): WorldInst {
  const nav = `<span class="cm-brand" data-bridge="brand"><i class="cm-logo">${icon('layers', 20)}</i><b>条漫 Agent</b><small>本机工作台</small></span>${phaseHTML()}`;
  const main = `<div class="cm-grid">
    ${narrHTML()}
    <div class="cm-stage">
      <div class="cm-workbench" data-panel>
        <aside class="cm-side" aria-hidden="true">
          <div class="cm-rail-top"><span class="cm-rail-badge">${icon('layers', 15)}</span><span class="cm-back">← 项目库</span></div>
          <div class="cm-proj"><small>正在创作</small><b>演示 · 旧院来信</b></div>
          <div class="cm-modes">
            <div class="cm-mode-btn on" data-mode="prep">${icon('book', 14)}<span>全书前期准备</span></div>
            <div class="cm-mode-btn" data-mode="batch">${icon('clapper', 14)}<span>批次制作</span></div>
          </div>
          <span class="cm-rail-label" data-rail-label>前期流程</span>
          <ul class="cm-steps" data-group="prep">
            <li data-s="prep-mem"><span class="num">1</span>${icon('book', 14)}<span>理解与记忆</span></li>
            <li data-s="prep-outline"><span class="num">2</span>${icon('edit', 14)}<span>改编与细纲</span></li>
            <li data-s="prep-style"><span class="num">3</span>${icon('palette', 14)}<span>画风与资产</span></li>
          </ul>
          <ul class="cm-steps" data-group="batch" hidden>
            <li data-s="batch-script"><span class="num">1</span>${icon('clapper', 14)}<span>脚本审核</span></li>
            <li data-s="batch-pack"><span class="num">2</span>${icon('package', 14)}<span>逐格生图包</span></li>
            <li data-s="batch-img"><span class="num">3</span>${icon('image', 14)}<span>图片工作区</span></li>
          </ul>
          <div class="cm-rail-foot">
            <div class="cm-conn"><i></i><span>本地已连接</span></div>
            <div class="cm-rail-icons">${icon('activity', 13)}${icon('sliders', 13)}</div>
          </div>
        </aside>
        <div class="cm-app">
          <header class="cm-topbar">
            <span class="cm-crumb" data-crumb></span>
            <div class="cm-top-pills" aria-hidden="true">
              <span class="cm-pill" data-ai-pill>${icon('chat', 12)}AI 助手</span>
              <span class="cm-pill ok">${icon('check', 12)}条件 · 6</span>
              <span class="cm-pill">上下文</span>
            </div>
          </header>
          <div class="cm-stage-head">
            <div class="cm-stage-title">
              <h3 data-stage-title>理解与记忆</h3>
              <small data-mode-tag>全书前期准备</small>
              <span class="cm-dashes" aria-hidden="true"><i></i><i></i><i></i></span>
            </div>
            <div class="cm-subtabs" data-subtabs aria-hidden="true"></div>
          </div>
          <div class="cm-page" data-page>${panels()}</div>
          <div class="cm-foot">
            <span data-scope-text>本机工作区 / 全书范围</span>
            <span>图谱与编辑真实保存 · 示意画面明确标记</span>
          </div>
        </div>
      </div>
    </div>
  </div>`;

  const root = buildShell('comic', '条漫 Agent 展示', nav, main);
  const amb = document.createElement('canvas');
  amb.className = 'ambient';
  amb.setAttribute('aria-hidden', 'true');
  root.prepend(amb);

  const stage = qs(root, '.cm-stage');
  const panel = qs(root, '[data-panel]');
  const page = qs(root, '[data-page]');
  const narr = qs(root, '[data-narr]');
  const sets = [0, 1, 2].map((b) => qsa(page, `.pn[class*="b${b}"]`));
  let scope = new Scope();
  let beat = -1;
  let showToken = 0;

  /* ---------- ambient: floating storyboard panel frames & registration marks ---------- */
  const actx = amb.getContext('2d');
  interface FrameCard { sx: number; sy: number; gx: number; gy: number; x: number; y: number; vx: number; vy: number; w: number; h: number; rot: number; vr: number; ph: number; acc: boolean }
  let cards: FrameCard[] = [];
  let aW = 0, aH = 0, aD = 1, aRaf = 0, aRun = false, aMorph = 0, aTarget = 0;
  const ptr = { x: -999, y: -999 };

  function initAmbient() {
    if (!actx) return;
    const f = fitCanvas(amb);
    aW = f.w; aH = f.h; aD = f.dpr;
    const n = env.low ? 14 : 24;
    const cols = 6;
    const rows = Math.ceil(n / cols);
    cards = Array.from({ length: n }, (_, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const w = 34 + (i % 3) * 14;
      const h = Math.round(w * 1.38);
      return {
        sx: rand(40, Math.max(80, aW - 40)),
        sy: rand(40, Math.max(80, aH - 40)),
        gx: aW * (0.12 + (col + 0.5) * (0.78 / cols)),
        gy: aH * (0.14 + (row + 0.5) * (0.74 / rows)),
        x: rand(0, aW),
        y: rand(0, aH),
        vx: 0,
        vy: 0,
        w,
        h,
        rot: rand(-0.35, 0.35),
        vr: rand(-0.0025, 0.0025),
        ph: rand(0, 6.28),
        acc: i % 4 === 0,
      };
    });
  }

  function aStep(t: number) {
    if (!actx || !aRun) return;
    aMorph += (aTarget - aMorph) * 0.04;
    actx.setTransform(aD, 0, 0, aD, 0, 0);
    actx.clearRect(0, 0, aW, aH);
    const rule = cssVar(root, '--color-rule');
    const acc = cssVar(root, '--color-accent');
    const interact = !env.low && !env.reduced;
    for (const c of cards) {
      const tx = c.sx + (c.gx - c.sx) * aMorph + (env.reduced ? 0 : Math.sin(t * 0.00045 + c.ph) * (20 - 12 * aMorph));
      const ty = c.sy + (c.gy - c.sy) * aMorph + (env.reduced ? 0 : Math.cos(t * 0.0004 + c.ph) * (16 - 10 * aMorph));
      let ax = (tx - c.x) * 0.015;
      let ay = (ty - c.y) * 0.015;
      if (interact) {
        const dx = c.x - ptr.x, dy = c.y - ptr.y, d2 = dx * dx + dy * dy;
        if (d2 < 16000) {
          const d = Math.sqrt(d2) || 1;
          const f = (1 - d2 / 16000) * 1.1;
          ax += (dx / d) * f;
          ay += (dy / d) * f;
        }
      }
      c.vx = (c.vx + ax) * 0.88;
      c.vy = (c.vy + ay) * 0.88;
      c.x += c.vx;
      c.y += c.vy;
      c.rot += c.vr * (1 - aMorph * 0.85);
      actx.save();
      actx.translate(c.x, c.y);
      actx.rotate(c.rot * (1 - aMorph * 0.75));
      actx.strokeStyle = c.acc && aMorph > 0.3 ? acc : rule;
      actx.globalAlpha = c.acc ? 0.28 : 0.2;
      actx.lineWidth = c.acc ? 1.4 : 1;
      actx.strokeRect(-c.w / 2, -c.h / 2, c.w, c.h);
      if (c.acc) {
        actx.fillStyle = acc;
        actx.globalAlpha = 0.08 + aMorph * 0.06;
        actx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
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
      cards.forEach((c) => { c.x = c.sx + (c.gx - c.sx) * aMorph; c.y = c.sy + (c.gy - c.sy) * aMorph; });
      aRun = true; aStep(0); aRun = false;
      return;
    }
    aRun = true;
    aRaf = requestAnimationFrame(aStep);
  }

  const onPtr = (e: PointerEvent) => {
    const r = amb.getBoundingClientRect();
    ptr.x = e.clientX - r.left;
    ptr.y = e.clientY - r.top;
    if (!env.reduced && !env.low) {
      const rx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ry = (e.clientY / window.innerHeight - 0.5) * 2;
      panel.style.transform = `perspective(1600px) rotateY(${(-rx * 1.8).toFixed(2)}deg) rotateX(${(ry * 1.3).toFixed(2)}deg)`;
    }
  };
  root.addEventListener('pointermove', onPtr);
  const onResizeAmb = () => {
    if (actx && (aRun || env.reduced)) {
      const was = aRun;
      aRun = false;
      cancelAnimationFrame(aRaf);
      initAmbient();
      aRun = was;
      if (was) aRaf = requestAnimationFrame(aStep);
    }
  };
  window.addEventListener('resize', onResizeAmb);

  /* ---------- sync authentic chrome per beat ---------- */
  function syncChrome(b: number) {
    const m = STAGE_META[b];
    qs(root, '[data-crumb]').innerHTML = m.crumb;
    qs(root, '[data-stage-title]').textContent = m.title;
    qs(root, '[data-mode-tag]').textContent = m.modeLabel;
    qs(root, '[data-scope-text]').textContent = m.scope;
    qs(root, '[data-ai-pill]').hidden = b === 2;

    qsa(root, '.cm-mode-btn').forEach((btn) => btn.classList.toggle('on', btn.dataset.mode === m.mode));
    qs(root, '[data-rail-label]').textContent = m.mode === 'prep' ? '前期流程' : '制作流程';
    qs(root, '[data-group="prep"]').hidden = m.mode !== 'prep';
    qs(root, '[data-group="batch"]').hidden = m.mode !== 'batch';

    const activeStep = b === 0 ? 'prep-mem' : b === 1 ? 'prep-outline' : 'batch-img';
    qsa(root, '[data-s]').forEach((li) => {
      const s = li.dataset.s;
      li.classList.toggle('on', s === activeStep);
      li.classList.toggle('done', (b === 1 && s === 'prep-mem') || (b === 2 && (s === 'batch-script' || s === 'batch-pack')));
    });

    qsa(root, '.cm-dashes i').forEach((d, i) => d.classList.toggle('on', i <= m.dash));
    qs(root, '[data-subtabs]').innerHTML = m.tabs
      .map((t, i) => `<span class="${i === m.activeTab ? 'on' : ''}">${t}</span>`)
      .join('');
  }

  /* ---------- manga speed-lines & panel transitions ---------- */
  const streak = () => {
    if (env.reduced || env.low) return;
    page.querySelectorAll('.spd-wrap').forEach((w) => w.remove());
    const wrap = document.createElement('div');
    wrap.setAttribute('aria-hidden', 'true');
    wrap.className = 'spd-wrap';
    const anims: Promise<void>[] = [];
    for (let i = 0; i < 6; i++) {
      const s = document.createElement('i');
      s.className = 'spd';
      s.style.top = `${10 + i * 14}%`;
      s.style.height = `${2 + (i % 2)}px`;
      s.style.opacity = '0';
      s.style.transform = 'translateX(-160%) skewX(-30deg)';
      wrap.appendChild(s);
      anims.push(
        anim(
          s,
          [
            { transform: 'translateX(-160%) skewX(-30deg)', opacity: 0.72 },
            { transform: 'translateX(190%) skewX(-30deg)', opacity: 0 },
          ],
          { duration: 600, delay: i * 40, easing: 'cubic-bezier(0.77, 0, 0.18, 1)', fill: 'both' },
        ),
      );
    }
    page.appendChild(wrap);
    void Promise.all(anims).then(() => wrap.remove());
  };

  const showSet = async (b: number, instant: boolean, tok: number) => {
    const enter = sets[b];
    const leave = sets.flatMap((s, i) => (i === b ? [] : s.filter((p) => !p.hidden)));
    if (instant) {
      sets.forEach((s, i) =>
        s.forEach((p) => {
          reset(p, p.querySelector('.pn-in'));
          p.hidden = i !== b;
        }),
      );
      return;
    }
    if (leave.length) {
      await Promise.all(
        leave.map((p, i) => {
          const inner = p.querySelector('.pn-in');
          reset(p, inner);
          return anim(p, [{ clipPath: FINAL }, { clipPath: TO }], { duration: 360, delay: i * 45, easing: 'cubic-bezier(0.7, 0, 0.84, 0)' }).then(() => {
            if (tok !== showToken) return;
            p.hidden = true;
            reset(p, inner);
          });
        }),
      );
    }
    if (tok !== showToken) return;
    streak();
    await Promise.all(
      enter.flatMap((p, i) => {
        const inner = p.querySelector('.pn-in');
        reset(p, inner);
        p.hidden = false;
        return [
          anim(inner, [{ opacity: 0.7, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { duration: 560, delay: 140 + i * 85, fill: 'backwards' }),
          anim(p, [{ clipPath: FROM }, { clipPath: FINAL }], { duration: 700, delay: 60 + i * 95, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'backwards' }),
        ];
      }),
    );
  };

  /* ---------- beat 0: entity highlight + version lock + 6-slot scan ---------- */
  async function tlBeat0(sc: Scope) {
    const ents = qsa(root, '[data-ent]');
    const chips = qsa(root, '[data-echip]');
    const slots = qsa(root, '[data-slot]');
    const pstat = qs(root, '[data-parse-stat]');
    const vstat = qs(root, '[data-vstat]');

    ents.forEach((e) => e.classList.remove('lit'));
    chips.forEach((c) => c.classList.remove('on'));
    slots.forEach((s) => s.classList.remove('scan'));
    pstat.textContent = '解析 v1 · 待抽取';
    vstat.textContent = '待锁定';
    vstat.classList.remove('ok');

    const doneState = () => {
      ents.forEach((e) => e.classList.add('lit'));
      chips.forEach((c) => c.classList.add('on'));
      pstat.textContent = '已抽取 4 实体';
      vstat.textContent = '只读锁定';
      vstat.classList.add('ok');
    };
    if (env.reduced) return doneState();

    if (!(await sc.sleep(240))) return;
    for (let i = 0; i < ents.length; i++) {
      ents[i].classList.add('lit');
      chips[i]?.classList.add('on');
      if (!(await sc.sleep(220))) return;
    }
    pstat.textContent = '已抽取 4 实体';
    vstat.textContent = '只读锁定';
    vstat.classList.add('ok');
    void anim(vstat, [{ transform: 'scale(1.16)' }, { transform: 'scale(1)' }], { duration: 360 });
    if (!(await sc.sleep(260))) return;

    for (let i = 0; i < slots.length; i++) {
      slots[i].classList.add('scan');
      if (i > 0) slots[i - 1].classList.remove('scan');
      if (!(await sc.sleep(150))) return;
    }
    slots[slots.length - 1]?.classList.remove('scan');
  }

  /* ---------- beat 1: graph trace + style confirm + candidate adoption ---------- */
  async function tlBeat1(sc: Scope) {
    const edges = Array.from(root.querySelectorAll<SVGPathElement>('.kg-l path'));
    const nodes = Array.from(root.querySelectorAll<SVGCircleElement>('.kg-n'));
    const style0 = qs(root, '[data-style="0"]');
    const styleLbl = qs(root, '[data-style-lbl]');
    const cands = qsa(root, '[data-cand]');
    const srows = qsa(root, '[data-srow]');

    edges.forEach((p) => { reset(p); p.style.strokeDashoffset = '0'; });
    nodes.forEach((n) => reset(n));
    style0.classList.remove('on');
    styleLbl.textContent = '待比较';
    cands.forEach((c) => { c.textContent = '候选'; c.classList.remove('ok'); });
    srows.forEach((r) => r.classList.remove('adopted'));

    const doneState = () => {
      style0.classList.add('on');
      styleLbl.textContent = '已确认 ✓';
      cands.forEach((c, idx) => {
        c.textContent = '已采用 ✓';
        c.classList.add('ok');
        srows[idx]?.classList.add('adopted');
      });
    };
    if (env.reduced) return doneState();

    // Animate graph edges & nodes drawing in
    edges.forEach((p, i) => {
      void anim(p, [{ strokeDashoffset: 140 }, { strokeDashoffset: 0 }], { duration: 560, delay: i * 65, fill: 'both' });
    });
    nodes.forEach((n, i) => {
      void anim(n, [{ transform: 'scale(0.4)', opacity: 0 }, { transform: 'scale(1)', opacity: 1 }], { duration: 480, delay: 80 + i * 70, fill: 'both' });
    });
    if (!(await sc.sleep(620))) return;

    // Confirm style A
    style0.classList.add('on');
    styleLbl.textContent = '已确认 ✓';
    void anim(style0, [{ transform: 'scale(0.96)' }, { transform: 'scale(1)' }], { duration: 380 });
    if (!(await sc.sleep(480))) return;

    // Adopt candidate panels 1 & 2 sequentially
    for (let i = 0; i < cands.length; i++) {
      cands[i].textContent = '已采用 ✓';
      cands[i].classList.add('ok');
      srows[i]?.classList.add('adopted');
      void anim(cands[i], [{ transform: 'scale(1.26)' }, { transform: 'scale(1)' }], { duration: 420 });
      if (!(await sc.sleep(520))) return;
    }
  }

  /* ---------- beat 2: Konva marquee + protection shield + v1/v2 compare ---------- */
  async function tlBeat2(sc: Scope) {
    const tools = qsa(root, '.tools [data-tool]');
    const setTool = (t: string) => tools.forEach((el) => el.classList.toggle('on', el.dataset.tool === t));
    const box = qs(root, '[data-anno-box]');
    const shield = qs(root, '[data-anno-shield]');
    const cmpLine = qs(root, '[data-cmp-line]');
    const cmpBtn = qs(root, '[data-cmp-btn]');
    const stat = qs(root, '[data-anno-stat]');
    const note1 = qs(root, '[data-note="1"]');
    const note2 = qs(root, '[data-note="2"]');
    const scells = qsa(root, '[data-scell]');

    reset(box, shield, cmpLine);
    box.style.opacity = '0';
    shield.style.opacity = '0';
    cmpLine.style.opacity = '0';
    cmpBtn.classList.remove('on');
    note1.classList.remove('on');
    note2.classList.remove('on');
    scells.forEach((c) => c.classList.remove('on'));
    stat.textContent = '批注与保护区 0 处';
    setTool('pick');

    const doneState = () => {
      box.style.opacity = '1';
      shield.style.opacity = '1';
      note1.classList.add('on');
      note2.classList.add('on');
      scells[0]?.classList.add('on');
      scells[1]?.classList.add('on');
      stat.textContent = '批注与保护区 2 处 · 已保存';
      setTool('pick');
    };
    if (env.reduced) return doneState();

    if (!(await sc.sleep(220))) return;
    // Step 1: Box selection annotation #1
    setTool('box');
    note1.classList.add('on');
    stat.textContent = '框选批注 1 处…';
    await anim(box, [{ opacity: 0, transform: 'scale(0.25)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 480 });
    if (!sc.alive) return;
    if (!(await sc.sleep(360))) return;

    // Step 2: Protection shield #2
    setTool('shield');
    note2.classList.add('on');
    stat.textContent = '批注与保护区 2 处 · 已保存';
    await anim(shield, [{ opacity: 0, transform: 'scale(0.8)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 440 });
    if (!sc.alive) return;
    if (!(await sc.sleep(360))) return;

    // Step 3: Version comparison split wipe & strip sync
    setTool('pick');
    cmpBtn.classList.add('on');
    await anim(
      cmpLine,
      [
        { transform: 'translateX(4%)', opacity: 0 },
        { transform: 'translateX(14%)', opacity: 1, offset: 0.12 },
        { transform: 'translateX(92%)', opacity: 1, offset: 0.88 },
        { transform: 'translateX(98%)', opacity: 0 },
      ],
      { duration: 760, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    );
    if (!sc.alive) return;
    cmpBtn.classList.remove('on');
    scells.forEach((c, i) => {
      if (i < 2) {
        c.classList.add('on');
        void anim(c, [{ transform: 'translateY(6px)' }, { transform: 'none' }], { duration: 360, delay: i * 90 });
      }
    });
  }

  const inst: WorldInst = {
    el: root,
    nextLabel: (b) => (b === 2 ? '看全部作品' : b === 0 ? '看它如何运作' : '看最终产出'),
    title: (b) => `条漫 Agent，${['问题', '能力', '产出'][b]}：${COPY[b].h}`,
    focusEl: () => qs(root, '[data-n="h"]'),
    settled() { runAmbient(); },
    async show(b, dir, instant) {
      const tok = ++showToken;
      scope.cancel();
      scope = new Scope();
      const sc = scope;
      inst.demoBusy = false;
      inst.onDemoChange?.();
      const first = beat < 0;
      beat = b;
      setPhase(root, b);
      syncChrome(b);
      aTarget = b === 0 ? 0.15 : b === 1 ? 0.65 : 1;
      if (!actx || first) runAmbient();

      if (first && !env.reduced) {
        void anim(
          panel,
          [
            { opacity: 0, transform: 'perspective(1600px) rotateY(-12deg) rotateX(4deg) translateX(52px)' },
            { opacity: 1, transform: 'perspective(1600px) rotateY(0) rotateX(0) translateX(0)' },
          ],
          { duration: 1100, delay: 220, fill: 'backwards' },
        );
        void anim(stage, [{ opacity: 0 }, { opacity: 1 }], { duration: 560, delay: 140, fill: 'backwards' });
      }

      await Promise.all([swapNarr(narr, COPY[b], instant || first, dir), showSet(b, instant || first, tok)]);
      if (tok !== showToken || !sc.alive) return;
      if (b === 0) void runDemo(inst, sc, () => tlBeat0(sc));
      if (b === 1) void runDemo(inst, sc, () => tlBeat1(sc));
      if (b === 2) void runDemo(inst, sc, () => tlBeat2(sc));
    },
    destroy() {
      scope.cancel();
      inst.demoBusy = false;
      aRun = false;
      cancelAnimationFrame(aRaf);
      window.removeEventListener('resize', onResizeAmb);
    },
  };
  return inst;
}

export const comicWorld: WorldDef = { id: 'comic', beats: 3, create };
