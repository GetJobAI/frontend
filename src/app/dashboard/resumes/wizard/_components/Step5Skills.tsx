"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type z } from "zod";
import { step5Schema } from "~/lib/wizard-schemas";
import { useWizardAutoSave } from "~/hooks/useWizardAutoSave";
import { useWizard } from "./WizardContext";
import { SectionHeader, AddButton, RemoveButton } from "./WizardField";
import { WizardNavButtons } from "./WizardNavButtons";
import { Plus, Sparkles } from "lucide-react";
import { cn } from "~/lib/utils";
import { Field, FieldLabel, FieldError } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "~/components/ui/select";
import { Controller } from "react-hook-form";

type Step5Data = z.infer<typeof step5Schema>;

const CATEGORY_OPTIONS = [
  { value: "technical", label: "Technical" },
  { value: "domain", label: "Domain" },
  { value: "soft", label: "Soft" },
  { value: "certification", label: "Certification" },
] as const;

const LEVEL_OPTIONS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "expert", label: "Expert" },
] as const;

const LEVEL_COLORS: Record<string, string> = {
  beginner: "border-sky-500/30 bg-sky-500/10 text-sky-400",
  intermediate: "border-violet-500/30 bg-violet-500/10 text-violet-400",
  expert: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
};

export function Step5Skills() {
  const { sessionId, stepData, nextStep } = useWizard();
  const saved = stepData[5] as Partial<Step5Data> | undefined;

  const form = useForm<Step5Data>({
    resolver: zodResolver(step5Schema),
    defaultValues: saved ?? { skills: [] },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "skills",
  });

  useWizardAutoSave(sessionId, 5, form.watch);

  const addSkill = () =>
    append({ name: "", category: "technical", level: "intermediate" });

  const onSubmit = form.handleSubmit(() => nextStep());

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <SectionHeader
        title="Skills"
        description="Add at least 1 skill. Be specific — ATS systems scan for exact keywords."
      />

      <div className="flex items-start gap-2 rounded-lg border border-dashed border-violet-500/20 bg-violet-500/5 px-4 py-3">
        <Sparkles
          className="mt-0.5 size-4 shrink-0 text-violet-500/50"
          strokeWidth={1.7}
        />
        <p className="text-xs text-neutral-600">
          <span className="font-medium text-neutral-500">
            AI Skill Suggestions
          </span>{" "}
          — coming soon. This will suggest ATS-recognized skills based on your
          Work experience.
        </p>
      </div>

      {fields.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {fields.map((f, idx) => {
            const level = form.watch(`skills.${idx}.level`);
            return (
              <span
                key={f.id}
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
                  LEVEL_COLORS[level] ??
                    "border-white/10 bg-white/5 text-neutral-400",
                )}
              >
                {form.watch(`skills.${idx}.name`) || "…"}
              </span>
            );
          })}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {fields.map((field, idx) => (
          <div
            key={field.id}
            className="grid grid-cols-2 gap-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end sm:gap-2"
          >
            <div className="col-span-2 sm:col-span-1">
              <Field data-invalid={!!form.formState.errors.skills?.[idx]?.name}>
                <FieldLabel htmlFor={`skill-name-${idx}`}>
                  Skill <span className="ml-0.5 text-violet-400">*</span>
                </FieldLabel>
                <Input
                  id={`skill-name-${idx}`}
                  placeholder="TypeScript"
                  {...form.register(`skills.${idx}.name`)}
                  aria-invalid={!!form.formState.errors.skills?.[idx]?.name}
                />
                <FieldError>
                  {form.formState.errors.skills?.[idx]?.name?.message}
                </FieldError>
              </Field>
            </div>

            <div className="col-span-1 sm:col-auto">
              <Field>
                <FieldLabel htmlFor={`skill-cat-${idx}`}>Category</FieldLabel>
                <Controller
                  control={form.control}
                  name={`skills.${idx}.category`}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id={`skill-cat-${idx}`}>
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORY_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
            </div>

            <div className="col-span-1 sm:col-auto">
              <Field>
                <FieldLabel htmlFor={`skill-lvl-${idx}`}>Level</FieldLabel>
                <Controller
                  control={form.control}
                  name={`skills.${idx}.level`}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id={`skill-lvl-${idx}`}>
                        <SelectValue placeholder="Select Level" />
                      </SelectTrigger>
                      <SelectContent>
                        {LEVEL_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </Field>
            </div>

            <div className="col-span-2 sm:col-auto">
              <RemoveButton
                onClick={() => remove(idx)}
                className="h-[38px] w-full px-3 sm:w-auto"
              />
            </div>
          </div>
        ))}
      </div>

      <AddButton onClick={addSkill}>
        <Plus className="size-3.5" strokeWidth={2} />
        Add Skill
      </AddButton>

      {form.formState.errors.skills?.root && (
        <FieldError className="relative bottom-auto left-auto">
          {form.formState.errors.skills.root.message}
        </FieldError>
      )}

      <WizardNavButtons isSubmitting={form.formState.isSubmitting} />
    </form>
  );
}
