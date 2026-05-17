"use client";

import type { ResumeContent } from "./resume-content-types";
import { EDITOR_TAB_META, type EditorTabId } from "./editor-tabs";
import { ContactTab } from "./tabs/ContactTab";
import { SummaryTab } from "./tabs/SummaryTab";
import { ExperienceTab } from "./tabs/ExperienceTab";
import { EducationTab } from "./tabs/EducationTab";
import { SkillsTab } from "./tabs/SkillsTab";
import { CertificationsTab } from "./tabs/CertificationsTab";
import { LanguagesTab } from "./tabs/LanguagesTab";
import { ProjectsTab } from "./tabs/ProjectsTab";
import { SectionsTab } from "./tabs/SectionsTab";
import { JobTailoringTab } from "./tabs/JobTailoringTab";
import { FinishTab } from "./tabs/FinishTab";

interface EditorSidebarProps {
  resumeId: string;
  activeTab: EditorTabId;
  content: ResumeContent;
  onSave: (patch: Partial<ResumeContent>) => void;
  isSaving: boolean;
}

export function EditorSidebar({
  resumeId,
  activeTab,
  content,
  onSave,
  isSaving,
}: EditorSidebarProps) {
  const meta = EDITOR_TAB_META[activeTab];

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <header className="shrink-0 border-b border-white/6 px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-white">{meta.title}</h2>
            {meta.description ? (
              <p className="mt-0.5 text-xs text-neutral-500">
                {meta.description}
              </p>
            ) : null}
          </div>
          {isSaving ? (
            <span className="shrink-0 text-[11px] text-neutral-600">
              Saving…
            </span>
          ) : null}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        {activeTab === "job-tailoring" && <JobTailoringTab />}
        {activeTab === "sections" && (
          <SectionsTab content={content} onSave={onSave} />
        )}
        {activeTab === "personal" && (
          <ContactTab content={content} onSave={onSave} />
        )}
        {activeTab === "summary" && (
          <SummaryTab content={content} onSave={onSave} />
        )}
        {activeTab === "experience" && (
          <ExperienceTab content={content} onSave={onSave} />
        )}
        {activeTab === "education" && (
          <EducationTab content={content} onSave={onSave} />
        )}
        {activeTab === "skills" && (
          <SkillsTab content={content} onSave={onSave} />
        )}
        {activeTab === "certifications" && (
          <CertificationsTab content={content} onSave={onSave} />
        )}
        {activeTab === "languages" && (
          <LanguagesTab content={content} onSave={onSave} />
        )}
        {activeTab === "projects" && (
          <ProjectsTab content={content} onSave={onSave} />
        )}
        {activeTab === "finish" && (
          <FinishTab content={content} resumeId={resumeId} />
        )}
      </div>
    </div>
  );
}
