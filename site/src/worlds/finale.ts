import { anim, cssVar, env, fitCanvas, qs, qsa, reset, Scope } from '../env';
import { buildShell, type WorldDef, type WorldInst } from '../types';

export interface ProjectItem {
  id: string;
  name: string;
  sub: string;
  featured: boolean;
  commit: string;
  summary: string;
  problem: string;
  capability: string;
  boundary: string;
  stack: string[];
  repo: string;
  live: string;
  liveLabel: string;
  previewKind: string;
}

export const PROJECTS: ProjectItem[] = [
  {
    id: 'graphrag',
    name: 'GraphRAG-Agent',
    sub: '知识图谱与多模态检索问答',
    featured: true,
    commit: 'main@49891cf',
    summary: '面向私有资料的全栈图谱问答系统：整合多格式文档解析、分块、图谱抽取、可视化增量编辑与流式溯源问答。',
    problem: '私有文档散落在 PDF、DOCX、XLSX、PPTX、HTML、MD、CSV、TXT 八种格式中，跨文档实体关系难以串联，普通向量检索缺少结构化关联。',
    capability: '五阶段异步索引编排（解析 → Markdown → 分块 → 图谱抽取 → 向量化）；支持 KG-Only（两跳子图）、RRF Agentic（启发式子查询拆分 + 向量/关键词/图谱融合溯源）与 Auto 模式；支持 BYOK Fernet 加密凭据校验。',
    boundary: '支持单文档与跨文档知识库双模式检索；RRF Agentic 采用启发式子查询拆解并附带文档片段溯源，KG-Only 专注两跳实体关系图谱推理。',
    stack: ['FastAPI', 'SQLAlchemy Async', 'React 18', 'TypeScript', 'D3', 'Fernet BYOK'],
    repo: 'https://github.com/FightJs/GraphRAG-Agent',
    live: 'https://fightjs.github.io/GraphRAG-Agent/',
    liveLabel: '在线体验',
    previewKind: 'graphrag',
  },
  {
    id: 'livecraft',
    name: '直播间智能搭建系统',
    sub: 'Live Craft · 对话采集到交付包',
    featured: true,
    commit: 'main@5f902ea',
    summary: '面向直播间搭建场景的智能交付管线：通过调研表状态机采集需求，生成设备清单、预算方案、三机位空间视图与交付包。',
    problem: '传统直播间搭建依赖反复人工沟通、零散报价与邮件往返，客户口述需求难以直接转化为结构化可执行方案。',
    capability: '客服 Agent 按调研表状态机推进采集、跑题纠偏、跨会话续接，产出唯一需求真相源 form_state；方案 Agent 结合 Qdrant 向量与知识关系检索生成 plan.json，派生 PDF、0°/120°/240° 三视图、预览视频与 ZIP 交付包。',
    boundary: '以表单状态机与 plan.json 作为唯一真相源贯穿前后端，串联 Qdrant 检索与空间三视图生成，保障设备清单、预算档位与交付产物一致。',
    stack: ['React 19', 'FastAPI', 'SQLite', 'Qdrant', 'State Machine', 'Pipeline'],
    repo: 'https://github.com/FightJs/intelligent-customer-service',
    live: 'https://fightjs.github.io/intelligent-customer-service/',
    liveLabel: '在线体验',
    previewKind: 'livecraft',
  },
  {
    id: 'comicagent',
    name: '条漫 Agent',
    sub: '本地小说改编与分镜创作工作台',
    featured: true,
    commit: 'main@208c8ad',
    summary: '从原著整理、知识图谱、骨架细纲到逐格脚本、生图包、画布批注与人工审查的本地条漫创作工作台。',
    problem: '小说改编条漫跨越长文本拆解、人物场景设定、分镜脚本与多轮画面返修，跨工具搬运极易丢失上下文与版本记录。',
    capability: '本机持久化管理原著版本与卷章摘要；AI 产出待采用候选，经人工确认后方入正稿；图片工作区支持 Konva 画布点选/框选/保护区标注、候选对比与检查点恢复。',
    boundary: '以本机工作台为核心持久化原著、细纲与画布批注状态，同时提供六阶段纯前端导览视图；所有 AI 候选结果均经人工确认后入库。',
    stack: ['React', 'TypeScript', 'Tiptap', 'Konva', 'FastAPI', 'SQLite', 'Pi SDK'],
    repo: 'https://github.com/FightJs/comic-agent',
    live: 'https://fightjs.github.io/comic-agent/',
    liveLabel: '在线体验',
    previewKind: 'comicagent',
  },
  {
    id: 'docaudit',
    name: 'DocAuditAgent',
    sub: '可审计的文档审核工作台',
    featured: false,
    commit: 'main@38b67e7',
    summary: '采用规范驱动开发（SDD）构建的合同与材料审核工作台：区分自动风险检出与人工授权审批决定。',
    problem: '材料上传或自动扫描常被误当作审批通过；高风险合同条款缺乏不可变文档版本绑定、原文证据定位与幂等审计轨迹。',
    capability: '不可变文档版本上传合同正文与附件；查看审核运行状态、风险项与原文定位；强制先处置必处置风险项，再在有效基线与 expected_revision 保护下提交人工决定。',
    boundary: '基于规范驱动开发（SDD）构建状态机闭环，通过不可变文档版本与 expected_revision 修订校验确保审批决定具备完整审计轨迹。',
    stack: ['FastAPI', 'React', 'TypeScript', 'SDD 规范驱动', '幂等修订控制'],
    repo: 'https://github.com/FightJs/DocAuditAgent',
    live: 'https://fightjs.github.io/DocAuditAgent/',
    liveLabel: '在线体验',
    previewKind: 'docaudit',
  },
  {
    id: 'comicskills',
    name: 'vertical-comic-skills',
    sub: '条漫逐格生产 Skill 五件套',
    featured: false,
    commit: 'main@ef2226d',
    summary: '覆盖视觉基准、镜头设计、并行生图、阶段审查与分工 ZIP 交接的条漫逐格生产 Skill 组合包。',
    problem: '多人或多阶段条漫生图协作中，不同环节提示词、画风规则与资产版本容易漂移，缺少冻结版本的标准交接契约。',
    capability: '提供接包生产入口，自动校验、解压并绑定本地冻结生产版本（RV）；涵盖视觉基准、镜头、逐格生图、审查与 ZIP 交接一致核验。',
    boundary: '聚焦从已批准脚本到首批独立逐格图片的标准化产出与一致性核验，通过冻结 RV 版本协议确保多阶段交接零漂移。',
    stack: ['Agent Skills', 'Python', '冻结 RV 协议', 'ZIP 交接校验'],
    repo: 'https://github.com/FightJs/vertical-comic-skills',
    live: 'https://github.com/FightJs/vertical-comic-skills/releases/latest',
    liveLabel: '查看最新发布版',
    previewKind: 'comicskills',
  },
  {
    id: 'bosshunter',
    name: 'BossHunter',
    sub: '岗位采集、评分与投递跟踪台',
    featured: false,
    commit: 'main@f6c2051',
    summary: '本地求职自动化流水线控制台：串联岗位采集、并行 AI 评分、招呼语生成、人工确认投递与回复监测。',
    problem: '多平台海投筛选耗时费力，全自动盲目投递又容易误投不匹配岗位，缺少本地可视化的筛选池与人工确认关卡。',
    capability: 'v2.4.0 并行工作台支持职位采集、AI 评分与招呼语生成独立或并行运行；岗位池支持多维筛选、XLSX 导出与人工确认投递。',
    boundary: '基于本地 Chrome 自动化与并行队列调度构建，保障求职数据本地可控，并在关键投递环节保留人工最终确认。',
    stack: ['Python', 'Chrome Automation', '本地工作台', '并行评分队列'],
    repo: 'https://github.com/FightJs/BossHunter',
    live: 'https://fightjs.github.io/BossHunter/',
    liveLabel: '查看项目主页',
    previewKind: 'bosshunter',
  },
  {
    id: 'stillscape',
    name: 'Stillscape · 静观',
    sub: '浏览器动态壁纸与三维艺术画廊',
    featured: false,
    commit: 'main@3af339e',
    summary: '收录 26 款绘画、动漫意境与实时三维场景的 WebGL / Three.js 浏览器动态壁纸艺术画廊。',
    problem: '静态画廊难以传达光影流动与空间呼吸感，而重型桌面客户端又无法在浏览器中即点即看。',
    capability: '统一播放器承载 26 款作品（含午夜超驰、星环远征、棱镜回廊、托斯卡纳的呼吸等）；纯前端静态运行，无需后端、数据库或 API Key。',
    boundary: '采用纯前端静态架构与统一场景播放器驱动 26 款 WebGL / Three.js 实时画面，无需后端服务或 API Key 即可浏览器直达。',
    stack: ['WebGL', 'Three.js', 'Shader', '统一播放器', '纯静态部署'],
    repo: 'https://github.com/FightJs/stillscape',
    live: 'https://fightjs.github.io/stillscape/',
    liveLabel: '进入在线画廊',
    previewKind: 'stillscape',
  },
  {
    id: 'svgreview',
    name: 'SVG Review Pack',
    sub: 'SVG 优化像素差异对比与审阅包导出',
    featured: false,
    commit: 'main@9849def',
    summary: '在浏览器本地完成 SVGO 优化前后同画布渲染、逐像素差异比对，并导出可复现验证 ZIP 包。',
    problem: 'SVG 压缩优化常在表面体积缩小的同时悄悄破坏 `transform-origin`、渐变或路径细节，肉眼难以察觉。',
    capability: '基于 SVGO 4.1.0 与 pixelmatch 8.0.0，在 128×128 同等条件下对比原图、优化图与红区像素差异（DIFF），一键打包审阅 ZIP。',
    boundary: '全程在浏览器本地完成光栅化与像素级 DIFF 运算，不依赖服务端渲染，支持一键打包原图、优化图与差异报告用于审阅。',
    stack: ['TypeScript', 'SVGO 4.1.0', 'pixelmatch 8.0.0', 'Canvas Diff', 'ZIP Export'],
    repo: 'https://github.com/FightJs/svg-review-pack',
    live: 'https://fightjs.github.io/svg-review-pack/',
    liveLabel: '打开在线工具',
    previewKind: 'svgreview',
  },
  {
    id: 'zod',
    name: 'Zod Upgrade Gotchas',
    sub: 'Zod 3 与 Zod 4 真实解析差异实验室',
    featured: false,
    commit: 'main@21ebc40',
    summary: '在浏览器内同时运行真实 Zod 3.25.76 与 Zod 4.6.7，直观对比三类升级后返回数据的隐蔽行为差异。',
    problem: '从 Zod 3 升级到 Zod 4 时，诸如 `.partial()` 下的 `.default()` 注入、安全整数边界与枚举键行为变化可能改变入库数据。',
    capability: '通过 npm 别名并存双版本真实包；支持在线修改 JSON 输入、双版本同步执行对比、一键复制独立 Node.js 复现代码与分享案例链接。',
    boundary: '通过 npm 别名在同一运行时并存 Zod 3 与 Zod 4 真实依赖包，支持实时编辑输入并一键生成独立 Node.js 复现脚本与案例分享链接。',
    stack: ['TypeScript', 'Zod 3.25.76', 'Zod 4.6.7', '双版本沙箱对比'],
    repo: 'https://github.com/FightJs/zod-upgrade-gotchas',
    live: 'https://fightjs.github.io/zod-upgrade-gotchas/',
    liveLabel: '打开在线对比',
    previewKind: 'zod',
  },
  {
    id: 'precache',
    name: 'Precache Lens',
    sub: 'Vite 构建清单与 Workbox 预缓存交叉分析',
    featured: false,
    commit: 'main@3a4e967',
    summary: '将 Vite 构建 manifest 与 Workbox 预缓存清单交叉比对，揭示“按需懒加载模块为何在 PWA 安装时已被预缓存”。',
    problem: '前端把重型模块拆成动态 chunk 后，Service Worker 仍可能在安装阶段预缓存该文件，仅看源码难以定位引用链路。',
    capability: '自动标注 Static entry path、Dynamic path、No known Vite link 与 Uncertain 四类状态，展示从入口到目标产物的完整引用路径。',
    boundary: '所有构建产物清单均在浏览器本地静态解析与图遍历，不执行 Service Worker 脚本也不上传源码，精准定位隐式预缓存引用链。',
    stack: ['TypeScript', 'Vite Manifest 解析', 'Workbox 清单分析', '静态图遍历'],
    repo: 'https://github.com/FightJs/precache-lens',
    live: 'https://fightjs.github.io/precache-lens/',
    liveLabel: '打开在线工具',
    previewKind: 'precache',
  },
  {
    id: 'codexmobile',
    name: 'codex-mobile',
    sub: '浏览器与移动端 Termux 的 Codex 界面',
    featured: false,
    commit: 'main@9d99fb6',
    summary: '运行在浏览器中的 Codex 工作流界面，可配合 codex-app-server 在桌面或 Android Termux 环境使用。',
    problem: '命令行编码代理在移动端或跨设备场景下缺乏直观的会话管理、差异审阅与本地文件操作界面。',
    capability: '通过 Web UI 连接本地 codex-app-server，支持在浏览器中浏览项目、发起任务与查看文件修改，配合 Termux 可在移动端运行。',
    boundary: '通过轻量级 Web UI 直连本地 codex-app-server，针对移动端与 Termux 窄屏终端优化会话交互、文件浏览与差异审阅体验。',
    stack: ['Node.js', 'Web UI', 'codex-app-server', 'Termux 适配'],
    repo: 'https://github.com/FightJs/codex-mobile',
    live: 'https://fightjs.github.io/codex-mobile/',
    liveLabel: '访问项目主页',
    previewKind: 'codexmobile',
  },
];

