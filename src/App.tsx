import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import ControlePessoal from "./pages/ControlePessoal";
import Escalas from "./pages/Escalas";
import PTRBA from "./pages/PTRBA";
import TAF from "./pages/TAF";
import Exercicios from "./pages/Exercicios";
import Viaturas from "./pages/Viaturas";
import Equipamentos from "./pages/Equipamentos";
import Ocorrencias from "./pages/Ocorrencias";
import NotFound from "./pages/NotFound";
import MainLayout from "./components/MainLayout";

import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="lovis-theme">
      <QueryClientProvider client={queryClient}>
        <Router>
          <MainLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/controle-pessoal" element={<ControlePessoal />} />
              <Route path="/escalas" element={<Escalas />} />
              <Route path="/ptrba" element={<PTRBA />} />
              <Route path="/taf" element={<TAF />} />
              <Route path="/exercicios" element={<Exercicios />} />
              <Route path="/viaturas" element={<Viaturas />} />
              <Route path="/equipamentos" element={<Equipamentos />} />
              <Route path="/ocorrencias" element={<Ocorrencias />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </MainLayout>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
