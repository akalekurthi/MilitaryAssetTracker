import { pgTable, text, serial, integer, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["admin", "commander", "logistics"] }).notNull(),
  baseId: integer("base_id").references(() => bases.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bases = pgTable("bases", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  location: text("location").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  type: text("type", { enum: ["vehicles", "weapons", "ammunition", "equipment"] }).notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const stocks = pgTable("stocks", {
  id: serial("id").primaryKey(),
  baseId: integer("base_id").references(() => bases.id).notNull(),
  assetId: integer("asset_id").references(() => assets.id).notNull(),
  openingBalance: integer("opening_balance").default(0).notNull(),
  closingBalance: integer("closing_balance").default(0).notNull(),
  assigned: integer("assigned").default(0).notNull(),
  expended: integer("expended").default(0).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").references(() => assets.id).notNull(),
  baseId: integer("base_id").references(() => bases.id).notNull(),
  quantity: integer("quantity").notNull(),
  purchaseDate: timestamp("purchase_date").notNull(),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transfers = pgTable("transfers", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").references(() => assets.id).notNull(),
  fromBaseId: integer("from_base_id").references(() => bases.id).notNull(),
  toBaseId: integer("to_base_id").references(() => bases.id).notNull(),
  quantity: integer("quantity").notNull(),
  transferDate: timestamp("transfer_date").notNull(),
  initiatedBy: integer("initiated_by").references(() => users.id).notNull(),
  status: text("status", { enum: ["pending", "completed", "cancelled"] }).default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const assignments = pgTable("assignments", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").references(() => assets.id).notNull(),
  baseId: integer("base_id").references(() => bases.id).notNull(),
  assignedTo: text("assigned_to").notNull(),
  personnelId: text("personnel_id"),
  quantity: integer("quantity").notNull(),
  assignedDate: timestamp("assigned_date").notNull(),
  status: text("status", { enum: ["assigned", "expended"] }).default("assigned").notNull(),
  reason: text("reason"),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const logs = pgTable("logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  actionType: text("action_type", { enum: ["purchase", "transfer", "assignment", "login", "logout"] }).notNull(),
  resourceId: integer("resource_id"),
  oldData: jsonb("old_data"),
  newData: jsonb("new_data"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertBaseSchema = createInsertSchema(bases).omit({
  id: true,
  createdAt: true,
});

export const insertAssetSchema = createInsertSchema(assets).omit({
  id: true,
  createdAt: true,
});

export const insertPurchaseSchema = createInsertSchema(purchases).omit({
  id: true,
  createdAt: true,
});

export const insertTransferSchema = createInsertSchema(transfers).omit({
  id: true,
  createdAt: true,
});

export const insertAssignmentSchema = createInsertSchema(assignments).omit({
  id: true,
  createdAt: true,
});

export const insertLogSchema = createInsertSchema(logs).omit({
  id: true,
  timestamp: true,
});

// Login schema
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginSchema>;

export type Base = typeof bases.$inferSelect;
export type InsertBase = z.infer<typeof insertBaseSchema>;

export type Asset = typeof assets.$inferSelect;
export type InsertAsset = z.infer<typeof insertAssetSchema>;

export type Stock = typeof stocks.$inferSelect;

export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;

export type Transfer = typeof transfers.$inferSelect;
export type InsertTransfer = z.infer<typeof insertTransferSchema>;

export type Assignment = typeof assignments.$inferSelect;
export type InsertAssignment = z.infer<typeof insertAssignmentSchema>;

export type Log = typeof logs.$inferSelect;
export type InsertLog = z.infer<typeof insertLogSchema>;
