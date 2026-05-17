"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type z } from "zod";
import { step3Schema } from "../lib/wizard-schemas";
import { useWizardAutoSave } from "../hooks/use-wizard-auto-save";
import { useWizard } from "./WizardContext";
import { SectionHeader, AddButton, RemoveButton, CardRow } from "./WizardField";
import { WizardNavButtons } from "./WizardNavButtons";
import { Sparkles, Plus, X } from "lucide-react";
import { Field, FieldLabel, FieldError } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Checkbox } from "~/components/ui/checkbox";
import { Controller } from "react-hook-form";

type Step3Data = z.infer<typeof step3Schema>;

export function Step3Experience() {
  const { sessionId, stepData, nextStep } = useWizard();
  const saved = stepData[3] as Partial<Step3Data> | undefined;

  const form = useForm<Step3Data>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    resolver: zodResolver(step3Schema) as any,
    defaultValues: saved ?? { experience: [] },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "experience",
  });

  const { saveNow } = useWizardAutoSave(sessionId, 3, form.watch);

  const addExperience = () =>
    append({
      company: "",
      title: "",
      dates: "",
      location: "",
      bullets: [],
      hide: false,
    });

  const onSubmit = form.handleSubmit(async (data) => {
    if (await saveNow(data, { immediate: true, advance: true })) {
      nextStep();
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <SectionHeader
        title="Work experience"
        description="List your positions in reverse chronological order. Add up to 10 bullet points per role."
      />

      {fields.length === 0 && (
        <div className="rounded-xl border border-white/6 bg-white/2 px-6 py-10 text-center">
          <p className="text-sm text-neutral-500">No experience added yet.</p>
          <p className="mt-1 text-xs text-neutral-700">
            Add your most recent role below to get started.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {fields.map((field, idx) => (
          <CardRow key={field.id}>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[10px] font-semibold tracking-widest text-neutral-600 uppercase">
                Position {idx + 1}
              </span>
              <RemoveButton onClick={() => remove(idx)} />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field
                data-invalid={!!form.formState.errors.experience?.[idx]?.title}
              >
                <FieldLabel htmlFor={`exp-title-${idx}`}>
                  Job title <span className="ml-0.5 text-violet-400">*</span>
                </FieldLabel>
                <Input
                  id={`exp-title-${idx}`}
                  placeholder="Senior Engineer"
                  {...form.register(`experience.${idx}.title`)}
                  aria-invalid={
                    !!form.formState.errors.experience?.[idx]?.title
                  }
                />
                <FieldError>
                  {form.formState.errors.experience?.[idx]?.title?.message}
                </FieldError>
              </Field>

              <Field
                data-invalid={
                  !!form.formState.errors.experience?.[idx]?.company
                }
              >
                <FieldLabel htmlFor={`exp-company-${idx}`}>
                  Company <span className="ml-0.5 text-violet-400">*</span>
                </FieldLabel>
                <Input
                  id={`exp-company-${idx}`}
                  placeholder="Acme Corp"
                  {...form.register(`experience.${idx}.company`)}
                  aria-invalid={
                    !!form.formState.errors.experience?.[idx]?.company
                  }
                />
                <FieldError>
                  {form.formState.errors.experience?.[idx]?.company?.message}
                </FieldError>
              </Field>

              <Field
                data-invalid={!!form.formState.errors.experience?.[idx]?.dates}
              >
                <FieldLabel htmlFor={`exp-dates-${idx}`}>
                  Dates <span className="ml-0.5 text-violet-400">*</span>
                </FieldLabel>
                <Input
                  id={`exp-dates-${idx}`}
                  placeholder="03.2022 - present"
                  {...form.register(`experience.${idx}.dates`)}
                  aria-invalid={
                    !!form.formState.errors.experience?.[idx]?.dates
                  }
                />
                <FieldError>
                  {form.formState.errors.experience?.[idx]?.dates?.message}
                </FieldError>
              </Field>

              <Field
                data-invalid={
                  !!form.formState.errors.experience?.[idx]?.location
                }
              >
                <FieldLabel htmlFor={`exp-location-${idx}`}>
                  Location
                </FieldLabel>
                <Input
                  id={`exp-location-${idx}`}
                  placeholder="Berlin, Germany"
                  {...form.register(`experience.${idx}.location`)}
                  aria-invalid={
                    !!form.formState.errors.experience?.[idx]?.location
                  }
                />
                <FieldError>
                  {form.formState.errors.experience?.[idx]?.location?.message}
                </FieldError>
              </Field>

              <BulletsField form={form} expIdx={idx} />
              <Controller
                control={form.control}
                name={`experience.${idx}.hide`}
                render={({ field }) => (
                  <Field orientation="horizontal" className="sm:col-span-2">
                    <Checkbox
                      id={`exp-hide-${idx}`}
                      checked={field.value}
                      onCheckedChange={(checked) =>
                        field.onChange(Boolean(checked))
                      }
                    />
                    <FieldLabel
                      htmlFor={`exp-hide-${idx}`}
                      className="cursor-pointer font-normal text-neutral-500"
                    >
                      Hide this entry from final resume
                    </FieldLabel>
                  </Field>
                )}
              />
            </div>
          </CardRow>
        ))}
      </div>

      <AddButton onClick={addExperience}>
        <Plus className="size-3.5" strokeWidth={2} />
        Add Position
      </AddButton>

      <div className="flex items-start gap-2 rounded-lg border border-dashed border-violet-500/20 bg-violet-500/5 px-4 py-3">
        <Sparkles
          className="mt-0.5 size-4 shrink-0 text-violet-500/50"
          strokeWidth={1.7}
        />
        <p className="text-xs text-neutral-600">
          <span className="font-medium text-neutral-500">AI XYZ Coach</span> —
          coming soon. This will rewrite each bullet using the X (result) Y
          (action) Z (context) framework.
        </p>
      </div>

      <WizardNavButtons isSubmitting={form.formState.isSubmitting} />
    </form>
  );
}

function BulletsField({
  form,
  expIdx,
}: {
  form: ReturnType<typeof useForm<Step3Data>>;
  expIdx: number;
}) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `experience.${expIdx}.bullets` as never,
  });

  return (
    <div className="flex flex-col gap-2 sm:col-span-2">
      <FieldLabel>Achievement Bullets</FieldLabel>
      {(fields as unknown as { id: string }[]).map((bField, bIdx) => (
        <div key={bField.id} className="flex items-center gap-2">
          <span className="size-1 shrink-0 rounded-full bg-violet-500/40" />
          <input
            className="flex-1 rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-sm text-white transition-all placeholder:text-neutral-600 focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 focus:outline-none"
            placeholder="Reduced API response time by 40% by introducing Redis caching…"
            {...form.register(`experience.${expIdx}.bullets.${bIdx}` as never)}
          />
          <button
            type="button"
            onClick={() => remove(bIdx)}
            className="cursor-pointer text-neutral-700 transition-colors hover:text-red-400"
          >
            <X className="size-3.5" strokeWidth={2} />
          </button>
        </div>
      ))}
      {fields.length < 10 && (
        <button
          type="button"
          onClick={() => append("")}
          className="flex cursor-pointer items-center gap-1.5 text-[11px] font-medium text-neutral-600 transition-colors hover:text-violet-400"
        >
          <Plus className="size-3" strokeWidth={2} />
          Add bullet
        </button>
      )}
    </div>
  );
}
