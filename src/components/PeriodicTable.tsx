import React from 'react';
import { CATEGORY_LABELS, ELEMENTS } from '../data/elements';
import { getActiveModelLabels, getModelLabels } from '../i18n/helpers';
import { TRANSLATIONS, type Locale } from '../i18n/translations';
import type { ActiveModel, ChemicalElement, GeminiModelConfig, ModelStatus } from '../types/lab';

interface PeriodicTableProps {
  locale: Locale;
  pureMode: boolean;
  resonanceTick: number;
  seriesTitle: string;
  modelsBySymbol: Record<string, GeminiModelConfig>;
  activeModel: ActiveModel;
  slots: string[];
  hoveredElement: ChemicalElement | null;
  draggingSymbol: string | null;
  statusFilter: ModelStatus | 'all';
  onHoverElement: (el: ChemicalElement | null) => void;
  onTilePointerDown: (e: React.PointerEvent<HTMLButtonElement>, el: ChemicalElement) => void;
  onTileDoubleClick: (el: ChemicalElement) => void;
}

export const PeriodicTable: React.FC<PeriodicTableProps> = ({
  locale,
  pureMode,
  resonanceTick,
  seriesTitle,
  modelsBySymbol,
  activeModel,
  slots,
  hoveredElement,
  draggingSymbol,
  statusFilter,
  onHoverElement,
  onTilePointerDown,
  onTileDoubleClick,
}) => {
  const t = TRANSLATIONS[locale];

  const slotCounts = React.useMemo(() => {
    const map: Record<string, number> = {};
    for (const s of slots) {
      map[s] = (map[s] ?? 0) + 1;
    }
    return map;
  }, [slots]);

  const hoveredModel = hoveredElement ? modelsBySymbol[hoveredElement.symbol] : undefined;
  const hoveredModelText = hoveredModel ? getModelLabels(hoveredModel, locale) : undefined;
  const activeLabels = getActiveModelLabels(activeModel, locale);

  return (
    <div className="ptable-scroll-wrap">
      <div
        className={`ptable-grid ${locale === 'zh' ? 'locale-zh' : ''}`}
        role="grid"
        aria-label={locale === 'zh' ? 'Gemini 元素周期表' : 'Gemini Periodic Table of Elements'}
      >
        {/* Center Void: Series Title ("Gemini 4") + Live Element/Model Inspector */}
        <div className="ptable-void">
          <div className="ptable-series-row">
            <h2 className="ptable-series-title">{seriesTitle}</h2>
            {hoveredModel && hoveredModelText && (
              <span
                className="ptable-status-pill"
                style={{
                  borderColor: `${hoveredModel.accent}66`,
                  color: hoveredModel.accent,
                  backgroundColor: `${hoveredModel.accent}18`,
                }}
              >
                {t.statusBadges[hoveredModel.status]} · {hoveredModelText.tier}
              </span>
            )}
          </div>

          {hoveredElement ? (
            <div className="ptable-inspector">
              {hoveredModel && hoveredModelText ? (
                <>
                  <div className="inspector-primary">
                    <span className="inspector-num">#{hoveredElement.atomicNumber}</span>
                    <span className="inspector-name" style={{ color: hoveredModel.accent }}>
                      {hoveredModelText.displayName}
                    </span>
                    <span className="inspector-zh">
                      {locale === 'zh'
                        ? `${hoveredElement.name} · ${hoveredModel.releaseDate}`
                        : `${hoveredElement.zhName} · ${hoveredModel.releaseDate}`}
                    </span>
                  </div>
                  <p className="inspector-desc">{hoveredModelText.tagline}</p>
                  <div className="inspector-hint">{t.hoverModelHint}</div>
                </>
              ) : (
                <>
                  <div className="inspector-primary">
                    <span className="inspector-num">#{hoveredElement.atomicNumber}</span>
                    <span className="inspector-name">
                      {locale === 'zh' ? hoveredElement.zhName : hoveredElement.name}
                    </span>
                    <span className="inspector-zh">
                      {locale === 'zh' ? hoveredElement.name : hoveredElement.zhName}
                    </span>
                    <span className="inspector-cat">
                      {locale === 'zh'
                        ? CATEGORY_LABELS[hoveredElement.category].zh
                        : CATEGORY_LABELS[hoveredElement.category].en}
                    </span>
                    {hoveredElement.radioactive && (
                      <span className="inspector-rad">{t.radioactiveTag}</span>
                    )}
                  </div>
                  <div className="inspector-hint">{t.hoverRawHint}</div>
                </>
              )}
            </div>
          ) : !pureMode ? (
            <div className="ptable-inspector idle">
              <div className="inspector-primary">
                <span
                  className="inspector-active-dot"
                  style={{ backgroundColor: activeModel.model.accent }}
                />
                <span className="inspector-active-label">
                  {activeModel.kind === 'official'
                    ? `${activeLabels.displayName} — ${activeLabels.tagline}`
                    : `${activeLabels.displayName} (${activeModel.model.formula}) — ${activeLabels.tagline}`}
                </span>
              </div>
              <div className="inspector-hint">{t.idleLabHint}</div>
            </div>
          ) : null}
        </div>

        {/* Lanthanide / Actinide Range Markers */}
        <div
          className="ptable-range-marker"
          style={{ gridColumn: 3, gridRow: 6 }}
          aria-hidden="true"
        >
          57–71
        </div>
        <div
          className="ptable-range-marker"
          style={{ gridColumn: 3, gridRow: 7 }}
          aria-hidden="true"
        >
          89–103
        </div>

        {/* All 118 Chemical Elements */}
        {ELEMENTS.map((el) => {
          const model = modelsBySymbol[el.symbol];
          const modelText = model ? getModelLabels(model, locale) : undefined;
          const isModel = Boolean(model);
          const isFilteredOut =
            statusFilter !== 'all' && (!model || model.status !== statusFilter);

          const isSelected =
            activeModel.kind === 'official' && activeModel.model.symbol === el.symbol;
          const inSlotCount = slotCounts[el.symbol] ?? 0;
          const isBeingDragged = draggingSymbol === el.symbol;

          const gridRow = el.row <= 7 ? el.row : el.row + 1;
          const waveDelayMs = (el.col + el.row) * 26;

          return (
            <button
              key={`${el.symbol}-${resonanceTick}`}
              type="button"
              data-symbol={el.symbol}
              style={
                {
                  gridColumn: el.col,
                  gridRow,
                  '--tile-accent': model ? model.accent : el.liquidColor,
                  '--wave-delay': `${waveDelayMs}ms`,
                } as React.CSSProperties
              }
              className={[
                'ptable-tile',
                isModel ? 'is-model' : '',
                isSelected ? 'is-selected' : '',
                inSlotCount > 0 ? 'in-slot' : '',
                isBeingDragged ? 'is-dragging' : '',
                isFilteredOut ? 'is-dimmed' : '',
                resonanceTick > 0 ? 'is-resonating' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onPointerEnter={() => onHoverElement(el)}
              onPointerLeave={() => onHoverElement(null)}
              onPointerDown={(e) => onTilePointerDown(e, el)}
              onDoubleClick={() => onTileDoubleClick(el)}
              title={
                modelText
                  ? `${modelText.displayName} (${el.symbol}) — ${t.hoverModelHint}`
                  : `#${el.atomicNumber} ${el.zhName} ${el.name} (${el.symbol}) — ${t.hoverRawHint}`
              }
            >
              <span className="tile-num">{el.atomicNumber}</span>
              <span className="tile-sym">{el.symbol}</span>
              {locale === 'zh' && <span className="tile-zh">{el.zhName}</span>}
              {inSlotCount > 0 && (
                <span
                  className="tile-slot-dot"
                  title={
                    locale === 'zh'
                      ? `已入瓶 (×${inSlotCount})`
                      : `In flask (×${inSlotCount})`
                  }
                >
                  {inSlotCount > 1 ? inSlotCount : ''}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
