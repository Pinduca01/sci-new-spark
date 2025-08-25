
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TAFAvaliacao } from "@/hooks/useTAF";
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TAFDetalhesModalProps {
  avaliacao: TAFAvaliacao | null;
  aberto: boolean;
  onClose: () => void;
}

const TAFDetalhesModal = ({ avaliacao, aberto, onClose }: TAFDetalhesModalProps) => {
  if (!avaliacao) return null;

  const formatarTempo = (segundos: number) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Metas baseadas na faixa etária
  const metas = {
    flexoes: 30,
    abdominais: 45,
    polichinelos: 45,
    tempo: avaliacao.tempo_limite_minutos * 60
  };

  return (
    <Dialog open={aberto} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Detalhes da Avaliação TAF</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Bombeiro:</span>
                  <div>{avaliacao.bombeiros?.nome}</div>
                  <div className="text-sm text-muted-foreground">{avaliacao.bombeiros?.funcao}</div>
                </div>
                <div>
                  <span className="font-medium">Data do Teste:</span>
                  <div>{format(parseISO(avaliacao.data_teste), 'dd/MM/yyyy', { locale: ptBR })}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Idade na Data:</span>
                  <Badge variant={avaliacao.idade_na_data >= 40 ? "destructive" : "default"} className="ml-2">
                    {avaliacao.idade_na_data} anos
                  </Badge>
                </div>
                <div>
                  <span className="font-medium">Avaliador:</span>
                  <div>{avaliacao.avaliador_nome}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{avaliacao.flexoes_realizadas}</div>
                  <div className="text-sm text-muted-foreground">Flexões</div>
                  <div className="text-xs">Meta: {metas.flexoes}</div>
                  <Badge variant={avaliacao.flexoes_realizadas >= metas.flexoes ? "default" : "destructive"} className="mt-1">
                    {avaliacao.flexoes_realizadas >= metas.flexoes ? "✓" : "✗"}
                  </Badge>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold">{avaliacao.abdominais_realizadas}</div>
                  <div className="text-sm text-muted-foreground">Abdominais</div>
                  <div className="text-xs">Meta: {metas.abdominais}</div>
                  <Badge variant={avaliacao.abdominais_realizadas >= metas.abdominais ? "default" : "destructive"} className="mt-1">
                    {avaliacao.abdominais_realizadas >= metas.abdominais ? "✓" : "✗"}
                  </Badge>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold">{avaliacao.polichinelos_realizados}</div>
                  <div className="text-sm text-muted-foreground">Polichinelos</div>
                  <div className="text-xs">Meta: {metas.polichinelos}</div>
                  <Badge variant={avaliacao.polichinelos_realizados >= metas.polichinelos ? "default" : "destructive"} className="mt-1">
                    {avaliacao.polichinelos_realizados >= metas.polichinelos ? "✓" : "✗"}
                  </Badge>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold">{formatarTempo(avaliacao.tempo_total_segundos)}</div>
                  <div className="text-sm text-muted-foreground">Tempo Total</div>
                  <div className="text-xs">Limite: {formatarTempo(metas.tempo)}</div>
                  <Badge variant={avaliacao.tempo_total_segundos <= metas.tempo ? "default" : "destructive"} className="mt-1">
                    {avaliacao.tempo_total_segundos <= metas.tempo ? "✓" : "✗"}
                  </Badge>
                </div>
              </div>

              {/* Resultado Final */}
              <div className="text-center border-t pt-4">
                <Badge 
                  variant={avaliacao.aprovado ? "default" : "destructive"} 
                  className="text-lg px-6 py-2"
                >
                  {avaliacao.aprovado ? "APROVADO" : "REPROVADO"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Observações */}
          {avaliacao.observacoes && (
            <Card>
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{avaliacao.observacoes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TAFDetalhesModal;
