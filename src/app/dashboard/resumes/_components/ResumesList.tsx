import { ResumesListClient } from "./ResumesListClient";
import { listResumesAction } from "~/server/actions/resume/actions";

export async function ResumesList() {
  const userResumes = await listResumesAction();

  return <ResumesListClient resumes={userResumes} />;
}
