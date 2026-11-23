# Gemini Model Lab · 元素周期表大模型实验室

复现 X / 抖音热门的 **Gemini 4 Periodic Table Model Lab** 交互效果：支持 118 号全元素周期表选择、**自由拖拽元素至烧瓶或槽位组合**、**三档 Heat 热量控制**、**动态液体波浪/气泡/烟雾动画**、**隐藏合成配方彩蛋 + 程序化炼金引擎**，以及面向未来 Gemini 新模型发布的**可视化二次维护面板**与 **Cloudflare 一键部署配置**。

---

## 核心特性

- **高度还原 Gemini 深色实验室视觉**：顶部蓝紫星云氛围光、`Where should we start?` 标题栏、Gemini 输入框胶囊模型切换器、`✦ Model lab` 18 列完整元素周期表、锥形烧瓶动态液体、6 元素反应槽、`Low / Medium / High` 热量档位与 `Brew` 合成按钮。
- **桌面 & 移动端流畅拖拽组合**：基于 Pointer Events 实现自定义悬浮元素拖拽幽灵（同时支持单机快速添加、双击官方模型入瓶、拖到指定槽位替换、点击槽位移除）。
- **16 种内置隐藏配方 + 无限自由合成**：内置 `U + Pu`（放射性 Critical Mass）、`H + H + O`（Aqua）、`C + High Heat`（Diamond）、`H + C + Ne + Ar`（Pantheon）、`Na + Cl`（Salt）等 16 个彩蛋配方，其余任意 1–6 元素组合也会通过确定性炼金算法生成化学式、颜色、维度评分与对话人设。
- **面向未来发布的二次维护机制（零代码改配置）**：
  - 所有官方模型与隐藏配方均由 `public/config/models.json` 和 `public/config/recipes.json` 驱动。
  - 页面内置 **Manage Models** 可视化维护抽屉：可实时新增/编辑/删除任意元素模型、修改中央系列标题（如从 `Gemini 4` 升级为 `Gemini 5`），并一键导出/导入 `models.json`。
  - 构建阶段自动执行 `scripts/validate-config.mjs` 校验元素符号、颜色格式、唯一 ID，防止误配上线。
- **开箱即用的 Cloudflare 部署配置**：同时提供 `wrangler.jsonc`（Cloudflare Workers Static Assets）与 `public/_headers`（Cloudflare Pages 缓存与安全头）。

---

## 本地开发

```bash
npm install
npm run dev
```

构建生产产物（会自动校验 `models.json` 与 `recipes.json`）：

```bash
npm run build
npm run preview
```

---

## 后续维护：当 Google 发布新 Gemini 模型时

### 方式一：页面可视化维护（推荐）

1. 打开网页右上角 **Manage Models** 抽屉。
2. 点击 **Add New Model**，选择对应元素（如 `O` 氧、`Xe` 氙、`Ti` 钛等），填写发布状态、高亮色与简介，实时在周期表预览效果。
3. 如跨代升级（如 `Gemini 5`），可直接在顶部修改 **Series Title**。
4. 点击 **Download models.json** 下载配置文件，覆盖仓库中的 `public/config/models.json`。
5. 提交到 Git 仓库（Cloudflare Pages 会自动触发重新构建）或执行 `npm run deploy`。

### 方式二：直接编辑配置文件

打开 [`public/config/models.json`](public/config/models.json)，在 `models` 数组中新增一条记录即可：

```json
{
  "id": "gemini-4-oxygen",
  "symbol": "O",
  "atomicNumber": 8,
  "name": "Oxygen",
  "displayName": "Gemini 4 Oxygen",
  "series": "Gemini 4",
  "status": "released",
  "tier": "Flash",
  "accent": "#38bdf8",
  "releaseDate": "2026-12",
  "tagline": "Ultra-responsive multimodal Flash model",
  "description": "Balanced speed and vision performance.",
  "capabilities": ["Fast", "Multimodal", "1M Context"],
  "metrics": { "reasoning": 88, "speed": 97, "coding": 90, "creativity": 88 },
  "defaultHeat": "low"
}
```

如需新增合成彩蛋配方，直接编辑 [`public/config/recipes.json`](public/config/recipes.json)，运行 `npm run validate:config` 校验格式无误即可。

---

## 部署到 Cloudflare

### 方式 A：Cloudflare Pages（连接 GitHub/GitLab 自动部署，最省心）

1. 将本项目推送到 GitHub / GitLab 仓库。
2. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**。
3. 填写构建配置：
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. 点击 **Save and Deploy** 即可上线。后续只需修改 `public/config/models.json` 并 `git push`，Cloudflare 会自动更新（`public/_headers` 已配置 `/config/*` 60 秒短缓存以便快速生效）。

### 方式 B：Cloudflare Workers Static Assets（命令行一键发布）

项目已内置 [`wrangler.jsonc`](wrangler.jsonc)，安装/登录 Wrangler 后即可直接部署：

```bash
npx wrangler login
npm run deploy
```

或部署至 Cloudflare Pages：

```bash
npm run deploy:pages
```
