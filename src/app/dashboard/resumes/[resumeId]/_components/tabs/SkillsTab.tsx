"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type z } from "zod";
import { step5Schema } from "~/app/dashboard/resumes/wizard/lib/wizard-schemas";
import {
  AddButton,
  RemoveButton,
  CardRow,
} from "~/app/dashboard/resumes/wizard/_components/WizardField";
import { Field, FieldLabel, FieldError } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Plus, X } from "lucide-react";
import type { ResumeContent } from "../resume-content-types";

type FormData = z.infer<typeof step5Schema>;

interface SkillsTabProps {
  content: ResumeContent;
  onSave: (patch: Partial<ResumeContent>) => void;
}

export function SkillsTab({ content, onSave }: SkillsTabProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(step5Schema),
    defaultValues: { skills: content.skills ?? [] },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "skills",
  });

  const values = form.watch();
  useEffect(() => {
    if (!form.formState.isDirty) return;
    onSave({ skills: values.skills });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(values.skills)]);

  return (
    <div className="flex flex-col gap-4">
      {fields.length === 0 && (
        <div className="rounded-xl border border-white/6 bg-white/2 px-6 py-10 text-center">
          <p className="text-sm text-neutral-500">No skill groups added yet.</p>
        </div>
      )}

      {fields.map((field, idx) => (
        <CardRow key={field.id}>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[10px] font-semibold tracking-widest text-neutral-600 uppercase">
              Group {idx + 1}
            </span>
            <RemoveButton onClick={() => remove(idx)} />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field
              className="sm:col-span-2"
              data-invalid={!!form.formState.errors.skills?.[idx]?.category}
            >
              <FieldLabel htmlFor={`skill-cat-${idx}`}>
                Category <span className="ml-0.5 text-violet-400">*</span>
              </FieldLabel>
              <Input
                id={`skill-cat-${idx}`}
                placeholder="Technical"
                {...form.register(`skills.${idx}.category`)}
              />
              <FieldError>
                {form.formState.errors.skills?.[idx]?.category?.message}
              </FieldError>
            </Field>

            <SkillItemsField form={form} groupIdx={idx} />
          </div>
        </CardRow>
      ))}

      <AddButton onClick={() => append({ category: "", items: [] })}>
        <Plus className="size-3.5" strokeWidth={2} />
        Add Skill Group
      </AddButton>
    </div>
  );
}

function SkillItemsField({
  form,
  groupIdx,
}: {
  form: ReturnType<typeof useForm<FormData>>;
  groupIdx: number;
}) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `skills.${groupIdx}.items` as never,
  });

  return (
    <div className="flex flex-col gap-2 sm:col-span-2">
      <FieldLabel>Items</FieldLabel>
      {(fields as unknown as { id: string }[]).map((item, itemIdx) => (
        <div key={item.id} className="flex items-center gap-2">
          <span className="size-1.5 shrink-0 rounded-full bg-violet-500/40" />
          <input
            className="flex-1 rounded-lg border border-white/8 bg-white/4 px-3 py-2 text-sm text-white transition-all placeholder:text-neutral-600 focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 focus:outline-none"
            placeholder="TypeScript"
            {...form.register(`skills.${groupIdx}.items.${itemIdx}` as never)}
          />
          <button
            type="button"
            onClick={() => remove(itemIdx)}
            className="cursor-pointer text-neutral-700 transition-colors hover:text-red-400"
          >
            <X className="size-3.5" strokeWidth={2} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => append("")}
        className="flex cursor-pointer items-center gap-1.5 text-[11px] font-medium text-neutral-600 transition-colors hover:text-violet-400"
      >
        <Plus className="size-3" strokeWidth={2} />
        Add item
      </button>
      <FieldError>
        {form.formState.errors.skills?.[groupIdx]?.items?.message}
      </FieldError>
    </div>
  );
}
