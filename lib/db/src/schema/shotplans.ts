import { pgTable, serial, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const savedShotPlansTable = pgTable("saved_shot_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  deviceType: text("device_type").notNull(),
  brandModel: text("brand_model").notNull(),
  shootingSituation: text("shooting_situation").notNull(),
  purpose: text("purpose").notNull(),
  skillLevel: text("skill_level").notNull(),
  plan: jsonb("plan").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSavedShotPlanSchema = createInsertSchema(savedShotPlansTable).omit({ id: true, createdAt: true });
export type InsertSavedShotPlan = z.infer<typeof insertSavedShotPlanSchema>;
export type SavedShotPlan = typeof savedShotPlansTable.$inferSelect;
