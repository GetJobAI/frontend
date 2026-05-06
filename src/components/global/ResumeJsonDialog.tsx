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

interface ResumeJsonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resumeContent: unknown;
}

export function ResumeJsonDialog({
  open,
  onOpenChange,
  resumeContent,
}: ResumeJsonDialogProps) {
  const prettyJson = useMemo(
    () => JSON.stringify(resumeContent ?? {}, null, 2),
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
