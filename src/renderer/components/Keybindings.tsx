import { html } from '../services/html';
import { useState, useRef, useEffect } from 'preact/hooks';

interface Keybinding {
  action: string;
  shortcut: string;
  category: string;
}

const KEYBINDINGS: Keybinding[] = [
  /* General */
  { action: 'Command Palette', shortcut: 'Ctrl+Shift+P', category: 'General' },
  { action: 'Keyboard Shortcuts', shortcut: 'Ctrl+K Ctrl+S', category: 'General' },
  { action: 'Settings', shortcut: 'Ctrl+,', category: 'General' },

  /* File */
  { action: 'New File', shortcut: 'Ctrl+N', category: 'File' },
  { action: 'Open File...', shortcut: 'Ctrl+O', category: 'File' },
  { action: 'Save', shortcut: 'Ctrl+S', category: 'File' },
  { action: 'Save As...', shortcut: 'Ctrl+Shift+S', category: 'File' },
  { action: 'Close Tab', shortcut: 'Ctrl+W', category: 'File' },
  { action: 'Reopen Closed Tab', shortcut: 'Ctrl+Shift+T', category: 'File' },

  /* Editor */
  { action: 'Format Document', shortcut: 'Shift+Alt+F', category: 'Editor' },
  { action: 'Toggle Comment', shortcut: 'Ctrl+/', category: 'Editor' },
  { action: 'Find in File', shortcut: 'Ctrl+F', category: 'Editor' },
  { action: 'Find & Replace', shortcut: 'Ctrl+H', category: 'Editor' },
  { action: 'Undo', shortcut: 'Ctrl+Z', category: 'Editor' },
  { action: 'Redo', shortcut: 'Ctrl+Y', category: 'Editor' },
  { action: 'Cut', shortcut: 'Ctrl+X', category: 'Editor' },
  { action: 'Copy', shortcut: 'Ctrl+C', category: 'Editor' },
  { action: 'Paste', shortcut: 'Ctrl+V', category: 'Editor' },
  { action: 'Select All', shortcut: 'Ctrl+A', category: 'Editor' },
  { action: 'Indent', shortcut: 'Tab', category: 'Editor' },
  { action: 'Outdent', shortcut: 'Shift+Tab', category: 'Editor' },
  { action: 'Move Line Up', shortcut: 'Alt+ArrowUp', category: 'Editor' },
  { action: 'Move Line Down', shortcut: 'Alt+ArrowDown', category: 'Editor' },
  { action: 'Add Cursor Above', shortcut: 'Ctrl+Alt+ArrowUp', category: 'Editor' },
  { action: 'Add Cursor Below', shortcut: 'Ctrl+Alt+ArrowDown', category: 'Editor' },
  { action: 'Toggle Word Wrap', shortcut: 'Alt+Z', category: 'Editor' },

  /* Navigation */
  { action: 'Toggle Sidebar', shortcut: 'Ctrl+B', category: 'Navigation' },
  { action: 'Toggle Terminal', shortcut: 'Ctrl+`', category: 'Navigation' },
  { action: 'Next Tab', shortcut: 'Ctrl+Tab', category: 'Navigation' },
  { action: 'Previous Tab', shortcut: 'Ctrl+Shift+Tab', category: 'Navigation' },
  { action: 'Go to File...', shortcut: 'Ctrl+P', category: 'Navigation' },
  { action: 'Go to Line...', shortcut: 'Ctrl+G', category: 'Navigation' },

  /* Search */
  { action: 'Search Across Files', shortcut: 'Ctrl+Shift+F', category: 'Search' },
  { action: 'Find in File', shortcut: 'Ctrl+F', category: 'Search' },
  { action: 'Find & Replace', shortcut: 'Ctrl+H', category: 'Search' },

  /* Terminal */
  { action: 'Toggle Terminal', shortcut: 'Ctrl+`', category: 'Terminal' },
  { action: 'New Terminal', shortcut: 'Ctrl+Shift+`', category: 'Terminal' },
  { action: 'Clear Terminal', shortcut: 'Ctrl+L', category: 'Terminal' },
  { action: 'Kill Terminal', shortcut: 'Ctrl+Shift+C', category: 'Terminal' },
];

const CATEGORIES = ['General', 'File', 'Editor', 'Navigation', 'Search', 'Terminal'];

interface KeybindingsProps {
  onClose: () => void;
}

export function Keybindings({ onClose }: KeybindingsProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filtered = query
    ? KEYBINDINGS.filter(k =>
      k.action.toLowerCase().includes(query.toLowerCase()) ||
      k.shortcut.toLowerCase().includes(query.toLowerCase()) ||
      k.category.toLowerCase().includes(query.toLowerCase())
    )
    : KEYBINDINGS;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const grouped = new Map<string, Keybinding[]>();
  for (const cat of CATEGORIES) {
    const items = filtered.filter(k => k.category === cat);
    if (items.length > 0) grouped.set(cat, items);
  }

  return html`<div
    style=${{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', justifyContent: 'center', paddingTop: '12vh', background: 'rgba(0,0,0,0.4)', animation: 'fade-in 150ms var(--ease-smooth)' }}
    onClick=${onClose}
  >
    <div
      style=${{ width: 620, maxWidth: '90vw', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', overflow: 'hidden', animation: 'scale-in 250ms var(--ease-spring)', alignSelf: 'flex-start', display: 'flex', flexDirection: 'column', maxHeight: '70vh' }}
      onClick=${(e: MouseEvent) => e.stopPropagation()}
    >
      <div style=${{ padding: 'var(--space-sm) var(--space-md)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style=${{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Keyboard Shortcuts</span>
        <span style=${{ flex: 1 }} />
        <button
          onClick=${onClose}
          style=${{
            width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', cursor: 'pointer',
            fontSize: 14, transition: 'all 150ms var(--ease-smooth)',
          }}
          onMouseEnter=${(e: any) => { e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.color = 'var(--text)'; }}
          onMouseLeave=${(e: any) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >✕</button>
      </div>
      <div style=${{ padding: 'var(--space-sm) var(--space-md)', borderBottom: '1px solid var(--border)' }}>
        <input
          ref=${inputRef}
          type="text"
          value=${query}
          onInput=${(e: any) => setQuery(e.target.value)}
          onKeyDown=${handleKeyDown}
          placeholder="Filter shortcuts..."
          style=${{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text)', fontSize: 13, padding: '6px 0', outline: 'none', fontFamily: 'var(--font-ui)' }}
        />
      </div>
      <div style=${{ flex: 1, overflow: 'auto', padding: '8px 0' }}>
        ${[...grouped.entries()].map(([category, items]) => html`
          <div key=${category} style=${{ marginBottom: 4 }}>
            <div style=${{ padding: '6px 16px 2px', fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              ${category}
            </div>
            ${items.map(k => html`<div
              key=${`${k.category}:${k.action}`}
              style=${{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 16px', fontSize: 12, color: 'var(--text)' }}
            >
              <span>${k.action}</span>
              <span style=${{ fontSize: 11, color: 'var(--text-subtle)', fontFamily: 'var(--font-mono)', background: 'var(--surface-hover)', padding: '2px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>${k.shortcut}</span>
            </div>`)}
          </div>
        `)}
        ${filtered.length === 0 && html`<div style=${{ padding: 24, textAlign: 'center', color: 'var(--text-subtle)' }}>
          No matching shortcuts
        </div>`}
      </div>
    </div>
  </div>`;
}
