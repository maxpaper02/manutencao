import { useMemo, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { getDashboardUrgentOrders } from "@/lib/dashboardUrgency";

type Props = {
  orders: any[];
};

export function UrgentOrdersModal({ orders }: Props) {
  const [isOpen, setIsOpen] = useState(true);

  const urgentOrders = useMemo(() => {
    return getDashboardUrgentOrders(orders);
  }, [orders]);

  if (!isOpen) return null;
  if (!urgentOrders.length) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm">
      <div className="w-full max-w-4xl overflow-hidden rounded-2xl border border-[#A9C9A0] bg-[#F4F7F2] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#D7FFCD] bg-gradient-to-r from-[#1A3B2D] via-[#2F5D50] to-[#66A663] px-5 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-white/15 p-2">
              <AlertTriangle className="h-6 w-6" />
            </div>

            <div>
              <h2 className="text-lg font-bold">
                Pendências urgentes da manutenção
              </h2>
              <p className="text-sm text-white/85">
                Prioridade + prazo vencido ou vencendo hoje
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="rounded-full p-2 text-white hover:bg-white/15"
            aria-label="Fechar alerta"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-5">
          <div className="mb-4 rounded-xl border border-[#A9C9A0] bg-white px-4 py-3 text-sm text-[#1A3B2D]">
            Exibindo apenas solicitações com prazo vencido ou vencendo hoje.
            Itens sem prazo ou com prazo futuro ficam fora desta lista.
          </div>

          <div className="space-y-3">
            {urgentOrders.map((order: any) => {
              const isOverdue = order.urgencyType === "Prazo vencido";

              return (
                <div
                  key={order.id}
                  className="rounded-xl border border-[#D7FFCD] bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            order.normalizedPriority === "Crítica"
                              ? "bg-red-100 text-red-800"
                              : order.normalizedPriority === "Alta"
                              ? "bg-orange-100 text-orange-800"
                              : order.normalizedPriority === "Média"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          Prioridade: {order.normalizedPriority}
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            isOverdue
                              ? "bg-red-700 text-white"
                              : "bg-[#2F5D50] text-white"
                          }`}
                        >
                          {order.urgencyType}
                        </span>
                      </div>

                      <h3 className="font-semibold text-[#1A3B2D]">
                        {order.equipment || order.machine || "Equipamento não informado"}
                      </h3>

                      <p className="mt-1 text-sm text-[#2F5D50]">
                        {order.setor ? `Setor: ${order.setor}` : "Setor não informado"}
                      </p>

                      {order.description && (
                        <p className="mt-2 text-sm text-gray-700">
                          {order.description}
                        </p>
                      )}
                    </div>

                    <div className="rounded-xl bg-[#F4F7F2] px-4 py-3 text-sm text-[#1A3B2D] md:text-right">
                      <p className="font-semibold">Prazo</p>
                      <p>
                        {new Date(order.dueDate).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex justify-end">
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-xl bg-[#2F5D50] px-5 py-2 font-semibold text-white transition hover:bg-[#1A3B2D]"
            >
              Entendi, abrir dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}