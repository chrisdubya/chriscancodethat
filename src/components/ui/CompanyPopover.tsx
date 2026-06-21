import { useCallback, useEffect, useId, useRef } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent, MouseEvent } from 'react';
import type { Company } from '../../data/resume';
import { TerminalOverlay } from './TerminalOverlay';
import styles from './CompanyPopover.module.css';

export interface CompanyPopoverProps {
  /** null → render nothing. */
  company: Company | null;
  onClose: () => void;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Centered modal-ish popover showing the CV summary for the selected company.
 * Closes on Esc, backdrop click and the close button. Renders nothing when
 * `company` is null.
 */
export function CompanyPopover({ company, onClose }: CompanyPopoverProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const titleId = useId();

  // Close on Escape (document-level so it works regardless of focus).
  useEffect(() => {
    if (company == null) return;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [company, onClose]);

  // Capture/restore focus and move focus into the dialog on open.
  useEffect(() => {
    if (company == null) return;
    previouslyFocused.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    dialogRef.current?.focus();
    const restore = previouslyFocused.current;
    return () => {
      restore?.focus?.();
    };
  }, [company]);

  // Minimal focus trap within the dialog.
  const handleDialogKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLDivElement>) => {
      if (event.key !== 'Tab') return;
      const root = dialogRef.current;
      if (root == null) return;
      const focusable = root.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      const active = document.activeElement;
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [],
  );

  if (company == null) return null;

  const onBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  const slug = slugify(company.name);

  return (
    <div
      className={styles.backdrop}
      onMouseDown={onBackdropClick}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={styles.dialog}
        onKeyDown={handleDialogKeyDown}
      >
        <TerminalOverlay title={`cat ./${slug}.md`} className={styles.panel}>
          <div className={styles.head}>
            <h2 id={titleId} className={styles.name}>
              {company.name}
            </h2>
            <button
              type="button"
              className={styles.close}
              onClick={onClose}
              aria-label="Close"
            >
              [ esc ]
            </button>
          </div>

          <p className={styles.meta}>
            {company.title} <span className={styles.at}>@</span> {company.dates}
            {company.remote && <span className={styles.remote}> · remote</span>}
          </p>

          {company.placeholder ? (
            <div className={styles.soonBlock}>
              <p className={styles.soon}>[ COMING SOON ]</p>
              <p className={styles.summary}>Details coming soon.</p>
            </div>
          ) : (
            <>
              {company.tech.length > 0 && (
                <p className={styles.tech}>
                  {company.tech.map((t) => (
                    <span key={t} className={styles.techTag}>
                      [{t.toLowerCase()}]
                    </span>
                  ))}
                </p>
              )}
              {company.summary
                .split('\n')
                .filter((para) => para.trim().length > 0)
                .map((para, i) => (
                  <p key={i} className={styles.summary}>
                    {para}
                  </p>
                ))}
              {company.url != null && (
                <p className={styles.link}>
                  <span className={styles.prompt}>{'>'}</span> open{' '}
                  <a href={company.url} target="_blank" rel="noreferrer noopener">
                    {company.url}
                  </a>
                </p>
              )}
            </>
          )}
        </TerminalOverlay>
      </div>
    </div>
  );
}

export default CompanyPopover;
