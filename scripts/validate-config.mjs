import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const VALID_HEATS = new Set(['low', 'medium', 'high']);
const VALID_STATUSES = new Set(['released', 'preview', 'rumored', 'experimental', 'deprecated']);
const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

const VALID_SYMBOLS = new Set([
  'H','He','Li','Be','B','C','N','O','F','Ne','Na','Mg','Al','Si','P','S','Cl','Ar',
  'K','Ca','Sc','Ti','V','Cr','Mn','Fe','Co','Ni','Cu','Zn','Ga','Ge','As','Se','Br','Kr',
  'Rb','Sr','Y','Zr','Nb','Mo','Tc','Ru','Rh','Pd','Ag','Cd','In','Sn','Sb','Te','I','Xe',
  'Cs','Ba','La','Ce','Pr','Nd','Pm','Sm','Eu','Gd','Tb','Dy','Ho','Er','Tm','Yb','Lu',
  'Hf','Ta','W','Re','Os','Ir','Pt','Au','Hg','Tl','Pb','Bi','Po','At','Rn',
  'Fr','Ra','Ac','Th','Pa','U','Np','Pu','Am','Cm','Bk','Cf','Es','Fm','Md','No','Lr',
  'Rf','Db','Sg','Bh','Hs','Mt','Ds','Rg','Cn','Nh','Fl','Mc','Lv','Ts','Og'
]);

const errors = [];

function validateModels() {
  const path = resolve(process.cwd(), 'public/config/models.json');
  const raw = JSON.parse(readFileSync(path, 'utf-8'));

  if (!raw.seriesTitle || typeof raw.seriesTitle !== 'string') {
    errors.push('models.json: missing valid seriesTitle');
  }
  if (!Array.isArray(raw.models) || raw.models.length === 0) {
    errors.push('models.json: models must be a non-empty array');
    return;
  }

  const seenIds = new Set();
  const seenSymbols = new Set();

  for (const m of raw.models) {
    if (!m.id || seenIds.has(m.id)) {
      errors.push(`models.json: duplicate or missing id "${m.id}"`);
    }
    seenIds.add(m.id);

    if (!VALID_SYMBOLS.has(m.symbol)) {
      errors.push(`models.json: invalid element symbol "${m.symbol}" on model "${m.id}"`);
    }
    if (seenSymbols.has(m.symbol)) {
      errors.push(`models.json: duplicate element symbol "${m.symbol}"`);
    }
    seenSymbols.add(m.symbol);

    if (!VALID_STATUSES.has(m.status)) {
      errors.push(`models.json: invalid status "${m.status}" on model "${m.id}"`);
    }
    if (!HEX_COLOR_RE.test(m.accent || '')) {
      errors.push(`models.json: accent must be a 6-digit hex color on "${m.id}" (got "${m.accent}")`);
    }
    if (!VALID_HEATS.has(m.defaultHeat)) {
      errors.push(`models.json: invalid defaultHeat "${m.defaultHeat}" on "${m.id}"`);
    }
  }

  if (raw.defaultSelectedModelId && !seenIds.has(raw.defaultSelectedModelId)) {
    errors.push(`models.json: defaultSelectedModelId "${raw.defaultSelectedModelId}" does not match any model id`);
  }

  if (raw.initialLabState) {
    for (const sym of raw.initialLabState.slots || []) {
      if (!VALID_SYMBOLS.has(sym)) {
        errors.push(`models.json: invalid initialLabState slot symbol "${sym}"`);
      }
    }
    if (raw.initialLabState.heat && !VALID_HEATS.has(raw.initialLabState.heat)) {
      errors.push(`models.json: invalid initialLabState heat "${raw.initialLabState.heat}"`);
    }
  }
}

function validateRecipes() {
  const path = resolve(process.cwd(), 'public/config/recipes.json');
  const raw = JSON.parse(readFileSync(path, 'utf-8'));

  if (!Array.isArray(raw.recipes)) {
    errors.push('recipes.json: recipes must be an array');
    return;
  }

  const seenIds = new Set();
  for (const r of raw.recipes) {
    if (!r.id || seenIds.has(r.id)) {
      errors.push(`recipes.json: duplicate or missing id "${r.id}"`);
    }
    seenIds.add(r.id);

    if (!Array.isArray(r.ingredients) || r.ingredients.length === 0 || r.ingredients.length > 6) {
      errors.push(`recipes.json: recipe "${r.id}" must have 1-6 ingredients`);
    } else {
      for (const sym of r.ingredients) {
        if (!VALID_SYMBOLS.has(sym)) {
          errors.push(`recipes.json: invalid symbol "${sym}" in recipe "${r.id}"`);
        }
      }
    }

    if (!HEX_COLOR_RE.test(r.accent || '') || !HEX_COLOR_RE.test(r.liquidColor || '')) {
      errors.push(`recipes.json: invalid hex accent or liquidColor on recipe "${r.id}"`);
    }
  }
}

try {
  validateModels();
  validateRecipes();
} catch (err) {
  errors.push(`Config parse error: ${err.message}`);
}

if (errors.length > 0) {
  console.error('❌ Config validation failed:');
  for (const e of errors) console.error('  -', e);
  process.exit(1);
} else {
  console.log('✅ Config validation passed (models.json & recipes.json).');
}
