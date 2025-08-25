
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useExtintoresAeroporto } from '@/hooks/useExtintoresAeroporto';
import { useBombeiros } from '@/hooks/useBombeiros';
import { 
  Shield, 
  MapPin, 
  AlertTriangle, 
  CheckCircle, 
  Users, 
  Calendar,
  Eye,
  Plus,
  FileText
} from 'lucide-react';
import { ExtintorForm } from './ExtintorForm';
import { InspecaoForm } from './InspecaoForm';
import { ExtintorDetailsModal } from './ExtintorDetailsModal';

export const ExtintoresDashboard = () => {
  const { quadrantes, extintores, inspecoes, isLoading } = useExtintoresAeroporto();
  const { bombeiros } = useBombeiros();
  const [showExtintorForm, setShowExtintorForm] = useState(false);
  const [showInspecaoForm, setShowInspecaoForm] = useState(false);
  const [selectedExtintor, setSelectedExtintor] = useState<string | null>(null);
  const [selectedExtintorForDetails, setSelectedExtintorForDetails] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Estatísticas
  const totalExtintores = extintores.length;
  const extintoresAtivos = extintores.filter(e => e.status === 'ativo').length;
  const inspecoesMes = inspecoes.filter(i => {
    const inspecaoDate = new Date(i.data_inspecao);
    const currentDate = new Date();
    return inspecaoDate.getMonth() === currentDate.getMonth() && 
           inspecaoDate.getFullYear() === currentDate.getFullYear();
  }).length;

  // Alertas de vencimento (próximos 30 dias)
  const proximosVencimentos = extintores.filter(e => {
    if (!e.proxima_recarga) return false;
    const vencimento = new Date(e.proxima_recarga);
    const hoje = new Date();
    const diffTime = vencimento.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays >= 0;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Inspeção de Extintores
          </h2>
          <p className="text-muted-foreground">
            Controle e inspeção dos extintores fixos do aeroporto
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowExtintorForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Extintor
          </Button>
          <Button onClick={() => setShowInspecaoForm(true)} variant="outline" className="gap-2">
            <FileText className="h-4 w-4" />
            Nova Inspeção
          </Button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Extintores</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExtintores}</div>
            <p className="text-xs text-muted-foreground">
              {extintoresAtivos} ativos
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quadrantes</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quadrantes.length}</div>
            <p className="text-xs text-muted-foreground">
              áreas mapeadas
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inspeções/Mês</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inspecoesMes}</div>
            <p className="text-xs text-muted-foreground">
              realizadas este mês
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{proximosVencimentos.length}</div>
            <p className="text-xs text-muted-foreground">
              vencendo em 30 dias
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Conteúdo Principal */}
      <Tabs defaultValue="quadrantes" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="quadrantes">Quadrantes</TabsTrigger>
          <TabsTrigger value="extintores">Extintores</TabsTrigger>
          <TabsTrigger value="inspecoes">Inspeções</TabsTrigger>
          <TabsTrigger value="alertas">Alertas</TabsTrigger>
        </TabsList>

        <TabsContent value="quadrantes" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quadrantes.map((quadrante) => {
              const extintoresQuadrante = extintores.filter(e => e.quadrante_id === quadrante.id);
              return (
                <Card key={quadrante.id} className="glass-card">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: quadrante.cor_identificacao }}
                        />
                        {quadrante.nome_quadrante}
                      </CardTitle>
                      <Badge variant="outline">
                        {extintoresQuadrante.length} extintores
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">
                      {quadrante.descricao}
                    </p>
                    {quadrante.equipes && (
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4" />
                        <span>Equipe: {quadrante.equipes.nome_equipe}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="extintores" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {extintores.map((extintor) => (
              <Card key={extintor.id} className="glass-card">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="secondary" className="font-mono">
                          {extintor.codigo_extintor}
                        </Badge>
                        <Badge 
                          variant={extintor.status === 'ativo' ? 'default' : 'secondary'}
                        >
                          {extintor.status}
                        </Badge>
                      </div>
                      <h3 className="font-medium">{extintor.localizacao_detalhada}</h3>
                      <p className="text-sm text-muted-foreground">
                        {extintor.tipo_extintor} - {extintor.capacidade}{extintor.unidade_capacidade}
                      </p>
                      {extintor.quadrantes_aeroporto && (
                        <div className="flex items-center gap-2 mt-1">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: extintor.quadrantes_aeroporto.cor_identificacao }}
                          />
                          <span className="text-sm text-muted-foreground">
                            {extintor.quadrantes_aeroporto.nome_quadrante}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedExtintorForDetails(extintor.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedExtintor(extintor.id);
                          setShowInspecaoForm(true);
                        }}
                      >
                        <Calendar className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="inspecoes" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {inspecoes.slice(0, 10).map((inspecao) => (
              <Card key={inspecao.id} className="glass-card">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">
                          {inspecao.extintores_aeroporto?.codigo_extintor}
                        </Badge>
                        <Badge 
                          variant={inspecao.status_extintor === 'conforme' ? 'default' : 'destructive'}
                        >
                          {inspecao.status_extintor}
                        </Badge>
                      </div>
                      <h3 className="font-medium">
                        {inspecao.extintores_aeroporto?.localizacao_detalhada}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Inspetor: {inspecao.bombeiros?.nome}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {new Date(inspecao.data_inspecao).toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {inspecao.hora_inspecao}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alertas" className="space-y-4">
          {proximosVencimentos.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {proximosVencimentos.map((extintor) => {
                const diasParaVencimento = Math.ceil(
                  (new Date(extintor.proxima_recarga!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                );
                return (
                  <Card key={extintor.id} className="glass-card border-amber-200">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-600" />
                        <div className="flex-1">
                          <h3 className="font-medium">{extintor.codigo_extintor}</h3>
                          <p className="text-sm text-muted-foreground">
                            {extintor.localizacao_detalhada}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="text-amber-600 border-amber-600">
                            {diasParaVencimento} dias
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            Vence em {new Date(extintor.proxima_recarga!).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="glass-card">
              <CardContent className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-medium mb-2">Nenhum alerta ativo</h3>
                <p className="text-sm text-muted-foreground">
                  Todos os extintores estão dentro do prazo de validade
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {showExtintorForm && (
        <ExtintorForm 
          open={showExtintorForm}
          onClose={() => setShowExtintorForm(false)}
          quadrantes={quadrantes}
        />
      )}

      {showInspecaoForm && (
        <InspecaoForm
          open={showInspecaoForm}
          onClose={() => {
            setShowInspecaoForm(false);
            setSelectedExtintor(null);
          }}
          extintores={extintores}
          bombeiros={bombeiros}
          selectedExtintorId={selectedExtintor}
        />
      )}

      {selectedExtintorForDetails && (
        <ExtintorDetailsModal
          open={!!selectedExtintorForDetails}
          onClose={() => setSelectedExtintorForDetails(null)}
          extintorId={selectedExtintorForDetails}
          extintores={extintores}
          inspecoes={inspecoes}
        />
      )}
    </div>
  );
};
