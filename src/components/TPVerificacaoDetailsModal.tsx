import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, Clock, FileText, Calendar, User, Shield, Eye, AlertTriangle } from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { type TPVerificacao } from '@/hooks/useTPVerificacoes';

interface TPVerificacaoDetailsModalProps {
  verificacao: TPVerificacao | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TPVerificacaoDetailsModal = ({ verificacao, open, onOpenChange }: TPVerificacaoDetailsModalProps) => {
  if (!verificacao) return null;

  // Função para formatar data com validação
  const formatDate = (dateValue: string | Date | null | undefined, formatString: string = 'dd/MM/yyyy'): string => {
    if (!dateValue) return 'Data não informada';
    
    let date: Date;
    if (typeof dateValue === 'string') {
      // Tenta fazer parse da string como ISO ou criar nova data
      date = dateValue.includes('T') ? parseISO(dateValue) : new Date(dateValue);
    } else {
      date = dateValue;
    }
    
    if (!isValid(date)) {
      return 'Data inválida';
    }
    
    return format(date, formatString, { locale: ptBR });
  };

  // Função para formatar mês/ano derivado da data de verificação
  const formatMonthYearFromDate = (dateValue: string | Date | null | undefined): string => {
    if (!dateValue) return 'Mês inválido';
    
    let date: Date;
    if (typeof dateValue === 'string') {
      date = dateValue.includes('T') ? parseISO(dateValue) : new Date(dateValue);
    } else {
      date = dateValue;
    }
    
    if (!isValid(date)) {
      return 'Data inválida';
    }
    
    return format(date, 'MMMM/yyyy', { locale: ptBR });
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



  const getStatusIcon = (status: string | undefined) => {
    switch (status) {
      case 'conforme':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'nao_conforme':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: string | undefined) => {
    switch (status) {
      case 'conforme':
        return 'Conforme';
      case 'nao_conforme':
        return 'Não Conforme';
      default:
        return 'Não Verificado';
    }
  };

  const renderChecklistCategory = (title: string, items: Array<{name: string, status?: string, membros?: string[], observacoes?: string}>) => {
    return (
      <div className="space-y-3">
        <h4 className="font-semibold text-sm text-gray-700">{title}</h4>
        {items.map((item, index) => (
          <div key={index} className="border rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{item.name}</span>
              <div className="flex items-center gap-2">
                {getStatusIcon(item.status)}
                <span className="text-sm">{getStatusText(item.status)}</span>
              </div>
            </div>
            {item.membros && item.membros.length > 0 && (
              <div className="text-xs text-gray-600">
                <strong>Membros afetados:</strong> {item.membros.join(', ')}
              </div>
            )}
            {item.observacoes && (
              <div className="text-xs text-gray-600">
                <strong>Observações:</strong> {item.observacoes}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderChecklistItems = () => {
    const conformes = verificacao.total_conformes;
    const naoConformes = verificacao.total_nao_conformes;
    const naoVerificados = verificacao.total_nao_verificados;
    
    return (
      <div className="space-y-6">
        {/* Resumo */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{conformes}</div>
            <div className="text-sm text-green-700">Conformes</div>
          </div>
          <div className="p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{naoConformes}</div>
            <div className="text-sm text-red-700">Não Conformes</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-600">{naoVerificados}</div>
            <div className="text-sm text-gray-700">Não Verificados</div>
          </div>
        </div>
        
        <Separator />
        
        {/* Categoria 1 - Etiquetas e CA */}
        {renderChecklistCategory('Categoria 1 - Etiquetas e CA', [
          {
            name: 'Etiquetas Visíveis',
            status: verificacao.cat1_etiquetas_visiveis,
            membros: verificacao.cat1_etiquetas_membros,
            observacoes: verificacao.cat1_etiquetas_observacoes
          },
          {
            name: 'CA Válido',
            status: verificacao.cat1_ca_valido,
            membros: verificacao.cat1_ca_membros,
            observacoes: verificacao.cat1_ca_observacoes
          }
        ])}
        
        <Separator />
        
        {/* Categoria 2 - Capacetes */}
        {renderChecklistCategory('Categoria 2 - Capacetes', [
          {
            name: 'Capacetes Íntegros',
            status: verificacao.cat2_capacetes_integros,
            membros: verificacao.cat2_capacetes_membros,
            observacoes: verificacao.cat2_capacetes_observacoes
          }
        ])}
        
        <Separator />
        
        {/* Categoria 3 - Vestimentas */}
        {renderChecklistCategory('Categoria 3 - Vestimentas', [
          {
            name: 'Vestimentas Íntegras',
            status: verificacao.cat3_vestimentas_integras,
            membros: verificacao.cat3_vestimentas_membros,
            observacoes: verificacao.cat3_vestimentas_observacoes
          },
          {
            name: 'Bom Estado',
            status: verificacao.cat3_bom_estado,
            membros: verificacao.cat3_bom_estado_membros,
            observacoes: verificacao.cat3_bom_estado_observacoes
          },
          {
            name: 'Faixas Reflexivas',
            status: verificacao.cat3_faixas_reflexivas,
            membros: verificacao.cat3_faixas_membros,
            observacoes: verificacao.cat3_faixas_observacoes
          },
          {
            name: 'Bolsos e Dispositivos',
            status: verificacao.cat3_bolsos_dispositivos,
            membros: verificacao.cat3_bolsos_membros,
            observacoes: verificacao.cat3_bolsos_observacoes
          },
          {
            name: 'Costuras Íntegras',
            status: verificacao.cat3_costuras_integras,
            membros: verificacao.cat3_costuras_membros,
            observacoes: verificacao.cat3_costuras_observacoes
          },
          {
            name: 'Barreira de Umidade',
            status: verificacao.cat3_barreira_umidade,
            membros: verificacao.cat3_barreira_membros,
            observacoes: verificacao.cat3_barreira_observacoes
          },
          {
            name: 'Punhos com Elasticidade',
            status: verificacao.cat3_punhos_elasticidade,
            membros: verificacao.cat3_punhos_membros,
            observacoes: verificacao.cat3_punhos_observacoes
          },
          {
            name: 'Costuras Seladas',
            status: verificacao.cat3_costuras_seladas,
            membros: verificacao.cat3_seladas_membros,
            observacoes: verificacao.cat3_seladas_observacoes
          }
        ])}
        
        <Separator />
        
        {/* Categoria 4 - Botas */}
        {renderChecklistCategory('Categoria 4 - Botas', [
          {
            name: 'Botas em Bom Estado',
            status: verificacao.cat4_botas_bom_estado,
            membros: verificacao.cat4_botas_membros,
            observacoes: verificacao.cat4_botas_observacoes
          },
          {
            name: 'Solas Íntegras',
            status: verificacao.cat4_solas_integras,
            membros: verificacao.cat4_solas_membros,
            observacoes: verificacao.cat4_solas_observacoes
          }
        ])}
        
        <Separator />
        
        {/* Categoria 5 - Luvas */}
        {renderChecklistCategory('Categoria 5 - Luvas', [
          {
            name: 'Luvas em Bom Estado',
            status: verificacao.cat5_luvas_bom_estado,
            membros: verificacao.cat5_luvas_membros,
            observacoes: verificacao.cat5_luvas_observacoes
          },
          {
            name: 'Costuras das Luvas',
            status: verificacao.cat5_costuras_luvas,
            membros: verificacao.cat5_costuras_membros,
            observacoes: verificacao.cat5_costuras_observacoes
          }
        ])}
        
        <Separator />
        
        {/* Categoria 6 - Capuzes */}
        {renderChecklistCategory('Categoria 6 - Capuzes', [
          {
            name: 'Capuzes em Bom Estado',
            status: verificacao.cat6_capuzes_bom_estado,
            membros: verificacao.cat6_capuzes_membros,
            observacoes: verificacao.cat6_capuzes_observacoes
          }
        ])}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Detalhes da Verificação TP - {verificacao.local}
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
                  <div className="text-lg font-semibold">{verificacao.local}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Período de Referência</div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatMonthYearFromDate(verificacao.data_verificacao)}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Data da Verificação</div>
                  <div>{formatDate(verificacao.data_verificacao)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Responsável</div>
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {verificacao.responsavel}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conformidade */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Conformidade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getConformidadeBadge(verificacao.total_conformes, verificacao.total_nao_conformes)}
                <div className="text-sm text-muted-foreground">
                  <div><strong>Conformes:</strong> {verificacao.total_conformes}</div>
                  <div><strong>Não Conformes:</strong> {verificacao.total_nao_conformes}</div>
                  <div><strong>Não Verificados:</strong> {verificacao.total_nao_verificados}</div>
                  <div><strong>Total:</strong> {verificacao.total_conformes + verificacao.total_nao_conformes + verificacao.total_nao_verificados}</div>
                </div>
              </div>
            </CardContent>
          </Card>

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