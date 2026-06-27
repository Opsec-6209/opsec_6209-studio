import { html } from '../services/html';
import { useState, useRef, useEffect } from 'preact/hooks';
import { useAI } from '../hooks/useAI';
import type { Settings } from '../../shared/types';

interface AIChatProps {
  settings: Settings;
  updateSettings: (s: Partial<Settings>) => void;
  activeTabContent?: string;
}

function formatMarkdown(text: string): any[] {
  const segments: any[] = [];
  let lastIdx = 0;
  const codeBlockRegex = /```(\w*)\r?\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      segments.push(...formatInline(text.slice(lastIdx, match.index)));
    }
    const lang = match[1] || '';
    const code = match[2];
    segments.push(renderCodeBlock(lang, code));
    lastIdx = match.index + match[0].length;
  }

  if (lastIdx < text.length) {
    segments.push(...formatInline(text.slice(lastIdx)));
  }

  return segments.length > 0 ? segments : [text];
}

function formatInline(text: string): any[] {
  const parts: any[] = [];
  let lastIdx = 0;
  const inlineRegex = /(\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`)/g;
  let match: RegExpExecArray | null;

  while ((match = inlineRegex.exec(text)) !== null) {
    if (match.index > lastIdx) {
      parts.push(text.slice(lastIdx, match.index));
    }

    if (match[2] !== undefined) {
      parts.push(html`<strong style=${{ fontWeight: 600 }}>${match[2]}</strong>`);
    } else if (match[3] !== undefined) {
      parts.push(html`<em style=${{ fontStyle: 'italic' }}>${match[3]}</em>`);
    } else if (match[4] !== undefined) {
      parts.push(html`<code style=${{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.9em',
        background: 'var(--accent-soft)',
        padding: '1px 5px',
        borderRadius: 3,
      }}>${match[4]}</code>`);
    }

    lastIdx = match.index + match[0].length;
  }

  if (lastIdx < text.length) {
    parts.push(text.slice(lastIdx));
  }

  return parts;
}

function renderCodeBlock(lang: string, code: string) {
  return html`
    <div style=${{
      margin: '8px 0',
      borderRadius: 'var(--radius-sm)',
      overflow: 'hidden',
      border: '1px solid var(--border)',
    }}>
      <div style=${{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '4px 10px',
        background: 'var(--surface-active)',
        borderBottom: '1px solid var(--border)',
        fontSize: 11,
        color: 'var(--text-muted)',
      }}>
        <span style=${{ fontFamily: 'var(--font-mono)', fontSize: 10 }}>${lang || 'code'}</span>
        <button
          onClick=${(e: MouseEvent) => {
            navigator.clipboard.writeText(code);
            const btn = e.currentTarget as HTMLElement;
            btn.textContent = 'Copied!';
            setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
          }}
          style=${{
            padding: '1px 8px',
            borderRadius: 'var(--radius-sm)',
            background: 'transparent',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: 10,
            transition: 'all 150ms var(--ease-smooth)',
          }}
          onMouseEnter=${(e: any) => { e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.color = 'var(--text)'; }}
          onMouseLeave=${(e: any) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >Copy</button>
      </div>
      <pre style=${{
        margin: 0,
        padding: '10px',
        background: 'rgba(0,0,0,0.3)',
        color: 'var(--text)',
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        lineHeight: 1.5,
        overflow: 'auto',
        whiteSpace: 'pre',
        tabSize: 2,
      }}><code>${code}</code></pre>
    </div>
  `;
}

