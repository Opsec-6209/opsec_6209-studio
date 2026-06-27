import { html } from '../services/html';
import { useState, useRef, useEffect } from 'preact/hooks';
import { FileTree } from './FileTree';
import { AIChat } from './AIChat';
import { addToast } from './Toasts';
import type { Settings } from '../../shared/types';

interface SidebarProps {
  zenMode?: boolean;
  activeTab: 'explorer' | 'search' | 'ai';
  onTabChange: (tab: 'explorer' | 'search' | 'ai') => void;
  fileTree: any;
  onFileSelect: (path: string) => void;
  searchPanelOpen?: boolean;
  aiChatOpen?: boolean;
  settings: Settings;
  updateSettings: (s: Partial<Settings>) => void;
  activeTabContent?: string;
}

const iconStyle = (active: boolean): h.JSX.CSSProperties => ({
  width: 36,
  height: 36,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 'var(--radius-md)',
  cursor: 'pointer',
  color: active ? 'var(--accent)' : 'var(--text-muted)',
  background: active ? 'var(--accent-soft)' : 'transparent',
  transition: 'all 200ms var(--ease-smooth)',
  position: 'relative',
  fontSize: 18,
});

const tabBarStyle: h.JSX.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: 'var(--space-sm) 0',
  gap: 4,
  width: 48,
  borderRight: '1px solid var(--border)',
  flexShrink: 0,
};

