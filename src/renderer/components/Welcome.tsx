import { html } from '../services/html';

interface WelcomeProps {
  onOpenFolder: () => void;
  onOpenFile: () => void;
  onNewFile: () => void;
  recentFiles: string[];
  onOpenRecent: (filePath: string) => void;
}

function ActionButton({ label, shortcut, onClick, primary }: {
  label: string; shortcut: string; onClick: () => void; primary?: boolean;
}) {
  return html`
    <button
      onClick=${onClick}
      style=${{
        width: '100%', maxWidth: 300, padding: '10px 20px', borderRadius: 'var(--radius-md)',
        background: primary ? 'var(--accent)' : 'var(--surface)',
        color: primary ? '#fff' : 'var(--text)',
        border: primary ? 'none' : '1px solid var(--border)',
        fontSize: 13, fontWeight: 500, cursor: 'pointer',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        transition: 'all 200ms var(--ease-smooth)',
        boxShadow: primary ? 'var(--shadow-sm)' : 'none',
      }}
      onMouseEnter=${(e: any) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
      onMouseLeave=${(e: any) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = primary ? 'var(--shadow-sm)' : 'none'; }}
    >
      <span>${label}</span>
      <span style=${{ fontSize: 11, opacity: 0.6, fontFamily: 'var(--font-mono)' }}>${shortcut}</span>
    </button>
  `;
}

const LANGUAGES = ['TypeScript', 'Python', 'Rust', 'Go', 'C++', 'JavaScript', 'Java', 'HTML', 'CSS', 'JSON'];

export function Welcome({ onOpenFolder, onOpenFile, onNewFile, recentFiles, onOpenRecent }: WelcomeProps) {
  return html`
    <div style=${{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style=${{ textAlign: 'center', maxWidth: 480, padding: 'var(--space-xl)' }}>
        <div class="stagger-1" style=${{
          width: 80, height: 80, margin: '0 auto 24px auto',
          background: 'linear-gradient(135deg, var(--accent) 0%, #6366f1 50%, #8b5cf6 100%)',
          borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36, fontWeight: 700, color: '#fff', animation: 'pulse-glow 2s infinite',
        }}>OS</div>

        <h1 class="stagger-2" style=${{
          fontSize: 28, fontWeight: 700, margin: '0 0 8px 0',
          backgroundImage: 'linear-gradient(90deg, var(--accent), #c084fc, var(--accent))',
          backgroundSize: '200% 100%', backgroundClip: 'text', WebkitBackgroundClip: 'text',
          color: 'transparent', animation: 'gradient-shift 6s infinite',
        }}>OpenCode Studio</h1>

        <p class="stagger-3" style=${{ color: 'var(--text-muted)', fontSize: 14, margin: '0 0 32px 0', lineHeight: 1.6 }}>
          A modern, lightweight code editor with syntax highlighting for 50+ languages, integrated terminal, AI assistant, and more.
        </p>

        <div class="stagger-4" style=${{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
          <${ActionButton} label="Open Folder" shortcut="Ctrl+K Ctrl+O" onClick=${onOpenFolder} primary=${true} />
          <${ActionButton} label="Open File" shortcut="Ctrl+O" onClick=${onOpenFile} />
          <${ActionButton} label="New File" shortcut="Ctrl+N" onClick=${onNewFile} />
        </div>

        ${recentFiles.length > 0 && html`
          <div class="stagger-5" style=${{ marginTop: 28, textAlign: 'left', maxWidth: 300, margin: '28px auto 0' }}>
            <div style=${{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Recent</div>
            ${recentFiles.slice(0, 10).map(fp => {
              const name = fp.split(/[/\\]/).pop() || fp;
              const dir = fp.substring(0, fp.length - name.length - 1) || fp;
              return html`
                <div
                  key=${fp}
                  onClick=${() => onOpenRecent(fp)}
                  style=${{
                    padding: '6px 10px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', gap: 2,
                    transition: 'background 150ms var(--ease-smooth)',
                  }}
                  onMouseEnter=${(e: any) => { e.currentTarget.style.background = 'var(--surface-hover)'; }}
                  onMouseLeave=${(e: any) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <span style=${{ fontSize: 13, color: 'var(--text)' }}>${name}</span>
                  <span style=${{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>${dir}</span>
                </div>
              `;
            })}
          </div>
        `}

        <div class="stagger-5" style=${{ marginTop: 32, display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
          ${LANGUAGES.map(lang => html`
            <span key=${lang} style=${{
              padding: '3px 10px', borderRadius: 'var(--radius-pill)',
              background: 'var(--surface-hover)', color: 'var(--text-muted)',
              fontSize: 11, fontWeight: 500, letterSpacing: '0.02em',
              transition: 'all 200ms var(--ease-smooth)',
            }}>${lang}</span>
          `)}
        </div>
      </div>
    </div>
  `;
}
