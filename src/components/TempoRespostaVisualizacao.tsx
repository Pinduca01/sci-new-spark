import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { X, FileText } from "lucide-react";
import { FormularioTempoResposta } from "./TempoRespostaModal";

interface TempoRespostaVisualizacaoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formulario: FormularioTempoResposta | null;
}

const TempoRespostaVisualizacao = ({ open, onOpenChange, formulario }: TempoRespostaVisualizacaoProps) => {
  if (!formulario) return null;

  const formatarData = (data: string) => {
    return new Date(data).toLocaleDateString('pt-BR');
  };

  const formatarHora = (hora: string) => {
    return hora;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center flex items-center justify-center gap-2">
            <FileText className="h-6 w-6" />
            FORMULÁRIO PARA AFERIÇÃO DE TEMPO RESPOSTA
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 print:space-y-4">
          {/* Cabeçalho do Documento */}
          <div className="border-2 border-gray-300 p-4 bg-gray-50">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>AEROPORTO:</strong> {formulario.identificacaoAeroporto}
              </div>
              <div>
                <strong>EQUIPE:</strong> {formulario.equipe}
              </div>
              <div>
                <strong>DATA:</strong> {formatarData(formulario.data)}
              </div>
              <div>
                <strong>HORA:</strong> {formatarHora(formulario.hora)}
              </div>
              <div className="col-span-2">
                <strong>LOCAL:</strong> {formulario.local}
              </div>
            </div>
          </div>

          {/* Primeira Parte: Dados das Viaturas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">DADOS DAS VIATURAS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table className="border">
                  <TableHeader>
                    <TableRow className="bg-gray-100">
                      <TableHead className="border text-center font-bold">VIATURA CCI</TableHead>
                      <TableHead className="border text-center font-bold">BA-MC</TableHead>
                      <TableHead className="border text-center font-bold">ASSINATURA</TableHead>
                      <TableHead className="border text-center font-bold">EQUIPAGEM</TableHead>
                      <TableHead className="border text-center font-bold">ASSINATURA</TableHead>
                      <TableHead className="border text-center font-bold">TEMPO</TableHead>
                      <TableHead className="border text-center font-bold">CONCEITO</TableHead>
                      <TableHead className="border text-center font-bold">PERFORMANCE</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formulario.viaturas.map((viatura, index) => (
                      <TableRow key={viatura.id}>
                        <TableCell className="border text-center">{viatura.viatura}</TableCell>
                        <TableCell className="border text-center">{viatura.bamc}</TableCell>
                        <TableCell className="border text-center">{viatura.assinaturaBamc}</TableCell>
                        <TableCell className="border text-center">{viatura.equipagem}</TableCell>
                        <TableCell className="border text-center">{viatura.assinaturaEquipagem}</TableCell>
                        <TableCell className="border text-center font-mono">{viatura.tempo}</TableCell>
                        <TableCell className="border text-center font-bold">{viatura.conceito}</TableCell>
                        <TableCell className="border text-center">{viatura.performance}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Observações */}
          {(formulario.observacoes || formulario.resumoExercicio || formulario.consideracoesFinais) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">OBSERVAÇÕES E CONSIDERAÇÕES</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {formulario.observacoes && (
                  <div>
                    <h4 className="font-semibold mb-2">Observações:</h4>
                    <div className="border p-3 bg-gray-50 rounded text-sm whitespace-pre-wrap">
                      {formulario.observacoes}
                    </div>
                  </div>
                )}
                {formulario.resumoExercicio && (
                  <div>
                    <h4 className="font-semibold mb-2">Resumo do Exercício:</h4>
                    <div className="border p-3 bg-gray-50 rounded text-sm whitespace-pre-wrap">
                      {formulario.resumoExercicio}
                    </div>
                  </div>
                )}
                {formulario.consideracoesFinais && (
                  <div>
                    <h4 className="font-semibold mb-2">Considerações Finais:</h4>
                    <div className="border p-3 bg-gray-50 rounded text-sm whitespace-pre-wrap">
                      {formulario.consideracoesFinais}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Segunda Parte: Checklist Automático */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">CHECKLIST DE OBSERVAÇÕES / CONSIDERAÇÕES</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(formulario.checklist).map(([item, descricao]) => (
                  <div key={item} className="grid grid-cols-1 md:grid-cols-3 gap-2 border-b pb-2">
                    <div className="font-semibold text-sm">{item}:</div>
                    <div className="md:col-span-2 text-sm">
                      {descricao || (
                        <div className="border-b border-gray-400 h-4 w-full"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Rodapé com Assinaturas */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-8 mt-8">
                <div className="text-center">
                  <div className="border-b border-gray-400 mb-2 h-12"></div>
                  <div className="text-sm font-semibold">BA-CE</div>
                </div>
                <div className="text-center">
                  <div className="border-b border-gray-400 mb-2 h-12"></div>
                  <div className="text-sm font-semibold">GS OPERAÇÕES</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações do Sistema */}
          <div className="text-xs text-gray-500 text-center border-t pt-4">
            <p>Documento gerado em: {new Date(formulario.criadoEm).toLocaleString('pt-BR')}</p>
            <p>ID do Formulário: {formulario.id}</p>
          </div>

          {/* Botão de Fechar */}
          <div className="flex justify-end print:hidden">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4 mr-2" />
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TempoRespostaVisualizacao;