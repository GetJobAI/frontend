"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, AlertCircle, Download, ZoomIn, ZoomOut } from "lucide-react";
import { diffWords } from "diff";
import { cn } from "~/lib/utils";
import { PdfCanvasRenderer } from "~/components/PdfCanvasRenderer";
import type {
  ResumeContent,
  ExperienceEntry,
  EducationEntry,
  SkillGroup,
  Certification,
  Language,
  Project,
} from "~/app/dashboard/resumes/[resumeId]/_components/resume-content-types";
import type { Optimizations } from "~/server/api/generated/schemas";

export interface BulletSuggestion {
  id: string;
  original: string;
  rewritten: string;
  accepted?: boolean | null;
}

export interface WorkExperienceSuggestion {
  id: string;
  entry_id: string;
  company_name?: string;
  job_title?: string;
  reason?: string;
  rewrite_count: number;
  bullets: BulletSuggestion[];
}

export interface SummarySuggestion {
  original: string;
  rewritten: string;
}

export interface ResumeExperienceMapping {
  company_name?: string;
  job_title?: string;
  entry_id?: string;
}

export interface AiSuggestions {
  overall_score?: number;
  job_title?: string;
  summary?: SummarySuggestion | string;
  work_experiences?: WorkExperienceSuggestion[];
  resume_skills?: string[];
  resume_experiences?: ResumeExperienceMapping[];
}

interface TypstCompiler {
  setCompilerInitOptions(options: unknown): void | Promise<void>;
  pdf(options: { mainContent: string }): Promise<Uint8Array>;
}

interface TypstLivePreviewProps {
  resumeContent: ResumeContent;
  optimization: Optimizations | null;
  activeReviews: Record<string, boolean | null>;
}

// Word-level diff generator formatting to Typst macros
function generateTypstDiff(original: string, rewritten: string): string {
  if (!original) return `#diff-added[${rewritten}]`;
  if (!rewritten) return `#diff-deleted[${original}]`;

  const diff = diffWords(original, rewritten);
  return diff
    .map((part) => {
      // Escape brackets to prevent breaking Typst content blocks
      const val = part.value.replace(/\[/g, "\\[").replace(/\]/g, "\\]");
      if (part.added) {
        return `#diff-added[${val}]`;
      }
      if (part.removed) {
        return `#diff-deleted[${val}]`;
      }
      return val;
    })
    .join("");
}

