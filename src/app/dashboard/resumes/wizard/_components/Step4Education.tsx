"use client";

import { useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type z } from "zod";
import { step4Schema } from "../lib/wizard-schemas";
import { useWizardAutoSave } from "../hooks/use-wizard-auto-save";
import { useWizardStepForm } from "../hooks/use-wizard-step-form";
import { useWizard } from "./WizardContext";
import { SectionHeader, AddButton, RemoveButton, CardRow } from "./WizardField";
import { WizardNavButtons } from "./WizardNavButtons";
import { Plus } from "lucide-react";
import { Field, FieldLabel, FieldError } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Controller } from "react-hook-form";
import { Checkbox } from "~/components/ui/checkbox";

type Step4Data = z.infer<typeof step4Schema>;

export function Step4Education() {
  const { nextStep } = useWizard();
  const { form, sessionId } = useWizardStepForm<Step4Data>(
    4,
    { education: [] },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    zodResolver(step4Schema) as any,
  );

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "education",
  });

  const { saveNow } = useWizardAutoSave(sessionId, 4, form.watch);

  const addEducation = () =>
    append({
      institution: "",
      degree: "",
      dates: "",
      location: "",
      grade: "",
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
        title="Education"
        description="List your degrees in reverse chronological order."
      />

      {fields.length === 0 && (
        <div className="rounded-xl border border-white/6 bg-white/2 px-6 py-10 text-center">
          <p className="text-sm text-neutral-500">No education added yet.</p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {fields.map((field, idx) => (
          <CardRow key={field.id}>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[10px] font-semibold tracking-widest text-neutral-600 uppercase">
                Entry {idx + 1}
              </span>
              <RemoveButton onClick={() => remove(idx)} />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field
                className="sm:col-span-2"
                data-invalid={
                  !!form.formState.errors.education?.[idx]?.institution
                }
              >
                <FieldLabel htmlFor={`edu-inst-${idx}`}>
                  Institution <span className="ml-0.5 text-violet-400">*</span>
                </FieldLabel>
                <Input
                  id={`edu-inst-${idx}`}
                  placeholder="Massachusetts Institute of Technology"
                  {...form.register(`education.${idx}.institution`)}
                  aria-invalid={
                    !!form.formState.errors.education?.[idx]?.institution
                  }
                />
                <FieldError>
                  {form.formState.errors.education?.[idx]?.institution?.message}
                </FieldError>
              </Field>

              <Field
                data-invalid={!!form.formState.errors.education?.[idx]?.degree}
              >
                <FieldLabel htmlFor={`edu-degree-${idx}`}>
                  Degree <span className="ml-0.5 text-violet-400">*</span>
                </FieldLabel>
                <Input
                  id={`edu-degree-${idx}`}
                  placeholder="Bachelor of Science"
                  {...form.register(`education.${idx}.degree`)}
                  aria-invalid={
                    !!form.formState.errors.education?.[idx]?.degree
                  }
                />
                <FieldError>
                  {form.formState.errors.education?.[idx]?.degree?.message}
                </FieldError>
              </Field>

              <Field
                data-invalid={!!form.formState.errors.education?.[idx]?.dates}
              >
                <FieldLabel htmlFor={`edu-dates-${idx}`}>
                  Dates <span className="ml-0.5 text-violet-400">*</span>
                </FieldLabel>
                <Input
                  id={`edu-dates-${idx}`}
                  placeholder="09.2016 - 06.2021"
                  {...form.register(`education.${idx}.dates`)}
                  aria-invalid={!!form.formState.errors.education?.[idx]?.dates}
                />
                <FieldError>
                  {form.formState.errors.education?.[idx]?.dates?.message}
                </FieldError>
              </Field>

              <Field
                data-invalid={
                  !!form.formState.errors.education?.[idx]?.location
                }
              >
                <FieldLabel htmlFor={`edu-location-${idx}`}>
                  Location
                </FieldLabel>
                <Input
                  id={`edu-location-${idx}`}
                  placeholder="Lviv, Ukraine"
                  {...form.register(`education.${idx}.location`)}
                  aria-invalid={
                    !!form.formState.errors.education?.[idx]?.location
                  }
                />
                <FieldError>
                  {form.formState.errors.education?.[idx]?.location?.message}
                </FieldError>
              </Field>

              <Field
                data-invalid={!!form.formState.errors.education?.[idx]?.grade}
              >
                <FieldLabel htmlFor={`edu-grade-${idx}`}>Grade</FieldLabel>
                <Input
                  id={`edu-grade-${idx}`}
                  placeholder="5.0 / 5.0"
                  {...form.register(`education.${idx}.grade`)}
                  aria-invalid={!!form.formState.errors.education?.[idx]?.grade}
                />
                <FieldError>
                  {form.formState.errors.education?.[idx]?.grade?.message}
                </FieldError>
              </Field>

              <Controller
                control={form.control}
                name={`education.${idx}.hide`}
                render={({ field }) => (
                  <Field orientation="horizontal" className="sm:col-span-2">
                    <Checkbox
                      id={`edu-hide-${idx}`}
                      checked={field.value}
                      onCheckedChange={(checked) =>
                        field.onChange(Boolean(checked))
                      }
                    />
                    <FieldLabel
                      htmlFor={`edu-hide-${idx}`}
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

      <AddButton onClick={addEducation}>
        <Plus className="size-3.5" strokeWidth={2} />
        Add Education
      </AddButton>

      <WizardNavButtons isSubmitting={form.formState.isSubmitting} />
    </form>
  );
}
