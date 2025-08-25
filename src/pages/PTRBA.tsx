
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Plus, FileText, Clock, History } from 'lucide-react';
import { PTRBACalendario } from '@/components/PTRBACalendario';
import { PTRBAForm } from '@/components/PTRBAForm';
import { PTRBARelatorio } from '@/components/PTRBARelatorio';
import { PTRBAHistorico } from '@/components/PTRBAHistorico';

const PTRBA = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showForm, setShowForm] = useState(false);
  const [showRelatorio, setShowRelatorio] = useState(false);
  const [showHistorico, setShowHistorico] = useState(false);

  // Dados mockados para o resumo do dia
  const resumoDia = {
    '2024-08-25': [
      { hora: '08:00', titulo: 'Procedimentos de Emergência', instrutor: 'João Silva', participantes: 8 },
      { hora: '14:00', titulo: 'Manuseio de Equipamentos', instrutor: 'Maria Santos', participantes: 6 }
    ]
  };

  const getResumoData = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return resumoDia[dateStr] || [];
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">PTR-BA</h1>
          <p className="text-muted-foreground">Programa de Treinamento Recorrente - Bombeiros de Aeródromo</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setShowForm(true)} className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Novo PTR</span>
          </Button>
          <Button variant="outline" onClick={() => setShowRelatorio(true)} className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Relatório</span>
          </Button>
          <Button variant="outline" onClick={() => setShowHistorico(true)} className="flex items-center space-x-2">
            <History className="w-4 h-4" />
            <span>Histórico</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendário Principal */}
        <div className="lg:col-span-2">
          <PTRBACalendario 
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
          />
        </div>

        {/* Ações Rápidas */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setShowForm(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Instrução
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setShowRelatorio(true)}
              >
                <FileText className="w-4 h-4 mr-2" />
                Relatório do Dia
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => setShowHistorico(true)}
              >
                <History className="w-4 h-4 mr-2" />
                Histórico Completo
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
              >
                <Clock className="w-4 h-4 mr-2" />
                Estatísticas Mensais
              </Button>
            </CardContent>
          </Card>

          {/* Resumo do Dia Selecionado - Melhorado */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedDate.toLocaleDateString('pt-BR', { 
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long'
                })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">Instruções programadas:</p>
              <div className="space-y-3">
                {getResumoData(selectedDate).length > 0 ? (
                  getResumoData(selectedDate).map((instrucao, index) => (
                    <Card key={index} className="bg-muted/30 border-l-4 border-l-primary">
                      <CardContent className="p-3">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm">{instrucao.hora}</span>
                            <span className="text-xs text-muted-foreground">
                              {instrucao.participantes} participantes
                            </span>
                          </div>
                          <h5 className="font-medium text-sm">{instrucao.titulo}</h5>
                          <p className="text-xs text-muted-foreground">
                            Instrutor: {instrucao.instrutor}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhuma instrução programada</p>
                    <p className="text-xs">Clique em "Novo PTR" para adicionar</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modais */}
      <PTRBAForm 
        open={showForm}
        onOpenChange={setShowForm}
        selectedDate={selectedDate}
      />

      <PTRBARelatorio 
        open={showRelatorio}
        onOpenChange={setShowRelatorio}
        selectedDate={selectedDate}
      />

      <PTRBAHistorico 
        open={showHistorico}
        onOpenChange={setShowHistorico}
      />
    </div>
  );
};

export default PTRBA;
