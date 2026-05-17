export type EditorTabId =
  | "job-tailoring"
  | "sections"
  | "personal"
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "certifications"
  | "languages"
  | "projects"
  | "finish";

export const EDITOR_TABS: Array<{ id: EditorTabId; label: string }> = [
  { id: "job-tailoring", label: "Job tailoring" },
  { id: "sections", label: "Sections" },
  { id: "personal", label: "Personal" },
  { id: "summary", label: "Summary" },
  { id: "experience", label: "Experience" },
  { id: "education", label: "Education" },
  { id: "skills", label: "Skills" },
  { id: "certifications", label: "Certifications" },
  { id: "languages", label: "Languages" },
  { id: "projects", label: "Projects" },
  { id: "finish", label: "Finish" },
];

export const EDITOR_TAB_META: Record<
  EditorTabId,
  { title: string; description?: string }
> = {
  "job-tailoring": {
    title: "Job tailoring",
    description: "Paste a job description to get tailored CV suggestions.",
  },
  sections: {
    title: "CV sections",
    description: "Show or hide sections and customize PDF section headings.",
  },
  personal: {
    title: "Personal information",
    description: "Update your contact details.",
  },
  summary: {
    title: "Professional summary",
    description: "A short overview of your experience and goals.",
  },
  experience: {
    title: "Work experience",
    description: "Roles in reverse chronological order.",
  },
  education: {
    title: "Education",
    description: "Degrees, institutions, and dates.",
  },
  skills: {
    title: "Skills",
    description: "Group skills by category.",
  },
  certifications: {
    title: "Certifications",
    description: "Credentials and licenses.",
  },
  languages: {
    title: "Languages",
    description: "Languages you speak and proficiency levels.",
  },
  projects: {
    title: "Projects",
    description: "Side projects and open-source work.",
  },
  finish: {
    title: "Your CV is ready",
    description: "Download your resume or continue editing.",
  },
};
