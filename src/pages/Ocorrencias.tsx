import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { TextareaWithAI } from "@/components/ui/textarea-with-ai";
import { Plus, Search, Clock, Users, AlertTriangle, BarChart3, List, MapPin, Filter, MoreHorizontal, Eye, Edit, Grid, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import OcorrenciasDashboard from "@/components/OcorrenciasDashboard";

// Função para calcular duração entre dois horários
const calculateDuration = (horaInicio?: string, horaFim?: string): string => {
  if (!horaInicio || !horaFim) return "--";
  
  const [horaInicioH, horaInicioM] = horaInicio.split(":").map(Number);
  const [horaFimH, horaFimM] = horaFim.split(":").map(Number);
  
  const inicioMinutos = horaInicioH * 60 + horaInicioM;
  const fimMinutos = horaFimH * 60 + horaFimM;
  
  let diferencaMinutos = fimMinutos - inicioMinutos;
  
  // Se a diferença for negativa, assumir que passou para o próximo dia
  if (diferencaMinutos < 0) {
    diferencaMinutos += 24 * 60;
  }
  
  const horas = Math.floor(diferencaMinutos / 60);
  const minutos = diferencaMinutos % 60;
  
  return `${horas.toString().padStart(2, "0")}:${minutos.toString().padStart(2, "0")}`;
};

// Tipos de ocorrencia conforme especificado
const TIPOS_OCORRENCIA = [
  "Atendimento a Aeronave Presidencial",
  "Condicoes de Baixa Visibilidade",
  "Emergencias Medicas em Geral",
  "Iluminacao de Emergencia em Pista de Pouso e Decolagem",
  "Incendio em Instalacoes Aeroportuarias",
  "Incendios Florestais ou em Areas de Cobertura Vegetal Proximas ao Aerodromo",
  "Incendios ou Vazamentos de Combustiveis no Patio de Aeronaves (PAA)",
  "Ocorrencias com Artigos Perigosos",
  "Remocao de Animais e Dispersao de Avifauna"
];

const EQUIPES = ["Alfa", "Bravo", "Charlie", "Delta"];

const formSchema = z.object({
  tipo_ocorrencia: z.string().min(1, "Selecione o tipo de ocorrencia"),
  local_mapa_grade: z.string().optional(),
  data_ocorrencia: z.string().min(1, "Informe a data da ocorrencia"),
  hora_acionamento: z.string().min(1, "Informe a hora do acionamento"),
  hora_chegada_local: z.string().optional(),
  hora_termino: z.string().optional(),
  equipe: z.string().min(1, "Selecione a equipe"),
  bombeiros_envolvidos: z.array(z.string()).default([]),
  quantidade_vitimas: z.number().min(0).default(0),
  quantidade_obitos: z.number().min(0).default(0),
  viaturas: z.string().optional(),
  equipamentos: z.string().optional(),
  descricao_inicial: z.string().optional(),
  descricao_detalhada: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface Ocorrencia {
  id: string;
  tipo_ocorrencia: string;
  local_mapa_grade?: string;
  data_ocorrencia: string;
  hora_acionamento: string;
  hora_chegada_local?: string;
  hora_termino?: string;
  tempo_gasto_minutos?: number;
  equipe: string;
  bombeiros_envolvidos: string[];
  quantidade_bombeiros: number;
  quantidade_vitimas: number;
  quantidade_obitos: number;
  viaturas?: string;
  equipamentos?: string;
  descricao_inicial?: string;
  descricao_detalhada?: string;
  created_at: string;
}

interface Bombeiro {
  id: string;
  nome: string;
  equipe: string;
}

const Ocorrencias = () => {
  const [ocorrencias, setOcorrencias] = useState<Ocorrencia[]>([]);
  const [bombeiros, setBombeiros] = useState<Bombeiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOcorrencia, setSelectedOcorrencia] = useState<Ocorrencia | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEquipe, setFilterEquipe] = useState<string>("all");
  const [filterTipo, setFilterTipo] = useState<string>("all");
  
  // Navegacao
  const [activeSection, setActiveSection] = useState<'dashboard' | 'ocorrencias'>('dashboard');

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tipo_ocorrencia: "",
      local_mapa_grade: "",
      data_ocorrencia: "",
      hora_acionamento: "",
      hora_chegada_local: "",
      hora_termino: "",
      equipe: "",
      bombeiros_envolvidos: [],
      quantidade_vitimas: 0,
      quantidade_obitos: 0,
      viaturas: "",
      equipamentos: "",
      descricao_inicial: "",
      descricao_detalhada: "",
    },
  });

  const selectedEquipe = form.watch("equipe");
  const horaAcionamento = form.watch("hora_acionamento");
  const horaTermino = form.watch("hora_termino");

  useEffect(() => {
    fetchOcorrencias();
    fetchBombeiros();
  }, []);

  const fetchOcorrencias = async () => {
    try {
      const { data, error } = await supabase
        .from('ocorrencias')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOcorrencias(data || []);
    } catch (error) {
      console.error("Erro ao carregar ocorrencias:", error);
      toast({
        variant: "destructive",
        description: "Erro ao carregar ocorrencias",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBombeiros = async () => {
    try {
      const { data, error } = await supabase
        .from('bombeiros')
        .select('*')
        .order('nome');

      if (error) throw error;
      setBombeiros(data || []);
    } catch (error) {
      console.error("Erro ao carregar bombeiros:", error);
    }
  };

  const calculateTempoGasto = (acionamento: string, termino?: string) => {
    if (!termino) return undefined;
    
    const [horaA, minA] = acionamento.split(':').map(Number);
    const [horaT, minT] = termino.split(':').map(Number);
    
    const minutosA = horaA * 60 + minA;
    const minutosT = horaT * 60 + minT;
    
    return minutosT - minutosA;
  };

  const onSubmit = async (values: FormData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario nao autenticado");

      const tempoGasto = calculateTempoGasto(values.hora_acionamento, values.hora_termino);
      
      const ocorrenciaData = {
        ...values,
        tempo_gasto_minutos: tempoGasto,
        quantidade_bombeiros: values.bombeiros_envolvidos.length,
        user_id: user.id
      };

      const { error } = await supabase
        .from('ocorrencias')
        .insert({
          tipo_ocorrencia: values.tipo_ocorrencia,
          local_mapa_grade: values.local_mapa_grade,
          data_ocorrencia: values.data_ocorrencia,
          hora_acionamento: values.hora_acionamento,
          hora_chegada_local: values.hora_chegada_local,
          hora_termino: values.hora_termino,
          tempo_gasto_minutos: tempoGasto,
          equipe: values.equipe,
          bombeiros_envolvidos: values.bombeiros_envolvidos,
          quantidade_bombeiros: values.bombeiros_envolvidos.length,
          quantidade_vitimas: values.quantidade_vitimas,
          quantidade_obitos: values.quantidade_obitos,
          viaturas: values.viaturas,
          equipamentos: values.equipamentos,
          descricao_inicial: values.descricao_inicial,
          descricao_detalhada: values.descricao_detalhada,
          user_id: user.id
        });

      if (error) throw error;

      toast({
        description: "Ocorrencia registrada com sucesso!",
      });

      form.reset();
      setIsModalOpen(false);
      fetchOcorrencias();
    } catch (error) {
      console.error("Erro ao registrar ocorrencia:", error);
      toast({
        variant: "destructive",
        description: "Erro ao registrar ocorrencia",
      });
    }
  };

  const handleViewOcorrencia = (ocorrencia: Ocorrencia) => {
    setSelectedOcorrencia(ocorrencia);
    setIsViewModalOpen(true);
  };

  const handleEditOcorrencia = (ocorrencia: Ocorrencia) => {
    setSelectedOcorrencia(ocorrencia);
    
    // Preencher o formulario com os dados da ocorrencia
    form.reset({
      tipo_ocorrencia: ocorrencia.tipo_ocorrencia,
      local_mapa_grade: ocorrencia.local_mapa_grade || "",
      data_ocorrencia: ocorrencia.data_ocorrencia,
      hora_acionamento: ocorrencia.hora_acionamento,
      hora_chegada_local: ocorrencia.hora_chegada_local || "",
      hora_termino: ocorrencia.hora_termino || "",
      equipe: ocorrencia.equipe,
      bombeiros_envolvidos: ocorrencia.bombeiros_envolvidos,
      quantidade_vitimas: ocorrencia.quantidade_vitimas,
      quantidade_obitos: ocorrencia.quantidade_obitos,
      viaturas: ocorrencia.viaturas || "",
      equipamentos: ocorrencia.equipamentos || "",
      descricao_inicial: ocorrencia.descricao_inicial || "",
      descricao_detalhada: ocorrencia.descricao_detalhada || "",
    });
    
    setIsEditModalOpen(true);
  };

  const handleDeleteOcorrencia = async (ocorrencia: Ocorrencia) => {
    const confirmDelete = window.confirm(
      `Tem certeza que deseja excluir a ocorrência "${ocorrencia.tipo_ocorrencia}" do dia ${format(new Date(ocorrencia.data_ocorrencia), 'dd/MM/yyyy', { locale: ptBR })}?\n\nEsta ação não pode ser desfeita.`
    );

    if (!confirmDelete) return;

    try {
      const { error } = await supabase
        .from('ocorrencias')
        .delete()
        .eq('id', ocorrencia.id);

      if (error) {
        console.error('Erro ao excluir ocorrência:', error);
        toast({
          title: "Erro ao excluir",
          description: "Não foi possível excluir a ocorrência. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      // Atualizar a lista de ocorrências
      await fetchOcorrencias();
      
      toast({
        title: "Ocorrência excluída",
        description: "A ocorrência foi excluída com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao excluir ocorrência:', error);
      toast({
        title: "Erro ao excluir",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const onSubmitEdit = async (values: FormData) => {
    if (!selectedOcorrencia) return;
    
    try {
      const tempoGasto = calculateTempoGasto(values.hora_acionamento, values.hora_termino);
      
      const ocorrenciaData = {
        ...values,
        tempo_gasto_minutos: tempoGasto,
        quantidade_bombeiros: values.bombeiros_envolvidos.length,
      };

      const { error } = await supabase
        .from('ocorrencias')
        .update(ocorrenciaData)
        .eq('id', selectedOcorrencia.id);

      if (error) throw error;

      toast({
        description: "Ocorrencia atualizada com sucesso!",
      });

      setIsEditModalOpen(false);
      setSelectedOcorrencia(null);
      fetchOcorrencias();
    } catch (error) {
      console.error("Erro ao atualizar ocorrencia:", error);
      toast({
        variant: "destructive",
        description: "Erro ao atualizar ocorrencia",
      });
    }
  };

  const filteredOcorrencias = ocorrencias.filter((ocorrencia) => {
    const matchesSearch = ocorrencia.tipo_ocorrencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (ocorrencia.local_mapa_grade && ocorrencia.local_mapa_grade.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         ocorrencia.equipe.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEquipe = filterEquipe === "all" || ocorrencia.equipe === filterEquipe;
    const matchesTipo = filterTipo === "all" || ocorrencia.tipo_ocorrencia === filterTipo;
    
    return matchesSearch && matchesEquipe && matchesTipo;
  });

  const bombeirosByEquipe = bombeiros.filter(bombeiro => 
    selectedEquipe ? bombeiro.equipe === selectedEquipe : true
  );

  if (loading) {
    return <div className="flex items-center justify-center h-64">Carregando...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Sistema de Ocorrencias
          </CardTitle>
          <p className="text-muted-foreground">
            Sistema completo de registro e acompanhamento de emergencias
          </p>
        </CardHeader>
      </Card>

      <div className="bg-muted rounded-lg p-1.5 mb-6">
        <div className="grid w-full grid-cols-2 gap-1">
          <button
            onClick={() => setActiveSection('dashboard')}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
              activeSection === 'dashboard'
                ? 'bg-background text-foreground shadow-sm border border-border/50'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
          <button
            onClick={() => setActiveSection('ocorrencias')}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
              activeSection === 'ocorrencias'
                ? 'bg-background text-foreground shadow-sm border border-border/50'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span className="hidden sm:inline">Ocorrencias</span>
          </button>
        </div>
      </div>

      {activeSection === 'dashboard' ? (
        <div className="space-y-6">
          <OcorrenciasDashboard />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold">Ocorrencias</h1>
              <p className="text-sm text-muted-foreground">
                Registro e acompanhamento de emergencias
              </p>
              <p className="text-muted-foreground">
                Gerencie relatorios pos-ocorrencia e acompanhe indicadores
              </p>
            </div>
            
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nova Ocorrencia
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Registrar Nova Ocorrencia</DialogTitle>
                  <DialogDescription>
                    Preencha as informacoes da ocorrencia atendida
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="space-y-4 border rounded-lg p-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
                        <MapPin className="h-5 w-5" />
                        Informacoes Iniciais
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="tipo_ocorrencia"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo de Ocorrencia</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione o tipo" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {TIPOS_OCORRENCIA.map((tipo) => (
                                    <SelectItem key={tipo} value={tipo}>
                                      {tipo}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="local_mapa_grade"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Local (Mapa de Grade)</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Ex: Grade A-5, Setor Norte" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="data_ocorrencia"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Data da Ocorrencia</FormLabel>
                              <FormControl>
                                <Input {...field} type="date" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-4 border rounded-lg p-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
                        <Clock className="h-5 w-5" />
                        Controle de Horarios
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name="hora_acionamento"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Hora do Acionamento</FormLabel>
                              <FormControl>
                                <Input {...field} type="time" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="hora_chegada_local"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Hora da Chegada ao Local</FormLabel>
                              <FormControl>
                                <Input {...field} type="time" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="hora_termino"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Hora do Termino</FormLabel>
                              <FormControl>
                                <Input {...field} type="time" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {horaAcionamento && horaTermino && (
                        <div className="mt-4 p-3 bg-secondary/20 rounded-lg border border-secondary">
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <Clock className="h-4 w-4 text-primary" />
                            <span>Duracao Total da Ocorrencia:</span>
                            <span className="text-primary font-bold">
                              {(() => {
                                const duracao = calculateTempoGasto(horaAcionamento, horaTermino);
                                if (duracao && duracao > 0) {
                                  const horas = Math.floor(duracao / 60);
                                  const minutos = duracao % 60;
                                  return `${horas}h ${minutos}min`;
                                }
                                return "Calcular duracao";
                              })()}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4 border rounded-lg p-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
                        <Users className="h-5 w-5" />
                        Equipe e Recursos
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="equipe"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Equipe</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione a equipe" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {EQUIPES.map((equipe) => (
                                    <SelectItem key={equipe} value={equipe}>
                                      {equipe}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="bombeiros_envolvidos"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bombeiros Envolvidos</FormLabel>
                              <Select 
                                onValueChange={(value) => {
                                  const current = field.value || [];
                                  if (!current.includes(value)) {
                                    field.onChange([...current, value]);
                                  }
                                }}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione os bombeiros" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {bombeirosByEquipe.map((bombeiro) => (
                                    <SelectItem key={bombeiro.id} value={bombeiro.id}>
                                      {bombeiro.nome}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <div className="flex flex-wrap gap-2 mt-2">
                                {(field.value || []).map((bombeiroId) => {
                                  const bombeiro = bombeiros.find(b => b.id === bombeiroId);
                                  return bombeiro ? (
                                    <Badge key={bombeiroId} variant="secondary" className="gap-1">
                                      {bombeiro.nome}
                                      <button
                                        type="button"
                                        onClick={() => field.onChange((field.value || []).filter(id => id !== bombeiroId))}
                                        className="ml-1 hover:bg-destructive/20 rounded-full"
                                      >
                                        ×
                                      </button>
                                    </Badge>
                                  ) : null;
                                })}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="viaturas"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Viaturas Utilizadas</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Ex: AB-01, AR-02" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="equipamentos"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Equipamentos Utilizados</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Ex: Espuma, Mangueiras, EPIs" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-4 border rounded-lg p-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
                        <AlertTriangle className="h-5 w-5" />
                        Dados da Ocorrencia
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="quantidade_vitimas"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quantidade de Vitimas</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="number" 
                                  min="0"
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="quantidade_obitos"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quantidade de Obitos</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="number" 
                                  min="0"
                                  onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="space-y-4 border rounded-lg p-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
                        <AlertTriangle className="h-5 w-5" />
                        Descricoes
                      </h3>
                      
                      <FormField
                        control={form.control}
                        name="descricao_inicial"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descricao Inicial</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Descricao inicial da ocorrencia..." />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="descricao_detalhada"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Descricao Detalhada</FormLabel>
                            <FormControl>
                              <TextareaWithAI {...field} placeholder="Descricao detalhada dos procedimentos realizados..." rows={4} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end gap-3">
                      <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit">Registrar Ocorrencia</Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar ocorrencias..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={filterEquipe} onValueChange={setFilterEquipe}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Equipes</SelectItem>
                  {EQUIPES.map((equipe) => (
                    <SelectItem key={equipe} value={equipe}>{equipe}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={filterTipo} onValueChange={setFilterTipo}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Tipos</SelectItem>
                  {TIPOS_OCORRENCIA.map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {filteredOcorrencias.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhuma ocorrencia encontrada</h3>
                <p className="text-muted-foreground text-center">
                  {searchTerm || filterEquipe !== "all" || filterTipo !== "all"
                    ? "Tente ajustar os filtros de busca"
                    : "Registre a primeira ocorrencia clicando no botao acima"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {filteredOcorrencias.map((ocorrencia) => (
                viewMode === 'grid' ? (
                  <Card key={ocorrencia.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base font-medium line-clamp-2">
                            {ocorrencia.tipo_ocorrencia}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {ocorrencia.local_mapa_grade || "Local nao informado"}
                          </p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewOcorrencia(ocorrencia)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditOcorrencia(ocorrencia)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteOcorrencia(ocorrencia)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Data:</span>
                          <span>{format(new Date(ocorrencia.data_ocorrencia), 'dd/MM/yyyy', { locale: ptBR })}</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Equipe:</span>
                          <Badge variant="outline">{ocorrencia.equipe}</Badge>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Acionamento:</span>
                          <span>{ocorrencia.hora_acionamento}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                          <div className="text-center">
                            <div className="text-lg font-semibold">{ocorrencia.quantidade_vitimas}</div>
                            <p className="text-muted-foreground">Vitimas</p>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold">{ocorrencia.quantidade_obitos}</div>
                            <p className="text-muted-foreground">Obitos</p>
                          </div>
                        </div>
                        
                        {ocorrencia.tempo_gasto_minutos && (
                          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                            <span>Duracao: {Math.floor(ocorrencia.tempo_gasto_minutos / 60)}h {ocorrencia.tempo_gasto_minutos % 60}min</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card key={ocorrencia.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                          <div className="md:col-span-2">
                            <div className="font-medium line-clamp-1">{ocorrencia.tipo_ocorrencia}</div>
                            <div className="text-sm text-muted-foreground">
                              {format(new Date(ocorrencia.data_ocorrencia), 'dd/MM/yyyy', { locale: ptBR })}
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <Badge variant="outline">{ocorrencia.equipe}</Badge>
                          </div>
                          
                          <div className="text-center text-sm">
                            {ocorrencia.hora_acionamento}
                          </div>
                          
                          <div className="text-center">
                            {ocorrencia.tempo_gasto_minutos ? (
                              <span className="text-sm">
                                {Math.floor(ocorrencia.tempo_gasto_minutos / 60)}h {ocorrencia.tempo_gasto_minutos % 60}min
                              </span>
                            ) : (
                              <span className="text-sm text-muted-foreground">-</span>
                            )}
                          </div>
                          
                          <div className="text-center text-sm">
                            <span className="mr-2">V: {ocorrencia.quantidade_vitimas}</span>
                            <span>O: {ocorrencia.quantidade_obitos}</span>
                          </div>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewOcorrencia(ocorrencia)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditOcorrencia(ocorrencia)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                )
              ))}
            </div>
          )}

          <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Detalhes da Ocorrencia</DialogTitle>
                <DialogDescription>
                  Visualizacao completa dos dados da ocorrencia
                </DialogDescription>
              </DialogHeader>
              
              {selectedOcorrencia && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Tipo de Ocorrencia</label>
                        <p className="text-sm mt-1">{selectedOcorrencia.tipo_ocorrencia}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Local</label>
                        <p className="text-sm mt-1">{selectedOcorrencia.local_mapa_grade || "Nao informado"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Data</label>
                        <p className="text-sm mt-1">
                          {format(new Date(selectedOcorrencia.data_ocorrencia), 'dd/MM/yyyy', { locale: ptBR })}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Equipe</label>
                        <p className="text-sm mt-1">{selectedOcorrencia.equipe}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Acionamento</label>
                        <p className="text-sm mt-1">{selectedOcorrencia.hora_acionamento}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Chegada ao Local</label>
                        <p className="text-sm mt-1">{selectedOcorrencia.hora_chegada_local || "Nao informado"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Termino</label>
                        <p className="text-sm mt-1">{selectedOcorrencia.hora_termino || "Nao informado"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Duracao Total</label>
                        <p className="text-sm mt-1">
                          {selectedOcorrencia.tempo_gasto_minutos 
                            ? `${Math.floor(selectedOcorrencia.tempo_gasto_minutos / 60)}h ${selectedOcorrencia.tempo_gasto_minutos % 60}min`
                            : "Nao calculado"}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Viaturas</label>
                      <p className="text-sm mt-1">{selectedOcorrencia.viaturas || "Nao informado"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Equipamentos</label>
                      <p className="text-sm mt-1">{selectedOcorrencia.equipamentos || "Nao informado"}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Vitimas</label>
                      <p className="text-sm mt-1">{selectedOcorrencia.quantidade_vitimas}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Obitos</label>
                      <p className="text-sm mt-1">{selectedOcorrencia.quantidade_obitos}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Descricao Inicial</label>
                      <p className="text-sm mt-1">{selectedOcorrencia.descricao_inicial || "Nao informado"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Descricao Detalhada</label>
                      <p className="text-sm mt-1">{selectedOcorrencia.descricao_detalhada || "Nao informado"}</p>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Editar Ocorrencia</DialogTitle>
                <DialogDescription>
                  Atualize as informacoes da ocorrencia
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitEdit)} className="space-y-6">
                  <div className="space-y-4 border rounded-lg p-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
                      <AlertTriangle className="h-5 w-5" />
                      Informacoes Iniciais
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="tipo_ocorrencia"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de Ocorrencia</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {TIPOS_OCORRENCIA.map((tipo) => (
                                  <SelectItem key={tipo} value={tipo}>
                                    {tipo}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="local_mapa_grade"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Local (Mapa/Grade)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Ex: Pista 11L/29R, Terminal 1" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="data_ocorrencia"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data da Ocorrencia</FormLabel>
                            <FormControl>
                              <Input {...field} type="date" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4 border rounded-lg p-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
                      <Clock className="h-5 w-5" />
                      Controle de Horarios
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="hora_acionamento"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hora do Acionamento</FormLabel>
                            <FormControl>
                              <Input {...field} type="time" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="hora_chegada_local"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hora da Chegada ao Local</FormLabel>
                            <FormControl>
                              <Input {...field} type="time" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="hora_termino"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hora do Termino</FormLabel>
                            <FormControl>
                              <Input {...field} type="time" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {form.watch("hora_acionamento") && form.watch("hora_termino") && (
                      <div className="bg-muted p-3 rounded-md">
                        <p className="text-sm text-muted-foreground">
                          <strong>Duracao Total:</strong> {calculateDuration(form.watch("hora_acionamento"), form.watch("hora_termino"))}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 border rounded-lg p-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
                      <Users className="h-5 w-5" />
                      Equipe e Recursos
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="equipe"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Equipe</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione a equipe" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {EQUIPES.map((equipe) => (
                                  <SelectItem key={equipe} value={equipe}>
                                    {equipe}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bombeiros_envolvidos"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bombeiros Envolvidos</FormLabel>
                            <Select 
                              onValueChange={(value) => {
                                const current = field.value || [];
                                if (!current.includes(value)) {
                                  field.onChange([...current, value]);
                                }
                              }}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione os bombeiros" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {bombeirosByEquipe.map((bombeiro) => (
                                  <SelectItem key={bombeiro.id} value={bombeiro.id}>
                                    {bombeiro.nome}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {(field.value || []).map((bombeiroId) => {
                                const bombeiro = bombeiros.find(b => b.id === bombeiroId);
                                return bombeiro ? (
                                  <Badge key={bombeiroId} variant="secondary" className="gap-1">
                                    {bombeiro.nome}
                                    <button
                                      type="button"
                                      onClick={() => field.onChange((field.value || []).filter(id => id !== bombeiroId))}
                                      className="ml-1 hover:bg-destructive/20 rounded-full"
                                    >
                                      ×
                                    </button>
                                  </Badge>
                                ) : null;
                              })}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="viaturas"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Viaturas Utilizadas</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Ex: ABT-01, ABT-02" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="equipamentos"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Equipamentos Utilizados</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Ex: Espuma, Mangueiras, EPIs" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4 border rounded-lg p-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
                      <AlertTriangle className="h-5 w-5" />
                      Dados da Ocorrencia
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="quantidade_vitimas"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantidade de Vitimas</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number" 
                                min="0"
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="quantidade_obitos"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantidade de Obitos</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number" 
                                min="0"
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4 border rounded-lg p-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
                      <AlertTriangle className="h-5 w-5" />
                      Descricoes
                    </h3>
                    
                    <FormField
                      control={form.control}
                      name="descricao_inicial"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descricao Inicial</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Descricao inicial da ocorrencia..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="descricao_detalhada"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descricao Detalhada</FormLabel>
                          <FormControl>
                            <TextareaWithAI {...field} placeholder="Descricao detalhada dos procedimentos realizados..." rows={4} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">Salvar Alteracoes</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
};

export default Ocorrencias;