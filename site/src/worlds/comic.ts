import { anim, qs, qsa, reset, runDemo, Scope, env } from '../env';
import { icon } from '../icons';
import { narrHTML, swapNarr, type NarrCopy } from '../narr';
import { buildShell, phaseHTML, setPhase, type WorldDef, type WorldInst } from '../types';

const NOTE = '示意演示：界面与内容为预置，原著为虚构示例，不调用 AI。';
const COPY: NarrCopy[] = [
  { proj: '条漫 Agent', h: '长篇小说，要变成一格一格的画面', p: '原著、版本、分镜散在不同工具里来回搬运。每一次改动，都得靠人记住改了哪里。', note: NOTE },
  { proj: '条漫 Agent', h: '改编、分镜、画面，在一处完成', p: '从原著整理到骨架、细纲、逐格脚本和生图包。模型给出的是候选，人工采用之后才成为正式内容。', note: NOTE },
  { proj: '条漫 Agent', h: '候选、版本、审核，一格不漏', p: '图片工作区管理候选与历史，模拟与真实来源分开标注，每一格都经人工核对。', note: '首版，本机使用：文本链路已做小样验证，真实生图小样曾返回 429，效果尚未充分实测。画面为代码绘制示意。' },
];

const STEP_ACTIVE = ['prep', 'script', 'img'];
const FINAL = 'polygon(1.2% 0%, 100% 0%, 98.8% 100%, 0% 100%)';
const FROM = 'polygon(0% 0%, 0% 0%, -2% 100%, -2% 100%)';
const TO = 'polygon(100% 0%, 100% 0%, 98% 100%, 98% 100%)';

