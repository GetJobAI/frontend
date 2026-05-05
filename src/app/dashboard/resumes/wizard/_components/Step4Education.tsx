"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type z } from "zod";
import { step4Schema } from "~/lib/wizard-schemas";
import { useWizardAutoSave } from "~/hooks/useWizardAutoSave";
import { useWizard } from "./WizardContext";
import { SectionHeader, AddButton, RemoveButton, CardRow } from "./WizardField";
import { WizardNavButtons } from "./WizardNavButtons";
import { Plus } from "lucide-react";
import { Field, FieldLabel, FieldError } from "~/components/ui/field";
import { Input } from "~/components/ui/input";

type Step4Data = z.infer<typeof step4Schema>;

export function Step4Education() {
  const { sessionId, stepData, nextStep } = useWizard();
  const saved = stepData[4] as Partial<Step4Data> | undefined;

  const form = useForm<Step4Data>({
    resolver: zodResolver(step4Schema),
    defaultValues: saved ?? { education: [] },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "education",
  });

  useWizardAutoSave(sessionId, 4, form.watch);

  const addEducation = () =>
    append({
      institution: "",
      degree: "",
      field_of_study: "",
      start_date: "",
      end_date: "",
      gpa: null,
    });

  const onSubmit = form.handleSubmit(() => nextStep());

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
                data-invalid={
                  !!form.formState.errors.education?.[idx]?.field_of_study
                }
              >
                <FieldLabel htmlFor={`edu-field-${idx}`}>
                  Field of Study
                </FieldLabel>
                <Input
                  id={`edu-field-${idx}`}
                  placeholder="Computer Science"
                  {...form.register(`education.${idx}.field_of_study`)}
                  aria-invalid={
                    !!form.formState.errors.education?.[idx]?.field_of_study
                  }
                />
                <FieldError>
                  {
                    form.formState.errors.education?.[idx]?.field_of_study
                      ?.message
                  }
                </FieldError>
              </Field>

              <Field
                data-invalid={
                  !!form.formState.errors.education?.[idx]?.start_date
                }
              >
                <FieldLabel htmlFor={`edu-start-${idx}`}>Start Date</FieldLabel>
                <Input
                  id={`edu-start-${idx}`}
                  placeholder="2017-09"
                  {...form.register(`education.${idx}.start_date`)}
                  aria-invalid={
                    !!form.formState.errors.education?.[idx]?.start_date
                  }
                />
                <FieldError>
                  {form.formState.errors.education?.[idx]?.start_date?.message}
                </FieldError>
              </Field>

              <Field
                data-invalid={
                  !!form.formState.errors.education?.[idx]?.end_date
                }
              >
                <FieldLabel htmlFor={`edu-end-${idx}`}>End Date</FieldLabel>
                <Input
                  id={`edu-end-${idx}`}
                  placeholder="2021-05"
                  {...form.register(`education.${idx}.end_date`)}
                  aria-invalid={
                    !!form.formState.errors.education?.[idx]?.end_date
                  }
                />
                <FieldError>
                  {form.formState.errors.education?.[idx]?.end_date?.message}
                </FieldError>
              </Field>

              <Field
                data-invalid={!!form.formState.errors.education?.[idx]?.gpa}
              >
                <FieldLabel htmlFor={`edu-gpa-${idx}`}>GPA (0–4.0)</FieldLabel>
                <Input
                  id={`edu-gpa-${idx}`}
                  type="number"
                  min={0}
                  max={4}
                  step={0.01}
                  placeholder="3.8"
                  {...form.register(`education.${idx}.gpa`, {
                    setValueAs: (v: string) =>
                      v === "" ? null : parseFloat(v),
                  })}
                  aria-invalid={!!form.formState.errors.education?.[idx]?.gpa}
                />
                <FieldError>
                  {form.formState.errors.education?.[idx]?.gpa?.message}
                </FieldError>
              </Field>
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
