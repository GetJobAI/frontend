"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, FileUp, Loader2, Upload } from "lucide-react";

import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { parseUploadedResumeAction } from "~/server/actions/resume/parse-upload";

const ACCEPT = ".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

type UploadPhase = "idle" | "parsing" | "error";

export function UploadResumeClient() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<UploadPhase>("idle");
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isBusy = phase === "parsing" || isPending;

  const pickFile = useCallback((file: File | null) => {
    if (!file) return;
    setSelectedFile(file);
    setError(null);
    setNotice(null);
  }, []);

  const handleUpload = useCallback(() => {
    if (!selectedFile || isBusy) return;

    setError(null);
    setNotice(null);
    setPhase("parsing");

    const formData = new FormData();
    formData.append("file", selectedFile);

    startTransition(async () => {
      const result = await parseUploadedResumeAction(formData);

      if (!result.ok) {
        setPhase("error");
        setError(result.error);
        return;
      }

      if (result.partialParse || (result.warnings?.length ?? 0) > 0) {
        const warningText = result.warnings?.join(" ") ?? "Some sections may be incomplete.";
        setNotice(
          result.partialParse
            ? `Partial parse: ${warningText}`
            : warningText,
        );
      }

      router.push(`/dashboard/resumes/${result.resumeId}/choose-template`);
    });
  }, [isBusy, router, selectedFile]);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
      if (isBusy) return;
      const file = event.dataTransfer.files.item(0);
      pickFile(file);
    },
    [isBusy, pickFile],
  );

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-col gap-2">
        <p className="text-[11px] font-semibold tracking-[0.2em] text-violet-400 uppercase">
          Import resume
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Upload your resume
        </h1>
        <p className="text-sm text-neutral-500">
          Upload a PDF or DOCX file. We&apos;ll parse it automatically, then you
          can choose a template and preview the result.
        </p>
      </div>

      <div className="card-surface flex flex-col gap-5 p-6 sm:p-8">
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              if (!isBusy) inputRef.current?.click();
            }
          }}
          onDragEnter={(event) => {
            event.preventDefault();
            if (!isBusy) setIsDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            setIsDragging(false);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDrop={onDrop}
          onClick={() => {
            if (!isBusy) inputRef.current?.click();
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed px-6 py-12 text-center transition-colors",
            isDragging
              ? "border-violet-500/50 bg-violet-500/10"
              : "border-white/12 bg-white/2 hover:border-white/20 hover:bg-white/4",
            isBusy && "pointer-events-none opacity-70",
          )}
        >
          <span className="flex size-12 items-center justify-center rounded-2xl bg-violet-500/15 text-violet-400">
            {isBusy ? (
              <Loader2 className="size-5 animate-spin" strokeWidth={1.8} />
            ) : (
              <Upload className="size-5" strokeWidth={1.8} />
            )}
          </span>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-white">
              {isBusy
                ? "Parsing your resume…"
                : selectedFile
                  ? selectedFile.name
                  : "Drop your file here or click to browse"}
            </p>
            <p className="text-xs text-neutral-500">
              {isBusy
                ? "This may take up to a minute for complex documents."
                : "PDF or DOCX · max 10 MB"}
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            className="sr-only"
            disabled={isBusy}
            onChange={(event) => pickFile(event.target.files?.item(0) ?? null)}
          />
        </div>

        {error ? (
          <div className="flex items-center gap-2 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2.5 text-xs text-red-300">
            <AlertCircle className="size-4 shrink-0" />
            <p className="m-0">{error}</p>
          </div>
        ) : null}

        {notice ? (
          <div className="rounded-lg border border-amber-400/25 bg-amber-400/10 px-3 py-2.5 text-xs text-amber-200">
            {notice}
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="outline"
            asChild
            className="cursor-pointer border-white/10 bg-transparent text-neutral-300 hover:bg-white/5"
            disabled={isBusy}
          >
            <Link href="/dashboard">Back to dashboard</Link>
          </Button>

          <Button
            type="button"
            disabled={!selectedFile || isBusy}
            onClick={handleUpload}
            className="cursor-pointer gap-2 bg-violet-600 text-white hover:bg-violet-500"
          >
            {isBusy ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Parsing…
              </>
            ) : (
              <>
                <FileUp className="size-4" />
                Parse resume
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
