import { useCallback, useEffect, useRef, useState } from 'react';
import { BlinkingCursor } from './TerminalOverlay';
import styles from './BootSequence.module.css';

export interface BootSequenceProps {
  /** Called exactly once when the sequence finishes or is skipped. */
  onComplete: () => void;
}

const LINES: readonly string[] = [
  '> initializing globe.sys ...',
  '> loading résumé.dat ...',
  '> geolocating career history ...',
  '> 4 cities found: MIA · NYC · DC · LON',
  '> render: OK',
  '> launch',
];

const CHAR_MS = 22;
const LINE_PAUSE_MS = 140;
const END_PAUSE_MS = 650;
const FADE_MS = 500;
const REDUCED_HOLD_MS = 600;

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Typewriter terminal boot log shown on first load, then fades out. Skippable
 * by click or keypress. Honors prefers-reduced-motion (instant log, short
 * hold). Calls onComplete exactly once via a ref guard.
 */
export function BootSequence({ onComplete }: BootSequenceProps) {
  // How many full lines are complete, plus the partial text of the active line.
  const [doneLines, setDoneLines] = useState(0);
  const [partial, setPartial] = useState('');
  const [finished, setFinished] = useState(false);
  const [fading, setFading] = useState(false);

  const completedRef = useRef(false);
  const skippedRef = useRef(false);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    for (const t of timersRef.current) clearTimeout(t);
    timersRef.current = [];
  }, []);

  // Fade then call onComplete (guarded to fire only once).
  const finishAndComplete = useCallback(() => {
    if (completedRef.current) return;
    setFinished(true);
    setFading(true);
    const t = setTimeout(() => {
      if (completedRef.current) return;
      completedRef.current = true;
      onComplete();
    }, FADE_MS);
    timersRef.current.push(t);
  }, [onComplete]);

  // Skip: show full log immediately, then fade + complete.
  const skip = useCallback(() => {
    if (skippedRef.current || completedRef.current) return;
    skippedRef.current = true;
    clearTimers();
    setDoneLines(LINES.length);
    setPartial('');
    finishAndComplete();
  }, [clearTimers, finishAndComplete]);

  // Reduced motion: render full log, hold briefly, complete.
  useEffect(() => {
    if (!prefersReducedMotion()) return;
    skippedRef.current = true;
    setDoneLines(LINES.length);
    const t = setTimeout(() => finishAndComplete(), REDUCED_HOLD_MS);
    timersRef.current.push(t);
    return () => clearTimers();
    // finishAndComplete/clearTimers are stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Typewriter driver.
  useEffect(() => {
    if (skippedRef.current || prefersReducedMotion()) return;
    if (doneLines >= LINES.length) {
      const t = setTimeout(() => finishAndComplete(), END_PAUSE_MS);
      timersRef.current.push(t);
      return;
    }

    const target = LINES[doneLines]!;
    if (partial.length < target.length) {
      const t = setTimeout(() => {
        setPartial(target.slice(0, partial.length + 1));
      }, CHAR_MS);
      timersRef.current.push(t);
    } else {
      const t = setTimeout(() => {
        setDoneLines((n) => n + 1);
        setPartial('');
      }, LINE_PAUSE_MS);
      timersRef.current.push(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doneLines, partial]);

  // Global skip on any key / click.
  useEffect(() => {
    const onKey = () => skip();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [skip]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const isLastLine = (index: number) => index === LINES.length - 1;

  return (
    <div
      className={[styles.overlay, fading ? styles.fading : '']
        .filter(Boolean)
        .join(' ')}
      onClick={skip}
      role="presentation"
      aria-label="Boot sequence — click to skip"
    >
      <pre className={styles.log} aria-live="polite">
        {LINES.slice(0, doneLines).map((line, i) => (
          <span key={i} className={styles.line}>
            {line}
            {isLastLine(i) && (finished || skippedRef.current) ? (
              <>
                {' '}
                <BlinkingCursor />
              </>
            ) : null}
            {'\n'}
          </span>
        ))}
        {doneLines < LINES.length && (
          <span className={styles.line}>
            {partial}
            <BlinkingCursor />
          </span>
        )}
      </pre>

      <span className={styles.skipHint} aria-hidden="true">
        [ click to skip ]
      </span>
    </div>
  );
}

export default BootSequence;
