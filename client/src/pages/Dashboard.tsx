import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  LogOut,
  Download,
  Search,
  Clock,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

const PRIORITY_COLORS = {
  Baixa: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Média: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  Alta: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  Crítica: "bg-red-500/20 text-red-300 border-red-500/30",
};

const STATUS_ICONS = {
  Aberta: <AlertCircle className="w-4 h-4" />,
  "Em Andamento": <Clock className="w-4 h-4" />,
  Concluída: <CheckCircle2 className="w-4 h-4" />,
};

const STATUS_COLORS = {
  Aberta: "bg-slate-500/20 text-slate-300 border-slate-500/30",
  "Em Andamento": "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Concluída: "bg-green-500/20 text-green-300 border-green-500/30",
};

type OrderStatus = "Aberta" | "Em Andamento" | "Concluída";

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { user, logout, isAuthenticated, loading } = useAuth();

  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    search: "",
  });

  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus | "">("");
  const [notes, setNotes] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([]);

  if (!loading && !isAuthenticated) {
    navigate("/login");
    return null;
  }

  const {
    data: orders = [],
    isLoading: ordersLoading,
    refetch,
  } = trpc.orders.list.useQuery(
    filters.status || filters.priority || filters.search ? filters : {}
  );

  const { data: history = [], isLoading: historyLoading } =
    trpc.orders.getHistory.useQuery(
      { orderId: selectedOrder?.id || 0 },
      { enabled: !!selectedOrder?.id && showHistoryDialog }
    );

  const updateStatusMutation = trpc.orders.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado com sucesso!");
      setShowStatusDialog(false);
      setSelectedOrder(null);
      setNewStatus("");
      setNotes("");
      setDueDate("");
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar status");
    },
  });

  const deleteOrderMutation = trpc.orders.delete.useMutation({
    onSuccess: () => {
      toast.success("Solicitação excluída com sucesso!");
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao excluir solicitação");
    },
  });

  const deleteMultipleOrdersMutation = trpc.orders.deleteMany.useMutation({
    onSuccess: () => {
      toast.success("Solicitações excluídas com sucesso!");
      setSelectedOrderIds([]);
      refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao excluir solicitações");
    },
  });

  const exportCsvMutation = trpc.orders.exportCsv.useMutation({
    onSuccess: (data: any) => {
      const element = document.createElement("a");
      element.setAttribute(
        "href",
        "data:text/csv;charset=utf-8," + encodeURIComponent(data.csv)
      );
      element.setAttribute("download", data.filename);
      element.style.display = "none";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success("Relatório exportado com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao exportar relatório");
    },
  });

  const filteredOrders = useMemo(() => {
    return orders;
  }, [orders]);

  const formatDateOnly = (value: string | Date | null | undefined) => {
    if (!value) return "Sem prazo";

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "Sem prazo";

    return date.toLocaleDateString("pt-BR");
  };

  const formatCreatedAt = (value: string | Date | null | undefined) => {
    if (!value) return "-";

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleDateString("pt-BR");
  };

  const handleUpdateStatus = () => {
    if (!selectedOrder || !newStatus) {
      toast.error("Selecione um novo status");
      return;
    }

    updateStatusMutation.mutate({
      orderId: selectedOrder.id,
      newStatus,
      notes: notes || undefined,
      dueDate: dueDate || undefined,
    });
  };

  const handleDeleteOrder = (orderId: number) => {
    const confirmed = window.confirm(
      "Tem certeza que deseja excluir esta solicitação?"
    );
    if (!confirmed) return;

    deleteOrderMutation.mutate({ orderId });
  };

  const handleDeleteSelectedOrders = () => {
    if (selectedOrderIds.length === 0) {
      toast.error("Selecione pelo menos uma solicitação.");
      return;
    }

    const confirmed = window.confirm(
      `Tem certeza que deseja excluir ${selectedOrderIds.length} solicitação(ões)?`
    );
    if (!confirmed) return;

    deleteMultipleOrdersMutation.mutate({
      orderIds: selectedOrderIds,
    });
  };

  const handleToggleOrderSelection = (orderId: number) => {
    setSelectedOrderIds((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleToggleAllOrders = () => {
    if (
      filteredOrders.length > 0 &&
      selectedOrderIds.length === filteredOrders.length
    ) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(filteredOrders.map((order: any) => order.id));
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4f8f4d] via-[#B4EDA6] to-[#D7FFCD]">
      <header className="border-b border-slate-700/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Painel de Controle</h1>
            <p className="text-sm text-white">Bem-vindo, {user?.name}</p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="border-[#2F5D50] text-[#2F5D50] bg-white/70 hover:bg-[#2F5D50] hover:text-white"
              onClick={() =>
                exportCsvMutation.mutate(
                  filters.status || filters.priority
                    ? { status: filters.status, priority: filters.priority }
                    : {}
                )
              }
              disabled={exportCsvMutation.isPending}
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="border-[#2F5D50] text-[#2F5D50] bg-white/70 hover:bg-[#2F5D50] hover:text-white"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-4 py-8">
        <Card className="bg-gradient-to-br from-[#1A3B2D] to-[#347055] border-slate-600 text-white overflow-hidden p-8 backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-white" />
              <Input
                placeholder="Buscar por setor, descrição..."
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="bg-white border-[#A9C9A0] text-[#0D0D0D] placeholder:text-[#5B665F] focus-visible:ring-[#66A663] focus-visible:border-[#66A663]"
              />
            </div>

            <Select
              value={filters.status || "all"}
              onValueChange={(value) =>
                setFilters({ ...filters, status: value === "all" ? "" : value })
              }
            >
              <SelectTrigger className="border-[#A9C9A0] text-[#2F5D50] bg-[#F4F7F2] hover:bg-[#1A3B2D] hover:text-white">
                <SelectValue placeholder="Filtrar por Status" />
              </SelectTrigger>

              <SelectContent className="bg-white border border-slate-200 text-slate-900">
                <SelectItem
                  value="all"
                  className="text-slate-900 data-[highlighted]:bg-[#1A3B2D] data-[highlighted]:text-white"
                >
                  Todos os Status
                </SelectItem>
                <SelectItem
                  value="Aberta"
                  className="text-slate-900 data-[highlighted]:bg-[#1A3B2D] data-[highlighted]:text-white"
                >
                  Aberta
                </SelectItem>
                <SelectItem
                  value="Em Andamento"
                  className="text-slate-900 data-[highlighted]:bg-[#1A3B2D] data-[highlighted]:text-white"
                >
                  Em Andamento
                </SelectItem>
                <SelectItem
                  value="Concluída"
                  className="text-slate-900 data-[highlighted]:bg-[#1A3B2D] data-[highlighted]:text-white"
                >
                  Concluída
                </SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.priority || "all"}
              onValueChange={(value) =>
                setFilters({
                  ...filters,
                  priority: value === "all" ? "" : value,
                })
              }
            >
              <SelectTrigger className="border-[#A9C9A0] text-[#2F5D50] bg-[#F4F7F2] hover:bg-[#1A3B2D] hover:text-white">
                <SelectValue placeholder="Filtrar por Prioridade" />
              </SelectTrigger>

              <SelectContent className="bg-white border border-slate-200 text-slate-900">
                <SelectItem
                  value="all"
                  className="text-slate-900 data-[highlighted]:bg-[#1A3B2D] data-[highlighted]:text-white"
                >
                  Todas as Prioridades
                </SelectItem>
                <SelectItem
                  value="Baixa"
                  className="text-slate-900 data-[highlighted]:bg-[#1A3B2D] data-[highlighted]:text-white"
                >
                  Baixa
                </SelectItem>
                <SelectItem
                  value="Média"
                  className="text-slate-900 data-[highlighted]:bg-[#1A3B2D] data-[highlighted]:text-white"
                >
                  Média
                </SelectItem>
                <SelectItem
                  value="Alta"
                  className="text-slate-900 data-[highlighted]:bg-[#1A3B2D] data-[highlighted]:text-white"
                >
                  Alta
                </SelectItem>
                <SelectItem
                  value="Crítica"
                  className="text-slate-900 data-[highlighted]:bg-[#1A3B2D] data-[highlighted]:text-white"
                >
                  Crítica
                </SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              className="border-[#A9C9A0] text-[#2F5D50] bg-[#F4F7F2] hover:bg-[#1A3B2D] hover:text-white"
              onClick={() => setFilters({ status: "", priority: "", search: "" })}
            >
              Limpar Filtros
            </Button>
          </div>
        </Card>

        <div className="flex justify-end mt-4 mb-4">
          <Button
            variant="outline"
            className="border-[#F28D95] text-[#F21D2F] bg-white/80 hover:bg-[#F21D2F] hover:text-white"
            onClick={handleDeleteSelectedOrders}
            disabled={
              selectedOrderIds.length === 0 ||
              deleteMultipleOrdersMutation.isPending
            }
          >
            Excluir selecionadas ({selectedOrderIds.length})
          </Button>
        </div>

        <div className="hidden md:block">
          <Card className="bg-gradient-to-br from-[#1A3B2D] to-[#347055] border-slate-600 text-white overflow-hidden backdrop-blur-sm">
            {ordersLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400">Nenhuma ordem encontrada</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700/50 bg-[#1B3D2F]">
                      <th className="px-4 py-4 text-left">
                        <input
                          type="checkbox"
                          checked={
                            filteredOrders.length > 0 &&
                            selectedOrderIds.length === filteredOrders.length
                          }
                          onChange={handleToggleAllOrders}
                          className="w-4 h-4 accent-[#2F5D50]"
                        />
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                        ID
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                        Setor/Máquina
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                        Problema
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                        Prioridade
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                        Solicitante
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                        Data
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                        Prazo
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                        Ações
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredOrders.map((order: any) => (
                      <tr
                        key={order.id}
                        className="border-b border-slate-700/30 hover:bg-[#1A3B2D] transition-colors"
                      >
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selectedOrderIds.includes(order.id)}
                            onChange={() => handleToggleOrderSelection(order.id)}
                            className="w-4 h-4 accent-[#2F5D50]"
                          />
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-300">
                          #{order.id}
                        </td>
                        <td className="px-6 py-4 text-sm text-white font-medium">
                          {order.sector}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-300 max-w-xs truncate">
                          {order.problemType}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <Badge
                            variant="outline"
                            className={
                              PRIORITY_COLORS[
                                order.priority as keyof typeof PRIORITY_COLORS
                              ]
                            }
                          >
                            {order.priority}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <Badge
                            variant="outline"
                            className={`${
                              STATUS_COLORS[
                                order.status as keyof typeof STATUS_COLORS
                              ]
                            } flex items-center gap-1 w-fit`}
                          >
                            {
                              STATUS_ICONS[
                                order.status as keyof typeof STATUS_ICONS
                              ]
                            }
                            {order.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-300">
                          {order.requesterName}
                        </td>
                        <td className="px-6 py-4 text-sm text-white">
                          {formatCreatedAt(order.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-sm text-white">
                          {formatDateOnly(order.dueDate)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-[#D5FFCD] hover:bg-[#347055]"
                              onClick={() => {
                                setSelectedOrder(order);
                                setNewStatus(order.status as OrderStatus);
                                setNotes("");
                                setDueDate(
                                  order?.dueDate
                                    ? new Date(order.dueDate).toISOString().slice(0, 10)
                                    : ""
                                );
                                setShowStatusDialog(true);
                              }}
                            >
                              Atualizar
                            </Button>

                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-[#D5FFCD] hover:bg-[#347055]"
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowHistoryDialog(true);
                              }}
                            >
                              Histórico
                            </Button>

                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-[#F28D95] hover:bg-[#F21D2F]/10 hover:text-[#F21D2F]"
                              onClick={() => handleDeleteOrder(order.id)}
                              disabled={deleteOrderMutation.isPending}
                            >
                              Excluir
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        <div className="md:hidden space-y-4">
          {ordersLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400">Nenhuma ordem encontrada</p>
            </div>
          ) : (
            filteredOrders.map((order: any) => (
              <Card
                key={order.id}
                className="bg-slate-800/50 border-slate-700/50 p-4 backdrop-blur-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-slate-400">Ordem #{order.id}</p>
                      <p className="font-semibold text-white text-sm">
                        {order.sector}
                      </p>
                    </div>

                    <Badge
                      variant="outline"
                      className={`${
                        STATUS_COLORS[order.status as keyof typeof STATUS_COLORS]
                      } flex items-center gap-1 flex-shrink-0`}
                    >
                      {STATUS_ICONS[order.status as keyof typeof STATUS_ICONS]}
                      <span className="text-xs">{order.status}</span>
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-300">{order.problemType}</p>

                  <div className="flex items-center justify-between gap-2">
                    <Badge
                      variant="outline"
                      className={`${
                        PRIORITY_COLORS[
                          order.priority as keyof typeof PRIORITY_COLORS
                        ]
                      } text-xs`}
                    >
                      {order.priority}
                    </Badge>

                    <span className="text-xs text-slate-400">
                      {formatCreatedAt(order.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400">
                    Solicitante: {order.requesterName}
                  </p>

                  <p className="text-xs text-slate-400">
                    Prazo: {formatDateOnly(order.dueDate)}
                  </p>

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="flex-1 text-[#D5FFCD] hover:bg-[#347055] text-xs h-8"
                      onClick={() => {
                        setSelectedOrder(order);
                        setNewStatus(order.status as OrderStatus);
                        setNotes("");
                        setDueDate(
                          order?.dueDate
                            ? new Date(order.dueDate).toISOString().slice(0, 10)
                            : ""
                        );
                        setShowStatusDialog(true);
                      }}
                    >
                      Atualizar
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="flex-1 text-slate-300 hover:bg-slate-700/50 text-xs h-8"
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowHistoryDialog(true);
                      }}
                    >
                      Histórico
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      className="flex-1 text-[#F28D95] hover:bg-[#F21D2F]/10 hover:text-[#F21D2F] text-xs h-8"
                      onClick={() => handleDeleteOrder(order.id)}
                      disabled={deleteOrderMutation.isPending}
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>

      {/* Modal Atualizar Status */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="bg-[#1F4D3A] border border-[#A9C9A0] shadow-2xl shadow-[#0D0D0D]/25">
          <DialogHeader>
            <DialogTitle className="text-[#FFFFFF]">
              Status -{" "}
              {selectedOrder?.sector ||
                selectedOrder?.sectorMachine ||
                "Sem identificação"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-[#2F5D50] border border-[#A9C9A0]/40 rounded-lg p-4 space-y-3">
              <h3 className="text-sm font-bold text-[#D7FFCD] uppercase tracking-wide">
                Solicitação
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-semibold text-[#D7E8D1]">Setor / Máquina:</span>
                  <p className="text-white">
                    {selectedOrder?.sector || "Não informado"}
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-[#D7E8D1]">Tipo de problema:</span>
                  <p className="text-white">
                    {selectedOrder?.problemType || "Não informado"}
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-[#D7E8D1]">Prioridade:</span>
                  <p className="text-white">
                    {selectedOrder?.priority || "Não informado"}
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-[#D7E8D1]">Solicitante:</span>
                  <p className="text-white">
                    {selectedOrder?.requesterName || "Não informado"}
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-[#D7E8D1]">Data de abertura:</span>
                  <p className="text-white">
                    {formatCreatedAt(selectedOrder?.createdAt)}
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-[#D7E8D1]">Prazo de conclusão:</span>
                  <p className="text-white">
                    {formatDateOnly(selectedOrder?.dueDate)}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <span className="font-semibold text-[#D7E8D1]">Descrição detalhada:</span>
                  <p className="text-white whitespace-pre-wrap break-words">
                    {selectedOrder?.description || "Não informado"}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Status Atual:{" "}
                <span className="text-[#D7FFCD]">{selectedOrder?.status}</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Novo Status *
              </label>

              <Select
                value={newStatus}
                onValueChange={(value) => setNewStatus(value as OrderStatus)}
              >
                <SelectTrigger className="w-[180px] bg-[#F4F7F2] border-[#A9C9A0] text-[#2F5D50] hover:bg-[#EAF3E4]">
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>

                <SelectContent className="bg-white border border-[#A9C9A0] text-[#0D0D0D]">
                  <SelectItem
                    value="Aberta"
                    className="text-[#0D0D0D] data-[highlighted]:bg-[#2F5D50] data-[highlighted]:text-white"
                  >
                    Aberta
                  </SelectItem>
                  <SelectItem
                    value="Em Andamento"
                    className="text-[#0D0D0D] data-[highlighted]:bg-[#2F5D50] data-[highlighted]:text-white"
                  >
                    Em Andamento
                  </SelectItem>
                  <SelectItem
                    value="Concluída"
                    className="text-[#0D0D0D] data-[highlighted]:bg-[#2F5D50] data-[highlighted]:text-white"
                  >
                    Concluída
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Prazo de conclusão
              </label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-[#F4F7F2] border-[#A9C9A0] text-[#0D0D0D] focus-visible:ring-[#66A663] focus-visible:border-[#66A663]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Notas (opcional)
              </label>
              <Textarea
                placeholder="Adicione notas sobre esta alteração..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="bg-[#F4F7F2] border-[#A9C9A0] text-[#0D0D0D] placeholder:text-[#5B665F] focus-visible:ring-[#66A663] focus-visible:border-[#66A663] resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              className="border-[#A9C9A0] text-[#2F5D50] bg-[#F4F7F2] hover:bg-[#DCEAD5]"
              onClick={() => setShowStatusDialog(false)}
            >
              Cancelar
            </Button>

            <Button
              className="bg-[#2F5D50] hover:bg-[#264A40] text-white border-0"
              onClick={handleUpdateStatus}
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Atualizando...
                </>
              ) : (
                "Atualizar Status"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Histórico */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="bg-[#1F4D3A] border border-[#A9C9A0] shadow-2xl shadow-[#0D0D0D]/25 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#FFFFFF]">
              Histórico -{" "}
              {selectedOrder?.sector ||
                selectedOrder?.sectorMachine ||
                "Sem identificação"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="bg-[#2F5D50] border border-[#A9C9A0]/40 rounded-lg p-4 space-y-3">
              <h3 className="text-sm font-bold text-[#D7FFCD] uppercase tracking-wide">
                Solicitação
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-semibold text-[#D7E8D1]">Setor / Máquina:</span>
                  <p className="text-white">
                    {selectedOrder?.sector || "Não informado"}
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-[#D7E8D1]">Tipo de problema:</span>
                  <p className="text-white">
                    {selectedOrder?.problemType || "Não informado"}
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-[#D7E8D1]">Prioridade:</span>
                  <p className="text-white">
                    {selectedOrder?.priority || "Não informado"}
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-[#D7E8D1]">Solicitante:</span>
                  <p className="text-white">
                    {selectedOrder?.requesterName || "Não informado"}
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-[#D7E8D1]">Data de abertura:</span>
                  <p className="text-white">
                    {formatCreatedAt(selectedOrder?.createdAt)}
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-[#D7E8D1]">Prazo de conclusão:</span>
                  <p className="text-white">
                    {formatDateOnly(selectedOrder?.dueDate)}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <span className="font-semibold text-[#D7E8D1]">Descrição detalhada:</span>
                  <p className="text-white whitespace-pre-wrap break-words">
                    {selectedOrder?.description || "Não informado"}
                  </p>
                </div>
              </div>
            </div>

            {historyLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 text-[#D7FFCD] animate-spin" />
              </div>
            ) : history.length === 0 ? (
              <p className="text-[#D7E8D1] text-center py-8">
                Nenhuma alteração registrada
              </p>
            ) : (
              history.map((entry: any, idx: number) => (
                <div
                  key={idx}
                  className="bg-[#2F5D50] border border-[#A9C9A0]/40 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2 gap-3">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="bg-[#F4F7F2] text-[#2F5D50] border-[#A9C9A0]"
                      >
                        {entry.previousStatus || "Inicial"} → {entry.newStatus}
                      </Badge>
                    </div>

                    <span className="text-xs text-[#D7E8D1] whitespace-nowrap">
                      {new Date(entry.changedAt).toLocaleString("pt-BR")}
                    </span>
                  </div>

                  {entry.notes && (
                    <p className="text-sm text-[#FFFFFF] mt-2">
                      <span className="font-semibold text-[#D7FFCD]">Notas:</span>{" "}
                      {entry.notes}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>

          <DialogFooter>
            <Button
              className="bg-[#F4F7F2] hover:bg-[#DCEAD5] text-[#2F5D50] border border-[#A9C9A0]"
              onClick={() => setShowHistoryDialog(false)}
            >
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}