export function isResumeContentReady(content: unknown): boolean {
  if (!content || typeof content !== "object" || Array.isArray(content)) {
    return false;
  }

  const record = content as Record<string, unknown>;

  const contact = record.contact;
  if (contact && typeof contact === "object" && !Array.isArray(contact)) {
    const name = (contact as Record<string, unknown>).name;
    if (typeof name === "string" && name.trim().length > 0) {
      return true;
    }
  }

  if (Array.isArray(record.experience) && record.experience.length > 0) {
    return true;
  }

  if (typeof record.summary === "string" && record.summary.trim().length > 0) {
    return true;
  }

  return false;
}
