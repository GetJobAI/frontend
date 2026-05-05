import { z } from "zod";

export const step1Schema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  location: z.string().optional(),
  linkedin_url: z.string().url().optional().or(z.literal("")),
  portfolio_url: z.string().url().optional().or(z.literal("")),
  target_role: z.string().min(1, "Target role is required"),
});

export const step2Schema = z.object({
  summary_text: z
    .string()
    .trim()
    .min(1, "Summary is required")
    .max(2000, "Summary must be under 2000 characters")
    .default(""),
});

export const bulletSchema = z.string().max(500);

export const step3Schema = z.object({
  experience: z.array(
    z.object({
      company: z.string().min(1, "Company is required"),
      title: z.string().min(1, "Job title is required"),
      start_date: z
        .string()
        .regex(/^\d{4}-\d{2}$/, "Format: YYYY-MM")
        .optional()
        .or(z.literal("")),
      end_date: z
        .string()
        .regex(/^\d{4}-\d{2}$/, "Format: YYYY-MM")
        .nullable()
        .optional()
        .or(z.literal("")),
      is_current: z.boolean().default(false),
      bullets: z.array(bulletSchema).max(10).default([]),
    }),
  ),
});

export const step4Schema = z.object({
  education: z.array(
    z.object({
      institution: z.string().min(1, "Institution is required"),
      degree: z.string().min(1, "Degree is required"),
      field_of_study: z.string().optional(),
      start_date: z
        .string()
        .regex(/^\d{4}-\d{2}$/, "Format: YYYY-MM")
        .optional()
        .or(z.literal("")),
      end_date: z
        .string()
        .regex(/^\d{4}-\d{2}$/, "Format: YYYY-MM")
        .nullable()
        .optional()
        .or(z.literal("")),
      gpa: z.number().min(0).max(4).nullable().optional(),
    }),
  ),
});

export const skillLevelEnum = z.enum(["beginner", "intermediate", "expert"]);
export const skillCategoryEnum = z.enum([
  "technical",
  "domain",
  "soft",
  "certification",
]);

export const step5Schema = z.object({
  skills: z
    .array(
      z.object({
        name: z.string().min(1, "Skill name is required"),
        category: skillCategoryEnum,
        level: skillLevelEnum,
      }),
    )
    .min(1, "Add at least one skill"),
});

export const step6Schema = z.object({
  certifications: z
    .array(
      z.object({
        name: z.string().min(1, "Certification name is required"),
        issuing_org: z.string().optional(),
        issue_date: z
          .string()
          .regex(/^\d{4}-\d{2}$/, "Format: YYYY-MM")
          .optional()
          .or(z.literal("")),
        expiry_date: z
          .string()
          .regex(/^\d{4}-\d{2}$/, "Format: YYYY-MM")
          .nullable()
          .optional()
          .or(z.literal("")),
        credential_id: z.string().optional(),
      }),
    )
    .optional()
    .default([]),
});

export const cefrEnum = z.enum(["A1", "A2", "B1", "B2", "C1", "C2", "Native"]);

export const step7Schema = z.object({
  languages: z
    .array(
      z.object({
        language: z.string().min(1, "Language is required"),
        proficiency: cefrEnum,
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
        description: z.string().optional(),
        url: z.string().url().optional().or(z.literal("")),
        technologies: z.array(z.string()).default([]),
        start_date: z
          .string()
          .regex(/^\d{4}-\d{2}$/, "Format: YYYY-MM")
          .optional()
          .or(z.literal("")),
        end_date: z
          .string()
          .regex(/^\d{4}-\d{2}$/, "Format: YYYY-MM")
          .nullable()
          .optional()
          .or(z.literal("")),
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
  { step: 1, label: "Personal info", description: "Who are you?" },
  { step: 2, label: "Summary", description: "Your professional headline" },
  { step: 3, label: "Experience", description: "Work history" },
  { step: 4, label: "Education", description: "Degrees & courses" },
  { step: 5, label: "Skills", description: "What you know" },
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
