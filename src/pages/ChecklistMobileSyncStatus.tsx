import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Trash2, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { OnlineStatusBadge } from '@/components/checklist-mobile/OnlineStatusBadge';
import { getChecklistsToSync, deleteLocalChecklist } from '@/lib/offlineDb';
import { useSyncManager } from '@/hooks/useSyncManager';
import { toast } from 'sonner';

export default function ChecklistMobileSyncStatus() {
  const navigate = useNavigate();
  const { isOnline, syncing, startSync } = useSyncManager();
  const [checklists, setChecklists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingChecklists();
  }, [syncing]);

  const loadPendingChecklists = async () => {
    try {
      setLoading(true);
      const pending = await getChecklistsToSync();
      setChecklists(pending);
    } catch (error) {
      console.error('Erro ao carregar checklists pendentes:', error);
      toast.error('Erro ao carregar lista');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este checklist offline?')) return;
    
    try {
      await deleteLocalChecklist(id);
      toast.success('Checklist excluído');
      loadPendingChecklists();
    } catch (error) {
      toast.error('Erro ao excluir checklist');
    }
  };

  const handleRetrySync = async () => {
    if (!isOnline) {
      toast.error('Sem conexão com a internet');
      return;
    }
    await startSync();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_sync':
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
      case 'syncing':
        return <Badge className="bg-blue-500"><RefreshCw className="w-3 h-3 mr-1 animate-spin" />Sincronizando</Badge>;
      case 'error':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Erro</Badge>;
      default:
        return <Badge variant="secondary"><CheckCircle className="w-3 h-3 mr-1" />Sincronizado</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <OnlineStatusBadge />
      
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/checklist-mobile/viaturas')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Status de Sincronização</h1>
            <p className="text-sm text-muted-foreground">
              Checklists aguardando sincronização
            </p>
          </div>
          {isOnline && checklists.length > 0 && (
            <Button
              onClick={handleRetrySync}
              disabled={syncing}
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Sincronizando...' : 'Sincronizar'}
            </Button>
          )}
        </div>

        {/* Alert Offline */}
        {!isOnline && (
          <Alert className="mb-4 border-orange-500 bg-orange-50 dark:bg-orange-950">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-900 dark:text-orange-100">
              Você está offline. Conecte-se à internet para sincronizar os checklists.
            </AlertDescription>
          </Alert>
        )}

        {/* Lista de Checklists */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : checklists.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <p className="text-muted-foreground">
                Nenhum checklist pendente de sincronização
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {checklists.map((checklist) => (
              <Card key={checklist.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        Checklist #{checklist.id.substring(0, 8)}
                      </CardTitle>
                      <CardDescription>
                        {checklist.bombeiro_nome} • {new Date(checklist.data_checklist).toLocaleDateString('pt-BR')}
                      </CardDescription>
                    </div>
                    {getStatusBadge(checklist.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Data:</span>
                      <span className="font-medium">
                        {new Date(checklist.data_checklist).toLocaleDateString('pt-BR')} às {checklist.hora_checklist}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tentativas:</span>
                      <span className="font-medium">{checklist.sync_attempts || 0}/3</span>
                    </div>
                    {checklist.photos && checklist.photos.length > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Fotos:</span>
                        <span className="font-medium">{checklist.photos.length}</span>
                      </div>
                    )}
                    {checklist.sync_error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          {checklist.sync_error}
                        </AlertDescription>
                      </Alert>
                    )}
                    {checklist.last_sync_attempt && (
                      <p className="text-xs text-muted-foreground">
                        Última tentativa: {new Date(checklist.last_sync_attempt).toLocaleString('pt-BR')}
                      </p>
                    )}

                    <div className="flex gap-2 mt-4">
                      {isOnline && checklist.status === 'error' && (
                        <Button
                          size="sm"
                          onClick={handleRetrySync}
                          disabled={syncing}
                          className="flex-1"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Tentar Novamente
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(checklist.id)}
                        disabled={syncing}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
