import React, { useState } from 'react';
import { Eye, EyeOff, FlaskConical, Lock, Sparkles, X } from 'lucide-react';
import { getRecipeLabels } from '../i18n/helpers';
import { TRANSLATIONS, type Locale } from '../i18n/translations';
import type { HeatLevel, ReactionType, RecipeConfig } from '../types/lab';

interface RecipeBookModalProps {
  locale: Locale;
  open: boolean;
  recipes: RecipeConfig[];
  discoveredIds: string[];
  onClose: () => void;
  onLoadRecipe: (ingredients: string[], heat?: HeatLevel) => void;
}

const RX_CLASS: Record<ReactionType, string> = {
  bubbling: 'tag-bubbling',
  boiling: 'tag-boiling',
  volatile: 'tag-volatile',
  explosion: 'tag-explosion',
};

export const RecipeBookModal: React.FC<RecipeBookModalProps> = ({
  locale,
  open,
  recipes,
  discoveredIds,
  onClose,
  onLoadRecipe,
}) => {
  const [revealHints, setRevealHints] = useState(false);
  const t = TRANSLATIONS[locale];

  if (!open) return null;

  const discoveredSet = new Set(discoveredIds);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={t.recipeModalTitle}
      >
        <header className="modal-header">
          <div>
            <div className="modal-title-row">
              <FlaskConical size={18} className="modal-icon" />
              <h3>{t.recipeModalTitle}</h3>
              <span className="recipe-progress-pill">
                {t.recipeProgress(discoveredIds.length, recipes.length)}
              </span>
            </div>
            <p className="modal-subtitle">{t.recipeModalSubtitle}</p>
          </div>
          <div className="modal-header-right">
            <button
              type="button"
              className="secondary-btn compact"
              onClick={() => setRevealHints((r) => !r)}
            >
              {revealHints ? <EyeOff size={14} /> : <Eye size={14} />}
              <span>{revealHints ? t.hideHints : t.revealFormulas}</span>
            </button>
            <button type="button" className="drawer-close" onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          </div>
        </header>

        <div className="recipe-grid">
          {recipes.map((recipe) => {
            const unlocked = discoveredSet.has(recipe.id);
            const showIngredients = unlocked || revealHints;
            const rText = getRecipeLabels(recipe, locale);
            const rxType = recipe.reactionType ?? 'bubbling';

            return (
              <div
                key={recipe.id}
                className={`recipe-card ${unlocked ? 'unlocked' : 'locked'}`}
                style={{ '--recipe-accent': recipe.accent } as React.CSSProperties}
              >
                <div className="recipe-card-top">
                  <span className="recipe-badge">{rText.badge}</span>
                  <div className="recipe-top-pills">
                    <span className={`recipe-rx-pill ${RX_CLASS[rxType]}`}>
                      {t.recipeRxTags[rxType]}
                    </span>
                    {recipe.requiredHeat && (
                      <span className="recipe-heat-req">
                        {recipe.requiredHeat.map((h) => t.heatLevels[h]).join('/')}
                      </span>
                    )}
                  </div>
                </div>

                <h4 className="recipe-card-name">
                  {unlocked ? (
                    <>
                      <Sparkles size={13} className="recipe-star" />
                      <span>{rText.displayName}</span>
                    </>
                  ) : (
                    <>
                      <Lock size={13} className="recipe-lock" />
                      <span>{revealHints ? rText.displayName : t.undiscoveredCompound}</span>
                    </>
                  )}
                </h4>

                <p className="recipe-card-tagline">
                  {unlocked || revealHints
                    ? rText.tagline
                    : t.recipeHint(recipe.ingredients.length, t.recipeRxTags[rxType])}
                </p>

                <div className="recipe-card-bottom">
                  <div className="recipe-atoms">
                    {showIngredients
                      ? recipe.ingredients.map((sym, i) => (
                          <span key={`${sym}-${i}`} className="recipe-atom-pill">
                            {sym}
                          </span>
                        ))
                      : recipe.ingredients.map((_, i) => (
                          <span key={i} className="recipe-atom-pill mystery">
                            ?
                          </span>
                        ))}
                  </div>

                  {showIngredients && (
                    <button
                      type="button"
                      className="recipe-load-btn"
                      onClick={() => {
                        const targetHeat: HeatLevel =
                          recipe.requiredHeat?.[0] ??
                          (recipe.reactionType === 'explosion'
                            ? 'high'
                            : recipe.reactionType === 'bubbling'
                              ? 'low'
                              : 'medium');
                        onLoadRecipe(recipe.ingredients, targetHeat);
                        onClose();
                      }}
                    >
                      {t.recipeLoadBtn}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
