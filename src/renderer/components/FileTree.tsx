import { html } from '../services/html';
import { useState } from 'preact/hooks';
import { getFileIconByName } from '../services/file-icons';
import type { FileNode } from '../../shared/types';

interface FileTreeProps {
  nodes: FileNode[];
  selectedPath: string | null;
  onSelect: (path: string) => void;
  onToggle: (path: string) => void;
  onLoadChildren: (path: string) => void;
  onDelete: (path: string) => void;
  onRename?: (path: string, newName: string) => void;
  level: number;
  gitStatuses?: Record<string, { status: 'modified' | 'added' | 'deleted' | 'untracked' }> | null;
}

const ICON_SIZE = 16;

function FolderIcon({ open }: { open: boolean }) {
  const color = open ? '#D97706' : '#6B7280';
  return html`
    <span
      style=${{ width: ICON_SIZE, height: ICON_SIZE, marginRight: 6, flexShrink: 0 }}
      dangerouslySetInnerHTML=${{
        __html: open
          ? `<svg viewBox="0 0 24 24" width="${ICON_SIZE}" height="${ICON_SIZE}"><path d="M2 6a2 2 0 012-2h5l2 2h9a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" fill="${color}" opacity="0.2" stroke="${color}" stroke-width="1.5"/><path d="M2 10h20" stroke="${color}" stroke-width="1.5" opacity="0.5"/></svg>`
          : `<svg viewBox="0 0 24 24" width="${ICON_SIZE}" height="${ICON_SIZE}"><path d="M2 6a2 2 0 012-2h5l2 2h9a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" fill="${color}" opacity="0.15" stroke="${color}" stroke-width="1.5"/></svg>`
      }}
    />
  `;
}

const GIT_DOT_COLORS: Record<string, string> = {
  modified: '#f59e0b',
  added: '#10b981',
  deleted: '#ef4444',
  untracked: '#9ca3af',
};

export function FileTree({ nodes, selectedPath, onSelect, onToggle, onLoadChildren, onDelete, onRename, level, gitStatuses }: FileTreeProps) {
  const [contextPath, setContextPath] = useState<string | null>(null);
  const [contextPos, setContextPos] = useState({ x: 0, y: 0 });

  const handleContextMenu = (e: MouseEvent, nodePath: string) => {
    e.preventDefault();
    setContextPath(nodePath);
    setContextPos({ x: e.clientX, y: e.clientY });
  };

  const handleDelete = async (nodePath: string) => {
    if (confirm('Are you sure you want to delete this?')) {
      await onDelete(nodePath);
    }
    setContextPath(null);
  };

  const handleRename = () => {
    if (!contextPath || !onRename) return;
    const name = window.prompt('New name:', contextPath.split(/[/\\]/).pop() || '');
    if (name && name.trim()) {
      onRename(contextPath, name.trim());
    }
    setContextPath(null);
  };

  return html`
    <div>
      ${nodes.map(node => html`
        <div key=${node.path}>
          <div
            onClick=${async () => {
              if (node.type === 'directory') {
                onToggle(node.path);
                if (!node.children || node.children.length === 0) {
                  await onLoadChildren(node.path);
                }
              } else {
                onSelect(node.path);
              }
            }}
            onContextMenu=${(e: any) => handleContextMenu(e, node.path)}
            style=${{
              display: 'flex',
              alignItems: 'center',
              padding: `4px ${8 + level * 14}px 4px ${4 + level * 14}px`,
              paddingRight: 8,
              cursor: 'pointer',
              fontSize: 13,
              lineHeight: '20px',
              color: selectedPath === node.path ? 'var(--text)' : 'var(--text-muted)',
              background: selectedPath === node.path ? 'var(--accent-soft)' : 'transparent',
              transition: 'background 120ms ease, color 120ms ease',
              userSelect: 'none',
              gap: 2,
            }}
            onMouseEnter=${(e: any) => {
              if (selectedPath !== node.path) e.currentTarget.style.background = 'var(--surface-hover)';
            }}
            onMouseLeave=${(e: any) => {
              if (selectedPath !== node.path) e.currentTarget.style.background = 'transparent';
            }}
          >
            <span style=${{
              width: 14,
              display: 'inline-flex',
              justifyContent: 'center',
              marginRight: 2,
              fontSize: 10,
              transform: node.type === 'directory' && node.expanded ? 'rotate(90deg)' : 'none',
              transition: 'transform 150ms var(--ease-smooth)',
              opacity: node.type === 'directory' ? 1 : 0,
              flexShrink: 0,
            }}>▶</span>

            ${node.type === 'directory'
              ? html`<${FolderIcon} open=${!!node.expanded} />`
              : html`
                <span
                  style=${{ width: ICON_SIZE, height: ICON_SIZE, marginRight: 6, flexShrink: 0, display: 'inline-flex', alignItems: 'center' }}
                  dangerouslySetInnerHTML=${{ __html: getFileIconByName(node.name) }}
                />
              `
            }

            <span style=${{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
            }}>${node.name}</span>

            ${node.type === 'file' && gitStatuses && gitStatuses[node.path] && html`
              <span style=${{
                width: 8, height: 8, borderRadius: '50%',
                backgroundColor: GIT_DOT_COLORS[gitStatuses[node.path].status],
                flexShrink: 0, marginLeft: 4,
              }} title=${gitStatuses[node.path].status} />
            `}
          </div>

          ${node.type === 'directory' && node.expanded && node.children && node.children.length > 0 && html`
            <${FileTree}
              nodes=${node.children}
              selectedPath=${selectedPath}
              onSelect=${onSelect}
              onToggle=${onToggle}
              onLoadChildren=${onLoadChildren}
              onDelete=${onDelete}
              onRename=${onRename}
              level=${level + 1}
              gitStatuses=${gitStatuses}
            />
          `}
        </div>
      `)}

      ${contextPath && html`
        <div
          style=${{
            position: 'fixed',
            left: contextPos.x,
            top: contextPos.y,
            zIndex: 1000,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-md)',
            minWidth: 160,
            padding: '4px 0',
            animation: 'scale-in 150ms var(--ease-smooth)',
          }}
          onClick=${() => setContextPath(null)}
        >
          <div
            style=${{
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: 12,
              color: 'var(--text)',
              transition: 'background 100ms',
            }}
            onMouseEnter=${(e: any) => e.currentTarget.style.background = 'var(--surface-hover)'}
            onMouseLeave=${(e: any) => e.currentTarget.style.background = 'transparent'}
            onClick=${() => handleDelete(contextPath)}
          >Delete</div>
          <div
            style=${{
              padding: '6px 12px',
              cursor: 'pointer',
              fontSize: 12,
              color: 'var(--text)',
              transition: 'background 100ms',
            }}
            onMouseEnter=${(e: any) => e.currentTarget.style.background = 'var(--surface-hover)'}
            onMouseLeave=${(e: any) => e.currentTarget.style.background = 'transparent'}
            onClick=${() => handleRename()}
          >Rename</div>
        </div>
      `}
    </div>
  `;
}
