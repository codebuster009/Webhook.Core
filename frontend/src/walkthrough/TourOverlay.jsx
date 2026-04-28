import { useCallback, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useWalkthrough } from './WalkthroughContext.jsx';

/* eslint-disable react-hooks/set-state-in-effect -- spotlight tooltip syncs tour step to measured DOM targets */

const SPOTLIGHT_PAD = 8;
const TOOLTIP_GAP = 14;
const TOOLTIP_W = 380;
const TOOLTIP_H_EST = 260;

function waitForTarget(selector, { timeoutMs = 5500 } = {}) {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve) => {
    let done = false;
    let iv = null;
    let obs = null;

    function finish(el) {
      if (done) return;
      done = true;
      try {
        obs?.disconnect();
      } catch {
        /* noop */
      }
      if (iv != null) clearInterval(iv);
      resolve(el);
    }

    function tryHit() {
      const el = document.querySelector(selector);
      if (el) finish(el);
      else if (Date.now() > deadline) finish(null);
    }

    iv = setInterval(tryHit, 120);
    obs = new MutationObserver(tryHit);
    obs.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'hidden', 'data-tour', 'aria-hidden'],
    });
    tryHit();
  });
}

function spotRect(el) {
  const r = el.getBoundingClientRect();
  return {
    top: r.top - SPOTLIGHT_PAD,
    left: r.left - SPOTLIGHT_PAD,
    width: r.width + SPOTLIGHT_PAD * 2,
    height: r.height + SPOTLIGHT_PAD * 2,
  };
}

function calcTooltipPos(sr, preferred, vw, vh) {
  const cx = sr.left + sr.width / 2;
  const cy = sr.top + sr.height / 2;
  const clampedW = Math.min(TOOLTIP_W, vw - 24);

  function tryPlace(p) {
    let top;
    let left;
    if (p === 'bottom') {
      top = sr.top + sr.height + TOOLTIP_GAP;
      left = cx - clampedW / 2;
    } else if (p === 'top') {
      top = sr.top - TOOLTIP_H_EST - TOOLTIP_GAP;
      left = cx - clampedW / 2;
    } else if (p === 'right') {
      top = cy - TOOLTIP_H_EST / 2;
      left = sr.left + sr.width + TOOLTIP_GAP;
    } else if (p === 'left') {
      top = cy - TOOLTIP_H_EST / 2;
      left = sr.left - clampedW - TOOLTIP_GAP;
    } else {
      return { top: vh / 2 - TOOLTIP_H_EST / 2, left: vw / 2 - clampedW / 2, p: 'center' };
    }
    left = Math.max(12, Math.min(left, vw - clampedW - 12));
    top = Math.max(12, top);
    return top + TOOLTIP_H_EST < vh - 12 ? { top, left, p } : null;
  }

  const r = tryPlace(preferred || 'bottom');
  if (r) return { ...r, width: clampedW };
  for (const fb of ['bottom', 'top', 'right', 'left']) {
    if (fb === preferred) continue;
    const fbR = tryPlace(fb);
    if (fbR) return { ...fbR, width: clampedW };
  }
  return { ...tryPlace('center'), width: clampedW };
}

function Dots({ total, current }) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          layout
          transition={{ duration: 0.2 }}
          className={`h-1.5 rounded-full transition-colors duration-200 ${
            i === current
              ? 'w-5 bg-gradient-to-r from-teal-600 to-accent'
              : i < current
                ? 'w-1.5 bg-teal-300'
                : 'w-1.5 bg-slate-200'
          }`}
        />
      ))}
      <span className="ml-1.5 text-[10px] font-semibold tabular-nums text-slate-400">
        {current + 1}/{total}
      </span>
    </div>
  );
}

