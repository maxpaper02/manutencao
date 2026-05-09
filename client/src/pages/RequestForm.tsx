import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import LogoMaxpaper from "@/assets/Logo-Max-paper.png";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function RequestForm() {
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState<{
  sector: string;
  problemType: "" | "Elétrico" | "Automação" | "Mecânico" | "Pneumático" | "Limpeza" | "Segurança" | "Outro";
  description: string;
  priority: "" | "Baixa" | "Média" | "Alta" | "Crítica";
  requesterName: string;
}>({
  sector: "",
  problemType: "",
  description: "",
  priority: "",
  requesterName: "",
});
  const [submitted, setSubmitted] = useState<{
    emailSent: boolean;
  } | null>(null);

  const createOrderMutation = trpc.orders.create.useMutation({
    onSuccess: (result) => {
      if (result.emailSent === false) {
        toast.warning(result.message);
      } else {
        toast.success(result.message || "Solicitação enviada com sucesso!");
      }
      setSubmitted({
        emailSent: result.emailSent !== false,
      });
      
    },
    onError: (error) => {
  console.error("ERRO AO CRIAR SOLICITAÇÃO:", error);
  toast.error(`Erro ao enviar solicitação: ${error.message}`);
},
  });

  const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  if (!formData.sector) {
    toast.error("Selecione o equipamento.");
    return;
  }

  if (!formData.problemType) {
    toast.error("Selecione o tipo de problema.");
    return;
  }

  if (!formData.description.trim()) {
    toast.error("Descreva o problema.");
    return;
  }

  if (!formData.priority) {
    toast.error("Selecione o nível de urgência.");
    return;
  }

  if (!formData.requesterName.trim()) {
    toast.error("Informe o nome do solicitante.");
    return;
  }

  createOrderMutation.mutate({
    sector: formData.sector,
    problemType: formData.problemType,
    description: formData.description,
    priority: formData.priority,
    requesterName: formData.requesterName,
  });
};

  if (submitted) {
    return (
      <div className="bg-gradient-to-br from-[#1A3B2D] to-[#347055] border-slate-600 text-white overflow-hidden p-8 backdrop-blur-sm">
        
        <Card className="bg-slate-800/50 border-slate-700/50 max-w-md w-full p-8 text-center backdrop-blur-sm">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Sucesso!</h2>
          <p className="text-slate-300 mb-6">
            {submitted.emailSent
              ? "Sua solicitação foi enviada com sucesso. A equipe de manutenção será notificada imediatamente."
              : "Sua solicitação foi registrada, mas o e-mail de notificação não foi enviado. Avise a equipe de manutenção e peça para verificar as configurações de e-mail."}
          </p>
          <Button
            className="bg-[#2F5D50] hover:bg-[#264A40] text-white border-0"
            onClick={() => navigate("/")}
          >
            Voltar para Home
          </Button>
        </Card>
      </div>
    );
  }
