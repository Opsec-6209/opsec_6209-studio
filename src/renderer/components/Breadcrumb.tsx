import { html } from '../services/html';

interface BreadcrumbProps {
  filePath: string | null;
  onNavigate: (path: string) => void;
  zenMode?: boolean;
}

export function Breadcrumb({ filePath, onNavigate, zenMode }: BreadcrumbProps) {
  if (!filePath) return null;

  const separators = filePath.includes('\\') ? '\\' : '/';
  const segments = filePath.split(separators);
  const root = filePath.startsWith('\\\\') ? segments.slice(0, 2).join(separators) : null;

  const clickable = root ? segments.slice(2) : segments;
  const prefix = root ? [root] : [];

  return html`
    <div style=${{
      display: 'flex',
      alignItems: 'center',
      height: zenMode ? 0 : 28,
      padding: zenMode ? 0 : '0 12px',
      background: 'var(--bg)',
      borderBottom: zenMode ? 'none' : '1px solid var(--border)',
      flexShrink: 0,
      fontSize: 12,
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      color: 'var(--text-muted)',
      gap: 2,
      opacity: zenMode ? 0 : 1,
      transition: 'height 300ms var(--ease-smooth), opacity 300ms var(--ease-smooth), padding 300ms var(--ease-smooth)',
    }}>
      ${prefix.map((seg, i) => html`
        <span
          key=${`p-${i}`}
          style=${{
            padding: '2px 4px',
            borderRadius: 'var(--radius-sm)',
            cursor: 'pointer',
            transition: 'all 150ms var(--ease-smooth)',
          }}
          onClick=${() => {
            const upTo = prefix.slice(0, i + 1).join(separators);
            onNavigate(upTo);
          }}
          onMouseEnter=${(e: any) => { e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.color = 'var(--text)'; }}
          onMouseLeave=${(e: any) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >${seg}</span>
        ${i < prefix.length - 1 || clickable.length > 0 ? html`<span style=${{ opacity: 0.4 }}>${'>'}</span>` : null}
      `)}

      ${clickable.map((seg, i) => {
        const isLast = i === clickable.length - 1;
        return html`
          <span key=${i}>
            <span
              style=${{
                padding: '2px 4px',
                borderRadius: 'var(--radius-sm)',
                cursor: isLast ? 'default' : 'pointer',
                color: isLast ? 'var(--text)' : 'var(--text-muted)',
                fontWeight: isLast ? 500 : 400,
                transition: 'all 150ms var(--ease-smooth)',
              }}
              onClick=${() => {
                if (isLast) return;
                const upTo = [...prefix, ...clickable.slice(0, i + 1)].join(separators);
                onNavigate(upTo);
              }}
              onMouseEnter=${(e: any) => {
                if (!isLast) { e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.color = 'var(--text)'; }
              }}
              onMouseLeave=${(e: any) => {
                if (!isLast) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }
              }}
            >${seg}</span>
            ${!isLast && html`<span style=${{ opacity: 0.4, margin: '0 1px' }}>${'>'}</span>`}
          </span>
        `;
      })}
    </div>
  `;
}
