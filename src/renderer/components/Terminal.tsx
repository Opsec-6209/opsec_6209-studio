import { html } from '../services/html';
import { useRef, useEffect, useState } from 'preact/hooks';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import { getAPI } from '../services/ipc-client';
import type { Settings } from '../../shared/types';
import 'xterm/css/xterm.css';

interface TerminalPanelProps {
  settings: Settings;
}

function createTerminalId() {
  return `terminal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function TerminalPanel({ settings }: TerminalPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const cleanupRef = useRef<(() => void)[]>([]);
  const mountedRef = useRef(true);
  const [terminals, setTerminals] = useState<string[]>([createTerminalId()]);
  const [activeTermId, setActiveTermId] = useState(terminals[0]);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (!containerRef.current || !activeTermId) return;

    if (terminalRef.current) {
      try { terminalRef.current.dispose(); } catch { /* dispose may throw if already disposed */ }
      terminalRef.current = null;
      fitAddonRef.current = null;
    }

    const term = new Terminal({
      cursorBlink: true,
      fontSize: settings.terminal?.fontSize || 13,
      fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
      theme: {
        background: '#0d0d0d',
        foreground: '#e4e4e7',
        cursor: '#818cf8',
        selectionBackground: 'rgba(129, 140, 248, 0.3)',
        black: '#18181b',
        red: '#ef4444',
        green: '#10b981',
        yellow: '#f59e0b',
        blue: '#818cf8',
        magenta: '#a78bfa',
        cyan: '#22d3ee',
        white: '#e4e4e7',
        brightBlack: '#52525b',
        brightRed: '#f87171',
        brightGreen: '#34d399',
        brightYellow: '#fbbf24',
        brightBlue: '#a5b4fc',
        brightMagenta: '#c4b5fd',
        brightCyan: '#67e8f9',
        brightWhite: '#fafafa',
      },
      allowProposedApi: true,
      scrollback: 5000,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.loadAddon(new WebLinksAddon());

    term.open(containerRef.current);
    fitAddon.fit();

    terminalRef.current = term;
    fitAddonRef.current = fitAddon;

    const api = getAPI();
    const tid = activeTermId;

    term.onData((data: string) => {
      api.writeTerminal(tid, data);
    });

    const unsubData = api.onTerminalData((incomingTid: string, data: string) => {
      if (incomingTid === tid && terminalRef.current) {
        terminalRef.current.write(data);
      }
    });

    const unsubExit = api.onTerminalExit((exitTid: string, code: number) => {
      if (exitTid === tid && terminalRef.current) {
        terminalRef.current.write(`\r\n\n[Process exited with code ${code}]\r\n`);
      }
    });

    const handleResize = () => {
      if (terminalRef.current && fitAddonRef.current) {
        fitAddonRef.current.fit();
        api.resizeTerminal(tid, terminalRef.current.cols, terminalRef.current.rows).catch(() => {});
      }
    };

    window.addEventListener('resize', handleResize);

    cleanupRef.current = [
      () => window.removeEventListener('resize', handleResize),
      unsubData,
      unsubExit,
      () => { try { term.dispose(); } catch { /* dispose may throw */ } },
    ];

    api.spawnTerminal(tid, term.cols, term.rows).catch(() => {
      if (mountedRef.current && terminalRef.current === term) {
        term.write('Failed to start terminal.\r\n');
      }
    });

    return () => {
      cleanupRef.current.forEach(fn => fn());
      api.killTerminal(tid).catch(() => {});
    };
  }, [activeTermId]);

  const addTerminal = () => {
    const id = createTerminalId();
    setTerminals(prev => [...prev, id]);
    setActiveTermId(id);
  };

  const killActiveTerminal = async () => {
    const api = getAPI();
    api.killTerminal(activeTermId).catch(() => {});
    setTerminals(prev => {
      const remaining = prev.filter(t => t !== activeTermId);
      if (remaining.length > 0) {
        setActiveTermId(remaining[0]);
        return remaining;
      }
      const id = createTerminalId();
      setActiveTermId(id);
      return [id];
    });
  };

  const closeTab = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    const api = getAPI();
    api.killTerminal(id).catch(() => {});
    if (id !== activeTermId) {
      setTerminals(prev => prev.filter(t => t !== id));
    } else {
      setTerminals(prev => {
        const remaining = prev.filter(t => t !== id);
        if (remaining.length > 0) {
          setActiveTermId(remaining[0]);
          return remaining;
        }
        const newId = createTerminalId();
        setActiveTermId(newId);
        return [newId];
      });
    }
  };

  return html`
    <div style=${{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: '#0d0d0d',
    }}>
      <div style=${{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '2px 8px',
        borderBottom: '1px solid #262626',
        fontSize: 12,
        background: '#141414',
        overflow: 'auto',
        flexShrink: 0,
      }}>
        ${terminals.map(id => html`
          <div
            key=${id}
            onClick=${() => setActiveTermId(id)}
            style=${{
              padding: '2px 10px',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              color: id === activeTermId ? 'var(--text)' : 'var(--text-muted)',
              background: id === activeTermId ? '#262626' : 'transparent',
              transition: 'all 150ms ease',
              fontSize: 11,
              whiteSpace: 'nowrap',
            }}
          >
            Terminal ${terminals.indexOf(id) + 1}
            ${terminals.length > 1 && html`
              <span
                onClick=${(e: MouseEvent) => closeTab(id, e)}
                style=${{
                  marginLeft: 6,
                  opacity: 0.5,
                  cursor: 'pointer',
                }}
              >×</span>
            `}
          </div>
        `)}
        <button
          onClick=${addTerminal}
          style=${{
            padding: '2px 8px',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            transition: 'all 150ms ease',
            fontSize: 14,
          }}
          title="New Terminal"
        >+</button>
        <div style=${{ flex: 1 }} />
        <button
          onClick=${killActiveTerminal}
          style=${{
            padding: '2px 8px',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            transition: 'all 150ms ease',
            fontSize: 13,
          }}
          title="Kill Terminal"
        >🗑</button>
      </div>
      <div
        ref=${containerRef}
        style=${{
          flex: 1,
          minHeight: 0,
          padding: 4,
        }}
      />
    </div>
  `;
}
