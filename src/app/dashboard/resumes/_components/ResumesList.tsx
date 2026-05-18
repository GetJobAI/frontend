import { ResumesListClient } from "./ResumesListClient";
import { listResumesAction } from "~/server/actions/resume/actions";

export async function ResumesList() {
  const userResumes = await listResumesAction();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ResumesListClient resumes={userResumes} />
    </div>
  );
}
