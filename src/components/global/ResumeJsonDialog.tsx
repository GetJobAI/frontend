"use client";

import { useMemo } from "react";
import { CopyIcon } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { WIZARD_SESSION_CONTENT_KEY } from "~/lib/resume-constants";

interface ResumeJsonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resumeContent: unknown;
}

const INTERNAL_RESUME_KEYS = new Set([WIZARD_SESSION_CONTENT_KEY]);

function stripInternalResumeFields(value: unknown): unknown {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return value;
  }
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).filter(
      ([k]) => !INTERNAL_RESUME_KEYS.has(k),
    ),
  );
}

export function ResumeJsonDialog({
  open,
  onOpenChange,
  resumeContent,
}: ResumeJsonDialogProps) {
  const prettyJson = useMemo(
    () =>
      JSON.stringify(stripInternalResumeFields(resumeContent ?? {}), null, 2),
    [resumeContent],
  );

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prettyJson);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Resume JSON</DialogTitle>
          <DialogDescription>
            Structured resume payload generated or imported in the app.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopy}
          >
            <CopyIcon data-icon="inline-start" />
            Copy JSON
          </Button>
        </div>

        <pre className="max-h-[56vh] overflow-auto rounded-lg border border-white/10 bg-black/30 p-4 text-xs leading-relaxed text-neutral-300">
          {prettyJson}
        </pre>
      </DialogContent>
    </Dialog>
  );
}
