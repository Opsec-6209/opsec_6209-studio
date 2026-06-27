import { ComponentChildren } from 'preact';
import { html } from '../services/html';
import { useState, useRef, useCallback, useEffect } from 'preact/hooks';

interface SplitPaneProps {
  direction: 'horizontal' | 'vertical';
  initialSplit?: number;
  children: ComponentChildren;
  bottom?: ComponentChildren;
  right?: ComponentChildren;
}

export function SplitPane({ direction, initialSplit = 50, children, bottom, right }: SplitPaneProps) {
  const [split, setSplit] = useState(initialSplit);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isVertical = direction === 'vertical';
  const secondary = bottom || right;
  const hasSecondary = !!secondary;

  const handleMouseDown = useCallback((e: MouseEvent) => { e.preventDefault(); setDragging(true); }, []);

  useEffect(() => {
    if (!dragging) return;
    const mm = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = isVertical ? ((e.clientY - rect.top) / rect.height) * 100 : ((e.clientX - rect.left) / rect.width) * 100;
      setSplit(Math.max(10, Math.min(90, pct)));
    };
    const mu = () => setDragging(false);
    document.addEventListener('mousemove', mm);
    document.addEventListener('mouseup', mu);
    return () => { document.removeEventListener('mousemove', mm); document.removeEventListener('mouseup', mu); };
  }, [dragging, isVertical]);

  return html`
    <div ref=${containerRef} style=${{
      flex: 1, display: 'flex', flexDirection: isVertical ? 'column' : 'row',
      minHeight: 0, minWidth: 0, overflow: 'hidden',
      cursor: dragging ? (isVertical ? 'row-resize' : 'col-resize') : undefined,
      userSelect: dragging ? 'none' : undefined,
    }}>
      <div style=${{
        flex: hasSecondary ? `0 0 ${split}%` : '1 1 100%', minHeight: 0, minWidth: 0,
        display: 'flex', overflow: 'hidden',
      }}>${children}</div>

      ${hasSecondary && html`
        <div
          onMouseDown=${handleMouseDown}
          style=${{
            [isVertical ? 'height' : 'width']: 4, [isVertical ? 'width' : 'height']: '100%',
            background: dragging ? 'var(--accent)' : 'var(--border)',
            cursor: isVertical ? 'row-resize' : 'col-resize', flexShrink: 0,
            transition: dragging ? 'none' : 'background 200ms ease', position: 'relative', zIndex: 5,
          }}
          onMouseEnter=${(e: any) => { if (!dragging) e.currentTarget.style.background = 'var(--accent)'; }}
          onMouseLeave=${(e: any) => { if (!dragging) e.currentTarget.style.background = 'var(--border)'; }}
        >
          <div style=${{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: isVertical ? 28 : 4, height: isVertical ? 4 : 28, borderRadius: 2,
            background: 'var(--border-strong)', opacity: dragging ? 0 : 1,
            transition: 'opacity 150ms ease',
          }} />
        </div>
        <div style=${{
          flex: `0 0 ${100 - split}%`, minHeight: 0, minWidth: 0,
          display: 'flex', overflow: 'hidden',
        }}>${secondary}</div>
      `}
    </div>
  `;
}