function renderSchematic(kind: string): string {
  switch (kind) {
    case 'graphrag':
      return `<div class="schem schem-graph" aria-hidden="true">
        <div class="sc-bar"><span class="sc-tag">KG-Only</span><span class="sc-tag">RRF Agentic</span><span class="sc-tag on">Auto</span></div>
        <div class="sc-flow"><span class="sc-pill">多格式文档</span><i class="sc-line"></i><span class="sc-pill acc">知识图谱</span><i class="sc-line"></i><span class="sc-pill">三路融合溯源</span></div>
      </div>`;
    case 'livecraft':
      return `<div class="schem schem-studio" aria-hidden="true">
        <div class="sc-flow">
          <span class="sc-pill">对话状态机</span><i class="sc-line"></i><span class="sc-pill acc">form_state</span><i class="sc-line"></i><span class="sc-pill">plan.json</span><i class="sc-line"></i><span class="sc-pill">0° / 120° / 240° + ZIP</span>
        </div>
      </div>`;
    case 'comicagent':
      return `<div class="schem schem-comic" aria-hidden="true">
        <div class="sc-flow">
          <span class="sc-pill">全书前期 · 原著与图谱</span><i class="sc-line"></i><span class="sc-pill">细纲画风 · 逐格脚本</span><i class="sc-line"></i><span class="sc-pill acc">Konva 保护区批注</span><i class="sc-line"></i><span class="sc-pill">人工采用审核</span>
        </div>
      </div>`;
    case 'docaudit':
      return `<div class="schem" aria-hidden="true">
        <div class="sc-audit">
          <div><small>案件参考号</small><b>nda-2026-099</b></div>
          <div><small>审核基线</small><b>scope_nda_v1</b></div>
          <div><small>必处置风险项</small><b class="warn">2 项待人工决定</b></div>
          <div><small>状态契约</small><b class="acc">expected_revision 校验</b></div>
        </div>
      </div>`;
    case 'comicskills':
      return `<div class="schem" aria-hidden="true">
        <div class="sc-flow">
          <span class="sc-pill">01 视觉基准</span><i class="sc-line"></i><span class="sc-pill">02 镜头</span><i class="sc-line"></i><span class="sc-pill acc">03 并行生图</span><i class="sc-line"></i><span class="sc-pill">04 审查</span><i class="sc-line"></i><span class="sc-pill">05 冻结 RV 包</span>
        </div>
      </div>`;
    case 'bosshunter':
      return `<div class="schem" aria-hidden="true">
        <div class="sc-audit">
          <div><small>工作台</small><b>并行采集 + AI 评分</b></div>
          <div><small>招呼语生成</small><b>写入岗位池待确认</b></div>
          <div><small>投递边界</small><b class="acc">人工确认后投递</b></div>
          <div><small>导出支持</small><b>XLSX 筛选结果导出</b></div>
        </div>
      </div>`;
    case 'stillscape':
      return `<div class="schem" aria-hidden="true">
        <div class="sc-swatches">
          <div class="sc-swatch" style="background:linear-gradient(180deg, oklch(48% 0.18 330), oklch(18% 0.08 265))"><span>午夜超驰</span></div>
          <div class="sc-swatch" style="background:linear-gradient(180deg, oklch(56% 0.14 195), oklch(18% 0.06 220))"><span>星环远征</span></div>
          <div class="sc-swatch" style="background:linear-gradient(180deg, oklch(58% 0.15 350), oklch(20% 0.08 300))"><span>棱镜回廊</span></div>
          <div class="sc-swatch" style="background:linear-gradient(180deg, oklch(58% 0.12 85), oklch(22% 0.06 65))"><span>托斯卡纳的呼吸</span></div>
        </div>
      </div>`;
    case 'svgreview':
      return `<div class="schem" aria-hidden="true">
        <div class="sc-diff-row">
          <div class="sc-diff-box">
            <svg class="sc-mini-svg" viewBox="0 0 32 32"><rect x="6" y="6" width="20" height="20" rx="4" fill="none" stroke="oklch(80% 0.13 150)" stroke-width="2"/><circle cx="16" cy="16" r="5" fill="oklch(80% 0.13 150)"/></svg>
            <div><small>原图 128×128</small><b>159 字节</b></div>
          </div>
          <div class="sc-diff-box">
            <svg class="sc-mini-svg" viewBox="0 0 32 32"><rect x="6" y="6" width="20" height="20" rx="4" fill="none" stroke="oklch(80% 0.13 150)" stroke-width="2"/><circle cx="18" cy="16" r="5" fill="oklch(80% 0.13 150)"/></svg>
            <div><small>SVGO 4.1.0</small><b>175 字节</b></div>
          </div>
          <div class="sc-diff-box">
            <svg class="sc-mini-svg" viewBox="0 0 32 32"><rect x="6" y="6" width="20" height="20" rx="4" fill="none" stroke="oklch(50% 0.04 150)" stroke-width="1.5"/><circle cx="16" cy="16" r="5" fill="oklch(66% 0.19 27 / 45%)"/><circle cx="18" cy="16" r="5" fill="oklch(66% 0.19 27 / 85%)"/></svg>
            <div><small>pixelmatch DIFF</small><b class="warn">3409 / 16384 px</b></div>
          </div>
        </div>
      </div>`;
    case 'zod':
      return `<div class="schem" aria-hidden="true">
        <div class="sc-triad">
          <div><small>输入 JSON</small><code>{"b":"changed"}</code></div>
          <div><small>Zod 3.25.76</small><code>{"b":"changed"}</code></div>
          <div><small>Zod 4.6.7 (.partial)</small><code class="acc">{"b":"changed","a":"a"}</code></div>
        </div>
      </div>`;
    case 'precache':
      return `<div class="schem" aria-hidden="true">
        <div class="sc-triad">
          <div><small>app-A1.js</small><b>Static entry path</b></div>
          <div><small>editor-D4.js</small><b class="acc">Dynamic + Precached</b></div>
          <div><small>model.wasm</small><b class="warn">No known Vite link</b></div>
        </div>
      </div>`;
    default:
      return `<div class="schem" aria-hidden="true">
        <div class="sc-flow">
          <span class="sc-pill">Browser Web UI</span><i class="sc-line"></i><span class="sc-pill acc">codex-app-server</span><i class="sc-line"></i><span class="sc-pill">Linux / Windows / Termux</span>
        </div>
      </div>`;
  }
}

