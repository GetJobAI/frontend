type AnyRecord = Record<string, unknown>;

function asRecord(value: unknown): AnyRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as AnyRecord)
    : {};
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function cleanupObject<T extends Record<string, unknown>>(
  value: T,
): Partial<T> {
  return Object.fromEntries(
    Object.entries(value).filter(([, entry]) => {
      if (entry == null) return false;
      if (typeof entry === "string") return entry.trim().length > 0;
      return true;
    }),
  ) as Partial<T>;
}

export function assembleResumeJson(stepData: Record<string, unknown>) {
  const s1 = asRecord(stepData[1]);
  const s2 = asRecord(stepData[2]);
  const s3 = asRecord(stepData[3]);
  const s4 = asRecord(stepData[4]);
  const s5 = asRecord(stepData[5]);
  const s6 = asRecord(stepData[6]);
  const s7 = asRecord(stepData[7]);
  const s8 = asRecord(stepData[8]);

  const contact = cleanupObject(asRecord(s1.contact));

  return {
    style: asString(s1.style) || "professional",
    contact: {
      name: asString(contact.name),
      ...(asString(contact.email) ? { email: asString(contact.email) } : {}),
      ...(asString(contact.phone) ? { phone: asString(contact.phone) } : {}),
      ...(asString(contact.location)
        ? { location: asString(contact.location) }
        : {}),
      ...(asString(contact.linkedin)
        ? { linkedin: asString(contact.linkedin) }
        : {}),
      ...(asString(contact.github) ? { github: asString(contact.github) } : {}),
    },
    summary: asString(s2.summary) || undefined,
    experience: Array.isArray(s3.experience) ? s3.experience : [],
    education: Array.isArray(s4.education) ? s4.education : [],
    skills: Array.isArray(s5.skills) ? s5.skills : [],
    certifications: Array.isArray(s6.certifications) ? s6.certifications : [],
    projects: Array.isArray(s8.projects) ? s8.projects : [],
    languages: Array.isArray(s7.languages) ? s7.languages : [],
  };
}
