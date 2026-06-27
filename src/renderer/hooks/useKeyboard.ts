import { useEffect, useRef } from 'preact/hooks';
import { getAPI } from '../services/ipc-client';

interface KeyboardActionMap {
  [shortcut: string]: () => void;
}

export function useKeyboard(actions: KeyboardActionMap) {
  const actionsRef = useRef(actions);
  actionsRef.current = actions;

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const key = [
        e.ctrlKey || e.metaKey ? 'Ctrl' : '',
        e.altKey ? 'Alt' : '',
        e.shiftKey ? 'Shift' : '',
        e.key.length === 1 ? e.key.toUpperCase() : e.key,
      ].filter(Boolean).join('+');

      const action = actionsRef.current[key];
      if (action) {
        e.preventDefault();
        e.stopPropagation();
        action();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const cleanup = getAPI().onMenuAction((action: string) => {
      switch (action) {
        case 'file:new': actionsRef.current['Ctrl+N']?.(); break;
        case 'file:open': actionsRef.current['Ctrl+O']?.(); break;
        case 'file:save': actionsRef.current['Ctrl+S']?.(); break;
        case 'file:saveAs': actionsRef.current['Ctrl+Shift+S']?.(); break;
        case 'file:closeTab': actionsRef.current['Ctrl+W']?.(); break;
        case 'view:toggleSidebar': actionsRef.current['Ctrl+B']?.(); break;
        case 'view:commandPalette': actionsRef.current['Ctrl+Shift+P']?.(); break;
        case 'view:toggleTerminal': actionsRef.current['Ctrl+`']?.(); break;
        case 'view:toggleAI': actionsRef.current['Ctrl+Shift+L']?.(); break;
        default: break;
      }
    });
    return () => { if (typeof cleanup === 'function') cleanup(); };
  }, []);
}
