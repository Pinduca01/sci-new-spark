
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
  History
} from "lucide-react";
import { EstoqueDashboard } from "@/components/EstoqueDashboard";
import { MaterialForm } from "@/components/MaterialForm";
import { MovimentacaoForm } from "@/components/MovimentacaoForm";
import { useEstoqueAlmoxarifado } from "@/hooks/useEstoqueAlmoxarifado";
import { useMovimentacoes } from "@/hooks/useMovimentacoes";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Equipamentos = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  
  const { estoque, isLoading: estoqueLoading } = useEstoqueAlmoxarifado();
  const { movimentacoes, isLoading: movimentacoesLoading } = useMovimentacoes();

  const filteredEstoque = estoque.filter(item => {
    const matchesSearch = 
      item.materiais?.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.materiais?.codigo_material.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || item.materiais?.categoria === selectedCategory;
    
    return matchesSearch && matchesCategory;
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="estoque" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Estoque Almoxarifado
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
