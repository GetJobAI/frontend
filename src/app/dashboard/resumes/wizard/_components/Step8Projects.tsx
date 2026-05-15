"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type z } from "zod";
import { step8Schema } from "../lib/wizard-schemas";
import { useWizardAutoSave } from "../hooks/use-wizard-auto-save";
import { useWizard } from "./WizardContext";
import { SectionHeader, AddButton, RemoveButton, CardRow } from "./WizardField";
import { WizardNavButtons } from "./WizardNavButtons";
import { Plus } from "lucide-react";
import { Field, FieldLabel, FieldError } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";

type Step8Data = z.infer<typeof step8Schema>;

export function Step8Projects() {
  const { sessionId, stepData, nextStep } = useWizard();
  const saved = stepData[8] as Partial<Step8Data> | undefined;

  const form = useForm<Step8Data>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    resolver: zodResolver(step8Schema) as any,
    defaultValues: saved ?? { projects: [] },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "projects",
  });

  useWizardAutoSave(sessionId, 8, form.watch);

  const addProject = () =>
    append({
      name: "",
      description: "",
      url: "",
    });

  const onSubmit = form.handleSubmit(() => nextStep());

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <SectionHeader
        title="Projects"
        description="Optional — showcase side projects, open source work, or freelance builds."
      />

      <div className="rounded-lg border border-white/6 bg-white/2 px-4 py-2.5 text-xs text-neutral-600">
        This section is <span className="text-neutral-400">optional</span> and
        has no impact on your completeness score.
      </div>

      {fields.length === 0 && (
        <div className="rounded-xl border border-white/6 bg-white/2 px-6 py-10 text-center">
          <p className="text-sm text-neutral-500">No projects added.</p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {fields.map((field, idx) => (
          <CardRow key={field.id}>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[10px] font-semibold tracking-widest text-neutral-600 uppercase">
                Project {idx + 1}
              </span>
              <RemoveButton onClick={() => remove(idx)} />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field
                data-invalid={!!form.formState.errors.projects?.[idx]?.name}
              >
                <FieldLabel htmlFor={`proj-name-${idx}`}>
                  Project Name <span className="ml-0.5 text-violet-400">*</span>
                </FieldLabel>
                <Input
                  id={`proj-name-${idx}`}
                  placeholder="ResumeAI Pro"
                  {...form.register(`projects.${idx}.name`)}
                  aria-invalid={!!form.formState.errors.projects?.[idx]?.name}
                />
                <FieldError>
                  {form.formState.errors.projects?.[idx]?.name?.message}
                </FieldError>
              </Field>

              <Field
                className="sm:col-span-2"
                data-invalid={
                  !!form.formState.errors.projects?.[idx]?.description
                }
              >
                <FieldLabel htmlFor={`proj-desc-${idx}`}>
                  Description <span className="ml-0.5 text-violet-400">*</span>
                </FieldLabel>
                <Textarea
                  id={`proj-desc-${idx}`}
                  placeholder="A brief description of what the project does and your role in it."
                  rows={3}
                  {...form.register(`projects.${idx}.description`)}
                  aria-invalid={
                    !!form.formState.errors.projects?.[idx]?.description
                  }
                />
                <FieldError>
                  {form.formState.errors.projects?.[idx]?.description?.message}
                </FieldError>
              </Field>

              <Field
                className="sm:col-span-2"
                data-invalid={!!form.formState.errors.projects?.[idx]?.url}
              >
                <FieldLabel htmlFor={`proj-url-${idx}`}>Project URL</FieldLabel>
                <Input
                  id={`proj-url-${idx}`}
                  placeholder="github.com/you/project"
                  {...form.register(`projects.${idx}.url`)}
                  aria-invalid={!!form.formState.errors.projects?.[idx]?.url}
                />
                <FieldError>
                  {form.formState.errors.projects?.[idx]?.url?.message}
                </FieldError>
              </Field>
            </div>
          </CardRow>
        ))}
      </div>

      <AddButton onClick={addProject}>
        <Plus className="size-3.5" strokeWidth={2} />
        Add Project
      </AddButton>

      <WizardNavButtons isSubmitting={form.formState.isSubmitting} />
    </form>
  );
}
