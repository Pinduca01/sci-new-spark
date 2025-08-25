
import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Clock, Users, BookOpen, Calendar as CalendarIcon } from 'lucide-react';
import { usePTRInstrucoes } from '@/hooks/usePTRInstrucoes';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PTRBACalendarioProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export const PTRBACalendario: React.FC<PTRBACalendarioProps> = ({
  selectedDate,
  onDateSelect,
}) => {
  const { buscarInstrucoesPorData } = usePTRInstrucoes();

  // Buscar instruções do mês atual para o calendário
  const { data: instrucoesCalendario = [] } = useQuery({
    queryKey: ['ptr-instrucoes-calendario', selectedDate.getFullYear(), selectedDate.getMonth()],
    queryFn: async () => {
      const primeiroDia = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      const ultimoDia = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
      
      const { data, error } = await supabase
        .from('ptr_instrucoes')
        .select('id, data, hora, titulo, tipo')
        .gte('data', primeiroDia.toISOString().split('T')[0])
        .lte('data', ultimoDia.toISOString().split('T')[0])
        .order('data')
        .order('hora');

      if (error) throw error;
      return data;
    }
  });

  // Buscar instruções do dia selecionado
  const { data: instrucoesDia = [] } = useQuery({
    queryKey: ['ptr-instrucoes-dia', selectedDate.toISOString().split('T')[0]],
    queryFn: () => buscarInstrucoesPorData(selectedDate.toISOString().split('T')[0])
  });

  const tiposCores = {
    'Procedimentos de Emergência': 'bg-red-100 text-red-800 border-red-200',
    'Combate a Incêndio': 'bg-orange-100 text-orange-800 border-orange-200',
    'Primeiros Socorros': 'bg-green-100 text-green-800 border-green-200',
    'Manuseio de Equipamentos': 'bg-blue-100 text-blue-800 border-blue-200',
    'Resgate em Altura': 'bg-purple-100 text-purple-800 border-purple-200',
    'Salvamento Aquático': 'bg-cyan-100 text-cyan-800 border-cyan-200',
    'Produtos Perigosos': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Comunicação de Emergência': 'bg-indigo-100 text-indigo-800 border-indigo-200'
  };

  const getDayInstructions = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return instrucoesCalendario.filter(instrucao => instrucao.data === dateStr);
  };

  const hasInstructions = (date: Date) => {
    return getDayInstructions(date).length > 0;
  };

  const getInstructionsCount = (date: Date) => {
    return getDayInstructions(date).length;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CalendarIcon className="w-5 h-5 text-primary" />
            <span>Calendário de Instruções PTR-BA</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && onDateSelect(date)}
            className="rounded-lg border-0 bg-background"
            modifiers={{
              hasInstructions: (date) => hasInstructions(date)
            }}
            modifiersStyles={{
              hasInstructions: {
                backgroundColor: 'hsl(var(--primary) / 0.1)',
                color: 'hsl(var(--primary))',
                fontWeight: 'bold',
                position: 'relative'
              }
            }}
            components={{
              Day: ({ date, ...props }) => {
                const instructionsCount = getInstructionsCount(date);
                const hasInstr = instructionsCount > 0;
                
                return (
                  <div className="relative">
                    <button {...props} className={cn(
                      "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors",
                      hasInstr && "bg-primary/10 text-primary font-semibold hover:bg-primary/20"
                    )}>
                      {date.getDate()}
                      {hasInstr && (
                        <Badge 
                          variant="secondary" 
                          className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center bg-primary text-primary-foreground"
                        >
                          {instructionsCount}
                        </Badge>
                      )}
                    </button>
                  </div>
                );
              }
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
                <div className="w-1 h-1 bg-primary rounded-full"></div>
              </div>
              <span>Dias com instruções</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30"></div>
              <span>Dias livres</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <span>
              {selectedDate.toLocaleDateString('pt-BR', { 
                weekday: 'long',
                day: 'numeric',
                month: 'long'
              })}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {instrucoesDia.length > 0 ? (
            <div className="space-y-3">
              {instrucoesDia.map((ptr) => (
                <Card key={ptr.id} className="border-l-4 border-l-primary bg-muted/30">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <Badge variant="outline" className="font-mono">
                            {ptr.hora}
                          </Badge>
                          <Badge className={tiposCores[ptr.tipo] || 'bg-gray-100 text-gray-800'}>
                            {ptr.tipo}
                          </Badge>
                        </div>
                        <h4 className="font-semibold text-foreground">{ptr.titulo}</h4>
                        {ptr.ptr_participantes && (
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <Users className="w-4 h-4" />
                            <span>{ptr.ptr_participantes.length} participantes</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">Nenhuma instrução programada</p>
              <p className="text-sm">Clique em "Novo PTR" para adicionar uma instrução</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
