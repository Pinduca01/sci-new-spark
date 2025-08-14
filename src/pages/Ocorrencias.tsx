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
import { Plus, Search, Clock, Users, AlertTriangle, Grid, List, MapPin, Filter, MoreHorizontal, Eye, Edit } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Tipos de ocorrência conforme especificado
const TIPOS_OCORRENCIA = [
  "Atendimento à Aeronave Presidencial",
  "Condições de Baixa Visibilidade",
  "Emergências Médicas em Geral",
  "Iluminação de Emergência em Pista de Pouso e Decolagem",
  "Incêndio em Instalações Aeroportuárias",
  "Incêndios Florestais ou em Áreas de Cobertura Vegetal Próximas ao Aeródromo",
  "Incêndios ou Vazamentos de Combustíveis no Pátio de Aeronaves (PAA)",
  "Ocorrências com Artigos Perigosos",
  "Remoção de Animais e Dispersão de Avifauna"
];

const EQUIPES = ["Alfa", "Bravo", "Charlie", "Delta"];

const formSchema = z.object({
  tipo_ocorrencia: z.string().min(1, "Selecione o tipo de ocorrência"),
  local_mapa_grade: z.string().optional(),
  data_ocorrencia: z.string().min(1, "Informe a data da ocorrência"),
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

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bombeiros_envolvidos: [],
      quantidade_vitimas: 0,
      quantidade_obitos: 0,
    },
  });

  const selectedEquipe = form.watch("equipe");
  const horaAcionamento = form.watch("hora_acionamento");
  const horaTermino = form.watch("hora_termino");

  useEffect(() => {
    console.log('Ocorrencias useEffect running...');
    fetchOcorrencias();
    fetchBombeiros();
  }, []);

  const fetchOcorrencias = async () => {
    console.log('Fetching ocorrencias...');
    try {
      const { data, error } = await supabase
        .from("ocorrencias")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      console.log('Ocorrencias loaded:', data);
      setOcorrencias(data || []);
    } catch (error) {
      console.error("Erro ao carregar ocorrências:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar ocorrências",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchBombeiros = async () => {
    try {
      const { data, error } = await supabase
        .from("bombeiros")
        .select("id, nome, equipe")
        .eq("status", "ativo");

      if (error) throw error;
      setBombeiros(data || []);
    } catch (error) {
      console.error("Erro ao carregar bombeiros:", error);
    }
  };

  const calculateTempoGasto = (acionamento: string, termino?: string) => {
    if (!termino) return null;
    
    const [horaAcionamento, minutoAcionamento] = acionamento.split(':').map(Number);
    const [horaTermino, minutoTermino] = termino.split(':').map(Number);
    
    const minutosTotalAcionamento = horaAcionamento * 60 + minutoAcionamento;
    const minutosTotalTermino = horaTermino * 60 + minutoTermino;
    
    return minutosTotalTermino - minutosTotalAcionamento;
  };

  const onSubmit = async (values: FormData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const tempoGasto = calculateTempoGasto(values.hora_acionamento, values.hora_termino);

      const ocorrenciaData = {
        tipo_ocorrencia: values.tipo_ocorrencia,
        local_mapa_grade: values.local_mapa_grade,
        data_ocorrencia: values.data_ocorrencia,
        hora_acionamento: values.hora_acionamento,
        hora_chegada_local: values.hora_chegada_local,
        hora_termino: values.hora_termino,
        equipe: values.equipe,
        bombeiros_envolvidos: values.bombeiros_envolvidos,
        viaturas: values.viaturas,
        equipamentos: values.equipamentos,
        descricao_inicial: values.descricao_inicial,
        descricao_detalhada: values.descricao_detalhada,
        user_id: user.id,
        quantidade_bombeiros: values.bombeiros_envolvidos.length,
        tempo_gasto_minutos: tempoGasto,
        quantidade_vitimas: Number(values.quantidade_vitimas),
        quantidade_obitos: Number(values.quantidade_obitos),
      };

      const { error } = await supabase
        .from("ocorrencias")
        .insert([ocorrenciaData]);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Ocorrência registrada com sucesso!",
      });
      setIsModalOpen(false);
      form.reset();
      fetchOcorrencias();
    } catch (error) {
      console.error("Erro ao registrar ocorrência:", error);
      toast({
        title: "Erro",
        description: "Erro ao registrar ocorrência",
        variant: "destructive",
      });
    }
  };

  const handleViewOcorrencia = (ocorrencia: Ocorrencia) => {
    setSelectedOcorrencia(ocorrencia);
    setIsViewModalOpen(true);
  };

  const handleEditOcorrencia = (ocorrencia: Ocorrencia) => {
    setSelectedOcorrencia(ocorrencia);
    
    // Preencher o formulário com os dados da ocorrência
    form.reset({
      tipo_ocorrencia: ocorrencia.tipo_ocorrencia,
      local_mapa_grade: ocorrencia.local_mapa_grade || "",
      data_ocorrencia: ocorrencia.data_ocorrencia,
      hora_acionamento: ocorrencia.hora_acionamento,
      hora_chegada_local: ocorrencia.hora_chegada_local || "",
      hora_termino: ocorrencia.hora_termino || "",
      equipe: ocorrencia.equipe,
      bombeiros_envolvidos: ocorrencia.bombeiros_envolvidos || [],
      quantidade_vitimas: ocorrencia.quantidade_vitimas,
      quantidade_obitos: ocorrencia.quantidade_obitos,
      viaturas: ocorrencia.viaturas || "",
      equipamentos: ocorrencia.equipamentos || "",
      descricao_inicial: ocorrencia.descricao_inicial || "",
      descricao_detalhada: ocorrencia.descricao_detalhada || "",
    });
    
    setIsEditModalOpen(true);
  };

  const onSubmitEdit = async (values: FormData) => {
    if (!selectedOcorrencia) return;

    try {
      const tempoGasto = calculateTempoGasto(values.hora_acionamento, values.hora_termino);

      const ocorrenciaData = {
        tipo_ocorrencia: values.tipo_ocorrencia,
        local_mapa_grade: values.local_mapa_grade,
        data_ocorrencia: values.data_ocorrencia,
        hora_acionamento: values.hora_acionamento,
        hora_chegada_local: values.hora_chegada_local,
        hora_termino: values.hora_termino,
        equipe: values.equipe,
        bombeiros_envolvidos: values.bombeiros_envolvidos,
        viaturas: values.viaturas,
        equipamentos: values.equipamentos,
        descricao_inicial: values.descricao_inicial,
        descricao_detalhada: values.descricao_detalhada,
        quantidade_bombeiros: values.bombeiros_envolvidos.length,
        tempo_gasto_minutos: tempoGasto,
        quantidade_vitimas: Number(values.quantidade_vitimas),
        quantidade_obitos: Number(values.quantidade_obitos),
      };

      const { error } = await supabase
        .from("ocorrencias")
        .update(ocorrenciaData)
        .eq("id", selectedOcorrencia.id);

      if (error) throw error;
      
      toast({
        title: "Sucesso", 
        description: "Ocorrência atualizada com sucesso!",
      });
      setIsEditModalOpen(false);
      setSelectedOcorrencia(null);
      form.reset();
      fetchOcorrencias();
    } catch (error) {
      console.error("Erro ao atualizar ocorrência:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar ocorrência",
        variant: "destructive",
      });
    }
  };

  const filteredOcorrencias = ocorrencias.filter((ocorrencia) => {
    const matchesSearch = 
      ocorrencia.tipo_ocorrencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ocorrencia.local_mapa_grade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ocorrencia.equipe.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEquipe = filterEquipe === "all" || ocorrencia.equipe === filterEquipe;
    const matchesTipo = filterTipo === "all" || ocorrencia.tipo_ocorrencia === filterTipo;

    return matchesSearch && matchesEquipe && matchesTipo;
  });

  const bombeirosByEquipe = bombeiros.filter(bombeiro => 
    selectedEquipe ? bombeiro.equipe === selectedEquipe : true
  );

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  return (
    <div className="space-y-6 p-6 relative z-30">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ocorrências</h1>
          <p className="text-sm text-muted-foreground">
            Registro e acompanhamento de emergências
          </p>
          <p className="text-muted-foreground">
            Gerencie relatórios pós-ocorrência e acompanhe indicadores
          </p>
        </div>
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Ocorrência
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registrar Nova Ocorrência</DialogTitle>
              <DialogDescription>
                Preencha as informações da ocorrência atendida
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Informações Iniciais */}
                <div className="space-y-4 border rounded-lg p-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
                    <MapPin className="h-5 w-5" />
                    Informações Iniciais
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="tipo_ocorrencia"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Ocorrência</FormLabel>
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
                          <FormLabel>Data da Ocorrência</FormLabel>
                          <FormControl>
                            <Input {...field} type="date" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Controle de Horários */}
                <div className="space-y-4 border rounded-lg p-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
                    <Clock className="h-5 w-5" />
                    Controle de Horários
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
                          <FormLabel>Hora do Término</FormLabel>
                          <FormControl>
                            <Input {...field} type="time" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Caixa de Duração */}
                  {horaAcionamento && horaTermino && (
                    <div className="mt-4 p-3 bg-secondary/20 rounded-lg border border-secondary">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Clock className="h-4 w-4 text-primary" />
                        <span>Duração Total da Ocorrência:</span>
                        <span className="text-primary font-bold">
                          {(() => {
                            const duracao = calculateTempoGasto(horaAcionamento, horaTermino);
                            if (duracao !== null && duracao >= 0) {
                              const horas = Math.floor(duracao / 60);
                              const minutos = duracao % 60;
                              return `${horas}h ${minutos}min`;
                            }
                            return "Calcular duração";
                          })()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Equipe e Recursos */}
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
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                                <Badge key={bombeiroId} variant="secondary" className="cursor-pointer"
                                  onClick={() => {
                                    field.onChange(field.value.filter(id => id !== bombeiroId));
                                  }}>
                                  {bombeiro.nome} ×
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

                {/* Dados da Ocorrência */}
                <div className="space-y-4 border rounded-lg p-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
                    <AlertTriangle className="h-5 w-5" />
                    Dados da Ocorrência
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="quantidade_vitimas"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantidade de Vítimas</FormLabel>
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
                          <FormLabel>Quantidade de Óbitos</FormLabel>
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

                {/* Descrições */}
                <div className="space-y-4 border rounded-lg p-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
                    <AlertTriangle className="h-5 w-5" />
                    Descrições
                  </h3>
                  
                  <FormField
                    control={form.control}
                    name="descricao_inicial"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição Inicial</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Descrição inicial da ocorrência..." />
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
                        <FormLabel>Descrição Detalhada</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Descrição detalhada dos procedimentos realizados..." rows={4} />
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
                  <Button type="submit">Registrar Ocorrência</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

      </div>


      {/* Filtros e Busca */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar ocorrências..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <Select value={filterEquipe} onValueChange={setFilterEquipe}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Equipe" />
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
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Tipos</SelectItem>
              {TIPOS_OCORRENCIA.map((tipo) => (
                <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Lista de Ocorrências */}
      {filteredOcorrencias.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma ocorrência encontrada</h3>
            <p className="text-muted-foreground text-center">
              {ocorrencias.length === 0 
                ? "Registre a primeira ocorrência clicando no botão acima" 
                : "Tente ajustar os filtros de busca"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
            : "space-y-2"
        }>
          {filteredOcorrencias.map((ocorrencia) => (
            viewMode === 'grid' ? (
              // Visualização em Card (Grid)
              <Card key={ocorrencia.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg line-clamp-2">
                        {ocorrencia.tipo_ocorrencia}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {ocorrencia.local_mapa_grade || "Local não informado"}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{ocorrencia.equipe}</Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
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
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Data</p>
                      <p className="font-medium">
                        {format(new Date(ocorrencia.data_ocorrencia), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Acionamento</p>
                      <p className="font-medium">{ocorrencia.hora_acionamento}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="text-center">
                      <p className="text-muted-foreground">Bombeiros</p>
                      <div className="flex items-center justify-center gap-1">
                        <Users className="h-4 w-4" />
                        <span className="font-medium">{ocorrencia.quantidade_bombeiros}</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">Vítimas</p>
                      <span className="font-medium">{ocorrencia.quantidade_vitimas}</span>
                    </div>
                    <div className="text-center">
                      <p className="text-muted-foreground">Óbitos</p>
                      <span className="font-medium text-destructive">{ocorrencia.quantidade_obitos}</span>
                    </div>
                  </div>

                  {ocorrencia.tempo_gasto_minutos && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Duração: {Math.floor(ocorrencia.tempo_gasto_minutos / 60)}h {ocorrencia.tempo_gasto_minutos % 60}min</span>
                    </div>
                  )}

                  {ocorrencia.descricao_inicial && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {ocorrencia.descricao_inicial}
                    </p>
                  )}
                </CardContent>
              </Card>
            ) : (
              // Visualização em Lista (Linha única)
              <Card key={ocorrencia.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Data */}
                    <div className="min-w-[80px] text-sm">
                      <p className="font-medium">
                        {format(new Date(ocorrencia.data_ocorrencia), "dd/MM", { locale: ptBR })}
                      </p>
                    </div>
                    
                    {/* Hora */}
                    <div className="min-w-[60px] text-sm text-muted-foreground">
                      {ocorrencia.hora_acionamento}
                    </div>
                    
                    {/* Equipe */}
                    <Badge variant="secondary" className="min-w-fit">
                      {ocorrencia.equipe}
                    </Badge>
                    
                    {/* Tipo de Ocorrência */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {ocorrencia.tipo_ocorrencia}
                      </p>
                    </div>
                    
                    {/* Local */}
                    <div className="min-w-[80px] text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">
                          {ocorrencia.local_mapa_grade || "N/A"}
                        </span>
                      </div>
                    </div>
                    
                    {/* Duração */}
                    <div className="min-w-[60px] text-sm text-muted-foreground">
                      {ocorrencia.tempo_gasto_minutos ? (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {Math.floor(ocorrencia.tempo_gasto_minutos / 60)}h{ocorrencia.tempo_gasto_minutos % 60}m
                          </span>
                        </div>
                      ) : (
                        "N/A"
                      )}
                    </div>
                    
                    {/* Estatísticas */}
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span className="font-medium">{ocorrencia.quantidade_bombeiros}</span>
                      </div>
                      <div className="text-muted-foreground">
                        V: {ocorrencia.quantidade_vitimas}
                      </div>
                      {ocorrencia.quantidade_obitos > 0 && (
                        <div className="text-destructive font-medium">
                          Ó: {ocorrencia.quantidade_obitos}
        </div>
      )}

      {/* Modal de Visualização */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Ocorrência</DialogTitle>
            <DialogDescription>
              Visualização completa dos dados da ocorrência
            </DialogDescription>
          </DialogHeader>
          
          {selectedOcorrencia && (
            <div className="space-y-6">
              {/* Informações Básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tipo de Ocorrência</label>
                  <p className="text-sm mt-1">{selectedOcorrencia.tipo_ocorrencia}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Local</label>
                  <p className="text-sm mt-1">{selectedOcorrencia.local_mapa_grade || "Não informado"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Data</label>
                  <p className="text-sm mt-1">
                    {format(new Date(selectedOcorrencia.data_ocorrencia), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Equipe</label>
                  <p className="text-sm mt-1">{selectedOcorrencia.equipe}</p>
                </div>
              </div>

              {/* Horários */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Acionamento</label>
                  <p className="text-sm mt-1">{selectedOcorrencia.hora_acionamento}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Chegada ao Local</label>
                  <p className="text-sm mt-1">{selectedOcorrencia.hora_chegada_local || "Não informado"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Término</label>
                  <p className="text-sm mt-1">{selectedOcorrencia.hora_termino || "Não informado"}</p>
                </div>
                {selectedOcorrencia.tempo_gasto_minutos && (
                  <div className="md:col-span-3">
                    <label className="text-sm font-medium text-muted-foreground">Duração Total</label>
                    <p className="text-sm mt-1">
                      {Math.floor(selectedOcorrencia.tempo_gasto_minutos / 60)}h {selectedOcorrencia.tempo_gasto_minutos % 60}min
                    </p>
                  </div>
                )}
              </div>

              {/* Recursos e Dados */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Viaturas</label>
                  <p className="text-sm mt-1">{selectedOcorrencia.viaturas || "Não informado"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Equipamentos</label>
                  <p className="text-sm mt-1">{selectedOcorrencia.equipamentos || "Não informado"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Quantidade de Bombeiros</label>
                  <p className="text-sm mt-1">{selectedOcorrencia.quantidade_bombeiros}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Vítimas</label>
                  <p className="text-sm mt-1">{selectedOcorrencia.quantidade_vitimas}</p>
                </div>
                {selectedOcorrencia.quantidade_obitos > 0 && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-muted-foreground">Óbitos</label>
                    <p className="text-sm mt-1 text-destructive font-medium">{selectedOcorrencia.quantidade_obitos}</p>
                  </div>
                )}
              </div>

              {/* Descrições */}
              <div className="space-y-4 p-4 border rounded-lg">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Descrição Inicial</label>
                  <p className="text-sm mt-1">{selectedOcorrencia.descricao_inicial || "Não informado"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Descrição Detalhada</label>
                  <p className="text-sm mt-1">{selectedOcorrencia.descricao_detalhada || "Não informado"}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Ocorrência</DialogTitle>
            <DialogDescription>
              Modifique as informações da ocorrência
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitEdit)} className="space-y-8">
              {/* Informações Iniciais */}
              <div className="space-y-4 border rounded-lg p-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
                  <MapPin className="h-5 w-5" />
                  Informações Iniciais
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="tipo_ocorrencia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Ocorrência</FormLabel>
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
                        <FormLabel>Data da Ocorrência</FormLabel>
                        <FormControl>
                          <Input {...field} type="date" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Controle de Horários */}
              <div className="space-y-4 border rounded-lg p-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
                  <Clock className="h-5 w-5" />
                  Controle de Horários
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
                        <FormLabel>Hora do Término</FormLabel>
                        <FormControl>
                          <Input {...field} type="time" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Caixa de Duração */}
                {horaAcionamento && horaTermino && (
                  <div className="mt-4 p-3 bg-secondary/20 rounded-lg border border-secondary">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>Duração Total da Ocorrência:</span>
                      <span className="text-primary font-bold">
                        {(() => {
                          const duracao = calculateTempoGasto(horaAcionamento, horaTermino);
                          if (duracao !== null && duracao >= 0) {
                            const horas = Math.floor(duracao / 60);
                            const minutos = duracao % 60;
                            return `${horas}h ${minutos}min`;
                          }
                          return "Calcular duração";
                        })()}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Equipe e Recursos */}
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
                              <Badge key={bombeiroId} variant="secondary" className="cursor-pointer"
                                onClick={() => {
                                  field.onChange(field.value.filter(id => id !== bombeiroId));
                                }}>
                                {bombeiro.nome} ×
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

              {/* Dados da Ocorrência */}
              <div className="space-y-4 border rounded-lg p-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
                  <AlertTriangle className="h-5 w-5" />
                  Dados da Ocorrência
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="quantidade_vitimas"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantidade de Vítimas</FormLabel>
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
                        <FormLabel>Quantidade de Óbitos</FormLabel>
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

              {/* Descrições */}
              <div className="space-y-4 border rounded-lg p-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
                  <AlertTriangle className="h-5 w-5" />
                  Descrições
                </h3>
                
                <FormField
                  control={form.control}
                  name="descricao_inicial"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição Inicial</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Descrição inicial da ocorrência..." />
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
                      <FormLabel>Descrição Detalhada</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Descrição detalhada dos procedimentos realizados..." rows={4} />
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
                <Button type="submit">Salvar Alterações</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
                  </div>
                  
                  {/* Menu de ações */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
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
              </Card>
            )
          ))}
        </div>
      )}
    </div>
  );
};

export default Ocorrencias;