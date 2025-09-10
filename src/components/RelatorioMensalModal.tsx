import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';

interface RelatorioMensalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (mes: number, ano: number) => Promise<void>;
}

const meses = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' },
];

const anos = Array.from({ length: 10 }, (_, i) => {
  const ano = new Date().getFullYear() - 5 + i;
  return { value: ano, label: ano.toString() };
});

export function RelatorioMensalModal({ isOpen, onClose, onGenerate }: RelatorioMensalModalProps) {
  const [mesSelecionado, setMesSelecionado] = useState<number | null>(null);
  const [anoSelecionado, setAnoSelecionado] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!mesSelecionado || !anoSelecionado) return;

    setIsGenerating(true);
    try {
      await onGenerate(mesSelecionado, anoSelecionado);
      onClose();
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    if (!isGenerating) {
      setMesSelecionado(null);
      setAnoSelecionado(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Gerar Relatório Mensal</DialogTitle>
          <DialogDescription>
            Selecione o mês e ano para gerar o relatório de agentes extintores cadastrados.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="mes" className="text-right">
              Mês
            </Label>
            <Select
              value={mesSelecionado?.toString() || ''}
              onValueChange={(value) => setMesSelecionado(parseInt(value))}
              disabled={isGenerating}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione o mês" />
              </SelectTrigger>
              <SelectContent>
                {meses.map((mes) => (
                  <SelectItem key={mes.value} value={mes.value.toString()}>
                    {mes.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="ano" className="text-right">
              Ano
            </Label>
            <Select
              value={anoSelecionado?.toString() || ''}
              onValueChange={(value) => setAnoSelecionado(parseInt(value))}
              disabled={isGenerating}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Selecione o ano" />
              </SelectTrigger>
              <SelectContent>
                {anos.map((ano) => (
                  <SelectItem key={ano.value} value={ano.value.toString()}>
                    {ano.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isGenerating}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleGenerate}
            disabled={!mesSelecionado || !anoSelecionado || isGenerating}
          >
            {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isGenerating ? 'Gerando...' : 'Gerar Relatório'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}