"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type z } from "zod";
import { step3Schema } from "~/app/dashboard/resumes/wizard/lib/wizard-schemas";
import {
  AddButton,
  RemoveButton,
  CardRow,
} from "~/app/dashboard/resumes/wizard/_components/WizardField";
import { Field, FieldLabel, FieldError } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Checkbox } from "~/components/ui/checkbox";
import { Controller } from "react-hook-form";
import { Plus, X } from "lucide-react";
import type { ResumeContent } from "../resume-content-types";

type FormData = z.infer<typeof step3Schema>;

interface ExperienceTabProps {
  content: ResumeContent;
  onSave: (patch: Partial<ResumeContent>) => void;
}

export function ExperienceTab({ content, onSave }: ExperienceTabProps) {
  const form = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    resolver: zodResolver(step3Schema) as any,
    defaultValues: { experience: content.experience ?? [] },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "experience",
  });

  const values = form.watch();
  useEffect(() => {
    if (!form.formState.isDirty) return;
    onSave({ experience: values.experience });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(values.experience)]);

  const addEntry = () =>
    append({
      company: "",
      title: "",
      dates: "",
      location: "",
      bullets: [],
      hide: false,
    });

  return (
    <div className="flex flex-col gap-4">
      {fields.length === 0 && (
        <div className="rounded-xl border border-white/6 bg-white/2 px-6 py-10 text-center">
          <p className="text-sm text-neutral-500">No experience added yet.</p>
        </div>
      )}

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
              />
              <FieldError>
                {form.formState.errors.experience?.[idx]?.title?.message}
              </FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor={`exp-company-${idx}`}>Company</FieldLabel>
              <Input
                id={`exp-company-${idx}`}
                placeholder="Acme Corp"
                {...form.register(`experience.${idx}.company`)}
              />
            </Field>

            <Field
              data-invalid={!!form.formState.errors.experience?.[idx]?.dates}
            >
              <FieldLabel htmlFor={`exp-dates-${idx}`}>
                Dates <span className="ml-0.5 text-violet-400">*</span>
              </FieldLabel>
              <Input
                id={`exp-dates-${idx}`}
                placeholder="03.2022 – present"
                {...form.register(`experience.${idx}.dates`)}
              />
              <FieldError>
                {form.formState.errors.experience?.[idx]?.dates?.message}
              </FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor={`exp-location-${idx}`}>Location</FieldLabel>
              <Input
                id={`exp-location-${idx}`}
                placeholder="Berlin, Germany"
                {...form.register(`experience.${idx}.location`)}
              />
            </Field>

            <BulletsField form={form} expIdx={idx} />

            <Controller
              control={form.control}
              name={`experience.${idx}.hide`}
              render={({ field: f }) => (
                <Field orientation="horizontal" className="sm:col-span-2">
                  <Checkbox
                    id={`exp-hide-${idx}`}
                    checked={f.value}
                    onCheckedChange={(v) => f.onChange(Boolean(v))}
                  />
                  <FieldLabel
                    htmlFor={`exp-hide-${idx}`}
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
        Add Position
      </AddButton>
    </div>
  );
}

function BulletsField({
  form,
  expIdx,
}: {
  form: ReturnType<typeof useForm<FormData>>;
  expIdx: number;
}) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `experience.${expIdx}.bullets` as never,
  });

  return (
    <div className="flex flex-col gap-2 sm:col-span-2">
      <FieldLabel>Achievement bullets</FieldLabel>
      {(fields as unknown as { id: string }[]).map((bField, bIdx) => (
        <div key={bField.id} className="flex items-center gap-2">
          <span className="size-1 shrink-0 rounded-full bg-violet-500/40" />
          <input
            className="flex-1 rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-sm text-white transition-all placeholder:text-neutral-600 focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 focus:outline-none"
            placeholder="Reduced API latency by 40% via Redis caching…"
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
