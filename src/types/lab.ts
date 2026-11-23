export type ElementCategory =
  | 'alkali-metal'
  | 'alkaline-earth'
  | 'transition-metal'
  | 'post-transition'
  | 'metalloid'
  | 'nonmetal'
  | 'halogen'
  | 'noble-gas'
  | 'lanthanide'
  | 'actinide';

export interface ChemicalElement {
  atomicNumber: number;
  symbol: string;
  name: string;
  zhName: string;
  mass: string;
  category: ElementCategory;
  row: number; // 1-7 main table, 8 lanthanides, 9 actinides
  col: number; // 1-18
  liquidColor: string;
  radioactive?: boolean;
}

export type HeatLevel = 'low' | 'medium' | 'high';

export type ReactionType = 'bubbling' | 'boiling' | 'volatile' | 'explosion';

export type ModelStatus = 'released' | 'preview' | 'rumored' | 'experimental' | 'deprecated';

export interface ModelMetrics {
  reasoning: number; // 0-100
  speed: number; // 0-100
  coding: number; // 0-100
  creativity: number; // 0-100
}

export interface GeminiModelConfig {
  id: string;
  symbol: string;
  atomicNumber: number;
  name: string;
  displayName: string;
  series: string;
  status: ModelStatus;
  tier: string;
  accent: string;
  releaseDate: string;
  tagline: string;
  description: string;
  capabilities: string[];
  metrics: ModelMetrics;
  defaultHeat: HeatLevel;
  personaStyle?: string;
}

export interface ModelCatalogConfig {
  schemaVersion: string;
  seriesTitle: string;
  defaultSelectedModelId: string;
  initialLabState: {
    slots: string[];
    heat: HeatLevel;
  };
  updatedAt: string;
  models: GeminiModelConfig[];
}

export interface RecipeConfig {
  id: string;
  ingredients: string[];
  exactCounts?: boolean;
  requiredHeat?: HeatLevel[];
  reactionType?: ReactionType;
  name: string;
  displayName: string;
  formula?: string;
  rarity: 'legendary' | 'radioactive' | 'secret' | 'fusion';
  accent: string;
  liquidColor: string;
  badge: string;
  tagline: string;
  description: string;
  capabilities: string[];
  metrics: ModelMetrics;
  volatility: number; // 0-100
  personaIntro: string;
}

export interface RecipesCatalogConfig {
  schemaVersion: string;
  recipes: RecipeConfig[];
}

export interface BrewedModel {
  id: string;
  recipeId?: string;
  name: string;
  displayName: string;
  formula: string;
  ingredients: string[];
  heat: HeatLevel;
  reactionType: ReactionType;
  rarity: 'legendary' | 'radioactive' | 'secret' | 'fusion' | 'alloy';
  accent: string;
  liquidColor: string;
  badge: string;
  tagline: string;
  description: string;
  capabilities: string[];
  metrics: ModelMetrics;
  volatility: number;
  personaIntro: string;
  createdAt: number;
}

export type ActiveModel =
  | { kind: 'official'; model: GeminiModelConfig }
  | { kind: 'brewed'; model: BrewedModel };

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  thinking?: string;
  modelLabel?: string;
  modelAccent?: string;
  modelFormula?: string;
  heat?: HeatLevel;
  timestamp: number;
}

export interface ExplosionFragment {
  id: string;
  kind: 'tile' | 'heat-bar' | 'brew-btn' | 'slot' | 'title';
  x: number;
  y: number;
  width: number;
  height: number;
  symbol?: string;
  zhName?: string;
  atomicNumber?: number;
  accent?: string;
  isModel?: boolean;
  label?: string;
  heat?: HeatLevel;
  heatLabels?: [string, string, string];
}

export interface ExplosionPayload {
  id: number;
  epicenterX: number;
  epicenterY: number;
  color: string;
  fragments: ExplosionFragment[];
  brewed: BrewedModel;
}

export interface FlyingAtom {
  id: number;
  symbol: string;
  atomicNumber: number;
  color: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}
