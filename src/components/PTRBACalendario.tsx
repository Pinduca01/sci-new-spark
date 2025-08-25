
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PTRBACalendarioProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export const PTRBACalendario: React.FC<PTRBACalendarioProps> = ({
  selectedDate,
  onDateSelect,
}) => {
  // Dados mockados - depois serão vindos do Supabase
  const ptrsData = {
    '2024-08-25': [
      { id: 1, titulo: 'Procedimentos de Emergência', hora: '08:00' },
      { id: 2, titulo: 'Manuseio de Equipamentos', hora: '14:00' }
    ],
    '2024-08-26': [
      { id: 3, titulo: 'Combate a Incêndio', hora: '09:00' }
    ],
    '2024-08-28': [
      { id: 4, titulo: 'Primeiros Socorros', hora: '10:00' },
      { id: 5, titulo: 'Resgate em Altura', hora: '15:00' }
    ]
  };

  const getDayPtrs = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return ptrsData[dateStr] || [];
  };

  const hasInstructions = (date: Date) => {
    return getDayPtrs(date).length > 0;
  };

  return (
    <div className="space-y-4">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={(date) => date && onDateSelect(date)}
        className="rounded-md border pointer-events-auto"
        modifiers={{
          hasInstructions: (date) => hasInstructions(date)
        }}
        modifiersStyles={{
          hasInstructions: {
            backgroundColor: 'hsl(var(--primary))',
            color: 'hsl(var(--primary-foreground))',
            fontWeight: 'bold'
          }
        }}
      />
      
      {/* Legenda */}
      <div className="flex items-center space-x-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded bg-primary"></div>
          <span>Dias com instruções</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded border"></div>
          <span>Dias livres</span>
        </div>
      </div>

      {/* Instruções do dia selecionado */}
      <div className="space-y-2">
        <h4 className="font-semibold">
          Instruções para {selectedDate.toLocaleDateString('pt-BR')}:
        </h4>
        {getDayPtrs(selectedDate).length > 0 ? (
          <div className="space-y-2">
            {getDayPtrs(selectedDate).map((ptr) => (
              <div key={ptr.id} className="flex items-center justify-between p-2 border rounded">
                <div>
                  <span className="font-medium">{ptr.titulo}</span>
                  <Badge variant="secondary" className="ml-2">
                    {ptr.hora}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">Nenhuma instrução programada</p>
        )}
      </div>
    </div>
  );
};
