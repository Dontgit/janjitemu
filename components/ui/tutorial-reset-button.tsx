"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { resetAllTutorials } from "@/components/ui/page-tutorial";

export function TutorialResetButton() {
  const [done, setDone] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        resetAllTutorials();
        setDone(true);
        window.setTimeout(() => setDone(false), 2200);
      }}
      className="inline-flex items-center gap-2 rounded-2xl border border-[var(--border)] px-4 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:border-teal-200 hover:bg-teal-50"
    >
      <RotateCcw className="h-4 w-4 text-[var(--primary)]" />
      {done ? "Panduan direset" : "Reset semua panduan"}
    </button>
  );
}
