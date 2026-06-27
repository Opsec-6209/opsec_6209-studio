import { html } from '../services/html';
import { useState, useCallback, useRef, useEffect } from 'preact/hooks';
import { useEditorTabs } from '../hooks/useEditorTabs';
import { useFileTree } from '../hooks/useFileTree';
import { useSettings } from '../hooks/useSettings';
import { useKeyboard } from '../hooks/useKeyboard';
import { Sidebar } from './Sidebar';
import { EditorTabs } from './EditorTabs';
import { EditorPane } from './EditorPane';
import { SplitPane } from './SplitPane';
import { TerminalPanel } from './Terminal';
import { StatusBarInfo } from './StatusBar';
import { CommandPalette } from './CommandPalette';
import { SearchPanel } from './SearchPanel';
import { AIChat } from './AIChat';
import { Welcome } from './Welcome';
import { TitleBar } from './TitleBar';
import { SettingsPanel } from './SettingsPanel';
import { Keybindings } from './Keybindings';
import { Toasts } from './Toasts';
import { addToast } from './Toasts';
import { Breadcrumb } from './Breadcrumb';
import { getLanguageForFile } from '../services/language-map';
import { getAPI } from '../services/ipc-client';

export function App() {
  const { settings, updateSettings, toggleTheme, loaded } = useSettings();
  const editor = useEditorTabs(async () => {
    const api = getAPI();
    const fresh = await api.loadSettings();
    updateSettings(fresh);
  });
  const fileTree = useFileTree();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [terminalVisible, setTerminalVisible] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [searchPanelOpen, setSearchPanelOpen] = useState(false);
  const [aiChatOpen, setAIChatOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [keybindingsOpen, setKeybindingsOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'explorer' | 'search' | 'ai'>('explorer');
  const [minimap, setMinimap] = useState(settings.minimap);
  const [zenMode, setZenMode] = useState(false);
  const zenModeRef = useRef(zenMode);
  zenModeRef.current = zenMode;
  const editorRef = useRef<any>(null);
  const [cursorPosition, setCursorPosition] = useState<{ line: number; column: number }>({ line: 1, column: 1 });
  const [revealLine, setRevealLine] = useState<number | undefined>(undefined);

  const openFiles = useCallback(async (paths: string[]) => {
    for (const p of paths) await editor.openFile(p);
  }, [editor]);

  const handleFileSelect = useCallback(async (path: string) => {
    await editor.openFile(path);
  }, [editor]);

  const handleOpenFolder = useCallback(async () => {
    await fileTree.openFolder();
    if (fileTree.rootPath) {
      document.title = `${fileTree.rootPath.split(/[/\\]/).pop()} — OpSec_6209 Studio`;
    }
  }, [fileTree]);

  const handleSave = useCallback(async () => {
    if (editor.activeTabId) {
      await editor.saveTab(editor.activeTabId);
      addToast('success', 'File saved');
    }
  }, [editor]);

  const activeTab = editor.tabs.find(t => t.id === editor.activeTabId);

  useKeyboard({
    'Ctrl+S': handleSave,
    'Ctrl+Shift+S': () => { if (editor.activeTabId) editor.saveAs(editor.activeTabId); },
    'Ctrl+W': () => { if (editor.activeTabId) editor.closeTab(editor.activeTabId); },
    'Ctrl+Shift+T': editor.reopenClosedTab,
    'Ctrl+N': editor.createNewFile,
    'Ctrl+O': async () => {
      const { getAPI } = await import('../services/ipc-client');
      const files = await getAPI().openFileDialog();
      if (files) openFiles(files);
    },
    'Ctrl+B': () => setSidebarVisible(v => !v),
    'Ctrl+`': () => setTerminalVisible(v => !v),
    'Ctrl+Shift+P': () => setCommandPaletteOpen(true),
    'Ctrl+Shift+F': () => { setSidebarTab('search'); setSearchPanelOpen(true); setSidebarVisible(true); },
    'Ctrl+Shift+L': () => { setSidebarTab('ai'); setAIChatOpen(true); setSidebarVisible(true); },
    'Ctrl+Tab': () => {
      if (editor.tabs.length <= 1) return;
      const idx = editor.tabs.findIndex(t => t.id === editor.activeTabId);
      const next = (idx + 1) % editor.tabs.length;
      editor.setActiveTabId(editor.tabs[next].id);
    },
    'Ctrl+Shift+Tab': () => {
      if (editor.tabs.length <= 1) return;
      const idx = editor.tabs.findIndex(t => t.id === editor.activeTabId);
      const prev = (idx - 1 + editor.tabs.length) % editor.tabs.length;
      editor.setActiveTabId(editor.tabs[prev].id);
    },
  });

  /* Ctrl+K chord prefix for Ctrl+K Ctrl+S (keybindings panel) */
  useEffect(() => {
    let prefixTimer: ReturnType<typeof setTimeout> | null = null;
    let chordPrefix = false;

    const handler = (e: KeyboardEvent) => {
      const key = [
        e.ctrlKey || e.metaKey ? 'Ctrl' : '',
        e.shiftKey ? 'Shift' : '',
        e.altKey ? 'Alt' : '',
        e.key.length === 1 ? e.key.toUpperCase() : e.key,
      ].filter(Boolean).join('+');

      if (chordPrefix) {
        chordPrefix = false;
        if (prefixTimer) { clearTimeout(prefixTimer); prefixTimer = null; }
        if (key === 'Ctrl+S') {
          e.preventDefault();
          e.stopPropagation();
          setKeybindingsOpen(true);
          return;
        }
      }

      if (key === 'Ctrl+K') {
        chordPrefix = true;
        if (prefixTimer) clearTimeout(prefixTimer);
        prefixTimer = setTimeout(() => { chordPrefix = false; }, 1000);
      }
    };

    window.addEventListener('keydown', handler, true);
    return () => {
      window.removeEventListener('keydown', handler, true);
      if (prefixTimer) clearTimeout(prefixTimer);
    };
  }, []);

  useEffect(() => {
    if (!zenMode) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setZenMode(false);
      }
    };
    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, [zenMode]);

  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const { files } = e.dataTransfer || {};
      if (!files || files.length === 0) return;

      const api = getAPI();
      const filePaths: string[] = [];

      for (let i = 0; i < files.length; i++) {
        try {
          const fpath = api.getFilePath(files[i]);
          if (fpath) filePaths.push(fpath);
        } catch { /* skip */ }
      }

      if (filePaths.length === 0) return;

      const firstInfo = await api.getFileInfo(filePaths[0]);
      if (filePaths.length === 1 && firstInfo?.isDirectory) {
        await fileTree.openFolder(filePaths[0]);
        if (fileTree.rootPath) {
          document.title = `${fileTree.rootPath.split(/[/\\]/).pop()} — OpSec_6209 Studio`;
        }
      } else {
        for (const p of filePaths) {
          const info = await api.getFileInfo(p);
          if (info && !info.isDirectory) {
            await editor.openFile(p);
          }
        }
      }
    };

    document.body.addEventListener('dragover', handleDragOver);
    document.body.addEventListener('drop', handleDrop);

    return () => {
      document.body.removeEventListener('dragover', handleDragOver);
      document.body.removeEventListener('drop', handleDrop);
    };
  }, [fileTree, editor]);

  useEffect(() => {
    const api = getAPI();
    return api.onBeforeClose((respond) => {
      const dirty = editor.tabs.some(t => t.isDirty);
      respond(dirty);
    });
  }, [editor.tabs]);

  const handleEditorContentChange = useCallback((content: string) => {
    if (editor.activeTabId) {
      editor.updateTabContent(editor.activeTabId, content);
      if (settings.autoSave) {
        editor.saveTab(editor.activeTabId);
      }
    }
  }, [editor, settings.autoSave]);

  const handleSearchNavigate = useCallback(async (filePath: string, line: number, column: number) => {
    await editor.openFile(filePath);
    setRevealLine(line);
  }, [editor]);

  if (!loaded) {
    return html`<div class="app-layout" style=${{ alignItems: 'center', justifyContent: 'center' }}>
      <div style=${{ textAlign: 'center' }}>
        <div style=${{
          width: 64, height: 64, margin: '0 auto 24px auto',
          background: 'linear-gradient(135deg, var(--accent) 0%, #6366f1 50%, #8b5cf6 100%)',
          borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, fontWeight: 700, color: '#fff', animation: 'pulse-glow 2s infinite',
        }}>OS</div>
        <div style=${{
          fontSize: 24, fontWeight: 700,
          background: 'linear-gradient(90deg, var(--accent), #c084fc, var(--accent)) 0 0 / 200% 100%',
          backgroundClip: 'text', WebkitBackgroundClip: 'text',
          color: 'transparent', animation: 'gradient-shift 3s infinite',
        }}>OpSec_6209 Studio</div>
        <div style=${{ marginTop: 16, color: 'var(--text-muted)', fontSize: 13 }}>Loading...</div>
        <div style=${{
          width: 200, height: 3, margin: '16px auto 0', borderRadius: 2,
          background: 'var(--surface)', overflow: 'hidden',
        }}>
          <div style=${{
            height: '100%', width: '40%', borderRadius: 2,
            background: 'var(--accent)',
            animation: 'shimmer 1.2s infinite var(--ease-smooth)',
            backgroundImage: 'linear-gradient(90deg, transparent 0%, var(--accent) 50%, transparent 100%)',
            backgroundSize: '200% 100%',
          }} />
        </div>
      </div>
    </div>`;
  }

  return html`<div class="app-layout">
    <${TitleBar} zenMode=${zenMode} />
    <div class="app-main">
      ${sidebarVisible && html`<${Sidebar}
        zenMode=${zenMode}
        activeTab=${sidebarTab}
        onTabChange=${setSidebarTab}
        fileTree=${fileTree}
        onFileSelect=${handleFileSelect}
        searchPanelOpen=${searchPanelOpen}
        aiChatOpen=${aiChatOpen}
        settings=${settings}
        updateSettings=${updateSettings}
        activeTabContent=${activeTab?.content}
      />`}

      <div class="app-editor-area">
        <${Breadcrumb}
          filePath=${activeTab?.path || null}
          onNavigate=${(path: string) => fileTree.openFolder(path)}
          zenMode=${zenMode}
        />
        <${EditorTabs}
          tabs=${editor.tabs}
          activeTabId=${editor.activeTabId}
          onSelectTab=${(id) => editor.setActiveTabId(id)}
          onCloseTab=${(id) => editor.closeTab(id)}
          onReorderTabs=${editor.reorderTabs}
          zenMode=${zenMode}
        />

        <${SplitPane}
          direction="vertical"
          initialSplit=${terminalVisible ? 70 : 100}
          bottom=${terminalVisible ? html`<${TerminalPanel} settings=${settings} />` : null}
        >
          ${activeTab ? html`<${EditorPane}
            ref=${editorRef}
            tab=${activeTab}
            settings=${settings}
            onContentChange=${handleEditorContentChange}
            onCursorChange=${(pos: { line: number; column: number }) => setCursorPosition(pos)}
            revealLine=${revealLine}
          />` : html`<${Welcome}
            onOpenFolder=${handleOpenFolder}
            onOpenFile=${async () => {
              const { getAPI } = await import('../services/ipc-client');
              const files = await getAPI().openFileDialog();
              if (files) openFiles(files);
            }}
            onNewFile=${editor.createNewFile}
            recentFiles=${settings.recentFiles}
            onOpenRecent=${(fp: string) => editor.openFile(fp)}
          />`}
        </>
      </div>
    </div>

    <${StatusBarInfo}
      activeTab=${activeTab}
      cursorPosition=${cursorPosition}
      onToggleTerminal=${() => setTerminalVisible(v => !v)}
      onToggleSidebar=${() => setSidebarVisible(v => !v)}
      onToggleTheme=${toggleTheme}
      onToggleMinimap=${() => setMinimap(v => !v)}
      onOpenSettings=${() => setSettingsOpen(true)}
      minimap=${minimap}
      zenMode=${zenMode}
    />

    ${commandPaletteOpen && html`<${CommandPalette}
      onClose=${() => setCommandPaletteOpen(false)}
      onExecute=${(action) => {
        setCommandPaletteOpen(false);
        action();
      }}
    />`}

    ${searchPanelOpen && sidebarTab === 'search' && html`<${SearchPanel} onClose=${() => setSearchPanelOpen(false)} onNavigate=${handleSearchNavigate} />`}

    ${keybindingsOpen && html`<${Keybindings} onClose=${() => setKeybindingsOpen(false)} />`}

    ${settingsOpen && html`<${SettingsPanel} settings=${settings} updateSettings=${updateSettings} onClose=${() => setSettingsOpen(false)} />`}

    <${Toasts} />
  </div>`;
}
