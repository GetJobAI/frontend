"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type z } from "zod";
import { step5Schema } from "~/lib/wizard-schemas";
import { useWizardAutoSave } from "~/hooks/useWizardAutoSave";
import { useWizard } from "./WizardContext";
import { SectionHeader, AddButton, RemoveButton, CardRow } from "./WizardField";
import { WizardNavButtons } from "./WizardNavButtons";
import { Plus, X } from "lucide-react";
import { Field, FieldLabel, FieldError } from "~/components/ui/field";
import { Input } from "~/components/ui/input";

type Step5Data = z.infer<typeof step5Schema>;

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

  const addSkillGroup = () => append({ category: "", items: [] });

  const onSubmit = form.handleSubmit(() => nextStep());

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <SectionHeader
        title="Skills"
        description="Group skills by category (for example: Languages, Infrastructure, Concepts)."
      />

      <div className="flex flex-col gap-3">
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
                <FieldLabel htmlFor={`skill-category-${idx}`}>
                  Category <span className="ml-0.5 text-violet-400">*</span>
                </FieldLabel>
                <Input
                  id={`skill-category-${idx}`}
                  placeholder="Languages"
                  {...form.register(`skills.${idx}.category`)}
                  aria-invalid={!!form.formState.errors.skills?.[idx]?.category}
                />
                <FieldError>
                  {form.formState.errors.skills?.[idx]?.category?.message}
                </FieldError>
              </Field>
              <SkillItemsField form={form} groupIdx={idx} />
            </div>
          </CardRow>
        ))}
      </div>

      <AddButton onClick={addSkillGroup}>
        <Plus className="size-3.5" strokeWidth={2} />
        Add Skill Group
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

function SkillItemsField({
  form,
  groupIdx,
}: {
  form: ReturnType<typeof useForm<Step5Data>>;
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
