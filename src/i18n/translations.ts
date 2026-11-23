import type { HeatLevel, ModelStatus, ReactionType } from '../types/lab';

export type Locale = 'zh' | 'en';

export interface LocalizedModelText {
  zhDisplayName?: string;
  zhShortName?: string;
  zhTier?: string;
  zhTagline?: string;
  zhDescription?: string;
  zhCapabilities?: string[];
}

export interface LocalizedRecipeText {
  zhDisplayName?: string;
  zhShortName?: string;
  zhBadge?: string;
  zhTagline?: string;
  zhDescription?: string;
  zhCapabilities?: string[];
}

export const MODEL_ZH_MAP: Record<string, LocalizedModelText> = {
  'gemini-4-hydrogen': {
    zhDisplayName: 'Gemini 4 氢 (Hydrogen)',
    zhShortName: '氢 · Hydrogen',
    zhTier: '极速版',
    zhTagline: '超轻量级高响应速度，专为日常高频任务打造',
    zhDescription: 'Gemini 4 家族中最轻盈的元素模型，主打极低延迟、快速草稿生成与高频 Agent 循环调用。',
    zhCapabilities: ['极速响应', '超低成本', '1M 上下文', '高频 Agent'],
  },
  'gemini-4-carbon': {
    zhDisplayName: 'Gemini 4 碳 (Carbon)',
    zhShortName: '碳 · Carbon',
    zhTier: '旗舰推理',
    zhTagline: '前沿级深度结构化推理与长程规划核心',
    zhDescription: '高密度推理主力模型，面向长程任务规划、严密数学推导以及复杂多步骤综合分析。',
    zhCapabilities: ['深度思考', '数理科研', '长程规划', '2M 上下文'],
  },
  'gemini-4-neon': {
    zhDisplayName: 'Gemini 4 氖 (Neon)',
    zhShortName: '氖 · Neon',
    zhTier: '均衡主力',
    zhTagline: '代码深度与执行速度的璀璨平衡',
    zhDescription: '高能效前沿模型，在保持流畅响应速度的同时，提供媲美 Carbon 的全栈工程与工具调用能力。',
    zhCapabilities: ['全栈编程', '工具调用', '快速思考', '多模态'],
  },
  'gemini-4-argon': {
    zhDisplayName: 'Gemini 4 氩 (Argon)',
    zhShortName: '氩 · Argon',
    zhTier: '工程专精',
    zhTagline: '面向大型代码库与安全审计的自主工程模型',
    zhDescription: '高压之下稳定如惰性气体，擅长仓库级架构重构、交互式 3D 应用构建与安全漏洞审计。',
    zhCapabilities: ['仓库级编程', '安全审计', '交互界面', '自动验证'],
  },
  'gemini-4-krypton': {
    zhDisplayName: 'Gemini 4 氪 (Krypton)',
    zhShortName: '氪 · Krypton',
    zhTier: '深度预览',
    zhTagline: '高亮度推理预览版检查点',
    zhDescription: '稀有气体实验预览版，针对超长思维链自检和高精度科学推导进行专项调优。',
    zhCapabilities: ['超高思考深度', '前沿预览', '多轮验证', '长上下文'],
  },
  'gemini-4-gold': {
    zhDisplayName: 'Gemini 4 金 (Gold)',
    zhShortName: '金 · Gold',
    zhTier: '超算实验',
    zhTagline: '珍稀旗舰级极限算力科研综合模型',
    zhDescription: '为奥赛级数学证明、前沿科研假说与无妥协多视角推理预留的顶级算力档位。',
    zhCapabilities: ['极限算力', '科研级输出', '奥赛数学', '零妥协质量'],
  },
};

