import { html } from '../services/html';
import { useState } from 'preact/hooks';
import type { Settings } from '../../shared/types';

interface SettingsPanelProps {
  settings: Settings;
  updateSettings: (s: Partial<Settings>) => void;
  onClose: () => void;
}

type SettingsTab = 'editor' | 'appearance' | 'terminal' | 'ai';

const overlayStyle: h.JSX.CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 200,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(0, 0, 0, 0.5)',
  animation: 'fade-in 200ms var(--ease-smooth)',
};

const panelStyle: h.JSX.CSSProperties = {
  width: 520,
  maxHeight: '80vh',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-xl)',
  boxShadow: 'var(--shadow-lg)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  animation: 'scale-in 200ms var(--ease-smooth)',
};

const headerStyle: h.JSX.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: 'var(--space-md) var(--space-lg)',
  borderBottom: '1px solid var(--border)',
  flexShrink: 0,
};

const tabBarStyle: h.JSX.CSSProperties = {
  display: 'flex',
  gap: 0,
  borderBottom: '1px solid var(--border)',
  flexShrink: 0,
  padding: '0 var(--space-md)',
};

const contentStyle: h.JSX.CSSProperties = {
  padding: 'var(--space-lg)',
  overflow: 'auto',
  flex: 1,
};

const labelStyle: h.JSX.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: 'var(--text-muted)',
  marginBottom: 6,
};

const inputStyle: h.JSX.CSSProperties = {
  width: '100%',
  padding: '6px 10px',
  background: 'var(--bg)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--text)',
  fontSize: 13,
  outline: 'none',
  transition: 'border-color 150ms var(--ease-smooth)',
};

const cardStyle: h.JSX.CSSProperties = {
  background: 'var(--bg)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-md)',
  padding: 'var(--space-md)',
  marginBottom: 'var(--space-md)',
};

const TABS: { id: SettingsTab; label: string }[] = [
  { id: 'editor', label: 'Editor' },
  { id: 'appearance', label: 'Appearance' },
  { id: 'terminal', label: 'Terminal' },
  { id: 'ai', label: 'AI' },
];

const TAB_SIZE_OPTIONS = [1, 2, 4, 8];

function ToggleButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return html`
    <button
      onClick=${onClick}
      style=${{
        padding: '5px 14px',
        borderRadius: 'var(--radius-pill)',
        fontSize: 12,
        fontWeight: 500,
        cursor: 'pointer',
        background: active ? 'var(--accent)' : 'var(--bg)',
        color: active ? '#fff' : 'var(--text-muted)',
        border: active ? '1px solid var(--accent)' : '1px solid var(--border)',
        transition: 'all 150ms var(--ease-smooth)',
      }}
    >${label}</button>
  `;
}

