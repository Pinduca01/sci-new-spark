import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Edit2, Plus, RotateCcw, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PTRTemasManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  temas: string[];
  onTemasChange: (temas: string[]) => void;
}

const TEMAS_PTR_PADRAO = [
  "CONDUÇÃO DE VEÍCULOS DE EMERGÊNCIA NA ÁREA OPERACIONAL DO AERÓDROMO",
  "ATIVIDADE FÍSICA",
  "EMERGÊNCIAS COM ARTIGOS PERIGOSOS",
  "EQUIPAMENTOS DE APOIO ÀS OPERAÇÕES DE RESGATE",
  "EQUIPAMENTOS DE PROTEÇÃO",
  "EXERCÍCIO DE AFERIÇÃO DE POSICIONAMENTO PARA INTERVENÇÃO",
  "EXERCÍCIO DE AFERIÇÃO DE TEMPO RESPOSTA",
  "EXERCÍCIO DE TP/EPR",
  "EXERCÍCIO DE MANEABILIDADE",
  "EXERCÍCIO DE MANEABILIDADE CCI",
  "EXERCÍCIO DE MOVIMENTAÇÃO INICIAL",
  "FAMILIARIZAÇÃO COM AS AERONAVES QUE OPERAM COM REGULARIDADE NO AERÓDROMO",
  "FAMILIARIZAÇÃO COM O AERÓDROMO",
  "FAMILIARIZAÇÃO COM OS CCI EM OPERAÇÃO NO AERÓDROMO",
  "OPERAÇÕES EM BAIXA VISIBILIDADE, QUANDO APLICÁVEL",
  "PCINC",
  "PLANO CONTRAINCÊNDIO DE AERÓDROMO (PCINC)",
  "PLANO DE EMERGÊNCIA EM AERÓDROMO (PLEM)",
  "PRÁTICA DE TREINAMENTO DE SOCORRO E URGÊNCIA",
  "PROCEDIMENTOS DE APLICAÇÃO DE AGENTES EXTINTORES",
  "PROCEDIMENTOS DE SEGURANÇA NA EXECUÇÃO DE ATIVIDADES OPERACIONAIS",
  "PROCEDIMENTOS PARA ASSISTÊNCIA NA EVACUAÇÃO DA AERONAVE EM CASO DE EMERGÊNCIA",
  "REABASTECIMENTO DO CCI COM ÁGUA",
  "ATENDIMENTO PRE HOSPITALAR",
  "SISTEMAS DE COMBATE A INCÊNDIO",
  "SISTEMAS DE COMUNICAÇÃO E ALARME",
  "LEITURA DDS",
  "CONHECIMENTOS BÁSICOS PARA INSPEÇÃO DE CARRO CONTRA INCÊNDIO",
  "ORIENTAÇÃO INCURSÃO EM PISTA",
  "APLICAÇÃO DE AGENTE"
];

