import { html } from '../services/html';
import { useState, useRef, useCallback } from 'preact/hooks';
import { getAPI } from '../services/ipc-client';
import type { SearchResult } from '../../shared/types';

interface SearchPanelProps {
  onClose: () => void;
  onNavigate: (filePath: string, line: number, column: number) => void;
}

const checkboxStyle: h.JSX.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 4,
  fontSize: 11, color: 'var(--text-muted)', cursor: 'pointer',
  userSelect: 'none',
};

export function SearchPanel({ onClose, onNavigate }: SearchPanelProps) {
  const [query, setQuery] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchPath, setSearchPath] = useState('');
  const [searching, setSearching] = useState(false);
  const [replacing, setReplacing] = useState(false);
  const [regex, setRegex] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [regexError, setRegexError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = useCallback(async () => {
    if (!query.trim() || !searchPath) return;
    setSearching(true);
    setResults([]);
    setRegexError(false);

    if (regex) {
      try { new RegExp(query); } catch { setRegexError(true); setSearching(false); return; }
    }

    const api = getAPI();
    const results: SearchResult[] = [];
    let re: RegExp | null = null;
    if (regex) {
      re = new RegExp(query, caseSensitive ? 'g' : 'gi');
    }

    async function searchInDir(dirPath: string) {
      try {
        const nodes = await api.readDir(dirPath);
        for (const node of nodes) {
          if (node.type === 'directory' && !node.name.startsWith('.') && node.name !== 'node_modules') {
            await searchInDir(node.path);
          } else if (node.type === 'file') {
            try {
              const content = await api.readFile(node.path);
              const lines = content.split('\n');
              if (re) {
                lines.forEach((line, idx) => {
                  let m: RegExpExecArray | null;
                  re!.lastIndex = 0;
                  while ((m = re!.exec(line)) !== null) {
                    results.push({
                      file: node.path,
                      line: idx + 1,
                      column: m.index + 1,
                      lineContent: line.substring(0, 200),
                      matchLength: m[0].length,
                    });
                    if (m[0].length === 0) re!.lastIndex++;
                  }
                });
              } else if (caseSensitive) {
                lines.forEach((line, idx) => {
                  let col = 0;
                  while ((col = line.indexOf(query, col)) !== -1) {
                    results.push({
                      file: node.path,
                      line: idx + 1,
                      column: col + 1,
                      lineContent: line.substring(0, 200),
                      matchLength: query.length,
                    });
                    col += query.length;
                  }
                });
              } else {
                const lower = query.toLowerCase();
                lines.forEach((line, idx) => {
                  let col = 0;
                  while ((col = line.toLowerCase().indexOf(lower, col)) !== -1) {
                    results.push({
                      file: node.path,
                      line: idx + 1,
                      column: col + 1,
                      lineContent: line.substring(0, 200),
                      matchLength: query.length,
                    });
                    col += query.length;
                  }
                });
              }
            } catch {}
          }
        }
      } catch {}
    }

    await searchInDir(searchPath);
    setResults(results.slice(0, 500));
    setSearching(false);
  }, [query, replaceText, searchPath, regex, caseSensitive]);

  const handleReplaceAll = useCallback(async () => {
    if (!query.trim() || !replaceText || results.length === 0) return;

    if (regex) {
      try { new RegExp(query); } catch { return; }
    }

    setReplacing(true);
    const api = getAPI();
    const seen = new Set<string>();

    for (const r of results) {
      if (seen.has(r.file)) continue;
      seen.add(r.file);
      try {
        await api.replaceInFile(r.file, query, replaceText, regex, caseSensitive);
      } catch {}
    }

    setReplacing(false);
    handleSearch();
  }, [query, replaceText, results, regex, caseSensitive]);

  const queryStyle: h.JSX.CSSProperties = {
    flex: 1,
    background: regexError ? 'rgba(239,68,68,0.1)' : 'var(--surface-hover)',
    border: regexError ? '1px solid #ef4444' : '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '6px 12px',
    color: regexError ? '#ef4444' : 'var(--text)',
    fontSize: 13,
    outline: 'none',
  };

  return html`<div
    style=${{ position: 'fixed', inset: 0, zIndex: 900, display: 'flex', justifyContent: 'center', paddingTop: '8vh', background: 'rgba(0,0,0,0.3)', animation: 'fade-in 120ms var(--ease-smooth)' }}
    onClick=${onClose}
  >
    <div
      style=${{ width: 700, maxWidth: '90vw', maxHeight: '80vh', display: 'flex', flexDirection: 'column', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', overflow: 'hidden', animation: 'scale-in 200ms var(--ease-spring)' }}
      onClick=${(e: MouseEvent) => e.stopPropagation()}
    >
      <div style=${{ padding: 'var(--space-md)', borderBottom: '1px solid var(--border)', display: 'flex', gap: 8, flexDirection: 'column' }}>
        <div style=${{ display: 'flex', gap: 8 }}>
          <input
            ref=${inputRef}
            type="text"
            value=${query}
            onInput=${(e: any) => { setQuery(e.target.value); setRegexError(false); }}
            onKeyDown=${(e: KeyboardEvent) => { if (e.key === 'Enter') handleSearch(); }}
            placeholder=${regex ? 'Regex pattern...' : 'Search...'}
            style=${queryStyle}
          />
          <input
            type="text"
            value=${replaceText}
            onInput=${(e: any) => setReplaceText(e.target.value)}
            placeholder="Replace..."
            style=${{ flex: 1, background: 'var(--surface-hover)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '6px 12px', color: 'var(--text)', fontSize: 13, outline: 'none' }}
          />
          <button
            onClick=${handleSearch}
            disabled=${searching}
            style=${{ padding: '6px 16px', borderRadius: 'var(--radius-sm)', background: 'var(--accent)', color: '#fff', fontWeight: 500, fontSize: 13, cursor: 'pointer', transition: 'all 200ms var(--ease-smooth)', opacity: searching ? 0.5 : 1 }}
          >
            ${searching ? '...' : 'Search'}
          </button>
        </div>
        <div style=${{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <label style=${checkboxStyle}>
            <input type="checkbox" checked=${regex} onChange=${(e: any) => setRegex(e.target.checked)} style=${{ accentColor: 'var(--accent)' }} />
            Regex
          </label>
          <label style=${checkboxStyle}>
            <input type="checkbox" checked=${caseSensitive} onChange=${(e: any) => setCaseSensitive(e.target.checked)} style=${{ accentColor: 'var(--accent)' }} />
            Case sensitive
          </label>
          <div style=${{ flex: 1 }} />
          <button
            onClick=${handleReplaceAll}
            disabled=${replacing || results.length === 0 || !replaceText}
            style=${{ padding: '4px 12px', borderRadius: 'var(--radius-sm)', background: replacing ? 'var(--surface-hover)' : 'var(--accent-soft)', color: replacing ? 'var(--text-muted)' : 'var(--accent)', fontWeight: 500, fontSize: 11, cursor: replacing || results.length === 0 || !replaceText ? 'default' : 'pointer', transition: 'all 200ms var(--ease-smooth)', opacity: replacing ? 0.5 : 1 }}
          >
            ${replacing ? 'Replacing...' : `Replace All (${results.length})`}
          </button>
          <div style=${{ fontSize: 11, color: 'var(--text-muted)' }}>
            ${results.length > 0 ? `${results.length} results` : searchPath && !searching ? 'No results' : searchPath ? '' : 'Open a folder first'}
          </div>
        </div>
        ${regexError && html`<div style=${{ fontSize: 11, color: '#ef4444' }}>Invalid regular expression</div>`}
      </div>

      <div style=${{ flex: 1, overflow: 'auto' }}>
        ${results.map((r, i) => html`<div
            key=${`${r.file}:${r.line}:${r.column}-${i}`}
            onClick=${() => {
              onNavigate(r.file, r.line, r.column);
            }}
            style=${{ display: 'flex', alignItems: 'center', padding: '4px 16px', cursor: 'pointer', borderBottom: '1px solid var(--border)', fontSize: 12, transition: 'background 100ms', animation: `slide-in-left 200ms var(--ease-smooth) ${i * 15}ms both` }}
            onMouseEnter=${(e: any) => e.currentTarget.style.background = 'var(--surface-hover)'}
            onMouseLeave=${(e: any) => e.currentTarget.style.background = 'transparent'}
          >
            <span style=${{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: 11, minWidth: 40 }}>
              L${r.line}
            </span>
            <span style=${{ color: 'var(--text-subtle)', marginRight: 8, fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>
              ${r.file.split(/[/\\]/).pop()}
            </span>
            <span style=${{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)' }}>
              ${r.lineContent.substring(0, 300)}
            </span>
          </div>`)}
      </div>
    </div>
  </div>`;
}
