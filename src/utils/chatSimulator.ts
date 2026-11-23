import type { ActiveModel, HeatLevel } from '../types/lab';

export interface SimulatedReply {
  thinking?: string;
  content: string;
}

export function generateSimulatedReply(
  prompt: string,
  active: ActiveModel,
  heat: HeatLevel
): SimulatedReply {
  const cleanPrompt = prompt.trim();
  const isChinese = /[\u4e00-\u9fa5]/.test(cleanPrompt);

  if (active.kind === 'brewed') {
    const m = active.model;
    const thinking =
      heat === 'low'
        ? undefined
        : isChinese
          ? `正在通过合成模型 ${m.displayName} (${m.formula}) 进行 ${heat.toUpperCase()} 热量推理…\n• 成分配方：${m.ingredients.join(' + ')}\n• 推理强度：${m.metrics.reasoning}/100 · 反应挥发度：${m.volatility}%\n• 正在收敛最佳回答路径…`
          : `Synthesizing via ${m.displayName} (${m.formula}) at ${heat.toUpperCase()} heat…\n• Compound: ${m.ingredients.join(' + ')}\n• Reasoning index: ${m.metrics.reasoning}/100 · Volatility: ${m.volatility}%\n• Stabilizing output tokens…`;

    const content = isChinese
      ? `${m.personaIntro}\n\n你刚刚向 **${m.displayName}**（化学式 \`${m.formula}\`，热量档位 \`${heat.toUpperCase()}\`）提问：\n> ${cleanPrompt}\n\n**实验室响应摘要：**\n当前合成化合物的特性为 *${m.tagline}*。本页面是前端交互演示环境（可直接部署至 Cloudflare Pages / Workers），你可以继续打开上方的 **${m.name} ⌃** 面板，拖拽任意元素到烧瓶里调配新配方，或在右上角「模型维护」中随时录入 Google 新发布的 Gemini 元素模型。`
      : `${m.personaIntro}\n\nYou prompted **${m.displayName}** (\`${m.formula}\` · \`${heat.toUpperCase()}\` heat):\n> ${cleanPrompt}\n\n**Lab Synthesis Output:**\nOperating with *${m.tagline.toLowerCase()}* (Reasoning ${m.metrics.reasoning} · Speed ${m.metrics.speed} · Creativity ${m.metrics.creativity}). This is an interactive Model Lab prototype—click **${m.name} ⌃** anytime to drag more elements into the flask, test secret recipes, or manage future Gemini releases in the Catalog Manager.`;

    return { thinking, content };
  }

  const m = active.model;
  const thinking =
    heat === 'low' && m.defaultHeat === 'low'
      ? undefined
      : isChinese
        ? `[${m.displayName} · 原子序数 #${m.atomicNumber} ${m.symbol}]\n• 推理层级：${m.tier}（状态：${m.status}）\n• 热量 / 思考强度：${heat.toUpperCase()}\n• 核心能力命中：${m.capabilities.slice(0, 3).join(' / ')}`
        : `[${m.displayName} · Atomic #${m.atomicNumber} ${m.symbol}]\n• Tier: ${m.tier} (${m.status})\n• Thermal Reasoning Effort: ${heat.toUpperCase()}\n• Active capabilities: ${m.capabilities.slice(0, 3).join(' · ')}`;

  const styleIntros: Record<string, { zh: string; en: string }> = {
    hydrogen: {
      zh: `⚡ **${m.displayName}**（超轻高速响应）：`,
      en: `⚡ **${m.displayName}** (instant low-latency pass):`,
    },
    carbon: {
      zh: `🧬 **${m.displayName}**（深度结构化推理完成）：`,
      en: `🧬 **${m.displayName}** (deep structural synthesis):`,
    },
    neon: {
      zh: `💠 **${m.displayName}**（高能均衡输出）：`,
      en: `💠 **${m.displayName}** (balanced engineering response):`,
    },
    argon: {
      zh: `🛡️ **${m.displayName}**（工程与架构模式）：`,
      en: `🛡️ **${m.displayName}** (autonomous engineering mode):`,
    },
    krypton: {
      zh: `🔮 **${m.displayName}**（高亮度预览推理）：`,
      en: `🔮 **${m.displayName}** (high-luminosity preview pass):`,
    },
    gold: {
      zh: `👑 **${m.displayName}**（旗舰极限算力分析）：`,
      en: `👑 **${m.displayName}** (precious-tier synthesis):`,
    },
  };

  const intro = styleIntros[m.personaStyle ?? ''] ?? {
    zh: `✦ **${m.displayName}**（\`${m.symbol}\` #${m.atomicNumber}）：`,
    en: `✦ **${m.displayName}** (\`${m.symbol}\` #${m.atomicNumber}):`,
  };

  const content = isChinese
    ? `${intro.zh}\n\n收到你的指令：「${cleanPrompt}」\n\n- **模型定位**：${m.tagline}\n- **综合指标**：推理 ${m.metrics.reasoning} · 速度 ${m.metrics.speed} · 编程 ${m.metrics.coding} · 创造力 ${m.metrics.creativity}\n- **玩法提示**：点击输入框右侧 **${m.name} ⌃** 可随时展开周期表实验室；试着把 **U（铀）+ Pu（钚）** 或 **H + H + O** 拖进烧瓶点击 **Brew**！`
    : `${intro.en}\n\nReceived your prompt: "${cleanPrompt}"\n\n- **Profile**: ${m.tagline}\n- **Benchmarks**: Reasoning ${m.metrics.reasoning} · Speed ${m.metrics.speed} · Coding ${m.metrics.coding} · Creativity ${m.metrics.creativity}\n- **Lab Tip**: Click **${m.name} ⌃** to reopen the Periodic Table Model Lab, drag **U + Pu** or **H + H + O** into the flask, and hit **Brew** to synthesize custom compounds!`;

  return { thinking, content };
}
