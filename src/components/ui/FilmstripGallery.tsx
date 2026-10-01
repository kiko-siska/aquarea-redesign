/**
 * Snap-scrolling photo strip with a "gate" frame and a native <dialog> lightbox.
 * Adapted from 21st.dev "Filmstrip Gallery" by @n1m4mz
 * (https://21st.dev/@n1m4mz/components/filmstrip-gallery): kept the scroll-snap gate, keyboard
 * control, one announcement per settled frame and the dialog lightbox; dropped the film-negative
 * look, sprockets and edge printing; Slovak labels; responsive sources from Astro.
 */
import * as React from 'react';

export interface StripImage {
  src: string;
  srcSet?: string;
  large: string;
  width: number;
  height: number;
  alt: string;
  caption?: string;
  /** short label above the frame, e.g. the time of day */
  label?: string;
}

interface Props {
  images: StripImage[];
  label: string;
  defaultIndex?: number;
  className?: string;
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

function useReducedMotion() {
  const subscribe = React.useCallback((notify: () => void) => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    mq.addEventListener('change', notify);
    return () => mq.removeEventListener('change', notify);
  }, []);
  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    () => false,
  );
}

const Arrow = ({ dir }: { dir: 'left' | 'right' }) => (
  <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={{ transform: dir === 'left' ? 'rotate(180deg)' : undefined }}>
    <path d="m9 18 6-6-6-6" />
  </svg>
);

