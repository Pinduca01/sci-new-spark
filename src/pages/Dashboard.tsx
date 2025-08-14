import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Shield, 
  Users, 
  AlertTriangle, 
  Truck,
  Radio,
  FileText,
  Clock,
  CheckCircle
} from "lucide-react";

const Dashboard = () => {
  return (
    <div className="p-6">
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Visão geral da Seção Contraincêndio
          </p>
        </div>

        {/* Welcome Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
              <Shield className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                SCI-Core
              </h2>
              <p className="text-lg text-muted-foreground">
                Sistema de Gestão para Seção Contraincêndio
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="glass-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pessoal Ativo</CardTitle>
                    <Users className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">24</div>
                    <p className="text-xs text-muted-foreground">
                      Bombeiros em serviço
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ocorrências Hoje</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-500">3</div>
                    <p className="text-xs text-muted-foreground">
                      Atendimentos realizados
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Veículos</CardTitle>
                    <Truck className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">6</div>
                    <p className="text-xs text-muted-foreground">
                      Operacionais
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Equipamentos</CardTitle>
                    <Radio className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">98%</div>
                    <p className="text-xs text-muted-foreground">
                      Taxa operacional
                    </p>
                  </CardContent>
                </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="glass-card hover:scale-105 transition-all duration-300 cursor-pointer">
                  <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mb-4">
                      <Users className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <CardTitle>Controle de Pessoal</CardTitle>
                    <CardDescription>
                      Gerencie a equipe da seção contraincêndio
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="glass-card hover:scale-105 transition-all duration-300 cursor-pointer">
                  <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-4">
                      <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle>Ocorrências</CardTitle>
                    <CardDescription>
                      Registre e acompanhe emergências
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="glass-card hover:scale-105 transition-all duration-300 cursor-pointer">
                  <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle>Relatórios</CardTitle>
                    <CardDescription>
                      Análises e estatísticas detalhadas
                    </CardDescription>
                  </CardHeader>
                </Card>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-primary" />
                      <span>Últimas Atividades</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Troca de turno realizada</p>
                        <p className="text-xs text-muted-foreground">há 15 minutos</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Ocorrência registrada</p>
                        <p className="text-xs text-muted-foreground">há 2 horas</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Inspeção de equipamentos</p>
                        <p className="text-xs text-muted-foreground">há 4 horas</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>Status do Sistema</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Sistema Principal:</span>
                      <span className="text-sm text-green-600 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Operacional
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Comunicações:</span>
                      <span className="text-sm text-green-600 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Ativo
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Último Backup:</span>
                      <span className="text-sm">{new Date().toLocaleDateString('pt-BR')}</span>
                    </div>
                  </CardContent>
                </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;