export function TourOverlay() {
  const { activeTour, currentStep, totalSteps, steps, nextStep, prevStep, skipTour, closeTour } =
    useWalkthrough();

  const [spot, setSpot] = useState(null);
  const [tipPos, setTipPos] = useState(null);
  const [neverShow, setNeverShow] = useState(false);
  const [targetEl, setTargetEl] = useState(null);
  const [anchorPending, setAnchorPending] = useState(false);

  const roRef = useRef(null);
  const cancelRef = useRef(false);
  const measureGenRef = useRef(0);

  const step = steps[currentStep];

  const applyPosition = useCallback((el, placement) => {
    if (!el) {
      setSpot(null);
      const cw = Math.min(TOOLTIP_W, window.innerWidth - 24);
      setTipPos({
        top: window.innerHeight / 2 - TOOLTIP_H_EST / 2,
        left: window.innerWidth / 2 - cw / 2,
        p: 'center',
        width: cw,
      });
      return;
    }
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const sr = spotRect(el);
        setSpot(sr);
        setTipPos(calcTooltipPos(sr, placement || 'bottom', window.innerWidth, window.innerHeight));
      });
    });
  }, []);

  useEffect(() => {
    if (!step) {
      setSpot(null);
      setTipPos(null);
      setTargetEl(null);
      setAnchorPending(false);
      return;
    }
    cancelRef.current = false;
    roRef.current?.disconnect();
    setAnchorPending(false);
    const gen = ++measureGenRef.current;

    if (!step.target) {
      setTargetEl(null);
      applyPosition(null, step.placement);
      return;
    }

    setTargetEl(null);
    setSpot(null);
    setAnchorPending(true);
    applyPosition(null, step.placement);

    const selector = `[data-tour="${step.target}"]`;
    (async () => {
      const el = await waitForTarget(selector);
      if (cancelRef.current || gen !== measureGenRef.current) return;
      setAnchorPending(false);
      setTargetEl(el);
      if (!el) {
        applyPosition(null, step.placement);
        return;
      }
      applyPosition(el, step.placement);
      const ro = new ResizeObserver(() => applyPosition(el, step.placement));
      ro.observe(el);
      roRef.current = ro;
    })();

    return () => {
      cancelRef.current = true;
      roRef.current?.disconnect();
    };
  }, [activeTour, currentStep, step, applyPosition]);

  useEffect(() => {
    const onResize = () => {
      if (targetEl) applyPosition(targetEl, step?.placement);
      else if (step && !step.target) applyPosition(null, step?.placement);
      else if (step?.target && !targetEl) applyPosition(null, step?.placement);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [targetEl, step, applyPosition]);

  if (!activeTour || !step) return null;

  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;
  const bullets = Array.isArray(step.bullets) ? step.bullets : [];
  const showSoftHint = Boolean(step.target && !targetEl && !anchorPending);

  return ReactDOM.createPortal(
    <AnimatePresence>
      <div key="tour-root" className="fixed inset-0 z-[9990]" style={{ pointerEvents: 'auto' }}>
        <motion.div
          key="bd"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-slate-950/55 backdrop-blur-[2px]"
          onClick={() => closeTour('backdrop')}
        />

        <AnimatePresence mode="wait">
          {spot ? (
            <motion.div
              key={`sp-${currentStep}`}
              initial={{ opacity: 0, scale: 0.985 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-none absolute rounded-2xl"
              style={{
                top: spot.top,
                left: spot.left,
                width: spot.width,
                height: spot.height,
                boxShadow: '0 0 0 9999px rgba(15,23,42,0.55)',
                zIndex: 9991,
                outline: '2px solid rgba(20,184,166,0.95)',
                outlineOffset: '3px',
              }}
            >
              <motion.span
                className="absolute inset-0 rounded-2xl ring-2 ring-accent/40"
                animate={{ opacity: [0.45, 0.9, 0.45] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              />
            </motion.div>
          ) : null}
        </AnimatePresence>

        {tipPos ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={`tip-${currentStep}`}
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="absolute z-[9999] max-h-[min(72vh,520px)] overflow-hidden rounded-[22px] border border-white/30 bg-white/95 shadow-[0_24px_80px_rgba(15,23,42,0.22)] backdrop-blur-md"
              style={{ top: tipPos.top, left: tipPos.left, width: tipPos.width }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/[0.07] via-transparent to-primary/[0.06]" />

              <div className="relative h-1 bg-gradient-to-r from-primary via-accent to-teal-500" />

              <div className="relative flex items-start justify-between gap-2 px-4 pt-3.5 pb-1">
                <div className="min-w-0 flex-1">
                  <Dots total={totalSteps} current={currentStep} />
                  <h3 className="mt-2 text-[15px] font-bold leading-snug tracking-tight text-slate-900">
                    {step.title}
                  </h3>
                  {step.interactive ? (
                    <span className="mt-1 inline-flex items-center rounded-full bg-amber-100/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-900">
                      Try it on the page
                    </span>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => closeTour('x')}
                  aria-label="Close tour"
                  className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>

              <div className="relative max-h-[min(42vh,280px)] overflow-y-auto px-4 pb-3">
                <p className="text-[13px] leading-relaxed text-slate-600">{step.description}</p>
                {bullets.length > 0 ? (
                  <ul className="mt-3 space-y-2">
                    {bullets.map((b) => (
                      <li
                        key={b}
                        className="flex gap-2 text-[12px] leading-snug text-slate-700"
                      >
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {showSoftHint ? (
                  <p className="mt-3 text-[11px] leading-snug text-slate-500">
                    Highlight not available — scroll or resize the window; ensure you are on Overview with data
                    loaded.
                  </p>
                ) : null}
                {step.hint ? (
                  <div className="mt-3 flex items-start gap-2 rounded-xl bg-teal-50/90 px-3 py-2">
                    <span className="shrink-0 text-sm" aria-hidden>
                      💡
                    </span>
                    <p className="text-[11.5px] leading-snug text-teal-900">{step.hint}</p>
                  </div>
                ) : null}
              </div>

              <div className="relative flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/80 bg-slate-50/80 px-4 py-2.5">
                <label className="flex cursor-pointer select-none items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={neverShow}
                    onChange={(e) => setNeverShow(e.target.checked)}
                    className="h-3.5 w-3.5 cursor-pointer rounded accent-teal-600"
                  />
                  <span className="text-[11px] text-slate-500">Don&apos;t show again</span>
                </label>

                <div className="flex items-center gap-1">
                  {!isFirst ? (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="flex h-8 items-center rounded-full px-3 text-[12px] font-medium text-slate-500 transition hover:bg-white/80"
                    >
                      ← Back
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => skipTour(neverShow)}
                    className="flex h-8 items-center rounded-full px-3 text-[12px] text-slate-500 transition hover:text-slate-800"
                  >
                    Skip
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex h-8 items-center gap-1 rounded-full bg-gradient-to-r from-primary to-accent px-4 text-[12px] font-semibold text-white shadow-md transition hover:brightness-105 active:scale-[0.97]"
                  >
                    {isLast ? 'Done ✓' : 'Next →'}
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        ) : null}
      </div>
    </AnimatePresence>,
    document.body
  );
}
