"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type z } from "zod";
import { step6Schema } from "~/lib/wizard-schemas";
import { useWizardAutoSave } from "~/hooks/useWizardAutoSave";
import { useWizard } from "./WizardContext";
import { SectionHeader, AddButton, RemoveButton, CardRow } from "./WizardField";
import { WizardNavButtons } from "./WizardNavButtons";
import { Plus } from "lucide-react";
import { Field, FieldLabel, FieldError } from "~/components/ui/field";
import { Input } from "~/components/ui/input";

type Step6Data = z.infer<typeof step6Schema>;

export function Step6Certifications() {
  const { sessionId, stepData, nextStep } = useWizard();
  const saved = stepData[6] as Partial<Step6Data> | undefined;

  const form = useForm<Step6Data>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    resolver: zodResolver(step6Schema) as any,
    defaultValues: saved ?? { certifications: [] },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "certifications",
  });

  useWizardAutoSave(sessionId, 6, form.watch);

  const addCert = () =>
    append({
      name: "",
      issuing_org: "",
      issue_date: "",
      expiry_date: "",
      credential_id: "",
    });

  const onSubmit = form.handleSubmit(() => nextStep());

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <SectionHeader
        title="Certifications"
        description="Optional — add any professional certifications or licenses."
      />

      <div className="rounded-lg border border-white/6 bg-white/2 px-4 py-2.5 text-xs text-neutral-600">
        This section is <span className="text-neutral-400">optional</span>. You
        can skip it and still finalize your resume.
      </div>

      {fields.length === 0 && (
        <div className="rounded-xl border border-white/6 bg-white/2 px-6 py-10 text-center">
          <p className="text-sm text-neutral-500">No certifications added.</p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {fields.map((field, idx) => (
          <CardRow key={field.id}>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-[10px] font-semibold tracking-widest text-neutral-600 uppercase">
                Certification {idx + 1}
              </span>
              <RemoveButton onClick={() => remove(idx)} />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field
                className="sm:col-span-2"
                data-invalid={
                  !!form.formState.errors.certifications?.[idx]?.name
                }
              >
                <FieldLabel htmlFor={`cert-name-${idx}`}>
                  Certification Name{" "}
                  <span className="ml-0.5 text-violet-400">*</span>
                </FieldLabel>
                <Input
                  id={`cert-name-${idx}`}
                  placeholder="AWS Certified Solutions Architect"
                  {...form.register(`certifications.${idx}.name`)}
                  aria-invalid={
                    !!form.formState.errors.certifications?.[idx]?.name
                  }
                />
                <FieldError>
                  {form.formState.errors.certifications?.[idx]?.name?.message}
                </FieldError>
              </Field>

              <Field
                data-invalid={
                  !!form.formState.errors.certifications?.[idx]?.issuing_org
                }
              >
                <FieldLabel htmlFor={`cert-org-${idx}`}>
                  Issuing Organization
                </FieldLabel>
                <Input
                  id={`cert-org-${idx}`}
                  placeholder="Amazon Web Services"
                  {...form.register(`certifications.${idx}.issuing_org`)}
                  aria-invalid={
                    !!form.formState.errors.certifications?.[idx]?.issuing_org
                  }
                />
                <FieldError>
                  {
                    form.formState.errors.certifications?.[idx]?.issuing_org
                      ?.message
                  }
                </FieldError>
              </Field>

              <Field
                data-invalid={
                  !!form.formState.errors.certifications?.[idx]?.credential_id
                }
              >
                <FieldLabel htmlFor={`cert-id-${idx}`}>
                  Credential ID
                </FieldLabel>
                <Input
                  id={`cert-id-${idx}`}
                  placeholder="ABC-12345"
                  {...form.register(`certifications.${idx}.credential_id`)}
                  aria-invalid={
                    !!form.formState.errors.certifications?.[idx]?.credential_id
                  }
                />
                <FieldError>
                  {
                    form.formState.errors.certifications?.[idx]?.credential_id
                      ?.message
                  }
                </FieldError>
              </Field>

              <Field
                data-invalid={
                  !!form.formState.errors.certifications?.[idx]?.issue_date
                }
              >
                <FieldLabel htmlFor={`cert-issue-${idx}`}>
                  Issue Date
                </FieldLabel>
                <Input
                  id={`cert-issue-${idx}`}
                  placeholder="2022-04"
                  {...form.register(`certifications.${idx}.issue_date`)}
                  aria-invalid={
                    !!form.formState.errors.certifications?.[idx]?.issue_date
                  }
                />
                <FieldError>
                  {
                    form.formState.errors.certifications?.[idx]?.issue_date
                      ?.message
                  }
                </FieldError>
              </Field>

              <Field
                data-invalid={
                  !!form.formState.errors.certifications?.[idx]?.expiry_date
                }
              >
                <FieldLabel htmlFor={`cert-expiry-${idx}`}>
                  Expiry Date
                </FieldLabel>
                <Input
                  id={`cert-expiry-${idx}`}
                  placeholder="2025-04"
                  {...form.register(`certifications.${idx}.expiry_date`)}
                  aria-invalid={
                    !!form.formState.errors.certifications?.[idx]?.expiry_date
                  }
                />
                <FieldError>
                  {
                    form.formState.errors.certifications?.[idx]?.expiry_date
                      ?.message
                  }
                </FieldError>
              </Field>
            </div>
          </CardRow>
        ))}
      </div>

      <AddButton onClick={addCert}>
        <Plus className="size-3.5" strokeWidth={2} />
        Add Certification
      </AddButton>

      <WizardNavButtons isSubmitting={form.formState.isSubmitting} />
    </form>
  );
}
