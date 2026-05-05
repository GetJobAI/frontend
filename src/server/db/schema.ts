import {
  pgTable,
  uuid,
  smallint,
  jsonb,
  text,
  timestamp,
  pgEnum,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { isNull } from "drizzle-orm";

export const wizardSourceEnum = pgEnum("wizard_source", [
  "scratch",
  "linkedin_zip",
]);

export const wizardSessions = pgTable(
  "wizard_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").notNull(),
    currentStep: smallint("current_step").notNull().default(1),
    stepData: jsonb("step_data").notNull().default({}), // encrypted at app layer
    source: wizardSourceEnum("source").notNull().default("scratch"),
    linkedinImportId: uuid("linkedin_import_id"),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("wizard_sessions_user_active")
      .on(table.userId)
      .where(isNull(table.completedAt)),
  ],
);

export const resumes = pgTable("resumes", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  content: jsonb("content"), // canonical field per OpenAPI
  inputMethod: text("input_method"), // 'wizard' for this path
  wizardSessionId: uuid("wizard_session_id"),
  parseStatus: text("parse_status").default("completed"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