export default function FilmstripGallery({ images, label, defaultIndex = 0, className }: Props) {
  const reduce = useReducedMotion();
  const count = images.length;
  const last = Math.max(0, count - 1);
  const [active, setActive] = React.useState(clamp(defaultIndex, 0, last));
  const activeRef = React.useRef(active);
  const trackRef = React.useRef<HTMLUListElement | null>(null);
  const frames = React.useRef<(HTMLLIElement | null)[]>([]);
  const dialogRef = React.useRef<HTMLDialogElement | null>(null);
  const target = React.useRef<number | null>(null);
  const [printIndex, setPrintIndex] = React.useState(active);
  const [open, setOpen] = React.useState(false);

  React.useLayoutEffect(() => { activeRef.current = active; });

  const goTo = React.useCallback((i: number, behavior: ScrollBehavior = reduce ? 'auto' : 'smooth') => {
    const t = clamp(i, 0, last);
    const li = frames.current[t];
    const track = trackRef.current;
    if (!li || !track) return;
    const left = li.offsetLeft - (track.clientWidth - li.offsetWidth) / 2;
    target.current = t;
    if (Math.abs(track.scrollLeft - left) < 1) { setActive(t); target.current = null; return; }
    track.scrollTo({ left, behavior });
    window.setTimeout(() => { if (target.current === t) { setActive(t); target.current = null; } }, 1500);
  }, [last, reduce]);

  React.useLayoutEffect(() => { goTo(activeRef.current, 'auto'); }, [goTo]);

  React.useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let timer = 0;
    const settle = () => {
      window.clearTimeout(timer);
      const centre = track.scrollLeft + track.clientWidth / 2;
      let best = 0, dist = Infinity;
      frames.current.forEach((li, i) => {
        if (!li) return;
        const d = Math.abs(li.offsetLeft + li.offsetWidth / 2 - centre);
        if (d < dist) { dist = d; best = i; }
      });
      if (target.current !== null && best !== target.current) return;
      target.current = null;
      setActive(best);
    };
    const onScroll = () => { window.clearTimeout(timer); timer = window.setTimeout(settle, 140); };
    const takeOver = () => { target.current = null; };
    track.addEventListener('scroll', onScroll, { passive: true });
    track.addEventListener('scrollend', settle);
    track.addEventListener('pointerdown', takeOver, { passive: true });
    track.addEventListener('touchstart', takeOver, { passive: true });
    return () => {
      track.removeEventListener('scroll', onScroll);
      track.removeEventListener('scrollend', settle);
      track.removeEventListener('pointerdown', takeOver);
      track.removeEventListener('touchstart', takeOver);
      window.clearTimeout(timer);
    };
  }, []);

  React.useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const step = (delta: number) => {
    const t = clamp((target.current ?? activeRef.current) + delta, 0, last);
    goTo(t);
    return t;
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    let t: number | null = null;
    if (e.key === 'ArrowRight') t = step(1);
    else if (e.key === 'ArrowLeft') t = step(-1);
    else if (e.key === 'Home') t = step(-count);
    else if (e.key === 'End') t = step(count);
    if (t === null) return;
    e.preventDefault();
    frames.current[t]?.querySelector('button')?.focus({ preventScroll: true });
  };
  const openPrint = (i: number) => { setPrintIndex(i); setOpen(true); };
  const closePrint = () => {
    setOpen(false);
    goTo(printIndex, 'auto');
    frames.current[printIndex]?.querySelector('button')?.focus({ preventScroll: true });
  };

  const current = images[active];
  const print = images[printIndex];
  const transition = reduce ? 'none' : 'filter 480ms cubic-bezier(.22,1,.36,1), transform 480ms cubic-bezier(.22,1,.36,1)';

  return (
    <section aria-label={label} className={`fsg ${className ?? ''}`}>
      <ul
        ref={trackRef}
        role="list"
        onKeyDown={onKeyDown}
        className="fsg-track"
      >
        {images.map((im, i) => {
          const inGate = i === active;
          return (
            <li key={im.src} ref={(n) => { frames.current[i] = n; }} className="fsg-frame" data-active={inGate || undefined}>
              {im.label && <span className="fsg-label" aria-hidden="true">{im.label}</span>}
              <button
                type="button"
                aria-label={inGate ? `${im.alt}. Zväčšiť fotografiu` : `Zobraziť: ${im.alt}`}
                aria-current={inGate ? 'true' : undefined}
                onClick={() => (inGate ? openPrint(i) : goTo(i))}
                className="fsg-btn"
              >
                <img
                  src={im.src}
                  srcSet={im.srcSet}
                  sizes="(min-width: 768px) 30rem, 78vw"
                  alt=""
                  width={im.width}
                  height={im.height}
                  loading={Math.abs(i - active) <= 1 ? 'eager' : 'lazy'}
                  decoding="async"
                  draggable={false}
                  style={{
                    filter: inGate ? 'brightness(1) saturate(1)' : 'brightness(.78) saturate(.8)',
                    transform: inGate ? 'scale(1)' : 'scale(.96)',
                    transition,
                  }}
                />
              </button>
            </li>
          );
        })}
      </ul>

      <div className="fsg-bar">
        <p className="fsg-caption">
          <span>{current?.caption ?? current?.alt}</span>
          <span className="fsg-count">{active + 1} / {count}</span>
        </p>
        <div className="fsg-controls">
          <button type="button" aria-label="Predchádzajúca fotografia" disabled={active === 0} onClick={() => step(-1)} className="fsg-ctl"><Arrow dir="left" /></button>
          <button type="button" aria-label="Ďalšia fotografia" disabled={active === last} onClick={() => step(1)} className="fsg-ctl"><Arrow dir="right" /></button>
        </div>
      </div>
      <span className="sr-only" aria-live="polite">{current ? `${current.caption ?? current.alt}, ${active + 1} z ${count}` : ''}</span>

      <dialog
        ref={dialogRef}
        aria-label={print ? `${print.caption ?? print.alt}, ${printIndex + 1} z ${count}` : 'Fotografia'}
        onClose={closePrint}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight' && printIndex < last) setPrintIndex(printIndex + 1);
          if (e.key === 'ArrowLeft' && printIndex > 0) setPrintIndex(printIndex - 1);
        }}
        onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        className="fsg-dialog"
      >
        {print && (
          <div className="fsg-print">
            <img src={print.large} alt={print.alt} width={print.width} height={print.height} />
            <div className="fsg-bar">
              <p className="fsg-caption"><span>{print.caption ?? print.alt}</span><span className="fsg-count">{printIndex + 1} / {count}</span></p>
              <div className="fsg-controls">
                <button type="button" aria-label="Predchádzajúca fotografia" disabled={printIndex === 0} onClick={() => setPrintIndex(printIndex - 1)} className="fsg-ctl"><Arrow dir="left" /></button>
                <button type="button" aria-label="Ďalšia fotografia" disabled={printIndex === last} onClick={() => setPrintIndex(printIndex + 1)} className="fsg-ctl"><Arrow dir="right" /></button>
                <button type="button" aria-label="Zavrieť" onClick={() => setOpen(false)} className="fsg-ctl fsg-close">
                  <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
}
