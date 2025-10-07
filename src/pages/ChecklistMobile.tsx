import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { useCurrentUserName } from '@/hooks/useCurrentUserName';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Truck, LogOut, RefreshCw, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { saveToCache, getFromCache, getPendingCount } from '@/lib/offlineDb';
import { useSyncManager } from '@/hooks/useSyncManager';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

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
  const { name: userName } = useCurrentUserName();
  const [viaturas, setViaturas] = useState<Viatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const { isOnline } = useSyncManager();

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
      
      // Atualizar contador de pendentes
      updatePendingCount();
    };

    checkAuth();
  }, [roleLoading, canDoChecklist, baseId, navigate]);

  const updatePendingCount = async () => {
    const count = await getPendingCount();
    setPendingCount(count);
  };

  const loadViaturas = async () => {
    try {
      setLoading(true);
      console.log('🔍 ChecklistMobile Debug:', { 
        baseId, 
        baseName,
        role,
        canDoChecklist 
      });
      const isOnline = navigator.onLine;

      // Tentar carregar do cache primeiro se offline
      if (!isOnline) {
        const cachedViaturas = await getFromCache(`viaturas_base_${baseId}`);
        if (cachedViaturas) {
          setViaturas(cachedViaturas);
          toast.info('Viaturas carregadas do cache (Modo Offline)');
          return;
        } else {
          throw new Error('Sem dados offline. Conecte à internet primeiro.');
        }
      }

      const { data, error } = await supabase
        .from('viaturas')
        .select('id, prefixo, placa, tipo, status')
        .eq('base_id', baseId)
        .eq('status', 'ativa')
        .order('prefixo');

      console.log('🚗 Viaturas Query Result:', { 
        viaturasCount: data?.length || 0, 
        viaturas: data,
        error: error?.message 
      });

      if (error) throw error;
      setViaturas(data || []);
      
      // Salvar no cache para uso offline
      await saveToCache(`viaturas_base_${baseId}`, data || []);
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

  const handleViatura = (viatura: Viatura) => {
    // Navega para seleção de tipo de checklist
    navigate(`/checklist-mobile/tipo/${viatura.id}`);
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
        {/* Header Profissional */}
        <Card className="mb-6 border-none shadow-lg bg-gradient-to-br from-primary/5 via-background to-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Truck className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight">Checklist de Viaturas</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">{baseName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 cursor-default">
                          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                          <span className="font-medium">{userName ?? 'Carregando...'}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        {isOnline ? 'Online' : 'Offline'}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              <div className="flex gap-2">
                {pendingCount > 0 && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate('/checklist-mobile/sync')}
                    className="relative"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                      {pendingCount}
                    </span>
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => navigate('/checklist-mobile/meu-historico')}
                  title="Meu histórico"
                >
                  <FileText className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleLogout}
                  title="Sair"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Métricas rápidas */}
        <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground">
          <span>Base: {baseName}</span>
          <span>{viaturas.length} viatura(s) disponível(is)</span>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {viaturas.map((viatura) => (
              <Card
                key={viatura.id}
                className="group cursor-pointer rounded-xl border bg-white shadow-sm hover:shadow-lg transition-all"
                onClick={() => handleViatura(viatura)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-primary" />
                    {viatura.prefixo}
                    <span className="ml-auto inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {viatura.tipo}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Placa</span>
                      <span className="font-medium">{viatura.placa}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <span className="inline-flex items-center rounded-full bg-green-100 text-green-700 px-2 py-0.5 text-xs">
                        Ativa
                      </span>
                    </div>
                    <Button
                      className="w-full mt-3"
                      onClick={(e) => { e.stopPropagation(); handleViatura(viatura); }}
                      aria-label={`Iniciar checklist da viatura ${viatura.prefixo}`}
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
