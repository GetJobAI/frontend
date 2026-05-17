"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type z } from "zod";
import { step1Schema } from "../lib/wizard-schemas";
import { useWizardAutoSave } from "../hooks/use-wizard-auto-save";
import { useWizard } from "./WizardContext";
import { SectionHeader } from "./WizardField";
import { WizardNavButtons } from "./WizardNavButtons";
import { Field, FieldLabel, FieldError } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Controller } from "react-hook-form";

type Step1Data = z.infer<typeof step1Schema>;
type StyleValue = Step1Data["style"];

const STYLE_OPTIONS: Array<{ value: StyleValue; label: string }> = [
  { value: "professional", label: "Professional" },
  { value: "technical", label: "Technical" },
  { value: "minimal", label: "Minimal" },
];

export function Step1PersonalInfo() {
  const { sessionId, stepData, nextStep } = useWizard();
  const saved = stepData[1] as Partial<Step1Data> | undefined;

  const form = useForm<Step1Data>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    resolver: zodResolver(step1Schema) as any,
    defaultValues: saved ?? {
      style: "professional",
      contact: {
        name: "",
        email: "",
        phone: "",
        location: "",
        linkedin: "",
        github: "",
      },
      headings: {},
    },
    mode: "onChange",
  });

  const { saveNow } = useWizardAutoSave(sessionId, 1, form.watch);

  const onSubmit = form.handleSubmit(async (data) => {
    if (await saveNow(data, { immediate: true, advance: true })) {
      nextStep();
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <SectionHeader
        title="Contact and style"
        description="Provide contact details and choose a template style for your generated resume."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field className="sm:col-span-2">
          <FieldLabel htmlFor="style">Style</FieldLabel>
          <Controller
            control={form.control}
            name="style"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="style">
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  {STYLE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>

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

        <Field className="sm:col-span-2">
          <FieldLabel htmlFor="headings.summary" className="mt-4">
            Optional custom section headings
          </FieldLabel>
          <p className="text-[11px] text-neutral-600">
            Leave blank to use default headings from the selected style.
          </p>
        </Field>

        <Field data-invalid={!!form.formState.errors.headings?.summary}>
          <FieldLabel htmlFor="headings.summary">Summary heading</FieldLabel>
          <Input
            id="headings.summary"
            placeholder="Summary"
            {...form.register("headings.summary")}
            aria-invalid={!!form.formState.errors.headings?.summary}
          />
          <FieldError>
            {form.formState.errors.headings?.summary?.message}
          </FieldError>
        </Field>
        <Field data-invalid={!!form.formState.errors.headings?.experience}>
          <FieldLabel htmlFor="headings.experience">
            Experience heading
          </FieldLabel>
          <Input
            id="headings.experience"
            placeholder="Experience"
            {...form.register("headings.experience")}
            aria-invalid={!!form.formState.errors.headings?.experience}
          />
          <FieldError>
            {form.formState.errors.headings?.experience?.message}
          </FieldError>
        </Field>
        <Field data-invalid={!!form.formState.errors.headings?.education}>
          <FieldLabel htmlFor="headings.education">
            Education heading
          </FieldLabel>
          <Input
            id="headings.education"
            placeholder="Education"
            {...form.register("headings.education")}
            aria-invalid={!!form.formState.errors.headings?.education}
          />
          <FieldError>
            {form.formState.errors.headings?.education?.message}
          </FieldError>
        </Field>
        <Field data-invalid={!!form.formState.errors.headings?.skills}>
          <FieldLabel htmlFor="headings.skills">Skills heading</FieldLabel>
          <Input
            id="headings.skills"
            placeholder="Skills"
            {...form.register("headings.skills")}
            aria-invalid={!!form.formState.errors.headings?.skills}
          />
          <FieldError>
            {form.formState.errors.headings?.skills?.message}
          </FieldError>
        </Field>
        <Field data-invalid={!!form.formState.errors.headings?.certifications}>
          <FieldLabel htmlFor="headings.certifications">
            Certifications heading
          </FieldLabel>
          <Input
            id="headings.certifications"
            placeholder="Certifications"
            {...form.register("headings.certifications")}
            aria-invalid={!!form.formState.errors.headings?.certifications}
          />
          <FieldError>
            {form.formState.errors.headings?.certifications?.message}
          </FieldError>
        </Field>
        <Field data-invalid={!!form.formState.errors.headings?.projects}>
          <FieldLabel htmlFor="headings.projects">Projects heading</FieldLabel>
          <Input
            id="headings.projects"
            placeholder="Projects"
            {...form.register("headings.projects")}
            aria-invalid={!!form.formState.errors.headings?.projects}
          />
          <FieldError>
            {form.formState.errors.headings?.projects?.message}
          </FieldError>
        </Field>
        <Field data-invalid={!!form.formState.errors.headings?.languages}>
          <FieldLabel htmlFor="headings.languages">
            Languages heading
          </FieldLabel>
          <Input
            id="headings.languages"
            placeholder="Languages"
            {...form.register("headings.languages")}
            aria-invalid={!!form.formState.errors.headings?.languages}
          />
          <FieldError>
            {form.formState.errors.headings?.languages?.message}
          </FieldError>
        </Field>
      </div>

      <WizardNavButtons isSubmitting={form.formState.isSubmitting} />
    </form>
  );
}
