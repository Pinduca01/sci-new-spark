
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import MainLayout from "./components/MainLayout";
import Dashboard from "./pages/Dashboard";
import ControlePessoal from "./pages/ControlePessoal";
import Ocorrencias from "./pages/Ocorrencias";
import Viaturas from "./pages/Viaturas";
import Escalas from "./pages/Escalas";
import Exercicios from "./pages/Exercicios";
import PTRBA from "./pages/PTRBA";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
          <Route path="/pessoal" element={<MainLayout><ControlePessoal /></MainLayout>} />
          <Route path="/ocorrencias" element={<MainLayout><Ocorrencias /></MainLayout>} />
          <Route path="/viaturas" element={<MainLayout><Viaturas /></MainLayout>} />
          <Route path="/veiculos" element={<MainLayout><Viaturas /></MainLayout>} />
          <Route path="/escalas" element={<MainLayout><Escalas /></MainLayout>} />
          <Route path="/exercicios" element={<MainLayout><Exercicios /></MainLayout>} />
          <Route path="/ptr-ba" element={<MainLayout><PTRBA /></MainLayout>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
