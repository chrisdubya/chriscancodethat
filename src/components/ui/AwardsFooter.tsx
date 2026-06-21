import { useEffect, useRef } from 'react';
import type { Award, Social } from '../../data/resume';
import styles from './AwardsFooter.module.css';

export interface AwardsFooterProps {
  awards: Award[];
  contact: {
    name: string;
    role: string;
    email: string;
    phone: string;
    location: string;
    socials: Social[];
  };
  /** Hover/focus opens the full-résumé panel. */
  onResumeEnter: () => void;
  /** Pointer/focus left the résumé link. */
  onResumeLeave: () => void;
  /** Click toggles the panel (touch / keyboard). */
  onResumeToggle: () => void;
  resumeOpen: boolean;
}

/**
 * Persistent terminal status-bar footer fixed to the bottom of the viewport.
 * Left: name + role. Right: awards, socials and email. Collapses/wraps on
 * mobile.
 */
export function AwardsFooter({
  awards,
  contact,
  onResumeEnter,
  onResumeLeave,
  onResumeToggle,
  resumeOpen,
}: AwardsFooterProps) {
  const barRef = useRef<HTMLElement>(null);

  // Expose the footer's live height as --footer-height so other fixed overlays
  // (e.g. the mobile company-list dock) can sit above it instead of underneath.
  useEffect(() => {
    const el = barRef.current;
    if (!el || typeof document === 'undefined') return;
    const root = document.documentElement;
    const apply = () =>
      root.style.setProperty('--footer-height', `${el.offsetHeight}px`);
    apply();

    const ro =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(apply) : null;
    ro?.observe(el);
    window.addEventListener('resize', apply);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', apply);
      root.style.removeProperty('--footer-height');
    };
  }, []);

  return (
    <footer ref={barRef} className={styles.bar} aria-label="Résumé status bar">
      <div className={styles.left}>
        <span className={styles.name}>{contact.name}</span>
        <span className={styles.sep} aria-hidden="true">
          ·
        </span>
        <span className={styles.role}>{contact.role}</span>
      </div>

      <div className={styles.right}>
        {awards.length > 0 && (
          <ul className={styles.awards}>
            {awards.map((award) => (
              <li key={award.title} className={styles.award} title={award.detail}>
                <span className={styles.star} aria-hidden="true">
                  *
                </span>
                {award.url ? (
                  <a
                    className={styles.awardLink}
                    href={award.url}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    {award.title}
                  </a>
                ) : (
                  award.title
                )}
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          className={styles.resume}
          aria-haspopup="dialog"
          aria-expanded={resumeOpen}
          onMouseEnter={onResumeEnter}
          onMouseLeave={onResumeLeave}
          onFocus={onResumeEnter}
          onBlur={onResumeLeave}
          onClick={onResumeToggle}
        >
          [ résumé ]
        </button>

        <nav className={styles.socials} aria-label="Social links">
          {contact.socials.map((social) => (
            <a
              key={social.label}
              href={social.href}
              className={styles.social}
              target={social.href.startsWith('mailto:') ? undefined : '_blank'}
              rel="noreferrer noopener"
            >
              {social.label}
            </a>
          ))}
        </nav>

        <a className={styles.email} href={`mailto:${contact.email}`}>
          {contact.email}
        </a>
      </div>
    </footer>
  );
}

export default AwardsFooter;
