import { ResumesListClient } from "./ResumesListClient";
import { listUserResumesFromBackend } from "~/server/actions/backend/resumes-api";

interface ResumesListProps {
  userId: string;
}

export async function ResumesList({ userId }: ResumesListProps) {
  const userResumes = await listUserResumesFromBackend(userId);

  return <ResumesListClient resumes={userResumes} />;
}
