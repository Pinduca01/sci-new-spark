import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ClipboardCheck, 
  Truck, 
  Package, 
  FileText, 
  Search, 
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Calendar,
  User,
  Download
} from "lucide-react";
import { useChecklistsStats } from "@/hooks/useChecklistsStats";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Checklists() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [tipoFilter, setTipoFilter] = useState<string>("todos");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  const { stats, viaturasChecklists, almoxarifadoChecklists, isLoading } = useChecklistsStats();

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "destructive" | "secondary" | "outline", icon: any, label: string }> = {
      'APROVADO': { variant: 'default', icon: CheckCircle2, label: 'Aprovado' },
      'REPROVADO': { variant: 'destructive', icon: XCircle, label: 'Reprovado' },
      'PENDENTE': { variant: 'secondary', icon: Clock, label: 'Pendente' },
      'em_andamento': { variant: 'outline', icon: Clock, label: 'Em Andamento' }
    };

    const config = variants[status] || variants['em_andamento'];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando checklists...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ClipboardCheck className="w-8 h-8 text-primary" />
            Checklists
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestão unificada de todos os checklists do sistema
          </p>
        </div>
      </div>

      {/* Métricas Dashboard */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Checklists</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              Realizados no período
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conformidade</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.taxaConformidade || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Checklists aprovados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats?.pendentes || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Aguardando finalização
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Não Conformidades</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {stats?.naoConformidades || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Checklists reprovados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Filtros</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              {showAdvancedFilters ? "Ocultar" : "Filtros Avançados"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por viatura, responsável ou observações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="APROVADO">Aprovado</SelectItem>
                <SelectItem value="REPROVADO">Reprovado</SelectItem>
                <SelectItem value="PENDENTE">Pendente</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {showAdvancedFilters && (
            <div className="grid gap-4 md:grid-cols-3 pt-4 border-t">
              <Select value={tipoFilter} onValueChange={setTipoFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de Checklist" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Tipos</SelectItem>
                  <SelectItem value="BA-2">BA-2 (Ambulância)</SelectItem>
                  <SelectItem value="BA-MC">BA-MC (Caminhão)</SelectItem>
                  <SelectItem value="almoxarifado">Almoxarifado</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Período
              </Button>
              <Button variant="outline" onClick={() => {
                setSearchTerm("");
                setStatusFilter("todos");
                setTipoFilter("todos");
              }}>
                Limpar Filtros
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs de Conteúdo */}
      <Tabs defaultValue="viaturas" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="viaturas" className="flex items-center gap-2">
            <Truck className="w-4 h-4" />
            Viaturas
          </TabsTrigger>
          <TabsTrigger value="almoxarifado" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Almoxarifado
          </TabsTrigger>
          <TabsTrigger value="relatorios" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        {/* Tab Viaturas */}
        <TabsContent value="viaturas" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Checklists de Viaturas</h2>
            <Button onClick={() => navigate('/viaturas')}>
              <Truck className="w-4 h-4 mr-2" />
              Ver Viaturas
            </Button>
          </div>

          <div className="grid gap-4">
            {viaturasChecklists && viaturasChecklists.length > 0 ? (
              viaturasChecklists
                .filter(item => {
                  const matchSearch = searchTerm === "" || 
                    item.bombeiro_responsavel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.observacoes_gerais?.toLowerCase().includes(searchTerm.toLowerCase());
                  const matchStatus = statusFilter === "todos" || item.status_geral === statusFilter;
                  const matchTipo = tipoFilter === "todos" || item.tipo_checklist === tipoFilter;
                  return matchSearch && matchStatus && matchTipo;
                })
                .map((checklist) => (
                  <Card key={checklist.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Truck className="w-4 h-4 text-primary" />
                            {checklist.tipo_checklist}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-4 text-xs">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {checklist.bombeiro_responsavel}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(checklist.data_checklist), "dd/MM/yyyy", { locale: ptBR })}
                            </span>
                            {checklist.hora_checklist && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {checklist.hora_checklist}
                              </span>
                            )}
                          </CardDescription>
                        </div>
                        {getStatusBadge(checklist.status_geral)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          {checklist.equipe && (
                            <span className="mr-4">Equipe: {checklist.equipe}</span>
                          )}
                          {checklist.observacoes_gerais && (
                            <p className="mt-2 line-clamp-1">{checklist.observacoes_gerais}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            Ver Detalhes
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Nenhum checklist de viatura encontrado
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Tab Almoxarifado */}
        <TabsContent value="almoxarifado" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Checklists de Almoxarifado</h2>
          </div>

          <div className="grid gap-4">
            {almoxarifadoChecklists && almoxarifadoChecklists.length > 0 ? (
              almoxarifadoChecklists
                .filter(item => {
                  const matchSearch = searchTerm === "" || 
                    item.bombeiro_responsavel_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.observacoes_gerais?.toLowerCase().includes(searchTerm.toLowerCase());
                  const matchStatus = statusFilter === "todos" || item.status_geral === statusFilter;
                  return matchSearch && matchStatus;
                })
                .map((checklist) => (
                  <Card key={checklist.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Package className="w-4 h-4 text-primary" />
                            Checklist de Almoxarifado
                          </CardTitle>
                          <CardDescription className="flex items-center gap-4 text-xs">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {checklist.bombeiro_responsavel_nome}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(checklist.data_checklist), "dd/MM/yyyy", { locale: ptBR })}
                            </span>
                            {checklist.hora_checklist && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {checklist.hora_checklist}
                              </span>
                            )}
                          </CardDescription>
                        </div>
                        {getStatusBadge(checklist.status_geral)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex gap-4">
                            <span>Conformes: {checklist.itens_conformes || 0}</span>
                            <span>Divergentes: {checklist.itens_divergentes || 0}</span>
                            <span>Total: {checklist.total_itens || 0}</span>
                          </div>
                          {checklist.observacoes_gerais && (
                            <p className="mt-2 line-clamp-1">{checklist.observacoes_gerais}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            Ver Detalhes
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Nenhum checklist de almoxarifado encontrado
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Tab Relatórios */}
        <TabsContent value="relatorios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios e Análises</CardTitle>
              <CardDescription>
                Em breve: relatórios automáticos, análises de conformidade e exportações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Button variant="outline" className="justify-start h-auto py-4">
                  <div className="text-left">
                    <div className="font-semibold">Relatório Mensal</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Consolidado de todos os checklists do mês
                    </div>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start h-auto py-4">
                  <div className="text-left">
                    <div className="font-semibold">Análise de Conformidade</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Gráficos e estatísticas detalhadas
                    </div>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start h-auto py-4">
                  <div className="text-left">
                    <div className="font-semibold">Ranking de Conformidade</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Comparativo entre viaturas e equipes
                    </div>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start h-auto py-4">
                  <div className="text-left">
                    <div className="font-semibold">Exportar Dados</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Download em PDF, Excel ou CSV
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
