import { useState, useEffect, useCallback, useRef } from 'preact/hooks';
import { getAPI } from '../services/ipc-client';
import type { Settings } from '../../shared/types';

const DEFAULT_SETTINGS: Settings = {
  theme: 'dark',
  fontSize: 14,
  fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
  tabSize: 2,
  wordWrap: 'off',
  wordWrapColumn: 80,
  minimap: true,
  autoSave: false,
  recentFiles: [],
  terminal: { fontSize: 13, shell: '' },
  ai: { provider: 'opencode', apiKey: '', model: 'gpt-4', endpoint: 'https://api.openai.com/v1/chat/completions' },
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  useEffect(() => {
    async function load() {
      try {
        const api = getAPI();
        const s = await api.loadSettings();
        setSettings(s);
      } catch {}
      setLoaded(true);
    }
    load();
  }, []);

  const updateSettings = useCallback(async (partial: Partial<Settings>) => {
    const merged = { ...settingsRef.current, ...partial };
    setSettings(merged);
    await getAPI().saveSettings(merged);
    document.documentElement.setAttribute('data-theme', merged.theme);
  }, []);

  const toggleTheme = useCallback(async () => {
    const current = settingsRef.current;
    await updateSettings({ theme: current.theme === 'dark' ? 'light' : 'dark' });
  }, [updateSettings]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  return { settings, updateSettings, toggleTheme, loaded };
}
