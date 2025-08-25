
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ExtintorAeroporto, InspecaoExtintor } from '@/hooks/useExtintoresAeroporto';
import { MapPin, Calendar, CheckCircle, AlertTriangle, Shield } from 'lucide-react';

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
  const extintorInspecoes = inspecoes.filter(i => i.extintor_id === extintorId);

  if (!extintor) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Extintor não encontrado</DialogTitle>
          </DialogHeader>
          <p>O extintor solicitado não foi encontrado.</p>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Detalhes do Extintor - {extintor.codigo_extintor}
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
                  <label className="text-sm font-medium text-muted-foreground">Código</label>
                  <p className="font-mono">{extintor.codigo_extintor}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">
                    <Badge variant={extintor.status === 'ativo' ? 'default' : 'secondary'}>
                      {extintor.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Localização</label>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <p>{extintor.localizacao_detalhada}</p>
                </div>
              </div>

              {extintor.quadrantes_aeroporto && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Quadrante</label>
                  <div className="flex items-center gap-2 mt-1">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: extintor.quadrantes_aeroporto.cor_identificacao }}
                    />
                    <p>{extintor.quadrantes_aeroporto.nome_quadrante}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tipo</label>
                  <p>{extintor.tipo_extintor}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Capacidade</label>
                  <p>{extintor.capacidade}{extintor.unidade_capacidade}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Fabricante</label>
                  <p>{extintor.fabricante || 'Não informado'}</p>
                </div>
              </div>

              {extintor.observacoes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Observações</label>
                  <p className="text-sm">{extintor.observacoes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Datas Importantes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Datas Importantes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Data de Instalação</label>
                  <p>{new Date(extintor.data_instalacao).toLocaleDateString('pt-BR')}</p>
                </div>
                {extintor.data_fabricacao && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Data de Fabricação</label>
                    <p>{new Date(extintor.data_fabricacao).toLocaleDateString('pt-BR')}</p>
                  </div>
                )}
              </div>

              {extintor.proxima_recarga && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Próxima Recarga</label>
                  <p className="flex items-center gap-2">
                    {new Date(extintor.proxima_recarga).toLocaleDateString('pt-BR')}
                    {new Date(extintor.proxima_recarga) <= new Date() && (
                      <Badge variant="destructive" className="text-xs">Vencida</Badge>
                    )}
                  </p>
                </div>
              )}

              {extintor.proximo_teste_hidrostatico && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Próximo Teste Hidrostático</label>
                  <p>{new Date(extintor.proximo_teste_hidrostatico).toLocaleDateString('pt-BR')}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Histórico de Inspeções */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Histórico de Inspeções</CardTitle>
            </CardHeader>
            <CardContent>
              {extintorInspecoes.length > 0 ? (
                <div className="space-y-4">
                  {extintorInspecoes.slice(0, 5).map((inspecao, index) => (
                    <div key={inspecao.id}>
                      {index > 0 && <Separator className="mb-4" />}
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            {inspecao.status_extintor === 'conforme' ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-amber-600" />
                            )}
                            <span className="font-medium">
                              {inspecao.status_extintor === 'conforme' ? 'Conforme' : 'Não Conforme'}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {inspecao.tipo_inspecao}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Inspetor: {inspecao.bombeiros?.nome || 'Não informado'}
                          </p>
                          {inspecao.observacoes && (
                            <p className="text-sm">{inspecao.observacoes}</p>
                          )}
                        </div>
                        <div className="text-right text-sm text-muted-foreground">
                          <p>{new Date(inspecao.data_inspecao).toLocaleDateString('pt-BR')}</p>
                          <p>{inspecao.hora_inspecao}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">
                  Nenhuma inspeção registrada para este extintor
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
