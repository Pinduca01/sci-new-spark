
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTPVerificacoes } from "@/hooks/useTPVerificacoes";
import { useTPHigienizacoes } from "@/hooks/useTPHigienizacoes";

import { 
  ShieldCheck, 
  Droplets, 
  Package, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Target,
  Activity,
  BarChart3,
  PieChart,
  TrendingDown
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, LineChart, Line, Area, AreaChart, Pie } from 'recharts';

const TPUniformesDashboard = () => {
  const { data: verificacoes = [] } = useTPVerificacoes();
  const { data: higienizacoes = [] } = useTPHigienizacoes();


  const mesAtual = new Date().getMonth() + 1;
  const anoAtual = new Date().getFullYear();

  // Dados mockados para demonstração (em produção viriam do backend)
  const mockData = {
    tpsVerificados: 25,
    metaMensal: 30,
    taxaConformidadeTP: 88,
    tpsHigienizados: 20,
    colaboradoresUniformesOK: 92,
    
    // Conformidade por item TP
    conformidadeTPs: [
      { item: 'Trajes Combate Incêndio', conformes: 22, total: 25, percentual: 88 },
      { item: 'Botas Combate Incêndio', conformes: 24, total: 25, percentual: 96 },
      { item: 'Balaclavas', conformes: 20, total: 25, percentual: 80 },
      { item: 'Luvas', conformes: 23, total: 25, percentual: 92 },
      { item: 'Capacetes', conformes: 25, total: 25, percentual: 100 }
    ],
    
    // Status geral TPs
    statusGeralTPs: [
      { name: 'Conformes', value: 22, color: '#10b981' },
      { name: 'Não Conformes', value: 3, color: '#ef4444' },
      { name: 'Não Verificados', value: 5, color: '#f59e0b' }
    ],
    
    // Evolução verificações (últimos 6 meses)
    evolucaoVerificacoes: [
      { mes: 'Jul', verificados: 18, conformes: 15 },
      { mes: 'Ago', verificados: 22, conformes: 19 },
      { mes: 'Set', verificados: 20, conformes: 17 },
      { mes: 'Out', verificados: 24, conformes: 21 },
      { mes: 'Nov', verificados: 26, conformes: 23 },
      { mes: 'Dez', verificados: 25, conformes: 22 }
    ],
    
    // Conformidade uniformes por item
    conformidadeUniformes: [
      { item: '2 Gandolas Bombeiro', conformes: 45, total: 50, percentual: 90 },
      { item: '2 Calças Bombeiro', conformes: 47, total: 50, percentual: 94 },
      { item: '1 Cinto Bombeiro', conformes: 48, total: 50, percentual: 96 },
      { item: 'Bota Segurança', conformes: 46, total: 50, percentual: 92 },
      { item: '4 Camisas Bombeiro', conformes: 44, total: 50, percentual: 88 },
      { item: '2 Bermudas Bombeiro', conformes: 49, total: 50, percentual: 98 },
      { item: 'Tarjeta Nome/Função', conformes: 50, total: 50, percentual: 100 },
      { item: 'Óculos/Protetor Auricular', conformes: 43, total: 50, percentual: 86 }
    ],
    
    // Ranking colaboradores
    rankingColaboradores: [
      { nome: 'João Silva', conformidade: 100, equipe: 'Alfa' },
      { nome: 'Maria Santos', conformidade: 98, equipe: 'Bravo' },
      { nome: 'Pedro Costa', conformidade: 95, equipe: 'Charlie' },
      { nome: 'Ana Oliveira', conformidade: 92, equipe: 'Delta' },
      { nome: 'Carlos Lima', conformidade: 88, equipe: 'Alfa' }
    ],
    
    // Itens mais problemáticos
    itensProblematicos: [
      { name: 'Óculos/Protetor', value: 7, color: '#ef4444' },
      { name: 'Camisas', value: 6, color: '#f59e0b' },
      { name: 'Balaclavas', value: 5, color: '#f97316' },
      { name: 'Gandolas', value: 5, color: '#eab308' },
      { name: 'Botas Segurança', value: 4, color: '#84cc16' }
    ]
  };

  const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4'];

  return (
    <div className="space-y-6">
      {/* SEÇÃO 1: VISÃO GERAL - Cards Superiores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">TPs Verificados no Mês</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{mockData.tpsVerificados}</div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span>Meta: {mockData.metaMensal}</span>
              <Progress value={(mockData.tpsVerificados / mockData.metaMensal) * 100} className="w-16 h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa Conformidade TPs</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{mockData.taxaConformidadeTP}%</div>
            <p className="text-xs text-muted-foreground">
              {mockData.conformidadeTPs.reduce((acc, item) => acc + item.conformes, 0)} de {mockData.conformidadeTPs.reduce((acc, item) => acc + item.total, 0)} conformes
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-cyan-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">TPs Higienizados</CardTitle>
            <Droplets className="h-4 w-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-600">{mockData.tpsHigienizados}</div>
            <p className="text-xs text-muted-foreground">
              Higienizados este mês
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Colaboradores Uniformes OK</CardTitle>
            <Users className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{mockData.colaboradoresUniformesOK}%</div>
            <p className="text-xs text-muted-foreground">
              Com todos itens conformes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* SEÇÃO 2: STATUS DETALHADO DOS TPs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Conformidade por Item TP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mockData.conformidadeTPs} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="item" type="category" width={150} fontSize={12} />
                <Tooltip formatter={(value) => [`${value}%`, 'Conformidade']} />
                <Bar dataKey="percentual" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Status Geral TPs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <RechartsPieChart>
                  <Pie
                    data={mockData.statusGeralTPs}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {mockData.statusGeralTPs.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="flex flex-col space-y-2 mt-4">
                {mockData.statusGeralTPs.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* SEÇÃO 3: EVOLUÇÃO E UNIFORMES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Evolução Verificações (6 meses)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={mockData.evolucaoVerificacoes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="verificados" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                <Area type="monotone" dataKey="conformes" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.8} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Colaboradores 100% Conformes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">{mockData.colaboradoresUniformesOK}%</div>
              <p className="text-muted-foreground mb-4">dos colaboradores estão com uniformes completos</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">46</div>
                  <p className="text-muted-foreground">Conformes</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">4</div>
                  <p className="text-muted-foreground">Pendentes</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SEÇÃO 4: STATUS UNIFORMES POR ITEM */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Conformidade Uniformes por Item
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={mockData.conformidadeUniformes} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="item" type="category" width={180} fontSize={12} />
              <Tooltip formatter={(value) => [`${value}%`, 'Conformidade']} />
              <Bar dataKey="percentual" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* SEÇÃO 5: ANÁLISE POR COLABORADOR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Ranking Colaboradores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockData.rankingColaboradores.map((colaborador, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{colaborador.nome}</p>
                      <p className="text-sm text-muted-foreground">Equipe {colaborador.equipe}</p>
                    </div>
                  </div>
                  <Badge variant={colaborador.conformidade >= 95 ? "default" : "secondary"}>
                    {colaborador.conformidade}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Itens Mais Problemáticos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPieChart>
                <Pie
                  data={mockData.itensProblematicos}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {mockData.itensProblematicos.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {mockData.itensProblematicos.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-xs">{item.name}</span>
                  <span className="text-xs font-medium">({item.value})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SEÇÃO 6: ALERTAS E PENDÊNCIAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="font-semibold">5 TPs Não Verificados</div>
            <div className="text-sm">Verificação pendente este mês</div>
          </AlertDescription>
        </Alert>

        <Alert className="border-yellow-200 bg-yellow-50">
          <Clock className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <div className="font-semibold">10 TPs Não Higienizados</div>
            <div className="text-sm">Higienização pendente</div>
          </AlertDescription>
        </Alert>

        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <div className="font-semibold">4 Colaboradores Pendentes</div>
            <div className="text-sm">Itens de uniforme faltantes</div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default TPUniformesDashboard;
