import { html } from '../services/html';
import { useRef, useEffect, useState } from 'preact/hooks';
import type { EditorTab } from '../../shared/types';
import type { Settings } from '../../shared/types';

interface EditorPaneProps {
  tab: EditorTab;
  settings: Settings;
  onContentChange: (content: string) => void;
  onCursorChange?: (pos: { line: number; column: number }) => void;
  revealLine?: number;
  revealToken?: number;
}

let createEditorFn: any = null;
let updateThemeFn: any = null;
let loaded = false;
let loadError: string | null = null;

async function loadMonaco() {
  if (loaded || loadError) return;
  try {
    const mod = await import('../services/monaco-setup');
    await import('monaco-editor');
    createEditorFn = mod.createEditor;
    updateThemeFn = mod.updateEditorTheme;
    loaded = true;
  } catch (e: any) {
    loadError = e.message || String(e);
  }
}

function retryMonaco() {
  loadError = null;
  loaded = false;
  loadMonaco();
}

export const EditorPane = ({ tab, settings, onContentChange, onCursorChange, revealLine, revealToken }: EditorPaneProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any>(null);
  const currentTabId = useRef<string>('');
  const suppressChangeRef = useRef(false);
  const [ready, setReady] = useState(loaded);
  const [error, setError] = useState<string | null>(loadError);

  useEffect(() => {
    if (loaded || loadError) {
      setReady(loaded);
      setError(loadError);
      return;
    }
    loadMonaco().then(() => {
      setReady(true);
      setError(loadError);
    });
  }, []);

  useEffect(() => {
    if (!ready || !containerRef.current) return;

    if (editorRef.current && currentTabId.current !== tab.id) {
      try { editorRef.current.dispose(); } catch { /* dispose may throw */ }
      editorRef.current = null;
    }

    if (!editorRef.current) {
      suppressChangeRef.current = true;
      try {
        editorRef.current = createEditorFn(containerRef.current, {
          value: tab.content, language: tab.language, theme: settings.theme,
          fontSize: settings.fontSize, fontFamily: settings.fontFamily,
          tabSize: settings.tabSize, wordWrap: settings.wordWrap, minimap: settings.minimap,
        });
        editorRef.current.onDidChangeModelContent(() => {
          if (!suppressChangeRef.current && editorRef.current) {
            onContentChange(editorRef.current.getValue());
          }
        });
        editorRef.current.onDidChangeCursorPosition((e: any) => {
          onCursorChange?.({ line: e.position.lineNumber, column: e.position.column });
        });
        currentTabId.current = tab.id;
        editorRef.current.focus();
      } catch (e: any) {
        setError('Editor creation failed: ' + (e.message || e));
      }
      suppressChangeRef.current = false;
    }
  }, [tab.id, ready]);

  useEffect(() => {
    if (editorRef.current && loaded) updateThemeFn(editorRef.current, settings.theme);
  }, [settings.theme]);

  useEffect(() => {
    if (!editorRef.current || !loaded) return;
    editorRef.current.updateOptions({
      fontSize: settings.fontSize, fontFamily: settings.fontFamily,
      tabSize: settings.tabSize, wordWrap: settings.wordWrap as any,
      minimap: { enabled: settings.minimap },
    });
  }, [settings.fontSize, settings.fontFamily, settings.tabSize, settings.wordWrap, settings.minimap]);

  useEffect(() => {
    return () => {
      if (editorRef.current) { try { editorRef.current.dispose(); } catch { /* dispose may throw */ } editorRef.current = null; }
    };
  }, []);

  useEffect(() => {
    const h = () => { if (editorRef.current) editorRef.current.layout(); };
    window.addEventListener('resize', h);
    const ro = new ResizeObserver(() => { if (editorRef.current) editorRef.current.layout(); });
    if (containerRef.current) ro.observe(containerRef.current);
    return () => { window.removeEventListener('resize', h); ro.disconnect(); };
  }, [ready]);

  const pendingRevealRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (revealLine === undefined) return;
    if (editorRef.current) {
      editorRef.current.revealLineInCenter(revealLine);
    } else {
      pendingRevealRef.current = revealLine;
    }
  }, [revealLine, revealToken]);

  useEffect(() => {
    const line = pendingRevealRef.current;
    if (line !== undefined && editorRef.current) {
      editorRef.current.revealLineInCenter(line);
      pendingRevealRef.current = undefined;
    }
  }, [tab.id]);

  const handleRetry = () => {
    setError(null);
    retryMonaco();
    loadMonaco().then(() => {
      setReady(true);
      setError(loadError);
    });
  };

  if (error) {
    return html`<div style=${{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--editor-bg)', color: 'var(--error)', fontSize: 12, padding: 20, flexDirection: 'column', gap: 8 }}>
      <div>Editor Error</div>
      <div style=${{ fontFamily: 'var(--font-mono)', fontSize: 11, maxWidth: 400, wordBreak: 'break-all', textAlign: 'center' }}>${error}</div>
      <button
        onClick=${handleRetry}
        style=${{
          marginTop: 8,
          padding: '6px 16px',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--accent)',
          color: '#fff',
          fontSize: 12,
          fontWeight: 500,
          cursor: 'pointer',
          border: 'none',
        }}
      >Retry</button>
    </div>`;
  }

  return html`
    <div ref=${containerRef} style=${{ flex: 1, minHeight: 0, overflow: 'hidden', background: 'var(--editor-bg)', position: 'relative' }}>
      ${!ready && html`<div style=${{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>Loading editor...</div>`}
    </div>
  `;
};