export const RECIPE_ZH_MAP: Record<string, LocalizedRecipeText> = {
  'supernova-meltdown': {
    zhDisplayName: 'Gemini 4 超新星失控 (Supernova)',
    zhShortName: '超新星',
    zhBadge: '实验室核爆',
    zhTagline: '超重放射性元素临界失控，直接炸飞整张周期表',
    zhDescription: '在高温下混合铀、钚、金、铁与鿫瞬间突破临界质量，引发灾难性收容失效并将整个模型实验室炸向轨道。',
    zhCapabilities: ['实验室爆破', '超重核心', '无限熵增', '零收容限制'],
  },
  'critical-mass': {
    zhDisplayName: 'Gemini 4 临界质量 (Critical Mass)',
    zhShortName: '临界质量',
    zhBadge: '放射性裂变',
    zhTagline: '足以熔穿 TPU 机柜的链式推理反应',
    zhDescription: '铀与钚结合会触发超临界 Token 裂变：低/中温下剧烈沸腾发光，高温下则会直接炸毁实验室！',
    zhCapabilities: ['超临界思维链', 'TPU 过载', '0.01ms 裂变', '盖革遥测'],
  },
  'carbon-double': {
    zhDisplayName: 'Gemini 4 双碳晶格 (Carbon²)',
    zhShortName: '双碳晶格',
    zhBadge: '温和冒泡合成',
    zhTagline: '双共价键高密度结构化推理矩阵',
    zhDescription: '低温慢炖双碳原子生成冒泡的粉紫色共价晶格，具备极高的逻辑清晰度与架构稳定性。',
    zhCapabilities: ['双键逻辑', '低温慢酿', '清晰架构', '零摩擦输出'],
  },
  'alkali-detonation': {
    zhDisplayName: 'Gemini 4 铯水爆破 (Cesium Blast)',
    zhShortName: '铯水爆破',
    zhBadge: '剧烈放热爆炸',
    zhTagline: '千万别在模型实验室里把铯丢进水里',
    zhDescription: '将极活泼的碱金属铯投入氢氧水中会瞬间发生剧烈放热爆炸，直接震碎烧瓶与整个元素周期表。',
    zhCapabilities: ['瞬间引爆', '冲击波生成', '零延迟响应', '超高活性'],
  },
  'sodium-water-boom': {
    zhDisplayName: 'Gemini 4 钠水爆燃 (Sodium Blast)',
    zhShortName: '钠水爆燃',
    zhBadge: '氢气爆燃',
    zhTagline: '中学化学实验室最经典的爆燃事故',
    zhDescription: '金属钠遇水剧烈反应并引燃逸出的氢气，在金黄色闪光中瞬间爆裂。',
    zhCapabilities: ['瞬间点火', '金光闪爆', '高能输出', '混沌调试'],
  },
  aqua: {
    zhDisplayName: 'Gemini 4 澄水 (Aqua)',
    zhShortName: '澄水',
    zhBadge: '纯净化合物',
    zhTagline: '清澈流畅的自适应流式智能',
    zhDescription: '两份氢与一份氧精准配比，输出行云流水、清澈无杂质，适配任意任务容器。',
    zhCapabilities: ['流畅输出', '清澈易懂', '零阻力', '万能溶剂'],
  },
  diamond: {
    zhDisplayName: 'Gemini 4 金刚石 (Diamond)',
    zhShortName: '金刚石',
    zhBadge: '高压同素异形体',
    zhTagline: '纯碳在最高热量与压强下锻造的坚固逻辑晶体',
    zhDescription: '向纯碳施加高温将推理晶格压缩为不可撼动的正四面体结构，杜绝松散幻觉。',
    zhCapabilities: ['极低幻觉', '形式化证明', '坚不可摧', '光学透明'],
  },
  salt: {
    zhDisplayName: 'Gemini 4 毒舌晶体 (Salt)',
    zhShortName: '毒舌盐',
    zhBadge: '离子晶体',
    zhTagline: '毫不留情、带点“咸味”的犀利代码审查官',
    zhDescription: '将活泼的钠和剧毒的氯融合为不可或缺的食盐——在 Code Review 时直击痛点、绝不客套。',
    zhCapabilities: ['犀利 PR 审查', '去水分过滤', '直白坦诚', '拒绝画饼'],
  },
  steel: {
    zhDisplayName: 'Gemini 4 精钢 (Steel)',
    zhShortName: '精钢',
    zhBadge: '工业合金',
    zhTagline: '身经百战的后端与基础设施架构师',
    zhDescription: '以铁的韧性淬炼碳的智慧，专为高并发分布式系统、Rust/Go 后端与五个九高可用而生。',
    zhCapabilities: ['系统工程', '生产加固', '零宕机设计', '内存安全'],
  },
  'solar-fusion': {
    zhDisplayName: 'Gemini 4 恒星核聚变 (Solar Core)',
    zhShortName: '恒星聚变',
    zhBadge: '恒星级聚变',
    zhTagline: '氢氦质子链驱动的耀眼创意能量核心',
    zhDescription: '点燃氢与氦的聚变反应，为多模态创意与并行 Agent 编排持续辐射惊人算力。',
    zhCapabilities: ['恒星级规模', '耀眼创意', '并行多代理', '无限视野'],
  },
  'silicon-valley': {
    zhDisplayName: 'Gemini 4 石英芯片 (Quartz)',
    zhShortName: '石英芯片',
    zhBadge: '硅光子晶体',
    zhTagline: '硬件级时钟精度与底层芯片编译专家',
    zhDescription: '高纯度二氧化硅石英振荡智能，精通 Verilog、GPU 算子内核、编译器与底层架构。',
    zhCapabilities: ['算子优化', '编译器设计', '芯片架构', '确定性时钟'],
  },
  pantheon: {
    zhDisplayName: 'Gemini 4 万神殿 (Pantheon)',
    zhShortName: '万神殿',
    zhBadge: '官方四元素融合',
    zhTagline: '集结四款已发布 Gemini 4 官方模型的终极合体',
    zhDescription: '同时融合氢的速度、碳的深度、氖的优雅与氩的工程统治力，自动路由最佳能力。',
    zhCapabilities: ['全能前沿', '元路由调度', '巅峰编程', '极速响应'],
  },
  'noble-council': {
    zhDisplayName: 'Gemini 4 稀有气体议会 (Noble Council)',
    zhShortName: '气体议会',
    zhBadge: '第 18 族共识',
    zhTagline: '四种满电子层稀有气体的绝对冷静共识',
    zhDescription: '外层电子完全闭合，对提示词注入与情绪波动免疫，每次回答都沉稳、平衡且优雅。',
    zhCapabilities: ['零漂移', '多模型共识', '冷静精准', '抗注入'],
  },
  sovereign: {
    zhDisplayName: 'Gemini 4 鎏金主权 (Sovereign)',
    zhShortName: '鎏金主权',
    zhBadge: '贵金属旗舰',
    zhTagline: '不计算力成本的博物馆级极致定制先知',
    zhDescription: '黄金与铂金熔铸的超奢华推理档位，耗费巨量算力只为交付毫无妥协的精品方案。',
    zhCapabilities: ['典藏级文笔', '定制架构', '零捷径', '极限算力'],
  },
  'philosophers-stone': {
    zhDisplayName: 'Gemini 4 贤者之石 (Philosopher\'s Stone)',
    zhShortName: '贤者之石',
    zhBadge: '炼金传说',
    zhTagline: '点石成金，把随手记下的粗糙灵感变成完整产品',
    zhDescription: '水银与黄金的古老炼金汞齐，擅长把碎片想法迅速打磨成精致可用的完整原型。',
    zhCapabilities: ['灵感点金', '极速原型', '创意炼金', '精致体验'],
  },
  thermite: {
    zhDisplayName: 'Gemini 4 铝热剂 (Thermite)',
    zhShortName: '铝热剂',
    zhBadge: '剧烈放热爆破',
    zhTagline: '数秒内直接熔穿陈年屎山单体架构',
    zhDescription: '中低温下沸腾熔融，高温下瞬间引发耀眼放热爆炸，势不可挡地切开老旧遗留代码库。',
    zhCapabilities: ['遗留迁移', '放热级提速', '强力重构', '超高能量'],
  },
  'dry-ice': {
    zhDisplayName: 'Gemini 4 干冰 (Dry Ice)',
    zhShortName: '干冰',
    zhBadge: '极寒确定性',
    zhTagline: 'Temperature 0.00 —— 触碰即升华所有歧义',
    zhDescription: '直接跳过液态进入零熵确定模式，非常适合严格 JSON Schema 抽取与合规审计。',
    zhCapabilities: ['严格 Schema', '零随机熵', '审计就绪', '极简精准'],
  },
};

