import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, BarChart3, FileText, Wrench, Truck, Fuel, Package } from 'lucide-react';
import { TipoOS, OrdemServico } from '@/types/ordem-servico';
import { mockOrdemServico, obterEstatisticasAtualizadas, gerarProximoNumeroOS } from '@/data/mock-ordem-servico';
import OSList from './OSList';
import OSCreateModal from './OSCreateModal';
import OSViewModal from './OSViewModal';

const OSManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [osData, setOsData] = useState<OrdemServico[]>(mockOrdemServico);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedOS, setSelectedOS] = useState<OrdemServico | null>(null);
  const [tipoOSParaCriar, setTipoOSParaCriar] = useState<TipoOS | undefined>();

  // Obter estatísticas atualizadas
  const estatisticas = obterEstatisticasAtualizadas(osData);

  const tiposOS = [
    {
      tipo: 'Estrutural' as TipoOS,
      icon: <Wrench className="h-5 w-5" />,
      label: 'Estrutural',
      description: 'Manutenção de instalações e estruturas',
      color: 'bg-blue-500'
    },
    {
      tipo: 'Viatura' as TipoOS,
      icon: <Truck className="h-5 w-5" />,
      label: 'Viaturas',
      description: 'Manutenção de veículos operacionais',
      color: 'bg-green-500'
    },
    {
      tipo: 'Equipamento' as TipoOS,
      icon: <FileText className="h-5 w-5" />,
      label: 'Equipamentos',
      description: 'Manutenção de equipamentos e ferramentas',
      color: 'bg-purple-500'
    },
    {
      tipo: 'Combustível' as TipoOS,
      icon: <Fuel className="h-5 w-5" />,
      label: 'Combustível',
      description: 'Solicitações de reabastecimento',
      color: 'bg-orange-500'
    },
    {
      tipo: 'Materiais' as TipoOS,
      icon: <Package className="h-5 w-5" />,
      label: 'Materiais',
      description: 'Solicitações de compra de materiais',
      color: 'bg-red-500'
    }
  ];

  const handleCreateOS = (tipo?: TipoOS) => {
    setTipoOSParaCriar(tipo);
    setIsCreateModalOpen(true);
  };

  const handleSaveOS = (novaOS: Partial<OrdemServico>) => {
    const osCompleta: OrdemServico = {
      cod_id: osData.length + 1,
      numero_chamado: novaOS.numero_chamado || gerarProximoNumeroOS(),
      data_solicitacao: new Date().toLocaleDateString('pt-BR'),
      status: 'Pendente',
      item_operacional: 'SIM',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...novaOS
    } as OrdemServico;
    
    setOsData(prev => [...prev, osCompleta]);
    setIsCreateModalOpen(false);
    setTipoOSParaCriar(undefined);
  };

  const handleViewOS = (os: OrdemServico) => {
    setSelectedOS(os);
    setIsViewModalOpen(true);
  };

  const handleUpdateOS = (osAtualizada: OrdemServico) => {
    setOsData(prev => prev.map(os => 
      os.cod_id === osAtualizada.cod_id ? osAtualizada : os
    ));
    setIsViewModalOpen(false);
    setSelectedOS(null);
  };

  const handleUpdateOSFromList = (osAtualizada: OrdemServico) => {
    setOsData(prev => prev.map(os => 
      os.cod_id === osAtualizada.cod_id ? osAtualizada : os
    ));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ordem de Serviço</h1>
          <p className="text-gray-600 mt-1">
            Gerenciamento completo de ordens de serviço
          </p>
        </div>
        <Button 
          onClick={() => handleCreateOS()}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova OS
        </Button>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="estrutural" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Estrutural
          </TabsTrigger>
          <TabsTrigger value="viatura" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Viaturas
          </TabsTrigger>
          <TabsTrigger value="equipamento" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Equipamentos
          </TabsTrigger>
          <TabsTrigger value="combustivel" className="flex items-center gap-2">
            <Fuel className="h-4 w-4" />
            Combustível
          </TabsTrigger>
          <TabsTrigger value="materiais" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Materiais
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Estatísticas Gerais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de OS</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{estatisticas.total_os}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
                <Badge variant="destructive" className="text-xs">
                  {estatisticas.pendentes}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{estatisticas.pendentes}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {estatisticas.em_andamento}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{estatisticas.em_andamento}</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
                <Badge variant="default" className="text-xs bg-green-600">
                  {estatisticas.concluidas}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{estatisticas.concluidas}</div>
              </CardContent>
            </Card>
          </div>

          {/* Cards por Tipo de OS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tiposOS.map((tipoInfo) => (
              <Card key={tipoInfo.tipo} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`p-2 rounded-lg ${tipoInfo.color} text-white`}>
                        {tipoInfo.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{tipoInfo.label}</CardTitle>
                        <CardDescription>{tipoInfo.description}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-lg font-bold">
                      {estatisticas.por_tipo[tipoInfo.tipo] || 0}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => handleCreateOS(tipoInfo.tipo)}
                    variant="outline" 
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nova OS {tipoInfo.label}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Lista Geral de OS */}
          <OSList 
            osData={osData} 
            onViewOS={handleViewOS}
            onCreateOS={() => handleCreateOS()}
            onUpdateOS={handleUpdateOSFromList}
          />
        </TabsContent>

        {/* Tabs específicas por tipo */}
        <TabsContent value="estrutural">
          <OSList 
            osData={osData}
            tipoFiltro="Estrutural" 
            onViewOS={handleViewOS}
            onCreateOS={() => handleCreateOS('Estrutural')}
            onUpdateOS={handleUpdateOSFromList}
          />
        </TabsContent>
        
        <TabsContent value="viatura">
          <OSList 
            osData={osData}
            tipoFiltro="Viatura" 
            onViewOS={handleViewOS}
            onCreateOS={() => handleCreateOS('Viatura')}
            onUpdateOS={handleUpdateOSFromList}
          />
        </TabsContent>
        
        <TabsContent value="equipamento">
          <OSList 
            osData={osData}
            tipoFiltro="Equipamento" 
            onViewOS={handleViewOS}
            onCreateOS={() => handleCreateOS('Equipamento')}
            onUpdateOS={handleUpdateOSFromList}
          />
        </TabsContent>
        
        <TabsContent value="combustivel">
          <OSList 
            osData={osData}
            tipoFiltro="Combustível" 
            onViewOS={handleViewOS}
            onCreateOS={() => handleCreateOS('Combustível')}
            onUpdateOS={handleUpdateOSFromList}
          />
        </TabsContent>
        
        <TabsContent value="materiais">
          <OSList 
            osData={osData}
            tipoFiltro="Materiais" 
            onViewOS={handleViewOS}
            onCreateOS={() => handleCreateOS('Materiais')}
            onUpdateOS={handleUpdateOSFromList}
          />
        </TabsContent>
      </Tabs>
      
      {/* Modais */}
      <OSCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setTipoOSParaCriar(undefined);
        }}
        tipoInicial={tipoOSParaCriar}
        onSave={handleSaveOS}
      />
      
      <OSViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedOS(null);
        }}
        os={selectedOS}
        onSave={handleUpdateOS}
      />
    </div>
  );
};

export default OSManager;