function art(kind: 'rooftop' | 'hall' | 'street', label: string): string {
  const defs = `<defs>
    <linearGradient id="sky-${kind}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--art-sky-top)"/><stop offset="0.55" style="stop-color:var(--art-sky-mid)"/><stop offset="1" style="stop-color:var(--art-sky-low)"/></linearGradient>
    <linearGradient id="hall-${kind}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--art-hall-a)"/><stop offset="1" style="stop-color:var(--art-hall-b)"/></linearGradient>
  </defs>`;
  if (kind === 'rooftop') {
    return `<svg class="art" viewBox="0 0 400 320" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${label}">${defs}
      <rect width="400" height="320" fill="url(#sky-rooftop)"/>
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
    return `<svg class="art" viewBox="0 0 400 320" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${label}">${defs}
      <rect width="400" height="320" fill="url(#hall-hall)"/>
      <path class="a-floor" d="M0 320 L400 320 L252 190 L148 190 Z"/>
      <path class="a-wall-l" d="M0 0 L148 120 L148 190 L0 320 Z"/>
      <path class="a-wall-r" d="M400 0 L252 120 L252 190 L400 320 Z"/>
      <rect class="a-door" x="148" y="120" width="104" height="70"/>
      ${[0, 1, 2, 3].map((i) => `<ellipse class="a-lamp" cx="200" cy="${30 + i * 22}" rx="${60 - i * 12}" ry="${6 - i}"/>`).join('')}
      <g transform="translate(200 186)"><circle class="a-fig-a" cx="0" cy="-20" r="5"/><path class="a-fig-a" d="M-6 10 L-4 -14 Q0 -17 4 -14 L6 10 Z"/></g>
    </svg>`;
  }
  return `<svg class="art" viewBox="0 0 400 320" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${label}">${defs}
      <rect width="400" height="320" class="a-night"/>
      <path class="a-near" d="M0 320 L0 120 L90 120 L90 70 L170 70 L170 150 L250 150 L250 100 L340 100 L340 130 L400 130 L400 320 Z"/>
      <rect class="a-sign" x="100" y="86" width="56" height="22" rx="2"/>
      <g class="a-win">${Array.from({ length: 18 }, (_, i) => `<rect x="${24 + (i % 6) * 50}" y="${160 + Math.floor(i / 6) * 40}" width="14" height="20"/>`).join('')}</g>
      <rect class="a-puddle" x="0" y="262" width="400" height="58"/>
      <g class="a-speed"><path d="M30 10 L60 120M90 0 L122 130M160 8 L186 110M230 0 L262 120M300 12 L330 130"/></g>
    </svg>`;
}

function panels(): string {
  const novel = `<div class="pn b0a"><div class="pn-in novel"><h4>第一章 旧院来信</h4>
      <p>雨下到第三天，<mark>周砚</mark>才拆开那封信。信纸很薄，字迹却用力得几乎穿透纸背：“<mark>旧院</mark>的井，不要再开。”</p>
      <p>他把信折回原样，塞进外套内袋，转身看向院门。<mark>门锁是新换的。</mark></p>
      <p class="hint">虚构示例原著，用于演示整理流程</p></div></div>
    <div class="pn b0b"><div class="pn-in"><h4>原著版本</h4><ul class="vers"><li><span>原件 TXT</span><b>已保留</b></li><li><span>解析版 v1</span><b>已解析</b></li><li><span>第 1 至 10 章摘要</span><b>待整理</b></li></ul></div></div>
    <div class="pn b0c"><div class="pn-in"><h4>要拆成逐格画面</h4><div class="frames" aria-hidden="true">${'<i></i>'.repeat(6)}</div></div></div>`;
  const cap = `<div class="pn b1a"><div class="pn-in"><h4>原著与知识</h4>
      <svg class="kg" viewBox="0 0 220 150" role="img" aria-label="人物与场景关系的示意图">
        <g class="kg-l"><path d="M110 74 L48 36M110 74 L176 34M110 74 L46 118M110 74 L180 112M48 36 L46 118"/></g>
        <circle class="kg-n c1" cx="110" cy="74" r="16"/><circle class="kg-n c2" cx="48" cy="36" r="10"/><circle class="kg-n c3" cx="176" cy="34" r="10"/><circle class="kg-n c2" cx="46" cy="118" r="10"/><circle class="kg-n c3" cx="180" cy="112" r="10"/>
        <text x="110" y="78" text-anchor="middle">周砚</text><text x="48" y="58" text-anchor="middle">旧院</text><text x="176" y="56" text-anchor="middle">来信</text>
      </svg><div class="chips-row"><span>人物</span><span>场景</span><span>伏笔</span></div></div></div>
    <div class="pn b1b"><div class="pn-in"><h4>骨架与细纲</h4><ul class="outline"><li class="l1">第一卷 旧院</li><li class="l2">第 1 章 来信</li><li class="l3">场 1 雨夜拆信</li><li class="l3">场 2 院门新锁</li><li class="l2">第 2 章 井</li><li class="l3">场 1 夜里回院</li></ul></div></div>
    <div class="pn b1c"><div class="pn-in"><h4>逐格脚本</h4><ul class="script">
      <li><b>格 1</b><span>中景，雨中门廊，周砚低头拆信</span><em data-cand>候选</em></li>
      <li><b>格 2</b><span>特写，信纸上用力的字迹</span><em data-cand>候选</em></li>
      <li><b>格 3</b><span>远景，院门挂着新锁</span><em data-cand>候选</em></li></ul></div></div>`;
  const prod = `<div class="pn b2a"><div class="pn-in canvas"><div class="tools" aria-hidden="true"><span>${icon('pointer', 14)}选择</span><span class="on">${icon('pointer', 14)}点选</span><span>${icon('frame', 14)}框选</span><span>${icon('brush', 14)}画笔</span><span>${icon('shield', 14)}保护区</span><span>${icon('hand', 14)}平移</span></div>
      <div class="art-wrap">${art('rooftop', '代码绘制的示意画面：黄昏屋顶上的两个人影')}</div>
      <p class="art-cap">图片工作区 · 第 1 话 第 1 格，代码绘制示意，不是模型生成</p></div></div>
    <div class="pn b2b"><div class="pn-in"><h4>版本与审核</h4><ul class="vers"><li><span>v1</span><b class="ok">当前采用</b></li><li><span>v2</span><b>候选</b></li><li><span>来源与检查</span><b>人工导入，未检查</b></li></ul></div></div>
    <div class="pn b2c"><div class="pn-in strip"><h4>本话的格</h4><div class="strip-row">${art('hall', '代码绘制的示意画面：长廊')}${art('street', '代码绘制的示意画面：雨夜街道')}${art('rooftop', '代码绘制的示意画面：屋顶')}</div></div></div>`;
  return novel.replace(/\s*\n\s*/g, '') + cap.replace(/\s*\n\s*/g, '') + prod.replace(/\s*\n\s*/g, '');
}

function create(): WorldInst {
  const nav = `<span class="cm-brand" data-bridge="brand"><i class="cm-logo">${icon('layers', 20)}</i><b>条漫 Agent</b><small>本机工作台</small></span>${phaseHTML()}`;
  const main = `<div class="cm-grid">
    <div class="cm-cap" data-cap>${narrHTML()}</div>
    <div class="cm-workbench">
      <aside class="cm-side" aria-hidden="true">
        <p class="cm-back">项目库</p>
        <p class="cm-proj"><small>正在创作</small><b>旧院来信</b></p>
        <ul class="cm-steps">
          <li data-s="prep">${icon('book', 16)}全书前期准备</li>
          <li data-s="batch">${icon('clapper', 16)}批次制作</li>
          <li class="sub" data-s="script">脚本审核</li>
          <li class="sub" data-s="pack">逐格生图包</li>
          <li class="sub" data-s="img">${icon('image', 15)}图片工作区</li>
        </ul>
      </aside>
      <div class="cm-page" data-page>${panels()}</div>
    </div>
  </div>`;
  const root = buildShell('comic', '条漫 Agent 展示', nav, main);
  const page = qs(root, '[data-page]');
  const cap = qs(root, '[data-cap]');
  const narr = qs(root, '[data-narr]');
  const sets = [0, 1, 2].map((b) => qsa(page, `.pn[class*="b${b}"]`));
  let scope = new Scope();
  let beat = -1;

  const streak = () => {
    if (env.reduced) return;
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
          { duration: 640, delay: i * 45, easing: 'cubic-bezier(0.77, 0, 0.18, 1)', fill: 'both' },
        ),
      );
    }
    page.appendChild(wrap);
    void Promise.all(anims).then(() => wrap.remove());
  };

  const showSet = async (b: number, instant: boolean) => {
    const enter = sets[b];
    const leave = sets.flatMap((s, i) => (i === b ? [] : s.filter((p) => !p.hidden)));
    if (instant) {
      sets.forEach((s, i) => s.forEach((p) => { reset(p); p.hidden = i !== b; }));
      return;
    }
    await Promise.all(leave.map((p, i) => anim(p, [{ clipPath: FINAL }, { clipPath: TO }], { duration: 420, delay: i * 50, easing: 'cubic-bezier(0.7, 0, 0.84, 0)' }).then(() => { p.hidden = true; reset(p); })));
    streak();
    await Promise.all(enter.flatMap((p, i) => {
      reset(p);
      p.hidden = false;
      const inner = p.querySelector('.pn-in');
      return [
        anim(inner, [{ opacity: 0, transform: 'translateY(18px)' }, { opacity: 1, transform: 'none' }], { duration: 700, delay: 260 + i * 110, fill: 'backwards' }),
        anim(p, [{ clipPath: FROM }, { clipPath: FINAL }], { duration: 760, delay: 80 + i * 110, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'backwards' }),
      ];
    }));
  };

  async function tlCaps(sc: Scope) {
    const cands = qsa(root, '[data-cand]');
    cands.forEach((c) => { c.textContent = '候选'; c.classList.remove('ok'); });
    if (env.reduced) {
      cands[0].textContent = '已采用'; cands[0].classList.add('ok');
      return;
    }
    if (!(await sc.sleep(1500))) return;
    cands[0].textContent = '已采用'; cands[0].classList.add('ok');
    void anim(cands[0], [{ transform: 'scale(1.35)' }, { transform: 'scale(1)' }], { duration: 520 });
    if (!(await sc.sleep(900))) return;
    cands[1].textContent = '已采用'; cands[1].classList.add('ok');
    await anim(cands[1], [{ transform: 'scale(1.35)' }, { transform: 'scale(1)' }], { duration: 520 });
  }

  const inst: WorldInst = {
    el: root,
    nextLabel: (b) => (b === 2 ? '看全部作品' : b === 0 ? '看它如何运作' : '看最终产出'),
    title: (b) => `条漫 Agent，${['问题', '能力', '产出'][b]}：${COPY[b].h}`,
    focusEl: () => qs(root, '[data-n="h"]'),
    async show(b, dir, instant) {
      scope.cancel();
      scope = new Scope();
      const sc = scope;
      inst.demoBusy = false;
      inst.onDemoChange?.();
      const first = beat < 0;
      beat = b;
      setPhase(root, b);
      qsa(root, '[data-s]').forEach((li) => {
        const s = li.dataset.s;
        li.classList.toggle('on', s === STEP_ACTIVE[b] || (s === 'batch' && b > 0));
      });
      if (first && !env.reduced) {
        void anim(cap, [{ opacity: 0, transform: 'translateY(26px)' }, { opacity: 1, transform: 'none' }], { duration: 800, delay: 650, fill: 'backwards' });
      }
      await Promise.all([swapNarr(narr, COPY[b], instant || first, dir), showSet(b, instant || first)]);
      if (b === 1) void runDemo(inst, sc, () => tlCaps(sc));
    },
    destroy() {
      scope.cancel();
      inst.demoBusy = false;
    },
  };
  return inst;
}

export const comicWorld: WorldDef = { id: 'comic', beats: 3, create };