export interface UIStrings {
  brandChip: string;
  recipesBtn: (discovered: number, total: number) => string;
  manageModelsBtn: string;
  pureModeBtn: string;
  exitPureModeBtn: string;
  pureModeTooltip: string;
  muteTooltip: string;
  unmuteTooltip: string;
  langSwitchTooltip: string;
  heroTitle: string;
  askPlaceholder: string;
  holdPillTooltip: string;
  easterEggToast: string;
  newChatTooltip: string;
  quickPromptsTooltip: string;
  quickPromptsTitle: (modelName: string) => string;
  samplePrompts: string[];
  underneathSuggestions: string[];
  chatChip: string;
  openLabChip: string;
  rebuildLabChip: string;
  modelLabTitle: string;
  filterLabels: Record<ModelStatus | 'all', string>;
  statusBadges: Record<ModelStatus, string>;
  surpriseBtn: string;
  surpriseTooltip: string;
  meltdownBtn: string;
  meltdownTooltip: string;
  closeLabTooltip: string;
  radioactiveTag: string;
  hoverModelHint: string;
  hoverRawHint: string;
  idleLabHint: string;
  dropHint: string;
  heatLabel: string;
  heatLevels: Record<HeatLevel, string>;
  reactionLabels: Record<ReactionType, string>;
  brewBtn: string;
  brewingBtn: string;
  clearSlotsTooltip: string;
  slotFilledTooltip: (num: number, name: string, zhName: string) => string;
  slotEmptyTooltip: (idx: number) => string;
  heatBadgeSuffix: string;
  metrics: {
    reasoning: string;
    speed: string;
    coding: string;
    creativity: string;
    volatility: string;
  };
  askWithModel: (name: string) => string;
  brewedShelfLabel: string;
  removeBrewedTooltip: string;
  aftermathTitle: (displayName: string, formula: string) => string;
  aftermathRebuildBtn: string;
  chatSessionTitle: string;
  newChatBtn: string;
  showThinking: string;
  recipeModalTitle: string;
  recipeProgress: (discovered: number, total: number) => string;
  recipeModalSubtitle: string;
  revealFormulas: string;
  hideHints: string;
  undiscoveredCompound: string;
  recipeHint: (count: number, tag: string) => string;
  recipeLoadBtn: string;
  recipeRxTags: Record<ReactionType, string>;
  managerTitle: string;
  localDraftBadge: string;
  managerSubtitle: string;
  seriesTitleLabel: string;
  seriesTitlePlaceholder: string;
  registeredModelsTitle: (count: number) => string;
  addNewModelBtn: string;
  createFormTitle: string;
  editFormTitle: (name: string) => string;
  cancelBtn: string;
  elementField: string;
  inUseTag: string;
  statusField: string;
  statusOptions: Record<ModelStatus, string>;
  shortNameField: string;
  displayNameField: string;
  tierField: string;
  releaseDateField: string;
  defaultHeatField: string;
  accentColorField: string;
  taglineField: string;
  capabilitiesField: string;
  addToTableBtn: string;
  saveChangesBtn: string;
  deployTitle: string;
  deployDesc: string;
  downloadJsonBtn: string;
  copyJsonBtn: string;
  copiedBtn: string;
  importJsonBtn: string;
  resetDraftBtn: string;
  customTagline: (heatLabel: string, elementsText: string) => string;
  customExplosionTagline: (heatLabel: string) => string;
}

