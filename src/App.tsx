
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import MainLayout from "@/components/MainLayout";
import Dashboard from "./pages/Dashboard";
import ControlePessoal from "./pages/ControlePessoal";
import Viaturas from "./pages/Viaturas";
import Equipamentos from "./pages/Equipamentos";
import Escalas from "./pages/Escalas";
import Ocorrencias from "./pages/Ocorrencias";
import PTRBA from "./pages/PTRBA";
import TAF from "./pages/TAF";
import TPUniformes from "./pages/TPUniformes";
import AtividadesAcessorias from "./pages/AtividadesAcessorias";
import Exercicios from "./pages/Exercicios";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { QRChecklistViewer } from "@/components/qr-checklist/QRChecklistViewer";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/checklist/qr/:qrCode" element={<QRChecklistViewer />} />
            <Route path="/" element={
              <SidebarProvider>
                <MainLayout>
                  <Routes>
                    <Route index element={<Dashboard />} />
                    <Route path="controle-pessoal" element={<ControlePessoal />} />
                    <Route path="viaturas" element={<Viaturas />} />
                    <Route path="equipamentos" element={<Equipamentos />} />
                    <Route path="escalas" element={<Escalas />} />
                    <Route path="ocorrencias" element={<Ocorrencias />} />
                    <Route path="ptr-ba" element={<PTRBA />} />
                    <Route path="taf" element={<TAF />} />
                    <Route path="tp-uniformes" element={<TPUniformes />} />
                    <Route path="atividades-acessorias" element={<AtividadesAcessorias />} />
                    <Route path="exercicios" element={<Exercicios />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </MainLayout>
              </SidebarProvider>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
