import { mysqlTable, int, varchar, text, timestamp, date, mysqlEnum } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Service orders table for maintenance requests.
 * Stores all maintenance service orders submitted through the public form.
 */
export const serviceOrders = mysqlTable("serviceOrders", {
  id: int("id").autoincrement().primaryKey(),
  sector: varchar("sector", { length: 255 }).notNull(), // Setor/Máquina
  problemType: varchar("problemType", { length: 255 }).notNull(), // Tipo de problema
  description: text("description").notNull(), // Descrição detalhada
  priority: mysqlEnum("priority", ["Baixa", "Média", "Alta", "Crítica"]).notNull(), // Prioridade
  status: mysqlEnum("status", ["Aberta", "Em Andamento", "Concluída"]).default("Aberta").notNull(), // Status
  requesterName: varchar("requesterName", { length: 255 }).notNull(), // Nome do solicitante
  photos: text("photos").default("[]"),
  assignedTo: int("assignedTo"), // ID do usuário responsável (FK para users)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  dueDate: date("dueDate"),
});

export type ServiceOrder = typeof serviceOrders.$inferSelect;
export type InsertServiceOrder = typeof serviceOrders.$inferInsert;

/**
 * Status history table for tracking all changes to service orders.
 * Records every status change with timestamp and responsible user.
 */
export const statusHistory = mysqlTable("statusHistory", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(), // FK para serviceOrders
  previousStatus: mysqlEnum("previousStatus", ["Aberta", "Em Andamento", "Concluída"]),
  newStatus: mysqlEnum("newStatus", ["Aberta", "Em Andamento", "Concluída"]).notNull(),
  changedBy: int("changedBy"), // ID do usuário que fez a alteração
  notes: text("notes"), // Notas adicionais sobre a alteração
  changedAt: timestamp("changedAt").defaultNow().notNull(),
});

export type StatusHistory = typeof statusHistory.$inferSelect;
export type InsertStatusHistory = typeof statusHistory.$inferInsert;