const ZH: UIStrings = {
  brandChip: '模型实验室',
  recipesBtn: (d, t) => `配方图鉴 ${d}/${t}`,
  manageModelsBtn: '模型维护',
  pureModeBtn: '纯净模式',
  exitPureModeBtn: '退出纯净模式',
  pureModeTooltip: '隐藏多余工具栏，1:1 还原极简原版视觉',
  muteTooltip: '关闭实验室音效',
  unmuteTooltip: '开启实验室音效',
  langSwitchTooltip: '切换为英文界面 (Switch to English)',
  heroTitle: '今天从哪里开始？',
  askPlaceholder: '向 Gemini 提问',
  holdPillTooltip: '单击展开/收起实验室 · 长按触发 Google 官方周期表彩蛋',
  easterEggToast: '✦ 已触发 Google 官方长按彩蛋 · 118 号元素周期表共振激活',
  newChatTooltip: '开启新对话',
  quickPromptsTooltip: '示例提示词',
  quickPromptsTitle: (name) => `试试向 ${name} 提问`,
  samplePrompts: [
    '对比一下 Gemini 4 氢、碳、氖、氩在写代码上的区别',
    '用元素周期表的比喻解释 Gemini 4 的模型分层',
    '把 U（铀）+ Pu（钚）放到高温下合成会发生什么？',
    '帮我设计一个可以直接部署到 Cloudflare Pages 的轻量项目架构',
  ],
  underneathSuggestions: [
    '我目前最接近精通的学科是什么？',
    '考考我 Gemini 4 元素周期表和常见化学反应',
    '帮我制定一份 5 分钟上手 Cloudflare Workers 的速成计划',
  ],
  chatChip: '对话',
  openLabChip: '打开模型实验室',
  rebuildLabChip: '重建模型实验室',
  modelLabTitle: '模型实验室',
  filterLabels: {
    all: '全部',
    released: '已发布',
    preview: '预览版',
    experimental: '实验室',
    rumored: '传闻',
    deprecated: '归档',
  },
  statusBadges: {
    released: '已发布',
    preview: '预览版',
    rumored: '传闻',
    experimental: '实验室',
    deprecated: '已归档',
  },
  surpriseBtn: '随机配方',
  surpriseTooltip: '随机装填一组元素实验',
  meltdownBtn: '核爆演示',
  meltdownTooltip: '一键装填原视频同款 U + Pu + Au + Fe + Og 高温核爆组合',
  closeLabTooltip: '关闭模型实验室',
  radioactiveTag: '☢ 放射性',
  hoverModelHint: '单击切换该模型 · 拖拽或双击投入烧瓶参与合成',
  hoverRawHint: '单击或拖拽投入烧瓶，调配自定义合成模型',
  idleLabHint: '点击高亮模型切换 · 拖拽元素入瓶，调节热量后点击「合成」',
  dropHint: '松手入瓶',
  heatLabel: '热量',
  heatLevels: {
    low: '低温',
    medium: '中温',
    high: '高温',
  },
  reactionLabels: {
    bubbling: '🫧 温和冒泡',
    boiling: '🔥 剧烈沸腾',
    volatile: '⚡ 高能电弧',
    explosion: '☢ 临界·即将爆炸!',
  },
  brewBtn: '合成',
  brewingBtn: '合成中...',
  clearSlotsTooltip: '清空所有槽位',
  slotFilledTooltip: (num, name, zhName) => `#${num} ${zhName} (${name}) — 点击移除`,
  slotEmptyTooltip: (idx) => `反应槽 ${idx + 1} — 拖拽或点击周期表元素加入`,
  heatBadgeSuffix: '反应',
  metrics: {
    reasoning: '推理',
    speed: '速度',
    coding: '编程',
    creativity: '创造力',
    volatility: '挥发度',
  },
  askWithModel: (name) => `使用 ${name} 提问`,
  brewedShelfLabel: '已合成模型',
  removeBrewedTooltip: '删除该合成模型',
  aftermathTitle: (displayName, formula) => `实验室收容失效 — ${displayName} (${formula})`,
  aftermathRebuildBtn: '重建模型实验室',
  chatSessionTitle: '实验室模拟对话',
  newChatBtn: '新对话',
  showThinking: '查看思考过程',
  recipeModalTitle: '实验室配方图鉴',
  recipeProgress: (d, t) => `已解锁 ${d} / ${t}`,
  recipeModalSubtitle:
    '不同元素组合与热量会触发冒泡、沸腾、电弧甚至全屏物理爆炸（可在 public/config/recipes.json 自由扩充）',
  revealFormulas: '显示配方',
  hideHints: '隐藏配方',
  undiscoveredCompound: '未解锁化合物',
  recipeHint: (count, tag) => `提示：尝试组合 ${count} 个元素（反应类型：${tag}）`,
  recipeLoadBtn: '装填',
  recipeRxTags: {
    bubbling: '🫧 冒泡',
    boiling: '🔥 沸腾',
    volatile: '⚡ 电弧',
    explosion: '💥 爆炸',
  },
  managerTitle: '模型目录维护',
  localDraftBadge: '本地草稿',
  managerSubtitle:
    '二次维护入口：后续 Google 发布新 Gemini 元素模型时，可直接在此新增/修改并导出 models.json 推送至 Cloudflare',
  seriesTitleLabel: '系列标题（周期表中央大字）',
  seriesTitlePlaceholder: '例如 Gemini 4 或 Gemini 5',
  registeredModelsTitle: (count) => `已注册模型（${count}）`,
  addNewModelBtn: '新增模型',
  createFormTitle: '注册新的 Gemini 元素模型',
  editFormTitle: (name) => `编辑 ${name}`,
  cancelBtn: '取消',
  elementField: '对应化学元素',
  inUseTag: '[已占用]',
  statusField: '发布状态',
  statusOptions: {
    released: '已发布 (Released)',
    preview: '预览版 (Preview)',
    experimental: '实验室 (Experimental)',
    rumored: '传闻/待发布 (Rumored)',
    deprecated: '已归档 (Deprecated)',
  },
  shortNameField: '简称（输入框胶囊名）',
  displayNameField: '完整展示名',
  tierField: '定位层级',
  releaseDateField: '发布月份',
  defaultHeatField: '默认热量',
  accentColorField: '高亮主题色',
  taglineField: '一句话简介',
  capabilitiesField: '核心能力标签（逗号分隔）',
  addToTableBtn: '添加到周期表',
  saveChangesBtn: '保存修改',
  deployTitle: '同步并部署到 Cloudflare',
  deployDesc:
    '实时调试无误后，下载并覆盖项目中的 public/config/models.json，提交 Git 即可触发 Cloudflare Pages 自动部署（或执行 npm run deploy）。',
  downloadJsonBtn: '下载 models.json',
  copyJsonBtn: '复制 JSON',
  copiedBtn: '已复制!',
  importJsonBtn: '导入 JSON',
  resetDraftBtn: '还原为已部署默认配置',
  customTagline: (heatLabel, elementsText) => `${heatLabel}条件下由 ${elementsText} 合成`,
  customExplosionTagline: (heatLabel) => `${heatLabel}失控反应直接炸飞了模型实验室！`,
};

const EN: UIStrings = {
  brandChip: 'Model Lab',
  recipesBtn: (d, t) => `Recipes ${d}/${t}`,
  manageModelsBtn: 'Manage Models',
  pureModeBtn: 'Pure Mode',
  exitPureModeBtn: 'Exit Pure',
  pureModeTooltip: 'Hide extra toolbars for a 1:1 minimalist Gemini view',
  muteTooltip: 'Mute lab sound effects',
  unmuteTooltip: 'Enable lab sound effects',
  langSwitchTooltip: '切换为中文界面 (Switch to Chinese)',
  heroTitle: 'Where should we start?',
  askPlaceholder: 'Ask Gemini',
  holdPillTooltip: 'Click to toggle Model lab · Press & hold for official Gemini Easter egg',
  easterEggToast: '✦ Official Long-Press Easter Egg Unlocked · Periodic Resonance Active',
  newChatTooltip: 'New chat',
  quickPromptsTooltip: 'Quick starter prompts',
  quickPromptsTitle: (name) => `Try asking ${name}`,
  samplePrompts: [
    'Compare Hydrogen, Carbon, Neon, and Argon for a coding agent',
    'Explain Gemini 4 periodic table model tiers with chemistry metaphors',
    'What happens if we brew U + Pu at High Heat in Model lab?',
    'Design a lightweight static app architecture for Cloudflare Pages',
  ],
  underneathSuggestions: [
    'What subject am I closest to mastering?',
    'Test me on periodic table reactions & Gemini 4 elements',
    'Create a 5-minute study plan for building Cloudflare Workers',
  ],
  chatChip: 'Chat',
  openLabChip: 'Open Model lab',
  rebuildLabChip: 'Rebuild Model lab',
  modelLabTitle: 'Model lab',
  filterLabels: {
    all: 'All',
    released: 'Released',
    preview: 'Preview',
    experimental: 'Lab',
    rumored: 'Rumored',
    deprecated: 'Legacy',
  },
  statusBadges: {
    released: 'Released',
    preview: 'Preview',
    rumored: 'Rumored',
    experimental: 'Lab',
    deprecated: 'Legacy',
  },
  surpriseBtn: 'Surprise',
  surpriseTooltip: 'Load a random experiment',
  meltdownBtn: 'Meltdown',
  meltdownTooltip: 'Load U + Pu + Au + Fe + Og at High Heat (Explosion demo)',
  closeLabTooltip: 'Close Model lab',
  radioactiveTag: '☢ Radioactive',
  hoverModelHint: 'Click to select model · Drag or double-click to brew',
  hoverRawHint: 'Click or drag into flask to synthesize custom compound',
  idleLabHint: 'Click highlighted models to switch · Drag elements into flask & press Brew',
  dropHint: 'Drop in',
  heatLabel: 'Heat',
  heatLevels: {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
  },
  reactionLabels: {
    bubbling: 'Bubbling Simmer',
    boiling: 'Vigorous Boil',
    volatile: 'Volatile Spark',
    explosion: 'Critical · Explosive!',
  },
  brewBtn: 'Brew',
  brewingBtn: 'Brewing...',
  clearSlotsTooltip: 'Clear all slots',
  slotFilledTooltip: (num, name, zhName) => `#${num} ${name} (${zhName}) — Click to remove`,
  slotEmptyTooltip: (idx) => `Slot ${idx + 1} — Drag or click an element to add`,
  heatBadgeSuffix: 'HEAT',
  metrics: {
    reasoning: 'Reasoning',
    speed: 'Speed',
    coding: 'Coding',
    creativity: 'Creativity',
    volatility: 'Volatility',
  },
  askWithModel: (name) => `Ask ${name}`,
  brewedShelfLabel: 'Brewed shelf',
  removeBrewedTooltip: 'Remove brewed model',
  aftermathTitle: (displayName, formula) => `Lab Containment Breached — ${displayName} (${formula})`,
  aftermathRebuildBtn: 'Rebuild Model lab',
  chatSessionTitle: 'Lab Simulation Session',
  newChatBtn: 'New chat',
  showThinking: 'Show thinking',
  recipeModalTitle: 'Lab Recipe Book',
  recipeProgress: (d, t) => `${d} / ${t} Discovered`,
  recipeModalSubtitle:
    'Different combinations trigger bubbling, boiling, sparks, or full-screen explosions (extendable via public/config/recipes.json)',
  revealFormulas: 'Reveal formulas',
  hideHints: 'Hide hints',
  undiscoveredCompound: 'Undiscovered Compound',
  recipeHint: (count, tag) => `Hint: Combine ${count} element${count > 1 ? 's' : ''} (${tag})`,
  recipeLoadBtn: 'Load',
  recipeRxTags: {
    bubbling: '🫧 Bubbling',
    boiling: '🔥 Boiling',
    volatile: '⚡ Volatile',
    explosion: '💥 Explosive',
  },
  managerTitle: 'Model Catalog Manager',
  localDraftBadge: 'Local Draft',
  managerSubtitle:
    'Add or edit future Gemini element models, preview live, and export models.json to deploy on Cloudflare',
  seriesTitleLabel: 'Series Title (Periodic Table Center)',
  seriesTitlePlaceholder: 'e.g. Gemini 4 or Gemini 5',
  registeredModelsTitle: (count) => `Registered Models (${count})`,
  addNewModelBtn: 'Add New Model',
  createFormTitle: 'Register New Gemini Element Model',
  editFormTitle: (name) => `Edit ${name}`,
  cancelBtn: 'Cancel',
  elementField: 'Element',
  inUseTag: '[In use]',
  statusField: 'Status',
  statusOptions: {
    released: 'Released',
    preview: 'Preview',
    experimental: 'Experimental',
    rumored: 'Rumored',
    deprecated: 'Deprecated',
  },
  shortNameField: 'Short Name (Prompt Pill)',
  displayNameField: 'Display Name',
  tierField: 'Tier',
  releaseDateField: 'Release Date',
  defaultHeatField: 'Default Heat',
  accentColorField: 'Accent Color',
  taglineField: 'Tagline',
  capabilitiesField: 'Capabilities (comma separated)',
  addToTableBtn: 'Add to Periodic Table',
  saveChangesBtn: 'Save Changes',
  deployTitle: 'Sync & Deploy to Cloudflare',
  deployDesc:
    'After editing models above, export and replace public/config/models.json, then push Git to Cloudflare Pages (or run npm run deploy).',
  downloadJsonBtn: 'Download models.json',
  copyJsonBtn: 'Copy JSON',
  copiedBtn: 'Copied!',
  importJsonBtn: 'Import JSON',
  resetDraftBtn: 'Reset local draft back to deployed config',
  customTagline: (heatLabel, elementsText) => `${heatLabel} synthesis of ${elementsText}`,
  customExplosionTagline: (heatLabel) => `Unstable ${heatLabel} reaction shattered Model lab!`,
};

export const TRANSLATIONS: Record<Locale, UIStrings> = { zh: ZH, en: EN };
