import React, { useState } from 'react';
import { ChevronDown, ChevronRight, RotateCcw } from 'lucide-react';
import { TRANSLATIONS, type Locale } from '../i18n/translations';
import type { ChatMessage } from '../types/lab';
import { GeminiSparkle } from './GeminiSparkle';

interface ChatViewProps {
  locale: Locale;
  messages: ChatMessage[];
  onClearChat: () => void;
}

const ThinkingBlock: React.FC<{ text: string; label: string; accent?: string }> = ({
  text,
  label,
  accent,
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="chat-thinking">
      <button
        type="button"
        className="chat-thinking-toggle"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        <span style={accent ? { color: accent } : undefined}>{label}</span>
      </button>
      {open && <pre className="chat-thinking-body">{text}</pre>}
    </div>
  );
};

export const ChatView: React.FC<ChatViewProps> = ({ locale, messages, onClearChat }) => {
  const t = TRANSLATIONS[locale];
  if (messages.length === 0) return null;

  return (
    <div className="chat-stream">
      <div className="chat-stream-header">
        <span className="chat-stream-title">{t.chatSessionTitle}</span>
        <button type="button" className="chat-clear-btn" onClick={onClearChat}>
          <RotateCcw size={13} />
          <span>{t.newChatBtn}</span>
        </button>
      </div>

      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-bubble-row role-${msg.role}`}>
            {msg.role === 'assistant' && (
              <div className="chat-avatar">
                <GeminiSparkle size={18} color={msg.modelAccent} />
              </div>
            )}
            <div className="chat-bubble-content">
              {msg.role === 'assistant' && msg.modelLabel && (
                <div className="chat-model-meta">
                  <span
                    className="chat-model-name"
                    style={{ color: msg.modelAccent ?? '#a8c7fa' }}
                  >
                    {msg.modelLabel}
                  </span>
                  {msg.modelFormula && (
                    <span className="chat-model-formula">{msg.modelFormula}</span>
                  )}
                  {msg.heat && (
                    <span className="chat-model-heat">
                      {t.heatLevels[msg.heat]} {t.heatBadgeSuffix}
                    </span>
                  )}
                </div>
              )}

              {msg.thinking && (
                <ThinkingBlock
                  text={msg.thinking}
                  label={t.showThinking}
                  accent={msg.modelAccent}
                />
              )}

              <div className="chat-text">
                {msg.content.split('\n').map((line, i) => (
                  <p key={i} className={line.startsWith('>') ? 'chat-quote' : undefined}>
                    {line.replace(/^>\s?/, '') || '\u00A0'}
                  </p>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
