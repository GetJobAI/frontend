"use client";

import { useState, useTransition } from "react";
import { Check, X, RotateCcw, Sparkles, Loader2 } from "lucide-react";
import { diffWords } from "diff";
import { cn } from "~/lib/utils";

interface SuggestionCardProps {
  title?: string;
  original: string;
  rewritten: string;
  status: boolean | null; // true = accepted, false = declined, null = pending
  onAccept: () => void;
  onDecline: () => void;
  onReset: () => void;
  // Optional rewrite callbacks
  onRewrite?: (hint: string) => Promise<void>;
  isRewriting?: boolean;
}

export function SuggestionCard({
  title,
  original,
  rewritten,
  status,
  onAccept,
  onDecline,
  onReset,
  onRewrite,
  isRewriting = false,
}: SuggestionCardProps) {
  const [hint, setHint] = useState("");
  const [showRewriteInput, setShowRewriteInput] = useState(false);
  const [isPending, startTransition] = useTransition();

  const diffs = diffWords(original, rewritten);

  const handleRewriteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hint.trim() || !onRewrite) return;
    startTransition(async () => {
      await onRewrite(hint);
      setHint("");
      setShowRewriteInput(false);
    });
  };

  if (!original && !rewritten) {
    if (onRewrite && status === null) {
      return (
        <div className="py-1">
          {!showRewriteInput ? (
            <button
              type="button"
              onClick={() => setShowRewriteInput(true)}
              className="flex cursor-pointer items-center gap-1.5 text-xs text-violet-400 transition-colors hover:text-violet-300"
            >
              <Sparkles className="size-3" />
              Rewrite this section...
            </button>
          ) : (
            <form
              onSubmit={handleRewriteSubmit}
              className="mt-1 flex flex-col gap-2"
            >
              <input
                type="text"
                value={hint}
                onChange={(e) => setHint(e.target.value)}
                placeholder="E.g., Focus more on cloud operations, make it sound senior..."
                disabled={isPending || isRewriting}
                className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-white placeholder:text-neutral-600 focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 focus:outline-none"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRewriteInput(false)}
                  disabled={isPending || isRewriting}
                  className="cursor-pointer rounded px-2.5 py-1 text-xs text-neutral-500 transition-colors hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || isRewriting || !hint.trim()}
                  className="flex cursor-pointer items-center gap-1 rounded bg-violet-600 px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-violet-500 disabled:opacity-50"
                >
                  {(isPending || isRewriting) && (
                    <Loader2 className="size-3 animate-spin" />
                  )}
                  Rewrite
                </button>
              </div>
            </form>
          )}
        </div>
      );
    }
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-xl border p-4 backdrop-blur-md transition-all duration-200",
        status === true
          ? "border-emerald-500/30 bg-emerald-950/10"
          : status === false
            ? "border-neutral-800 bg-neutral-900/30 opacity-70"
            : "border-white/8 bg-white/4 hover:border-white/12",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {title && (
            <h4 className="mb-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase">
              {title}
            </h4>
          )}

          {/* Body Content */}
          <div className="text-sm text-neutral-200">
            {status === null ? (
              // Pending: Render visual diff
              <span className="leading-relaxed break-words whitespace-pre-wrap">
                {diffs.map((part, index) => {
                  if (part.added) {
                    return (
                      <ins
                        key={index}
                        className="mx-0.5 rounded bg-emerald-500/10 px-1 py-0.5 text-emerald-400 no-underline underline decoration-emerald-500/30"
                        style={{ textDecoration: "underline" }}
                      >
                        {part.value}
                      </ins>
                    );
                  }
                  if (part.removed) {
                    return (
                      <del
                        key={index}
                        className="mx-0.5 rounded bg-red-500/10 px-1 py-0.5 text-red-400 line-through decoration-red-500/30"
                      >
                        {part.value}
                      </del>
                    );
                  }
                  return <span key={index}>{part.value}</span>;
                })}
              </span>
            ) : status === true ? (
              // Accepted: Render only suggested text
              <span className="leading-relaxed text-emerald-300 transition-colors">
                {rewritten}
              </span>
            ) : (
              // Declined: Render original text (crossed out or greyed)
              <span className="leading-relaxed text-neutral-500 line-through transition-colors">
                {original}
              </span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        {(original || rewritten) && (
          <div className="ml-4 flex shrink-0 items-center gap-1.5">
            {status !== null ? (
              <button
                type="button"
                onClick={onReset}
                title="Reset suggestion status"
                className="flex size-8 cursor-pointer items-center justify-center rounded-lg border border-white/8 bg-neutral-900 text-neutral-400 transition-all hover:bg-neutral-800 hover:text-white"
              >
                <RotateCcw className="size-3.5" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onDecline}
                  title="Decline suggestion"
                  className="flex size-8 cursor-pointer items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 transition-all hover:bg-red-500/20 hover:text-red-300"
                >
                  <X className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={onAccept}
                  title="Accept suggestion"
                  className="flex size-8 cursor-pointer items-center justify-center rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 transition-all hover:bg-emerald-500/20 hover:text-emerald-300"
                >
                  <Check className="size-4" />
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Rewrite suggestion capability */}
      {onRewrite && status === null && (
        <div className="mt-3 border-t border-white/6 pt-3">
          {!showRewriteInput ? (
            <button
              type="button"
              onClick={() => setShowRewriteInput(true)}
              className="flex items-center gap-1.5 text-xs text-violet-400 transition-colors hover:text-violet-300"
            >
              <Sparkles className="size-3" />
              Rewrite this section...
            </button>
          ) : (
            <form
              onSubmit={handleRewriteSubmit}
              className="mt-1 flex flex-col gap-2"
            >
              <input
                type="text"
                value={hint}
                onChange={(e) => setHint(e.target.value)}
                placeholder="E.g., Focus more on cloud operations, make it sound senior..."
                disabled={isPending || isRewriting}
                className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-white placeholder:text-neutral-600 focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 focus:outline-none"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRewriteInput(false)}
                  disabled={isPending || isRewriting}
                  className="rounded px-2.5 py-1 text-xs text-neutral-500 transition-colors hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || isRewriting || !hint.trim()}
                  className="flex items-center gap-1 rounded bg-violet-600 px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-violet-500 disabled:opacity-50"
                >
                  {(isPending || isRewriting) && (
                    <Loader2 className="size-3 animate-spin" />
                  )}
                  Rewrite
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
