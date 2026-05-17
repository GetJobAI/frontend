"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type z } from "zod";
import { step6Schema } from "~/app/dashboard/resumes/wizard/lib/wizard-schemas";
import {
  AddButton,
  RemoveButton,
  CardRow,
} from "~/app/dashboard/resumes/wizard/_components/WizardField";
import { Field, FieldLabel, FieldError } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Plus } from "lucide-react";
import type { ResumeContent } from "../resume-content-types";

type FormData = z.infer<typeof step6Schema>;

interface CertificationsTabProps {
  content: ResumeContent;
  onSave: (patch: Partial<ResumeContent>) => void;
}

export function CertificationsTab({ content, onSave }: CertificationsTabProps) {
  const form = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    resolver: zodResolver(step6Schema) as any,
    defaultValues: { certifications: content.certifications ?? [] },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "certifications",
  });

  const values = form.watch();
  useEffect(() => {
    if (!form.formState.isDirty) return;
    onSave({ certifications: values.certifications });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(values.certifications)]);

  return (
    <div className="flex flex-col gap-4">
      {fields.length === 0 && (
        <div className="rounded-xl border border-white/6 bg-white/2 px-6 py-10 text-center">
          <p className="text-sm text-neutral-500">No certifications added.</p>
        </div>
      )}

      {fields.map((field, idx) => (
        <CardRow key={field.id}>
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[10px] font-semibold tracking-widest text-neutral-600 uppercase">
              Cert {idx + 1}
            </span>
            <RemoveButton onClick={() => remove(idx)} />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field
              className="sm:col-span-2"
              data-invalid={!!form.formState.errors.certifications?.[idx]?.name}
            >
              <FieldLabel htmlFor={`cert-name-${idx}`}>
                Name <span className="ml-0.5 text-violet-400">*</span>
              </FieldLabel>
              <Input
                id={`cert-name-${idx}`}
                placeholder="AWS Solutions Architect"
                {...form.register(`certifications.${idx}.name`)}
              />
              <FieldError>
                {form.formState.errors.certifications?.[idx]?.name?.message}
              </FieldError>
            </Field>

            <Field
              data-invalid={
                !!form.formState.errors.certifications?.[idx]?.issuer
              }
            >
              <FieldLabel htmlFor={`cert-issuer-${idx}`}>
                Issuer <span className="ml-0.5 text-violet-400">*</span>
              </FieldLabel>
              <Input
                id={`cert-issuer-${idx}`}
                placeholder="Amazon Web Services"
                {...form.register(`certifications.${idx}.issuer`)}
              />
              <FieldError>
                {form.formState.errors.certifications?.[idx]?.issuer?.message}
              </FieldError>
            </Field>

            <Field
              data-invalid={!!form.formState.errors.certifications?.[idx]?.date}
            >
              <FieldLabel htmlFor={`cert-date-${idx}`}>
                Date <span className="ml-0.5 text-violet-400">*</span>
              </FieldLabel>
              <Input
                id={`cert-date-${idx}`}
                placeholder="11.2023"
                {...form.register(`certifications.${idx}.date`)}
              />
              <FieldError>
                {form.formState.errors.certifications?.[idx]?.date?.message}
              </FieldError>
            </Field>
          </div>
        </CardRow>
      ))}

      <AddButton onClick={() => append({ name: "", issuer: "", date: "" })}>
        <Plus className="size-3.5" strokeWidth={2} />
        Add Certification
      </AddButton>
    </div>
  );
}
