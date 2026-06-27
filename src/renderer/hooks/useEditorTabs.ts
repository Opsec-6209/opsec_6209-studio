import { useState, useCallback, useEffect, useRef } from 'preact/hooks';
import { getAPI } from '../services/ipc-client';
import type { EditorTab } from '../../shared/types';
import { getLanguageForFile } from '../services/language-map';

let tabCounter = 0;

export function useEditorTabs(onFileOpened?: () => void) {
  const [tabs, setTabs] = useState<EditorTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [closedTabs, setClosedTabs] = useState<EditorTab[]>([]);

  const tabsRef = useRef(tabs);
  tabsRef.current = tabs;

  const openFile = useCallback(async (filePath: string) => {
    const existing = tabsRef.current.find(t => t.path === filePath);
    if (existing) {
      setActiveTabId(existing.id);
      return existing;
    }

    try {
      const api = getAPI();
      const content = await api.readFile(filePath);
      const name = filePath.split(/[/\\]/).pop() || 'untitled';
      const language = getLanguageForFile(filePath);

      const tab: EditorTab = {
        id: `tab-${++tabCounter}`,
        path: filePath,
        name,
        language,
        content,
        savedContent: content,
        isDirty: false,
      };

      setTabs(prev => [...prev, tab]);
      setActiveTabId(tab.id);
      api.addRecentFile(filePath).catch(() => {});
      onFileOpened?.();
      return tab;
    } catch (err) {
      console.error('Failed to open file:', err);
      return null;
    }
  }, [onFileOpened]);

  const closeTab = useCallback((tabId: string) => {
    const current = tabsRef.current;
    const tab = current.find(t => t.id === tabId);
    if (tab) setClosedTabs(c => [tab, ...c].slice(0, 20));

    const remaining = current.filter(t => t.id !== tabId);

    if (activeTabId === tabId && remaining.length > 0) {
      const idx = current.findIndex(t => t.id === tabId);
      setActiveTabId(remaining[Math.min(idx, remaining.length - 1)]?.id || null);
    } else if (remaining.length === 0) {
      setActiveTabId(null);
    }

    setTabs(remaining);
  }, [activeTabId]);

  const reopenClosedTab = useCallback(() => {
    if (closedTabs.length === 0) return;
    const [tab, ...rest] = closedTabs;
    setClosedTabs(rest);
    setTabs(prev => [...prev, tab]);
    setActiveTabId(tab.id);
  }, [closedTabs]);

  const updateTabContent = useCallback((tabId: string, content: string) => {
    setTabs(prev => prev.map(t =>
      t.id === tabId ? { ...t, content, isDirty: content !== t.savedContent } : t
    ));
  }, []);

  const saveAs = useCallback(async (tabId: string) => {
    const tab = tabsRef.current.find(t => t.id === tabId);
    if (!tab) return;

    const api = getAPI();
    const newPath = await api.saveFileDialog(tab.name);
    if (!newPath) return;

    await api.writeFile(newPath, tab.content);
    const name = newPath.split(/[/\\]/).pop() || 'untitled';
    const language = getLanguageForFile(newPath);

    setTabs(prev => prev.map(t =>
      t.id === tabId ? { ...t, path: newPath, name, language, savedContent: t.content, isDirty: false } : t
    ));
  }, []);

  const saveTab = useCallback(async (tabId: string) => {
    const tab = tabsRef.current.find(t => t.id === tabId);
    if (!tab) return;
    if (!tab.path) {
      setTimeout(() => saveAs(tabId), 0);
      return;
    }
    if (!tab.isDirty) return;

    try {
      await getAPI().writeFile(tab.path, tab.content);
      setTabs(cur => cur.map(t =>
        t.id === tabId ? { ...t, savedContent: t.content, isDirty: false } : t
      ));
    } catch (err) {
      console.error('Failed to save file:', err);
    }
  }, [saveAs]);

  const saveAll = useCallback(async () => {
    const dirty = tabsRef.current.filter(t => t.isDirty && t.path);
    await Promise.allSettled(dirty.map(async (tab) => {
      try {
        await getAPI().writeFile(tab.path, tab.content);
        setTabs(cur => cur.map(t =>
          t.id === tab.id ? { ...t, savedContent: t.content, isDirty: false } : t
        ));
      } catch {}
    }));
  }, []);

  const createNewFile = useCallback(() => {
    const tab: EditorTab = {
      id: `tab-${++tabCounter}`,
      path: '',
      name: `untitled-${tabCounter}`,
      language: 'plaintext',
      content: '',
      savedContent: '',
      isDirty: false,
    };
    setTabs(prev => [...prev, tab]);
    setActiveTabId(tab.id);
  }, []);

  const reorderTabs = useCallback((fromIndex: number, toIndex: number) => {
    setTabs(prev => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }, []);

  return {
    tabs, activeTabId, setActiveTabId,
    openFile, closeTab, reopenClosedTab,
    updateTabContent, saveTab, saveAs, saveAll,
    createNewFile, reorderTabs,
  };
}
