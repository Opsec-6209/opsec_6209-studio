import { html } from '../services/html';
import type { EditorTab } from '../../shared/types';

interface StatusBarProps {
  activeTab?: EditorTab;
  cursorPosition?: { line: number; column: number };
  onToggleTerminal: () => void;
  onToggleSidebar: () => void;
  onToggleTheme: () => void;
  onToggleMinimap: () => void;
  onOpenSettings: () => void;
  minimap: boolean;
  zenMode?: boolean;
}

function StatusButton({ children, onClick, title }: { children: any; onClick: () => void; title: string }) {
  return html`
    <button
      onClick=${onClick}
      title=${title}
      style=${{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 4px', height: 20, borderRadius: 'var(--radius-sm)',
        cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12,
        transition: 'all 150ms var(--ease-smooth)', background: 'transparent',
      }}
      onMouseEnter=${(e: any) => { e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.color = 'var(--text)'; }}
      onMouseLeave=${(e: any) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
    >${children}</button>
  `;
}

export function StatusBarInfo({ activeTab, cursorPosition, onToggleTerminal, onToggleSidebar, onToggleTheme, onToggleMinimap, onOpenSettings, minimap, zenMode }: StatusBarProps) {
  return html`
    <div class="app-statusbar" style=${{
      height: zenMode ? 0 : 'var(--statusbar-height)',
      opacity: zenMode ? 0 : 1,
      overflow: 'hidden',
      borderTop: zenMode ? 'none' : undefined,
      transition: 'height 300ms var(--ease-smooth), opacity 300ms var(--ease-smooth)',
    }}>
      <div class="status-left">
        ${activeTab ? html`
          <span style=${{ color: 'var(--accent)', fontWeight: 500 }}>${activeTab.language}</span>
          <span style=${{ marginLeft: 8 }}>Ln ${cursorPosition?.line ?? 1}, Col ${cursorPosition?.column ?? 1}</span>
        ` : html`<span style=${{ color: 'var(--text-subtle)' }}>No file open</span>`}
      </div>
      <div class="status-right">
        <${StatusButton} onClick=${onToggleSidebar} title="Toggle Sidebar (Ctrl+B)">${activeTab ? '📁' : '📂'}<//>
        <${StatusButton} onClick=${onToggleTerminal} title="Toggle Terminal (Ctrl+\`)">><//>
        <${StatusButton} onClick=${onToggleMinimap} title="Toggle Minimap">${minimap ? '🗺' : '■'}<//>
        <${StatusButton} onClick=${onToggleTheme} title="Toggle Theme">☀<//>
        <${StatusButton} onClick=${onOpenSettings} title="Settings">⚙<//>
        <span>UTF-8</span>
        <span>CRLF</span>
        <span>Spaces: 2</span>
      </div>
    </div>
  `;
}
