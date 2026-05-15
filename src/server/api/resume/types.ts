export type BackendResumeRow = {
  id: string;
  user_id: string;
  content: unknown;
  created_at: string;
  updated_at: string;
};

export type ResumeListItem = {
  id: string;
  content: unknown;
  inputMethod: string | null;
  parseStatus: string | null;
  createdAt: Date;
  updatedAt: Date;
};
