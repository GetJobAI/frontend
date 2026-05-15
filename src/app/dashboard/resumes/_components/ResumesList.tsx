import { ResumesListClient } from "./ResumesListClient";
import { listUserResumesFromBackend } from "~/server/api/resume";

interface ResumesListProps {
  userId: string;
}

export async function ResumesList({ userId }: ResumesListProps) {
  const userResumes = await listUserResumesFromBackend(userId);

  return <ResumesListClient resumes={userResumes} />;
}
