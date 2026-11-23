import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Dices,
  Flame,
  Radio,
  RotateCcw,
  Trash2,
  X,
  Zap,
} from 'lucide-react';
import { ELEMENT_BY_SYMBOL, ELEMENTS } from '../data/elements';
import { getBrewedLabels } from '../i18n/helpers';
import { TRANSLATIONS, type Locale } from '../i18n/translations';
import type {
  ActiveModel,
  BrewedModel,
  ChemicalElement,
  ExplosionFragment,
  FlyingAtom,
  GeminiModelConfig,
  HeatLevel,
  ModelStatus,
  RecipeConfig,
} from '../types/lab';
import {
  blendLiquidColor,
  evaluateReactionType,
  formatFormula,
  hasRadioactiveElements,
  matchRecipe,
} from '../utils/alchemy';
import { labSound } from '../utils/sound';
import { ErlenmeyerFlask } from './ErlenmeyerFlask';
import { FlyingAtomsLayer } from './FlyingAtomsLayer';
import { GeminiSparkle } from './GeminiSparkle';
import { PeriodicTable } from './PeriodicTable';

export interface SnapshotCapture {
  epicenterX: number;
  epicenterY: number;
  liquidColor: string;
  fragments: ExplosionFragment[];
}

interface ModelLabPanelProps {
  locale: Locale;
  pureMode: boolean;
  resonanceTick: number;
  seriesTitle: string;
  models: GeminiModelConfig[];
  recipes: RecipeConfig[];
  activeModel: ActiveModel;
  slots: string[];
  heat: HeatLevel;
  brewedHistory: BrewedModel[];
  lastBrewed: BrewedModel | null;
  isBrewing: boolean;
  captureRef: React.MutableRefObject<(() => SnapshotCapture) | null>;
  onClose: () => void;
  onSlotsChange: (nextSlots: string[]) => void;
  onHeatChange: (heat: HeatLevel) => void;
  onSelectOfficialModel: (model: GeminiModelConfig) => void;
  onSelectBrewedModel: (model: BrewedModel) => void;
  onDeleteBrewedModel: (id: string) => void;
  onBrew: () => void;
  onDismissResult: () => void;
  onAskWithActive: () => void;
}

type DropTarget = { type: 'flask' } | { type: 'slot'; index: number } | { type: 'bench' } | null;

interface DragSession {
  element: ChemicalElement;
  pointerStartX: number;
  pointerStartY: number;
  tileCenterX: number;
  tileCenterY: number;
  x: number;
  y: number;
  active: boolean;
  target: DropTarget;
}

const MAX_SLOTS = 6;

const HEAT_KEYS: HeatLevel[] = ['low', 'medium', 'high'];