export function Sidebar({ zenMode, activeTab, onTabChange, fileTree, onFileSelect, searchPanelOpen, aiChatOpen, settings, updateSettings, activeTabContent }: SidebarProps) {
  const [creatingType, setCreatingType] = useState<'file' | 'folder' | null>(null);
  const [creatingName, setCreatingName] = useState('');
  const createInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (creatingType && createInputRef.current) {
      createInputRef.current.focus();
    }
  }, [creatingType]);

  const tabs = [
    { id: 'explorer' as const, label: 'Files', icon: '📁' },
    { id: 'search' as const, label: 'Search', icon: '🔍' },
    { id: 'ai' as const, label: 'AI', icon: '🤖' },
  ];

  return html`
    <div class="app-sidebar" style=${{
      flexDirection: 'row',
      width: zenMode ? 0 : 'var(--sidebar-width)',
      minWidth: zenMode ? 0 : 180,
      maxWidth: zenMode ? 0 : 500,
      opacity: zenMode ? 0 : 1,
      overflow: zenMode ? 'hidden' : undefined,
      borderRight: zenMode ? 'none' : undefined,
      transition: 'width 300ms var(--ease-smooth), min-width 300ms var(--ease-smooth), max-width 300ms var(--ease-smooth), opacity 300ms var(--ease-smooth)',
    }}>
      <div style=${tabBarStyle}>
        ${tabs.map(tab => html`
          <div
            key=${tab.id}
            style=${iconStyle(activeTab === tab.id)}
            onClick=${() => onTabChange(tab.id)}
            title=${tab.label}
          >
            ${tab.icon}
          </div>
        `)}
      </div>

      <div style=${{
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        ${activeTab === 'explorer' && html`
          <div style=${{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}>
            <div style=${{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--space-sm) var(--space-md)',
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-muted)',
              borderBottom: '1px solid var(--border)',
            }}>
              <span>${fileTree.rootPath ? fileTree.rootPath.split(/[/\\]/).pop() : 'No Folder Open'}</span>
              <div style=${{
                display: 'flex',
                gap: 4,
              }}>
                <button
                  onClick=${() => setCreatingType(creatingType === 'file' ? null : 'file')}
                  style=${{
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    background: creatingType === 'file' ? 'var(--accent-soft)' : 'transparent',
                    transition: 'all 200ms var(--ease-smooth)',
                    fontSize: 14,
                  }}
                  title="New File"
                >+</button>
                <button
                  onClick=${() => setCreatingType(creatingType === 'folder' ? null : 'folder')}
                  style=${{
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    background: creatingType === 'folder' ? 'var(--accent-soft)' : 'transparent',
                    transition: 'all 200ms var(--ease-smooth)',
                    fontSize: 14,
                  }}
                  title="New Folder"
                >📁</button>
                <button
                  onClick=${fileTree.refreshTree}
                  style=${{
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    transition: 'all 200ms var(--ease-smooth)',
                    fontSize: 14,
                  }}
                  title="Refresh"
                >↻</button>
                ${!fileTree.rootPath && html`
                  <button
                    onClick=${fileTree.openFolder}
                    style=${{
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--accent)',
                      cursor: 'pointer',
                      transition: 'all 200ms var(--ease-smooth)',
                      fontSize: 14,
                    }}
                    title="Open Folder"
                  >📂</button>
                `}
              </div>
            </div>

            ${creatingType && html`
              <div style=${{
                padding: 'var(--space-xs) var(--space-md)',
                display: 'flex',
                gap: 4,
                borderBottom: '1px solid var(--border)',
              }}>
                <input
                  ref=${createInputRef}
                  type="text"
                  value=${creatingName}
                  onInput=${(e: any) => setCreatingName(e.target.value)}
                  onKeyDown=${async (e: KeyboardEvent) => {
                    if (e.key === 'Escape') { setCreatingType(null); setCreatingName(''); }
                    if (e.key === 'Enter' && creatingName.trim()) {
                      const parentPath = fileTree.selectedPath || fileTree.rootPath;
                      if (parentPath) {
                        if (creatingType === 'file') {
                          await fileTree.createFile(parentPath, creatingName.trim());
                          addToast('success', `File "${creatingName.trim()}" created`);
                        } else {
                          await fileTree.createFolder(parentPath, creatingName.trim());
                          addToast('success', `Folder "${creatingName.trim()}" created`);
                        }
                      }
                      setCreatingType(null);
                      setCreatingName('');
                    }
                  }}
                  placeholder=${creatingType === 'file' ? 'filename.ext' : 'folder-name'}
                  style=${{
                    flex: 1,
                    background: 'var(--surface-hover)',
                    border: '1px solid var(--accent)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '2px 8px',
                    color: 'var(--text)',
                    fontSize: 12,
                    outline: 'none',
                  }}
                />
              </div>
            `}

            <div style=${{
              flex: 1,
              overflow: 'auto',
              padding: 'var(--space-xs) 0',
            }}>
              ${!fileTree.rootPath ? html`
                <div style=${{
                  padding: 'var(--space-lg)',
                  textAlign: 'center',
                  color: 'var(--text-subtle)',
                  fontSize: 12,
                }}>
                  <div style=${{ marginBottom: 12 }}>No folder open</div>
                  <button
                    onClick=${fileTree.openFolder}
                    style=${{
                      padding: '6px 16px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--accent)',
                      color: '#fff',
                      fontSize: 12,
                      fontWeight: 500,
                      transition: 'all 200ms var(--ease-smooth)',
                      cursor: 'pointer',
                    }}
                  >
                    Open Folder
                  </button>
                </div>
              ` : html`
                <${FileTree}
                  nodes=${fileTree.tree}
                  selectedPath=${fileTree.selectedPath}
                  onSelect=${onFileSelect}
                  onToggle=${fileTree.toggleExpand}
                  onLoadChildren=${fileTree.loadChildren}
                  onDelete=${async (path: string) => {
                    await fileTree.deleteEntry(path);
                    addToast('success', 'File deleted');
                  }}
                  onRename=${async (path: string, newName: string) => {
                    await fileTree.renameEntry(path, newName);
                    addToast('success', `Renamed to "${newName}"`);
                  }}
                  level=${0}
                />
              `}
            </div>
          </div>
        `}

        ${activeTab === 'search' && html`
          <div style=${{
            padding: 'var(--space-md)',
            color: 'var(--text-muted)',
            fontSize: 12,
          }}>
            Use Ctrl+Shift+F to search across files
          </div>
        `}

        ${activeTab === 'ai' && html`
          <${AIChat}
            settings=${settings}
            updateSettings=${updateSettings}
            activeTabContent=${activeTabContent}
          />
        `}
      </div>
    </div>
  `;
}
