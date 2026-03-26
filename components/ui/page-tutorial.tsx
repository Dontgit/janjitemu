"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, ChevronLeft, ChevronRight, RotateCcw, X } from "lucide-react";

type TutorialStep = {
  title: string;
  description: string;
  tip?: string;
};

const STORAGE_PREFIX = "temujanji:tutorial:";
const STORAGE_VERSION = "v1";

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

  const progressLabel = useMemo(() => `${stepIndex + 1}/${totalSteps}`, [stepIndex, totalSteps]);

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
        <div className={`fixed ${positionClassName} z-40 w-[calc(100vw-2rem)] max-w-md ${className}`}>
          <div className="overflow-hidden rounded-[28px] border border-teal-100 bg-white/95 shadow-[0_24px_55px_rgba(20,49,44,0.18)] backdrop-blur-xl">
            <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-5 py-4 text-white">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/90">
                    <BookOpen className="h-3.5 w-3.5" />
                    Panduan {pageTitle}
                  </div>
                  <p className="mt-3 text-lg font-semibold">{currentStep.title}</p>
                </div>
                <button
                  type="button"
                  onClick={() => closeTutorial(false)}
                  className="rounded-full bg-white/10 p-2 text-white/85 transition hover:bg-white/20"
                  aria-label="Tutup panduan"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-4 px-5 py-5 text-sm text-[var(--foreground)]">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Langkah {progressLabel}</p>
                <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-teal-600 transition-all" style={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }} />
                </div>
              </div>

              <p className="leading-6 text-[var(--foreground)]">{currentStep.description}</p>

              {currentStep.tip ? (
                <div className="rounded-[20px] border border-amber-100 bg-amber-50/90 px-4 py-3 text-sm text-amber-900">
                  <span className="font-semibold">Tips:</span> {currentStep.tip}
                </div>
              ) : null}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={restartTutorial}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)]"
                >
                  <RotateCcw className="h-4 w-4" />
                  Ulang dari awal
                </button>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStepIndex((current) => Math.max(current - 1, 0))}
                    disabled={isFirstStep}
                    className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border)] px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Sebelumnya
                  </button>
                  {isLastStep ? (
                    <button
                      type="button"
                      onClick={() => closeTutorial(true)}
                      className="rounded-2xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white"
                    >
                      Selesai
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setStepIndex((current) => Math.min(current + 1, totalSteps - 1))}
                      className="inline-flex items-center gap-2 rounded-2xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white"
                    >
                      Berikutnya
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
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
