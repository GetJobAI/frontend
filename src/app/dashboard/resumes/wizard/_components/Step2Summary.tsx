"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type z } from "zod";
import {
  SUMMARY_MAX_LENGTH,
  SUMMARY_MIN_LENGTH,
  step2Schema,
} from "../lib/wizard-schemas";
import { useWizardAutoSave } from "../hooks/use-wizard-auto-save";
import { useWizardStepForm } from "../hooks/use-wizard-step-form";
import { useWizard } from "./WizardContext";
import { SectionHeader } from "./WizardField";
import { WizardNavButtons } from "./WizardNavButtons";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "~/components/ui/field";
import { Textarea } from "~/components/ui/textarea";
import { Sparkles } from "lucide-react";

type Step2Data = z.infer<typeof step2Schema>;

export function Step2Summary() {
  const { nextStep } = useWizard();
  const { form, sessionId } = useWizardStepForm<Step2Data>(
    2,
    { summary: "" },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
    zodResolver(step2Schema) as any,
  );

  const { saveNow } = useWizardAutoSave(sessionId, 2, form.watch);

  const summaryText = form.watch("summary") ?? "";
  const charCount = summaryText.length;

  const onSubmit = form.handleSubmit(async (data) => {
    if (await saveNow(data, { immediate: true, advance: true })) {
      nextStep();
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <SectionHeader
        title="Professional summary"
        description="Write a short professional summary that captures your experience and target role."
      />

      <div className="flex items-center gap-2 rounded-lg border border-dashed border-violet-500/20 bg-violet-500/5 px-4 py-3">
        <Sparkles
          className="size-4 shrink-0 text-violet-500/50"
          strokeWidth={1.7}
        />
        <p className="text-xs text-neutral-600">
          <span className="font-medium text-neutral-500">
            AI &quot;Write for me&quot;
          </span>{" "}
          — coming soon. This will draft a Professional summary based on your
          experience.
        </p>
      </div>

      <Field data-invalid={!!form.formState.errors.summary}>
        <div className="flex w-full items-center justify-between">
          <FieldLabel htmlFor="summary">Summary</FieldLabel>
          <span
            className={`text-[10px] tabular-nums ${charCount > SUMMARY_MAX_LENGTH - 200 ? "text-amber-400" : "text-neutral-700"}`}
          >
            {charCount}/{SUMMARY_MAX_LENGTH}
          </span>
        </div>
        <Textarea
          id="summary"
          placeholder="Results-driven software engineer with 5+ years building scalable web applications. Passionate about clean architecture and developer experience. Seeking to bring full-stack expertise to a product-focused team."
          rows={5}
          {...form.register("summary")}
          aria-invalid={!!form.formState.errors.summary}
        />
        <FieldDescription>
          Required. Use at least {SUMMARY_MIN_LENGTH} characters.
        </FieldDescription>
        <FieldError>{form.formState.errors.summary?.message}</FieldError>
      </Field>

      <WizardNavButtons isSubmitting={form.formState.isSubmitting} />
    </form>
  );
}
