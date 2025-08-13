import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Search, 
  Plus, 
  Users, 
  UserCheck, 
  UserX, 
  Filter,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  Car,
  Shield,
  Wrench,
  Clipboard,
  UserCog
} from "lucide-react";
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

// Dados mockados para demonstração
const mockPersonnel = [
  {
    id: 1,
    nome: "João Silva Santos",
    funcao: "GS",
    funcaoCompleta: "Gerente de Seção",
    status: "ativo",
    email: "joao.santos@aeroporto.gov.br",
    telefone: "(11) 99999-0001",
    dataAdmissao: "2020-01-15",
    turno: "Diurno",
    avatar: "JS"
  },
  {
    id: 2,
    nome: "Maria Oliveira Costa",
    funcao: "BA-CE",
    funcaoCompleta: "Chefe de Equipe",
    status: "ativo",
    email: "maria.costa@aeroporto.gov.br",
    telefone: "(11) 99999-0002",
    dataAdmissao: "2021-03-10",
    turno: "Noturno",
    avatar: "MC"
  },
  {
    id: 3,
    nome: "Carlos Roberto Lima",
    funcao: "BA-LR",
    funcaoCompleta: "Líder de Resgate",
    status: "ativo",
    email: "carlos.lima@aeroporto.gov.br",
    telefone: "(11) 99999-0003",
    dataAdmissao: "2019-07-22",
    turno: "Diurno",
    avatar: "CL"
  },
  {
    id: 4,
    nome: "Ana Paula Ferreira",
    funcao: "BA-MC",
    funcaoCompleta: "Motorista Condutor",
    status: "ativo",
    email: "ana.ferreira@aeroporto.gov.br",
    telefone: "(11) 99999-0004",
    dataAdmissao: "2022-05-08",
    turno: "Diurno",
    avatar: "AF"
  },
  {
    id: 5,
    nome: "Pedro Henrique Souza",
    funcao: "BA-2",
    funcaoCompleta: "Bombeiro de Aeródromo",
    status: "ativo",
    email: "pedro.souza@aeroporto.gov.br",
    telefone: "(11) 99999-0005",
    dataAdmissao: "2023-01-20",
    turno: "Noturno",
    avatar: "PS"
  },
  {
    id: 6,
    nome: "Luciana Santos Rocha",
    funcao: "BA-2",
    funcaoCompleta: "Bombeiro de Aeródromo",
    status: "ferias",
    email: "luciana.rocha@aeroporto.gov.br",
    telefone: "(11) 99999-0006",
    dataAdmissao: "2023-08-15",
    turno: "Diurno",
    avatar: "LR"
  }
];

const ControlePessoal = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("todos");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPersonnel, setNewPersonnel] = useState({
    nome: "",
    email: "",
    telefone: "",
    funcao: "",
    turno: "",
    dataAdmissao: ""
  });

  const filteredPersonnel = mockPersonnel.filter(person => {
    const matchesSearch = person.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.funcao.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = selectedFilter === "todos" || person.status === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativo":
        return "bg-green-100 text-green-800 border-green-200";
      case "ferias":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "afastado":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "inativo":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ativo":
        return "Ativo";
      case "ferias":
        return "Férias";
      case "afastado":
        return "Afastado";
      case "inativo":
        return "Inativo";
      default:
        return status;
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

  const handleAddPersonnel = () => {
    // TODO: Implement add personnel logic
    console.log("Adding personnel:", newPersonnel);
    setIsDialogOpen(false);
    setNewPersonnel({
      nome: "",
      email: "",
      telefone: "",
      funcao: "",
      turno: "",
      dataAdmissao: ""
    });
  };

  // Estatísticas
  const totalAtivos = mockPersonnel.filter(p => p.status === "ativo").length;
  const totalFerias = mockPersonnel.filter(p => p.status === "ferias").length;
  const totalAfastados = mockPersonnel.filter(p => p.status === "afastado").length;

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
              {mockPersonnel.length} Colaboradores
            </span>
            <span className="flex items-center gap-1">
              <UserCheck className="w-4 h-4 text-green-600" />
              {totalAtivos} Ativos
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
          <DialogContent className="sm:max-w-[600px]">
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
              </div>

              {/* Dados Funcionais */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-primary">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Dados Funcionais
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="funcao">Função</Label>
                    <Select value={newPersonnel.funcao} onValueChange={(value) => setNewPersonnel({...newPersonnel, funcao: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="BA-GS" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GS">BA-GS</SelectItem>
                        <SelectItem value="BA-CE">BA-CE</SelectItem>
                        <SelectItem value="BA-LR">BA-LR</SelectItem>
                        <SelectItem value="BA-MC">BA-MC</SelectItem>
                        <SelectItem value="BA-2">BA-2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="turno">Turno</Label>
                    <Select value={newPersonnel.turno} onValueChange={(value) => setNewPersonnel({...newPersonnel, turno: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Ativo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Diurno">Diurno</SelectItem>
                        <SelectItem value="Noturno">Noturno</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataAdmissao">Data de Admissão</Label>
                  <Input
                    id="dataAdmissao"
                    type="date"
                    value={newPersonnel.dataAdmissao}
                    onChange={(e) => setNewPersonnel({...newPersonnel, dataAdmissao: e.target.value})}
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
            <div className="text-3xl font-bold text-foreground">{mockPersonnel.length}</div>
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
              <Calendar className="h-6 w-6 text-blue-600" />
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Afastados</CardTitle>
            <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <UserX className="h-6 w-6 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{totalAfastados}</div>
            <p className="text-sm text-muted-foreground mt-1">
              Afastamentos médicos
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
                placeholder="Buscar por nome ou função..."
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
                variant={selectedFilter === "ativo" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter("ativo")}
              >
                Ativos
              </Button>
              <Button
                variant={selectedFilter === "ferias" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter("ferias")}
              >
                Férias
              </Button>
              <Button
                variant={selectedFilter === "afastado" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter("afastado")}
              >
                Afastados
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
                <TableHead>Colaborador</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Turno</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Admissão</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPersonnel.map((person) => (
                <TableRow key={person.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/20">
                        <span className="text-sm font-medium text-primary">
                          {person.avatar}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{person.nome}</div>
                        <div className="text-sm text-muted-foreground">
                          {person.funcaoCompleta}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const IconComponent = getFuncaoIcon(person.funcao);
                        return <IconComponent className="w-4 h-4 text-foreground" />;
                      })()}
                      <Badge variant="outline" className="bg-background text-foreground border-border">
                        {person.funcao}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(person.status)}>
                      {getStatusLabel(person.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{person.turno}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Mail className="w-3 h-3 mr-1 text-muted-foreground" />
                        <span className="text-xs">{person.email}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="w-3 h-3 mr-1 text-muted-foreground" />
                        <span className="text-xs">{person.telefone}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(person.dataAdmissao).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Ver detalhes</DropdownMenuItem>
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem>Histórico</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          Desativar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ControlePessoal;