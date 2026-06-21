import { useEffect } from 'react';
import { awards, cities, contact, skills } from '../../data/resume';
import { TerminalOverlay } from './TerminalOverlay';
import styles from './FullResumePanel.module.css';

export interface FullResumePanelProps {
  open: boolean;
  /** Pointer entered the panel — cancel any pending close. */
  onEnter: () => void;
  /** Pointer left the panel — schedule a close. */
  onLeave: () => void;
  /** Immediate close (Esc). */
  onClose: () => void;
}

/**
 * Scrollable terminal panel showing the complete résumé. Opened by hovering the
 * footer "résumé" link; stays open while the pointer is over it. Renders nothing
 * when closed.
 */
export function FullResumePanel({
  open,
  onEnter,
  onLeave,
  onClose,
}: FullResumePanelProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={styles.dock}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      role="dialog"
      aria-label="Full résumé"
    >
      <TerminalOverlay title="cat ./resume.md" className={styles.panel}>
        <header className={styles.header}>
          <h2 className={styles.name}>{contact.name}</h2>
          <p className={styles.role}>{contact.role}</p>
          <p className={styles.contact}>
            {contact.location} ·{' '}
            <a href={`mailto:${contact.email}`}>{contact.email}</a> ·{' '}
            {contact.phone}
          </p>
        </header>

        {skills.length > 0 && (
          <section className={styles.city}>
            <h3 className={styles.cityName}>Skills</h3>
            {skills.map((group) => (
              <p key={group.category} className={styles.skillGroup}>
                <span className={styles.skillCategory}>{group.category}:</span>{' '}
                {group.items.join(' · ')}
              </p>
            ))}
          </section>
        )}

        {cities.map((city) => (
          <section key={city.id} className={styles.city}>
            <h3 className={styles.cityName}>{city.label}</h3>
            {city.companies.map((company) => (
              <article key={company.name} className={styles.role}>
                <p className={styles.companyLine}>
                  <span className={styles.company}>{company.name}</span>
                  <span className={styles.dates}>{company.dates}</span>
                </p>
                <p className={styles.title}>
                  {company.title}
                  {company.remote && (
                    <span className={styles.remote}> · remote</span>
                  )}
                </p>
                {company.placeholder ? (
                  <p className={styles.summary}>Details coming soon.</p>
                ) : (
                  <p className={styles.summary}>{company.summary}</p>
                )}
              </article>
            ))}
          </section>
        ))}

        {awards.length > 0 && (
          <section className={styles.city}>
            <h3 className={styles.cityName}>Awards</h3>
            <ul className={styles.awards}>
              {awards.map((award) => (
                <li key={award.title}>
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
                    <span className={styles.company}>{award.title}</span>
                  )}{' '}
                  — {award.detail}
                </li>
              ))}
            </ul>
          </section>
        )}
      </TerminalOverlay>
    </div>
  );
}

export default FullResumePanel;
