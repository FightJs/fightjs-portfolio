# FightJs · 沉浸式个人作品集

> **构建 AI 应用与开发者工具的独立开发者**

[![Live Demo](https://img.shields.io/badge/GitHub%20Pages-在线体验-b5e853?style=flat-square&logo=github)](https://fightjs.github.io/fightjs-portfolio/)
[![GitHub](https://img.shields.io/badge/GitHub-FightJs-181717?style=flat-square&logo=github)](https://github.com/FightJs)
[![CSDN](https://img.shields.io/badge/CSDN-技术博客-fc5531?style=flat-square)](https://blog.csdn.net/qq_73599840?type=blog)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646cff?style=flat-square&logo=vite&logoColor=white)](https://vite.dev/)

🔗 **在线访问**：[https://fightjs.github.io/fightjs-portfolio/](https://fightjs.github.io/fightjs-portfolio/)

---

## 作品集设计理念

这是一个**叙事驱动的纯前端沉浸式作品集剧场**，不采用传统的静态卡片网格，而是通过五个连续切换的视觉世界串联完整体验：

```text
开场定位 (open)
   ──▶ 重点项目 I：GraphRAG-Agent (知识图谱与多模态检索)
   ──▶ 重点项目 II：Live Craft 直播间智能搭建系统 (状态机与空间交付)
   ──▶ 重点项目 III：条漫 Agent (小说改编与分镜工作台)
   ──▶ 全部 11 项作品索引与详情总览 (finale)
```

- **全站环境联动切换**：每进入一个重点项目，背景氛围、色彩体系、导航外框与代码重绘的 UI 场景同步切换，通过 `clip-path` 裂隙、虹膜扩散、斜切与翻页转场衔接。
- **纯前端零后端依赖**：全部交互均基于预置数据与前端状态机驱动，不请求真实 AI 接口、不索取 API Key、不嵌入外部参考截图。
- **健壮的交互与降级**：支持点击推进、键盘方向键 / `Space` / `Enter` / `Backspace` 导航、防连击锁、`prefers-reduced-motion` 低动态适配与场景异常兜底。

---

## 重点项目深度介绍（STAR 法则）

### 1. GraphRAG-Agent · 知识图谱与多模态检索问答

> 仓库：[FightJs/GraphRAG-Agent](https://github.com/FightJs/GraphRAG-Agent) ｜ 在线演示：[GitHub Pages](https://fightjs.github.io/GraphRAG-Agent/) ｜ 技术栈：`FastAPI` · `SQLAlchemy Async` · `React 18` · `TypeScript` · `D3` · `Fernet BYOK`

- **Situation（背景）**：私有知识资料往往散落在 PDF、DOCX、XLSX、PPTX、HTML、MD、CSV、TXT 八种异构格式中，传统向量检索仅能做语义切片召回，难以串联跨文档的实体关系与结构化脉络。
- **Task（目标）**：构建一套面向私有资料的全栈知识图谱与问答系统，打通多格式解析、图谱构建与可视化编辑，并为用户提供可追溯依据的多模式问答体验。
- **Action（行动）**：
  - 设计五阶段异步索引编排链路：`多格式解析 → Markdown 规范化 → 分块 → 图谱抽取 → 向量化`。
  - 实现三种检索问答模式：`KG-Only`（基于两跳子图作答）、`RRF Agentic`（启发式子查询拆分结合向量 / 关键词 / 图谱融合检索与片段溯源）以及 `Auto` 模式。
  - 在前端引入 D3 图谱浏览与增量编辑能力，支持流式问答输出与基于 Fernet 加密的 BYOK 凭据校验。
- **Result（结果）**：形成“散落文档 → 实体关系图谱 → 检索与有依据回答”的完整演示闭环。*(注：公开 Pages 为虚构示例；子查询拆分为启发式规则而非 LLM 自主规划；KG-Only 模式仅依据图谱结构作答，不提供文档片段溯源。)*

---

### 2. 直播间智能搭建系统（Live Craft）· 对话采集到交付包

> 仓库：[FightJs/intelligent-customer-service](https://github.com/FightJs/intelligent-customer-service) ｜ 在线演示：[GitHub Pages](https://fightjs.github.io/intelligent-customer-service/) ｜ 技术栈：`React 19` · `FastAPI` · `SQLite` · `Qdrant` · `State Machine` · `Pipeline`

- **Situation（背景）**：传统直播间搭建高度依赖人工反复沟通与零散报价，客户口述的场地、预算与品类需求很难直接沉淀为结构化、可执行的设备与空间方案。
- **Task（目标）**：设计一条从多轮对话采集到多模态交付物生成的自动化智能管线，让需求收敛过程可追踪、方案生成有据可依。
- **Action（行动）**：
  - 构建基于调研表状态机的客服 Agent，支持结构化槽位采集、跑题纠偏与跨会话断点续接，输出唯一需求真相源 `form_state`。
  - 构建方案 Agent，结合 Qdrant 向量检索与知识关系检索生成标准化 `plan.json`。
  - 实现下游多媒体交付管线，从方案自动派生 PDF 报告、0°/120°/240° 三机位空间视图、预览视频及 ZIP 交付包。
- **Result（结果）**：打通“零散口述需求 → 结构化 `form_state` → 设备预算 `plan.json` → 空间视图与交付包”的端到端架构演示。*(注：公开页面与 mock 媒体管线用于流程展示，不代表真实供应商全链路交付验收，亦不等同于已上线商业咨询系统。)*

---

### 3. 条漫 Agent（comic-agent）· 小说改编与分镜创作工作台

> 仓库：[FightJs/comic-agent](https://github.com/FightJs/comic-agent) ｜ 在线演示：[GitHub Pages](https://fightjs.github.io/comic-agent/) ｜ 技术栈：`React` · `TypeScript` · `Tiptap` · `Konva` · `FastAPI` · `SQLite` · `Pi SDK`

- **Situation（背景）**：小说改编条漫跨越长文本拆解、人物与场景设定、逐格分镜脚本以及多轮画面返修，创作者在多个独立工具间来回搬运极易丢失上下文与修改版本。
- **Task（目标）**：打造一个本地化的一体化条漫创作工作台，将原著整理、AI 辅助候选生成与人工审查批注收束在同一工作流中。
- **Action（行动）**：
  - 在本机通过 SQLite 持久化管理原著版本与卷章摘要，引入知识图谱与骨架细纲梳理设定。
  - 设计“AI 产出待采用候选 → 人工确认入正稿”的审慎协作机制，避免模型输出直接覆盖创作者资产。
  - 基于 Tiptap 与 Konva 构建脚本编辑与图片工作区，支持画布点选/框选、保护区标注、候选画面对比与检查点恢复。
- **Result（结果）**：完成首版本机条漫工作台六阶段架构与交互界面。*(注：公开 Pages 为六阶段合成示例只读导航；真实文本链路已完成小样验证，真实生图测试曾遇上游 HTTP 429 限流，尚未完成长篇端到端视觉实测。)*

---

## 全部 11 项作品全景（STAR 法则）

### 4. DocAuditAgent · 可审计的文档审核工作台

> 仓库：[FightJs/DocAuditAgent](https://github.com/FightJs/DocAuditAgent) ｜ 在线演示：[GitHub Pages](https://fightjs.github.io/DocAuditAgent/) ｜ 技术栈：`FastAPI` · `React` · `TypeScript` · `SDD 规范驱动` · `幂等修订控制`

- **Situation**：传统文档审核系统常将“材料上传完成”或“自动风险扫描”直接等同于审批通过，高风险合同条款缺乏不可变版本绑定与可回溯的审计轨迹。
- **Task**：用规范驱动开发（SDD）构建一个严格区分“自动风险检出”与“人工授权审批决定”的可审计工作台。
- **Action**：实现不可变文档版本上传与附件绑定，展示审核运行状态、风险项及原文证据定位；在状态契约中强制要求先处置必处置风险项，并在有效基线与 `expected_revision` 幂等校验下提交人工决定。
- **Result**：建立起语义清晰、防并发覆盖的文档审核 MVP 工作流，确保 `approved` 决定仅能由授权人员在有效证据上下文中作出。

### 5. vertical-comic-skills · 条漫逐格生产 Skill 五件套

> 仓库：[FightJs/vertical-comic-skills](https://github.com/FightJs/vertical-comic-skills) ｜ 发布页：[Releases](https://github.com/FightJs/vertical-comic-skills/releases/latest) ｜ 技术栈：`Agent Skills` · `Python` · `冻结 RV 协议` · `ZIP 交接校验`

- **Situation**：多阶段或多 Agent 协同制作条漫时，提示词规范、画风基准与资产版本极易在流转过程中发生漂移。
- **Task**：将条漫逐格生产流程拆解为标准化、可复用的 Agent Skills，并建立严格的阶段交接契约。
- **Action**：设计涵盖“视觉基准 → 镜头设计 → 并行生图 → 阶段审查 → 分工 ZIP 交接”的五件套 Skill，提供接包生产入口以自动校验、解压并绑定本地冻结生产版本（RV）。
- **Result**：规范了从已批准脚本到独立逐格图片产出的全流程交接校验。*(注：聚焦逐格出图与交接核验，不包含长条拼接、气泡排版或 PSD 收尾。)*

### 6. BossHunter · 岗位采集、评分与投递跟踪台

> 仓库：[FightJs/BossHunter](https://github.com/FightJs/BossHunter) ｜ 项目主页：[GitHub Pages](https://fightjs.github.io/BossHunter/) ｜ 技术栈：`Python` · `Chrome Automation` · `本地工作台` · `并行评分队列`

- **Situation**：求职过程中手动跨页筛选岗位耗时费力，而完全无人值守的自动海投又容易误投不匹配岗位。
- **Task**：构建一个兼顾批量筛选效率与人工最终把关的本地求职自动化控制台。
- **Action**：在 v2.4.0 并行工作台中实现职位采集、并行 AI 评分与招呼语生成的独立或并行调度，支持岗位池多维筛选、XLSX 导出，并将“人工确认”设为投递前的必要关卡。
- **Result**：形成可本地可视化掌控的求职筛选与投递跟踪工作流（需配合本地 Chrome 环境与人工确认环节运行）。

### 7. Stillscape · 静观 · 浏览器动态壁纸与三维艺术画廊

> 仓库：[FightJs/stillscape](https://github.com/FightJs/stillscape) ｜ 在线画廊：[GitHub Pages](https://fightjs.github.io/stillscape/) ｜ 技术栈：`WebGL` · `Three.js` · `Shader` · `统一播放器` · `纯静态部署`

- **Situation**：静态图片画廊难以展现实时光影与空间呼吸感，而重型桌面壁纸客户端又无法让用户在浏览器中即点即看。
- **Task**：打造一个无需后端或客户端安装、在浏览器内即可沉浸体验的动态艺术画廊。
- **Action**：基于 WebGL 与 Three.js Shader 构建统一场景播放器，创作并收录 26 款绘画、动漫意境与实时三维场景（含《午夜超驰》《星环远征》《棱镜回廊》《托斯卡纳的呼吸》等）。
- **Result**：实现纯前端静态部署、开箱即用的 26 款动态艺术作品在线画廊。

### 8. SVG Review Pack · SVG 优化像素差异对比与审阅包导出

> 仓库：[FightJs/svg-review-pack](https://github.com/FightJs/svg-review-pack) ｜ 在线工具：[GitHub Pages](https://fightjs.github.io/svg-review-pack/) ｜ 技术栈：`TypeScript` · `SVGO 4.1.0` · `pixelmatch 8.0.0` · `Canvas Diff` · `ZIP Export`

- **Situation**：SVG 压缩优化在缩减文件体积的同时，常在 `transform-origin`、渐变或路径精度上引入肉眼难以察觉的渲染偏移。
- **Task**：提供一个在浏览器本地即可完成 SVG 优化前后视觉回归比对与证据归档的工具。
- **Action**：集成 SVGO 4.1.0 与 pixelmatch 8.0.0，在 `128×128` 同等画布条件下并行渲染原图、优化图与红区像素差异（DIFF），并支持一键导出可复现验证的审阅 ZIP 包。
- **Result**：让前端与设计团队无需配置本地脚本即可在浏览器内直观核查 SVG 优化失真并留存审阅凭证。

### 9. Zod Upgrade Gotchas · Zod 3 与 Zod 4 真实解析差异实验室

> 仓库：[FightJs/zod-upgrade-gotchas](https://github.com/FightJs/zod-upgrade-gotchas) ｜ 在线对比：[GitHub Pages](https://fightjs.github.io/zod-upgrade-gotchas/) ｜ 技术栈：`TypeScript` · `Zod 3.25.76` · `Zod 4.6.7` · `双版本沙箱对比`

- **Situation**：从 Zod 3 升级至 Zod 4 时，诸如 `.partial()` 下的 `.default()` 注入、安全整数边界与枚举键解析等细微行为变化，可能在无报错的情况下悄悄改变最终入库数据。
- **Task**：构建一个让开发者在浏览器里直接运行双版本真实包、眼见为实对比升级陷阱的交互实验室。
- **Action**：通过 npm 别名在前端同时引入真实 `Zod 3.25.76` 与 `Zod 4.6.7`，支持实时编辑 JSON 输入、双版本同步执行对比、一键复制独立 Node.js 复现代码及分享预设案例链接。
- **Result**：清晰可视化三类已核实的典型升级解析差异，降低团队升级 Zod 大版本的排查成本。

### 10. Precache Lens · Vite 构建清单与 Workbox 预缓存交叉分析

> 仓库：[FightJs/precache-lens](https://github.com/FightJs/precache-lens) ｜ 在线工具：[GitHub Pages](https://fightjs.github.io/precache-lens/) ｜ 技术栈：`TypeScript` · `Vite Manifest 解析` · `Workbox 清单分析` · `静态图遍历`

- **Situation**：前端将重型模块拆分为动态 chunk 后，PWA 的 Service Worker 仍可能在安装阶段将该文件预缓存，仅靠阅读源码很难定位隐藏的静态引用链。
- **Task**：开发一款纯本地静态分析工具，交叉比对 Vite 构建产物清单与 Workbox 预缓存清单，追溯文件被预缓存的真实原因。
- **Action**：实现前端本地读取 `manifest.json` 与 Workbox 清单的静态图遍历引擎，自动标注 `Static entry path`、`Dynamic path`、`No known Vite link` 与 `Uncertain` 四类状态，并还原从入口到目标产物的完整引用链路。
- **Result**：在不上传源码、不执行 Service Worker 脚本的前提下，帮助开发者快速定位 PWA 预缓存体积膨胀的根因。

### 11. codex-mobile · 浏览器与移动端 Termux 的 Codex 界面

> 仓库：[FightJs/codex-mobile](https://github.com/FightJs/codex-mobile) ｜ 项目演示：[GitHub Pages](https://fightjs.github.io/codex-mobile/) ｜ 技术栈：`Node.js` · `Web UI` · `codex-app-server` · `Termux 适配`

- **Situation**：命令行编码代理在移动端或跨设备场景下缺乏直观的项目浏览、会话管理与文件差异审阅体验。
- **Task**：为 Codex 工作流提供一套轻量、可在桌面浏览器与 Android Termux 环境下运行的 Web 界面。
- **Action**：构建连接本地 `codex-app-server` 的 Web UI，支持在浏览器中浏览项目目录、发起编码任务与查看文件修改，并针对移动端 Termux 使用场景进行适配。
- **Result**：让开发者在手机或平板浏览器中也能便捷操控本地 Codex 编码工作流。

---

## 本地开发与构建

```bash
# 进入站点目录
cd site

# 安装依赖
npm install

# 启动本地开发服务器 (http://127.0.0.1:4173)
npm run dev

# 类型检查与生产构建 (输出至 site/dist)
npm run build

# 本地预览构建产物
npm run preview
```

---

## 目录结构

```text
.
├── .github/workflows/
│   └── deploy-pages.yml      # GitHub Actions 自动构建并部署至 GitHub Pages
├── site/                     # 作品集前端工程 (Vite + TypeScript)
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts        # 配置 base: './' 适配 GitHub Pages 子路径
│   └── src/
│       ├── main.ts           # 入口启动
│       ├── story.ts          # 五幕主线状态机、转场动画与键盘/降级控制
│       ├── narr.ts           # 叙事节奏与文案辅助
│       ├── env.ts            # 动效、Canvas 适配与环境检测
│       ├── styles/           # 设计令牌、全局样式与多世界主题样式
│       └── worlds/           # 五个沉浸式世界：open / graph / studio / comic / finale
├── 01-开发需求.md             # 需求规格文档
├── 02-项目资料索引.md         # 项目事实边界与链接索引
├── 03-给Claude的启动提示词.md  # 交接提示词
├── 素材清单.json              # 资料与素材状态清单
└── README.md                 # 本文件
```
