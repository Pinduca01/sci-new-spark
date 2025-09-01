import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import AuthErrorHandler from "@/components/AuthErrorHandler";

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
import Equipamentos from "./pages/Equipamentos";
import TPUniformes from "./pages/TPUniformes";
import AtividadesAcessorias from "./pages/AtividadesAcessorias";
import OrdemServico from "./pages/OrdemServico";
import NotFound from "./pages/NotFound";

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
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
          <Route path="/pessoal" element={<MainLayout><ControlePessoal /></MainLayout>} />
          <Route path="/pessoal/taf" element={<MainLayout><TAF /></MainLayout>} />
          <Route path="/ocorrencias" element={<MainLayout><Ocorrencias /></MainLayout>} />
          <Route path="/viaturas" element={<MainLayout><Viaturas /></MainLayout>} />
          <Route path="/veiculos" element={<MainLayout><Viaturas /></MainLayout>} />
          <Route path="/escalas" element={<MainLayout><Escalas /></MainLayout>} />
          <Route path="/exercicios" element={<MainLayout><Exercicios /></MainLayout>} />
          <Route path="/equipamentos" element={<MainLayout><Equipamentos /></MainLayout>} />
          <Route path="/equipamentos/tp-uniformes" element={<MainLayout><TPUniformes /></MainLayout>} />
          <Route path="/ptr-ba" element={<MainLayout><PTRBA /></MainLayout>} />
          <Route path="/atividades-acessorias" element={<MainLayout><AtividadesAcessorias /></MainLayout>} />
          <Route path="/ordem-servico" element={<MainLayout><OrdemServico /></MainLayout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
      <Sonner />
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