// Local helper to serialize state into a clean Typst dictionary
function serializeResumeToTypst(
  content: ResumeContent,
  suggestions: AiSuggestions | null | undefined,
  activeReviews: Record<string, boolean | null>,
): string {
  const contact = content.contact ?? { name: "" };

  // Summary
  let summaryStr = "none";
  if (content.summary) {
    let summaryText = content.summary;
    const summarySuggestion = suggestions?.summary;
    const reviewStatus = activeReviews.summary;
    if (summarySuggestion) {
      const rewritten =
        typeof summarySuggestion === "object"
          ? summarySuggestion.rewritten
          : summarySuggestion;
      if (reviewStatus === true) {
        summaryText = rewritten;
      } else if (reviewStatus === null) {
        summaryText = generateTypstDiff(content.summary, rewritten);
      }
    }
    summaryStr = `[${summaryText}]`;
  }

  // Work Experience
  const experiences = (content.experience ?? []).map(
    (exp: ExperienceEntry & { entry_id?: string }) => {
      // Find the mapped entry_id for this experience in resume_experiences
      const mappedExp = suggestions?.resume_experiences?.find(
        (re) =>
          (re.company_name ?? "").trim().toLowerCase() ===
            (exp.company ?? "").trim().toLowerCase() &&
          (re.job_title ?? "").trim().toLowerCase() ===
            (exp.title ?? "").trim().toLowerCase(),
      );

      const targetEntryId = mappedExp?.entry_id ?? exp.entry_id;

      const expSug = suggestions?.work_experiences?.find(
        (we) => we.entry_id === targetEntryId,
      );

      const bullets = (exp.bullets ?? []).map(
        (bullet: string, index: number) => {
          const bulletSug = expSug?.bullets?.find(
            (b) =>
              b.original === bullet || index === expSug?.bullets?.indexOf(b),
          );

          let text = bullet;
          if (bulletSug) {
            const reviewStatus = activeReviews[bulletSug.id];
            if (reviewStatus === true) {
              text = bulletSug.rewritten;
            } else if (reviewStatus === null) {
              text = generateTypstDiff(bullet, bulletSug.rewritten);
            }
          }
          return `[${text}]`;
        },
      );

      return `(
      company: ${exp.company ? `"${exp.company.replace(/"/g, '\\"')}"` : "none"},
      title: ${exp.title ? `"${exp.title.replace(/"/g, '\\"')}"` : "none"},
      dates: "${exp.dates}",
      location: ${exp.location ? `"${exp.location.replace(/"/g, '\\"')}"` : "none"},
      bullets: (${bullets.length > 0 ? bullets.join(", ") + "," : ""}),
      hide: ${exp.hide ? "true" : "false"}
    )`;
    },
  );

  // Skills
  let skillsSerialized: string[] = [];
  const originalSkillsText = (content.skills?.[0]?.items ?? []).join(", ");
  const suggestedSkillsText = suggestions?.resume_skills?.join(", ") ?? "";

  if (suggestions?.resume_skills) {
    const reviewStatus = activeReviews.skills;
    if (reviewStatus === true) {
      skillsSerialized = [
        `(
        category: "Skills",
        items: (${suggestions.resume_skills.map((i: string) => `"${i.replace(/"/g, '\\"')}"`).join(", ") + ","})
      )`,
      ];
    } else if (reviewStatus === null) {
      const diffText = generateTypstDiff(
        originalSkillsText,
        suggestedSkillsText,
      );
      skillsSerialized = [
        `(
        category: "Skills",
        items: ([${diffText}],)
      )`,
      ];
    } else {
      skillsSerialized = (content.skills ?? []).map(
        (g: SkillGroup) => `(
        category: "${g.category.replace(/"/g, '\\"')}",
        items: (${g.items.map((i: string) => `"${i.replace(/"/g, '\\"')}"`).join(", ") + (g.items.length > 0 ? "," : "")})
      )`,
      );
    }
  } else {
    skillsSerialized = (content.skills ?? []).map(
      (g: SkillGroup) => `(
      category: "${g.category.replace(/"/g, '\\"')}",
      items: (${g.items.map((i: string) => `"${i.replace(/"/g, '\\"')}"`).join(", ") + (g.items.length > 0 ? "," : "")})
    )`,
    );
  }

  const education = (content.education ?? []).map(
    (edu: EducationEntry) => `(
    institution: "${edu.institution.replace(/"/g, '\\"')}",
    degree: "${edu.degree.replace(/"/g, '\\"')}",
    dates: "${edu.dates}",
    location: ${edu.location ? `"${edu.location.replace(/"/g, '\\"')}"` : "none"},
    grade: ${edu.grade ? `"${edu.grade}"` : "none"},
    hide: ${edu.hide ? "true" : "false"}
  )`,
  );

  const certifications = (content.certifications ?? []).map(
    (c: Certification) => `(
    name: "${c.name.replace(/"/g, '\\"')}",
    issuer: "${c.issuer.replace(/"/g, '\\"')}",
    date: "${c.date}"
  )`,
  );

  const languages = (content.languages ?? []).map(
    (l: Language) => `(
    name: "${l.name.replace(/"/g, '\\"')}",
    level: "${l.level}"
  )`,
  );

  const projects = (content.projects ?? []).map(
    (p: Project) => `(
    name: "${p.name.replace(/"/g, '\\"')}",
    description: [${p.description}],
    url: ${p.url ? `"${p.url}"` : "none"}
  )`,
  );

  return `(
    style: "${content.style ?? "professional"}",
    contact: (
      name: "${contact.name?.replace(/"/g, '\\"') ?? ""}",
      email: ${contact.email ? `"${contact.email}"` : "none"},
      phone: ${contact.phone ? `"${contact.phone}"` : "none"},
      location: ${contact.location ? `"${contact.location.replace(/"/g, '\\"')}"` : "none"},
      linkedin: ${contact.linkedin ? `"${contact.linkedin}"` : "none"},
      github: ${contact.github ? `"${contact.github}"` : "none"}
    ),
    summary: ${summaryStr},
    experience: (${experiences.length > 0 ? experiences.join(", ") + "," : ""}),
    education: (${education.length > 0 ? education.join(", ") + "," : ""}),
    skills: (${skillsSerialized.length > 0 ? skillsSerialized.join(", ") + "," : ""}),
    certifications: (${certifications.length > 0 ? certifications.join(", ") + "," : ""}),
    languages: (${languages.length > 0 ? languages.join(", ") + "," : ""}),
    projects: (${projects.length > 0 ? projects.join(", ") + "," : ""})
  )`;
}

export function TypstLivePreview({
  resumeContent,
  optimization,
  activeReviews,
}: TypstLivePreviewProps) {
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(100);
  const [isDownloading, setIsDownloading] = useState(false);

  const typstCompilerRef = useRef<TypstCompiler | null>(null);
  const templateStrRef = useRef<string | null>(null);
  const lastPdfBytesRef = useRef<Uint8Array | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize compiler & fetch template
  useEffect(() => {
    async function initTypst() {
      setIsCompiling(true);
      try {
        // Fetch baseline template.typ contents
        const tempRes = await fetch("/api/typst-templates");
        if (!tempRes.ok) throw new Error("Failed to load base templates");
        const tempData = (await tempRes.json()) as Record<string, string>;
        templateStrRef.current = tempData.template ?? "";

        // Lazy load the WASM compiler package
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
                "https://cdn.jsdelivr.net/gh/debabrata-pradhan/NewCM@v4.0.0/OTF/NewCM10-Regular.otf",
              ]),
            ],
          });
        } catch (initErr) {
          const errMsg =
            initErr instanceof Error ? initErr.message : String(initErr);
          if (!errMsg.includes("compiler has been initialized")) {
            throw initErr;
          }
        }
        typstCompilerRef.current = $typst as unknown as TypstCompiler;
      } catch (e) {
        console.error(e);
        setError(
          "Failed to initialize client compiler: " + (e as Error).message,
        );
      } finally {
        setIsCompiling(false);
      }
    }
    void initTypst();

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return () => {};
  }, []);

  // Compile dynamically when changes happen
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void compile();
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    resumeContent,
    activeReviews,
    typstCompilerRef.current,
    templateStrRef.current,
  ]);

  async function compile() {
    const $typst = typstCompilerRef.current;
    const baseTemplate = templateStrRef.current;
    if (!$typst || !baseTemplate) return;

    setIsCompiling(true);
    setError(null);

    try {
      const suggestions = optimization?.ai_suggestions as
        | AiSuggestions
        | null
        | undefined;
      const dictStr = serializeResumeToTypst(
        resumeContent,
        suggestions,
        activeReviews,
      );

      // Concatenate base template rules and call #resume(dict)
      const fullContent = `${baseTemplate}\n\n#resume(${dictStr})`;

      const pdfBytes = await $typst.pdf({
        mainContent: fullContent,
      });

      const bytes = new Uint8Array(pdfBytes as unknown as ArrayBuffer);
      lastPdfBytesRef.current = bytes;
      setPdfData(bytes);
    } catch (e) {
      console.error("Compilation error:", e);
      setError("PDF compilation failed");
    } finally {
      setIsCompiling(false);
    }
  }

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
      a.download = "optimized-resume.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-white/8 bg-neutral-900/60 px-5">
        <div className="flex items-center gap-2">
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
          {(isCompiling || (!pdfData && !error)) && (
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

      <div className="relative flex-1 overflow-auto bg-neutral-950/80">
        {!pdfData && !error && (
          <div className="flex min-h-full items-start justify-center p-4">
            <div
              style={{
                width: `${scale}%`,
                maxWidth: "none",
                transformOrigin: "top center",
              }}
              className="flex w-full justify-center"
            >
              <div className="flex aspect-[1/1.414] w-full animate-pulse flex-col gap-6 rounded bg-white p-12 shadow-2xl select-none">
                {/* Header: Centered sender name & contact info skeleton */}
                <div className="flex flex-col items-center gap-2.5">
                  <div className="h-6 w-1/3 rounded bg-neutral-200" />
                  <div className="h-3 w-1/2 rounded bg-neutral-100" />
                </div>

                {/* Summary Section */}
                <div className="mt-2 flex flex-col gap-2">
                  <div className="h-4 w-20 rounded bg-neutral-200" />
                  <div className="h-[1px] w-full bg-neutral-200/60" />
                  <div className="mt-2 flex flex-col gap-2.5">
                    <div className="h-3 w-full rounded bg-neutral-100" />
                    <div className="h-3 w-full rounded bg-neutral-100" />
                    <div className="h-3 w-5/6 rounded bg-neutral-100" />
                  </div>
                </div>

                {/* Experience Section */}
                <div className="mt-2 flex flex-col gap-2">
                  <div className="h-4 w-24 rounded bg-neutral-200" />
                  <div className="h-[1px] w-full bg-neutral-200/60" />

                  {/* Entry 1 */}
                  <div className="mt-2 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="h-3 w-1/3 rounded bg-neutral-200" />
                      <div className="h-3 w-20 rounded bg-neutral-100" />
                    </div>
                    <div className="h-3 w-1/4 rounded bg-neutral-100" />
                    <div className="mt-1 flex flex-col gap-2 px-4">
                      <div className="h-3 w-full rounded bg-neutral-100" />
                      <div className="h-3 w-11/12 rounded bg-neutral-100" />
                    </div>
                  </div>

                  {/* Entry 2 */}
                  <div className="mt-3 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="h-3 w-1/4 rounded bg-neutral-200" />
                      <div className="h-3 w-20 rounded bg-neutral-100" />
                    </div>
                    <div className="h-3 w-1/5 rounded bg-neutral-100" />
                    <div className="mt-1 flex flex-col gap-2 px-4">
                      <div className="h-3 w-11/12 rounded bg-neutral-100" />
                      <div className="h-3 w-5/6 rounded bg-neutral-100" />
                    </div>
                  </div>
                </div>

                {/* Education Section */}
                <div className="mt-2 flex flex-col gap-2">
                  <div className="h-4 w-20 rounded bg-neutral-200" />
                  <div className="h-[1px] w-full bg-neutral-200/60" />

                  {/* Entry 1 */}
                  <div className="mt-2 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="h-3 w-1/3 rounded bg-neutral-200" />
                      <div className="h-3 w-20 rounded bg-neutral-100" />
                    </div>
                    <div className="h-3 w-1/4 rounded bg-neutral-100" />
                  </div>
                </div>

                {/* Skills Section */}
                <div className="mt-2 flex flex-col gap-2">
                  <div className="h-4 w-16 rounded bg-neutral-200" />
                  <div className="h-[1px] w-full bg-neutral-200/60" />

                  <div className="mt-2 flex flex-col gap-2">
                    <div className="h-3 w-11/12 rounded bg-neutral-100" />
                    <div className="h-3 w-3/4 rounded bg-neutral-100" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {pdfData && (
          <div
            className={cn(
              "flex min-h-full items-start justify-center p-4 transition-opacity duration-200",
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
              <PdfCanvasRenderer
                pdfData={pdfData}
                className="w-full rounded bg-white shadow-2xl"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
