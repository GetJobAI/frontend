"use client";

import { useState } from "react";
import { Eraser } from "lucide-react";
import { cn } from "~/lib/utils";
import { ConfirmDialog } from "~/components/global/ConfirmDialog";
import { hasWizardSessionProgress } from "../lib/wizard-session";
import { useWizard } from "./WizardContext";

export function WizardClearSessionButton() {
  const { stepData, clearSession, isClearing } = useWizard();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const hasProgress = hasWizardSessionProgress(stepData);

  return (
    <>
      <button
        type="button"
        disabled={!hasProgress || isClearing}
        onClick={() => setConfirmOpen(true)}
        className={cn(
          "flex shrink-0 items-center gap-1.5 rounded-lg border border-white/8 bg-black px-3 py-1.5 text-xs font-medium text-neutral-400 transition-all",
          "cursor-pointer hover:border-red-500/30 hover:text-red-300",
          "disabled:pointer-events-none disabled:cursor-default disabled:opacity-40",
        )}
      >
        {isClearing ? (
          <span className="size-3 animate-spin rounded-full border-2 border-neutral-500/30 border-t-neutral-400" />
        ) : (
          <Eraser className="size-3.5" strokeWidth={2} />
        )}
        Clear all fields
      </button>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Clear wizard progress?"
        description="All saved contact info, experience, education, and other wizard fields will be removed. You will return to step 1."
        confirmLabel="Clear everything"
        onConfirm={async () => {
          await clearSession();
          setConfirmOpen(false);
        }}
      />
    </>
  );
}
