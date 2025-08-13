import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Search, 
  Plus, 
  Users, 
  UserCheck, 
  UserX, 
  MoreVertical,
  Mail,
  Phone,
  Calendar as CalendarIcon,
  Car,
  Shield,
  Wrench,
  Clipboard,
  UserCog,
  Star,
  FileText
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Bombeiro = {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  telefone_sos?: string;
  matricula: string;
  funcao: string;
  funcao_completa: string;
  equipe: string;
  status: string;
  data_admissao: string;
  turno: string;
  ferista: boolean;
  data_curso_habilitacao?: string;
  data_vencimento_credenciamento?: string;
  proxima_atualizacao?: string;
  cve?: string;
  data_aso?: string;
  documentos_certificados?: string[];
  avatar: string;
};

const ControlePessoal = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("todos");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [bombeiros, setBombeiros] = useState<Bombeiro[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [newPersonnel, setNewPersonnel] = useState({
    nome: "",
    email: "",
    telefone: "",
    telefone_sos: "",
    matricula: "",
    funcao: "",
    equipe: "",
    status: "Ativo",
    dataAdmissao: null as Date | null,
    turno: "",
    ferista: false,
    dataCursoHabilitacao: null as Date | null,
    dataVencimentoCredenciamento: null as Date | null,
    proximaAtualizacao: null as Date | null,
    cve: "",
    dataAso: null as Date | null,
    documentos: ""
  });

  // Buscar bombeiros do Supabase
  useEffect(() => {
    fetchBombeiros();
  }, []);

  const fetchBombeiros = async () => {
    try {
      const { data, error } = await supabase
        .from('bombeiros')
        .select('*')
        .order('nome');

      if (error) throw error;
      setBombeiros(data || []);
    } catch (error) {
      console.error('Erro ao buscar bombeiros:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados dos bombeiros.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredPersonnel = bombeiros.filter(person => {
    const matchesSearch = person.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.funcao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.matricula.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = selectedFilter === "todos" || person.status === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo":
        return "bg-green-100 text-green-800 border-green-200";
      case "Férias":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Atestado":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Licença":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getFuncaoIcon = (funcao: string) => {
    switch (funcao) {
      case "GS":
        return Clipboard;
      case "BA-CE":
        return Shield;
      case "BA-LR":
        return Wrench;
      case "BA-MC":
        return Car;
      case "BA-2":
        return UserCog;
      default:
        return UserCog;
    }
  };

  const handleAddPersonnel = async () => {
    try {
      // Gerar iniciais do avatar a partir do nome
      const names = newPersonnel.nome.split(' ');
      const avatar = names.length >= 2 
        ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
        : newPersonnel.nome.substring(0, 2).toUpperCase();

      // Mapear função para função completa
      const funcaoCompletaMap: Record<string, string> = {
        'GS': 'Gerente de Seção',
        'BA-CE': 'Chefe de Equipe',
        'BA-LR': 'Líder de Resgate',
        'BA-MC': 'Motorista Condutor',
        'BA-2': 'Bombeiro de Aeródromo'
      };

      const { error } = await supabase
        .from('bombeiros')
        .insert({
          user_id: crypto.randomUUID(),
          nome: newPersonnel.nome,
          email: newPersonnel.email,
          telefone: newPersonnel.telefone,
          telefone_sos: newPersonnel.telefone_sos,
          matricula: newPersonnel.matricula,
          funcao: newPersonnel.funcao,
          funcao_completa: funcaoCompletaMap[newPersonnel.funcao] || newPersonnel.funcao,
          equipe: newPersonnel.equipe,
          status: newPersonnel.status,
          turno: newPersonnel.turno,
          data_admissao: newPersonnel.dataAdmissao?.toISOString().split('T')[0],
          ferista: newPersonnel.ferista,
          data_curso_habilitacao: newPersonnel.dataCursoHabilitacao?.toISOString().split('T')[0],
          data_vencimento_credenciamento: newPersonnel.dataVencimentoCredenciamento?.toISOString().split('T')[0],
          proxima_atualizacao: newPersonnel.proximaAtualizacao?.toISOString().split('T')[0],
          cve: newPersonnel.cve,
          data_aso: newPersonnel.dataAso?.toISOString().split('T')[0],
          documentos_certificados: newPersonnel.documentos ? [newPersonnel.documentos] : [],
          avatar
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Bombeiro adicionado com sucesso!",
      });

      // Recarregar lista
      fetchBombeiros();
      setIsDialogOpen(false);
      setNewPersonnel({
        nome: "",
        email: "",
        telefone: "",
        telefone_sos: "",
        matricula: "",
        funcao: "",
        equipe: "",
        status: "Ativo",
        dataAdmissao: null,
        turno: "",
        ferista: false,
        dataCursoHabilitacao: null,
        dataVencimentoCredenciamento: null,
        proximaAtualizacao: null,
        cve: "",
        dataAso: null,
        documentos: ""
      });
    } catch (error) {
      console.error('Erro ao adicionar bombeiro:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o bombeiro.",
        variant: "destructive",
      });
    }
  };

  // Estatísticas
  const totalAtivos = bombeiros.filter(p => p.status === "Ativo").length;
  const totalFerias = bombeiros.filter(p => p.status === "Férias").length;
  const totalAtestados = bombeiros.filter(p => p.status === "Atestado").length;
  const totalFeristas = bombeiros.filter(p => p.ferista).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between bg-gradient-to-r from-primary/5 to-primary/10 p-6 rounded-xl border border-primary/10">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Controle de Pessoal
          </h1>
          <p className="text-muted-foreground text-lg">
            Gestão completa da equipe da Seção Contraincêndio
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {bombeiros.length} Colaboradores
            </span>
            <span className="flex items-center gap-1">
              <UserCheck className="w-4 h-4 text-green-600" />
              {totalAtivos} Ativos
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-600" />
              {totalFeristas} Feristas
            </span>
          </div>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 px-6 py-3 text-base font-medium">
              <Plus className="w-5 h-5 mr-2" />
              Adicionar Novo Bombeiro
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-primary">Adicionar Novo Bombeiro</DialogTitle>
              <DialogDescription>
                Preencha os dados do novo colaborador
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-6 py-4">
              {/* Dados Pessoais */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Dados Pessoais
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo *</Label>
                    <Input
                      id="nome"
                      placeholder="Digite o nome completo"
                      value={newPersonnel.nome}
                      onChange={(e) => setNewPersonnel({...newPersonnel, nome: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone *</Label>
                    <Input
                      id="telefone"
                      placeholder="(11) 99999-9999"
                      value={newPersonnel.telefone}
                      onChange={(e) => setNewPersonnel({...newPersonnel, telefone: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@aeroporto.gov.br"
                      value={newPersonnel.email}
                      onChange={(e) => setNewPersonnel({...newPersonnel, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone_sos">Telefone SOS</Label>
                    <Input
                      id="telefone_sos"
                      placeholder="(11) 99999-9999"
                      value={newPersonnel.telefone_sos}
                      onChange={(e) => setNewPersonnel({...newPersonnel, telefone_sos: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Dados Funcionais */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Dados Funcionais
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="matricula">Matrícula *</Label>
                    <Input
                      id="matricula"
                      placeholder="000001"
                      value={newPersonnel.matricula}
                      onChange={(e) => setNewPersonnel({...newPersonnel, matricula: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="funcao">Função *</Label>
                    <Select value={newPersonnel.funcao} onValueChange={(value) => setNewPersonnel({...newPersonnel, funcao: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a função" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GS">GS - Gerente de Seção</SelectItem>
                        <SelectItem value="BA-CE">BA-CE - Chefe de Equipe</SelectItem>
                        <SelectItem value="BA-LR">BA-LR - Líder de Resgate</SelectItem>
                        <SelectItem value="BA-MC">BA-MC - Motorista Condutor</SelectItem>
                        <SelectItem value="BA-2">BA-2 - Bombeiro de Aeródromo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="equipe">Equipe *</Label>
                    <Select value={newPersonnel.equipe} onValueChange={(value) => setNewPersonnel({...newPersonnel, equipe: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a equipe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Alfa">Alfa</SelectItem>
                        <SelectItem value="Bravo">Bravo</SelectItem>
                        <SelectItem value="Charlie">Charlie</SelectItem>
                        <SelectItem value="Delta">Delta</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status *</Label>
                    <Select value={newPersonnel.status} onValueChange={(value) => setNewPersonnel({...newPersonnel, status: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ativo">Ativo</SelectItem>
                        <SelectItem value="Licença">Licença</SelectItem>
                        <SelectItem value="Atestado">Atestado</SelectItem>
                        <SelectItem value="Férias">Férias</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="turno">Turno *</Label>
                    <Select value={newPersonnel.turno} onValueChange={(value) => setNewPersonnel({...newPersonnel, turno: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o turno" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Diurno">Diurno</SelectItem>
                        <SelectItem value="Noturno">Noturno</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Data de Admissão *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !newPersonnel.dataAdmissao && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newPersonnel.dataAdmissao ? format(newPersonnel.dataAdmissao, "dd/MM/yyyy") : "Selecione a data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={newPersonnel.dataAdmissao || undefined}
                          onSelect={(date) => setNewPersonnel({...newPersonnel, dataAdmissao: date || null})}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="ferista" 
                    checked={newPersonnel.ferista} 
                    onCheckedChange={(checked) => setNewPersonnel({...newPersonnel, ferista: !!checked})}
                  />
                  <Label htmlFor="ferista">É ferista</Label>
                </div>
              </div>

              {/* Datas e Certificações */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Certificações e Datas
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data do Curso de Habilitação</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !newPersonnel.dataCursoHabilitacao && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newPersonnel.dataCursoHabilitacao ? format(newPersonnel.dataCursoHabilitacao, "dd/MM/yyyy") : "Selecione a data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={newPersonnel.dataCursoHabilitacao || undefined}
                          onSelect={(date) => setNewPersonnel({...newPersonnel, dataCursoHabilitacao: date || null})}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Data do Vencimento do Credenciamento</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !newPersonnel.dataVencimentoCredenciamento && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newPersonnel.dataVencimentoCredenciamento ? format(newPersonnel.dataVencimentoCredenciamento, "dd/MM/yyyy") : "Selecione a data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={newPersonnel.dataVencimentoCredenciamento || undefined}
                          onSelect={(date) => setNewPersonnel({...newPersonnel, dataVencimentoCredenciamento: date || null})}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Próxima Atualização</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !newPersonnel.proximaAtualizacao && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newPersonnel.proximaAtualizacao ? format(newPersonnel.proximaAtualizacao, "dd/MM/yyyy") : "Selecione a data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={newPersonnel.proximaAtualizacao || undefined}
                          onSelect={(date) => setNewPersonnel({...newPersonnel, proximaAtualizacao: date || null})}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Data do ASO</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !newPersonnel.dataAso && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newPersonnel.dataAso ? format(newPersonnel.dataAso, "dd/MM/yyyy") : "Selecione a data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={newPersonnel.dataAso || undefined}
                          onSelect={(date) => setNewPersonnel({...newPersonnel, dataAso: date || null})}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                {newPersonnel.funcao === "BA-MC" && (
                  <div className="space-y-2">
                    <Label htmlFor="cve">CVE (Carteira de Veículo de Emergência)</Label>
                    <Input
                      id="cve"
                      placeholder="Número da CVE"
                      value={newPersonnel.cve}
                      onChange={(e) => setNewPersonnel({...newPersonnel, cve: e.target.value})}
                    />
                  </div>
                )}
              </div>

              {/* Documentos */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Documentos e Certificados
                </div>
                <div className="space-y-2">
                  <Label htmlFor="documentos">Observações sobre documentos</Label>
                  <Textarea
                    id="documentos"
                    placeholder="Adicione informações sobre documentos e certificados..."
                    value={newPersonnel.documentos}
                    onChange={(e) => setNewPersonnel({...newPersonnel, documentos: e.target.value})}
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddPersonnel} className="bg-primary hover:bg-primary/90">
                Adicionar Colaborador
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="glass-card hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Efetivo</CardTitle>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{bombeiros.length}</div>
            <p className="text-sm text-muted-foreground mt-1">
              Colaboradores registrados
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ativos</CardTitle>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{totalAtivos}</div>
            <p className="text-sm text-muted-foreground mt-1">
              Em atividade
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Férias</CardTitle>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <CalendarIcon className="h-6 w-6 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{totalFerias}</div>
            <p className="text-sm text-muted-foreground mt-1">
              Em período de férias
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card hover:shadow-lg transition-all duration-300 border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Feristas</CardTitle>
            <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{totalFeristas}</div>
            <p className="text-sm text-muted-foreground mt-1">
              Colaboradores feristas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Controle de Efetivo</CardTitle>
          <CardDescription>
            Gerencie informações da equipe da seção contraincêndio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por nome, função ou matrícula..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedFilter === "todos" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter("todos")}
              >
                Todos
              </Button>
              <Button
                variant={selectedFilter === "Ativo" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter("Ativo")}
              >
                Ativos
              </Button>
              <Button
                variant={selectedFilter === "Férias" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter("Férias")}
              >
                Férias
              </Button>
              <Button
                variant={selectedFilter === "Atestado" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter("Atestado")}
              >
                Atestados
              </Button>
              <Button
                variant={selectedFilter === "Licença" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter("Licença")}
              >
                Licenças
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Pessoal */}
      <Card className="glass-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bombeiro</TableHead>
                <TableHead>Matrícula</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Equipe</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Admissão</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filteredPersonnel.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Nenhum bombeiro encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredPersonnel.map((person) => {
                  const IconComponent = getFuncaoIcon(person.funcao);
                  return (
                    <TableRow key={person.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary text-sm">
                            {person.avatar}
                          </div>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {person.nome}
                              {person.ferista && (
                                <Badge variant="outline" className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200">
                                  <Star className="w-3 h-3 mr-1" />
                                  Ferista
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">{person.turno}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-sm">{person.matricula}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <IconComponent className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{person.funcao}</div>
                            <div className="text-sm text-muted-foreground">{person.funcao_completa}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-medium">
                          {person.equipe}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(person.status)}>
                          {person.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="w-3 h-3" />
                            {person.email}
                          </div>
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="w-3 h-3" />
                            {person.telefone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <CalendarIcon className="w-3 h-3" />
                          {new Date(person.data_admissao).toLocaleDateString('pt-BR')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-background border">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <FileText className="w-4 h-4 mr-2" />
                              Ver detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              Remover
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ControlePessoal;