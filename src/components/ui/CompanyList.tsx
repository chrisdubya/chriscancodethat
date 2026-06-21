import type { KeyboardEvent } from 'react';
import type { City, Company } from '../../data/resume';
import { TerminalOverlay } from './TerminalOverlay';
import styles from './CompanyList.module.css';

export interface CompanyListProps {
  /** null → render nothing. */
  city: City | null;
  onSelectCompany: (company: Company) => void;
  selectedCompanyName?: string | null;
}

/** Turn a company name into a path-friendly slug, e.g. "Hazel Health" → "hazel-health". */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Terminal-style list of a city's companies. Shown when a city is hovered or
 * selected; renders nothing when `city` is null. Each row is keyboard
 * accessible and calls `onSelectCompany`.
 */
export function CompanyList({
  city,
  onSelectCompany,
  selectedCompanyName,
}: CompanyListProps) {
  if (city == null) return null;

  const handleKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
    company: Company,
  ) => {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault();
      onSelectCompany(company);
    }
  };

  const citySlug = slugify(city.name);

  return (
    <div className={styles.dock}>
      <TerminalOverlay title={`~/career/${citySlug}`} className={styles.panel}>
        <h2 className={styles.cityName}>{city.label}</h2>
        <p className={styles.prompt}>
          <span className={styles.promptSign}>{'>'}</span> ls ./{citySlug}{' '}
          <span className={styles.flag}>--roles</span>
        </p>
        <ul className={styles.list}>
          {city.companies.map((company) => {
            const slug = slugify(company.name);
            const isSelected = selectedCompanyName === company.name;
            return (
              <li key={company.name}>
                <div
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  className={[styles.row, isSelected ? styles.rowActive : '']
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => onSelectCompany(company)}
                  onKeyDown={(event) => handleKeyDown(event, company)}
                >
                  <span className={styles.rowMain}>
                    <span className={styles.arrow} aria-hidden="true">
                      ▸
                    </span>{' '}
                    open ./{slug}
                    {company.remote && (
                      <span className={styles.tagRemote}>[remote]</span>
                    )}
                    {company.placeholder && (
                      <span className={styles.tagSoon}>[ COMING SOON ]</span>
                    )}
                  </span>
                  <span className={styles.dates}>{company.dates}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </TerminalOverlay>
    </div>
  );
}

export default CompanyList;
