import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ExercicioEPIVisualizacaoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exercicio: any;
}

const ExercicioEPIVisualizacao = ({ open, onOpenChange, exercicio }: ExercicioEPIVisualizacaoProps) => {
  if (!exercicio) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ficha de Exercício EPI/EPR</DialogTitle>
        </DialogHeader>
        
        <Card className="bg-white border-2 border-gray-800">
          <CardContent className="p-6">
            {/* Cabeçalho */}
            <div className="border-2 border-gray-800 mb-4">
              <div className="grid grid-cols-3 border-b border-gray-800">
                <div className="col-span-2 border-r border-gray-800 p-3">
                  <div className="font-bold text-sm">
                    IDENTIFICAÇÃO DO AEROPORTO: {exercicio.identificacaoLocal}
                  </div>
                </div>
                <div className="grid grid-cols-2">
                  <div className="border-r border-gray-800 p-3 text-center">
                    <div className="font-bold text-xs">DATA:</div>
                    <div className="text-sm">{new Date(exercicio.data).toLocaleDateString('pt-BR')}</div>
                  </div>
                  <div className="p-3 text-center">
                    <div className="font-bold text-xs">HORA:</div>
                    <div className="text-sm">{exercicio.hora}</div>
                  </div>
                </div>
              </div>
              <div className="p-3 text-center font-bold bg-gray-100">
                EXERCÍCIO DE AFERIÇÃO DE TP / EPR – Equipe {exercicio.equipe}.
              </div>
            </div>

            {/* Tabela Principal */}
            <div className="border-2 border-gray-800 mb-4">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th rowSpan={2} className="border border-gray-800 p-2 bg-gray-100 text-sm font-bold">
                      NOME
                    </th>
                    <th rowSpan={2} className="border border-gray-800 p-2 bg-gray-100 text-sm font-bold">
                      FUNÇÃO
                    </th>
                    <th colSpan={4} className="border border-gray-800 p-2 bg-gray-100 text-sm font-bold text-center">
                      Tempo Individual de cada Bombeiro
                    </th>
                  </tr>
                  <tr>
                    <th className="border border-gray-800 p-1 bg-gray-50 text-xs font-bold text-center">
                      Calça + Bota
                    </th>
                    <th className="border border-gray-800 p-1 bg-gray-50 text-xs font-bold text-center">
                      TP Completo
                    </th>
                    <th className="border border-gray-800 p-1 bg-gray-50 text-xs font-bold text-center">
                      EPR + TP Completo
                    </th>
                    <th className="border border-gray-800 p-1 bg-gray-50 text-xs font-bold text-center">
                      EPR sem TP
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {exercicio.bombeiros?.map((bombeiro: any, index: number) => (
                    <tr key={index}>
                      <td className="border border-gray-800 p-2 text-sm font-medium">
                        {bombeiro.nome.toUpperCase()}
                      </td>
                      <td className="border border-gray-800 p-2 text-sm text-center">
                        {bombeiro.funcao}
                      </td>
                      {/* Calça + Bota */}
                      <td className="border border-gray-800 p-1 text-xs text-center">
                        {bombeiro.calcaBota || '-'}
                      </td>
                      {/* TP Completo */}
                      <td className="border border-gray-800 p-1 text-xs text-center">
                        {bombeiro.tpCompleto || '-'}
                      </td>
                      {/* EPR + TP Completo */}
                      <td className="border border-gray-800 p-1 text-xs text-center">
                        {bombeiro.eprTpCompleto || '-'}
                      </td>
                      {/* EPR sem TP */}
                      <td className="border border-gray-800 p-1 text-xs text-center">
                        {bombeiro.eprSemTp || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Observações */}
            <div className="border-2 border-gray-800 mb-4">
              <div className="bg-gray-100 p-2 font-bold text-sm border-b border-gray-800">
                OBSERVAÇÕES:
              </div>
              <div className="p-4 min-h-[80px] text-sm">
                {exercicio.observacoes || ""}
              </div>
            </div>

            {/* Assinaturas */}
            <div className="border-2 border-gray-800">
              <div className="bg-gray-100 p-2 font-bold text-sm border-b border-gray-800">
                ASSINATURAS:
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-8">
                  <div className="text-center">
                    <div className="border-b-2 border-gray-800 mb-2 pb-8"></div>
                    <div className="font-bold text-sm">Chefe de Equipe</div>
                    {exercicio.chefeEquipe && (
                      <div className="text-sm mt-1">{exercicio.chefeEquipe}</div>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="border-b-2 border-gray-800 mb-2 pb-8"></div>
                    <div className="font-bold text-sm">Gerente SCI</div>
                    {exercicio.gerenteSCI && (
                      <div className="text-sm mt-1">{exercicio.gerenteSCI}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end mt-4">
          <Button onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExercicioEPIVisualizacao;