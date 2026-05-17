"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type z } from "zod";
import { step7Schema } from "~/app/dashboard/resumes/wizard/lib/wizard-schemas";
import {
  AddButton,
  RemoveButton,
  CardRow,
} from "~/app/dashboard/resumes/wizard/_components/WizardField";
import { Field, FieldLabel, FieldError } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Plus } from "lucide-react";
import type { ResumeContent } from "../resume-content-types";

type FormData = z.infer<typeof step7Schema>;

interface LanguagesTabProps {
  content: ResumeContent;
  onSave: (patch: Partial<ResumeContent>) => void;
}

export function LanguagesTab({ content, onSave }: LanguagesTabProps) {
  const form = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    resolver: zodResolver(step7Schema) as any,
    defaultValues: { languages: content.languages ?? [] },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "languages",
  });

  const values = form.watch();
  useEffect(() => {
    if (!form.formState.isDirty) return;
    onSave({ languages: values.languages });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(values.languages)]);

  return (
    <div className="flex flex-col gap-4">
      {fields.length === 0 && (
        <div className="rounded-xl border border-white/6 bg-white/2 px-6 py-10 text-center">
          <p className="text-sm text-neutral-500">No languages added.</p>
        </div>
      )}

      {fields.map((field, idx) => (
        <CardRow key={field.id}>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[10px] font-semibold tracking-widest text-neutral-600 uppercase">
              Language {idx + 1}
            </span>
            <RemoveButton onClick={() => remove(idx)} />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
              />
              <FieldError>
                {form.formState.errors.languages?.[idx]?.name?.message}
              </FieldError>
            </Field>

            <Field
              data-invalid={!!form.formState.errors.languages?.[idx]?.level}
            >
              <FieldLabel htmlFor={`lang-level-${idx}`}>
                Level <span className="ml-0.5 text-violet-400">*</span>
              </FieldLabel>
              <Input
                id={`lang-level-${idx}`}
                placeholder="C1"
                {...form.register(`languages.${idx}.level`)}
              />
              <FieldError>
                {form.formState.errors.languages?.[idx]?.level?.message}
              </FieldError>
            </Field>
          </div>
        </CardRow>
      ))}

      <AddButton onClick={() => append({ name: "", level: "" })}>
        <Plus className="size-3.5" strokeWidth={2} />
        Add Language
      </AddButton>
    </div>
  );
}
