"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type z } from "zod";
import { step1Schema } from "~/lib/wizard-schemas";
import { useWizardAutoSave } from "~/hooks/useWizardAutoSave";
import { useWizard } from "./WizardContext";
import { SectionHeader } from "./WizardField";
import { WizardNavButtons } from "./WizardNavButtons";
import { Field, FieldLabel, FieldError } from "~/components/ui/field";
import { Input } from "~/components/ui/input";

type Step1Data = z.infer<typeof step1Schema>;

export function Step1PersonalInfo() {
  const { sessionId, stepData, nextStep } = useWizard();
  const saved = stepData[1] as Partial<Step1Data> | undefined;

  const form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: saved ?? {},
    mode: "onChange",
  });

  useWizardAutoSave(sessionId, 1, form.watch);

  const onSubmit = form.handleSubmit(() => nextStep());

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <SectionHeader
        title="Personal information"
        description="Your contact details and target role — this appears at the top of your resume."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          className="sm:col-span-2"
          data-invalid={!!form.formState.errors.full_name}
        >
          <FieldLabel htmlFor="full_name">
            Full Name <span className="ml-0.5 text-violet-400">*</span>
          </FieldLabel>
          <Input
            id="full_name"
            placeholder="Jane Smith"
            {...form.register("full_name")}
            aria-invalid={!!form.formState.errors.full_name}
          />
          <FieldError>{form.formState.errors.full_name?.message}</FieldError>
        </Field>

        <Field data-invalid={!!form.formState.errors.email}>
          <FieldLabel htmlFor="email">
            Email <span className="ml-0.5 text-violet-400">*</span>
          </FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="jane@example.com"
            {...form.register("email")}
            aria-invalid={!!form.formState.errors.email}
          />
          <FieldError>{form.formState.errors.email?.message}</FieldError>
        </Field>

        <Field data-invalid={!!form.formState.errors.phone}>
          <FieldLabel htmlFor="phone">Phone</FieldLabel>
          <Input
            id="phone"
            type="tel"
            placeholder="+1 555 000 0000"
            {...form.register("phone")}
            aria-invalid={!!form.formState.errors.phone}
          />
          <FieldError>{form.formState.errors.phone?.message}</FieldError>
        </Field>

        <Field data-invalid={!!form.formState.errors.location}>
          <FieldLabel htmlFor="location">Location</FieldLabel>
          <Input
            id="location"
            placeholder="San Francisco, CA"
            {...form.register("location")}
            aria-invalid={!!form.formState.errors.location}
          />
          <FieldError>{form.formState.errors.location?.message}</FieldError>
        </Field>

        <Field data-invalid={!!form.formState.errors.target_role}>
          <FieldLabel htmlFor="target_role">
            Target Role <span className="ml-0.5 text-violet-400">*</span>
          </FieldLabel>
          <Input
            id="target_role"
            placeholder="Senior Software Engineer"
            {...form.register("target_role")}
            aria-invalid={!!form.formState.errors.target_role}
          />
          <FieldError>{form.formState.errors.target_role?.message}</FieldError>
        </Field>

        <Field data-invalid={!!form.formState.errors.linkedin_url}>
          <FieldLabel htmlFor="linkedin_url">LinkedIn URL</FieldLabel>
          <Input
            id="linkedin_url"
            placeholder="https://linkedin.com/in/janesmith"
            {...form.register("linkedin_url")}
            aria-invalid={!!form.formState.errors.linkedin_url}
          />
          <FieldError>{form.formState.errors.linkedin_url?.message}</FieldError>
        </Field>

        <Field data-invalid={!!form.formState.errors.portfolio_url}>
          <FieldLabel htmlFor="portfolio_url">Portfolio / Website</FieldLabel>
          <Input
            id="portfolio_url"
            placeholder="https://janesmith.dev"
            {...form.register("portfolio_url")}
            aria-invalid={!!form.formState.errors.portfolio_url}
          />
          <FieldError>
            {form.formState.errors.portfolio_url?.message}
          </FieldError>
        </Field>
      </div>

      <WizardNavButtons isSubmitting={form.formState.isSubmitting} />
    </form>
  );
}
