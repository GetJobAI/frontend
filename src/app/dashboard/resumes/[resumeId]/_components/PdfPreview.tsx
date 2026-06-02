"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, AlertCircle, Download, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "~/lib/utils";
import type { ResumeContent } from "./resume-content-types";
import { buildPdfPayload } from "./resume-content-types";
import { TemplatesPopover } from "./TemplatesPopover";

interface PdfPreviewProps {
  content: ResumeContent;
  onStyleChange: (style: "professional" | "technical" | "minimal") => void;
  isTemplatesOpen?: boolean;
  onTemplatesOpenChange?: (open: boolean) => void;
}

export function PdfPreview({
  content,
  onStyleChange,
  isTemplatesOpen,
  onTemplatesOpenChange,
}: PdfPreviewProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(100);
  const [isDownloading, setIsDownloading] = useState(false);
  const prevUrlRef = useRef<string | null>(null);
  const lastBlobRef = useRef<Blob | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void compile();
    }, 800);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(content)]);

  async function compile() {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsCompiling(true);
    setError(null);

    try {
      const payload = buildPdfPayload(content);
      const res = await fetch("/api/pdf-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "PDF compilation failed");
        return;
      }

      const blob = await res.blob();
      lastBlobRef.current = blob;
      const url = URL.createObjectURL(blob);

      if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
      prevUrlRef.current = url;
      setBlobUrl(url);
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      setError("Failed to compile PDF");
    } finally {
      setIsCompiling(false);
    }
  }

  useEffect(() => {
    return () => {
      if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
      abortRef.current?.abort();
    };
  }, []);

  async function handleDownload() {
    setIsDownloading(true);
    try {
      let blob = lastBlobRef.current;
      if (!blob) {
        const payload = buildPdfPayload(content);
        const res = await fetch("/api/pdf-preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) return;
        blob = await res.blob();
        lastBlobRef.current = blob;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "resume.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-white/8 px-3 py-2">
        <div className="flex items-center gap-2">
          <TemplatesPopover
            content={content}
            onStyleChange={onStyleChange}
            open={isTemplatesOpen}
            onOpenChange={onTemplatesOpenChange}
          />
          <button
            type="button"
            onClick={() => void handleDownload()}
            disabled={isDownloading || isCompiling}
            title="Download PDF"
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/10 bg-white/4 px-3 py-1.5 text-xs font-medium text-neutral-300 transition-all hover:border-violet-500/30 hover:bg-violet-500/8 hover:text-violet-300 disabled:opacity-50"
          >
            {isDownloading ? (
              <Loader2 className="size-3.5 animate-spin" strokeWidth={1.7} />
            ) : (
              <Download className="size-3.5" strokeWidth={1.7} />
            )}
            Download
          </button>
          {isCompiling && (
            <span className="flex items-center gap-1 text-[11px] text-neutral-600">
              <Loader2 className="size-3 animate-spin" />
              Compiling…
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setScale((s) => Math.max(s - 10, 50))}
            className="flex size-7 cursor-pointer items-center justify-center rounded border border-white/8 text-neutral-500 transition-colors hover:border-white/15 hover:text-neutral-300"
          >
            <ZoomOut className="size-3.5" strokeWidth={1.7} />
          </button>
          <span className="w-10 text-center text-[11px] text-neutral-600 tabular-nums">
            {scale}%
          </span>
          <button
            type="button"
            onClick={() => setScale((s) => Math.min(s + 10, 150))}
            className="flex size-7 cursor-pointer items-center justify-center rounded border border-white/8 text-neutral-500 transition-colors hover:border-white/15 hover:text-neutral-300"
          >
            <ZoomIn className="size-3.5" strokeWidth={1.7} />
          </button>
        </div>
      </div>

      {error && (
        <div className="flex shrink-0 items-center gap-2 border-b border-red-500/20 bg-red-500/8 px-3 py-2">
          <AlertCircle className="size-3.5 shrink-0 text-red-400" />
          <p className="truncate text-[11px] text-red-300">{error}</p>
        </div>
      )}

      <div className="relative flex-1 overflow-auto bg-neutral-950/50">
        {!blobUrl && !error && !isCompiling && (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-neutral-700">
            <div className="size-8 animate-spin rounded-full border-2 border-violet-500/20 border-t-violet-500/60" />
            <p className="text-xs">Generating preview…</p>
          </div>
        )}

        {blobUrl && (
          <div
            className={cn(
              "flex min-h-full items-start justify-center p-4 transition-opacity",
              isCompiling && "opacity-60",
            )}
          >
            <div
              style={{
                width: `${scale}%`,
                maxWidth: "none",
                transformOrigin: "top center",
              }}
            >
              <iframe
                key={blobUrl}
                src={blobUrl}
                className="aspect-[1/1.414] w-full rounded shadow-2xl"
                title="Resume PDF preview"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
