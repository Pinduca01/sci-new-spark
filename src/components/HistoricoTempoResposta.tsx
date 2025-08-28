import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Eye, FileText, Clock, Users, CheckSquare } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface EquipeMembro {
  id: string;
  nome: string;
}

interface ViaturaTempo {
  id: string;
  viaturaCCI: string;
  bamc: string;
  assinaturaBamc: string;
  equipagem: EquipeMembro[];
  assinaturaEquipagem: string;
  tempo: string;
  conceito: string;
  performance: string;
}

interface ChecklistItem {
  id: string;
  item: string;
  observacao: string;
  assinatura?: string;
}

interface FormularioTempoResposta {
  id: string;
  aeroporto: string;
  dataExercicio: string;
  hora: string;
  equipe: string;
  local: string;
  viaturas: ViaturaTempo[];
  observacoes: string;
  resumoExercicio: string;
  consideracoesFinais: string;
  checklist: ChecklistItem[];
  createdAt: string;
}

interface HistoricoTempoRespostaProps {
  formularios: FormularioTempoResposta[];
}

export const HistoricoTempoResposta: React.FC<HistoricoTempoRespostaProps> = ({ formularios }) => {
  const [formularioSelecionado, setFormularioSelecionado] = useState<FormularioTempoResposta | null>(null);
  const [modalVisualizacaoOpen, setModalVisualizacaoOpen] = useState(false);

  const abrirVisualizacao = (formulario: FormularioTempoResposta) => {
    setFormularioSelecionado(formulario);
    setModalVisualizacaoOpen(true);
  };

  const gerarCodigoFormulario = (formulario: FormularioTempoResposta) => {
    const data = new Date(formulario.dataExercicio);
    const ano = data.getFullYear().toString().slice(-2);
    const mes = (data.getMonth() + 1).toString().padStart(2, '0');
    const dia = data.getDate().toString().padStart(2, '0');
    return `TR-${ano}${mes}${dia}-${formulario.id.slice(-4).toUpperCase()}`;
  };

  const formatarData = (dataISO: string) => {
    return new Date(dataISO).toLocaleDateString('pt-BR');
  };

  const formatarHora = (hora: string) => {
    return hora || '--:--';
  };

  if (formularios.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum formulário encontrado</h3>
          <p className="text-muted-foreground text-center">
            Os formulários de tempo resposta aparecerão aqui após serem criados.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Histórico de Formulários - Tempo Resposta
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Equipe</TableHead>
                <TableHead>Aeroporto</TableHead>
                <TableHead>Viaturas</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {formularios.map((formulario) => (
                <TableRow key={formulario.id}>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {gerarCodigoFormulario(formulario)}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatarData(formulario.dataExercicio)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {formatarHora(formulario.hora)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      {formulario.equipe}
                    </div>
                  </TableCell>
                  <TableCell>{formulario.aeroporto}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {formulario.viaturas.length} viatura{formulario.viaturas.length !== 1 ? 's' : ''}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => abrirVisualizacao(formulario)}
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      Visualizar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de Visualização Formatada */}
      <Dialog open={modalVisualizacaoOpen} onOpenChange={setModalVisualizacaoOpen}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Formulário de Aferição de Tempo Resposta - {formularioSelecionado && gerarCodigoFormulario(formularioSelecionado)}
            </DialogTitle>
          </DialogHeader>

          {formularioSelecionado && (
            <div className="space-y-6 p-6 bg-white text-black print:p-0">
              {/* Cabeçalho Oficial */}
              <div className="text-center border-b-2 border-black pb-4">
                <h1 className="text-2xl font-bold mb-2">FORMULÁRIO PARA AFERIÇÃO DE TEMPO RESPOSTA</h1>
                <p className="text-lg font-semibold">{formularioSelecionado.aeroporto}</p>
              </div>

              {/* Informações de Identificação */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex">
                    <span className="font-semibold w-32">Data:</span>
                    <span className="border-b border-black flex-1 px-2">
                      {formatarData(formularioSelecionado.dataExercicio)}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold w-32">Hora:</span>
                    <span className="border-b border-black flex-1 px-2">
                      {formatarHora(formularioSelecionado.hora)}
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex">
                    <span className="font-semibold w-32">Equipe:</span>
                    <span className="border-b border-black flex-1 px-2">
                      {formularioSelecionado.equipe}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="font-semibold w-32">Local:</span>
                    <span className="border-b border-black flex-1 px-2">
                      {formularioSelecionado.local}
                    </span>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Tabela de Viaturas */}
              <div>
                <h3 className="text-lg font-bold mb-4">VIATURAS E TEMPOS</h3>
                <div className="border-2 border-black">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-black p-2 text-left font-bold">VIATURA</th>
                        <th className="border border-black p-2 text-left font-bold">BA-MC</th>
                        <th className="border border-black p-2 text-left font-bold">ASSINATURA</th>
                        <th className="border border-black p-2 text-left font-bold">EQUIPAGEM</th>
                        <th className="border border-black p-2 text-left font-bold">ASSINATURA</th>
                        <th className="border border-black p-2 text-left font-bold">TEMPO</th>
                        <th className="border border-black p-2 text-left font-bold">CONCEITO</th>
                        <th className="border border-black p-2 text-left font-bold">PERFORMANCE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formularioSelecionado.viaturas.map((viatura, index) => (
                        <tr key={viatura.id}>
                          <td className="border border-black p-2">{viatura.viaturaCCI}</td>
                          <td className="border border-black p-2">{viatura.bamc}</td>
                          <td className="border border-black p-2">{viatura.assinaturaBamc}</td>
                          <td className="border border-black p-2">
                            {viatura.equipagem.map(membro => membro.nome).join(', ')}
                          </td>
                          <td className="border border-black p-2">{viatura.assinaturaEquipagem}</td>
                          <td className="border border-black p-2 font-mono">{viatura.tempo}</td>
                          <td className="border border-black p-2 text-center font-bold">{viatura.conceito}</td>
                          <td className="border border-black p-2">{viatura.performance}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Observações */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold mb-2">OBSERVAÇÕES:</h4>
                  <div className="border border-black p-3 min-h-[80px] whitespace-pre-wrap">
                    {formularioSelecionado.observacoes || 'Nenhuma observação registrada.'}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold mb-2">RESUMO DO EXERCÍCIO:</h4>
                  <div className="border border-black p-3 min-h-[80px] whitespace-pre-wrap">
                    {formularioSelecionado.resumoExercicio || 'Nenhum resumo registrado.'}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold mb-2">CONSIDERAÇÕES FINAIS:</h4>
                  <div className="border border-black p-3 min-h-[80px] whitespace-pre-wrap">
                    {formularioSelecionado.consideracoesFinais || 'Nenhuma consideração registrada.'}
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Checklist */}
              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <CheckSquare className="h-5 w-5" />
                  CHECKLIST DE OBSERVAÇÕES / CONSIDERAÇÕES
                </h3>
                <div className="space-y-3">
                  {formularioSelecionado.checklist.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 border-b border-gray-300 pb-2">
                      <div className="w-4 h-4 border-2 border-black mt-1 flex items-center justify-center">
                        <span className="text-xs font-bold">✓</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">{item.item}:</div>
                        <div className="text-sm">{item.observacao}</div>
                        {item.assinatura && (
                          <div className="mt-1 text-sm">
                            <span className="font-medium">Assinatura: </span>
                            <span className="border-b border-black px-2">{item.assinatura}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rodapé */}
              <div className="mt-8 pt-4 border-t-2 border-black text-center">
                <p className="text-sm text-gray-600">
                  Documento gerado em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={() => window.print()}>
              Imprimir
            </Button>
            <Button onClick={() => setModalVisualizacaoOpen(false)}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HistoricoTempoResposta;