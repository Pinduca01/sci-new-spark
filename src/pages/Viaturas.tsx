import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Truck, Wrench, FileText, Clock, AlertTriangle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ViaturasGrid } from "@/components/ViaturasGrid";
import { ViaturasDetails } from "@/components/ViaturasDetails";
import { AddViatura } from "@/components/AddViatura";

interface Viatura {
  id: string;
  prefixo: string;
  placa: string;
  modelo: string;
  ano: number;
  tipo: string;
  status: string;
  km_atual: number;
  data_ultima_revisao: string | null;
  proxima_revisao: string | null;
  observacoes: string | null;
}

const Viaturas = () => {
  const [userRole, setUserRole] = useState<string>("");
  const [viaturas, setViaturas] = useState<Viatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddViatura, setShowAddViatura] = useState(false);
  const [selectedViatura, setSelectedViatura] = useState<Viatura | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();
      
      if (profile) {
        setUserRole(profile.role);
      }
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (userRole) {
      fetchViaturas();
    }
  }, [userRole]);

  const fetchViaturas = async () => {
    try {
      const { data, error } = await supabase
        .from('viaturas')
        .select('*')
        .order('prefixo');

      if (error) throw error;
      setViaturas(data || []);
    } catch (error) {
      console.error('Erro ao buscar viaturas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as viaturas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo': return 'bg-emerald-500';
      case 'manutenção': return 'bg-amber-500';
      case 'inativo': return 'bg-red-500';
      default: return 'bg-muted';
    }
  };

  const handleViaturaSaved = () => {
    setShowAddViatura(false);
    fetchViaturas();
    toast({
      title: "Sucesso",
      description: "Viatura salva com sucesso!",
    });
  };

  if (selectedViatura) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gradient-to-br from-background to-muted/20">
          <AppSidebar userRole={userRole} />
          <div className="flex-1 flex flex-col">
            <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div className="flex items-center gap-2">
                  <Truck className="h-6 w-6 text-primary" />
                  <h1 className="text-xl font-semibold">Controle de Viaturas</h1>
                </div>
              </div>
            </header>
            <main className="flex-1 overflow-auto">
              <ViaturasDetails 
                viatura={selectedViatura} 
                onBack={() => setSelectedViatura(null)}
                onUpdate={fetchViaturas}
              />
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background to-muted/20">
        <AppSidebar userRole={userRole} />
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div className="flex items-center gap-2">
                <Truck className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-semibold">Controle de Viaturas</h1>
              </div>
            </div>
            <Button 
              onClick={() => setShowAddViatura(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Adicionar Nova Viatura
            </Button>
          </header>

          <main className="flex-1 p-6 overflow-auto">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <ViaturasGrid 
                viaturas={viaturas} 
                onSelectViatura={setSelectedViatura}
              />
            )}
          </main>
        </div>

        {showAddViatura && (
          <AddViatura 
            onClose={() => setShowAddViatura(false)}
            onSave={handleViaturaSaved}
          />
        )}
      </div>
    </SidebarProvider>
  );
};

export default Viaturas;