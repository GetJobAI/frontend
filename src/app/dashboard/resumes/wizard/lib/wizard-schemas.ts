import { z } from "zod";

export const SUMMARY_MIN_LENGTH = 60;
export const SUMMARY_MAX_LENGTH = 2000;

export const styleEnum = z.enum(["minimal", "technical", "professional"]);

export const sectionHeadingsSchema = z.object({
  summary: z.string().trim().max(60).optional(),
  experience: z.string().trim().max(60).optional(),
  education: z.string().trim().max(60).optional(),
  skills: z.string().trim().max(60).optional(),
  certifications: z.string().trim().max(60).optional(),
  projects: z.string().trim().max(60).optional(),
  languages: z.string().trim().max(60).optional(),
});

export const step1Schema = z.object({
  style: styleEnum.default("professional"),
  contact: z.object({
    name: z.string().min(1, "Name is required"),
    email: z
      .string()
      .email("Invalid email address")
      .optional()
      .or(z.literal("")),
    phone: z.string().optional(),
    location: z.string().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
  }),
  headings: sectionHeadingsSchema.optional(),
});

export const step2Schema = z.object({
  summary: z
    .string()
    .trim()
    .min(
      SUMMARY_MIN_LENGTH,
      `Summary must be at least ${SUMMARY_MIN_LENGTH} characters`,
    )
    .max(
      SUMMARY_MAX_LENGTH,
      `Summary must be under ${SUMMARY_MAX_LENGTH} characters`,
    )
    .default(""),
});

export const bulletSchema = z.string().max(500);

export const step3Schema = z.object({
  experience: z.array(
    z.object({
      company: z.string().optional().or(z.literal("")),
      title: z.string().optional().or(z.literal("")),
      dates: z.string().min(1, "Dates are required"),
      location: z.string().optional(),
      bullets: z.array(bulletSchema).max(10).default([]),
      hide: z.boolean().default(false),
    }),
  ),
});

export const step4Schema = z.object({
  education: z.array(
    z.object({
      institution: z.string().min(1, "Institution is required"),
      degree: z.string().min(1, "Degree is required"),
      dates: z.string().min(1, "Dates are required"),
      location: z.string().optional(),
      grade: z.string().optional(),
      hide: z.boolean().default(false),
    }),
  ),
});

export const step5Schema = z.object({
  skills: z.array(
    z.object({
      category: z.string().min(1, "Category is required"),
      items: z
        .array(z.string().trim().min(1, "Skill item cannot be empty"))
        .min(1, "Add at least one skill item"),
    }),
  ),
});

export const step6Schema = z.object({
  certifications: z
    .array(
      z.object({
        name: z.string().min(1, "Certification name is required"),
        issuer: z.string().min(1, "Issuer is required"),
        date: z.string().min(1, "Date is required"),
      }),
    )
    .optional()
    .default([]),
});

export const step7Schema = z.object({
  languages: z
    .array(
      z.object({
        name: z.string().min(1, "Language is required"),
        level: z.string().min(1, "Level is required"),
      }),
    )
    .optional()
    .default([]),
});

export const step8Schema = z.object({
  projects: z
    .array(
      z.object({
        name: z.string().min(1, "Project name is required"),
        description: z.string().min(1, "Description is required"),
        url: z.string().optional(),
      }),
    )
    .optional()
    .default([]),
});

export const stepSchemas = {
  1: step1Schema,
  2: step2Schema,
  3: step3Schema,
  4: step4Schema,
  5: step5Schema,
  6: step6Schema,
  7: step7Schema,
  8: step8Schema,
} as const;

export type StepNumber = keyof typeof stepSchemas;

export const STEP_META = [
  { step: 1, label: "Contact", description: "Identity, links, and style" },
  { step: 2, label: "Summary", description: "Professional overview" },
  { step: 3, label: "Experience", description: "Work history" },
  { step: 4, label: "Education", description: "Academic background" },
  { step: 5, label: "Skills", description: "Skill groups and keywords" },
  { step: 6, label: "Certifications", description: "Credentials (optional)" },
  {
    step: 7,
    label: "Languages",
    description: "Languages you speak (optional)",
  },
  { step: 8, label: "Projects", description: "Side projects (optional)" },
  { step: 9, label: "Review", description: "Confirm & finalize" },
] as const;

export const TOTAL_STEPS = 9;
