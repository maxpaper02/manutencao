import { TRPCError } from "@trpc/server";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { sendNewOrderEmail } from "./email";

export const appRouter = router({
  system: systemRouter,

  auth: router({
  me: publicProcedure.query((opts) => opts.ctx.user),

  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);

    ctx.res.clearCookie(COOKIE_NAME, {
      ...cookieOptions,
      maxAge: -1,
    });

    ctx.res.clearCookie("admin_session", {
      httpOnly: true,
      maxAge: -1,
      sameSite: "lax",
    });

    return {
      success: true,
    } as const;
  }),

  login: publicProcedure
    .input(
      z.object({
        username: z.string(),
        password: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const users = [
        {
          username: process.env.ADMIN_USER,
          password: process.env.ADMIN_PASS,
        },
        {
          username: process.env.ADMIN_USER_2,
          password: process.env.ADMIN_PASS_2,
        },
        {
          username: process.env.ADMIN_USER_3,
          password: process.env.ADMIN_PASS_3,
        },
      ].filter(
        (user) =>
          typeof user.username === "string" &&
          typeof user.password === "string"
      );

      const matchedUser = users.find(
        (user) =>
          user.username === input.username && user.password === input.password
      );

      console.log("LOGIN INPUT:", input.username);
      console.log(
        "LOGIN USERS:",
        users.map((u) => u.username)
      );
      console.log("LOGIN MATCH:", matchedUser?.username ?? "nenhum");

      if (!matchedUser) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Usuário ou senha inválidos",
        });
      }

      ctx.res.cookie("admin_session", "authenticated", {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 8,
        sameSite: "lax",
      });

      return { success: true };
    }),
}),

  orders: router({
    delete: publicProcedure
      .input(
        z.object({
          orderId: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        try {
          await db.deleteServiceOrder(input.orderId);
          return { success: true };
        } catch (error) {
          console.error("Error deleting service order:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao excluir solicitação",
          });
        }
      }),

    deleteMany: publicProcedure
      .input(
        z.object({
          orderIds: z.array(z.number()).min(1),
        })
      )
      .mutation(async ({ input }) => {
        try {
          await db.deleteManyServiceOrders(input.orderIds);
          return { success: true };
        } catch (error) {
          console.error("Error deleting multiple service orders:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao excluir solicitações",
          });
        }
      }),

    create: publicProcedure
      .input(
        z.object({
          sector: z.string().min(1, "Setor/Máquina é obrigatório"),
          problemType: z.string().min(1, "Tipo de problema é obrigatório"),
          description: z
            .string()
            .min(10, "Descrição deve ter pelo menos 10 caracteres"),
          priority: z.enum(["Baixa", "Média", "Alta", "Crítica"]),
          requesterName: z.string().min(1, "Nome do solicitante é obrigatório"),
        })
      )
      .mutation(async ({ input }) => {
        try {
          await db.createServiceOrder(input);

try {
  await sendNewOrderEmail(input);
} catch (emailError) {
  console.error("Erro ao enviar e-mail da solicitação:", emailError);
}

return {
  success: true,
  message: "Solicitação enviada com sucesso!",
};
        } catch (error) {
          console.error("Error creating service order:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao criar solicitação",
          });
        }
      }),

    list: publicProcedure
      .input(
        z
          .object({
            status: z.string().optional(),
            priority: z.string().optional(),
            search: z.string().optional(),
          })
          .optional()
      )
      .query(async ({ input }) => {
        try {
          const orders = await db.getServiceOrders(input);
          return orders;
        } catch (error) {
          console.error("Error fetching orders:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao buscar ordens",
          });
        }
      }),

    getById: publicProcedure
      .input(
        z.object({
          id: z.number(),
        })
      )
      .query(async ({ input }) => {
        try {
          const order = await db.getServiceOrderById(input.id);

          if (!order) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Ordem não encontrada",
            });
          }

          return order;
        } catch (error) {
          if (error instanceof TRPCError) throw error;

          console.error("Error fetching order:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao buscar ordem",
          });
        }
      }),

    updateStatus: publicProcedure
  .input(
    z.object({
      orderId: z.number(),
      newStatus: z.enum(["Aberta", "Em Andamento", "Concluída"]),
      notes: z.string().optional(),
      dueDate: z.string().optional(),
    })
  )
      .mutation(async ({ input, ctx }) => {
        try {
          await db.updateServiceOrderStatus(
  input.orderId,
  input.newStatus,
  ctx.user?.id,
  input.notes,
  input.dueDate
);

          return {
            success: true,
            message: "Status atualizado com sucesso!",
          };
        } catch (error) {
          console.error("Error updating order status:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao atualizar status",
          });
        }
      }),

    getHistory: publicProcedure
      .input(
        z.object({
          orderId: z.number().min(1),
        })
      )
      .query(async ({ input }) => {
        try {
          const history = await db.getStatusHistory(input.orderId);
          return history;
        } catch (error) {
          console.error("Error fetching history:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao buscar histórico",
          });
        }
      }),

    exportCsv: publicProcedure
      .input(
        z
          .object({
            status: z.string().optional(),
            priority: z.string().optional(),
            startDate: z.date().optional(),
            endDate: z.date().optional(),
          })
          .optional()
      )
      .mutation(async ({ input }) => {
        try {
          const orders = await db.getServiceOrdersForExport(input);

          const headers = [
            "ID",
            "Setor/Máquina",
            "Tipo de Problema",
            "Descrição",
            "Prioridade",
            "Status",
            "Solicitante",
            "Data Criação",
          ];

          const rows = orders.map((order) => [
            order.id,
            order.sector,
            order.problemType,
            order.description.replace(/"/g, '""'),
            order.priority,
            order.status,
            order.requesterName,
            order.createdAt.toISOString().split("T")[0],
          ]);

          const csv = [
            headers.join(","),
            ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
          ].join("\n");

          return {
            csv,
            filename: `relatorio-manutencao-${new Date()
              .toISOString()
              .split("T")[0]}.csv`,
          };
        } catch (error) {
          console.error("Error exporting CSV:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Erro ao exportar relatório",
          });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;