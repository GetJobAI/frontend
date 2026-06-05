"use client";

import { useEffect, useRef, useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import {
  ChevronLeft,
  Loader2,
  AlertCircle,
  Download,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Home,
  Sliders,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { PdfCanvasRenderer } from "~/components/PdfCanvasRenderer";
import type {
  ResumeContent,
  StyleValue,
} from "~/app/dashboard/resumes/[resumeId]/_components/resume-content-types";
import { TemplatesPopover } from "~/app/dashboard/resumes/[resumeId]/_components/TemplatesPopover";
import type {
  Optimizations,
  JobPostings,
} from "~/server/api/generated/schemas";
import {
  getCoverLetterAction,
  generateCoverLetterAction,
} from "~/server/actions/optimizer/actions";
import { toast } from "sonner";

interface TypstCompiler {
  setCompilerInitOptions(options: unknown): void | Promise<void>;
  pdf(options: { mainContent: string }): Promise<Uint8Array>;
}

interface CoverLetterPageClientProps {
  resumeId: string;
  initialResumeContent: ResumeContent;
  optimization: Optimizations;
  jobPosting: JobPostings | null;
}

function escapeTypstString(val: string): string {
  if (!val) return "";
  return val.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function serializeCoverLetterToTypst(
  resumeContent: ResumeContent,
  jobPosting: JobPostings | null,
  bodyText: string,
  salutation: string,
  style: string,
): string {
  const contact = resumeContent.contact ?? { name: "" };

  const rawJobContent =
    (jobPosting?.content as Record<string, unknown> | null) ?? {};
  const company =
    (rawJobContent.company as string) ||
    (rawJobContent.company_name as string) ||
    "Company Name";
  const title =
    (rawJobContent.title as string) ||
    (rawJobContent.job_title as string) ||
    "Job Title";

  const escapedBody = bodyText
    .replace(/\\/g, "\\\\")
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]");

  return `(
    style: "${style}",
    sender: (
      name: "${escapeTypstString(contact.name ?? "")}",
      email: ${contact.email ? `"${escapeTypstString(contact.email)}"` : "none"},
      phone: ${contact.phone ? `"${escapeTypstString(contact.phone)}"` : "none"},
      location: ${contact.location ? `"${escapeTypstString(contact.location)}"` : "none"},
    ),
    recipient: (
      company: "${escapeTypstString(company)}",
      title: "${escapeTypstString(title)}",
    ),
    date: "${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}",
    subject: "Application for ${escapeTypstString(title)}",
    salutation: "${escapeTypstString(salutation)}",
    body: [${escapedBody}]
  )`;
}

export function CoverLetterPageClient({
  resumeId,
  initialResumeContent,
  optimization,
  jobPosting,
}: CoverLetterPageClientProps) {
  const router = useRouter();

  // Customization Form States
  const [companyDescription, setCompanyDescription] = useState("");
  const [topAchievements, setTopAchievements] = useState("");
  const [customNote, setCustomNote] = useState("");
  const [showCustomizer, setShowCustomizer] = useState(false);

  // Core Editor States
  const [coverLetterText, setCoverLetterText] = useState("");
  const [salutationUsed, setSalutationUsed] = useState("Dear Hiring Manager,");
  const [wordCount, setWordCount] = useState(0);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [coverLetterStyle, setCoverLetterStyle] = useState<StyleValue>(
    initialResumeContent.style ?? "professional",
  );

  // Compilation & UI States
  const [isLoading, setIsLoading] = useState(true);
  const [isCompiling, setIsCompiling] = useState(false);
  const [isGenerating, startGeneration] = useTransition();
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);
  const [scale, setScale] = useState(100);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [compilerReady, setCompilerReady] = useState(false);

  const typstCompilerRef = useRef<TypstCompiler | null>(null);
  const templateStrRef = useRef<string | null>(null);
  const lastPdfBytesRef = useRef<Uint8Array | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialCompiledRef = useRef(false);

  // Target Job Information
  const rawJobContent =
    (jobPosting?.content as Record<string, unknown> | null) ?? {};
  const companyName =
    (rawJobContent.company as string) ||
    (rawJobContent.company_name as string) ||
    "Company Name";
  const jobTitle =
    (rawJobContent.title as string) ||
    (rawJobContent.job_title as string) ||
    "Job Title";

  // Compile helper
  const compilePdf = useCallback(
    async (bodyText: string, salutation: string, styleVal: StyleValue) => {
      const compiler = typstCompilerRef.current;
      const baseTemplate = templateStrRef.current;
      if (!compiler || !baseTemplate) return;

      setIsCompiling(true);
      setError(null);

      try {
        const dictStr = serializeCoverLetterToTypst(
          initialResumeContent,
          jobPosting,
          bodyText,
          salutation,
          styleVal,
        );

        const fullContent = `${baseTemplate}\n\n#cover-letter(${dictStr})`;

        const pdfBytes = await compiler.pdf({
          mainContent: fullContent,
        });

        const bytes = new Uint8Array(pdfBytes as unknown as ArrayBuffer);
        lastPdfBytesRef.current = bytes;
        setPdfData(bytes);
      } catch (e) {
        console.error("WASM compilation error:", e);
        setError("PDF compilation failed");
      } finally {
        setIsCompiling(false);
      }
    },
    [initialResumeContent, jobPosting],
  );

  // 1. Initial Load: Check if cover letter already exists in DB
  useEffect(() => {
    async function loadCoverLetter() {
      setIsLoading(true);
      try {
        const data = await getCoverLetterAction(optimization.id);
        if (data?.coverLetter) {
          setCoverLetterText(data.coverLetter);
          setSalutationUsed(data.salutationUsed ?? "Dear Hiring Manager,");
          setWordCount(data.wordCount ?? 0);
          setHasGenerated(true);
        }
      } catch (err) {
        console.error("Failed to load existing cover letter:", err);
      } finally {
        setIsLoading(false);
      }
    }
    void loadCoverLetter();
  }, [optimization.id]);

  // 2. Initialize Typst compiler & template fetch
  useEffect(() => {
    async function initTypst() {
      try {
        const tempRes = await fetch("/api/typst-templates?type=cover-letter");
        if (!tempRes.ok)
          throw new Error("Failed to load cover letter template");
        const tempData = (await tempRes.json()) as Record<string, string>;
        templateStrRef.current = tempData.template ?? "";

        const { $typst, preloadRemoteFonts } =
          await import("@myriaddreamin/typst.ts");
        try {
          $typst.setCompilerInitOptions({
            getModule: () =>
              "https://cdn.jsdelivr.net/npm/@myriaddreamin/typst-ts-web-compiler/pkg/typst_ts_web_compiler_bg.wasm",
            beforeBuild: [
              preloadRemoteFonts([
                "https://cdn.jsdelivr.net/gh/alerque/libertinus@v7.0.4/static/OTF/LibertinusSerif-Regular.otf",
                "https://cdn.jsdelivr.net/gh/alerque/libertinus@v7.0.4/static/OTF/LibertinusSerif-Bold.otf",
                "https://cdn.jsdelivr.net/gh/alerque/libertinus@v7.0.4/static/OTF/LibertinusSerif-Italic.otf",
                "https://cdn.jsdelivr.net/gh/JetBrains/JetBrainsMono@v2.304/fonts/ttf/JetBrainsMono-Regular.ttf",
              ]),
            ],
          });
        } catch {
          // Already initialized compiler
        }
        typstCompilerRef.current = $typst as unknown as TypstCompiler;
        setCompilerReady(true);
      } catch (e) {
        console.error("Typst setup error:", e);
        setError("Failed to initialize PDF renderer");
      }
    }
    void initTypst();
  }, []);

  // Compile instantly when compiler is ready and text is loaded (e.g. from DB)
  useEffect(() => {
    if (compilerReady && coverLetterText && !initialCompiledRef.current) {
      initialCompiledRef.current = true;
      void compilePdf(coverLetterText, salutationUsed, coverLetterStyle);
    }
  }, [
    compilerReady,
    coverLetterText,
    salutationUsed,
    coverLetterStyle,
    compilePdf,
  ]);

  // 3. Debounced auto-compiling as user edits textarea
  useEffect(() => {
    if (!hasGenerated || !coverLetterText || !compilerReady) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void compilePdf(coverLetterText, salutationUsed, coverLetterStyle);
    }, 500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [
    coverLetterText,
    salutationUsed,
    coverLetterStyle,
    hasGenerated,
    compilerReady,
    compilePdf,
  ]);

  const handleStyleChange = (style: StyleValue) => {
    setCoverLetterStyle(style);
    if (coverLetterText) {
      void compilePdf(coverLetterText, salutationUsed, style);
    }
  };

  // 4. Generate/Regenerate Cover Letter Actions
  const handleGenerate = (isNew: boolean) => {
    startGeneration(async () => {
      try {
        const payload = {
          companyDescription: companyDescription.trim() || null,
          topAchievements: topAchievements
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          customNote: customNote.trim() || null,
        };

        const res = await generateCoverLetterAction(optimization.id, payload);
        setCoverLetterText(res.coverLetter);
        setSalutationUsed(res.salutationUsed || "Dear Hiring Manager,");
        setWordCount(res.wordCount);
        setHasGenerated(true);
        setShowCustomizer(false);

        toast.success(
          isNew
            ? "AI Cover Letter generated successfully!"
            : "Cover Letter updated and regenerated!",
        );

        // Force compile instantly
        void compilePdf(
          res.coverLetter,
          res.salutationUsed || "Dear Hiring Manager,",
          coverLetterStyle,
        );
      } catch (err) {
        console.error("Cover letter generation failed:", err);
        toast.error("Failed to generate cover letter. Try again.");
      }
    });
  };

  const handleDownload = () => {
    const bytes = lastPdfBytesRef.current;
    if (!bytes) return;
    setIsDownloading(true);
    try {
      const blob = new Blob([bytes.buffer as ArrayBuffer], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cover-letter-${companyName.toLowerCase().replace(/\s+/g, "-")}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsDownloading(false);
    }
  };

  // Textarea word count updates
  const handleTextareaChange = (text: string) => {
    setCoverLetterText(text);
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    setWordCount(words);
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-neutral-950 text-white">
        <Loader2 className="size-8 animate-spin text-violet-500" />
        <span className="text-sm font-semibold text-neutral-400">
          Loading cover letter workspace...
        </span>
      </div>
    );
  }

  return (
    <div className="grid min-w-0 flex-1 grid-cols-1 overflow-y-auto md:h-full md:min-h-0 md:grid-cols-2 md:overflow-hidden">
      {/* LEFT COLUMN: EDITOR & INPUT PANEL */}
      <div className="flex h-auto w-full min-w-0 flex-col border-b border-white/8 bg-neutral-950 md:h-full md:min-h-0 md:border-r md:border-b-0">
        {/* Navigation & Header */}
        <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-white/6 bg-neutral-900/20 px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/dashboard/resumes/${resumeId}?tab=job-tailoring`,
                  )
                }
                title="Back to tailoring"
                className="flex size-8 cursor-pointer items-center justify-center rounded-lg border border-white/8 bg-white/4 text-neutral-400 transition-colors hover:bg-white/8 hover:text-white"
              >
                <ChevronLeft className="size-4" />
              </button>

              <Link
                href="/dashboard"
                title="Back to dashboard"
                className="flex size-8 cursor-pointer items-center justify-center rounded-lg border border-white/8 bg-white/4 text-neutral-400 transition-colors hover:bg-white/8 hover:text-white"
              >
                <Home className="size-4" strokeWidth={1.8} />
              </Link>

              <div
                className="flex size-8 items-center justify-center rounded-lg border border-white/8 bg-white/4 text-neutral-400"
                title="User Profile"
              >
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "size-5 ring-0 transition-all",
                      userButtonTrigger:
                        "bg-transparent hover:bg-transparent focus:shadow-none focus:outline-none focus:ring-0",
                    },
                  }}
                />
              </div>
            </div>

            <div className="h-5 w-px shrink-0 bg-white/10" />

            <div className="min-w-0">
              <h1 className="truncate text-sm font-semibold text-white">
                AI Cover Letter
              </h1>
              <p className="truncate text-[11px] text-neutral-500">
                {jobTitle} at {companyName}
              </p>
            </div>
          </div>

          {hasGenerated && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleGenerate(false)}
                disabled={isGenerating}
                className="flex cursor-pointer items-center gap-1 rounded-lg border border-white/8 bg-white/4 px-2.5 py-1.5 text-xs font-semibold text-neutral-400 transition-all hover:bg-white/8 hover:text-white disabled:opacity-50"
              >
                {isGenerating ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Sparkles className="size-3.5" />
                )}
                Regenerate
              </button>
              <button
                type="button"
                onClick={() => setShowCustomizer(!showCustomizer)}
                className={cn(
                  "flex cursor-pointer items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-all",
                  showCustomizer
                    ? "border-violet-500 bg-violet-600/10 text-violet-300"
                    : "border-white/8 bg-white/4 text-neutral-400 hover:bg-white/8 hover:text-white",
                )}
              >
                <Sliders className="size-3.5" />
                Adjust AI Prompt
              </button>
            </div>
          )}
        </header>

        {/* Content Area */}
        <div className="flex flex-1 flex-col overflow-y-auto">
          {/* Customizer Overlay / Drawer */}
          {showCustomizer && hasGenerated && (
            <div className="border-b border-white/8 bg-neutral-900/40 p-5">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold tracking-wider text-neutral-400 uppercase">
                    Refine Cover Letter Generator
                  </h3>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-neutral-400">
                      Company Profile / Focus (Optional)
                    </label>
                    <input
                      type="text"
                      value={companyDescription}
                      onChange={(e) => setCompanyDescription(e.target.value)}
                      placeholder="e.g. B2B SaaS startup, fast paced"
                      className="rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-xs text-white focus:border-violet-500/60 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-semibold text-neutral-400">
                      Highlight achievements (Optional, comma-separated)
                    </label>
                    <input
                      type="text"
                      value={topAchievements}
                      onChange={(e) => setTopAchievements(e.target.value)}
                      placeholder="e.g. Redesigned API, cut latency 40%"
                      className="rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-xs text-white focus:border-violet-500/60 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-semibold text-neutral-400">
                    Custom note or instructions for tone (Optional)
                  </label>
                  <textarea
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    placeholder="e.g. Emphasize scale engineering and keep it professional but warm"
                    className="h-20 resize-none rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-xs text-white focus:border-violet-500/60 focus:outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCustomizer(false)}
                    className="cursor-pointer rounded-lg border border-white/8 px-3.5 py-1.5 text-xs font-semibold text-neutral-400 hover:bg-white/5 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleGenerate(false)}
                    disabled={isGenerating}
                    className="flex cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-violet-500/30 bg-violet-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-violet-500 disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="size-3.5" />
                    )}
                    Regenerate Letter
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Core UI: Blank slate or Editor Textarea */}
          {!hasGenerated ? (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-violet-500/10 text-violet-400">
                <Sparkles className="size-6" />
              </div>
              <h2 className="mt-4 text-base font-bold text-white">
                Generate Cover Letter
              </h2>
              <p className="mx-auto mt-2 max-w-sm text-xs leading-normal text-neutral-500">
                AI will compose a personalized cover letter matching your
                resume&apos;s experience directly to the parsed job requirements
                for{" "}
                <span className="font-semibold text-neutral-300">
                  {jobTitle} at {companyName}
                </span>
                .
              </p>

              <div className="mt-6 w-full max-w-md rounded-xl border border-white/8 bg-neutral-900/20 p-5 text-left">
                <h3 className="mb-4 text-xs font-bold tracking-wider text-neutral-400 uppercase">
                  Refine Options (Optional)
                </h3>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-semibold text-neutral-500">
                      Company Focus
                    </span>
                    <input
                      type="text"
                      value={companyDescription}
                      onChange={(e) => setCompanyDescription(e.target.value)}
                      placeholder="e.g. Enterprise fintech startup"
                      className="rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-xs text-white focus:border-violet-500/60 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-semibold text-neutral-500">
                      Key achievements to point out
                    </span>
                    <input
                      type="text"
                      value={topAchievements}
                      onChange={(e) => setTopAchievements(e.target.value)}
                      placeholder="e.g. Led Kafka migration, optimized DB queries"
                      className="rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-xs text-white focus:border-violet-500/60 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-semibold text-neutral-500">
                      Special tone/notes
                    </span>
                    <textarea
                      value={customNote}
                      onChange={(e) => setCustomNote(e.target.value)}
                      placeholder="e.g. Keep it concise, highlight backend focus"
                      className="h-16 resize-none rounded-lg border border-white/8 bg-white/4 px-3 py-1.5 text-xs text-white focus:border-violet-500/60 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleGenerate(true)}
                disabled={isGenerating}
                className="mt-6 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-violet-500/30 bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-600/10 transition-all hover:bg-violet-500 disabled:opacity-60"
              >
                {isGenerating ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Sparkles className="size-4" />
                )}
                Generate Cover Letter with AI
              </button>
            </div>
          ) : (
            <div className="flex flex-1 flex-col gap-4 p-5">
              <div className="flex flex-1 flex-col gap-1">
                <div className="flex items-center justify-between text-[11px] font-medium text-neutral-500">
                  <span>Cover Letter Body Content</span>
                  <span>{wordCount} words</span>
                </div>
                <textarea
                  value={coverLetterText}
                  onChange={(e) => handleTextareaChange(e.target.value)}
                  placeholder="Your cover letter content..."
                  className="w-full flex-1 resize-none rounded-xl border border-white/6 bg-neutral-900/40 p-4 text-sm leading-relaxed text-neutral-200 transition-all focus:border-violet-500/40 focus:bg-neutral-900/60 focus:ring-1 focus:ring-violet-500/20 focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: LIVE PDF PREVIEW */}
      <div className="flex h-[70vh] w-full min-w-0 flex-col bg-neutral-950 md:h-full md:min-h-0">
        {/* Preview Actions bar */}
        <div className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-white/8 bg-neutral-900/60 px-5">
          <div className="flex items-center gap-2">
            <TemplatesPopover
              content={{ style: coverLetterStyle }}
              onStyleChange={handleStyleChange}
            />
            <button
              type="button"
              onClick={handleDownload}
              disabled={isDownloading || isCompiling || !pdfData}
              title="Download PDF"
              className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/10 bg-white/4 px-3 py-1.5 text-xs font-medium text-neutral-300 transition-all hover:border-violet-500/30 hover:bg-violet-500/8 hover:text-violet-300 disabled:opacity-50"
            >
              {isDownloading ? (
                <Loader2 className="size-3.5 animate-spin" strokeWidth={1.7} />
              ) : (
                <Download className="size-3.5" strokeWidth={1.7} />
              )}
              Download PDF
            </button>
            {(isCompiling || (!pdfData && hasGenerated)) && (
              <span className="flex items-center gap-1 text-[11px] text-neutral-600">
                <Loader2 className="size-3 animate-spin" />
                Compiling...
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
              onClick={() => setScale((s) => Math.min(s + 10, 200))}
              className="flex size-7 cursor-pointer items-center justify-center rounded border border-white/8 text-neutral-500 transition-colors hover:border-white/15 hover:text-neutral-300"
            >
              <ZoomIn className="size-3.5" strokeWidth={1.7} />
            </button>
          </div>
        </div>

        {/* PDF Renderer */}
        <div className="flex flex-1 items-start justify-center overflow-y-auto bg-neutral-900/20 p-6">
          {error ? (
            <div className="flex max-w-sm flex-col items-center justify-center gap-2 rounded-xl border border-red-500/10 bg-red-500/5 p-5 text-center text-red-400">
              <AlertCircle className="size-8" />
              <h4 className="text-sm font-semibold">Compilation Error</h4>
              <p className="text-xs leading-normal text-neutral-400">{error}</p>
            </div>
          ) : !pdfData ? (
            hasGenerated ? (
              <div
                style={{ width: `${scale}%` }}
                className="flex w-full max-w-[850px] justify-center transition-all duration-100"
              >
                <div className="flex aspect-[1/1.414] w-full animate-pulse flex-col gap-6 rounded bg-white p-12 shadow-2xl select-none">
                  {/* Header: Centered sender name & contact info skeleton */}
                  <div className="flex flex-col items-center gap-2.5">
                    <div className="h-6 w-1/3 rounded bg-neutral-200" />
                    <div className="h-3 w-1/2 rounded bg-neutral-100" />
                  </div>

                  {/* Divider */}
                  <div className="my-2 h-[1px] w-full bg-neutral-200/60" />

                  {/* Recipient & Date */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex w-1/3 flex-col gap-2">
                      <div className="h-3 w-1/4 rounded bg-neutral-200" />
                      <div className="h-3 w-3/4 rounded bg-neutral-100" />
                      <div className="h-3 w-1/2 rounded bg-neutral-100" />
                    </div>
                    <div className="h-3 w-1/4 rounded bg-neutral-100" />
                  </div>

                  {/* Subject */}
                  <div className="mt-2 flex flex-col gap-2">
                    <div className="h-3 w-1/2 rounded bg-neutral-200" />
                  </div>

                  {/* Body paragraphs */}
                  <div className="mt-4 flex flex-col gap-3">
                    <div className="h-3 w-full rounded bg-neutral-100" />
                    <div className="h-3 w-full rounded bg-neutral-100" />
                    <div className="h-3 w-full rounded bg-neutral-100" />
                    <div className="h-3 w-5/6 rounded bg-neutral-100" />
                  </div>

                  <div className="mt-4 flex flex-col gap-3">
                    <div className="h-3 w-full rounded bg-neutral-100" />
                    <div className="h-3 w-full rounded bg-neutral-100" />
                    <div className="h-3 w-4/5 rounded bg-neutral-100" />
                  </div>

                  <div className="mt-4 flex flex-col gap-3">
                    <div className="h-3 w-full rounded bg-neutral-100" />
                    <div className="h-3 w-5/6 rounded bg-neutral-100" />
                  </div>

                  {/* Sign-off */}
                  <div className="mt-8 flex flex-col gap-2">
                    <div className="h-3 w-1/6 rounded bg-neutral-100" />
                    <div className="mt-2 h-4 w-1/4 rounded bg-neutral-200" />
                  </div>
                </div>
              </div>
            ) : (
              <div
                style={{ width: `${scale}%` }}
                className="flex w-full max-w-[850px] justify-center transition-all duration-100"
              >
                <div className="flex aspect-[1/1.414] w-full flex-col gap-6 rounded bg-white p-12 shadow-2xl select-none">
                  {/* Header: Centered sender name & contact info skeleton */}
                  <div className="flex flex-col items-center gap-2.5">
                    <div className="h-6 w-1/3 rounded bg-neutral-300" />
                    <div className="h-3 w-1/2 rounded bg-neutral-200" />
                  </div>

                  {/* Divider */}
                  <div className="my-2 h-[1px] w-full bg-neutral-300/60" />

                  {/* Recipient & Date */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex w-1/3 flex-col gap-2">
                      <div className="h-3 w-1/4 rounded bg-neutral-300" />
                      <div className="h-3 w-3/4 rounded bg-neutral-200" />
                      <div className="h-3 w-1/2 rounded bg-neutral-200" />
                    </div>
                    <div className="h-3 w-1/4 rounded bg-neutral-200" />
                  </div>

                  {/* Subject */}
                  <div className="mt-2 flex flex-col gap-2">
                    <div className="h-3 w-1/2 rounded bg-neutral-300" />
                  </div>

                  {/* Body paragraphs */}
                  <div className="mt-4 flex flex-col gap-3">
                    <div className="h-3 w-full rounded bg-neutral-200" />
                    <div className="h-3 w-full rounded bg-neutral-200" />
                    <div className="h-3 w-full rounded bg-neutral-200" />
                    <div className="h-3 w-5/6 rounded bg-neutral-200" />
                  </div>

                  <div className="mt-4 flex flex-col gap-3">
                    <div className="h-3 w-full rounded bg-neutral-200" />
                    <div className="h-3 w-full rounded bg-neutral-200" />
                    <div className="h-3 w-4/5 rounded bg-neutral-200" />
                  </div>

                  <div className="mt-4 flex flex-col gap-3">
                    <div className="h-3 w-full rounded bg-neutral-200" />
                    <div className="h-3 w-5/6 rounded bg-neutral-200" />
                  </div>

                  {/* Sign-off */}
                  <div className="mt-8 flex flex-col gap-2">
                    <div className="h-3 w-1/6 rounded bg-neutral-200" />
                    <div className="mt-2 h-4 w-1/4 rounded bg-neutral-300" />
                  </div>
                </div>
              </div>
            )
          ) : (
            <div
              style={{ width: `${scale}%` }}
              className="flex w-full max-w-[850px] justify-center transition-all duration-100"
            >
              <PdfCanvasRenderer
                pdfData={pdfData}
                className="w-full rounded bg-white shadow-2xl"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
