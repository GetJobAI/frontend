"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { EditorSidebar } from "./EditorSidebar";
import { EditorTabStrip } from "./EditorTabStrip";
import { PdfPreview } from "./PdfPreview";
import type { EditorTabId } from "./editor-tabs";
import type { ResumeContent, StyleValue } from "./resume-content-types";
import { updateResumeContentAction } from "~/server/actions/resume/actions";

interface ResumeEditorClientProps {
  resumeId: string;
  initialContent: ResumeContent;
  initialTab?: EditorTabId;
}

export function ResumeEditorClient({
  resumeId,
  initialContent,
  initialTab,
}: ResumeEditorClientProps) {
  const [content, setContent] = useState<ResumeContent>(initialContent);
  const [activeTab, setActiveTab] = useState<EditorTabId>(
    initialTab ?? "personal",
  );
  const [isSaving, startSave] = useTransition();
  const saveDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestContentRef = useRef<ResumeContent>(initialContent);

  useEffect(() => {
    latestContentRef.current = content;
  }, [content]);

  const scheduleSave = useCallback(() => {
    if (saveDebounceRef.current) clearTimeout(saveDebounceRef.current);
    saveDebounceRef.current = setTimeout(() => {
      startSave(async () => {
        await updateResumeContentAction(resumeId, latestContentRef.current);
      });
    }, 900);
  }, [resumeId]);

  const handleSave = useCallback(
    (patch: Partial<ResumeContent>) => {
      setContent((prev) => {
        const next = { ...prev, ...patch };
        for (const key of Object.keys(patch) as (keyof ResumeContent)[]) {
          if (patch[key] === undefined) {
            delete next[key];
          }
        }
        return next;
      });
      scheduleSave();
    },
    [scheduleSave],
  );

  const handleStyleChange = useCallback(
    (style: StyleValue) => {
      handleSave({ style });
    },
    [handleSave],
  );

  useEffect(() => {
    return () => {
      if (saveDebounceRef.current) clearTimeout(saveDebounceRef.current);
    };
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden md:gap-3">
      <EditorTabStrip activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto md:grid md:grid-cols-2 md:gap-4 md:overflow-hidden">
        <div className="card-surface flex min-h-[min(55vh,32rem)] shrink-0 flex-col overflow-hidden md:min-h-0">
          <EditorSidebar
            resumeId={resumeId}
            activeTab={activeTab}
            content={content}
            onSave={handleSave}
            isSaving={isSaving}
          />
        </div>

        <div className="card-surface flex min-h-[min(55vh,32rem)] shrink-0 flex-col overflow-hidden md:min-h-0">
          <PdfPreview content={content} onStyleChange={handleStyleChange} />
        </div>
      </div>
    </div>
  );
}
