import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock user for testing
const mockAdminUser = {
  id: 1,
  openId: "admin-user",
  email: "admin@example.com",
  name: "Admin User",
  loginMethod: "manus",
  role: "admin" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

function createMockContext(user?: typeof mockAdminUser): TrpcContext {
  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Service Orders Procedures", () => {
  describe("orders.create", () => {
    it("should create a new service order with valid input", async () => {
      const caller = appRouter.createCaller(createMockContext());

      const result = await caller.orders.create({
        sector: "Setor A - Máquina CNC-001",
        problemType: "Motor não liga",
        description: "O motor da máquina CNC não está ligando. Verificar conexões e alimentação.",
        priority: "Alta",
        requesterName: "João Silva",
      });

      expect(result).toHaveProperty("success", true);
      expect(result).toHaveProperty("message");
    });

    it("should reject order with empty sector", async () => {
      const caller = appRouter.createCaller(createMockContext());

      try {
        await caller.orders.create({
          sector: "",
          problemType: "Motor não liga",
          description: "O motor da máquina CNC não está ligando.",
          priority: "Alta",
          requesterName: "João Silva",
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).toContain("Setor/Máquina");
      }
    });

    it("should reject order with short description", async () => {
      const caller = appRouter.createCaller(createMockContext());

      try {
        await caller.orders.create({
          sector: "Setor A",
          problemType: "Problema",
          description: "Curto",
          priority: "Média",
          requesterName: "João",
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).toContain("Descrição");
      }
    });
  });

  describe("orders.list", () => {
    it("should require authentication", async () => {
      const caller = appRouter.createCaller(createMockContext(undefined));

      try {
        await caller.orders.list({});
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });

    it("should list orders for authenticated user", async () => {
      const caller = appRouter.createCaller(createMockContext(mockAdminUser));

      const result = await caller.orders.list({});

      expect(Array.isArray(result)).toBe(true);
    });

    it("should filter orders by status", async () => {
      const caller = appRouter.createCaller(createMockContext(mockAdminUser));

      const result = await caller.orders.list({ status: "Aberta" });

      expect(Array.isArray(result)).toBe(true);
      // All results should have status "Aberta"
      result.forEach((order) => {
        expect(order.status).toBe("Aberta");
      });
    });

    it("should filter orders by priority", async () => {
      const caller = appRouter.createCaller(createMockContext(mockAdminUser));

      const result = await caller.orders.list({ priority: "Crítica" });

      expect(Array.isArray(result)).toBe(true);
      // All results should have priority "Crítica"
      result.forEach((order) => {
        expect(order.priority).toBe("Crítica");
      });
    });
  });

  describe("orders.updateStatus", () => {
    it("should require authentication", async () => {
      const caller = appRouter.createCaller(createMockContext(undefined));

      try {
        await caller.orders.updateStatus({
          orderId: 1,
          newStatus: "Em Andamento",
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });

    it("should update order status with valid input", async () => {
      const caller = appRouter.createCaller(createMockContext(mockAdminUser));

      // First create an order
      await caller.orders.create({
        sector: "Setor B",
        problemType: "Vazamento",
        description: "Há um vazamento de óleo na máquina de produção.",
        priority: "Alta",
        requesterName: "Maria Santos",
      });

      // Then update its status
      const result = await caller.orders.updateStatus({
        orderId: 1,
        newStatus: "Em Andamento",
        notes: "Iniciando reparo",
      });

      expect(result).toHaveProperty("success", true);
    });
  });

  describe("orders.getHistory", () => {
    it("should require authentication", async () => {
      const caller = appRouter.createCaller(createMockContext(undefined));

      try {
        await caller.orders.getHistory({ orderId: 1 });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });

    it("should get history for an order", async () => {
      const caller = appRouter.createCaller(createMockContext(mockAdminUser));

      const result = await caller.orders.getHistory({ orderId: 1 });

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("orders.exportCsv", () => {
    it("should require authentication", async () => {
      const caller = appRouter.createCaller(createMockContext(undefined));

      try {
        await caller.orders.exportCsv({});
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });

    it("should export orders as CSV", async () => {
      const caller = appRouter.createCaller(createMockContext(mockAdminUser));

      const result = await caller.orders.exportCsv({});

      expect(result).toHaveProperty("csv");
      expect(result).toHaveProperty("filename");
      expect(result.csv).toContain("ID");
      expect(result.csv).toContain("Setor/Máquina");
      expect(result.filename).toContain("relatorio-manutencao");
    });

    it("should export with filters", async () => {
      const caller = appRouter.createCaller(createMockContext(mockAdminUser));

      const result = await caller.orders.exportCsv({
        status: "Aberta",
        priority: "Alta",
      });

      expect(result).toHaveProperty("csv");
      expect(result.csv).toContain("ID");
    });
  });
});
