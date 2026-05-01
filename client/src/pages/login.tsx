import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import LogoMaxpaper from "@/assets/Logo-Max-paper.png";

export default function Login() {
  const [, navigate] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => {
      toast.success("Login realizado!");
      navigate("/dashboard");
    },
    onError: (error) => {
      toast.error(error.message || "Usuário ou senha inválidos");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ username, password });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-r from-[#66A663] to-[#CFE8C6] flex items-center justify-center px-4">
      
      {/* Logo no background - menor, canto inferior direito */}
      <div className="absolute bottom-6 right-6 pointer-events-none z-0">
        <img
          src={LogoMaxpaper}
          alt="Logo MaxPaper Fundo"
          className="w-[220px] md:w-[280px] opacity-[0.08] select-none"
        />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/20 bg-[#1F4D3A]/88 backdrop-blur-md shadow-2xl shadow-[#0D0D0D]/20 p-10">
        
        {/* Logo visível no card */}
        <div className="flex flex-col items-center mb-8">
          <img
            src={LogoMaxpaper}
            alt="MaxPaper"
            className="h-30 w-auto mb-5 object-contain brightness-0 invert"
          />

          <h1 className="text-4xl font-bold text-white text-center leading-tight">
            Painel de
            <br />
            Manutenção
          </h1>

          <p className="text-white/80 text-center mt-4 text-sm">
            Acesso restrito para equipe de manutenção
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Usuário
            </label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-white border-[#A9C9A0] text-[#0D0D0D] placeholder:text-[#5B665F] focus-visible:ring-[#66A663] focus-visible:border-[#66A663]"
              placeholder="Usuário"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Senha
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white border-[#A9C9A0] text-[#0D0D0D] placeholder:text-[#5B665F] focus-visible:ring-[#66A663] focus-visible:border-[#66A663]"
              placeholder="Senha"
            />
          </div>

          <Button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full bg-[#F21D2F] hover:bg-[#D91929] text-white border-0 shadow-md shadow-[#0D0D0D]/20 py-6 text-lg font-semibold"
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}