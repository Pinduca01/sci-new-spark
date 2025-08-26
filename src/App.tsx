
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";

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
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos
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
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <MainLayout><Dashboard /></MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/pessoal" element={
            <ProtectedRoute minimumRole="chefe_equipe">
              <MainLayout><ControlePessoal /></MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/pessoal/taf" element={
            <ProtectedRoute minimumRole="chefe_equipe">
              <MainLayout><TAF /></MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/ocorrencias" element={
            <ProtectedRoute minimumRole="lider_resgate">
              <MainLayout><Ocorrencias /></MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/viaturas" element={
            <ProtectedRoute allowedRoles={['diretoria', 'gerente_secao', 'motorista_condutor']}>
              <MainLayout><Viaturas /></MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/veiculos" element={
            <ProtectedRoute allowedRoles={['diretoria', 'gerente_secao', 'motorista_condutor']}>
              <MainLayout><Viaturas /></MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/escalas" element={
            <ProtectedRoute minimumRole="chefe_equipe">
              <MainLayout><Escalas /></MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/exercicios" element={
            <ProtectedRoute>
              <MainLayout><Exercicios /></MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/equipamentos" element={
            <ProtectedRoute>
              <MainLayout><Equipamentos /></MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/equipamentos/tp-uniformes" element={
            <ProtectedRoute minimumRole="gerente_secao">
              <MainLayout><TPUniformes /></MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/ptr-ba" element={
            <ProtectedRoute minimumRole="lider_resgate">
              <MainLayout><PTRBA /></MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/atividades-acessorias" element={
            <ProtectedRoute>
              <MainLayout><AtividadesAcessorias /></MainLayout>
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
      <Sonner />
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
