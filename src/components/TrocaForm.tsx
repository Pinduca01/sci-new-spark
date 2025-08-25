
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CalendarDays, Users, Save } from "lucide-react";
import { useBombeiros } from "@/hooks/useBombeiros";
import { useTrocasPlantao, NovatrocaPlantao } from "@/hooks/useTrocasPlantao";

interface TrocaFormProps {
  mes: number;
  ano: number;
  onSuccess?: () => void;
}

const TrocaForm = ({ mes, ano, onSuccess }: TrocaFormProps) => {
  const { bombeiros } = useBombeiros();
  const { createTroca, isCreating } = useTrocasPlantao();

  const [formData, setFormData] = useState({
    data_servico_trocado: '',
    bombeiro_substituido_id: '',
    bombeiro_substituto_id: '',
    data_servico_pagamento: '',
    base: 'Principal',
    observacoes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.data_servico_trocado || 
        !formData.bombeiro_substituido_id || 
        !formData.bombeiro_substituto_id || 
        !formData.data_servico_pagamento) {
      return;
    }

    // Buscar equipe do bombeiro substituído
    const bombeiroSubstituido = bombeiros.find(b => b.id === formData.bombeiro_substituido_id);
    if (!bombeiroSubstituido?.equipe_id) return;

    const novaTroca: NovatrocaPlantao = {
      ...formData,
      equipe_id: bombeiroSubstituido.equipe_id,
      mes_referencia: mes,
      ano_referencia: ano,
      solicitante_id: formData.bombeiro_substituto_id, // Por ora, assumindo que quem solicita é o substituto
    };

    createTroca(novaTroca);

    // Limpar formulário
    setFormData({
      data_servico_trocado: '',
      bombeiro_substituido_id: '',
      bombeiro_substituto_id: '',
      data_servico_pagamento: '',
      base: 'Principal',
      observacoes: ''
    });

    onSuccess?.();
  };

  const bombeirosAtivos = bombeiros.filter(b => b.status === 'ativo');

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Lançamento de Troca de Plantão
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data_servico_trocado">Data do Serviço a ser Trocado</Label>
              <Input
                id="data_servico_trocado"
                type="date"
                value={formData.data_servico_trocado}
                onChange={(e) => setFormData({ ...formData, data_servico_trocado: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="data_servico_pagamento">Data do Serviço de Pagamento</Label>
              <Input
                id="data_servico_pagamento"
                type="date"
                value={formData.data_servico_pagamento}
                onChange={(e) => setFormData({ ...formData, data_servico_pagamento: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bombeiro_substituido">Bombeiro que será Substituído</Label>
              <Select 
                value={formData.bombeiro_substituido_id} 
                onValueChange={(value) => setFormData({ ...formData, bombeiro_substituido_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o bombeiro" />
                </SelectTrigger>
                <SelectContent>
                  {bombeirosAtivos.map((bombeiro) => (
                    <SelectItem key={bombeiro.id} value={bombeiro.id}>
                      {bombeiro.nome} - {bombeiro.equipe}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bombeiro_substituto">Bombeiro Substituto</Label>
              <Select 
                value={formData.bombeiro_substituto_id} 
                onValueChange={(value) => setFormData({ ...formData, bombeiro_substituto_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o substituto" />
                </SelectTrigger>
                <SelectContent>
                  {bombeirosAtivos
                    .filter(b => b.id !== formData.bombeiro_substituido_id)
                    .map((bombeiro) => (
                    <SelectItem key={bombeiro.id} value={bombeiro.id}>
                      {bombeiro.nome} - {bombeiro.equipe}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="base">Base</Label>
            <Select 
              value={formData.base} 
              onValueChange={(value) => setFormData({ ...formData, base: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Principal">Principal</SelectItem>
                <SelectItem value="Terminal">Terminal</SelectItem>
                <SelectItem value="Pista">Pista</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações (opcional)</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              placeholder="Adicione observações sobre a troca..."
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isCreating}
            size="lg"
          >
            {isCreating ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-current" />
                Registrando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Registrar Troca
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TrocaForm;
