"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWizard } from "./WizardContext";
import { WizardNavButtons } from "./WizardNavButtons";
import { SectionHeader } from "./WizardField";
import {
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Code,
  Award,
  Globe,
  FolderOpen,
  CheckCircle2,
  AlertCircle,
  CircleX,
  Info,
} from "lucide-react";
import { cn } from "~/lib/utils";
import {
  areRequiredStepsComplete,
  computeCompletenessScore,
  getStepStatus,
} from "../lib/completeness";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { finalizeWizardAction } from "~/server/actions/wizard/actions";
import { wizardKeys } from "../lib/wizard-query";

interface SectionSummary {
  step: number;
  label: string;
  icon: React.ReactNode;
  value: string;
  filled: boolean;
  required: boolean;
  reason: string | null;
}

export function Step9Review() {
  const { sessionId, stepData, goToStep, refreshSession } = useWizard();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setIsRefreshing(true);
    void (async () => {
      await refreshSession();
      if (mounted) {
        setIsRefreshing(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [refreshSession]);

  const score = computeCompletenessScore(stepData);
  const requiredStepsComplete = areRequiredStepsComplete(stepData);
  const canFinalize = score >= 60 && requiredStepsComplete;

  const s1 = (stepData[1] ?? {}) as Record<string, unknown>;
  const s2 = (stepData[2] ?? {}) as Record<string, unknown>;
  const s3 = (stepData[3] ?? {}) as Record<string, unknown>;
  const s4 = (stepData[4] ?? {}) as Record<string, unknown>;
  const s5 = (stepData[5] ?? {}) as Record<string, unknown>;
  const s6 = (stepData[6] ?? {}) as Record<string, unknown>;
  const s7 = (stepData[7] ?? {}) as Record<string, unknown>;
  const s8 = (stepData[8] ?? {}) as Record<string, unknown>;
  const contact = (s1.contact ?? {}) as Record<string, unknown>;

  const status1 = getStepStatus(1, stepData);
  const status2 = getStepStatus(2, stepData);
  const status3 = getStepStatus(3, stepData);
  const status4 = getStepStatus(4, stepData);
  const status5 = getStepStatus(5, stepData);
  const status6 = getStepStatus(6, stepData);
  const status7 = getStepStatus(7, stepData);
  const status8 = getStepStatus(8, stepData);

  const finalizeMutation = useMutation({
    mutationFn: (id: string) => finalizeWizardAction(id),
    onSuccess: (result, id) => {
      if (!result.ok) return;
      queryClient.removeQueries({ queryKey: wizardKeys.session(id) });
    },
  });

  const sections: SectionSummary[] = [
    {
      step: 1,
      label: "Personal info",
      icon: <User className="size-4" />,
      value:
        typeof contact.name === "string"
          ? `${contact.name} · ${typeof contact.email === "string" ? contact.email : ""}`
          : "Not filled",
      filled: status1.filled,
      required: status1.required,
      reason: status1.reason,
    },
    {
      step: 2,
      label: "Summary",
      icon: <FileText className="size-4" />,
      value:
        typeof s2.summary === "string" && s2.summary.length > 0
          ? `${s2.summary.slice(0, 80)}…`
          : "Not filled",
      filled: status2.filled,
      required: status2.required,
      reason: status2.reason,
    },
    {
      step: 3,
      label: "Experience",
      icon: <Briefcase className="size-4" />,
      value: Array.isArray(s3.experience)
        ? `${s3.experience.length} position(s)`
        : "Not filled",
      filled: status3.filled,
      required: status3.required,
      reason: status3.reason,
    },
    {
      step: 4,
      label: "Education",
      icon: <GraduationCap className="size-4" />,
      value: Array.isArray(s4.education)
        ? `${s4.education.length} entry(s)`
        : "Not filled",
      filled: status4.filled,
      required: status4.required,
      reason: status4.reason,
    },
    {
      step: 5,
      label: "Skills",
      icon: <Code className="size-4" />,
      value: Array.isArray(s5.skills)
        ? `${s5.skills.length} skill(s)`
        : "Not filled",
      filled: status5.filled,
      required: status5.required,
      reason: status5.reason,
    },
    {
      step: 6,
      label: "Certifications",
      icon: <Award className="size-4" />,
      value: Array.isArray(s6.certifications)
        ? `${s6.certifications.length} certification(s)`
        : "None",
      filled: status6.filled,
      required: status6.required,
      reason: status6.reason,
    },
    {
      step: 7,
      label: "Languages",
      icon: <Globe className="size-4" />,
      value: Array.isArray(s7.languages)
        ? `${s7.languages.length} language(s)`
        : "None",
      filled: status7.filled,
      required: status7.required,
      reason: status7.reason,
    },
    {
      step: 8,
      label: "Projects",
      icon: <FolderOpen className="size-4" />,
      value: Array.isArray(s8.projects)
        ? `${s8.projects.length} project(s)`
        : "None",
      filled: status8.filled,
      required: status8.required,
      reason: status8.reason,
    },
  ];

  const handleFinalize = async () => {
    if (!sessionId || !canFinalize || isRefreshing) return;
    setIsSubmitting(true);
    setError(null);

    try {
      await refreshSession();
      const result = await finalizeMutation.mutateAsync(sessionId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(`/dashboard/resumes/${result.resumeId}/choose-template`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      <SectionHeader
        title="Review your resume"
        description="Check everything looks correct, then finalize to create your resume."
      />

      {isRefreshing && (
        <p className="text-xs text-neutral-500">
          Refreshing your latest saved data...
        </p>
      )}

      <div className="rounded-xl border border-white/8 bg-white/2 p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-semibold text-neutral-400">
            Completeness Score
          </p>
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-[11px] font-bold tabular-nums",
              score >= 80
                ? "bg-emerald-500/15 text-emerald-400"
                : score >= 60
                  ? "bg-amber-500/15 text-amber-400"
                  : "bg-red-500/15 text-red-400",
            )}
          >
            {score}%
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/6">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700",
              score >= 80
                ? "bg-emerald-500"
                : score >= 60
                  ? "bg-amber-500"
                  : "bg-red-500",
            )}
            style={{ width: `${score}%` }}
          />
        </div>
        {!canFinalize && (
          <p className="mt-2 flex items-center gap-1.5 text-[11px] text-red-400">
            <AlertCircle className="size-3" />
            {requiredStepsComplete
              ? "You need at least 60% to finalize."
              : "Complete all required sections before finalizing."}
          </p>
        )}
      </div>

      <div className="flex w-full min-w-0 flex-col gap-2">
        {sections.map((sec) => (
          <div
            key={sec.step}
            className="flex w-full min-w-0 flex-col gap-3 rounded-lg border border-white/6 bg-white/2 px-4 py-3 sm:flex-row sm:items-center"
          >
            <div className="flex w-full min-w-0 flex-1 items-center gap-3">
              <span
                className={cn(
                  "shrink-0",
                  sec.filled
                    ? "text-violet-400"
                    : sec.required
                      ? "text-red-400/70"
                      : "text-neutral-700",
                )}
              >
                {sec.icon}
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-neutral-300">
                  {sec.label}
                  {sec.required && (
                    <span className="text-[9px] font-medium tracking-wider text-neutral-700 uppercase">
                      required
                    </span>
                  )}
                </p>
                <p className="truncate text-[11px] text-neutral-600">
                  {sec.value}
                </p>
              </div>
            </div>

            <div className="mt-1 flex shrink-0 items-center justify-between gap-3 border-t border-white/5 pt-3 sm:mt-0 sm:justify-end sm:border-0 sm:pt-0">
              <div className="flex items-center gap-2">
                {sec.filled ? (
                  <CheckCircle2
                    className="size-4 shrink-0 text-emerald-500/60"
                    strokeWidth={1.7}
                  />
                ) : (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        aria-label={`Why ${sec.label} is incomplete`}
                        className={cn(
                          "cursor-help rounded-full transition-opacity hover:opacity-80",
                          sec.required ? "text-red-500/60" : "text-neutral-500",
                        )}
                      >
                        {sec.required ? (
                          <AlertCircle
                            className="size-4 shrink-0"
                            strokeWidth={1.7}
                          />
                        ) : (
                          <CircleX
                            className="size-4 shrink-0"
                            strokeWidth={1.7}
                          />
                        )}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 text-xs">
                      <div className="flex items-start gap-2">
                        <Info className="mt-0.5 size-3.5 shrink-0 text-neutral-400" />
                        <p className="text-neutral-300">
                          {sec.reason ?? "This section is incomplete."}
                        </p>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
              <button
                type="button"
                onClick={() => goToStep(sec.step)}
                className="shrink-0 cursor-pointer rounded-md border border-white/8 px-3 py-1 text-[10px] font-medium text-neutral-500 transition-all hover:border-violet-500/30 hover:text-violet-400"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <p className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-400">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </p>
      )}

      <WizardNavButtons
        onNext={handleFinalize}
        isSubmitting={isSubmitting}
        isLastStep
        canNext={canFinalize && !isRefreshing}
      />
    </div>
  );
}
