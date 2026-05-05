type Priority = "Crítica" | "Alta" | "Média" | "Baixa";

type ServiceOrder = {
  id: string | number;
  equipment?: string;
  machine?: string;
  setor?: string;
  priority?: string;
  status?: string;
  dueDate?: string | Date | null;
  createdAt?: string | Date;
  description?: string;
};

const priorityRank: Record<Priority, number> = {
  "Crítica": 1,
  "Alta": 2,
  "Média": 3,
  "Baixa": 4,
};

function normalizeDateOnly(date: string | Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function normalizePriority(priority?: string): Priority | null {
  if (!priority) return null;

  const value = priority
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (value === "critica" || value === "crítica") return "Crítica";
  if (value === "alta") return "Alta";
  if (value === "media" || value === "média") return "Média";
  if (value === "baixa") return "Baixa";

  return null;
}

function isClosedStatus(status?: string) {
  if (!status) return false;

  const value = status
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return ["concluida", "concluido", "cancelada", "cancelado", "finalizada", "finalizado"].includes(value);
}

export function getDashboardUrgentOrders(orders: ServiceOrder[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return orders
    .map((order) => {
      const priority = normalizePriority(order.priority);

      if (!priority) return null;
      if (!order.dueDate) return null;
      if (isClosedStatus(order.status)) return null;

      const dueDate = normalizeDateOnly(order.dueDate);

      const isOverdue = dueDate < today;
      const isToday = dueDate.getTime() === today.getTime();

      if (!isOverdue && !isToday) return null;

      return {
        ...order,
        normalizedPriority: priority,
        urgencyType: isOverdue ? "Prazo vencido" : "Prazo no dia atual",
        urgencyRank: isOverdue ? 1 : 2,
        priorityRank: priorityRank[priority],
        normalizedDueDate: dueDate,
      };
    })
    .filter(Boolean)
    .sort((a: any, b: any) => {
      if (a.priorityRank !== b.priorityRank) {
        return a.priorityRank - b.priorityRank;
      }

      if (a.urgencyRank !== b.urgencyRank) {
        return a.urgencyRank - b.urgencyRank;
      }

      return a.normalizedDueDate.getTime() - b.normalizedDueDate.getTime();
    });
}