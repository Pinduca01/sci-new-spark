import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Truck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ViaturasGrid } from "@/components/ViaturasGrid";
import { ViaturasDetails } from "@/components/ViaturasDetails";
import { AddViatura } from "@/components/AddViatura";
import { EditViatura } from "@/components/EditViatura";

interface Viatura {
  id: string;
  nome_viatura: string;
  prefixo: string;
  modelo: string;
  tipo: string;
  status: string;
  observacoes: string | null;
}

const Viaturas = () => {
  const [viaturas, setViaturas] = useState<Viatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddViatura, setShowAddViatura] = useState(false);
  const [selectedViatura, setSelectedViatura] = useState<Viatura | null>(null);
  const [editingViatura, setEditingViatura] = useState<Viatura | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchViaturas();
  }, []);

  const fetchViaturas = async () => {
    console.log('Fetching viaturas...');
    try {
      const { data, error } = await supabase
        .from('viaturas')
        .select('*')
        .order('prefixo');

      if (error) throw error;
      console.log('Viaturas loaded:', data);
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
  };

  const handleEditViatura = (viatura: Viatura) => {
    setEditingViatura(viatura);
  };

  const handleViaturaUpdated = () => {
    setEditingViatura(null);
    fetchViaturas();
  };

  if (selectedViatura) {
    return (
      <ViaturasDetails 
        viatura={selectedViatura} 
        onBack={() => setSelectedViatura(null)}
        onUpdate={fetchViaturas}
      />
    );
  }

  return (
    <div className="p-6 space-y-6 relative z-30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Truck className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Controle de Viaturas</h1>
        </div>
        <Button 
          onClick={() => {
            console.log('Button clicked: Add Nova Viatura');
            setShowAddViatura(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Adicionar Nova Viatura
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <ViaturasGrid 
          viaturas={viaturas} 
          onSelectViatura={setSelectedViatura}
          onViaturasUpdate={fetchViaturas}
          onEditViatura={handleEditViatura}
        />
      )}

      {showAddViatura && (
        <AddViatura 
          onClose={() => setShowAddViatura(false)}
          onSave={handleViaturaSaved}
        />
      )}

      {editingViatura && (
        <EditViatura 
          viatura={editingViatura}
          isOpen={true}
          onClose={() => setEditingViatura(null)}
          onViaturaUpdated={handleViaturaUpdated}
        />
      )}
    </div>
  );
};

export default Viaturas;