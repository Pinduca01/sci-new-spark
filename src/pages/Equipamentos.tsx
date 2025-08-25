import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Package, 
  Search, 
  Filter,
  FileText,
  Truck,
  Archive,
  History,
  Beaker,
  ShieldCheck
} from "lucide-react";
import { EstoqueDashboard } from "@/components/EstoqueDashboard";
import { MaterialForm } from "@/components/MaterialForm";
import { MovimentacaoForm } from "@/components/MovimentacaoForm";
import { AgentesExtintoresDashboard } from "@/components/AgentesExtintoresDashboard";
import { AgenteExtintorForm } from "@/components/AgenteExtintorForm";
import { LoteRecomendacao } from "@/components/LoteRecomendacao";
import { useEstoqueAlmoxarifado } from "@/hooks/useEstoqueAlmoxarifado";
import { useMovimentacoes } from "@/hooks/useMovimentacoes";
import { useAgentesExtintores } from "@/hooks/useAgentesExtintores";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChecklistAlmoxarifadoForm } from "@/components/ChecklistAlmoxarifadoForm";

const Equipamentos = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchAgentes, setSearchAgentes] = useState("");
  const [filterTipoAgente, setFilterTipoAgente] = useState("");
  
  const { estoque, isLoading: estoqueLoading } = useEstoqueAlmoxarifado();
  const { movimentacoes, isLoading: movimentacoesLoading } = useMovimentacoes();
  const { agentes, isLoading: agentesLoading } = useAgentesExtintores();

  const filteredEstoque = estoque.filter(item => {
    const matchesSearch = 
      item.materiais?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.materiais?.codigo_material.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || item.materiais?.categoria === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const filteredAgentes = agentes.filter(agente => {
    const matchesSearch = 
      agente.lote.toLowerCase().includes(searchAgentes.toLowerCase()) ||
      agente.materiais?.nome.toLowerCase().includes(searchAgentes.toLowerCase()) ||
      agente.materiais?.codigo_material.toLowerCase().includes(searchAgentes.toLowerCase());
    
    const matchesTipo = !filterTipoAgente || agente.tipo_agente === filterTipoAgente;
    
    return matchesSearch && matchesTipo;
  });

  const categorias = [...new Set(estoque.map(item => item.materiais?.categoria))].filter(Boolean);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (item: any) => {
    const hoje = new Date();
    const vencimento = item.data_validade ? new Date(item.data_validade) : null;
    
    if (item.quantidade_disponivel <= item.quantidade_minima) {
      return <Badge variant="destructive">Estoque Baixo</Badge>;
    }
    
    if (vencimento) {
      const diasParaVencer = (vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24);
      
      if (diasParaVencer < 0) {
        return <Badge variant="destructive">Vencido</Badge>;
      } else if (diasParaVencer <= 30) {
        return <Badge className="bg-orange-100 text-orange-800">Vence em breve</Badge>;
      }
    }
    
    return <Badge variant="default">Normal</Badge>;
  };

  const getStatusAgenteColor = (status: string) => {
    switch (status) {
      case 'disponivel': return 'default';
      case 'em_uso': return 'secondary';
      case 'vencido': return 'destructive';
      case 'descartado': return 'outline';
      default: return 'outline';
    }
  };

  const getVencimentoColor = (dataVencimento: string) => {
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    const diasParaVencer = (vencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24);
    
    if (diasParaVencer < 0) return 'text-red-600';
    if (diasParaVencer <= 30) return 'text-red-600';
    if (diasParaVencer <= 60) return 'text-orange-600';
    if (diasParaVencer <= 90) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Controle de Equipamentos</h1>
        </div>
        <div className="flex gap-3">
          <MovimentacaoForm tipo="entrada" />
          <MovimentacaoForm tipo="saida" />
          <MaterialForm />
        </div>
      </div>

      {/* Dashboard */}
      <EstoqueDashboard />

      <Tabs defaultValue="estoque" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="estoque" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Estoque Almoxarifado
          </TabsTrigger>
          <TabsTrigger value="agentes" className="flex items-center gap-2">
            <Beaker className="h-4 w-4" />
            Agentes Extintores
          </TabsTrigger>
          <TabsTrigger value="tp-uniformes" className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            TP e Uniformes
          </TabsTrigger>
          <TabsTrigger value="checklist" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Checklist Almoxarifado
          </TabsTrigger>
          <TabsTrigger value="viaturas" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Materiais em Viaturas
          </TabsTrigger>
          <TabsTrigger value="guardados" className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            Materiais Guardados
          </TabsTrigger>
          <TabsTrigger value="movimentacoes" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Movimentações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="estoque">
          <Card>
            <CardHeader>
              <CardTitle>Estoque do Almoxarifado</CardTitle>
              <div className="flex gap-4 items-center">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar materiais..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border rounded-md"
                >
                  <option value="">Todas as categorias</option>
                  {categorias.map((categoria) => (
                    <option key={categoria} value={categoria}>{categoria}</option>
                  ))}
                </select>
              </div>
            </CardHeader>
            <CardContent>
              {estoqueLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Material</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Mínimo</TableHead>
                      <TableHead>Validade</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Localização</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEstoque.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono">
                          {item.materiais?.codigo_material}
                        </TableCell>
                        <TableCell className="font-medium">
                          {item.materiais?.nome}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.materiais?.categoria}</Badge>
                        </TableCell>
                        <TableCell>
                          {item.quantidade_disponivel} {item.materiais?.unidade_medida}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {item.quantidade_minima} {item.materiais?.unidade_medida}
                        </TableCell>
                        <TableCell>
                          {item.data_validade ? formatDate(item.data_validade) : '-'}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(item)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {item.localizacao_fisica || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agentes">
          <div className="space-y-6">
            {/* Dashboard de Agentes */}
            <AgentesExtintoresDashboard />
            
            {/* Recomendação de Lotes */}
            <LoteRecomendacao />
            
            {/* Tabela de Agentes */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Controle de Agentes Extintores</CardTitle>
                  <AgenteExtintorForm />
                </div>
                <div className="flex gap-4 items-center">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Buscar por lote, material..."
                      value={searchAgentes}
                      onChange={(e) => setSearchAgentes(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <select
                    value={filterTipoAgente}
                    onChange={(e) => setFilterTipoAgente(e.target.value)}
                    className="px-3 py-2 border rounded-md"
                  >
                    <option value="">Todos os tipos</option>
                    <option value="LGE">LGE</option>
                    <option value="PQS">PQS</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent>
                {agentesLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Lote</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Material</TableHead>
                        <TableHead>Capacidade</TableHead>
                        <TableHead>Fabricação</TableHead>
                        <TableHead>Vencimento</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Localização</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAgentes.map((agente) => (
                        <TableRow key={agente.id}>
                          <TableCell className="font-mono font-medium">
                            {agente.lote}
                          </TableCell>
                          <TableCell>
                            <Badge variant={agente.tipo_agente === 'LGE' ? 'default' : 'secondary'}>
                              {agente.tipo_agente}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{agente.materiais?.nome}</div>
                              <div className="text-sm text-muted-foreground">
                                {agente.materiais?.codigo_material}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {agente.capacidade} {agente.unidade_capacidade}
                          </TableCell>
                          <TableCell>
                            {formatDate(agente.data_fabricacao)}
                          </TableCell>
                          <TableCell className={getVencimentoColor(agente.data_vencimento)}>
                            {formatDate(agente.data_vencimento)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={getStatusAgenteColor(agente.status_uso) as any}>
                              {agente.status_uso.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {agente.localizacao_fisica || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tp-uniformes">
          <Card>
            <CardHeader>
              <CardTitle>Trajes de Proteção e Uniformes</CardTitle>
              <p className="text-muted-foreground">
                Controle completo de trajes de proteção individual e uniformes do efetivo
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <ShieldCheck className="h-12 w-12 mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">Sistema de TP e Uniformes</p>
                <p className="text-sm mb-6">
                  Esta seção permitirá o controle completo de:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
                  <div className="space-y-2">
                    <h4 className="font-medium">Trajes de Proteção:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Roupas de aproximação</li>
                      <li>• Equipamentos de proteção individual</li>
                      <li>• Capacetes e acessórios</li>
                      <li>• Botas e luvas especiais</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Uniformes:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Uniformes operacionais</li>
                      <li>• Uniformes administrativos</li>
                      <li>• Controle por bombeiro</li>
                      <li>• Histórico de distribuição</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-8">
                  <Button variant="outline" className="mr-4">
                    <Package className="w-4 h-4 mr-2" />
                    Funcionalidade em desenvolvimento
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checklist">
          <ChecklistAlmoxarifadoForm />
        </TabsContent>

        <TabsContent value="viaturas">
          <Card>
            <CardHeader>
              <CardTitle>Materiais Alocados em Viaturas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Truck className="h-12 w-12 mx-auto mb-4" />
                <p>Funcionalidade em desenvolvimento</p>
                <p className="text-sm">
                  Esta seção mostrará os materiais alocados em cada viatura,
                  integrado com o sistema de checklists.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guardados">
          <Card>
            <CardHeader>
              <CardTitle>Materiais Guardados/Reservados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Archive className="h-12 w-12 mx-auto mb-4" />
                <p>Funcionalidade em desenvolvimento</p>
                <p className="text-sm">
                  Esta seção permitirá gerenciar materiais temporariamente
                  indisponíveis para uso geral.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movimentacoes">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Movimentações</CardTitle>
            </CardHeader>
            <CardContent>
              {movimentacoesLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Material</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Quantidade</TableHead>
                      <TableHead>Motivo</TableHead>
                      <TableHead>Responsável</TableHead>
                      <TableHead>Origem/Destino</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movimentacoes.map((mov) => (
                      <TableRow key={mov.id}>
                        <TableCell>
                          {new Date(mov.data_movimentacao).toLocaleString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{mov.materiais?.nome}</div>
                            <div className="text-sm text-muted-foreground">{mov.materiais?.codigo_material}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={mov.tipo_movimentacao === 'entrada' ? 'default' : 'destructive'}
                          >
                            {mov.tipo_movimentacao === 'entrada' ? 'Entrada' : 'Saída'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {mov.quantidade} {mov.materiais?.unidade_medida}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {mov.motivo}
                        </TableCell>
                        <TableCell>
                          {mov.bombeiros?.nome}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {mov.origem || mov.destino || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Equipamentos;
