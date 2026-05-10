import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { ArrowRight, Wrench, BarChart3, Lock } from "lucide-react";
import logoMaxpaper from "@/assets/Logo-Max-paper.png";
import { useLocation } from "wouter";

export default function Home() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();

  return (
<div className="relative min-h-screen overflow-hidden bg-gradient-to-r from-[#66A663] to-[#CFE8C6]">
    
    {/* LOGO GRANDE NO FUNDO */}
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
      <img
        src={logoMaxpaper}
        alt="Logo MaxPaper"
        className="w-[70%] max-w-[400px] opacity-[0.12] select-none"
      />
    </div>

    {/* CONTEÚDO DA PÁGINA */}
    <div className="relative z-10">
      
      {/* Header */}
      <header className="border-b border-[#2F5D50]/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoMaxpaper} alt="MaxPaper" className="h-16 w-auto mb-5 object-contain brightness-0 invert" />
            <span className="text-2xl font-bold text-white">MaxPaper Manutenção</span>
          </div>

          <nav className="flex items-center gap-4">
            <Button
              variant="outline"
              className="border-[#2F5D50] text-[#2F5D50] bg-[#F4F7F2] hover:bg-[#1A3B2D] hover:text-white"
              onClick={() => navigate("/login")}
            >
              Login
            </Button>
          </nav>
        </div>
      </header>


      {/* Hero Section */}
      <main className="container max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Solicitação de serviços para a Manutenção
            </h2>
            <p className="text-xl text-white mb-8 leading-relaxed">
              Plataforma para o controle centralizado da manutenção. Solicitações dos colaboradores através de formulários e notificações em tempo real.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
  size="lg"
  className="bg-[#2F5D50] hover:bg-[#264A40] text-white border-0"
  onClick={() => navigate("/request")}
>
  Acesse o formulário
  <ArrowRight className="w-5 h-5 ml-2" />
</Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-[gradient-to-r from-blue-500/20 to-cyan-500/20] rounded-2xl blur-3xl" />
            <div className="relative bg-[#2F5D50] border border-[#567160] rounded-2xl p-8 backdrop-blur-sm">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#4B8A57] flex items-center justify-center flex-shrink-0">
                    <Wrench className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Solicitação de manutenção</h3>
                    <p className="text-white">Acesse o formulário e preencha com a sua solicitação</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#4B8A57] flex items-center justify-center flex-shrink-0">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">Seguro e Confiável</h3>
                    <p className="text-white">Autenticação e histórico completo</p>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </main>
    </div>
    <Card className="mt-8 bg-gradient-to-br from-[#1A3B2D] to-[#347055] border-[#A9C9A0] shadow-xl">
  <div className="p-6">
    <h2 className="text-xl font-bold text-white mb-6">
      Materiais Didáticos
    </h2>

    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2 mt-8">

  <a
    href="/manuals/ultra-p500.pdf"
    target="_blank"
    rel="noopener noreferrer"
    className="bg-white hover:bg-[#488C46] hover:text-white text-[#1A3B2D] font-bold rounded-xl p-4 min-h-[110px] flex items-center justify-center text-center transition-all duration-200 shadow-md"
  > {/* border-[#2F5D50] text-[#2F5D50] bg-[#F4F7F2] hover:bg-[#1A3B2D] hover:text-white */}
    Manual Ultra P500
  </a>

  <a
    href="/manuals/gofrador.pdf"
    target="_blank"
    rel="noopener noreferrer"
    className="bg-white hover:bg-[#488C46] hover:text-white text-[#1A3B2D] font-bold rounded-xl p-4 min-h-[110px] flex items-center justify-center text-center transition-all duration-200 shadow-md"
  >
    Manual Gofrador
  </a>

  <a
    href="/manuals/serpa.pdf"
    target="_blank"
    rel="noopener noreferrer"
    className="bg-white hover:bg-[#488C46] hover:text-white text-[#1A3B2D] font-bold rounded-xl p-4 min-h-[110px] flex items-center justify-center text-center transition-all duration-200 shadow-md"
  >
    Manual Cortadeira Serpa
  </a>

  <a
    href="/manuals/Tubeteira.pdf"
    target="_blank"
    rel="noopener noreferrer"
    className="bg-white hover:bg-[#488C46] hover:text-white text-[#1A3B2D] font-bold rounded-xl p-4 min-h-[110px] flex items-center justify-center text-center transition-all duration-200 shadow-md"
  >
    Manual Tubeteira
  </a>

  <a
    href="/manuals/t100.pdf"
    target="_blank"
    rel="noopener noreferrer"
    className="bg-white hover:bg-[#488C46] hover:text-white text-[#1A3B2D] font-bold rounded-xl p-4 min-h-[110px] flex items-center justify-center text-center transition-all duration-200 shadow-md"
  >
    Manual Empacotadeira T100
  </a>

  <a
    href="/manuals/insuper.pdf"
    target="_blank"
    rel="noopener noreferrer"
    className="bg-white hover:bg-[#488C46] hover:text-white text-[#1A3B2D] font-bold rounded-xl p-4 min-h-[110px] flex items-center justify-center text-center transition-all duration-200 shadow-md"
  >
    Manual Enfardadeira Insuper
  </a>

  <a
    href="/manuals/T100_falhas.pdf"
    target="_blank"
    rel="noopener noreferrer"
    className="bg-white hover:bg-[#488C46] hover:text-white text-[#1A3B2D] font-bold rounded-xl p-4 min-h-[110px] flex items-center justify-center text-center transition-all duration-200 shadow-md"
  >
    Falhas/Alarmes T100
  </a>

</div>
  </div>
</Card>
  </div>

  )}
