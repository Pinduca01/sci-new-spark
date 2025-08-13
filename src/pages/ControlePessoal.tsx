import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Calendar
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

  const getFuncaoColor = (funcao: string) => {
    switch (funcao) {
      case "GS":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "BA-CE":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "BA-LR":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "BA-MC":
        return "bg-green-100 text-green-800 border-green-200";
      case "BA-2":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Estatísticas
  const totalAtivos = mockPersonnel.filter(p => p.status === "ativo").length;
  const totalFerias = mockPersonnel.filter(p => p.status === "ferias").length;
  const totalAfastados = mockPersonnel.filter(p => p.status === "afastado").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Controle de Pessoal</h1>
          <p className="text-muted-foreground">
            Gestão completa da equipe da Seção Contraincêndio
          </p>
        </div>
        <Button className="glass bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Novo Colaborador
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pessoal</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockPersonnel.length}</div>
            <p className="text-xs text-muted-foreground">
              Colaboradores registrados
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalAtivos}</div>
            <p className="text-xs text-muted-foreground">
              Em atividade
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Férias</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalFerias}</div>
            <p className="text-xs text-muted-foreground">
              Em período de férias
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Afastados</CardTitle>
            <UserX className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{totalAfastados}</div>
            <p className="text-xs text-muted-foreground">
              Afastamentos médicos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Lista de Pessoal</CardTitle>
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
                    <Badge className={getFuncaoColor(person.funcao)}>
                      {person.funcao}
                    </Badge>
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