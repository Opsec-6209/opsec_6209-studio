import { html } from '../services/html';
import { useState } from 'preact/hooks';
import type { EditorTab } from '../../shared/types';

interface EditorTabsProps {
  tabs: EditorTab[];
  activeTabId: string | null;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onReorderTabs: (fromIndex: number, toIndex: number) => void;
  zenMode?: boolean;
}

export function EditorTabs({ tabs, activeTabId, onSelectTab, onCloseTab, onReorderTabs, zenMode }: EditorTabsProps) {
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  if (tabs.length === 0) return null;

  return html`
    <div style=${{
      display: 'flex', alignItems: 'center', background: 'var(--surface)',
      borderBottom: zenMode ? 'none' : '1px solid var(--border)',
      overflow: zenMode ? 'hidden' : 'auto',
      flexShrink: 0, height: zenMode ? 0 : 35,
      opacity: zenMode ? 0 : 1,
      transition: 'height 300ms var(--ease-smooth), opacity 300ms var(--ease-smooth)',
    }}>
      ${tabs.map((tab, index) => {
        const active = tab.id === activeTabId;
        const isDragging = dragIdx === index;
        const isOver = overIdx === index && dragIdx !== null && dragIdx !== index;
        return html`
          <div
            key=${tab.id}
            draggable=${true}
            onClick=${() => onSelectTab(tab.id)}
            onMouseDown=${(e: MouseEvent) => { if (e.button === 1) { e.preventDefault(); onCloseTab(tab.id); } }}
            onDragStart=${(e: DragEvent) => {
              setDragIdx(index);
              (e.currentTarget as HTMLElement).style.opacity = '0.4';
              e.dataTransfer!.effectAllowed = 'move';
            }}
            onDragOver=${(e: DragEvent) => {
              e.preventDefault();
              if (dragIdx !== null && dragIdx !== index) {
                setOverIdx(index);
              }
            }}
            onDragLeave=${() => {
              setOverIdx(prev => prev === index ? null : prev);
            }}
            onDrop=${(e: DragEvent) => {
              e.preventDefault();
              const from = dragIdx;
              setDragIdx(null);
              setOverIdx(null);
              if (from !== null && from !== index) {
                onReorderTabs(from, index);
              }
            }}
            onDragEnd=${() => {
              setDragIdx(null);
              setOverIdx(null);
            }}
            style=${{
              display: 'flex', alignItems: 'center', gap: 6, padding: '0 8px 0 14px',
              height: 35, cursor: isDragging ? 'grabbing' : 'pointer', fontSize: 12,
              fontWeight: active ? 600 : 400,
              color: active ? 'var(--text)' : 'var(--text-muted)',
              background: active ? 'var(--bg)' : 'transparent',
              borderRight: '1px solid var(--border)',
              borderLeft: isOver ? '2px solid var(--accent)' : '1px solid transparent',
              borderBottom: active ? '1px solid var(--accent)' : '1px solid transparent',
              transition: 'color 200ms ease, background 150ms ease, border-color 350ms var(--ease-spring), opacity 150ms ease',
              whiteSpace: 'nowrap', userSelect: 'none', flexShrink: 0, position: 'relative',
              opacity: isDragging ? 0.4 : 1,
            }}
          >
            <span>${tab.name}</span>
            ${tab.isDirty && html`
              <span style=${{
                width: 8, height: 8, borderRadius: '50%',
                background: 'var(--accent)', animation: 'dot-pulse 1.5s infinite',
              }} />
            `}
            <span
              onClick=${(e: MouseEvent) => { e.stopPropagation(); onCloseTab(tab.id); }}
              style=${{
                width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 'var(--radius-sm)', color: 'var(--text-subtle)',
                cursor: 'pointer', transition: 'background 150ms ease, color 150ms ease',
                fontSize: 14, marginLeft: 2,
              }}
              onMouseEnter=${(e: any) => { e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.color = 'var(--text)'; }}
              onMouseLeave=${(e: any) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-subtle)'; }}
            >×</span>
          </div>
        `;
      })}
    </div>
  `;
}
