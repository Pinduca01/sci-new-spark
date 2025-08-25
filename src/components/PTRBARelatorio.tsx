
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText, Download, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PTRBARelatorioProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date;
}

export const PTRBARelatorio: React.FC<PTRBARelatorioProps> = ({
  open,
  onOpenChange,
  selectedDate,
}) => {
  const { toast } = useToast();
  const [dataRelatorio, setDataRelatorio] = useState(
    selectedDate.toISOString().split('T')[0]
  );
  const [presencas, setPresencas] = useState<Record<string, boolean>>({});

  // Dados mockados - depois virão do Supabase
  const instrucoesData = [
    {
      id: 1,
      hora: '08:00',
      titulo: 'Procedimentos de Emergência',
      tipo: 'Procedimentos de Emergência',
      instrutor: 'João Silva',
      participantes: [
        { id: '1', nome: 'Maria Santos', funcao: 'BA-LR' },
        { id: '2', nome: 'Carlos Oliveira', funcao: 'BA-MC' },
        { id: '3', nome: 'Ana Costa', funcao: 'BA-2' },
      ]
    },
    {
      id: 2,
      hora: '14:00',
      titulo: 'Manuseio de Equipamentos',
      tipo: 'Manuseio de Equipamentos',
      instrutor: 'Pedro Souza',
      participantes: [
        { id: '4', nome: 'Lucas Ferreira', funcao: 'BA-2' },
        { id: '5', nome: 'Juliana Lima', funcao: 'BA-CE' },
      ]
    }
  ];

  const handlePresencaChange = (participanteId: string, presente: boolean) => {
    setPresencas(prev => ({
      ...prev,
      [participanteId]: presente
    }));
  };

  const gerarRelatorio = () => {
    // Aqui seria a lógica para gerar PDF ou imprimir
    toast({
      title: "Relatório Gerado",
      description: "Relatório de PTR-BA gerado com sucesso.",
    });
  };

  const exportarPDF = () => {
    // Aqui seria a lógica para exportar como PDF
    toast({
      title: "Exportando PDF",
      description: "O download do PDF será iniciado em breve.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Relatório Diário PTR-BA</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Filtros */}
          <div className="flex items-end space-x-4">
            <div>
              <Label htmlFor="data-relatorio">Data do Relatório</Label>
              <Input
                id="data-relatorio"
                type="date"
                value={dataRelatorio}
                onChange={(e) => setDataRelatorio(e.target.value)}
              />
            </div>
            <Button onClick={() => setDataRelatorio(new Date().toISOString().split('T')[0])}>
              Hoje
            </Button>
          </div>

          {/* Cabeçalho do Relatório */}
          <Card>
            <CardHeader>
              <CardTitle>
                Relatório PTR-BA - {new Date(dataRelatorio).toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <strong>Total de Instruções:</strong> {instrucoesData.length}
                </div>
                <div>
                  <strong>Total de Participantes:</strong> {
                    instrucoesData.reduce((acc, inst) => acc + inst.participantes.length, 0)
                  }
                </div>
                <div>
                  <strong>Data de Geração:</strong> {new Date().toLocaleString('pt-BR')}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Instruções */}
          <div className="space-y-4">
            {instrucoesData.map((instrucao) => (
              <Card key={instrucao.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {instrucao.hora} - {instrucao.titulo}
                    </CardTitle>
                    <Badge variant="outline">{instrucao.tipo}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Instrutor: {instrucao.instrutor}
                  </p>
                </CardHeader>
                <CardContent>
                  <div>
                    <Label className="font-semibold mb-2 block">Lista de Presença:</Label>
                    <div className="space-y-2">
                      {instrucao.participantes.map((participante) => (
                        <div key={participante.id} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              id={`presenca-${participante.id}-${instrucao.id}`}
                              checked={presencas[`${participante.id}-${instrucao.id}`] || false}
                              onCheckedChange={(checked) => 
                                handlePresencaChange(`${participante.id}-${instrucao.id}`, checked as boolean)
                              }
                            />
                            <Label htmlFor={`presenca-${participante.id}-${instrucao.id}`}>
                              {participante.nome}
                            </Label>
                          </div>
                          <Badge variant="secondary">{participante.funcao}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Ações */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={exportarPDF}>
                <Download className="w-4 h-4 mr-2" />
                Exportar PDF
              </Button>
              <Button onClick={gerarRelatorio}>
                <Printer className="w-4 h-4 mr-2" />
                Imprimir
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
