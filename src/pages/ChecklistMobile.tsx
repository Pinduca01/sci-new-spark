import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Truck, LogOut } from 'lucide-react';
import { toast } from 'sonner';

interface Viatura {
  id: string;
  prefixo: string;
  placa: string;
  tipo: string;
  status: string;
}

const ChecklistMobile = () => {
  const navigate = useNavigate();
  const { role, baseId, baseName, loading: roleLoading, canDoChecklist } = useUserRole();
  const [viaturas, setViaturas] = useState<Viatura[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar autenticação
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/checklist-mobile/login');
        return;
      }

      // Verificar se tem permissão para checklist
      if (!roleLoading && !canDoChecklist) {
        toast.error('Você não tem permissão para acessar checklists');
        navigate('/login');
        return;
      }

      // Carregar viaturas da base
      if (baseId) {
        await loadViaturas();
      }
    };

    checkAuth();
  }, [roleLoading, canDoChecklist, baseId, navigate]);

  const loadViaturas = async () => {
    try {
      const { data, error } = await supabase
        .from('viaturas')
        .select('id, prefixo, placa, tipo, status')
        .eq('base_id', baseId)
        .eq('status', 'ativo')
        .order('prefixo');

      if (error) throw error;
      setViaturas(data || []);
    } catch (error) {
      console.error('Erro ao carregar viaturas:', error);
      toast.error('Erro ao carregar viaturas');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/checklist-mobile/login');
  };

  const handleViatura = (viaturaId: string) => {
    navigate(`/checklist-mobile/viatura/${viaturaId}`);
  };

  if (roleLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Checklist de Viaturas</h1>
            <p className="text-sm text-muted-foreground">
              {baseName} - {role === 'ba_mc' ? 'Motorista Condutor' : 'Bombeiro Aeródromo 2'}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>

        {/* Lista de Viaturas */}
        {viaturas.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Nenhuma viatura disponível nesta base.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {viaturas.map((viatura) => (
              <Card key={viatura.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    {viatura.prefixo}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Placa:</span>
                      <span className="font-medium">{viatura.placa}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tipo:</span>
                      <span className="font-medium">{viatura.tipo}</span>
                    </div>
                    <Button 
                      className="w-full mt-4" 
                      onClick={() => handleViatura(viatura.id)}
                    >
                      Iniciar Checklist
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChecklistMobile;
