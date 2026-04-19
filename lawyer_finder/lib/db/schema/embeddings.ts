import { nanoid } from "@/lib/utils";
import { index, pgTable, text, varchar, vector, timestamp } from "drizzle-orm/pg-core";
import { resources } from "./resources";

export const embeddings = pgTable(
  "embeddings",
  {
    id: varchar("id", { length: 191 })
      .primaryKey()
      .$defaultFn(() => nanoid()),
    resourceId: varchar("resource_id", { length: 191 }).references(
      () => resources.id,
      { onDelete: "cascade" },
    ),
    content: text("content").notNull(),
    type: varchar("type", { length: 50 }).notNull().default("lawyer"),
    embedding: vector("embedding", { dimensions: 3072 }).notNull(),
  }
);

export const lawyerContacts = pgTable("lawyer_contacts", {
  id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  name: varchar("name", { length: 255 }).notNull(),
  location: varchar("location", { length: 255 }),
  experience: varchar("experience", { length: 100 }),
  languages: varchar("languages", { length: 255 }),
  practiceAreas: text("practice_areas"),
  court: varchar("court", { length: 255 }),
  profileLink: varchar("profile_link", { length: 500 }),
  about: text("about"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const caseStudies = pgTable("case_studies", {
  id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => nanoid()),
  title: varchar("title", { length: 500 }).notNull(),
  summary: text("summary"),
  year: varchar("year", { length: 50 }),
  jurisdiction: varchar("jurisdiction", { length: 255 }),
  sourceUrl: varchar("source_url", { length: 1000 }),
  relevance: text("relevance"),
  createdAt: timestamp("created_at").defaultNow(),
});
