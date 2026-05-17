"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { type z } from "zod";
import { sectionHeadingsSchema } from "~/app/dashboard/resumes/wizard/lib/wizard-schemas";
import { Checkbox } from "~/components/ui/checkbox";
import { Field, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import {
  type SectionKey,
  SECTION_LABELS,
  type ResumeContent,
  type SectionHeadings,
} from "../resume-content-types";

const ALL_SECTIONS: SectionKey[] = [
  "summary",
  "experience",
  "education",
  "skills",
  "certifications",
  "languages",
  "projects",
];

type HeadingsFormData = z.infer<typeof sectionHeadingsSchema>;

function defaultHeading(section: SectionKey, saved?: SectionHeadings): string {
  const value = saved?.[section]?.trim();
  if (!value) return SECTION_LABELS[section];
  return value;
}

function cleanupHeadings(
  headings: HeadingsFormData,
): SectionHeadings | undefined {
  const cleaned = Object.fromEntries(
    ALL_SECTIONS.flatMap((key) => {
      const value =
        typeof headings[key] === "string" ? headings[key].trim() : "";
      if (!value || value === SECTION_LABELS[key]) return [];
      return [[key, value]];
    }),
  ) as SectionHeadings;
  return Object.keys(cleaned).length > 0 ? cleaned : undefined;
}

interface SectionsTabProps {
  content: ResumeContent;
  onSave: (patch: Partial<ResumeContent>) => void;
}

export function SectionsTab({ content, onSave }: SectionsTabProps) {
  const hidden = new Set(content.hiddenSections ?? []);

  const form = useForm<HeadingsFormData>({
    resolver: zodResolver(sectionHeadingsSchema),
    defaultValues: Object.fromEntries(
      ALL_SECTIONS.map((key) => [key, defaultHeading(key, content.headings)]),
    ) as HeadingsFormData,
    mode: "onChange",
  });

  const headingValues = form.watch();
  useEffect(() => {
    if (!form.formState.isDirty) return;
    onSave({ headings: cleanupHeadings(headingValues) ?? undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(headingValues)]);

  const toggle = (section: SectionKey, visible: boolean) => {
    const next = new Set(hidden);
    if (visible) {
      next.delete(section);
    } else {
      next.add(section);
    }
    onSave({ hiddenSections: Array.from(next) });
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-neutral-500">
        Toggle sections for the PDF and rename their headings. Hidden sections
        keep your data.
      </p>

      <div className="flex flex-col gap-2">
        {ALL_SECTIONS.map((section) => {
          const isVisible = !hidden.has(section);
          return (
            <div
              key={section}
              className="grid grid-cols-1 items-center gap-3 rounded-lg border border-white/6 bg-white/2 px-4 py-3 sm:grid-cols-2"
            >
              <Field orientation="horizontal" className="min-w-0">
                <Checkbox
                  id={`section-${section}`}
                  checked={isVisible}
                  onCheckedChange={(checked) =>
                    toggle(section, checked === true)
                  }
                />
                <FieldLabel
                  htmlFor={`section-${section}`}
                  className="cursor-pointer text-sm font-medium text-white"
                >
                  {SECTION_LABELS[section]}
                </FieldLabel>
              </Field>

              <Input
                id={`heading-${section}`}
                aria-label={`${SECTION_LABELS[section]} heading`}
                placeholder={SECTION_LABELS[section]}
                className="min-w-0"
                {...form.register(section)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
