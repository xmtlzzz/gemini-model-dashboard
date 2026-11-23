import { ELEMENT_BY_SYMBOL } from '../data/elements';
import type {
  BrewedModel,
  HeatLevel,
  ModelMetrics,
  ReactionType,
  RecipeConfig,
} from '../types/lab';

const SUBSCRIPTS: Record<string, string> = {
  '0': '₀',
  '1': '₁',
  '2': '₂',
  '3': '₃',
  '4': '₄',
  '5': '₅',
  '6': '₆',
  '7': '₇',
  '8': '₈',
  '9': '₉',
};

const VOLATILE_ALKALIS = new Set(['Li', 'Na', 'K', 'Rb', 'Cs', 'Fr']);
const HYPER_EXPLOSIVE_ALKALIS = new Set(['K', 'Rb', 'Cs', 'Fr']);
const SUPERHEAVY_UNSTABLE = new Set(['Fr', 'Ra', 'Po', 'At', 'Rn', 'U', 'Np', 'Pu', 'Am', 'Cm', 'Bk', 'Cf', 'Og']);

function toSubscript(n: number): string {
  if (n <= 1) return '';
  return String(n)
    .split('')
    .map((d) => SUBSCRIPTS[d] ?? d)
    .join('');
}

export function formatFormula(symbols: string[]): string {
  if (symbols.length === 0) return '';
  const counts = new Map<string, number>();
  const order: string[] = [];
  for (const sym of symbols) {
    if (!counts.has(sym)) order.push(sym);
    counts.set(sym, (counts.get(sym) ?? 0) + 1);
  }
  return order.map((sym) => `${sym}${toSubscript(counts.get(sym) ?? 1)}`).join('');
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const num = parseInt(full, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return (
    '#' +
    [clamp(r), clamp(g), clamp(b)]
      .map((v) => v.toString(16).padStart(2, '0'))
      .join('')
  );
}

export function hasRadioactiveElements(symbols: string[]): boolean {
  return symbols.some((sym) => ELEMENT_BY_SYMBOL[sym]?.radioactive);
}

export function matchRecipe(
  symbols: string[],
  heat: HeatLevel,
  recipes: RecipeConfig[]
): RecipeConfig | null {
  if (symbols.length === 0) return null;

  const slotCounts = new Map<string, number>();
  for (const s of symbols) slotCounts.set(s, (slotCounts.get(s) ?? 0) + 1);

  const uniqueSlotSet = new Set(symbols);

  const sorted = [...recipes].sort((a, b) => {
    const scoreA =
      (a.exactCounts ? 2 : 0) + (a.requiredHeat ? 1.5 : 0) + a.ingredients.length * 0.15;
    const scoreB =
      (b.exactCounts ? 2 : 0) + (b.requiredHeat ? 1.5 : 0) + b.ingredients.length * 0.15;
    return scoreB - scoreA;
  });

  for (const recipe of sorted) {
    if (recipe.requiredHeat && !recipe.requiredHeat.includes(heat)) {
      continue;
    }

    if (recipe.exactCounts) {
      if (recipe.ingredients.length !== symbols.length) continue;
      const reqCounts = new Map<string, number>();
      for (const s of recipe.ingredients) reqCounts.set(s, (reqCounts.get(s) ?? 0) + 1);
      if (reqCounts.size !== slotCounts.size) continue;
      let match = true;
      for (const [k, v] of reqCounts) {
        if (slotCounts.get(k) !== v) {
          match = false;
          break;
        }
      }
      if (match) return recipe;
    } else {
      const reqSet = new Set(recipe.ingredients);
      if (reqSet.size !== uniqueSlotSet.size) continue;
      let match = true;
      for (const s of reqSet) {
        if (!uniqueSlotSet.has(s)) {
          match = false;
          break;
        }
      }
      if (match) return recipe;
    }
  }

  return null;
}

/**
 * Predicts whether a combination + heat level will bubble calmly, boil vigorously,
 * spark volatilely, or DETONATE the entire Model Lab!
 */
export function evaluateReactionType(
  symbols: string[],
  heat: HeatLevel,
  recipes: RecipeConfig[]
): ReactionType {
  if (symbols.length === 0) return 'bubbling';

  const matched = matchRecipe(symbols, heat, recipes);
  if (matched?.reactionType) {
    // Allow radioactive/exothermic explosion recipes to stay boiling/volatile on Low heat,
    // and detonate explosively on High (or Medium for ultra-reactive water-alkali)
    if (matched.reactionType === 'explosion') {
      if (matched.id === 'alkali-detonation' || matched.id === 'sodium-water-boom') {
        return heat === 'low' ? 'volatile' : 'explosion';
      }
      if (heat === 'high') return 'explosion';
      return heat === 'medium' ? 'volatile' : 'boiling';
    }
    return matched.reactionType;
  }

  const elements = symbols
    .map((s) => ELEMENT_BY_SYMBOL[s])
    .filter((e): e is NonNullable<typeof e> => Boolean(e));

  const symSet = new Set(symbols);
  const radCount = elements.filter((e) => e.radioactive).length;
  const superHeavyCount = symbols.filter((s) => SUPERHEAVY_UNSTABLE.has(s)).length;
  const hasAlkali = symbols.some((s) => VOLATILE_ALKALIS.has(s));
  const hasHyperAlkali = symbols.some((s) => HYPER_EXPLOSIVE_ALKALIS.has(s));
  const hasHalogen = elements.some((e) => e.category === 'halogen');
  const hasWaterParts = symSet.has('H') && symSet.has('O');

  // Detonation conditions (realistic chemistry + nuclear criticality + lab overload!)
  if (radCount >= 3) return 'explosion';
  if (radCount >= 2 && heat === 'high') return 'explosion';
  if (symSet.has('Og') && heat === 'high') return 'explosion';
  if (symSet.has('Fr') && heat !== 'low') return 'explosion';
  if (hasHyperAlkali && (hasWaterParts || symSet.has('O')) && heat !== 'low') return 'explosion';
  if (hasAlkali && hasWaterParts && heat === 'high') return 'explosion';
  if (symSet.has('H') && symSet.has('F') && heat === 'high') return 'explosion';
  if (symbols.length >= 5 && heat === 'high' && (radCount >= 1 || hasAlkali || hasHalogen)) {
    return 'explosion';
  }
  if (symbols.length === 6 && heat === 'high') return 'explosion';

  // Volatile / sparking
  if (radCount >= 2 && heat === 'medium') return 'volatile';
  if (superHeavyCount >= 1 && heat === 'high') return 'volatile';
  if (hasAlkali && hasHalogen && heat !== 'low') return 'volatile';
  if (symbols.length >= 4 && heat === 'high') return 'volatile';

  // Vigorous boiling / foaming
  if (heat === 'high') return 'boiling';
  if (heat === 'medium' && (symbols.length >= 2 || hasHalogen || hasAlkali || radCount >= 1)) {
    return 'boiling';
  }

  // Calm / bubbling (like C + C on Low!)
  return 'bubbling';
}

export function blendLiquidColor(
  symbols: string[],
  heat: HeatLevel,
  recipes: RecipeConfig[]
): string {
  if (symbols.length === 0) return '#3b4a6b';

  const matched = matchRecipe(symbols, heat, recipes);
  if (matched) return matched.liquidColor;

  let rSum = 0;
  let gSum = 0;
  let bSum = 0;
  let count = 0;

  for (const sym of symbols) {
    const el = ELEMENT_BY_SYMBOL[sym];
    if (!el) continue;
    const [r, g, b] = hexToRgb(el.liquidColor);
    rSum += r;
    gSum += g;
    bSum += b;
    count++;
  }

  if (count === 0) return '#4c8bf5';
  let r = rSum / count;
  let g = gSum / count;
  let b = bSum / count;

  // Radioactive multi-element mixtures shift toward glowing chartreuse-yellow
  const radCount = symbols.filter((s) => ELEMENT_BY_SYMBOL[s]?.radioactive).length;
  if (radCount >= 2) {
    r = r * 0.45 + 218 * 0.55;
    g = g * 0.45 + 234 * 0.55;
    b = b * 0.45 + 62 * 0.55;
  }

  if (heat === 'high') {
    r = Math.min(255, r * 1.12 + 12);
    g = Math.min(255, g * 1.06 + 6);
    b = Math.min(255, b * 0.94);
  } else if (heat === 'low') {
    b = Math.min(255, b * 1.08 + 8);
  }

  return rgbToHex(r, g, b);
}

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

const HEAT_PREFIXES: Record<HeatLevel, string[]> = {
  low: ['Cryo', 'Laminar', 'Quenched', 'Ambient', 'Still'],
  medium: ['Catalytic', 'Tempered', 'Harmonic', 'Kinetic', 'Resonant'],
  high: ['Plasma', 'Superheated', 'Hyper', 'Incandescent', 'Pyro'],
};

const CATEGORY_TRAITS: Record<string, { suffix: string; cap: string; boost: keyof ModelMetrics }> = {
  'alkali-metal': { suffix: 'Spark', cap: 'Instant Ignition', boost: 'speed' },
  'alkaline-earth': { suffix: 'Core', cap: 'Grounded Factuality', boost: 'reasoning' },
  'transition-metal': { suffix: 'Alloy', cap: 'Systems Architecture', boost: 'coding' },
  'post-transition': { suffix: 'Matrix', cap: 'Modular Pipelines', boost: 'coding' },
  metalloid: { suffix: 'Circuit', cap: 'Silicon Optimization', boost: 'coding' },
  nonmetal: { suffix: 'Synth', cap: 'Fluid Expression', boost: 'creativity' },
  halogen: { suffix: 'Edge', cap: 'Sharp Verification', boost: 'reasoning' },
  'noble-gas': { suffix: 'Aether', cap: 'Zero-Drift Calm', boost: 'reasoning' },
  lanthanide: { suffix: 'Prism', cap: 'Multimodal Spectrum', boost: 'creativity' },
  actinide: { suffix: 'Reactor', cap: 'Fission Reasoning', boost: 'reasoning' },
};

export function synthesizeBrew(
  symbols: string[],
  heat: HeatLevel,
  recipes: RecipeConfig[],
  seriesTitle: string
): BrewedModel {
  const formula = formatFormula(symbols);
  const matched = matchRecipe(symbols, heat, recipes);
  const reactionType = evaluateReactionType(symbols, heat, recipes);

  if (matched) {
    const heatBonus = heat === 'high' ? 2 : heat === 'low' ? -1 : 0;
    return {
      id: `brew-${matched.id}-${heat}-${Date.now()}`,
      recipeId: matched.id,
      name: matched.name,
      displayName: matched.displayName.replace(/^Gemini 4/, seriesTitle),
      formula: matched.formula || formula,
      ingredients: [...symbols],
      heat,
      reactionType,
      rarity: matched.rarity,
      accent: matched.accent,
      liquidColor: matched.liquidColor,
      badge: reactionType === 'explosion' ? 'CONTAINMENT DETONATION' : matched.badge,
      tagline: matched.tagline,
      description: matched.description,
      capabilities: matched.capabilities,
      metrics: {
        reasoning: Math.min(100, Math.max(50, matched.metrics.reasoning + heatBonus)),
        speed: Math.min(100, Math.max(45, matched.metrics.speed - (heat === 'high' ? 2 : -2))),
        coding: Math.min(100, Math.max(50, matched.metrics.coding)),
        creativity: Math.min(100, Math.max(50, matched.metrics.creativity + heatBonus)),
      },
      volatility:
        reactionType === 'explosion'
          ? 100
          : Math.min(100, matched.volatility + (heat === 'high' ? 8 : heat === 'low' ? -6 : 0)),
      personaIntro: matched.personaIntro,
      createdAt: Date.now(),
    };
  }

  const elements = symbols
    .map((s) => ELEMENT_BY_SYMBOL[s])
    .filter((e): e is NonNullable<typeof e> => Boolean(e));

  const radioactiveCount = elements.filter((e) => e.radioactive).length;
  const avgAtomic =
    elements.reduce((acc, el) => acc + el.atomicNumber, 0) / Math.max(1, elements.length);
  const seed = hashSeed(`${[...symbols].sort().join('-')}:${heat}`);

  const liquidColor = blendLiquidColor(symbols, heat, recipes);
  const primary = elements[0];
  const secondary = elements[elements.length - 1];
  const primaryTrait = CATEGORY_TRAITS[primary?.category ?? 'nonmetal'];
  const secondaryTrait = CATEGORY_TRAITS[secondary?.category ?? 'transition-metal'];

  const prefixPool = HEAT_PREFIXES[heat];
  const prefix = prefixPool[seed % prefixPool.length];

  let shortName: string;
  if (reactionType === 'explosion') {
    shortName = `${primary?.name ?? 'Core'} Meltdown`;
  } else if (elements.length === 1 && primary) {
    shortName = `${prefix} ${primary.name}`;
  } else if (radioactiveCount >= 2) {
    shortName = `${primary?.name ?? 'Isotope'} Reactor`;
  } else {
    shortName = `${prefix} ${primary?.name ?? 'Compound'}-${secondaryTrait.suffix}`;
  }

  const clampMetric = (n: number) => Math.max(58, Math.min(99, Math.round(n)));
  const heatReasoning = heat === 'high' ? 8 : heat === 'medium' ? 4 : -2;
  const heatSpeed = heat === 'low' ? 10 : heat === 'medium' ? 3 : -7;
  const heatCreativity = heat === 'high' ? 10 : heat === 'medium' ? 4 : -3;

  const metrics: ModelMetrics = {
    reasoning: clampMetric(76 + (avgAtomic / 118) * 14 + heatReasoning + (seed % 7)),
    speed: clampMetric(88 - (avgAtomic / 118) * 18 + heatSpeed + ((seed >> 3) % 7)),
    coding: clampMetric(80 + elements.length * 2 + ((seed >> 5) % 9)),
    creativity: clampMetric(75 + elements.length * 2.5 + heatCreativity + ((seed >> 7) % 8)),
  };

  metrics[primaryTrait.boost] = Math.min(99, metrics[primaryTrait.boost] + 5);

  const volatility =
    reactionType === 'explosion'
      ? 100
      : Math.min(
          98,
          Math.max(
            5,
            Math.round(
              14 +
                radioactiveCount * 34 +
                (heat === 'high' ? 22 : heat === 'medium' ? 10 : 0) +
                elements.length * 3
            )
          )
        );

  const uniqueCaps = Array.from(
    new Set([
      reactionType === 'explosion' ? 'Lab Detonation' : primaryTrait.cap,
      secondaryTrait.cap,
      heat === 'high' ? 'High-Heat CoT' : heat === 'low' ? 'Low-Temp Precision' : 'Balanced Synthesis',
      radioactiveCount > 0 ? 'Isotope Boost' : `${elements.length}-Element Blend`,
    ])
  ).slice(0, 4);

  const isRadioactive = radioactiveCount > 0 || reactionType === 'explosion';
  const rarity: BrewedModel['rarity'] = isRadioactive
    ? 'radioactive'
    : elements.length >= 4
      ? 'fusion'
      : 'alloy';

  const badge =
    reactionType === 'explosion'
      ? 'CONTAINMENT DETONATION'
      : radioactiveCount > 0
        ? 'RADIOACTIVE ISOTOPE'
        : elements.length >= 4
          ? 'COMPLEX SYNTHESIS'
          : 'CUSTOM COMPOUND';

  const elementListText = elements.map((e) => e.name).join(' + ');

  return {
    id: `brew-custom-${formula}-${heat}-${Date.now()}`,
    name: shortName,
    displayName: `${seriesTitle} ${shortName}`,
    formula,
    ingredients: [...symbols],
    heat,
    reactionType,
    rarity,
    accent: liquidColor,
    liquidColor,
    badge,
    tagline:
      reactionType === 'explosion'
        ? `Unstable ${heat.toUpperCase()}-heat reaction shattered Model lab!`
        : `${heat.toUpperCase()} heat synthesis of ${elementListText}`,
    description:
      reactionType === 'explosion'
        ? `Critical thermal runaway combining ${elementListText} (${formula}) at ${heat.toUpperCase()} heat! All 118 tiles were launched across the lab.`
        : `Synthesized in Model lab from ${elementListText} (${formula}) at ${heat} thermal energy. Average atomic index ${avgAtomic.toFixed(1)} with ${volatility}% reaction volatility.`,
    capabilities: uniqueCaps,
    metrics,
    volatility,
    personaIntro:
      reactionType === 'explosion'
        ? `💥 [${formula} · LAB DETONATION] Containment failed spectacularly. Salvaged model weights active.`
        : isRadioactive
          ? `☢️ [${formula} · ${heat.toUpperCase()} HEAT] Geiger counter ticking. Unstable isotope reasoning active.`
          : `⚗️ [${formula} · ${heat.toUpperCase()} HEAT] Freshly synthesized compound online and calibrated.`,
    createdAt: Date.now(),
  };
}