function create(): WorldInst {
  const featured = PROJECTS.filter((p) => p.featured);
  const others = PROJECTS.filter((p) => !p.featured);

  const itemBtn = (p: ProjectItem, idx: number) =>
    `<button type="button" class="fin-item" style="--item-acc:var(--p-${p.id}-acc)" data-proj-btn="${p.id}" aria-pressed="${idx === 0 ? 'true' : 'false'}">
      <span class="fin-item-name"><span class="fin-idx num">${String(idx + 1).padStart(2, '0')}</span><i class="fin-dot" aria-hidden="true"></i><span>${p.name}</span></span>
      <small>${p.sub}</small>
    </button>`;

  const nav = `
    <div class="fin-id">
      <span class="wordmark" data-bridge="brand">FightJs</span>
      <span class="who">构建 AI 应用与开发者工具的独立开发者</span>
    </div>
    <nav class="id-links" aria-label="个人身份外链">
      <a href="https://github.com/FightJs" target="_blank" rel="noopener noreferrer">GitHub 主页</a>
      <a href="https://blog.csdn.net/qq_73599840?type=blog" target="_blank" rel="noopener noreferrer">CSDN 博客</a>
    </nav>`;

  const main = `
    <div class="fin-wrap">
      <div class="fin-list" role="region" aria-label="全部 11 个作品名录">
        <div class="fin-head-row">
          <h2 class="fin-title" data-focus>全部 11 个作品</h2>
          <div class="fin-head-meta">
            <span class="fin-kbd" aria-hidden="true">↑↓ 切换</span>
            <span class="fin-count num" data-cur-idx>01 / 11</span>
          </div>
        </div>
        <p class="fin-group">三项重点主线作品</p>
        <div class="fin-items">${featured.map((p, i) => itemBtn(p, i)).join('')}</div>
        <p class="fin-group">八项专项工具与工作台</p>
        <div class="fin-items fin-items-grid">${others.map((p, i) => itemBtn(p, featured.length + i)).join('')}</div>
      </div>
      <article class="fin-detail" data-detail aria-live="polite"></article>
    </div>`;

  const root = buildShell('finale', '全部 11 个作品与外链', nav, main);
  const amb = document.createElement('canvas');
  amb.className = 'ambient';
  amb.setAttribute('aria-hidden', 'true');
  root.prepend(amb);

  const detail = qs(root, '[data-detail]');
  const curIdxEl = qs(root, '[data-cur-idx]');
  const btns = qsa<HTMLButtonElement>(root, '[data-proj-btn]');
  let curId = PROJECTS[0].id;
  let switchScope = new Scope();

  /* ambient interactive constellation + project-switch ripple */
  const ctx = amb.getContext('2d');
  let W = 0, H = 0, D = 1, raf = 0, run = false;
  let pulseR = 0, pulseAlpha = 0;
  const ptr = { x: -999, y: -999 };
  const dots = Array.from({ length: env.low ? 22 : 44 }, (_, i) => ({
    x: (i * 0.6180339887) % 1,
    y: ((i * 0.3819660113) + 0.14) % 1,
    r: 1.3 + (i % 3) * 0.65,
    ph: i * 1.15,
    px: 0,
    py: 0,
  }));

  function drawAmb(t: number) {
    if (!ctx) return;
    ctx.setTransform(D, 0, 0, D, 0, 0);
    ctx.clearRect(0, 0, W, H);
    const col = cssVar(root, '--proj-accent') || cssVar(root, '--color-accent');
    ctx.fillStyle = col;
    ctx.strokeStyle = col;
    const interact = !env.low && !env.reduced;
    for (let i = 0; i < dots.length; i++) {
      const d = dots[i];
      let x = d.x * W + (env.reduced ? 0 : Math.sin(t * 0.00042 + d.ph) * 16);
      let y = d.y * H + (env.reduced ? 0 : Math.cos(t * 0.00036 + d.ph) * 14);
      if (interact) {
        const dx = x - ptr.x, dy = y - ptr.y, d2 = dx * dx + dy * dy;
        if (d2 < 18000) {
          const dist = Math.sqrt(d2) || 1;
          const push = (1 - d2 / 18000) * 18;
          x += (dx / dist) * push;
          y += (dy / dist) * push;
        }
      }
      d.px = x;
      d.py = y;
    }
    if (!env.low) {
      ctx.lineWidth = 1;
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].px - dots[j].px;
          const dy = dots[i].py - dots[j].py;
          const d2 = dx * dx + dy * dy;
          if (d2 < 16900) {
            ctx.globalAlpha = (1 - d2 / 16900) * 0.14;
            ctx.beginPath();
            ctx.moveTo(dots[i].px, dots[i].py);
            ctx.lineTo(dots[j].px, dots[j].py);
            ctx.stroke();
          }
        }
      }
    }
    for (const d of dots) {
      ctx.globalAlpha = 0.28;
      ctx.beginPath();
      ctx.arc(d.px, d.py, d.r, 0, 6.283);
      ctx.fill();
    }
    if (pulseAlpha > 0.005 && !env.reduced) {
      ctx.globalAlpha = pulseAlpha;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(W * 0.64, H * 0.5, pulseR, 0, 6.283);
      ctx.stroke();
      pulseR += Math.max(8, W * 0.014);
      pulseAlpha *= 0.93;
    }
    ctx.globalAlpha = 1;
  }
  function loopAmb(t: number) {
    if (!run) return;
    drawAmb(t);
    raf = requestAnimationFrame(loopAmb);
  }
  function startAmb() {
    if (!ctx || run) return;
    const f = fitCanvas(amb);
    W = f.w; H = f.h; D = f.dpr;
    if (env.reduced) { drawAmb(0); return; }
    run = true;
    raf = requestAnimationFrame(loopAmb);
  }
  const onPtr = (e: PointerEvent) => {
    const r = amb.getBoundingClientRect();
    ptr.x = e.clientX - r.left;
    ptr.y = e.clientY - r.top;
  };
  root.addEventListener('pointermove', onPtr);
  const onResize = () => {
    if (!ctx) return;
    const f = fitCanvas(amb);
    W = f.w; H = f.h; D = f.dpr;
    if (!run) drawAmb(0);
  };
  window.addEventListener('resize', onResize);

  function animateDetail(sc: Scope) {
    if (env.reduced || !sc.alive) return;
    const head = detail.querySelector('.fin-dhead');
    const lede = detail.querySelector('.lede');
    const schem = detail.querySelector('.schem');
    const cols = qsa(detail, '.fin-dl > div');
    const lines = qsa(detail, '.sc-line');
    const acc = qsa(detail, '.sc-pill.acc, .sc-tag.on');
    const links = detail.querySelector('.fin-links');

    reset(head, lede, schem, links, ...cols, ...lines, ...acc);
    void anim(head, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 360 });
    void anim(lede, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 380, delay: 40 });
    void anim(schem, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 420, delay: 80 });
    lines.forEach((l, i) => {
      void anim(l, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 380, delay: 140 + i * 55 });
    });
    acc.forEach((a, i) => {
      void anim(a, [{ transform: 'scale(0.92)' }, { transform: 'scale(1)' }], { duration: 380, delay: 180 + i * 50 });
    });
    cols.forEach((c, i) => {
      void anim(c, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 400, delay: 130 + i * 50 });
    });
    void anim(links, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 380, delay: 220 });
  }

  function renderProject(id: string, animate: boolean) {
    const idx = Math.max(0, PROJECTS.findIndex((x) => x.id === id));
    const p = PROJECTS[idx] ?? PROJECTS[0];
    curId = p.id;
    root.dataset.proj = p.id;
    curIdxEl.textContent = `${String(idx + 1).padStart(2, '0')} / ${PROJECTS.length}`;
    btns.forEach((b) => b.setAttribute('aria-pressed', b.dataset.projBtn === p.id ? 'true' : 'false'));
    detail.innerHTML = `
      <header class="fin-dhead">
        <div class="fin-dtop">
          <span class="fin-badge"><i></i>${p.featured ? '重点主线项目' : '专项作品'} · 主线版本 <code class="num">${p.commit}</code></span>
          <ul class="fin-tags" aria-label="技术组成">${p.stack.map((s) => `<li>${s}</li>`).join('')}</ul>
        </div>
        <h3>${p.name}</h3>
      </header>
      <p class="lede">${p.summary}</p>
      ${renderSchematic(p.previewKind)}
      <dl class="fin-dl">
        <div><dt>解决的问题</dt><dd>${p.problem}</dd></div>
        <div><dt>核心能力与运作</dt><dd>${p.capability}</dd></div>
        <div><dt>工程设计与运行机制</dt><dd>${p.boundary}</dd></div>
      </dl>
      <div class="fin-links">
        <a class="btn btn-primary" href="${p.live}" target="_blank" rel="noopener noreferrer"><span>${p.liveLabel}</span><span aria-hidden="true">↗</span></a>
        <a class="fin-repo-link" href="${p.repo}" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">↗</span><span>GitHub 源码仓库</span></a>
      </div>`;
    if (animate) {
      switchScope.cancel();
      switchScope = new Scope();
      pulseR = 24;
      pulseAlpha = 0.42;
      animateDetail(switchScope);
    }
    if (env.reduced) drawAmb(0);
  }

  btns.forEach((b) => {
    b.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = b.dataset.projBtn;
      if (id && id !== curId) renderProject(id, true);
    });
  });

  const onKey = (e: KeyboardEvent) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const idx = PROJECTS.findIndex((p) => p.id === curId);
    const nextIdx = e.key === 'ArrowDown' ? (idx + 1) % PROJECTS.length : (idx - 1 + PROJECTS.length) % PROJECTS.length;
    renderProject(PROJECTS[nextIdx].id, true);
    btns[nextIdx]?.focus({ preventScroll: true });
  };
  window.addEventListener('keydown', onKey);

  renderProject(PROJECTS[0].id, false);

  return {
    el: root,
    nextLabel: () => '重新体验主线',
    title: () => '全部 11 个作品与外链索引',
    focusEl: () => qs(root, '.fin-title'),
    settled() { startAmb(); },
    async show(_b, _dir, instant) {
      startAmb();
      if (!instant && !env.reduced) {
        btns.forEach((b, i) => {
          reset(b);
          void anim(b, [{ opacity: 0, transform: 'translateX(-12px)' }, { opacity: 1, transform: 'none' }], { duration: 420, delay: 80 + i * 30, fill: 'backwards' });
        });
        reset(detail);
        void anim(detail, [{ opacity: 0, transform: 'translateX(20px)' }, { opacity: 1, transform: 'none' }], { duration: 560, delay: 140, fill: 'backwards' });
        switchScope.cancel();
        switchScope = new Scope();
        animateDetail(switchScope);
      }
    },
    destroy() {
      switchScope.cancel();
      run = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onKey);
    },
  };
}

export const finaleWorld: WorldDef = { id: 'finale', beats: 1, create };
