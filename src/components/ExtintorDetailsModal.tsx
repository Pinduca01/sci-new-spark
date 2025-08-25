
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExtintorAeroporto, InspecaoExtintor } from '@/hooks/useExtintoresAeroporto';
import { MapPin, Calendar, Shield, Clock, FileText } from 'lucide-react';

interface ExtintorDetailsModalProps {
  open: boolean;
  onClose: () => void;
  extintorId: string;
  extintores: ExtintorAeroporto[];
  inspecoes: InspecaoExtintor[];
}

export const ExtintorDetailsModal = ({ 
  open, 
  onClose, 
  extintorId, 
  extintores, 
  inspecoes 
}: ExtintorDetailsModalProps) => {
  const extintor = extintores.find(e => e.id === extintorId);
  const inspecoesExtintor = inspecoes.filter(i => i.extintor_id === extintorId);

  if (!extintor) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Detalhes do Extintor {extintor.codigo_extintor}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Código</p>
                  <p className="font-medium">{extintor.codigo_extintor}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={extintor.status === 'ativo' ? 'default' : 'secondary'}>
                    {extintor.status}
                  </Badge>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Localização</p>
                <p className="font-medium">{extintor.localizacao_detalhada}</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Tipo</p>
                  <p className="font-medium">{extintor.tipo_extintor}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Capacidade</p>
                  <p className="font-medium">{extintor.capacidade}{extintor.unidade_capacidade}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fabricante</p>
                  <p className="font-medium">{extintor.fabricante || 'N/A'}</p>
                </div>
              </div>

              {extintor.quadrantes_aeroporto && (
                <div>
                  <p className="text-sm text-muted-foreground">Quadrante</p>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: extintor.quadrantes_aeroporto.cor_identificacao }}
                    />
                    <span className="font-medium">{extintor.quadrantes_aeroporto.nome_quadrante}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Datas Importantes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Cronograma de Manutenção
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Data de Instalação</p>
                  <p className="font-medium">
                    {new Date(extintor.data_instalacao).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                {extintor.data_fabricacao && (
                  <div>
                    <p className="text-sm text-muted-foreground">Data de Fabricação</p>
                    <p className="font-medium">
                      {new Date(extintor.data_fabricacao).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )}
                {extintor.ultima_recarga && (
                  <div>
                    <p className="text-sm text-muted-foreground">Última Recarga</p>
                    <p className="font-medium">
                      {new Date(extintor.ultima_recarga).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )}
                {extintor.proxima_recarga && (
                  <div>
                    <p className="text-sm text-muted-foreground">Próxima Recarga</p>
                    <p className="font-medium">
                      {new Date(extintor.proxima_recarga).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Histórico de Inspeções */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Histórico de Inspeções ({inspecoesExtintor.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {inspecoesExtintor.length > 0 ? (
                <div className="space-y-3">
                  {inspecoesExtintor.slice(0, 5).map((inspecao) => (
                    <div key={inspecao.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">
                            {new Date(inspecao.data_inspecao).toLocaleDateString('pt-BR')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {inspecao.bombeiros?.nome} - {inspecao.hora_inspecao}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={inspecao.status_extintor === 'conforme' ? 'default' : 'destructive'}
                        >
                          {inspecao.status_extintor}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {inspecao.tipo_inspecao}
                        </p>
                      </div>
                    </div>
                  ))}
                  {inspecoesExtintor.length > 5 && (
                    <p className="text-center text-sm text-muted-foreground">
                      ... e mais {inspecoesExtintor.length - 5} inspeções
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma inspeção registrada</p>
                </div>
              )}
            </CardContent>
          </Card>

          {extintor.observacoes && (
            <Card>
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{extintor.observacoes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
