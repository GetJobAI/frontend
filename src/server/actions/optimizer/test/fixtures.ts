import type { JobPostingContent } from "~/server/api/generated/parser/schemas";

/**
 * Plain-text job ad for pipeline smoke tests — sent to the parser service.
 * Keep in sync with {@link ARTIFICIAL_JOB_POSTING_CONTENT} (expected structured shape).
 */
export const ARTIFICIAL_JOB_POSTING_RAW_TEXT = `Senior Backend Engineer — Acme GmbH
Berlin, Germany · Hybrid · Full-time · Senior

About the role
We are looking for a senior backend engineer to design distributed systems in Rust and TypeScript.

Responsibilities
- Design and operate event-driven microservices
- Improve ingestion pipeline throughput and reliability
- Mentor engineers on async patterns and observability

Requirements
- 5+ years backend experience
- Rust or Go and PostgreSQL
- Kafka or similar message brokers
- CI/CD and production operations

Nice to have
- Kubernetes
- Prometheus
- Open source contributions

Skills: Rust, TypeScript, PostgreSQL, Kafka, Docker, Kubernetes`;

/** Structured fallback reference (not used when parser path is enabled). */
export const ARTIFICIAL_JOB_POSTING_CONTENT: JobPostingContent = {
  title: "Senior Backend Engineer",
  company: "Acme GmbH",
  location: "Berlin, Germany",
  work_mode: "hybrid",
  employment_type: "full-time",
  seniority: "senior",
  summary:
    "We are looking for a senior backend engineer to design distributed systems in Rust and TypeScript.",
  responsibilities: [
    "Design and operate event-driven microservices",
    "Improve ingestion pipeline throughput and reliability",
    "Mentor engineers on async patterns and observability",
  ],
  requirements: [
    "5+ years backend experience",
    "Rust or Go and PostgreSQL",
    "Kafka or similar message brokers",
    "CI/CD and production operations",
  ],
  preferred_requirements: ["Kubernetes", "Prometheus", "Open source contributions"],
  skills: ["Rust", "TypeScript", "PostgreSQL", "Kafka", "Docker", "Kubernetes"],
  raw_text: `Senior Backend Engineer — Acme GmbH (Berlin, hybrid)

We are looking for a senior backend engineer to design distributed systems in Rust and TypeScript.

Requirements: 5+ years backend experience, Rust or Go, PostgreSQL, Kafka, CI/CD.

Nice to have: Kubernetes, Prometheus.`,
};
