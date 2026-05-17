"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type z } from "zod";
import {
  step2Schema,
  SUMMARY_MAX_LENGTH,
  SUMMARY_MIN_LENGTH,
} from "~/app/dashboard/resumes/wizard/lib/wizard-schemas";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "~/components/ui/field";
import { Textarea } from "~/components/ui/textarea";
import type { ResumeContent } from "../resume-content-types";

type FormData = z.infer<typeof step2Schema>;

interface SummaryTabProps {
  content: ResumeContent;
  onSave: (patch: Partial<ResumeContent>) => void;
}

export function SummaryTab({ content, onSave }: SummaryTabProps) {
  const form = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    resolver: zodResolver(step2Schema) as any,
    defaultValues: { summary: content.summary ?? "" },
    mode: "onChange",
  });

  const summaryText = form.watch("summary") ?? "";
  const charCount = summaryText.length;

  useEffect(() => {
    if (!form.formState.isDirty) return;
    onSave({ summary: summaryText });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summaryText]);

  return (
    <div className="flex flex-col gap-4">
      <Field data-invalid={!!form.formState.errors.summary}>
        <div className="flex w-full items-center justify-between">
          <FieldLabel htmlFor="summary">Professional summary</FieldLabel>
          <span
            className={`text-[10px] tabular-nums ${charCount > SUMMARY_MAX_LENGTH - 200 ? "text-amber-400" : "text-neutral-700"}`}
          >
            {charCount}/{SUMMARY_MAX_LENGTH}
          </span>
        </div>
        <Textarea
          id="summary"
          placeholder="Results-driven software engineer with 5+ years building scalable web applications…"
          rows={7}
          {...form.register("summary")}
          aria-invalid={!!form.formState.errors.summary}
        />
        <FieldDescription>
          Use at least {SUMMARY_MIN_LENGTH} characters.
        </FieldDescription>
        <FieldError>{form.formState.errors.summary?.message}</FieldError>
      </Field>
    </div>
  );
}
