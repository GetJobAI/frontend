export type StyleValue = "professional" | "technical" | "minimal";

export type ExperienceEntry = {
  company?: string;
  title?: string;
  dates: string;
  location?: string;
  bullets?: string[];
  hide?: boolean;
};

export type EducationEntry = {
  institution: string;
  degree: string;
  dates: string;
  location?: string;
  grade?: string;
  hide?: boolean;
};

export type SkillGroup = {
  category: string;
  items: string[];
};

export type Certification = {
  name: string;
  issuer: string;
  date: string;
};

export type Language = {
  name: string;
  level: string;
};

export type Project = {
  name: string;
  description: string;
  url?: string;
};

export type SectionHeadings = {
  summary?: string;
  experience?: string;
  education?: string;
  skills?: string;
  certifications?: string;
  projects?: string;
  languages?: string;
};

export type ResumeContent = {
  style?: StyleValue;
  contact?: {
    name: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
  };
  summary?: string;
  experience?: ExperienceEntry[];
  education?: EducationEntry[];
  skills?: SkillGroup[];
  certifications?: Certification[];
  languages?: Language[];
  projects?: Project[];
  headings?: SectionHeadings;
  hiddenSections?: string[];
  [key: string]: unknown;
};

export type SectionKey =
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "certifications"
  | "languages"
  | "projects";

export const SECTION_LABELS: Record<SectionKey, string> = {
  summary: "Summary",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  certifications: "Certifications",
  languages: "Languages",
  projects: "Projects",
};

export function buildPdfPayload(
  content: ResumeContent,
): Record<string, unknown> {
  const hidden = new Set(content.hiddenSections ?? []);

  const payload: Record<string, unknown> = {
    style: content.style ?? "professional",
    contact: content.contact ?? { name: "" },
  };

  if (content.summary && !hidden.has("summary")) {
    payload.summary = content.summary;
  }
  if (content.experience?.length && !hidden.has("experience")) {
    payload.experience = content.experience;
  }
  if (content.education?.length && !hidden.has("education")) {
    payload.education = content.education;
  }
  if (content.skills?.length && !hidden.has("skills")) {
    payload.skills = content.skills;
  }
  if (content.certifications?.length && !hidden.has("certifications")) {
    payload.certifications = content.certifications;
  }
  if (content.languages?.length && !hidden.has("languages")) {
    payload.languages = content.languages;
  }
  if (content.projects?.length && !hidden.has("projects")) {
    payload.projects = content.projects;
  }
  if (content.headings) {
    payload.headings = content.headings;
  }

  return payload;
}
