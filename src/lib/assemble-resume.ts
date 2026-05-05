export function assembleResumeJson(stepData: Record<string, unknown>) {
  const s1 = (stepData[1] ?? {}) as Record<string, unknown>;
  const s2 = (stepData[2] ?? {}) as Record<string, unknown>;
  const s3 = (stepData[3] ?? {}) as Record<string, unknown>;
  const s4 = (stepData[4] ?? {}) as Record<string, unknown>;
  const s5 = (stepData[5] ?? {}) as Record<string, unknown>;
  const s6 = (stepData[6] ?? {}) as Record<string, unknown>;
  const s7 = (stepData[7] ?? {}) as Record<string, unknown>;
  const s8 = (stepData[8] ?? {}) as Record<string, unknown>;

  return {
    contact: {
      full_name: s1.full_name ?? null,
      email: s1.email ?? null,
      phone: s1.phone ?? null,
      location: s1.location ?? null,
      linkedin_url: s1.linkedin_url ?? null,
      portfolio_url: s1.portfolio_url ?? null,
      target_role: s1.target_role ?? null,
    },
    summary: s2.summary_text ?? "",
    experience: (s3.experience as unknown[]) ?? [],
    education: (s4.education as unknown[]) ?? [],
    skills: (s5.skills as unknown[]) ?? [],
    certifications: (s6.certifications as unknown[]) ?? [],
    languages: (s7.languages as unknown[]) ?? [],
    projects: (s8.projects as unknown[]) ?? [],
  };
}
