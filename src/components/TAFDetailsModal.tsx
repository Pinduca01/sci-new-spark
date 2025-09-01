import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  User,
  Calendar,
  Clock,
  Target,
  Activity,
  CheckCircle,
  XCircle,
  Trophy,
  Timer,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TAFDetailsModalProps {
  avaliacaoId: string;
  open: boolean;
  onClose: () => void;
}

const TAFDetailsModal: React.FC<TAFDetailsModalProps> = ({
  avaliacaoId,
  open,
  onClose,
}) => {
  const [avaliacao, setAvaliacao] = useState<any>(null);
  const [bombeiro, setBombeiro] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const carregarDados = async () => {
      if (!avaliacaoId) return;
      
      try {
        setIsLoading(true);
        // Aqui você implementaria a busca dos dados da avaliação e bombeiro
        // Por enquanto, vamos simular os dados
        const avaliacaoMock = {
          id: avaliacaoId,
          data_teste: new Date().toISOString(),
          faixa_etaria: 'abaixo_40',
          flexoes_realizadas: 25,
          flexoes_minimo: 20,
          abdominais_realizadas: 30,
          abdominais_minimo: 25,
          corrida_tempo: '12:30',
          corrida_tempo_maximo: '15:00',
          corrida_aprovado: true,
          natacao_tempo: '2:45',
          natacao_tempo_maximo: '3:00',
          natacao_aprovado: true,
          observacoes: 'Avaliação realizada com sucesso.',
          status: 'aprovado',
        };
        
        const bombeiroMock = {
          id: '1',
          nome_completo: 'João Silva Santos',
          matricula: '12345',
        };
        
        setAvaliacao(avaliacaoMock);
        setBombeiro(bombeiroMock);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (open && avaliacaoId) {
      carregarDados();
    }
  }, [avaliacaoId, open]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'aprovado':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Aprovado
          </Badge>
        );
      case 'reprovado':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="w-3 h-3 mr-1" />
            Reprovado
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Pendente
          </Badge>
        );
    }
  };

  const getFaixaEtariaBadge = (faixaEtaria: string) => {
    return (
      <Badge variant="outline" className="ml-2">
        {faixaEtaria === 'abaixo_40' ? 'Abaixo de 40 anos' : 'Acima de 40 anos'}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-blue-500" />
            Detalhes da Avaliação TAF
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-[300px]" />
              <Skeleton className="h-4 w-[250px]" />
            </div>
          </div>
        ) : !avaliacao || !bombeiro ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Erro ao carregar dados da avaliação.</p>
          </div>
        ) : (
        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium text-muted-foreground">Bombeiro</span>
              </div>
              <p className="text-base font-medium">{bombeiro.nome_completo || bombeiro.nome}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-muted-foreground">Data do Teste</span>
              </div>
              <p className="text-base">
                {format(new Date(avaliacao.data_teste), 'dd/MM/yyyy', { locale: ptBR })}
              </p>
            </div>
          </div>

          {/* Faixa Etária */}
          <div className="space-y-2">
            <span className="text-sm font-medium text-muted-foreground">Faixa Etária</span>
            <Badge variant="outline" className="text-sm">
              {avaliacao.faixa_etaria === 'abaixo_40' ? 'Abaixo de 40 anos' : 'Acima de 40 anos'}
            </Badge>
          </div>

          <Separator />

          {/* Exercícios Realizados */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Exercícios Realizados
            </h3>
            
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">Flexões</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{avaliacao.flexoes_realizadas}</span>
                  {avaliacao.flexoes_realizadas >= (avaliacao.flexoes_minimo || 0) ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  Meta: {avaliacao.flexoes_minimo || 'Não definida'}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">Abdominais</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{avaliacao.abdominais_realizadas}</span>
                  {avaliacao.abdominais_realizadas >= (avaliacao.abdominais_minimo || 0) ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  Meta: {avaliacao.abdominais_minimo || 'Não definida'}
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">Polichinelos</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{avaliacao.polichinelos_realizados}</span>
                  {avaliacao.polichinelos_realizados >= (avaliacao.polichinelos_minimo || 0) ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  Meta: {avaliacao.polichinelos_minimo || 'Não definida'}
                </div>
              </div>
            </div>
          </div>

          {/* Tempo Total */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Timer className="w-5 h-5" />
              Tempo Total dos Exercícios
            </h3>
            
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <Timer className="w-5 h-5 text-blue-500" />
              <div>
                <div className="font-medium">Tempo Realizado</div>
                <div className="text-sm text-muted-foreground">
                  {Math.floor(avaliacao.tempo_total_segundos / 60)}:{String(avaliacao.tempo_total_segundos % 60).padStart(2, '0')}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {avaliacao.tempo_total_segundos <= 180 ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-green-600 text-xs">Dentro do limite</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-red-500" />
                      <span className="text-red-600 text-xs">Acima do limite</span>
                    </>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Limite: 3 minutos para todos os exercícios
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Status de Aprovação */}
           <Alert className={avaliacao.aprovado ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
             {avaliacao.aprovado ? (
               <CheckCircle className="w-4 h-4 text-green-600" />
             ) : (
               <XCircle className="w-4 h-4 text-red-600" />
             )}
             <AlertDescription className={avaliacao.aprovado ? 'text-green-800' : 'text-red-800'}>
               <strong>{avaliacao.aprovado ? 'APROVADO' : 'REPROVADO'}</strong>
               <div className="mt-1">
                 {bombeiro.nome_completo || bombeiro.nome} - {format(new Date(avaliacao.data_teste), 'dd/MM/yyyy', { locale: ptBR })}
               </div>
             </AlertDescription>
           </Alert>

          {/* Observações */}
          {avaliacao.observacoes && (
            <div className="space-y-2">
              <span className="text-sm font-medium text-muted-foreground">Observações</span>
              <p className="text-sm bg-muted p-3 rounded-md">
                {avaliacao.observacoes}
              </p>
            </div>
          )}
        </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TAFDetailsModal;