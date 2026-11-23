import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  Eye,
  EyeOff,
  Languages,
  MessageSquare,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { ChatView } from './components/ChatView';
import { ExplosionOverlay } from './components/ExplosionOverlay';
import { ModelLabPanel, type SnapshotCapture } from './components/ModelLabPanel';
import { ModelManagerDrawer } from './components/ModelManagerDrawer';
import { PromptBar } from './components/PromptBar';
import { RecipeBookModal } from './components/RecipeBookModal';
import { FALLBACK_MODEL_CATALOG, FALLBACK_RECIPES } from './data/fallbackConfig';
import { getActiveModelLabels, getBrewedLabels } from './i18n/helpers';
import { TRANSLATIONS, type Locale } from './i18n/translations';
import type {
  ActiveModel,
  BrewedModel,
  ChatMessage,
  ExplosionPayload,
  GeminiModelConfig,
  HeatLevel,
  ModelCatalogConfig,
  RecipeConfig,
} from './types/lab';
import { evaluateReactionType, synthesizeBrew } from './utils/alchemy';
import { generateSimulatedReply } from './utils/chatSimulator';
import { labSound } from './utils/sound';

const LS_CATALOG_KEY = 'gemini-model-lab:catalog-override-v1';
const LS_BREWED_KEY = 'gemini-model-lab:brewed-history-v1';
const LS_DISCOVERED_KEY = 'gemini-model-lab:discovered-recipes-v1';
const LS_SOUND_KEY = 'gemini-model-lab:sound-enabled-v1';
const LS_LOCALE_KEY = 'gemini-model-lab:locale-v1';
const LS_PURE_KEY = 'gemini-model-lab:pure-mode-v1';

function safeParseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export const App: React.FC = () => {
  const [locale, setLocale] = useState<Locale>(() => {
    const saved = localStorage.getItem(LS_LOCALE_KEY);
    if (saved === 'zh' || saved === 'en') return saved;
    return 'zh';
  });

  const t = TRANSLATIONS[locale];

  const [serverCatalog, setServerCatalog] = useState<ModelCatalogConfig>(FALLBACK_MODEL_CATALOG);
  const [localCatalog, setLocalCatalog] = useState<ModelCatalogConfig | null>(() =>
    safeParseJson<ModelCatalogConfig>(localStorage.getItem(LS_CATALOG_KEY))
  );
  const [recipes, setRecipes] = useState<RecipeConfig[]>(FALLBACK_RECIPES.recipes);

  const catalog = localCatalog ?? serverCatalog;

  const [slots, setSlots] = useState<string[]>(
    () => catalog.initialLabState?.slots ?? ['U', 'Pu']
  );
  const [heat, setHeat] = useState<HeatLevel>(
    () => catalog.initialLabState?.heat ?? 'high'
  );

  const [activeModel, setActiveModel] = useState<ActiveModel>(() => {
    const initial =
      catalog.models.find((m) => m.id === catalog.defaultSelectedModelId) ??
      catalog.models[0];
    return { kind: 'official', model: initial };
  });

  const [isLabOpen, setIsLabOpen] = useState(true);
  const [isBrewing, setIsBrewing] = useState(false);
  const [lastBrewed, setLastBrewed] = useState<BrewedModel | null>(null);
  const [explosion, setExplosion] = useState<ExplosionPayload | null>(null);
  const [screenShake, setScreenShake] = useState(false);
  const [detonationAftermath, setDetonationAftermath] = useState<BrewedModel | null>(null);

  const [brewedHistory, setBrewedHistory] = useState<BrewedModel[]>(() => {
    return safeParseJson<BrewedModel[]>(localStorage.getItem(LS_BREWED_KEY)) ?? [];
  });

  const [discoveredIds, setDiscoveredIds] = useState<string[]>(() => {
    return safeParseJson<string[]>(localStorage.getItem(LS_DISCOVERED_KEY)) ?? [];
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem(LS_SOUND_KEY);
    return saved === null ? true : saved === 'true';
  });

  const [pureMode, setPureMode] = useState<boolean>(() => {
    return localStorage.getItem(LS_PURE_KEY) === 'true';
  });

  const [resonanceTick, setResonanceTick] = useState(0);
  const [easterEggToast, setEasterEggToast] = useState(false);

  const [promptText, setPromptText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [managerOpen, setManagerOpen] = useState(false);
  const [recipeBookOpen, setRecipeBookOpen] = useState(false);

  const promptInputRef = useRef<HTMLInputElement | null>(null);
  const brewTimerRef = useRef<number | null>(null);
  const shakeTimerRef = useRef<number | null>(null);
  const eggTimerRef = useRef<number | null>(null);
  const captureExplosionRef = useRef<(() => SnapshotCapture) | null>(null);

  useEffect(() => {
    localStorage.setItem(LS_PURE_KEY, String(pureMode));
  }, [pureMode]);

  useEffect(() => {
    localStorage.setItem(LS_LOCALE_KEY, locale);
    document.documentElement.lang = locale === 'zh' ? 'zh-CN' : 'en';
    document.title = locale === 'zh' ? 'Gemini · 模型实验室' : 'Gemini · Model lab';
  }, [locale]);

  useEffect(() => {
    labSound.enabled = soundEnabled;
    localStorage.setItem(LS_SOUND_KEY, String(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    let cancelled = false;

    fetch('/config/models.json', { cache: 'no-cache' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: ModelCatalogConfig | null) => {
        if (cancelled || !data || !Array.isArray(data.models) || data.models.length === 0) return;
        setServerCatalog(data);
        if (!localStorage.getItem(LS_CATALOG_KEY)) {
          const def =
            data.models.find((m) => m.id === data.defaultSelectedModelId) ?? data.models[0];
          setActiveModel((prev) =>
            prev.kind === 'official' ? { kind: 'official', model: def } : prev
          );
        }
      })
      .catch(() => {});

    fetch('/config/recipes.json', { cache: 'no-cache' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { recipes?: RecipeConfig[] } | null) => {
        if (cancelled || !data || !Array.isArray(data.recipes)) return;
        setRecipes(data.recipes);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (activeModel.kind !== 'official') return;
    const updated = catalog.models.find((m) => m.id === activeModel.model.id);
    if (updated) {
      if (updated !== activeModel.model) {
        setActiveModel({ kind: 'official', model: updated });
      }
    } else if (catalog.models.length > 0) {
      setActiveModel({ kind: 'official', model: catalog.models[0] });
    }
  }, [catalog.models]);

  useEffect(() => {
    localStorage.setItem(LS_BREWED_KEY, JSON.stringify(brewedHistory));
  }, [brewedHistory]);

  useEffect(() => {
    localStorage.setItem(LS_DISCOVERED_KEY, JSON.stringify(discoveredIds));
  }, [discoveredIds]);

  useEffect(() => {
    return () => {
      if (brewTimerRef.current) window.clearTimeout(brewTimerRef.current);
      if (shakeTimerRef.current) window.clearTimeout(shakeTimerRef.current);
      if (eggTimerRef.current) window.clearTimeout(eggTimerRef.current);
    };
  }, []);

  const handleTriggerEasterEgg = () => {
    setDetonationAftermath(null);
    setIsLabOpen(true);
    setResonanceTick((n) => n + 1);
    setEasterEggToast(true);
    labSound.playEasterEggUnlock();
    if (eggTimerRef.current) window.clearTimeout(eggTimerRef.current);
    eggTimerRef.current = window.setTimeout(() => setEasterEggToast(false), 3200);
  };

  const handleUpdateCatalog = (next: ModelCatalogConfig) => {
    setLocalCatalog(next);
    localStorage.setItem(LS_CATALOG_KEY, JSON.stringify(next));
  };

  const handleResetCatalog = () => {
    setLocalCatalog(null);
    localStorage.removeItem(LS_CATALOG_KEY);
    const def =
      serverCatalog.models.find((m) => m.id === serverCatalog.defaultSelectedModelId) ??
      serverCatalog.models[0];
    setActiveModel({ kind: 'official', model: def });
  };

  const handleSelectOfficialModel = (model: GeminiModelConfig) => {
    setActiveModel({ kind: 'official', model });
  };

  const handleSelectBrewedModel = (model: BrewedModel) => {
    setActiveModel({ kind: 'brewed', model });
    setLastBrewed(model);
  };

  const handleDeleteBrewedModel = (id: string) => {
    setBrewedHistory((prev) => prev.filter((item) => item.id !== id));
    if (lastBrewed?.id === id) setLastBrewed(null);
    if (detonationAftermath?.id === id) setDetonationAftermath(null);
    if (activeModel.kind === 'brewed' && activeModel.model.id === id) {
      const def =
        catalog.models.find((m) => m.id === catalog.defaultSelectedModelId) ??
        catalog.models[0];
      setActiveModel({ kind: 'official', model: def });
    }
  };

  const recordBrewedModel = (brewed: BrewedModel) => {
    setActiveModel({ kind: 'brewed', model: brewed });
    setBrewedHistory((prev) => {
      const deduped = prev.filter(
        (item) => !(item.formula === brewed.formula && item.heat === brewed.heat)
      );
      return [brewed, ...deduped].slice(0, 12);
    });
    if (brewed.recipeId) {
      setDiscoveredIds((prev) =>
        prev.includes(brewed.recipeId!) ? prev : [...prev, brewed.recipeId!]
      );
    }
  };

  const handleBrew = () => {
    if (slots.length === 0 || isBrewing) return;
    setIsBrewing(true);
    setLastBrewed(null);
    setDetonationAftermath(null);

    const currentSlots = [...slots];
    const currentHeat = heat;
    const predictedReaction = evaluateReactionType(currentSlots, currentHeat, recipes);

    labSound.playBrewStart(predictedReaction);

    const buildUpDuration = predictedReaction === 'explosion' ? 1120 : 960;

    brewTimerRef.current = window.setTimeout(() => {
      const brewed = synthesizeBrew(currentSlots, currentHeat, recipes, catalog.seriesTitle);
      setIsBrewing(false);
      recordBrewedModel(brewed);

      if (brewed.reactionType === 'explosion') {
        const snapshot = captureExplosionRef.current?.();
        labSound.playExplosionBoom();
        setScreenShake(true);
        if (shakeTimerRef.current) window.clearTimeout(shakeTimerRef.current);
        shakeTimerRef.current = window.setTimeout(() => setScreenShake(false), 620);

        setIsLabOpen(false);
        setDetonationAftermath(brewed);

        if (snapshot) {
          setExplosion({
            id: Date.now(),
            epicenterX: snapshot.epicenterX,
            epicenterY: snapshot.epicenterY,
            color: snapshot.liquidColor,
            fragments: snapshot.fragments,
            brewed,
          });
        }
      } else {
        setLastBrewed(brewed);
        labSound.playBrewComplete(brewed.rarity);
      }
    }, buildUpDuration);
  };

  const handleSubmitPrompt = (overridePrompt?: string) => {
    const text = (overridePrompt ?? promptText).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setPromptText('');
    setMessages((prev) => [...prev, userMsg]);
    setIsLabOpen(false);
    setDetonationAftermath(null);

    const snapshotActive = activeModel;
    const snapshotHeat = heat;
    const activeLabels = getActiveModelLabels(snapshotActive, locale);

    window.setTimeout(() => {
      const reply = generateSimulatedReply(text, snapshotActive, snapshotHeat);
      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: reply.content,
        thinking: reply.thinking,
        modelLabel: activeLabels.displayName,
        modelAccent: snapshotActive.model.accent,
        modelFormula:
          snapshotActive.kind === 'brewed' ? snapshotActive.model.formula : undefined,
        heat: snapshotHeat,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    }, 260);
  };

  const handleLoadRecipe = (ingredients: string[], targetHeat?: HeatLevel) => {
    setSlots([...ingredients]);
    if (targetHeat) setHeat(targetHeat);
    setIsLabOpen(true);
    setLastBrewed(null);
    setDetonationAftermath(null);
    labSound.playDrop(36);
  };

  const handleRebuildLab = () => {
    setDetonationAftermath(null);
    setIsLabOpen(true);
    labSound.playSelect();
  };

  const handleAskWithActive = () => {
    setIsLabOpen(false);
    window.setTimeout(() => {
      promptInputRef.current?.focus();
    }, 80);
  };

  const activeGlowColor = useMemo(() => activeModel.model.accent, [activeModel]);
  const aftermathText = detonationAftermath
    ? getBrewedLabels(detonationAftermath, locale)
    : null;

  return (
    <>
      <div
        className={`app-shell ${screenShake ? 'screen-blast-shake' : ''} ${
          pureMode ? 'is-pure-mode' : ''
        }`}
        style={{ '--ambient-accent': activeGlowColor } as React.CSSProperties}
      >
        <div className="ambient-nebula" aria-hidden="true" />

        {pureMode ? (
          <div className="pure-corner-controls">
            <button
              type="button"
              className="pure-exit-pill"
              onClick={() => setLocale((l) => (l === 'zh' ? 'en' : 'zh'))}
              title={t.langSwitchTooltip}
            >
              <Languages size={13} />
              <span>{locale === 'zh' ? 'EN' : '中'}</span>
            </button>
            <button
              type="button"
              className="pure-exit-pill"
              onClick={() => setPureMode(false)}
              title={t.exitPureModeBtn}
            >
              <Eye size={13} />
              <span>{t.exitPureModeBtn}</span>
            </button>
          </div>
        ) : (
          <header className="top-nav">
            <div className="top-nav-left">
              <button
                type="button"
                className="brand-wordmark"
                onClick={() => {
                  setMessages([]);
                  setDetonationAftermath(null);
                  setIsLabOpen(true);
                }}
              >
                <span>Gemini</span>
                <span className="brand-chip">{t.brandChip}</span>
              </button>
            </div>

            <div className="top-nav-right">
              <button
                type="button"
                className="nav-pill-btn"
                onClick={() => setRecipeBookOpen(true)}
                title={t.recipeModalTitle}
              >
                <BookOpen size={14} />
                <span>{t.recipesBtn(discoveredIds.length, recipes.length)}</span>
              </button>

              <button
                type="button"
                className={`nav-pill-btn ${localCatalog ? 'has-draft' : ''}`}
                onClick={() => setManagerOpen(true)}
                title={t.managerTitle}
              >
                <SlidersHorizontal size={14} />
                <span>{t.manageModelsBtn}</span>
                {localCatalog && <span className="nav-draft-dot" />}
              </button>

              <button
                type="button"
                className="nav-pill-btn"
                onClick={() => setPureMode(true)}
                title={t.pureModeTooltip}
              >
                <EyeOff size={14} />
                <span>{t.pureModeBtn}</span>
              </button>

              <button
                type="button"
                className="nav-pill-btn lang-toggle-btn"
                onClick={() => setLocale((l) => (l === 'zh' ? 'en' : 'zh'))}
                title={t.langSwitchTooltip}
                aria-label={t.langSwitchTooltip}
              >
                <Languages size={14} />
                <span>{locale === 'zh' ? '中 / EN' : 'EN / 中'}</span>
              </button>

              <button
                type="button"
                className="nav-icon-btn"
                onClick={() => setSoundEnabled((s) => !s)}
                title={soundEnabled ? t.muteTooltip : t.unmuteTooltip}
                aria-label={soundEnabled ? t.muteTooltip : t.unmuteTooltip}
              >
                {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
              </button>
            </div>
          </header>
        )}

        {easterEggToast && (
          <div className="easter-egg-toast" role="status">
            {t.easterEggToast}
          </div>
        )}

        <main className={`stage-main ${messages.length > 0 ? 'has-chat' : ''}`}>
          {messages.length === 0 ? (
            <div className="hero-heading-wrap">
              <h1 className="hero-heading">{t.heroTitle}</h1>
            </div>
          ) : (
            <ChatView
              locale={locale}
              messages={messages}
              onClearChat={() => {
                setMessages([]);
                setDetonationAftermath(null);
                setIsLabOpen(true);
              }}
            />
          )}

          <div className="composer-cluster">
            <PromptBar
              locale={locale}
              value={promptText}
              activeModel={activeModel}
              isLabOpen={isLabOpen}
              hasChat={messages.length > 0}
              inputRef={promptInputRef}
              onChange={setPromptText}
              onSubmit={handleSubmitPrompt}
              onToggleLab={() => {
                setDetonationAftermath(null);
                setIsLabOpen((o) => !o);
              }}
              onTriggerEasterEgg={handleTriggerEasterEgg}
              onResetChat={() => {
                setMessages([]);
                setDetonationAftermath(null);
                setIsLabOpen(true);
              }}
            />

            {isLabOpen ? (
              <ModelLabPanel
                locale={locale}
                pureMode={pureMode}
                resonanceTick={resonanceTick}
                seriesTitle={catalog.seriesTitle}
                models={catalog.models}
                recipes={recipes}
                activeModel={activeModel}
                slots={slots}
                heat={heat}
                brewedHistory={brewedHistory}
                lastBrewed={lastBrewed}
                isBrewing={isBrewing}
                captureRef={captureExplosionRef}
                onClose={() => setIsLabOpen(false)}
                onSlotsChange={setSlots}
                onHeatChange={setHeat}
                onSelectOfficialModel={handleSelectOfficialModel}
                onSelectBrewedModel={handleSelectBrewedModel}
                onDeleteBrewedModel={handleDeleteBrewedModel}
                onBrew={handleBrew}
                onDismissResult={() => setLastBrewed(null)}
                onAskWithActive={handleAskWithActive}
              />
            ) : (
              messages.length === 0 && (
                <div className="underneath-home-ui">
                  <div className="underneath-chip-row">
                    <button
                      type="button"
                      className="home-mode-chip"
                      onClick={() => promptInputRef.current?.focus()}
                    >
                      <MessageSquare size={13} />
                      <span>{t.chatChip}</span>
                    </button>
                    <button
                      type="button"
                      className="home-mode-chip accent"
                      onClick={handleRebuildLab}
                    >
                      <Sparkles size={13} />
                      <span>{detonationAftermath ? t.rebuildLabChip : t.openLabChip}</span>
                    </button>
                  </div>

                  {detonationAftermath && aftermathText && !explosion && (
                    <div
                      className="aftermath-banner"
                      style={
                        {
                          '--aftermath-accent': detonationAftermath.accent,
                        } as React.CSSProperties
                      }
                    >
                      <div className="aftermath-head">
                        <AlertTriangle size={16} className="aftermath-icon" />
                        <strong>
                          {t.aftermathTitle(
                            aftermathText.displayName,
                            detonationAftermath.formula
                          )}
                        </strong>
                      </div>
                      <p>{aftermathText.description}</p>
                      <div className="aftermath-actions">
                        <button
                          type="button"
                          className="aftermath-rebuild-btn"
                          onClick={handleRebuildLab}
                        >
                          <RotateCcw size={13} />
                          <span>{t.aftermathRebuildBtn}</span>
                        </button>
                        <button
                          type="button"
                          className="secondary-btn compact"
                          onClick={() => promptInputRef.current?.focus()}
                        >
                          {t.askWithModel(aftermathText.shortName)}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="underneath-suggestions">
                    {t.underneathSuggestions.map((s) => (
                      <button
                        key={s}
                        type="button"
                        className="underneath-suggestion-row"
                        onClick={() => handleSubmitPrompt(s)}
                      >
                        <Sparkles size={13} className="suggestion-spark" />
                        <span>{s}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        </main>

        <ModelManagerDrawer
          locale={locale}
          open={managerOpen}
          catalog={catalog}
          hasLocalOverride={Boolean(localCatalog)}
          onClose={() => setManagerOpen(false)}
          onUpdateCatalog={handleUpdateCatalog}
          onResetCatalog={handleResetCatalog}
        />

        <RecipeBookModal
          locale={locale}
          open={recipeBookOpen}
          recipes={recipes}
          discoveredIds={discoveredIds}
          onClose={() => setRecipeBookOpen(false)}
          onLoadRecipe={handleLoadRecipe}
        />
      </div>

      <ExplosionOverlay payload={explosion} onComplete={() => setExplosion(null)} />
    </>
  );
};
export default App;
