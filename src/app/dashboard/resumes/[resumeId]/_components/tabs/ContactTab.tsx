"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type z } from "zod";
import { step1Schema } from "~/app/dashboard/resumes/wizard/lib/wizard-schemas";
import { Field, FieldLabel, FieldError } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import type { ResumeContent } from "../resume-content-types";

type FormData = z.infer<typeof step1Schema>;

interface ContactTabProps {
  content: ResumeContent;
  onSave: (patch: Partial<ResumeContent>) => void;
}

export function ContactTab({ content, onSave }: ContactTabProps) {
  const form = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
    resolver: zodResolver(step1Schema) as any,
    defaultValues: {
      contact: {
        name: content.contact?.name ?? "",
        email: content.contact?.email ?? "",
        phone: content.contact?.phone ?? "",
        location: content.contact?.location ?? "",
        linkedin: content.contact?.linkedin ?? "",
        github: content.contact?.github ?? "",
      },
    },
    mode: "onChange",
  });

  const contact = form.watch("contact");
  useEffect(() => {
    if (!form.formState.isDirty) return;
    onSave({ contact });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(contact)]);

  return (
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
        <FieldError>{form.formState.errors.contact?.name?.message}</FieldError>
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
        <FieldError>{form.formState.errors.contact?.email?.message}</FieldError>
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
        <FieldError>{form.formState.errors.contact?.phone?.message}</FieldError>
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
  );
}
