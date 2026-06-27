import { html } from '../services/html';
import { useState, useEffect } from 'preact/hooks';
import { getAPI } from '../services/ipc-client';

interface TitleBarProps {
  zenMode?: boolean;
}

export function TitleBar({ zenMode }: TitleBarProps) {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const api = getAPI();
    api.isMaximized().then(setIsMaximized).catch(() => {});
    const unsub = api.onMaximizeChange(setIsMaximized);
    return () => { unsub(); };
  }, []);

  const btnStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 46,
    height: 36,
    border: 'none',
    background: 'transparent',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontSize: 12,
    transition: 'all 150ms var(--ease-smooth)',
    WebkitAppRegion: 'no-drag',
    borderRadius: 0,
    outline: 'none',
  };

  const api = getAPI();

  return html`
    <div style=${{
      height: zenMode ? 0 : 36,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'var(--surface)',
      borderBottom: zenMode ? 'none' : '1px solid var(--border)',
      WebkitAppRegion: 'drag',
      userSelect: 'none',
      flexShrink: 0,
      zIndex: 100,
      opacity: zenMode ? 0 : 1,
      overflow: 'hidden',
      transition: 'height 300ms var(--ease-smooth), opacity 300ms var(--ease-smooth)',
    }}>
      <div style=${{
        paddingLeft: 12,
        fontSize: 12,
        fontWeight: 600,
        color: 'var(--text-muted)',
        letterSpacing: '0.02em',
      }}>
        OpSec_6209 Studio
      </div>
      <div style=${{
        display: 'flex',
        height: '100%',
      }}>
        <button
          style=${btnStyle}
          onClick=${() => api.minimizeWindow()}
          onMouseEnter=${(e: any) => { e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.color = 'var(--text)'; }}
          onMouseLeave=${(e: any) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          title="Minimize"
        >
          <svg width="12" height="12" viewBox="0 0 12 12"><rect x="1" y="5.5" width="10" height="1" fill="currentColor"/></svg>
        </button>
        <button
          style=${btnStyle}
          onClick=${() => api.maximizeWindow()}
          onMouseEnter=${(e: any) => { e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.color = 'var(--text)'; }}
          onMouseLeave=${(e: any) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          title=${isMaximized ? 'Restore' : 'Maximize'}
        >
          ${isMaximized ? html`
            <svg width="12" height="12" viewBox="0 0 12 12"><rect x="2.5" y="0.5" width="9" height="9" rx="1" fill="none" stroke="currentColor" stroke-width="1"/><rect x="0.5" y="2.5" width="9" height="9" rx="1" fill="var(--surface)" stroke="currentColor" stroke-width="1"/></svg>
          ` : html`
            <svg width="12" height="12" viewBox="0 0 12 12"><rect x="1" y="1" width="10" height="10" rx="1" fill="none" stroke="currentColor" stroke-width="1"/></svg>
          `}
        </button>
        <button
          style=${{ ...btnStyle, color: 'var(--text-muted)' }}
          onClick=${() => api.closeWindow()}
          onMouseEnter=${(e: any) => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave=${(e: any) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          title="Close"
        >
          <svg width="12" height="12" viewBox="0 0 12 12"><line x1="1" y1="1" x2="11" y2="11" stroke="currentColor" stroke-width="1.2"/><line x1="11" y1="1" x2="1" y2="11" stroke="currentColor" stroke-width="1.2"/></svg>
        </button>
      </div>
    </div>
  `;
}
