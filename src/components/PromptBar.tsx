import React, { useEffect, useRef, useState } from 'react';
import { ArrowUp, ChevronDown, ChevronUp, Mic, Plus, Sparkles } from 'lucide-react';
import { getActiveModelLabels } from '../i18n/helpers';
import { TRANSLATIONS, type Locale } from '../i18n/translations';
import type { ActiveModel } from '../types/lab';

interface PromptBarProps {
  locale: Locale;
  value: string;
  activeModel: ActiveModel;
  isLabOpen: boolean;
  hasChat: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onChange: (val: string) => void;
  onSubmit: (prompt?: string) => void;
  onToggleLab: () => void;
  onTriggerEasterEgg: () => void;
  onResetChat: () => void;
}

const HOLD_DURATION_MS = 550;

export const PromptBar: React.FC<PromptBarProps> = ({
  locale,
  value,
  activeModel,
  isLabOpen,
  hasChat,
  inputRef,
  onChange,
  onSubmit,
  onToggleLab,
  onTriggerEasterEgg,
  onResetChat,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [eggBurstKey, setEggBurstKey] = useState(0);

  const holdTimerRef = useRef<number | null>(null);
  const eggTriggeredRef = useRef(false);

  const t = TRANSLATIONS[locale];
  const activeText = getActiveModelLabels(activeModel, locale);

  const modelAccent = activeModel.model.accent;
  const modelSubBadge =
    activeModel.kind === 'brewed' ? activeModel.model.formula : undefined;

  const clearHold = () => {
    if (holdTimerRef.current) {
      window.clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    setIsHolding(false);
  };

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) window.clearTimeout(holdTimerRef.current);
    };
  }, []);

  const handlePillPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    eggTriggeredRef.current = false;
    setIsHolding(true);
    holdTimerRef.current = window.setTimeout(() => {
      eggTriggeredRef.current = true;
      setIsHolding(false);
      setEggBurstKey((k) => k + 1);
      onTriggerEasterEgg();
    }, HOLD_DURATION_MS);
  };

  const handlePillPointerUp = () => {
    clearHold();
  };

  const handlePillClick = () => {
    // If long-press Easter egg just fired, don't immediately toggle the lab back closed!
    if (eggTriggeredRef.current) {
      eggTriggeredRef.current = false;
      return;
    }
    onToggleLab();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && value.trim()) {
      e.preventDefault();
      setMenuOpen(false);
      onSubmit();
    }
  };

  return (
    <div className="prompt-bar-wrap">
      <div className={`prompt-bar ${isLabOpen ? 'lab-open' : ''}`}>
        <button
          type="button"
          className="prompt-plus-btn"
          onClick={() => {
            if (hasChat) {
              onResetChat();
            } else {
              setMenuOpen((o) => !o);
            }
          }}
          title={hasChat ? t.newChatTooltip : t.quickPromptsTooltip}
          aria-label={hasChat ? t.newChatTooltip : t.quickPromptsTooltip}
        >
          <Plus size={19} />
        </button>

        <input
          ref={inputRef}
          type="text"
          className="prompt-input"
          placeholder={t.askPlaceholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setMenuOpen(false)}
          aria-label={t.askPlaceholder}
        />

        <div className="prompt-bar-right">
          <button
            type="button"
            className={`model-selector-pill ${isLabOpen ? 'open' : ''} ${
              isHolding ? 'is-holding' : ''
            }`}
            onPointerDown={handlePillPointerDown}
            onPointerUp={handlePillPointerUp}
            onPointerLeave={clearHold}
            onPointerCancel={clearHold}
            onClick={handlePillClick}
            onContextMenu={(e) => e.preventDefault()}
            aria-expanded={isLabOpen}
            title={t.holdPillTooltip}
          >
            {/* Long-press Gemini charge sweep overlay */}
            <span className="pill-hold-fill" aria-hidden="true" />
            {eggBurstKey > 0 && (
              <span key={eggBurstKey} className="pill-egg-burst" aria-hidden="true" />
            )}

            <span
              className="model-pill-dot"
              style={{ backgroundColor: modelAccent, boxShadow: `0 0 8px ${modelAccent}` }}
            />
            <span className="model-pill-name">{activeText.shortName}</span>
            {modelSubBadge && <span className="model-pill-formula">{modelSubBadge}</span>}
            {isLabOpen ? (
              <ChevronUp size={15} className="model-pill-chevron" />
            ) : (
              <ChevronDown size={15} className="model-pill-chevron" />
            )}
          </button>

          {value.trim() ? (
            <button
              type="button"
              className="prompt-send-btn"
              onClick={() => {
                setMenuOpen(false);
                onSubmit();
              }}
              aria-label="Send"
            >
              <ArrowUp size={17} />
            </button>
          ) : (
            <button
              type="button"
              className="prompt-mic-btn"
              onClick={() => setMenuOpen((o) => !o)}
              title={t.quickPromptsTooltip}
              aria-label={t.quickPromptsTooltip}
            >
              <Mic size={18} />
            </button>
          )}
        </div>
      </div>

      {menuOpen && (
        <div className="quick-prompts-popover">
          <div className="quick-prompts-title">
            <Sparkles size={13} />
            <span>{t.quickPromptsTitle(activeText.displayName)}</span>
          </div>
          {t.samplePrompts.map((q) => (
            <button
              key={q}
              type="button"
              className="quick-prompt-item"
              onClick={() => {
                setMenuOpen(false);
                onSubmit(q);
              }}
            >
              {q}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
