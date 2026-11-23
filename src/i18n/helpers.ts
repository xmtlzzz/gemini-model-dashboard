import { ELEMENT_BY_SYMBOL } from '../data/elements';
import type { ActiveModel, BrewedModel, GeminiModelConfig, RecipeConfig } from '../types/lab';
import { MODEL_ZH_MAP, RECIPE_ZH_MAP, TRANSLATIONS, type Locale } from './translations';

export function getModelLabels(model: GeminiModelConfig, locale: Locale) {
  if (locale === 'en') {
    return {
      shortName: model.name,
      displayName: model.displayName,
      tier: model.tier,
      tagline: model.tagline,
      description: model.description,
      capabilities: model.capabilities,
    };
  }
  const zh = MODEL_ZH_MAP[model.id];
  const el = ELEMENT_BY_SYMBOL[model.symbol];
  return {
    shortName: zh?.zhShortName ?? (el ? `${el.zhName} · ${model.name}` : model.name),
    displayName: zh?.zhDisplayName ?? model.displayName,
    tier: zh?.zhTier ?? model.tier,
    tagline: zh?.zhTagline ?? model.tagline,
    description: zh?.zhDescription ?? model.description,
    capabilities: zh?.zhCapabilities ?? model.capabilities,
  };
}

export function getRecipeLabels(recipe: RecipeConfig, locale: Locale) {
  if (locale === 'en') {
    return {
      shortName: recipe.name,
      displayName: recipe.displayName,
      badge: recipe.badge,
      tagline: recipe.tagline,
      description: recipe.description,
      capabilities: recipe.capabilities,
    };
  }
  const zh = RECIPE_ZH_MAP[recipe.id];
  return {
    shortName: zh?.zhShortName ?? recipe.name,
    displayName: zh?.zhDisplayName ?? recipe.displayName,
    badge: zh?.zhBadge ?? recipe.badge,
    tagline: zh?.zhTagline ?? recipe.tagline,
    description: zh?.zhDescription ?? recipe.description,
    capabilities: zh?.zhCapabilities ?? recipe.capabilities,
  };
}

export function getBrewedLabels(brewed: BrewedModel, locale: Locale) {
  if (locale === 'en') {
    return {
      shortName: brewed.name,
      displayName: brewed.displayName,
      badge: brewed.badge,
      tagline: brewed.tagline,
      description: brewed.description,
      capabilities: brewed.capabilities,
    };
  }
  const zh = brewed.recipeId ? RECIPE_ZH_MAP[brewed.recipeId] : undefined;
  const t = TRANSLATIONS.zh;
  const heatStr = t.heatLevels[brewed.heat];
  const elZhNames = brewed.ingredients
    .map((s) => ELEMENT_BY_SYMBOL[s]?.zhName ?? s)
    .join(' + ');

  if (zh) {
    return {
      shortName: zh.zhShortName ?? brewed.name,
      displayName: zh.zhDisplayName ?? brewed.displayName,
      badge: brewed.reactionType === 'explosion' ? '实验室核爆' : (zh.zhBadge ?? brewed.badge),
      tagline: zh.zhTagline ?? brewed.tagline,
      description: zh.zhDescription ?? brewed.description,
      capabilities: zh.zhCapabilities ?? brewed.capabilities,
    };
  }

  return {
    shortName: brewed.name,
    displayName: brewed.displayName,
    badge:
      brewed.reactionType === 'explosion'
        ? '收容爆破'
        : brewed.rarity === 'radioactive'
          ? '放射性同位素'
          : brewed.rarity === 'fusion'
            ? '复杂合成'
            : '自定义化合物',
    tagline:
      brewed.reactionType === 'explosion'
        ? t.customExplosionTagline(heatStr)
        : t.customTagline(heatStr, elZhNames),
    description:
      brewed.reactionType === 'explosion'
        ? `在${heatStr}下组合 ${elZhNames}（${brewed.formula}）触发了临界热失控，整张 118 号元素周期表被瞬间炸飞！`
        : `在模型实验室中以${heatStr}条件由 ${elZhNames}（${brewed.formula}）合成，反应挥发度 ${brewed.volatility}%。`,
    capabilities: brewed.capabilities,
  };
}

export function getActiveModelLabels(active: ActiveModel, locale: Locale) {
  if (active.kind === 'official') {
    return getModelLabels(active.model, locale);
  }
  return getBrewedLabels(active.model, locale);
}
