
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Plus, FileText, Clock } from 'lucide-react';
import { PTRBACalendario } from '@/components/PTRBACalendario';
import { PTRBAForm } from '@/components/PTRBAForm';
import { PTRBARelatorio } from '@/components/PTRBARelatorio';

const PTRBA = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showForm, setShowForm] = useState(false);
  const [showRelatorio, setShowRelatorio] = useState(false);

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
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendário Principal */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Calendário de Instruções</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PTRBACalendario 
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
              />
            </CardContent>
          </Card>
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
              >
                <Clock className="w-4 h-4 mr-2" />
                Histórico
              </Button>
            </CardContent>
          </Card>

          {/* Resumo do Dia Selecionado */}
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedDate.toLocaleDateString('pt-BR', { 
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">Instruções programadas:</p>
              <div className="space-y-2">
                <div className="text-sm p-2 bg-muted rounded">
                  <strong>08:00 - Procedimentos de Emergência</strong>
                  <p className="text-muted-foreground">Instrutor: João Silva</p>
                </div>
                <div className="text-sm p-2 bg-muted rounded">
                  <strong>14:00 - Manuseio de Equipamentos</strong>
                  <p className="text-muted-foreground">Instrutor: Maria Santos</p>
                </div>
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
    </div>
  );
};

export default PTRBA;
