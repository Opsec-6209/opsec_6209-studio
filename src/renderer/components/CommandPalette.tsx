import { html } from '../services/html';
import { useState, useRef, useEffect } from 'preact/hooks';

interface CommandPaletteProps {
  onClose: () => void;
  onExecute: (action: () => void) => void;
}

interface Command {
  id: string;
  label: string;
  category: string;
  shortcut?: string;
  action: () => void;
}

export function CommandPalette({ onClose, onExecute }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = [
    { id: 'new', label: 'New File', category: 'File', shortcut: 'Ctrl+N', action: () => {} },
    { id: 'open', label: 'Open File...', category: 'File', shortcut: 'Ctrl+O', action: () => {} },
    { id: 'openFolder', label: 'Open Folder...', category: 'File', shortcut: 'Ctrl+K Ctrl+O', action: () => {} },
    { id: 'save', label: 'Save', category: 'File', shortcut: 'Ctrl+S', action: () => {} },
    { id: 'saveAll', label: 'Save All', category: 'File', shortcut: 'Ctrl+K S', action: () => {} },
    { id: 'closeTab', label: 'Close Tab', category: 'File', shortcut: 'Ctrl+W', action: () => {} },
    { id: 'reopenTab', label: 'Reopen Closed Tab', category: 'File', shortcut: 'Ctrl+Shift+T', action: () => {} },
    { id: 'toggleSidebar', label: 'Toggle Sidebar', category: 'View', shortcut: 'Ctrl+B', action: () => {} },
    { id: 'toggleTerminal', label: 'Toggle Terminal', category: 'View', shortcut: 'Ctrl+`', action: () => {} },
    { id: 'toggleTheme', label: 'Toggle Dark/Light Theme', category: 'View', action: () => {} },
    { id: 'toggleMinimap', label: 'Toggle Minimap', category: 'View', action: () => {} },
    { id: 'toggleWrap', label: 'Toggle Word Wrap', category: 'View', shortcut: 'Alt+Z', action: () => {} },
    { id: 'toggleAI', label: 'Toggle AI Chat', category: 'View', shortcut: 'Ctrl+Shift+L', action: () => {} },
    { id: 'find', label: 'Find in File', category: 'Search', shortcut: 'Ctrl+F', action: () => {} },
    { id: 'replace', label: 'Find & Replace', category: 'Search', shortcut: 'Ctrl+H', action: () => {} },
    { id: 'searchFiles', label: 'Search Across Files', category: 'Search', shortcut: 'Ctrl+Shift+F', action: () => {} },
    { id: 'format', label: 'Format Document', category: 'Edit', shortcut: 'Shift+Alt+F', action: () => {} },
    { id: 'comment', label: 'Toggle Comment', category: 'Edit', shortcut: 'Ctrl+/', action: () => {} },
  ];

  const filtered = query
    ? commands.filter(c =>
        c.label.toLowerCase().includes(query.toLowerCase()) ||
        c.category.toLowerCase().includes(query.toLowerCase())
      )
    : commands;

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        onExecute(filtered[selectedIndex].action);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return html`<div
    style=${{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', justifyContent: 'center', paddingTop: '15vh', background: 'rgba(0,0,0,0.4)', animation: 'fade-in 150ms var(--ease-smooth)' }}
    onClick=${onClose}
  >
    <div
      style=${{ width: 560, maxWidth: '90vw', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', overflow: 'hidden', animation: 'scale-in 250ms var(--ease-spring)', alignSelf: 'flex-start' }}
      onClick=${(e: MouseEvent) => e.stopPropagation()}
    >
      <div style=${{ padding: 'var(--space-sm) var(--space-md)', borderBottom: '1px solid var(--border)' }}>
        <input
          ref=${inputRef}
          type="text"
          value=${query}
          onInput=${(e: any) => setQuery(e.target.value)}
          onKeyDown=${handleKeyDown}
          placeholder="Type a command..."
          style=${{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text)', fontSize: 15, padding: '8px 0', outline: 'none', fontFamily: 'var(--font-ui)' }}
        />
      </div>
      <div style=${{ maxHeight: 320, overflow: 'auto', padding: '4px 0' }}>
        ${filtered.map((cmd, i) => html`<div
            key=${cmd.id}
            onClick=${() => onExecute(cmd.action)}
            style=${{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 16px', cursor: 'pointer', background: i === selectedIndex ? 'var(--accent-soft)' : 'transparent', color: i === selectedIndex ? 'var(--accent)' : 'var(--text)', transition: 'background 100ms ease', fontSize: 13 }}
            onMouseEnter=${(e: any) => {
              e.currentTarget.style.background = 'var(--accent-soft)';
              setSelectedIndex(i);
            }}
          >
            <div style=${{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style=${{ fontSize: 11, color: 'var(--text-muted)', minWidth: 60 }}>${cmd.category}</span>
              <span>${cmd.label}</span>
            </div>
            ${cmd.shortcut && html`<span style=${{ fontSize: 11, color: 'var(--text-subtle)', fontFamily: 'var(--font-mono)' }}>${cmd.shortcut}</span>`}
          </div>`)}
        ${filtered.length === 0 && html`<div style=${{ padding: 24, textAlign: 'center', color: 'var(--text-subtle)' }}>
            No matching commands
          </div>`}
      </div>
    </div>
  </div>`;
}
