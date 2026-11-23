import React, { useMemo, useRef, useState } from 'react';
import {
  Check,
  CloudUpload,
  Copy,
  Download,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { ELEMENT_BY_SYMBOL, ELEMENTS } from '../data/elements';
import { getModelLabels } from '../i18n/helpers';
import { TRANSLATIONS, type Locale } from '../i18n/translations';
import type {
  GeminiModelConfig,
  HeatLevel,
  ModelCatalogConfig,
  ModelStatus,
} from '../types/lab';

interface ModelManagerDrawerProps {
  locale: Locale;
  open: boolean;
  catalog: ModelCatalogConfig;
  hasLocalOverride: boolean;
  onClose: () => void;
  onUpdateCatalog: (next: ModelCatalogConfig) => void;
  onResetCatalog: () => void;
}

const ACCENT_PRESETS = [
  '#4c8bf5',
  '#a855f7',
  '#22d3ee',
  '#34d399',
  '#818cf8',
  '#f59e0b',
  '#f43f5e',
  '#38bdf8',
  '#a3e635',
  '#fb923c',
];

const EMPTY_FORM = (seriesTitle: string): GeminiModelConfig => ({
  id: '',
  symbol: 'O',
  atomicNumber: 8,
  name: 'Oxygen',
  displayName: `${seriesTitle} Oxygen`,
  series: seriesTitle,
  status: 'released',
  tier: 'Flash',
  accent: '#38bdf8',
  releaseDate: new Date().toISOString().slice(0, 7),
  tagline: 'Fast, breathable multimodal intelligence',
  description: 'Next-generation Gemini element model added via Model Lab Catalog Manager.',
  capabilities: ['Fast', 'Multimodal', '1M Context'],
  metrics: { reasoning: 88, speed: 95, coding: 90, creativity: 88 },
  defaultHeat: 'medium',
});

export const ModelManagerDrawer: React.FC<ModelManagerDrawerProps> = ({
  locale,
  open,
  catalog,
  hasLocalOverride,
  onClose,
  onUpdateCatalog,
  onResetCatalog,
}) => {
  const t = TRANSLATIONS[locale];
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<GeminiModelConfig>(() => EMPTY_FORM(catalog.seriesTitle));
  const [capsInput, setCapsInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const usedSymbols = useMemo(
    () =>
      new Set(
        catalog.models
          .filter((m) => m.id !== editingId)
          .map((m) => m.symbol)
      ),
    [catalog.models, editingId]
  );

  if (!open) return null;

  const startCreate = () => {
    const firstUnused =
      ELEMENTS.find((e) => e.symbol === 'O' && !usedSymbols.has('O')) ??
      ELEMENTS.find((e) => !usedSymbols.has(e.symbol)) ??
      ELEMENTS[0];

    const series = catalog.seriesTitle || 'Gemini 4';
    const slug = `${series.toLowerCase().replace(/\s+/g, '-')}-${firstUnused.name.toLowerCase()}`;
    const draft: GeminiModelConfig = {
      ...EMPTY_FORM(series),
      id: slug,
      symbol: firstUnused.symbol,
      atomicNumber: firstUnused.atomicNumber,
      name: firstUnused.name,
      displayName: `${series} ${firstUnused.name}`,
      accent: firstUnused.liquidColor,
    };
    setForm(draft);
    setCapsInput(draft.capabilities.join(', '));
    setEditingId(null);
    setIsCreating(true);
  };

  const startEdit = (model: GeminiModelConfig) => {
    setForm({ ...model, metrics: { ...model.metrics }, capabilities: [...model.capabilities] });
    setCapsInput(model.capabilities.join(', '));
    setEditingId(model.id);
    setIsCreating(false);
  };

  const cancelEdit = () => {
    setIsCreating(false);
    setEditingId(null);
  };

  const handleElementPick = (symbol: string) => {
    const el = ELEMENT_BY_SYMBOL[symbol];
    if (!el) return;
    const series = catalog.seriesTitle || 'Gemini 4';
    const slug = `${series.toLowerCase().replace(/\s+/g, '-')}-${el.name.toLowerCase()}`;
    setForm((prev) => ({
      ...prev,
      symbol: el.symbol,
      atomicNumber: el.atomicNumber,
      name: el.name,
      displayName: `${series} ${el.name}`,
      id: isCreating ? slug : prev.id,
      accent: isCreating ? el.liquidColor : prev.accent,
    }));
  };

  const handleSaveModel = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedCaps = capsInput
      .split(/[,，]/)
      .map((s) => s.trim())
      .filter(Boolean);

    const series = catalog.seriesTitle || 'Gemini 4';
    const finalModel: GeminiModelConfig = {
      ...form,
      id:
        form.id.trim() ||
        `${series.toLowerCase().replace(/\s+/g, '-')}-${form.name.toLowerCase()}`,
      series,
      capabilities: cleanedCaps.length > 0 ? cleanedCaps : ['General Purpose'],
    };

    const nextModels = isCreating
      ? [...catalog.models, finalModel]
      : catalog.models.map((m) => (m.id === editingId ? finalModel : m));

    onUpdateCatalog({
      ...catalog,
      updatedAt: new Date().toISOString().slice(0, 10),
      models: nextModels,
    });
    cancelEdit();
  };

  const handleDeleteModel = (id: string) => {
    if (catalog.models.length <= 1) return;
    const nextModels = catalog.models.filter((m) => m.id !== id);
    const nextDefault =
      catalog.defaultSelectedModelId === id ? nextModels[0].id : catalog.defaultSelectedModelId;
    onUpdateCatalog({
      ...catalog,
      defaultSelectedModelId: nextDefault,
      updatedAt: new Date().toISOString().slice(0, 10),
      models: nextModels,
    });
    if (editingId === id) cancelEdit();
  };

  const handleSeriesTitleChange = (title: string) => {
    onUpdateCatalog({
      ...catalog,
      seriesTitle: title,
      updatedAt: new Date().toISOString().slice(0, 10),
    });
  };

  const exportJsonText = JSON.stringify(catalog, null, 2);

  const handleDownloadJson = () => {
    const blob = new Blob([exportJsonText], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'models.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(exportJsonText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback ignored
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as ModelCatalogConfig;
        if (!parsed.models || !Array.isArray(parsed.models) || parsed.models.length === 0) {
          throw new Error('JSON must contain a non-empty "models" array.');
        }
        onUpdateCatalog(parsed);
      } catch (err) {
        setImportError(err instanceof Error ? err.message : 'Invalid JSON file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const metricLabelMap = {
    reasoning: t.metrics.reasoning,
    speed: t.metrics.speed,
    coding: t.metrics.coding,
    creativity: t.metrics.creativity,
  };

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside
        className="drawer-panel"
        onClick={(e) => e.stopPropagation()}
        aria-label={t.managerTitle}
      >
        <header className="drawer-header">
          <div>
            <div className="drawer-title-row">
              <h3>{t.managerTitle}</h3>
              {hasLocalOverride && <span className="draft-badge">{t.localDraftBadge}</span>}
            </div>
            <p className="drawer-subtitle">{t.managerSubtitle}</p>
          </div>
          <button type="button" className="drawer-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <div className="drawer-body">
          <div className="manager-section">
            <label className="field-label">
              <span>{t.seriesTitleLabel}</span>
              <input
                type="text"
                className="text-input"
                value={catalog.seriesTitle}
                onChange={(e) => handleSeriesTitleChange(e.target.value)}
                placeholder={t.seriesTitlePlaceholder}
              />
            </label>
          </div>

          {isCreating || editingId ? (
            <form className="manager-form" onSubmit={handleSaveModel}>
              <div className="form-header">
                <h4>{isCreating ? t.createFormTitle : t.editFormTitle(form.displayName)}</h4>
                <button type="button" className="link-btn" onClick={cancelEdit}>
                  {t.cancelBtn}
                </button>
              </div>

              <div className="form-grid-2">
                <label className="field-label">
                  <span>{t.elementField}</span>
                  <select
                    className="text-input"
                    value={form.symbol}
                    onChange={(e) => handleElementPick(e.target.value)}
                  >
                    {ELEMENTS.map((el) => {
                      const taken = usedSymbols.has(el.symbol);
                      return (
                        <option key={el.symbol} value={el.symbol} disabled={taken}>
                          #{el.atomicNumber} {el.symbol} — {el.zhName} ({el.name})
                          {taken ? ` ${t.inUseTag}` : ''}
                        </option>
                      );
                    })}
                  </select>
                </label>

                <label className="field-label">
                  <span>{t.statusField}</span>
                  <select
                    className="text-input"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as ModelStatus })}
                  >
                    {(['released', 'preview', 'experimental', 'rumored', 'deprecated'] as const).map(
                      (st) => (
                        <option key={st} value={st}>
                          {t.statusOptions[st]}
                        </option>
                      )
                    )}
                  </select>
                </label>
              </div>

              <div className="form-grid-2">
                <label className="field-label">
                  <span>{t.shortNameField}</span>
                  <input
                    type="text"
                    className="text-input"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </label>

                <label className="field-label">
                  <span>{t.displayNameField}</span>
                  <input
                    type="text"
                    className="text-input"
                    value={form.displayName}
                    onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                    required
                  />
                </label>
              </div>

              <div className="form-grid-3">
                <label className="field-label">
                  <span>{t.tierField}</span>
                  <input
                    type="text"
                    className="text-input"
                    value={form.tier}
                    onChange={(e) => setForm({ ...form, tier: e.target.value })}
                    placeholder="Fast / Frontier"
                  />
                </label>

                <label className="field-label">
                  <span>{t.releaseDateField}</span>
                  <input
                    type="text"
                    className="text-input"
                    value={form.releaseDate}
                    onChange={(e) => setForm({ ...form, releaseDate: e.target.value })}
                    placeholder="2026-12"
                  />
                </label>

                <label className="field-label">
                  <span>{t.defaultHeatField}</span>
                  <select
                    className="text-input"
                    value={form.defaultHeat}
                    onChange={(e) =>
                      setForm({ ...form, defaultHeat: e.target.value as HeatLevel })
                    }
                  >
                    <option value="low">{t.heatLevels.low}</option>
                    <option value="medium">{t.heatLevels.medium}</option>
                    <option value="high">{t.heatLevels.high}</option>
                  </select>
                </label>
              </div>

              <div className="field-label">
                <span>{t.accentColorField}</span>
                <div className="color-picker-row">
                  <input
                    type="color"
                    className="native-color"
                    value={form.accent}
                    onChange={(e) => setForm({ ...form, accent: e.target.value })}
                  />
                  <div className="color-swatches">
                    {ACCENT_PRESETS.map((c) => (
                      <button
                        key={c}
                        type="button"
                        className={`color-swatch ${form.accent.toLowerCase() === c ? 'active' : ''}`}
                        style={{ backgroundColor: c }}
                        onClick={() => setForm({ ...form, accent: c })}
                        aria-label={`Color ${c}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <label className="field-label">
                <span>{t.taglineField}</span>
                <input
                  type="text"
                  className="text-input"
                  value={form.tagline}
                  onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                  required
                />
              </label>

              <label className="field-label">
                <span>{t.capabilitiesField}</span>
                <input
                  type="text"
                  className="text-input"
                  value={capsInput}
                  onChange={(e) => setCapsInput(e.target.value)}
                  placeholder="深度思考, 2M 上下文, 高速编程"
                />
              </label>

              <div className="metrics-sliders">
                {(['reasoning', 'speed', 'coding', 'creativity'] as const).map((k) => (
                  <label key={k} className="slider-row">
                    <span>
                      {metricLabelMap[k]}: <strong>{form.metrics[k]}</strong>
                    </span>
                    <input
                      type="range"
                      min={40}
                      max={100}
                      value={form.metrics[k]}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          metrics: { ...form.metrics, [k]: Number(e.target.value) },
                        })
                      }
                    />
                  </label>
                ))}
              </div>

              <div className="form-actions">
                <button type="submit" className="primary-btn">
                  {isCreating ? t.addToTableBtn : t.saveChangesBtn}
                </button>
              </div>
            </form>
          ) : (
            <div className="manager-section">
              <div className="section-head-row">
                <h4>{t.registeredModelsTitle(catalog.models.length)}</h4>
                <button type="button" className="add-model-btn" onClick={startCreate}>
                  <Plus size={14} />
                  <span>{t.addNewModelBtn}</span>
                </button>
              </div>

              <div className="registered-list">
                {catalog.models.map((m) => {
                  const mText = getModelLabels(m, locale);
                  return (
                    <div
                      key={m.id}
                      className="registered-item"
                      style={{ '--item-accent': m.accent } as React.CSSProperties}
                    >
                      <div className="registered-tile-badge">
                        <span className="rb-num">{m.atomicNumber}</span>
                        <span className="rb-sym">{m.symbol}</span>
                      </div>
                      <div className="registered-info">
                        <div className="registered-name-row">
                          <strong>{mText.displayName}</strong>
                          <span className="registered-status">{t.statusBadges[m.status]}</span>
                        </div>
                        <p>{mText.tagline}</p>
                      </div>
                      <div className="registered-actions">
                        <button
                          type="button"
                          className="icon-action"
                          onClick={() => startEdit(m)}
                          title={t.editFormTitle(mText.displayName)}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          className="icon-action danger"
                          disabled={catalog.models.length <= 1}
                          onClick={() => handleDeleteModel(m.id)}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="manager-section deploy-box">
            <div className="deploy-box-title">
              <CloudUpload size={15} />
              <span>{t.deployTitle}</span>
            </div>
            <p className="deploy-box-desc">{t.deployDesc}</p>

            <div className="export-actions">
              <button type="button" className="secondary-btn" onClick={handleDownloadJson}>
                <Download size={14} />
                <span>{t.downloadJsonBtn}</span>
              </button>
              <button type="button" className="secondary-btn" onClick={handleCopyJson}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? t.copiedBtn : t.copyJsonBtn}</span>
              </button>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={14} />
                <span>{t.importJsonBtn}</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                className="hidden-input"
                onChange={handleImportFile}
              />
            </div>

            {importError && <p className="import-error">{importError}</p>}

            {hasLocalOverride && (
              <button type="button" className="reset-link-btn" onClick={onResetCatalog}>
                <RotateCcw size={13} />
                <span>{t.resetDraftBtn}</span>
              </button>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
};
