import { anim, cssVar, env, fitCanvas, qs, rand, reset, Scope } from '../env';
import { icon } from '../icons';
import { buildShell, type WorldDef, type WorldInst } from '../types';

interface OrbParticle {
  ring: 0 | 1 | 2;
  angle: number;
  speed: number;
  radOffset: number;
  size: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  ph: number;
}

function create(): WorldInst {
  const nav = `
    <span class="wordmark" data-bridge="brand">FightJs</span>
    <nav class="id-links" aria-label="个人主页">
      <a href="https://github.com/FightJs" target="_blank" rel="noopener noreferrer">GitHub</a>
      <a href="https://blog.csdn.net/qq_73599840?type=blog" target="_blank" rel="noopener noreferrer">CSDN</a>
    </nav>`;

  const main = `
    <div class="open-grid" data-b="0">
      <div class="open-left">
        <h1 class="open-h1" data-focus>FightJs</h1>
        <p class="open-lede">构建 AI 应用与开发者工具的独立开发者</p>
        <div class="open-meta" aria-label="三大重点项目世界">
          <span class="open-chip" data-c="graph">${icon('graph', 14)}<span>GraphRAG-Agent</span></span>
          <span class="open-chip" data-c="studio">${icon('ring', 14)}<span>直播间智能搭建</span></span>
          <span class="open-chip" data-c="comic">${icon('layers', 14)}<span>条漫 Agent</span></span>
        </div>
        <div class="open-actions">
          <button class="btn btn-primary" type="button" data-act="next">
            <span>进入作品世界</span><span class="btn-key">空格</span>
          </button>
          <span class="open-hint">点击画面或按方向键推进 · 约 2 至 3 分钟</span>
        </div>
      </div>
      <div class="open-canvas-box" aria-hidden="true">
        <canvas class="open-orbital"></canvas>
      </div>
    </div>
    <div class="open-b1" data-b="1" hidden>
      <div class="open-b1-head">
        <h2 class="open-statement" data-focus>三个项目，三种世界。</h2>
        <p class="open-sub">每一幕都会切换整站的色彩、材质、导航与工作台。从问题出发，经由核心能力，抵达真实产出。</p>
      </div>
      <div class="trio-lanes">
        <article class="trio-lane" data-c="graph">
          <div class="trio-lane-bar" aria-hidden="true"></div>
          <div>
            <strong>GraphRAG-Agent</strong>
            <span class="trio-role">私有知识库图谱问答</span>
          </div>
          <p>把散落八种格式的私有资料，抽取为可浏览、可编辑的知识图谱与三路溯源问答。</p>
          <span class="trio-lane-tag">靛蓝图谱世界</span>
        </article>
        <article class="trio-lane" data-c="studio">
          <div class="trio-lane-bar" aria-hidden="true"></div>
          <div>
            <strong>直播间智能搭建</strong>
            <span class="trio-role">Live Craft 对话交付管线</span>
          </div>
          <p>用调研表状态机整理零散需求，串联知识库检索，一键派生三视图、清单与交付包。</p>
          <span class="trio-lane-tag">青瓷咨询室世界</span>
        </article>
        <article class="trio-lane" data-c="comic">
          <div class="trio-lane-bar" aria-hidden="true"></div>
          <div>
            <strong>条漫 Agent</strong>
            <span class="trio-role">小说改编分镜工作台</span>
          </div>
          <p>让小说改编、剧本细纲、逐格脚本与画布批注审查在同一工作台闭环运转。</p>
          <span class="trio-lane-tag">墨色分镜世界</span>
        </article>
      </div>
    </div>`;

  const root = buildShell('void', 'FightJs 开场', nav, main);
  const canvas = qs<HTMLCanvasElement>(root, '.open-orbital');
  const ctx = canvas.getContext('2d');

  let particles: OrbParticle[] = [];
  let W = 0;
  let H = 0;
  let dpr = 1;
  let raf = 0;
  let running = false;
  let beat = 0;
  const ptr = { x: -999, y: -999 };
  const colors: string[] = ['', '', ''];
  const scope = new Scope();
  let built = false;

  const readColors = () => {
    colors[0] = cssVar(root, '--hue-graph');
    colors[1] = cssVar(root, '--hue-studio');
    colors[2] = cssVar(root, '--hue-comic');
  };

  function initOrbital() {
    if (!ctx) return;
    readColors();
    const f = fitCanvas(canvas);
    W = f.w;
    H = f.h;
    dpr = f.dpr;
    const n = env.low ? 650 : 1500;
    particles = Array.from({ length: n }, (_, i) => {
      const ring = (i % 3) as 0 | 1 | 2;
      return {
        ring,
        angle: rand(0, Math.PI * 2),
        speed: (0.0022 + ring * 0.0008) * (ring === 1 ? -1 : 1),
        radOffset: rand(-18, 18),
        size: rand(1.5, 3.1),
        x: W * 0.5,
        y: H * 0.5,
        vx: 0,
        vy: 0,
        ph: rand(0, Math.PI * 2),
      };
    });
    built = true;
  }

  function ringParams(ring: 0 | 1 | 2, t: number) {
    const cx = W * 0.5;
    const cy = H * 0.5;
    const baseR = Math.min(W, H) * (0.295 + ring * 0.095);
    const tilt = ring === 0 ? -0.38 : ring === 1 ? 0.34 : 0.06;
    const squash = ring === 0 ? 0.52 : ring === 1 ? 0.58 : 0.86;
    const wobble = env.reduced ? 0 : Math.sin(t * 0.0005 + ring * 2.1) * 0.06;
    return { cx, cy, baseR, tilt: tilt + wobble, squash };
  }

  function targetPos(p: OrbParticle, t: number) {
    const { cx, cy, baseR, tilt, squash } = ringParams(p.ring, t);
    const r = baseR + p.radOffset + (env.reduced ? 0 : Math.sin(t * 0.0018 + p.ph) * 4);
    const lx = Math.cos(p.angle) * r;
    const ly = Math.sin(p.angle) * r * squash;
    const cosT = Math.cos(tilt);
    const sinT = Math.sin(tilt);
    return {
      tx: cx + lx * cosT - ly * sinT,
      ty: cy + lx * sinT + ly * cosT,
    };
  }

  function drawOrbital(t: number) {
    if (!ctx || W === 0 || H === 0) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    // Draw subtle orbital guide ellipses
    for (let rIdx = 0; rIdx < 3; rIdx++) {
      const { cx, cy, baseR, tilt, squash } = ringParams(rIdx as 0 | 1 | 2, t);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(tilt);
      ctx.scale(1, squash);
      ctx.strokeStyle = colors[rIdx];
      ctx.globalAlpha = 0.24;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0, 0, baseR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Center planet core + soft nebula halo
    const cx = W * 0.5;
    const cy = H * 0.5;
    const haloR = Math.min(W, H) * 0.19;
    const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, haloR);
    grad.addColorStop(0, colors[0]);
    grad.addColorStop(0.45, colors[1]);
    grad.addColorStop(1, 'transparent');
    ctx.globalAlpha = 0.16;
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, haloR, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = 0.28;
    ctx.strokeStyle = colors[1];
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(cx, cy, 16, 0, Math.PI * 2);
    ctx.stroke();

    ctx.globalAlpha = 0.92;
    ctx.fillStyle = colors[2];
    ctx.beginPath();
    ctx.arc(cx, cy, 7, 0, Math.PI * 2);
    ctx.fill();

    // Draw orbiting particles
    for (const p of particles) {
      ctx.fillStyle = colors[p.ring];
      ctx.globalAlpha = p.ring === 2 ? 0.85 : 0.72;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }

  function step(t: number) {
    if (!running) return;
    const interact = !env.low && !env.reduced;
    for (const p of particles) {
      p.angle += p.speed;
      const { tx, ty } = targetPos(p, t);
      let ax = (tx - p.x) * 0.08;
      let ay = (ty - p.y) * 0.08;
      if (interact) {
        const dx = p.x - ptr.x;
        const dy = p.y - ptr.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 12000) {
          const f = (1 - d2 / 12000) * 3.8;
          const d = Math.sqrt(d2) || 1;
          ax += (dx / d) * f;
          ay += (dy / d) * f;
        }
      }
      p.vx = (p.vx + ax) * 0.82;
      p.vy = (p.vy + ay) * 0.82;
      p.x += p.vx;
      p.y += p.vy;
    }
    drawOrbital(t);
    raf = requestAnimationFrame(step);
  }

  function runOrbital() {
    if (!ctx || running) return;
    if (!built) initOrbital();
    if (env.reduced) {
      particles.forEach((p) => {
        const { tx, ty } = targetPos(p, 0);
        p.x = tx;
        p.y = ty;
      });
      drawOrbital(0);
      return;
    }
    particles.forEach((p) => {
      const { tx, ty } = targetPos(p, 0);
      p.x = tx + rand(-60, 60);
      p.y = ty + rand(-60, 60);
    });
    running = true;
    raf = requestAnimationFrame(step);
  }

  canvas.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    ptr.x = e.clientX - r.left;
    ptr.y = e.clientY - r.top;
  });
  canvas.addEventListener('pointerleave', () => {
    ptr.x = -999;
    ptr.y = -999;
  });

  const onResize = () => {
    if (!built || !ctx) return;
    const f = fitCanvas(canvas);
    W = f.w;
    H = f.h;
    dpr = f.dpr;
    if (env.reduced) {
      particles.forEach((p) => {
        const { tx, ty } = targetPos(p, 0);
        p.x = tx;
        p.y = ty;
      });
      drawOrbital(0);
    }
  };
  window.addEventListener('resize', onResize);

  const stages = Array.from(root.querySelectorAll<HTMLElement>('[data-b]'));
  const fontsReady = () =>
    document.fonts?.ready ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1000))]) : Promise.resolve();

  const inst: WorldInst = {
    el: root,
    nextLabel: (b) => (b === 0 ? '进入作品世界' : '进入第一个世界'),
    title: (b) => (b === 0 ? 'FightJs，构建 AI 应用与开发者工具的独立开发者' : '三个项目，三种世界'),
    focusEl: () => root.querySelector<HTMLElement>(`[data-b="${beat}"] [data-focus]`),
    settled() {
      if (beat === 0) runOrbital();
    },
    async show(b, _dir, instant) {
      scope.cancel();
      const first = !built && b === 0;
      const prevBeat = beat;
      beat = b;
      root.dataset.step = String(b);
      if (b === 0 && !built) {
        await fontsReady();
        stages.forEach((s) => (s.hidden = Number(s.dataset.b) !== b));
        initOrbital();
        runOrbital();
      }
      const target = stages.filter((s) => Number(s.dataset.b) === b);
      const leaving = stages.filter((s) => Number(s.dataset.b) === prevBeat && prevBeat !== b);
      if (instant || first) {
        stages.forEach((s) => (s.hidden = Number(s.dataset.b) !== b));
        target.forEach((s) => (s.style.opacity = '1'));
        return;
      }
      await Promise.all(leaving.map((s) => anim(s, [{ opacity: 1 }, { opacity: 0 }], { duration: 280, easing: 'ease-in' })));
      stages.forEach((s) => {
        s.hidden = Number(s.dataset.b) !== b;
        reset(s);
      });
      if (b === 0) {
        runOrbital();
        await Promise.all(
          target.map((s) =>
            anim(s, [{ opacity: 0, transform: 'translateY(14px)' }, { opacity: 1, transform: 'none' }], { duration: 520, delay: 80 }),
          ),
        );
        return;
      }
      running = false;
      cancelAnimationFrame(raf);
      const b1Head = root.querySelector('.open-b1-head');
      const lanes = Array.from(root.querySelectorAll<HTMLElement>('.trio-lane'));
      const bars = Array.from(root.querySelectorAll<HTMLElement>('.trio-lane-bar'));
      target.forEach((s) => (s.style.opacity = '1'));
      reset(b1Head, ...lanes, ...bars);
      await Promise.all([
        anim(b1Head, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 420 }),
        ...lanes.map((lane, idx) =>
          anim(
            lane,
            [{ opacity: 0, transform: 'translateX(-16px)' }, { opacity: 1, transform: 'none' }],
            { duration: 460, delay: 60 + idx * 80, fill: 'both' },
          ),
        ),
        ...bars.map((bar, idx) =>
          anim(
            bar,
            [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }],
            { duration: 400, delay: 140 + idx * 80, fill: 'both' },
          ),
        ),
      ]);
      reset(b1Head, ...lanes, ...bars);
    },
    destroy() {
      scope.cancel();
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
    },
  };
  return inst;
}

export const openWorld: WorldDef = { id: 'void', beats: 2, create };
