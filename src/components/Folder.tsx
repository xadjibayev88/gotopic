// Yig'iladigan «papka»: sarlavhani bosganda ichki qismi silliq ochiladi (balandlik 0 → avto),
// elementlar ketma-ket yuqoridan tushib keladi, strelka aylanadi. Yopilganda teskari.
import { Children, isValidElement, useId, useState, type CSSProperties, type ReactNode } from 'react';

export function Folder({
  icon,
  title,
  summary,
  children,
  defaultOpen = false,
  className = '',
}: {
  icon: ReactNode;
  title: string;
  summary?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  let i = 0;
  return (
    <div className={`folder ${open ? 'open' : ''} ${className}`}>
      <button type="button" className="folder-head" aria-expanded={open} aria-controls={id} onClick={() => setOpen((v) => !v)}>
        <span className="folder-icon" aria-hidden="true">{icon}</span>
        <span className="folder-text">
          <b>{title}</b>
          {summary && <small>{summary}</small>}
        </span>
        <svg className="folder-chev" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div className="folder-body" id={id} role="region" aria-hidden={!open}>
        <div className="folder-inner">
          {Children.map(children, (child) =>
            isValidElement(child) ? (
              <div className="folder-item" style={{ '--fi': i++ } as CSSProperties}>
                {child}
              </div>
            ) : (
              child
            ),
          )}
        </div>
      </div>
    </div>
  );
}