export const PTRTemasManager: React.FC<PTRTemasManagerProps> = ({
  open,
  onOpenChange,
  temas,
  onTemasChange
}) => {
  const { toast } = useToast();
  const [novoTema, setNovoTema] = useState('');
  const [editandoTema, setEditandoTema] = useState<{index: number, valor: string} | null>(null);
  const [filtro, setFiltro] = useState('');

  const temasFiltrados = temas.filter(tema => 
    tema.toLowerCase().includes(filtro.toLowerCase())
  );

  const handleAdicionarTema = () => {
    if (!novoTema.trim()) {
      toast({
        title: "Erro",
        description: "O tema não pode estar vazio.",
        variant: "destructive",
      });
      return;
    }

    if (temas.includes(novoTema.trim())) {
      toast({
        title: "Erro",
        description: "Este tema já existe na lista.",
        variant: "destructive",
      });
      return;
    }

    const novosMetras = [...temas, novoTema.trim()];
    onTemasChange(novosMetras);
    setNovoTema('');
    
    toast({
      title: "Sucesso",
      description: "Tema adicionado com sucesso!",
    });
  };

  const handleEditarTema = (index: number) => {
    setEditandoTema({ index, valor: temas[index] });
  };

  const handleSalvarEdicao = () => {
    if (!editandoTema) return;

    if (!editandoTema.valor.trim()) {
      toast({
        title: "Erro",
        description: "O tema não pode estar vazio.",
        variant: "destructive",
      });
      return;
    }

    const temaEditado = editandoTema.valor.trim();
    const outrosTemas = temas.filter((_, i) => i !== editandoTema.index);
    
    if (outrosTemas.includes(temaEditado)) {
      toast({
        title: "Erro",
        description: "Este tema já existe na lista.",
        variant: "destructive",
      });
      return;
    }

    const novosTemas = [...temas];
    novosTemas[editandoTema.index] = temaEditado;
    onTemasChange(novosTemas);
    setEditandoTema(null);
    
    toast({
      title: "Sucesso",
      description: "Tema editado com sucesso!",
    });
  };

  const handleExcluirTema = (index: number) => {
    const novosTemas = temas.filter((_, i) => i !== index);
    onTemasChange(novosTemas);
    
    toast({
      title: "Sucesso",
      description: "Tema removido com sucesso!",
    });
  };

  const handleResetarTemas = () => {
    onTemasChange(TEMAS_PTR_PADRAO);
    
    toast({
      title: "Sucesso",
      description: "Temas resetados para o padrão!",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Gerenciar Temas PTR</span>
            <Badge variant="secondary">
              {temas.length} tema{temas.length !== 1 ? 's' : ''}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col flex-1 space-y-4">
          {/* Adicionar novo tema */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <Label htmlFor="novo-tema">Adicionar Novo Tema</Label>
                <div className="flex space-x-2">
                  <Input
                    id="novo-tema"
                    value={novoTema}
                    onChange={(e) => setNovoTema(e.target.value)}
                    placeholder="Digite o nome do novo tema..."
                    onKeyDown={(e) => e.key === 'Enter' && handleAdicionarTema()}
                  />
                  <Button onClick={handleAdicionarTema} disabled={!novoTema.trim()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filtro e ações */}
          <div className="flex items-center justify-between space-x-4">
            <div className="flex-1">
              <Input
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                placeholder="Filtrar temas..."
              />
            </div>
            <Button variant="outline" onClick={handleResetarTemas}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Resetar para Padrão
            </Button>
          </div>

          {/* Lista de temas */}
          <ScrollArea className="flex-1 border rounded-lg">
            <div className="p-4 space-y-2">
              {temasFiltrados.length > 0 ? (
                temasFiltrados.map((tema, index) => {
                  const indexOriginal = temas.indexOf(tema);
                  const isEditing = editandoTema?.index === indexOriginal;
                  
                  return (
                    <Card key={indexOriginal} className="relative">
                      <CardContent className="p-3">
                        {isEditing ? (
                          <div className="flex items-center space-x-2">
                            <Input
                              value={editandoTema.valor}
                              onChange={(e) => setEditandoTema(prev => 
                                prev ? { ...prev, valor: e.target.value } : null
                              )}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSalvarEdicao();
                                if (e.key === 'Escape') setEditandoTema(null);
                              }}
                              autoFocus
                            />
                            <Button size="sm" onClick={handleSalvarEdicao}>
                              <Save className="w-3 h-3" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setEditandoTema(null)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-sm font-medium">{tema}</p>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditarTema(indexOriginal)}
                              >
                                <Edit2 className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleExcluirTema(indexOriginal)}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Nenhum tema encontrado</p>
                  {filtro && (
                    <p className="text-sm">Tente ajustar o filtro</p>
                  )}
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Footer com estatísticas */}
          <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
            <div>
              Total de temas: <strong>{temas.length}</strong>
            </div>
            <div>
              Mostrando: <strong>{temasFiltrados.length}</strong>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export { TEMAS_PTR_PADRAO };