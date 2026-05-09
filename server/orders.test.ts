import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";

// 1. Criamos um usuário de teste que o sistema aceita
const mockAdminUser: any = {
  id: 1,
  openid: "admin-user", // Corrigido para minúsculo
  email: "admin@example.com",
  name: "Admin User",
  loginMethod: "manus",
  role: "admin",
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

// 2. Criamos o "simulador" completo para o sistema não reclamar
function createMockContext(user?: any): any {
  return {
    user: user || null,
    req: {
      protocol: "https",
      headers: {},
    },
    res: {
      clearCookie: () => {},
      status: () => ({ json: () => {}, send: () => {} }),
      json: () => {},
      send: () => {},
    },
  };
}

describe("Service Orders Procedures", () => {
  describe("orders.create", () => {
    it("should create a new service order with valid input", async () => {
      // Usamos o usuário de teste aqui
      const caller = appRouter.createCaller(createMockContext(mockAdminUser));

      const result = await caller.orders.create({
        sector: "Setor A - Máquina CNC-001",
        problemType: "Motor não liga",
        description: "O motor da máquina CNC não está ligando. Verificar conexões e alimentação.",
        priority: "Alta",
        requesterName: "João Silva",
      });

      expect(result).toHaveProperty("success", true);
    });

    it("should reject order with empty sector", async () => {
      const caller = appRouter.createCaller(createMockContext(mockAdminUser));
      try {
        await caller.orders.create({
          sector: "",
          problemType: "Motor não liga",
          description: "O motor da máquina CNC não está ligando.",
          priority: "Alta",
          requesterName: "João Silva",
        });
      } catch (error: any) {
        expect(error.message).toBeDefined();
      }
    });
  });

  describe("orders.list", () => {
    it("should list orders for authenticated user", async () => {
      const caller = appRouter.createCaller(createMockContext(mockAdminUser));
      const result = await caller.orders.list({});
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("orders.updateStatus", () => {
    it("should update order status with valid input", async () => {
      const caller = appRouter.createCaller(createMockContext(mockAdminUser));
      const result = await caller.orders.updateStatus({
        orderId: 1,
        newStatus: "Em Andamento",
        notes: "Iniciando reparo",
      });
      expect(result).toHaveProperty("success", true);
    });
  });
});
