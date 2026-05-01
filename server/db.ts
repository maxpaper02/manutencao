import { eq, desc, and, or, gte, lte, like, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  serviceOrders,
  statusHistory,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };

    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;

      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }

    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ Service Orders Queries ============

export async function createServiceOrder(data: {
  sector: string;
  problemType: string;
  description: string;
  priority: "Baixa" | "Média" | "Alta" | "Crítica";
  requesterName: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(serviceOrders).values({
    ...data,
    status: "Aberta",
  });

  return result;
}

export async function getServiceOrders(filters?: {
  status?: string;
  priority?: string;
  search?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const conditions = [];

  if (filters?.status) {
    conditions.push(eq(serviceOrders.status, filters.status as any));
  }

  if (filters?.priority) {
    conditions.push(eq(serviceOrders.priority, filters.priority as any));
  }

  if (filters?.search) {
    conditions.push(
      or(
        like(serviceOrders.sector, `%${filters.search}%`),
        like(serviceOrders.description, `%${filters.search}%`),
        like(serviceOrders.requesterName, `%${filters.search}%`)
      )
    );
  }

  const query = db.select().from(serviceOrders);

  if (conditions.length > 0) {
    return await query.where(and(...conditions)).orderBy(desc(serviceOrders.createdAt));
  }

  return await query.orderBy(desc(serviceOrders.createdAt));
}

export async function getServiceOrderById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(serviceOrders)
    .where(eq(serviceOrders.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateServiceOrderStatus(
  orderId: number,
  newStatus: string,
  changedBy?: number,
  notes?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const order = await getServiceOrderById(orderId);
  if (!order) throw new Error("Order not found");

  await db
    .update(serviceOrders)
    .set({ status: newStatus as any })
    .where(eq(serviceOrders.id, orderId));

  await db.insert(statusHistory).values({
    orderId,
    previousStatus: order.status as any,
    newStatus: newStatus as any,
    changedBy,
    notes,
  });

  return { success: true };
}

export async function getStatusHistory(orderId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(statusHistory)
    .where(eq(statusHistory.orderId, orderId))
    .orderBy(desc(statusHistory.changedAt));
}

export async function deleteServiceOrder(orderId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(statusHistory).where(eq(statusHistory.orderId, orderId));
  await db.delete(serviceOrders).where(eq(serviceOrders.id, orderId));

  return { success: true };
}

export async function deleteManyServiceOrders(orderIds: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(statusHistory).where(inArray(statusHistory.orderId, orderIds));
  await db.delete(serviceOrders).where(inArray(serviceOrders.id, orderIds));

  return { success: true };
}

export async function getServiceOrdersForExport(filters?: {
  status?: string;
  priority?: string;
  startDate?: Date;
  endDate?: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const conditions = [];

  if (filters?.status) {
    conditions.push(eq(serviceOrders.status, filters.status as any));
  }

  if (filters?.priority) {
    conditions.push(eq(serviceOrders.priority, filters.priority as any));
  }

  if (filters?.startDate) {
    conditions.push(gte(serviceOrders.createdAt, filters.startDate));
  }

  if (filters?.endDate) {
    conditions.push(lte(serviceOrders.createdAt, filters.endDate));
  }

  const query = db.select().from(serviceOrders);

  if (conditions.length > 0) {
    return await query.where(and(...conditions)).orderBy(desc(serviceOrders.createdAt));
  }

  return await query.orderBy(desc(serviceOrders.createdAt));
}