"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, ChevronLeft, ChevronRight, RotateCcw, X } from "lucide-react";

type TutorialStep = {
  title: string;
  description: string;
  tip?: string;
  targetSelector?: string;
  targetLabel?: string;
  spotlightPadding?: number;
};

type SpotlightRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

const STORAGE_PREFIX = "temujanji:tutorial:";
const STORAGE_VERSION = "v2";

const MOBILE_BREAKPOINT = 768;
const CARD_WIDTH = 320;
const CARD_MARGIN = 16;

const FALLBACK_CARD_POSITION = {
  left: CARD_MARGIN,
  right: CARD_MARGIN,
  bottom: CARD_MARGIN
} as const;

type StoredTutorialState = {
  version: string;
  dismissed: boolean;
  completed: boolean;
  lastStep: number;
};

function getStorageKey(pageKey: string) {
  return `${STORAGE_PREFIX}${pageKey}`;
}

function readStoredState(pageKey: string): StoredTutorialState | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(getStorageKey(pageKey));
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<StoredTutorialState>;
    return {
      version: typeof parsed.version === "string" ? parsed.version : STORAGE_VERSION,
      dismissed: Boolean(parsed.dismissed),
      completed: Boolean(parsed.completed),
      lastStep: typeof parsed.lastStep === "number" && parsed.lastStep >= 0 ? parsed.lastStep : 0
    };
  } catch {
    return null;
  }
}

function writeStoredState(pageKey: string, state: StoredTutorialState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(getStorageKey(pageKey), JSON.stringify(state));
}

export function resetAllTutorials() {
  if (typeof window === "undefined") {
    return;
  }

  const keysToRemove: string[] = [];
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (key?.startsWith(STORAGE_PREFIX)) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => window.localStorage.removeItem(key));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getSpotlightRect(selector?: string, padding = 18): SpotlightRect | null {
  if (typeof window === "undefined" || !selector) {
    return null;
  }

  const element = document.querySelector(selector);
  if (!element) {
    return null;
  }

  const rect = element.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) {
    return null;
  }

  const top = clamp(rect.top - padding, 8, window.innerHeight - 24);
  const left = clamp(rect.left - padding, 8, window.innerWidth - 24);
  const right = clamp(rect.right + padding, 24, window.innerWidth - 8);
  const bottom = clamp(rect.bottom + padding, 24, window.innerHeight - 8);

  return {
    top,
    left,
    width: Math.max(right - left, 120),
    height: Math.max(bottom - top, 72)
  };
}

function getDesktopCardPosition(spotlightRect: SpotlightRect | null) {
  if (typeof window === "undefined" || !spotlightRect) {
    return FALLBACK_CARD_POSITION;
  }

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const fitsRight = spotlightRect.left + spotlightRect.width + CARD_MARGIN + CARD_WIDTH <= viewportWidth - CARD_MARGIN;
  const fitsLeft = spotlightRect.left - CARD_MARGIN - CARD_WIDTH >= CARD_MARGIN;

  if (fitsRight) {
    return {
      top: clamp(spotlightRect.top, CARD_MARGIN, viewportHeight - 280),
      left: spotlightRect.left + spotlightRect.width + CARD_MARGIN
    };
  }

  if (fitsLeft) {
    return {
      top: clamp(spotlightRect.top, CARD_MARGIN, viewportHeight - 280),
      left: spotlightRect.left - CARD_WIDTH - CARD_MARGIN
    };
  }

  const topCandidate = spotlightRect.top + spotlightRect.height + CARD_MARGIN;
  if (topCandidate + 260 <= viewportHeight - CARD_MARGIN) {
    return {
      top: topCandidate,
      left: clamp(spotlightRect.left, CARD_MARGIN, viewportWidth - CARD_WIDTH - CARD_MARGIN)
    };
  }

  return {
    bottom: CARD_MARGIN,
    left: clamp(spotlightRect.left, CARD_MARGIN, viewportWidth - CARD_WIDTH - CARD_MARGIN)
  };
}

