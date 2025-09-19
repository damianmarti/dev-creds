import { index, onchainTable, primaryKey, relations } from "ponder";

export const attestation = onchainTable("attestation", (t) => ({
  id: t.text().primaryKey(),
  attester: t.text().notNull(),
  uid: t.text().notNull(),
  githubUser: t.text().notNull(),
  skills: t.text().array().notNull(),
  description: t.text().notNull(),
  evidences: t.text().array().notNull(),
  timestamp: t.integer().notNull(),
}));

export const attestationRelations = relations(attestation, ({ one }) => ({
  developer: one(developer, {
    fields: [attestation.githubUser],
    references: [developer.githubUser],
  }),
}));

export const developerSkill = onchainTable(
  "developerSkill",
  (t) => ({
    githubUser: t.text().notNull(),
    skill: t.text().notNull(),
    count: t.integer().notNull(),
    score: t.integer().notNull(),
  }),
  (t) => ({
    pk: primaryKey({ columns: [t.githubUser, t.skill] }),
    skillIdx: index().on(t.skill),
  }),
);

export const developerSkillRelations = relations(developerSkill, ({ one }) => ({
  developer: one(developer, {
    fields: [developerSkill.githubUser],
    references: [developer.githubUser],
  }),
}));

export const developer = onchainTable("developer", (t) => ({
  githubUser: t.text().primaryKey(),
}));

export const developerRelations = relations(developer, ({ many }) => ({
  skills: many(developerSkill),
  attestations: many(attestation),
}));


