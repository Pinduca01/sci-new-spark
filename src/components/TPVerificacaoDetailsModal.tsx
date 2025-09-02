import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, Clock, FileText, Calendar, User, Shield, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { type TPVerificacao } from '@/hooks/useTPVerificacoes';

interface TPVerificacaoDetailsModalProps {
  verificacao: TPVerificacao | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TPVerificacaoDetailsModal = ({ verificacao, open, onOpenChange }: TPVerificacaoDetailsModalProps) => {
  if (!verificacao) return null;

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'assinado':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Assinado</Badge>;
      case 'enviado':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Enviado</Badge>;
      case 'rascunho':
      default:
        return <Badge variant="outline"><FileText className="w-3 h-3 mr-1" />Rascunho</Badge>;
    }
  };

  const getConformidadeBadge = (conformes: number, naoConformes: number) => {
    const total = conformes + naoConformes;
    const percentualConformidade = total > 0 ? (conformes / total) * 100 : 0;
    
    if (percentualConformidade >= 90) {
      return <Badge variant="default" className="bg-green-500">Excelente ({percentualConformidade.toFixed(0)}%)</Badge>;
    } else if (percentualConformidade >= 70) {
      return <Badge variant="secondary" className="bg-yellow-500">Bom ({percentualConformidade.toFixed(0)}%)</Badge>;
    } else {
      return <Badge variant="destructive">Atenção ({percentualConformidade.toFixed(0)}%)</Badge>;
    }
  };

  const renderAssinaturaInfo = () => {
    if (!verificacao.assinatura_digital) {
      return (
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <XCircle className="w-4 h-4" />
          Documento não assinado
        </div>
      );
    }

    const assinatura = verificacao.assinatura_digital as any;
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium">Documento Assinado Digitalmente</span>
        </div>
        {assinatura.signerName && (
          <div className="text-sm text-muted-foreground">
            <strong>Assinante:</strong> {assinatura.signerName}
          </div>
        )}
        {assinatura.signedAt && (
          <div className="text-sm text-muted-foreground">
            <strong>Data da Assinatura:</strong> {format(new Date(assinatura.signedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
          </div>
        )}
        {assinatura.documentId && (
          <div className="text-sm text-muted-foreground">
            <strong>ID do Documento:</strong> {assinatura.documentId}
          </div>
        )}
      </div>
    );
  };

  const renderChecklistItems = () => {
    // Como os dados do checklist não são armazenados individualmente na tabela tp_verificacoes,
    // vamos mostrar apenas um resumo baseado nos campos tp_conformes e tp_nao_conformes
    const totalItens = 8; // Total de itens verificados (conforme definido no formulário)
    const conformes = verificacao.tp_conformes;
    const naoConformes = verificacao.tp_nao_conformes;
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{conformes}</div>
            <div className="text-sm text-green-700">Conformes</div>
          </div>
          <div className="p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{naoConformes}</div>
            <div className="text-sm text-red-700">Não Conformes</div>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{totalItens}</div>
            <div className="text-sm text-blue-700">Total Verificados</div>
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p><strong>Itens verificados:</strong></p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Vestimentas - verificação de danos</li>
            <li>Vestimentas - conformidade com pontos de verificação</li>
            <li>Capacetes - verificação de avarias</li>
            <li>Botas - verificação de alterações</li>
            <li>Luvas - verificação de alterações</li>
            <li>Cintos - verificação de alterações</li>
            <li>Equipamentos auxiliares - verificação de funcionamento</li>
            <li>Estado geral dos equipamentos</li>
          </ul>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Detalhes da Verificação TP - {verificacao.base}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Gerais */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Gerais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Base</div>
                  <div className="text-lg font-semibold">{verificacao.base}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Período de Referência</div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(2024, verificacao.mes_referencia - 1, 1), 'MMMM/yyyy', { locale: ptBR })}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Data da Verificação</div>
                  <div>{format(new Date(verificacao.data_verificacao), 'dd/MM/yyyy', { locale: ptBR })}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Responsável</div>
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {verificacao.responsavel_nome}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status e Conformidade */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status da Assinatura</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getStatusBadge(verificacao.status_assinatura)}
                  <Separator />
                  {renderAssinaturaInfo()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Conformidade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getConformidadeBadge(verificacao.tp_conformes, verificacao.tp_nao_conformes)}
                  <div className="text-sm text-muted-foreground">
                    <div><strong>Conformes:</strong> {verificacao.tp_conformes}</div>
                    <div><strong>Não Conformes:</strong> {verificacao.tp_nao_conformes}</div>
                    <div><strong>Total:</strong> {verificacao.tp_conformes + verificacao.tp_nao_conformes}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Checklist Detalhado */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Checklist de Verificação</CardTitle>
            </CardHeader>
            <CardContent>
              {renderChecklistItems()}
            </CardContent>
          </Card>

          {/* Observações */}
          {verificacao.observacoes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm whitespace-pre-wrap">{verificacao.observacoes}</div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TPVerificacaoDetailsModal;