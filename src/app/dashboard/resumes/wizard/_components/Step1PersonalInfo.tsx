"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type z } from "zod";
import { step1Schema } from "../lib/wizard-schemas";
import { useWizardAutoSave } from "../hooks/use-wizard-auto-save";
import { useWizardStepForm } from "../hooks/use-wizard-step-form";
import { useWizard } from "./WizardContext";
import { SectionHeader } from "./WizardField";
import { WizardNavButtons } from "./WizardNavButtons";
import { Field, FieldLabel, FieldError } from "~/components/ui/field";
import { Input } from "~/components/ui/input";

type Step1Data = z.infer<typeof step1Schema>;

const EMPTY_STEP1: Step1Data = {
  contact: {
    name: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
  },
};

export function Step1PersonalInfo() {
  const { nextStep } = useWizard();
  const { form, sessionId } = useWizardStepForm<Step1Data>(
    1,
    EMPTY_STEP1,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    zodResolver(step1Schema) as any,
  );

  const { saveNow } = useWizardAutoSave(sessionId, 1, form.watch);

  const onSubmit = form.handleSubmit(async (data) => {
    if (await saveNow(data, { immediate: true, advance: true })) {
      nextStep();
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <SectionHeader
        title="Contact info"
        description="Provide your contact details. You will choose a template style after completing the wizard."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field data-invalid={!!form.formState.errors.contact?.name}>
          <FieldLabel htmlFor="contact.name">
            Name <span className="ml-0.5 text-violet-400">*</span>
          </FieldLabel>
          <Input
            id="contact.name"
            placeholder="Jane Smith"
            {...form.register("contact.name")}
            aria-invalid={!!form.formState.errors.contact?.name}
          />
          <FieldError>
            {form.formState.errors.contact?.name?.message}
          </FieldError>
        </Field>

        <Field data-invalid={!!form.formState.errors.contact?.email}>
          <FieldLabel htmlFor="contact.email">
            Email <span className="ml-0.5 text-violet-400">*</span>
          </FieldLabel>
          <Input
            id="contact.email"
            type="email"
            placeholder="jane@example.com"
            {...form.register("contact.email")}
            aria-invalid={!!form.formState.errors.contact?.email}
          />
          <FieldError>
            {form.formState.errors.contact?.email?.message}
          </FieldError>
        </Field>

        <Field data-invalid={!!form.formState.errors.contact?.location}>
          <FieldLabel htmlFor="contact.location">Location</FieldLabel>
          <Input
            id="contact.location"
            placeholder="San Francisco, CA"
            {...form.register("contact.location")}
            aria-invalid={!!form.formState.errors.contact?.location}
          />
          <FieldError>
            {form.formState.errors.contact?.location?.message}
          </FieldError>
        </Field>

        <Field data-invalid={!!form.formState.errors.contact?.phone}>
          <FieldLabel htmlFor="contact.phone">Phone</FieldLabel>
          <Input
            id="contact.phone"
            type="tel"
            placeholder="+1 555 000 0000"
            {...form.register("contact.phone")}
            aria-invalid={!!form.formState.errors.contact?.phone}
          />
          <FieldError>
            {form.formState.errors.contact?.phone?.message}
          </FieldError>
        </Field>

        <Field data-invalid={!!form.formState.errors.contact?.linkedin}>
          <FieldLabel htmlFor="contact.linkedin">LinkedIn</FieldLabel>
          <Input
            id="contact.linkedin"
            placeholder="linkedin.com/in/janesmith"
            {...form.register("contact.linkedin")}
            aria-invalid={!!form.formState.errors.contact?.linkedin}
          />
          <FieldError>
            {form.formState.errors.contact?.linkedin?.message}
          </FieldError>
        </Field>

        <Field data-invalid={!!form.formState.errors.contact?.github}>
          <FieldLabel htmlFor="contact.github">GitHub</FieldLabel>
          <Input
            id="contact.github"
            placeholder="github.com/janesmith"
            {...form.register("contact.github")}
            aria-invalid={!!form.formState.errors.contact?.github}
          />
          <FieldError>
            {form.formState.errors.contact?.github?.message}
          </FieldError>
        </Field>
      </div>

      <WizardNavButtons isSubmitting={form.formState.isSubmitting} />
    </form>
  );
}
