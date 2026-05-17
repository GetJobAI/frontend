"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type z } from "zod";
import { step8Schema } from "~/app/dashboard/resumes/wizard/lib/wizard-schemas";
import {
  AddButton,
  RemoveButton,
  CardRow,
} from "~/app/dashboard/resumes/wizard/_components/WizardField";
import { Field, FieldLabel, FieldError } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Plus } from "lucide-react";
import type { ResumeContent } from "../resume-content-types";

type FormData = z.infer<typeof step8Schema>;

interface ProjectsTabProps {
  content: ResumeContent;
  onSave: (patch: Partial<ResumeContent>) => void;
}

export function ProjectsTab({ content, onSave }: ProjectsTabProps) {
  const form = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    resolver: zodResolver(step8Schema) as any,
    defaultValues: { projects: content.projects ?? [] },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "projects",
  });

  const values = form.watch();
  useEffect(() => {
    if (!form.formState.isDirty) return;
    onSave({ projects: values.projects });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(values.projects)]);

  return (
    <div className="flex flex-col gap-4">
      {fields.length === 0 && (
        <div className="rounded-xl border border-white/6 bg-white/2 px-6 py-10 text-center">
          <p className="text-sm text-neutral-500">No projects added.</p>
        </div>
      )}

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
              className="sm:col-span-2"
              data-invalid={!!form.formState.errors.projects?.[idx]?.name}
            >
              <FieldLabel htmlFor={`proj-name-${idx}`}>
                Name <span className="ml-0.5 text-violet-400">*</span>
              </FieldLabel>
              <Input
                id={`proj-name-${idx}`}
                placeholder="typst-resume"
                {...form.register(`projects.${idx}.name`)}
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
                placeholder="Open-source ATS-safe resume template for Typst. 200+ GitHub stars."
                rows={2}
                {...form.register(`projects.${idx}.description`)}
              />
              <FieldError>
                {form.formState.errors.projects?.[idx]?.description?.message}
              </FieldError>
            </Field>

            <Field className="sm:col-span-2">
              <FieldLabel htmlFor={`proj-url-${idx}`}>URL</FieldLabel>
              <Input
                id={`proj-url-${idx}`}
                placeholder="github.com/user/project"
                {...form.register(`projects.${idx}.url`)}
              />
            </Field>
          </div>
        </CardRow>
      ))}

      <AddButton onClick={() => append({ name: "", description: "", url: "" })}>
        <Plus className="size-3.5" strokeWidth={2} />
        Add Project
      </AddButton>
    </div>
  );
}
