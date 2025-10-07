import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { ThemeProvider } from "next-themes";
import AuthErrorHandler from "@/components/AuthErrorHandler";
import ErrorBoundary from "@/components/ErrorBoundary";

import Login from "./pages/Login";
import MainLayout from "./components/MainLayout";
import Dashboard from "./pages/Dashboard";
import ControlePessoal from "./pages/ControlePessoal";
import TAF from "./pages/TAF";
import Ocorrencias from "./pages/Ocorrencias";
import Viaturas from "./pages/Viaturas";
import Escalas from "./pages/Escalas";
import Exercicios from "./pages/Exercicios";
import PTRBA from "./pages/PTRBA";
import AgentesExtintores from "./pages/AgentesExtintores";
import TPUniformes from "./pages/TPUniformes";
import AtividadesAcessorias from "./pages/AtividadesAcessorias";
import OrdemServico from "./pages/OrdemServico";
import Checklists from "./pages/Checklists";
import ExemploAssinaturaAutentique from "./components/ExemploAssinaturaAutentique";
import NotFound from "./pages/NotFound";
import TestBombeiroSelector from "./components/TestBombeiroSelector";
import TestSupabaseConnection from "./components/TestSupabaseConnection";
import TestEquipeData from "./components/TestEquipeData";
const ChecklistMobileLogin = lazy(() => import("./pages/ChecklistMobileLogin"));
const ChecklistMobile = lazy(() => import("./pages/ChecklistMobile"));

const ChecklistMobileTipoSelecao = lazy(() => import("./pages/ChecklistMobileTipoSelecao"));
const ChecklistMobileEquipamentos = lazy(() => import("./pages/ChecklistMobileEquipamentos"));
const ChecklistMobileEquipamentoExecucao = lazy(() => import("./pages/ChecklistMobileEquipamentoExecucao"));
const ChecklistMobileViatura = lazy(() => import("./pages/ChecklistMobileViatura"));
const ChecklistMobileSyncStatus = lazy(() => import("./pages/ChecklistMobileSyncStatus"));
const ChecklistMobileHistorico = lazy(() => import("./pages/ChecklistMobileHistorico"));
const ChecklistMobileMeuHistorico = lazy(() => import("./pages/ChecklistMobileMeuHistorico"));
import AdminCreateUsers from "./pages/AdminCreateUsers";


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider 
      attribute="class" 
      defaultTheme="light" 
      enableSystem={false}
      storageKey="sci-core-theme"
    >
      <BrowserRouter>
        <AuthErrorHandler />
        <Suspense fallback={<div className="p-4 text-sm">Carregando…</div>}>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/checklist-mobile/login" element={<ChecklistMobileLogin />} />
          
          <Route path="/checklist-mobile/viaturas" element={<ErrorBoundary><ChecklistMobile /></ErrorBoundary>} />
          <Route path="/checklist-mobile/tipo/:viaturaId" element={<ErrorBoundary><ChecklistMobileTipoSelecao /></ErrorBoundary>} />
          <Route path="/checklist-mobile/equipamentos" element={<ErrorBoundary><ChecklistMobileEquipamentos /></ErrorBoundary>} />
          <Route path="/checklist-mobile/equipamentos/execucao" element={<ErrorBoundary><ChecklistMobileEquipamentoExecucao /></ErrorBoundary>} />
          <Route path="/checklist-mobile/viatura/:id" element={<ErrorBoundary><ChecklistMobileViatura /></ErrorBoundary>} />
          <Route path="/checklist-mobile/historico/:viaturaId" element={<ErrorBoundary><ChecklistMobileHistorico /></ErrorBoundary>} />
          <Route path="/checklist-mobile/meu-historico" element={<ErrorBoundary><ChecklistMobileMeuHistorico /></ErrorBoundary>} />
          <Route path="/checklist-mobile/sync" element={<ErrorBoundary><ChecklistMobileSyncStatus /></ErrorBoundary>} />
          <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
          <Route path="/pessoal" element={<MainLayout><ControlePessoal /></MainLayout>} />
          <Route path="/pessoal/taf" element={<MainLayout><TAF /></MainLayout>} />
          <Route path="/ocorrencias" element={<MainLayout><Ocorrencias /></MainLayout>} />
          <Route path="/viaturas" element={<MainLayout><Viaturas /></MainLayout>} />
          <Route path="/checklists" element={<MainLayout><Checklists /></MainLayout>} />
          <Route path="/veiculos" element={<MainLayout><Viaturas /></MainLayout>} />
          <Route path="/escalas" element={<MainLayout><Escalas /></MainLayout>} />
          <Route path="/exercicios" element={<MainLayout><Exercicios /></MainLayout>} />
          <Route path="/equipamentos" element={<MainLayout><AgentesExtintores /></MainLayout>} />
          <Route path="/agentes-extintores" element={<MainLayout><AgentesExtintores /></MainLayout>} />
          <Route path="/agentes-extintores/estoque" element={<MainLayout><AgentesExtintores /></MainLayout>} />
          <Route path="/agentes-extintores/checklist" element={<MainLayout><AgentesExtintores /></MainLayout>} />
          <Route path="/agentes-extintores/movimentacao" element={<MainLayout><AgentesExtintores /></MainLayout>} />
          <Route path="/agentes-extintores/relatorios" element={<MainLayout><AgentesExtintores /></MainLayout>} />
          <Route path="/equipamentos/tp-uniformes" element={<MainLayout><TPUniformes /></MainLayout>} />
          <Route path="/ptr-ba" element={<MainLayout><PTRBA /></MainLayout>} />
          <Route path="/atividades-acessorias" element={<MainLayout><AtividadesAcessorias /></MainLayout>} />
          <Route path="/ordem-servico" element={<MainLayout><OrdemServico /></MainLayout>} />
          <Route path="/assinatura-exemplo" element={<MainLayout><ExemploAssinaturaAutentique /></MainLayout>} />
          <Route path="/test-bombeiro-selector" element={<MainLayout><TestBombeiroSelector /></MainLayout>} />
          <Route path="/test-supabase" element={<MainLayout><TestSupabaseConnection /></MainLayout>} />
          <Route path="/test-equipe-data" element={<MainLayout><TestEquipeData /></MainLayout>} />
          <Route path="/admin/create-users" element={<MainLayout><AdminCreateUsers /></MainLayout>} />

          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </BrowserRouter>
      <Toaster />
      <Sonner />
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
