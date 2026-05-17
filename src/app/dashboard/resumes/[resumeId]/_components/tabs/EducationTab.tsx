"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type z } from "zod";
import { step4Schema } from "~/app/dashboard/resumes/wizard/lib/wizard-schemas";
import {
  AddButton,
  RemoveButton,
  CardRow,
} from "~/app/dashboard/resumes/wizard/_components/WizardField";
import { Field, FieldLabel, FieldError } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Checkbox } from "~/components/ui/checkbox";
import { Controller } from "react-hook-form";
import { Plus } from "lucide-react";
import type { ResumeContent } from "../resume-content-types";

type FormData = z.infer<typeof step4Schema>;

interface EducationTabProps {
  content: ResumeContent;
  onSave: (patch: Partial<ResumeContent>) => void;
}

export function EducationTab({ content, onSave }: EducationTabProps) {
  const form = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    resolver: zodResolver(step4Schema) as any,
    defaultValues: { education: content.education ?? [] },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "education",
  });

  const values = form.watch();
  useEffect(() => {
    if (!form.formState.isDirty) return;
    onSave({ education: values.education });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(values.education)]);

  const addEntry = () =>
    append({
      institution: "",
      degree: "",
      dates: "",
      location: "",
      grade: "",
      hide: false,
    });

  return (
    <div className="flex flex-col gap-4">
      {fields.length === 0 && (
        <div className="rounded-xl border border-white/6 bg-white/2 px-6 py-10 text-center">
          <p className="text-sm text-neutral-500">No education added yet.</p>
        </div>
      )}

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
              <FieldLabel htmlFor={`edu-institution-${idx}`}>
                Institution <span className="ml-0.5 text-violet-400">*</span>
              </FieldLabel>
              <Input
                id={`edu-institution-${idx}`}
                placeholder="MIT"
                {...form.register(`education.${idx}.institution`)}
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
                placeholder="B.Sc. Computer Science"
                {...form.register(`education.${idx}.degree`)}
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
                placeholder="09.2018 – 06.2022"
                {...form.register(`education.${idx}.dates`)}
              />
              <FieldError>
                {form.formState.errors.education?.[idx]?.dates?.message}
              </FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor={`edu-location-${idx}`}>Location</FieldLabel>
              <Input
                id={`edu-location-${idx}`}
                placeholder="Cambridge, MA"
                {...form.register(`education.${idx}.location`)}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor={`edu-grade-${idx}`}>Grade</FieldLabel>
              <Input
                id={`edu-grade-${idx}`}
                placeholder="3.9 / 4.0"
                {...form.register(`education.${idx}.grade`)}
              />
            </Field>

            <Controller
              control={form.control}
              name={`education.${idx}.hide`}
              render={({ field: f }) => (
                <Field orientation="horizontal" className="sm:col-span-2">
                  <Checkbox
                    id={`edu-hide-${idx}`}
                    checked={f.value}
                    onCheckedChange={(v) => f.onChange(Boolean(v))}
                  />
                  <FieldLabel
                    htmlFor={`edu-hide-${idx}`}
                    className="cursor-pointer font-normal text-neutral-500"
                  >
                    Hide this entry from the resume
                  </FieldLabel>
                </Field>
              )}
            />
          </div>
        </CardRow>
      ))}

      <AddButton onClick={addEntry}>
        <Plus className="size-3.5" strokeWidth={2} />
        Add Education
      </AddButton>
    </div>
  );
}