export const ModelLabPanel: React.FC<ModelLabPanelProps> = ({
  locale,
  pureMode,
  resonanceTick,
  seriesTitle,
  models,
  recipes,
  activeModel,
  slots,
  heat,
  brewedHistory,
  lastBrewed,
  isBrewing,
  captureRef,
  onClose,
  onSlotsChange,
  onHeatChange,
  onSelectOfficialModel,
  onSelectBrewedModel,
  onDeleteBrewedModel,
  onBrew,
  onDismissResult,
  onAskWithActive,
}) => {
  const t = TRANSLATIONS[locale];

  const [hoveredElement, setHoveredElement] = useState<ChemicalElement | null>(null);
  const [statusFilter, setStatusFilter] = useState<ModelStatus | 'all'>('all');
  const [splashTick, setSplashTick] = useState(0);
  const [drag, setDrag] = useState<DragSession | null>(null);
  const [slotFullPulse, setSlotFullPulse] = useState(false);
  const [flyingAtoms, setFlyingAtoms] = useState<FlyingAtom[]>([]);

  const panelRef = useRef<HTMLElement | null>(null);
  const flaskRef = useRef<HTMLDivElement | null>(null);
  const neckAnchorRef = useRef<HTMLDivElement | null>(null);
  const slotsRowRef = useRef<HTMLDivElement | null>(null);
  const heatBarRef = useRef<HTMLDivElement | null>(null);
  const brewBtnRef = useRef<HTMLButtonElement | null>(null);
  const slotRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const dragRef = useRef<DragSession | null>(null);
  const slotsRef = useRef(slots);
  slotsRef.current = slots;

  const modelsBySymbol = useMemo(() => {
    const map: Record<string, GeminiModelConfig> = {};
    for (const m of models) {
      map[m.symbol] = m;
    }
    return map;
  }, [models]);

  const liquidColor = useMemo(
    () => blendLiquidColor(slots, heat, recipes),
    [slots, heat, recipes]
  );

  const isRadioactive = useMemo(() => hasRadioactiveElements(slots), [slots]);

  const reactionType = useMemo(
    () => evaluateReactionType(slots, heat, recipes),
    [slots, heat, recipes]
  );

  const previewMatch = useMemo(
    () => matchRecipe(slots, heat, recipes),
    [slots, heat, recipes]
  );

  const formulaPreview = useMemo(() => formatFormula(slots), [slots]);

  // Register live DOM bounding-box snapshot function for authentic rigid-body explosion!
  useEffect(() => {
    captureRef.current = () => {
      const fragments: ExplosionFragment[] = [];

      const flaskRect = flaskRef.current?.getBoundingClientRect();
      const epicenterX = flaskRect
        ? flaskRect.left + flaskRect.width / 2
        : window.innerWidth * 0.35;
      const epicenterY = flaskRect
        ? flaskRect.top + flaskRect.height * 0.65
        : window.innerHeight * 0.72;

      if (panelRef.current) {
        const tileNodes = panelRef.current.querySelectorAll<HTMLElement>('[data-symbol]');
        tileNodes.forEach((node) => {
          const rect = node.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) return;
          const sym = node.dataset.symbol ?? '';
          const el = ELEMENT_BY_SYMBOL[sym];
          const registered = modelsBySymbol[sym];
          fragments.push({
            id: `tile-${sym}`,
            kind: 'tile',
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height,
            symbol: sym,
            zhName: locale === 'zh' ? el?.zhName : undefined,
            atomicNumber: el?.atomicNumber,
            accent: registered?.accent ?? el?.liquidColor,
            isModel: Boolean(registered),
          });
        });

        const titleEl = panelRef.current.querySelector<HTMLElement>('.ptable-series-title');
        if (titleEl) {
          const r = titleEl.getBoundingClientRect();
          fragments.push({
            id: 'series-title',
            kind: 'title',
            x: r.left,
            y: r.top,
            width: r.width,
            height: r.height,
            label: seriesTitle,
          });
        }
      }

      slotsRef.current.forEach((sym, i) => {
        const node = slotRefs.current[i];
        if (!node) return;
        const r = node.getBoundingClientRect();
        const el = ELEMENT_BY_SYMBOL[sym];
        fragments.push({
          id: `slot-${i}-${sym}`,
          kind: 'slot',
          x: r.left,
          y: r.top,
          width: r.width,
          height: r.height,
          symbol: sym,
          zhName: locale === 'zh' ? el?.zhName : undefined,
          atomicNumber: el?.atomicNumber,
          accent: modelsBySymbol[sym]?.accent ?? el?.liquidColor,
          isModel: Boolean(modelsBySymbol[sym]),
        });
      });

      if (heatBarRef.current) {
        const r = heatBarRef.current.getBoundingClientRect();
        fragments.push({
          id: 'heat-bar',
          kind: 'heat-bar',
          x: r.left,
          y: r.top,
          width: r.width,
          height: r.height,
          heat,
          heatLabels: [t.heatLevels.low, t.heatLevels.medium, t.heatLevels.high],
        });
      }

      if (brewBtnRef.current) {
        const r = brewBtnRef.current.getBoundingClientRect();
        fragments.push({
          id: 'brew-btn',
          kind: 'brew-btn',
          x: r.left,
          y: r.top,
          width: r.width,
          height: r.height,
          label: t.brewingBtn,
          heat,
        });
      }

      return { epicenterX, epicenterY, liquidColor, fragments };
    };

    return () => {
      captureRef.current = null;
    };
  }, [captureRef, heat, liquidColor, locale, modelsBySymbol, seriesTitle, t]);

  const launchAtomIntoFlask = (el: ChemicalElement, originX: number, originY: number) => {
    const neckRect = neckAnchorRef.current?.getBoundingClientRect();
    const flaskRect = flaskRef.current?.getBoundingClientRect();
    if (!neckRect && !flaskRect) {
      setSplashTick((tVal) => tVal + 1);
      return;
    }
    const endX = neckRect
      ? neckRect.left + neckRect.width / 2
      : flaskRect!.left + flaskRect!.width / 2;
    const endY = neckRect ? neckRect.top + neckRect.height / 2 : flaskRect!.top + 38;

    const color = modelsBySymbol[el.symbol]?.accent ?? el.liquidColor;
    const atom: FlyingAtom = {
      id: Date.now() + Math.random(),
      symbol: el.symbol,
      atomicNumber: el.atomicNumber,
      color,
      startX: originX,
      startY: originY,
      endX,
      endY,
    };
    setFlyingAtoms((prev) => [...prev, atom]);
  };

  const handleAtomLanded = (id: number) => {
    setFlyingAtoms((prev) => prev.filter((a) => a.id !== id));
    setSplashTick((tVal) => tVal + 1);
  };

  useEffect(() => {
    if (!isBrewing) return;
    slotsRef.current.forEach((sym, i) => {
      const el = ELEMENT_BY_SYMBOL[sym];
      const slotNode = slotRefs.current[i];
      if (!el || !slotNode) return;
      const r = slotNode.getBoundingClientRect();
      window.setTimeout(() => {
        launchAtomIntoFlask(el, r.left + r.width / 2, r.top + r.height / 2);
      }, i * 95);
    });
  }, [isBrewing]);

  const addElementToSlot = (
    el: ChemicalElement,
    origin?: { x: number; y: number },
    targetSlotIndex?: number
  ) => {
    const current = [...slotsRef.current];

    if (typeof targetSlotIndex === 'number') {
      if (targetSlotIndex < current.length) {
        current[targetSlotIndex] = el.symbol;
      } else if (current.length < MAX_SLOTS) {
        current.push(el.symbol);
      } else {
        current[MAX_SLOTS - 1] = el.symbol;
      }
      onSlotsChange(current);
      if (origin) {
        launchAtomIntoFlask(el, origin.x, origin.y);
      } else {
        setSplashTick((tVal) => tVal + 1);
      }
      labSound.playDrop(el.atomicNumber);
      return;
    }

    if (current.length >= MAX_SLOTS) {
      setSlotFullPulse(true);
      setTimeout(() => setSlotFullPulse(false), 450);
      return;
    }
    current.push(el.symbol);
    onSlotsChange(current);
    if (origin) {
      launchAtomIntoFlask(el, origin.x, origin.y);
    } else {
      setSplashTick((tVal) => tVal + 1);
    }
    labSound.playDrop(el.atomicNumber);
  };

  const removeSlotAt = (index: number) => {
    const next = slots.filter((_, i) => i !== index);
    onSlotsChange(next);
    labSound.playRemove();
  };

  const clearSlots = () => {
    if (slots.length === 0) return;
    onSlotsChange([]);
    labSound.playRemove();
  };

  const loadPresetSupernova = () => {
    onSlotsChange(['U', 'Pu', 'Au', 'Fe', 'Og']);
    onHeatChange('high');
    setSplashTick((tVal) => tVal + 1);
    labSound.playDrop(118);
  };

  const loadRandomExperiment = () => {
    if (recipes.length > 0 && Math.random() < 0.6) {
      const r = recipes[Math.floor(Math.random() * recipes.length)];
      onSlotsChange([...r.ingredients]);
      if (r.requiredHeat && r.requiredHeat.length > 0) {
        onHeatChange(r.requiredHeat[0]);
      } else if (r.reactionType === 'explosion') {
        onHeatChange('high');
      } else if (r.reactionType === 'bubbling') {
        onHeatChange('low');
      }
      setSplashTick((tVal) => tVal + 1);
      labSound.playDrop(42);
      return;
    }
    const count = 2 + Math.floor(Math.random() * 2);
    const chosen: string[] = [];
    for (let i = 0; i < count; i++) {
      const el = ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)];
      chosen.push(el.symbol);
    }
    onSlotsChange(chosen);
    setSplashTick((tVal) => tVal + 1);
    labSound.playDrop(26);
  };

  const hitTestDropTarget = (x: number, y: number): DropTarget => {
    for (let i = 0; i < MAX_SLOTS; i++) {
      const el = slotRefs.current[i];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (
        x >= rect.left - 6 &&
        x <= rect.right + 6 &&
        y >= rect.top - 8 &&
        y <= rect.bottom + 8
      ) {
        return { type: 'slot', index: i };
      }
    }

    if (flaskRef.current) {
      const rect = flaskRef.current.getBoundingClientRect();
      if (
        x >= rect.left - 24 &&
        x <= rect.right + 24 &&
        y >= rect.top - 22 &&
        y <= rect.bottom + 20
      ) {
        return { type: 'flask' };
      }
    }

    if (slotsRowRef.current) {
      const rect = slotsRowRef.current.getBoundingClientRect();
      if (
        x >= rect.left - 14 &&
        x <= rect.right + 14 &&
        y >= rect.top - 14 &&
        y <= rect.bottom + 14
      ) {
        return { type: 'bench' };
      }
    }

    return null;
  };

  const handleTilePointerDown = (
    e: React.PointerEvent<HTMLButtonElement>,
    el: ChemicalElement
  ) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const session: DragSession = {
      element: el,
      pointerStartX: e.clientX,
      pointerStartY: e.clientY,
      tileCenterX: rect.left + rect.width / 2,
      tileCenterY: rect.top + rect.height / 2,
      x: e.clientX,
      y: e.clientY,
      active: false,
      target: null,
    };
    dragRef.current = session;
  };

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      const cur = dragRef.current;
      if (!cur) return;

      const dist = Math.hypot(e.clientX - cur.pointerStartX, e.clientY - cur.pointerStartY);
      if (!cur.active && dist >= 7) {
        cur.active = true;
      }

      if (cur.active) {
        cur.x = e.clientX;
        cur.y = e.clientY;
        cur.target = hitTestDropTarget(e.clientX, e.clientY);
        setDrag({ ...cur });
      }
    };

    const onPointerUp = () => {
      const cur = dragRef.current;
      if (!cur) return;
      dragRef.current = null;

      if (cur.active) {
        if (cur.target) {
          const origin = { x: cur.x, y: cur.y };
          if (cur.target.type === 'slot') {
            addElementToSlot(cur.element, origin, cur.target.index);
          } else {
            addElementToSlot(cur.element, origin);
          }
        }
        setDrag(null);
      } else {
        const official = modelsBySymbol[cur.element.symbol];
        if (official) {
          onSelectOfficialModel(official);
          labSound.playSelect();
        } else {
          addElementToSlot(cur.element, { x: cur.tileCenterX, y: cur.tileCenterY });
        }
      }
    };

    const onPointerCancel = () => {
      dragRef.current = null;
      setDrag(null);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerCancel);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerCancel);
    };
  }, [modelsBySymbol]);

  const handleTileDoubleClick = (el: ChemicalElement) => {
    if (modelsBySymbol[el.symbol]) {
      const tileNode = panelRef.current?.querySelector<HTMLElement>(
        `[data-symbol="${el.symbol}"]`
      );
      const r = tileNode?.getBoundingClientRect();
      addElementToSlot(
        el,
        r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : undefined
      );
    }
  };

  const isFlaskDragOver = Boolean(drag?.active && drag.target?.type === 'flask');

  const reactionIndicator = useMemo(() => {
    if (slots.length === 0) return null;
    const clsMap = {
      explosion: 'rx-explosion',
      volatile: 'rx-volatile',
      boiling: 'rx-boiling',
      bubbling: 'rx-bubbling',
    };
    return { text: t.reactionLabels[reactionType], cls: clsMap[reactionType] };
  }, [slots.length, reactionType, t]);

  const lastBrewedText = lastBrewed ? getBrewedLabels(lastBrewed, locale) : null;

  return (
    <section
      ref={panelRef}
      className={`model-lab-card ${pureMode ? 'pure-mode' : ''}`}
      aria-label={t.modelLabTitle}
    >
      <header className="model-lab-header">
        <div className="model-lab-title">
          <GeminiSparkle size={18} />
          <span>{t.modelLabTitle}</span>
        </div>

        <div className="model-lab-header-tools">
          {!pureMode && (
            <>
              <div className="status-filter-group" role="tablist" aria-label="Filter models">
                {(['all', 'released', 'preview', 'experimental'] as const).map((val) => (
                  <button
                    key={val}
                    type="button"
                    role="tab"
                    aria-selected={statusFilter === val}
                    className={`status-filter-chip ${statusFilter === val ? 'active' : ''}`}
                    onClick={() => setStatusFilter(val)}
                  >
                    {t.filterLabels[val]}
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="lab-icon-btn"
                onClick={loadRandomExperiment}
                title={t.surpriseTooltip}
              >
                <Dices size={14} />
                <span className="lab-icon-btn-text">{t.surpriseBtn}</span>
              </button>

              <button
                type="button"
                className="lab-icon-btn danger-hint"
                onClick={loadPresetSupernova}
                title={t.meltdownTooltip}
              >
                <Zap size={13} />
                <span className="lab-icon-btn-text">{t.meltdownBtn}</span>
              </button>
            </>
          )}

          <button
            type="button"
            className="lab-close-x"
            onClick={onClose}
            title={t.closeLabTooltip}
            aria-label={t.closeLabTooltip}
          >
            <X size={16} />
          </button>
        </div>
      </header>

      <PeriodicTable
        locale={locale}
        pureMode={pureMode}
        resonanceTick={resonanceTick}
        seriesTitle={seriesTitle}
        modelsBySymbol={modelsBySymbol}
        activeModel={activeModel}
        slots={slots}
        hoveredElement={hoveredElement}
        draggingSymbol={drag?.active ? drag.element.symbol : null}
        statusFilter={pureMode ? 'all' : statusFilter}
        onHoverElement={setHoveredElement}
        onTilePointerDown={handleTilePointerDown}
        onTileDoubleClick={handleTileDoubleClick}
      />

      {/* Bottom Lab Bench */}
      <div className="lab-bench">
        <div className="lab-bench-flask">
          <ErlenmeyerFlask
            liquidColor={liquidColor}
            slotCount={slots.length}
            heat={heat}
            reactionType={reactionType}
            isRadioactive={isRadioactive}
            isBrewing={isBrewing}
            isDragOver={isFlaskDragOver}
            splashTick={splashTick}
            dropHintText={t.dropHint}
            flaskRef={flaskRef}
            neckAnchorRef={neckAnchorRef}
          />
          {!pureMode && formulaPreview && (
            <div
              className="flask-formula-tag"
              style={{
                borderColor: `${liquidColor}66`,
                color: liquidColor,
              }}
            >
              {isRadioactive && <Radio size={11} className="rad-spin" />}
              <span>{formulaPreview}</span>
              {previewMatch && <span className="formula-spark">✦</span>}
            </div>
          )}
        </div>

        <div className="lab-bench-controls">
          <div
            ref={slotsRowRef}
            className={`slots-row ${slotFullPulse ? 'slots-full-shake' : ''} ${
              drag?.active ? 'slots-drag-active' : ''
            }`}
          >
            {Array.from({ length: MAX_SLOTS }).map((_, idx) => {
              const symbol = slots[idx];
              const el = symbol ? ELEMENT_BY_SYMBOL[symbol] : undefined;
              const registered = symbol ? modelsBySymbol[symbol] : undefined;
              const isOverThis =
                Boolean(drag?.active) &&
                drag?.target?.type === 'slot' &&
                drag.target.index === idx;
              const slotAccent = registered?.accent ?? el?.liquidColor;

              return (
                <button
                  key={idx}
                  ref={(node) => {
                    slotRefs.current[idx] = node;
                  }}
                  type="button"
                  className={[
                    'brew-slot',
                    el ? 'filled' : 'empty',
                    registered ? 'is-registered-slot' : '',
                    isOverThis ? 'slot-drag-over' : '',
                    isBrewing && el ? 'slot-absorbing' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  style={
                    el
                      ? ({
                          '--slot-accent': slotAccent,
                        } as React.CSSProperties)
                      : undefined
                  }
                  onClick={() => el && removeSlotAt(idx)}
                  disabled={!el || isBrewing}
                  title={
                    el
                      ? t.slotFilledTooltip(el.atomicNumber, el.name, el.zhName)
                      : t.slotEmptyTooltip(idx)
                  }
                >
                  {el ? (
                    <>
                      <span className="slot-num">{el.atomicNumber}</span>
                      <span className="slot-sym">{el.symbol}</span>
                      {locale === 'zh' && <span className="slot-zh">{el.zhName}</span>}
                      <span className="slot-remove-x" aria-hidden="true">
                        <X size={10} />
                      </span>
                    </>
                  ) : (
                    <span className="slot-plus" aria-hidden="true">
                      +
                    </span>
                  )}
                </button>
              );
            })}

            {slots.length > 0 && (
              <button
                type="button"
                className="slots-clear-btn"
                onClick={clearSlots}
                disabled={isBrewing}
                title={t.clearSlotsTooltip}
                aria-label={t.clearSlotsTooltip}
              >
                <RotateCcw size={13} />
              </button>
            )}
          </div>

          <div className="heat-row">
            <span className="heat-label">{t.heatLabel}</span>
            <div
              ref={heatBarRef}
              className="heat-segmented"
              role="radiogroup"
              aria-label={t.heatLabel}
            >
              {HEAT_KEYS.map((val) => (
                <button
                  key={val}
                  type="button"
                  role="radio"
                  aria-checked={heat === val}
                  className={`heat-pill heat-${val} ${heat === val ? 'active' : ''}`}
                  onClick={() => {
                    onHeatChange(val);
                    labSound.playHeat(val);
                  }}
                  disabled={isBrewing}
                >
                  {val === 'high' && heat === 'high' && (
                    <Flame size={12} className="heat-flame-icon" />
                  )}
                  <span>{t.heatLevels[val]}</span>
                </button>
              ))}
            </div>

            {!pureMode && reactionIndicator && (
              <span className={`reaction-preview-badge ${reactionIndicator.cls}`}>
                {reactionIndicator.text}
              </span>
            )}
          </div>
        </div>

        <div className="lab-bench-action">
          <button
            ref={brewBtnRef}
            type="button"
            className={[
              'brew-button',
              isBrewing ? `is-brewing brewing-${heat}` : '',
              reactionType === 'explosion' && isBrewing ? 'brewing-critical' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            disabled={slots.length === 0 || isBrewing}
            onClick={onBrew}
          >
            <span>{isBrewing ? t.brewingBtn : t.brewBtn}</span>
          </button>
        </div>
      </div>

      {/* Brew Result Reveal Card */}
      {lastBrewed && lastBrewedText && (
        <div
          className={`brew-result-card rarity-${lastBrewed.rarity}`}
          style={{ '--result-accent': lastBrewed.accent } as React.CSSProperties}
        >
          <div className="brew-result-top">
            <div className="brew-result-identity">
              <div className="brew-result-badge-row">
                <span className="brew-result-formula">{lastBrewed.formula}</span>
                <span className="brew-result-rarity">{lastBrewedText.badge}</span>
                <span className="brew-result-heat">
                  {t.heatLevels[lastBrewed.heat]} {t.heatBadgeSuffix}
                </span>
              </div>
              <h3 className="brew-result-name">{lastBrewedText.displayName}</h3>
              <p className="brew-result-desc">{lastBrewedText.description}</p>
            </div>
            <button
              type="button"
              className="brew-result-close"
              onClick={onDismissResult}
              aria-label="Close"
            >
              <X size={15} />
            </button>
          </div>

          <div className="brew-result-metrics">
            {(
              [
                [t.metrics.reasoning, lastBrewed.metrics.reasoning, false],
                [t.metrics.speed, lastBrewed.metrics.speed, false],
                [t.metrics.coding, lastBrewed.metrics.coding, false],
                [t.metrics.creativity, lastBrewed.metrics.creativity, false],
                [t.metrics.volatility, lastBrewed.volatility, true],
              ] as const
            ).map(([label, val, isVol]) => (
              <div key={label} className="metric-item">
                <div className="metric-meta">
                  <span>{label}</span>
                  <span>{val}</span>
                </div>
                <div className="metric-track">
                  <div
                    className={`metric-fill ${isVol && val >= 70 ? 'danger' : ''}`}
                    style={{ width: `${val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="brew-result-footer">
            <div className="brew-result-caps">
              {lastBrewedText.capabilities.map((c) => (
                <span key={c} className="cap-chip">
                  {c}
                </span>
              ))}
            </div>
            <button type="button" className="ask-brewed-btn" onClick={onAskWithActive}>
              <span>{t.askWithModel(lastBrewedText.shortName)}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Brewed Models Shelf */}
      {brewedHistory.length > 0 && (
        <div className="brewed-shelf">
          <span className="brewed-shelf-label">{t.brewedShelfLabel}</span>
          <div className="brewed-shelf-list">
            {brewedHistory.map((item) => {
              const itemText = getBrewedLabels(item, locale);
              const isSelected =
                activeModel.kind === 'brewed' && activeModel.model.id === item.id;
              return (
                <div
                  key={item.id}
                  className={`brewed-chip ${isSelected ? 'active' : ''}`}
                  style={{ '--chip-accent': item.accent } as React.CSSProperties}
                >
                  <button
                    type="button"
                    className="brewed-chip-main"
                    onClick={() => {
                      onSelectBrewedModel(item);
                      labSound.playSelect();
                    }}
                  >
                    <span className="brewed-chip-dot" />
                    <span className="brewed-chip-formula">{item.formula}</span>
                    <span className="brewed-chip-name">{itemText.shortName}</span>
                  </button>
                  <button
                    type="button"
                    className="brewed-chip-del"
                    onClick={() => onDeleteBrewedModel(item.id)}
                    title={t.removeBrewedTooltip}
                    aria-label={t.removeBrewedTooltip}
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <FlyingAtomsLayer atoms={flyingAtoms} onAtomLanded={handleAtomLanded} />

      {drag?.active && (
        <div
          className={`drag-ghost-tile ${drag.target ? 'over-target' : ''}`}
          style={
            {
              left: drag.x,
              top: drag.y,
              '--ghost-accent':
                modelsBySymbol[drag.element.symbol]?.accent ?? drag.element.liquidColor,
            } as React.CSSProperties
          }
          aria-hidden="true"
        >
          <span className="ghost-num">{drag.element.atomicNumber}</span>
          <span className="ghost-sym">{drag.element.symbol}</span>
        </div>
      )}
    </section>
  );
};