export function AIChat({ settings, updateSettings, activeTabContent }: AIChatProps) {
  const { messages, isLoading, streamingContent, error, sendMessage, clearChat } = useAI(settings);
  const [input, setInput] = useState('');
  const [showSettings, setShowSettings] = useState(!settings.ai.apiKey);
  const [localKey, setLocalKey] = useState(settings.ai.apiKey);
  const [localModel, setLocalModel] = useState(settings.ai.model);
  const [localEndpoint, setLocalEndpoint] = useState(settings.ai.endpoint);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input.trim(), activeTabContent);
    setInput('');
  };

  const saveAISettings = () => {
    updateSettings({
      ai: {
        ...settings.ai,
        apiKey: localKey,
        model: localModel,
        endpoint: localEndpoint,
      },
    });
    setShowSettings(false);
  };

  return html`<div style=${{
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
  }}>
    <div style=${{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 'var(--space-sm) var(--space-md)',
      borderBottom: '1px solid var(--border)',
      fontSize: 11,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      color: 'var(--text-muted)',
    }}>
      <span>AI Chat</span>
      <div style=${{ display: 'flex', gap: 4 }}>
        <button
          onClick=${() => setShowSettings(!showSettings)}
          style=${{
            padding: '2px 6px',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: 14,
            transition: 'all 200ms var(--ease-smooth)',
          }}
          title="Settings"
        >⚙</button>
        <button
          onClick=${clearChat}
          style=${{
            padding: '2px 6px',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: 14,
            transition: 'all 200ms var(--ease-smooth)',
          }}
          title="Clear Chat"
        >🗑</button>
      </div>
    </div>

    ${showSettings && html`<div style=${{
      padding: 'var(--space-md)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
    }}>
      <input
        type="password"
        value=${localKey}
        onInput=${(e: any) => setLocalKey(e.target.value)}
        placeholder="API Key"
        style=${{
          background: 'var(--surface-hover)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          padding: '6px 10px',
          color: 'var(--text)',
          fontSize: 12,
          outline: 'none',
        }}
      />
      <input
        type="text"
        value=${localEndpoint}
        onInput=${(e: any) => setLocalEndpoint(e.target.value)}
        placeholder="Endpoint URL"
        style=${{
          background: 'var(--surface-hover)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          padding: '6px 10px',
          color: 'var(--text)',
          fontSize: 12,
          outline: 'none',
        }}
      />
      <input
        type="text"
        value=${localModel}
        onInput=${(e: any) => setLocalModel(e.target.value)}
        placeholder="Model name (e.g. gpt-4)"
        style=${{
          background: 'var(--surface-hover)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          padding: '6px 10px',
          color: 'var(--text)',
          fontSize: 12,
          outline: 'none',
        }}
      />
      <button
        onClick=${saveAISettings}
        style=${{
          padding: '6px 12px',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--accent)',
          color: '#fff',
          fontSize: 12,
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'all 200ms var(--ease-smooth)',
        }}
      >
        Save Settings
      </button>
    </div>`}

    <div style=${{ flex: 1, overflow: 'auto', padding: 'var(--space-md)' }}>
      ${messages.length === 0 && !isLoading && html`<div style=${{
        textAlign: 'center',
        color: 'var(--text-subtle)',
        fontSize: 12,
        padding: '24px 0',
        animation: 'fade-up 500ms var(--ease-smooth)',
      }}>
        <div style=${{ fontSize: 28, marginBottom: 8 }}>🤖</div>
        <div>Ask me anything about your code</div>
      </div>`}

      ${messages.map((msg, i) => html`<div
        key=${i}
        class=${`stagger-${Math.min(i + 1, 5)}`}
        style=${{
          marginBottom: 12,
          display: 'flex',
          flexDirection: 'column',
          alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
        }}
      >
        <div style=${{
          maxWidth: '90%',
          padding: '8px 12px',
          borderRadius: msg.role === 'user'
            ? 'var(--radius-md) var(--radius-md) 2px var(--radius-md)'
            : 'var(--radius-md) var(--radius-md) var(--radius-md) 2px',
          background: msg.role === 'user' ? 'var(--accent-soft)' : 'var(--surface-hover)',
          color: 'var(--text)',
          fontSize: 12,
          lineHeight: 1.5,
          whiteSpace: msg.role === 'user' ? 'pre-wrap' : 'normal',
          wordBreak: 'break-word',
        }}>
          ${msg.role === 'user' ? msg.content : formatMarkdown(msg.content)}
        </div>
      </div>`)}

      ${isLoading && streamingContent && html`<div style=${{
        marginBottom: 12,
        padding: '8px 12px',
        maxWidth: '90%',
        borderRadius: 'var(--radius-md)',
        background: 'var(--surface-hover)',
        color: 'var(--text)',
        fontSize: 12,
        lineHeight: 1.5,
        wordBreak: 'break-word',
      }}>
        ${formatMarkdown(streamingContent)}
        <span style=${{
          display: 'inline-block',
          width: 8,
          height: 16,
          background: 'var(--accent)',
          marginLeft: 2,
          verticalAlign: 'text-bottom',
          animation: 'dot-pulse 1s infinite',
          borderRadius: 1,
        }} />
      </div>`}

      ${isLoading && !streamingContent && html`<div style=${{ padding: 12, display: 'flex', gap: 4 }}>
        <div style=${{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'dot-pulse 0.6s infinite' }} />
        <div style=${{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'dot-pulse 0.6s infinite 0.2s' }} />
        <div style=${{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'dot-pulse 0.6s infinite 0.4s' }} />
      </div>`}

      ${error && html`<div style=${{
        padding: 8,
        borderRadius: 'var(--radius-sm)',
        background: 'rgba(239, 68, 68, 0.1)',
        color: 'var(--error)',
        fontSize: 12,
        marginBottom: 8,
      }}>
        ${error}
      </div>`}

      <div ref=${messagesEndRef} />
    </div>

    <div style=${{
      padding: 'var(--space-sm) var(--space-md)',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      gap: 8,
    }}>
      <input
        type="text"
        value=${input}
        onInput=${(e: any) => setInput(e.target.value)}
        onKeyDown=${(e: KeyboardEvent) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
        placeholder=${settings.ai.apiKey ? 'Ask about your code...' : 'Configure API key first...'}
        disabled=${!settings.ai.apiKey || isLoading}
        style=${{
          flex: 1,
          background: 'var(--surface-hover)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          padding: '6px 10px',
          color: 'var(--text)',
          fontSize: 12,
          outline: 'none',
          opacity: settings.ai.apiKey ? 1 : 0.5,
        }}
      />
      <button
        onClick=${handleSend}
        disabled=${!input.trim() || isLoading}
        style=${{
          padding: '6px 12px',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--accent)',
          color: '#fff',
          fontSize: 12,
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'all 200ms var(--ease-smooth)',
          opacity: input.trim() && !isLoading ? 1 : 0.5,
        }}
      >
        Send
      </button>
    </div>
  </div>`;
}
