import type { ReactNode } from 'react';
import styles from './TerminalOverlay.module.css';

export interface TerminalOverlayProps {
  /** Shown in the title bar. */
  title?: string;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
}

/**
 * Reusable terminal-window frame: traffic-light chrome, title bar, scanline
 * texture, body area and an optional footer. Other overlay components compose
 * their content inside this frame.
 */
export function TerminalOverlay({
  title = 'chris@chriscancodethat: ~',
  children,
  className,
  footer,
}: TerminalOverlayProps) {
  return (
    <div className={[styles.window, className].filter(Boolean).join(' ')}>
      <div className={styles.titleBar}>
        <span className={styles.dots} aria-hidden="true">
          <span className={styles.dot} data-color="red" />
          <span className={styles.dot} data-color="amber" />
          <span className={styles.dot} data-color="green" />
        </span>
        <span className={styles.title}>{title}</span>
      </div>
      <div className={styles.body}>{children}</div>
      {footer != null && <div className={styles.footer}>{footer}</div>}
      <span className={styles.scanlines} aria-hidden="true" />
    </div>
  );
}

/**
 * A blinking block cursor (▊). Respects prefers-reduced-motion by rendering a
 * solid (non-blinking) block.
 */
export function BlinkingCursor() {
  return (
    <span className={styles.cursor} aria-hidden="true">
      ▊
    </span>
  );
}

export default TerminalOverlay;
