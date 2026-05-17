"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type z } from "zod";
import { step7Schema } from "../lib/wizard-schemas";
import { useWizardAutoSave } from "../hooks/use-wizard-auto-save";
import { useWizard } from "./WizardContext";
import { SectionHeader, AddButton, RemoveButton } from "./WizardField";
import { WizardNavButtons } from "./WizardNavButtons";
import { Plus } from "lucide-react";
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

type Step7Data = z.infer<typeof step7Schema>;

const LEVEL_OPTIONS = [
  { value: "A1", label: "A1 — Beginner" },
  { value: "A2", label: "A2 — Elementary" },
  { value: "B1", label: "B1 — Intermediate" },
  { value: "B2", label: "B2 — Upper-Intermediate" },
  { value: "C1", label: "C1 — Advanced" },
  { value: "C2", label: "C2 — Proficiency" },
  { value: "Native", label: "Native" },
] as const;

export function Step7Languages() {
  const { sessionId, stepData, nextStep } = useWizard();
  const saved = stepData[7] as Partial<Step7Data> | undefined;

  const form = useForm<Step7Data>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    resolver: zodResolver(step7Schema) as any,
    defaultValues: saved ?? { languages: [] },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "languages",
  });

  const { saveNow } = useWizardAutoSave(sessionId, 7, form.watch);

  const addLanguage = () => append({ name: "", level: "B2" });

  const onSubmit = form.handleSubmit(async (data) => {
    if (await saveNow(data, { immediate: true, advance: true })) {
      nextStep();
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <SectionHeader
        title="Languages"
        description="Optional — list languages you speak using the CEFR framework."
      />

      <div className="rounded-lg border border-white/6 bg-white/2 px-4 py-2.5 text-xs text-neutral-600">
        This section is <span className="text-neutral-400">optional</span>. You
        can skip it and still finalize your resume.
      </div>

      {fields.length === 0 && (
        <div className="rounded-xl border border-white/6 bg-white/2 px-6 py-10 text-center">
          <p className="text-sm text-neutral-500">No languages added.</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {fields.map((field, idx) => (
          <div
            key={field.id}
            className="grid grid-cols-2 gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
          >
            <div className="col-span-2 sm:col-span-1">
              <Field
                data-invalid={!!form.formState.errors.languages?.[idx]?.name}
              >
                <FieldLabel htmlFor={`lang-name-${idx}`}>
                  Language <span className="ml-0.5 text-violet-400">*</span>
                </FieldLabel>
                <Input
                  id={`lang-name-${idx}`}
                  placeholder="English"
                  {...form.register(`languages.${idx}.name`)}
                  aria-invalid={!!form.formState.errors.languages?.[idx]?.name}
                />
                <FieldError>
                  {form.formState.errors.languages?.[idx]?.name?.message}
                </FieldError>
              </Field>
            </div>

            <div className="col-span-1 sm:col-span-1">
              <Field>
                <FieldLabel htmlFor={`lang-prof-${idx}`}>
                  Proficiency
                </FieldLabel>
                <Controller
                  control={form.control}
                  name={`languages.${idx}.level`}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id={`lang-prof-${idx}`}>
                        <SelectValue placeholder="Select Proficiency" />
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

            <div className="col-span-1 sm:col-auto">
              <RemoveButton
                onClick={() => remove(idx)}
                className="h-[38px] w-full px-3 sm:w-auto"
              />
            </div>
          </div>
        ))}
      </div>

      <AddButton onClick={addLanguage}>
        <Plus className="size-3.5" strokeWidth={2} />
        Add Language
      </AddButton>

      <WizardNavButtons isSubmitting={form.formState.isSubmitting} />
    </form>
  );
}