export function PageTutorial({
  pageKey,
  pageTitle,
  steps,
  className = "",
  positionClassName = "bottom-4 right-4"
}: {
  pageKey: string;
  pageTitle: string;
  steps: TutorialStep[];
  className?: string;
  positionClassName?: string;
}) {
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<SpotlightRect | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const totalSteps = steps.length;
  const currentStep = steps[stepIndex] ?? steps[0];
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === totalSteps - 1;

  useEffect(() => {
    const stored = readStoredState(pageKey);
    if (!stored || stored.version !== STORAGE_VERSION) {
      setOpen(true);
      setReady(true);
      return;
    }

    setStepIndex(Math.min(stored.lastStep, Math.max(totalSteps - 1, 0)));
    setOpen(!stored.dismissed && !stored.completed);
    setReady(true);
  }, [pageKey, totalSteps]);

  useEffect(() => {
    if (!ready) {
      return;
    }

    const previous = readStoredState(pageKey);
    writeStoredState(pageKey, {
      version: STORAGE_VERSION,
      dismissed: previous?.dismissed ?? false,
      completed: previous?.completed ?? false,
      lastStep: stepIndex
    });
  }, [pageKey, ready, stepIndex]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const syncMobileState = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    syncMobileState();
    window.addEventListener("resize", syncMobileState);

    return () => window.removeEventListener("resize", syncMobileState);
  }, []);

  useEffect(() => {
    if (!open || !currentStep) {
      setSpotlightRect(null);
      return;
    }

    let frame = 0;

    const updateSpotlight = () => {
      frame = window.requestAnimationFrame(() => {
        const nextRect = getSpotlightRect(currentStep.targetSelector, currentStep.spotlightPadding);
        setSpotlightRect(nextRect);
      });
    };

    const highlightedElement = currentStep.targetSelector
      ? document.querySelector(currentStep.targetSelector)
      : null;

    if (highlightedElement) {
      highlightedElement.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
    }

    updateSpotlight();
    window.addEventListener("resize", updateSpotlight);
    window.addEventListener("scroll", updateSpotlight, true);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", updateSpotlight);
      window.removeEventListener("scroll", updateSpotlight, true);
    };
  }, [currentStep, open]);

  const progressLabel = useMemo(() => `${stepIndex + 1}/${totalSteps}`, [stepIndex, totalSteps]);
  const cardStyle = useMemo(
    () => (isMobile ? undefined : getDesktopCardPosition(spotlightRect)),
    [isMobile, spotlightRect]
  );

  function closeTutorial(completed: boolean) {
    writeStoredState(pageKey, {
      version: STORAGE_VERSION,
      dismissed: !completed,
      completed,
      lastStep: stepIndex
    });
    setOpen(false);
  }

  function restartTutorial() {
    setStepIndex(0);
    writeStoredState(pageKey, {
      version: STORAGE_VERSION,
      dismissed: false,
      completed: false,
      lastStep: 0
    });
    setOpen(true);
  }

  if (!ready || !currentStep) {
    return null;
  }

  return (
    <>
      {open ? (
        <>
          <div className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-[1px]" aria-hidden="true" />

          {spotlightRect ? (
            <>
              <div
                className="pointer-events-none fixed z-[41] rounded-[28px] border border-white/70 bg-transparent shadow-[0_0_0_9999px_rgba(2,6,23,0.58),0_0_0_1px_rgba(255,255,255,0.12),0_30px_80px_rgba(15,23,42,0.35)] transition-all duration-300"
                style={{
                  top: spotlightRect.top,
                  left: spotlightRect.left,
                  width: spotlightRect.width,
                  height: spotlightRect.height
                }}
              />
              {currentStep.targetLabel ? (
                <div
                  className="pointer-events-none fixed z-[42] max-w-[220px] rounded-full border border-white/50 bg-slate-900/88 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white shadow-[0_10px_30px_rgba(15,23,42,0.26)]"
                  style={{
                    top: Math.max(10, spotlightRect.top - 18),
                    left: clamp(spotlightRect.left + 10, 10, (typeof window !== "undefined" ? window.innerWidth : 320) - 230)
                  }}
                >
                  Fokus: {currentStep.targetLabel}
                </div>
              ) : null}
            </>
          ) : null}

          <div
            className={`fixed z-[43] w-[calc(100vw-1.5rem)] max-w-[320px] ${isMobile ? positionClassName : ""} ${className}`}
            style={cardStyle}
          >
            <div className="overflow-hidden rounded-[24px] border border-white/70 bg-white/96 shadow-[0_28px_80px_rgba(15,23,42,0.28)] backdrop-blur-xl">
              <div className="border-b border-slate-100 bg-[linear-gradient(135deg,rgba(240,253,250,0.96),rgba(255,255,255,0.98))] px-4 py-3.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-teal-700">
                      <BookOpen className="h-3.5 w-3.5" />
                      Tour {pageTitle}
                    </div>
                    <p className="mt-2 text-base font-semibold leading-5 text-slate-900">{currentStep.title}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => closeTutorial(false)}
                    className="rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200"
                    aria-label="Tutup panduan"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 px-4 py-4 text-sm text-[var(--foreground)]">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Langkah {progressLabel}</p>
                  <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-teal-600 transition-all" style={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }} />
                  </div>
                </div>

                <p className="leading-6 text-[var(--foreground)]">{currentStep.description}</p>

                {currentStep.tip ? (
                  <div className="rounded-[18px] border border-amber-100 bg-amber-50/90 px-3.5 py-3 text-[13px] leading-5 text-amber-950">
                    <span className="font-semibold">Tips:</span> {currentStep.tip}
                  </div>
                ) : null}

                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={restartTutorial}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-[var(--primary)]"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Ulang
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setStepIndex((current) => Math.max(current - 1, 0))}
                      disabled={isFirstStep}
                      className="inline-flex items-center gap-1 rounded-2xl border border-[var(--border)] px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Prev
                    </button>
                    {isLastStep ? (
                      <button
                        type="button"
                        onClick={() => closeTutorial(true)}
                        className="rounded-2xl bg-teal-600 px-3.5 py-2 text-xs font-semibold text-white"
                      >
                        Selesai
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setStepIndex((current) => Math.min(current + 1, totalSteps - 1))}
                        className="inline-flex items-center gap-1 rounded-2xl bg-teal-600 px-3.5 py-2 text-xs font-semibold text-white"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={`fixed ${positionClassName} z-30 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/95 px-4 py-3 text-sm font-semibold text-[var(--primary)] shadow-[0_16px_35px_rgba(20,49,44,0.14)] backdrop-blur`}
        >
          <BookOpen className="h-4 w-4" />
          Panduan halaman
        </button>
      ) : null}
    </>
  );
}