const areaMaquinaOptions = [
  "Desbobinadeira",
  "Rebobinadeira",
  "Acumulador de Logs",
  "Cortadeira",
  "Empacotadeira",
  "Alçadeira",
  "Enfardadeira",
  "Tubeteira",
  "Talha Elétrica",
  "Empilhadeira",
  "Galpão - geral"
];
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4f8f4d] via-[#B4EDA6] to-[#D7FFCD]">
      {/* Header */}
      <header className="border-b border-slate-700/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-white hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>
        </div>
      </header>

{/* Logo no background - menor, canto inferior direito */}
              <div className="absolute bottom-6 right-6 pointer-events-none z-0">
                <img
                  src={LogoMaxpaper}
                  alt="Logo MaxPaper Fundo"
                  className="w-[220px] md:w-[280px] opacity-[0.12] select-none"
                />
              </div>

      {/* Main Content */}
      <main className="container max-w-4xl mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-3">Solicitação de Manutenção</h1>
            <p className="text-lg text-white">
              Preencha o formulário abaixo para solicitar manutenção.
            </p>
          </div>

          <Card className="bg-gradient-to-br from-[#1A3B2D] to-[#347055] border-slate-600 text-white overflow-hidden p-8 backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Setor/Máquina */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Equipamento:
                </label>
                
<Select
  value={formData.sector}
  onValueChange={(value) => setFormData({ ...formData, sector: value })}
>
  <SelectTrigger className="w-full bg-[#F4F7F2] border-[#A9C9A0] text-[#2F5D50] hover:bg-[#B6D9AD] hover:text-white">
    <SelectValue placeholder="Selecione o Equipamento" />
  </SelectTrigger>

  <SelectContent className="bg-white border border-[#A9C9A0] text-[#0D0D0D]">
    {areaMaquinaOptions.map((option) => (
      <SelectItem
        key={option}
        value={option}
        className="text-[#0D0D0D] data-[highlighted]:bg-[#1A3B2D] data-[highlighted]:text-white"
      >
        {option}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
              </div>

              {/* Tipo de Problema */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Tipo de Problema:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(["Elétrico", "Automação", "Mecânico", "Pneumático", "Limpeza", "Segurança", "Outro"] as const).map((problemType) => (
  <button
    key={problemType}
    type="button"
    onClick={() => setFormData({ ...formData, problemType })}
    className={`py-3 px-4 rounded-lg font-semibold transition-all border ${
  formData.problemType === problemType
    ? "bg-[#84AD79] text-white border-[#0A7307] shadow-md shadow-[#0A7307]/25"
    : "bg-white text-[#2F5D50] border-[#A9C9A0] hover:bg-[#B6D9AD]"
}`}
  >
    {problemType}
  </button>
))}
                </div>
               
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2 ">
                  Descrição Detalhada:
                </label>
                <Textarea
                  placeholder="Descreva o problema em detalhes. Inclua sintomas, quando começou e qualquer informação relevante."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={5}
                  className="bg-white border-[#A9C9A0] text-[#0D0D0D] placeholder:text-[#5B665F] focus-visible:ring-[#66A663] focus-visible:border-[#66A663]"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Mínimo 10 caracteres
                </p>
              </div>

              {/* Prioridade */}
              <div>
                <label className="block text-sm font-semibold text-white mb-3">
                  Nível de Urgência:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(["Baixa", "Média", "Alta", "Crítica"] as const).map((priority) => (
  <button
    key={priority}
    type="button"
    onClick={() => setFormData({ ...formData, priority })}
    className={`py-3 px-4 rounded-lg font-semibold transition-all border ${
      formData.priority === priority
        ? "bg-[#84AD79] text-white border-[#0A7307] shadow-md shadow-[#0A7307]/25"
        : "bg-white text-[#2F5D50] border-[#A9C9A0] hover:bg-[#B6D9AD]"
    }`}
  >
    {priority}
  </button>
))}
                </div>
              </div>

              {/* Nome do Solicitante */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2 ">
                  Nome do Solicitante:
                </label>
                <Input
                  placeholder="Informe seu nome"
                  value={formData.requesterName}
                  onChange={(e) => setFormData({ ...formData, requesterName: e.target.value })}
                  className="bg-white border-[#A9C9A0] text-[#0D0D0D] placeholder:text-[#5B665F] focus-visible:ring-[#66A663] focus-visible:border-[#66A663]"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
  type="submit"
  disabled={createOrderMutation.isPending}
  className="w-full bg-[#F21D2F] hover:bg-[#2F5D50] text-white border-0 shadow-md shadow-[#0D0D0D]/20 py-6 text-lg font-semibold"
>
  {createOrderMutation.isPending ? (
    <>
      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
      Enviando...
    </>
  ) : (
    "Enviar Solicitação"
  )}
</Button>
              </div>

              {/* Info Box */}
             
            </form>  
          </Card>
        </div>
      </main>
    </div>
  );
}