export function SettingsPanel({ settings, updateSettings, onClose }: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('editor');

  const handleOverlayClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    e.stopPropagation();
  };

  return html`
    <div style=${overlayStyle} onClick=${handleOverlayClick} onKeyDown=${handleKeyDown}>
      <div style=${panelStyle}>
        <div style=${headerStyle}>
          <span style=${{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>Settings</span>
          <button
            onClick=${onClose}
            style=${{
              width: 28, height: 28,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: 16,
              transition: 'all 150ms var(--ease-smooth)',
            }}
            onMouseEnter=${(e: any) => { e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.color = 'var(--text)'; }}
            onMouseLeave=${(e: any) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          >✕</button>
        </div>

        <div style=${tabBarStyle}>
          ${TABS.map(tab => html`
            <button
              key=${tab.id}
              onClick=${() => setActiveTab(tab.id)}
              style=${{
                padding: '8px 16px',
                fontSize: 12,
                fontWeight: activeTab === tab.id ? 600 : 400,
                color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-muted)',
                background: 'transparent',
                borderBottom: activeTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'all 150ms var(--ease-smooth)',
                outline: 'none',
              }}
            >${tab.label}</button>
          `)}
        </div>

        <div style=${contentStyle}>
          ${activeTab === 'editor' && html`
            <div style=${cardStyle}>
              <div style=${labelStyle}>Font Size</div>
              <div style=${{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input
                  type="range"
                  min="10" max="30"
                  value=${settings.fontSize}
                  onInput=${(e: any) => updateSettings({ fontSize: Number(e.target.value) })}
                  style=${{
                    flex: 1,
                    height: 4,
                    accentColor: 'var(--accent)',
                    cursor: 'pointer',
                  }}
                />
                <span style=${{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', minWidth: 24, textAlign: 'center' }}>${settings.fontSize}</span>
              </div>
            </div>

            <div style=${cardStyle}>
              <div style=${labelStyle}>Font Family</div>
              <input
                type="text"
                value=${settings.fontFamily}
                onInput=${(e: any) => updateSettings({ fontFamily: e.target.value })}
                style=${inputStyle}
                placeholder="e.g. 'JetBrains Mono', monospace"
              />
            </div>

            <div style=${cardStyle}>
              <div style=${labelStyle}>Tab Size</div>
              <div style=${{ display: 'flex', gap: 6 }}>
                ${TAB_SIZE_OPTIONS.map(size => html`
                  <button
                    key=${size}
                    onClick=${() => updateSettings({ tabSize: size })}
                    style=${{
                      padding: '6px 16px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: 'pointer',
                      background: settings.tabSize === size ? 'var(--accent)' : 'var(--bg)',
                      color: settings.tabSize === size ? '#fff' : 'var(--text-muted)',
                      border: settings.tabSize === size ? '1px solid var(--accent)' : '1px solid var(--border)',
                      transition: 'all 150ms var(--ease-smooth)',
                    }}
                  >${size}</button>
                `)}
              </div>
            </div>

            <div style=${cardStyle}>
              <div style=${labelStyle}>Word Wrap</div>
              <${ToggleButton}
                active=${settings.wordWrap !== 'off'}
                onClick=${() => updateSettings({ wordWrap: settings.wordWrap === 'off' ? 'on' : 'off' })}
                label=${settings.wordWrap === 'off' ? 'Off' : 'On'}
              />
            </div>

            <div style=${cardStyle}>
              <div style=${labelStyle}>Minimap</div>
              <${ToggleButton}
                active=${settings.minimap}
                onClick=${() => updateSettings({ minimap: !settings.minimap })}
                label=${settings.minimap ? 'Enabled' : 'Disabled'}
              />
            </div>
          `}

          ${activeTab === 'appearance' && html`
            <div style=${cardStyle}>
              <div style=${labelStyle}>Theme</div>
              <div style=${{ display: 'flex', gap: 6 }}>
                <${ToggleButton}
                  active=${settings.theme === 'dark'}
                  onClick=${() => updateSettings({ theme: 'dark' })}
                  label="Dark"
                />
                <${ToggleButton}
                  active=${settings.theme === 'light'}
                  onClick=${() => updateSettings({ theme: 'light' })}
                  label="Light"
                />
              </div>
            </div>

            <div style=${cardStyle}>
              <div style=${labelStyle}>UI Font Family</div>
              <input
                type="text"
                value=${settings.fontFamily}
                onInput=${(e: any) => updateSettings({ fontFamily: e.target.value })}
                style=${inputStyle}
                placeholder="e.g. 'JetBrains Mono', monospace"
              />
            </div>
          `}

          ${activeTab === 'terminal' && html`
            <div style=${cardStyle}>
              <div style=${labelStyle}>Font Size</div>
              <div style=${{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input
                  type="range"
                  min="10" max="24"
                  value=${settings.terminal.fontSize}
                  onInput=${(e: any) => updateSettings({ terminal: { ...settings.terminal, fontSize: Number(e.target.value) } })}
                  style=${{
                    flex: 1,
                    height: 4,
                    accentColor: 'var(--accent)',
                    cursor: 'pointer',
                  }}
                />
                <span style=${{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', minWidth: 24, textAlign: 'center' }}>${settings.terminal.fontSize}</span>
              </div>
            </div>

            <div style=${cardStyle}>
              <div style=${labelStyle}>Shell Path</div>
              <input
                type="text"
                value=${settings.terminal.shell}
                onInput=${(e: any) => updateSettings({ terminal: { ...settings.terminal, shell: e.target.value } })}
                style=${inputStyle}
                placeholder="e.g. C:\\Windows\\System32\\cmd.exe"
              />
            </div>
          `}

          ${activeTab === 'ai' && html`
            <div style=${cardStyle}>
              <div style=${labelStyle}>API Key</div>
              <input
                type="password"
                value=${settings.ai.apiKey}
                onInput=${(e: any) => updateSettings({ ai: { ...settings.ai, apiKey: e.target.value } })}
                style=${inputStyle}
                placeholder="sk-..."
              />
            </div>

            <div style=${cardStyle}>
              <div style=${labelStyle}>Model</div>
              <input
                type="text"
                value=${settings.ai.model}
                onInput=${(e: any) => updateSettings({ ai: { ...settings.ai, model: e.target.value } })}
                style=${inputStyle}
                placeholder="e.g. gpt-4"
              />
            </div>

            <div style=${cardStyle}>
              <div style=${labelStyle}>Endpoint</div>
              <input
                type="text"
                value=${settings.ai.endpoint}
                onInput=${(e: any) => updateSettings({ ai: { ...settings.ai, endpoint: e.target.value } })}
                style=${inputStyle}
                placeholder="https://api.openai.com/v1/chat/completions"
              />
            </div>
          `}
        </div>
      </div>
    </div>
  `;
}
