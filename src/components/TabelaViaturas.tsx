
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Truck, CheckCircle, AlertTriangle, Wrench } from "lucide-react";
import { ViaturasStats } from '@/hooks/useDashboardStats';

interface TabelaViaturasProps {
  dados: ViaturasStats;
}

export const TabelaViaturas: React.FC<TabelaViaturasProps> = ({ dados }) => {
  // Dados mockados das viaturas para demonstração
  const viaturas = [
    {
      id: 1,
      prefixo: "ABT-01",
      modelo: "Mercedes Atego",
      status: "operacional",
      ultimoChecklist: "2024-01-15",
      conformidades: 18,
      naoConformidades: 2,
      proximaManutencao: "2024-02-15"
    },
    {
      id: 2,
      prefixo: "ABT-02", 
      modelo: "Scania P-Series",
      status: "manutencao",
      ultimoChecklist: "2024-01-10",
      conformidades: 15,
      naoConformidades: 5,
      proximaManutencao: "2024-01-25"
    },
    {
      id: 3,
      prefixo: "UTR-01",
      modelo: "Ford F-350",
      status: "operacional",
      ultimoChecklist: "2024-01-18",
      conformidades: 20,
      naoConformidades: 0,
      proximaManutencao: "2024-03-01"
    },
    {
      id: 4,
      prefixo: "UTR-02",
      modelo: "Iveco Daily",
      status: "operacional",
      ultimoChecklist: "2024-01-12",
      conformidades: 17,
      naoConformidades: 3,
      proximaManutencao: "2024-02-20"
    },
    {
      id: 5,
      prefixo: "QCG-01",
      modelo: "Mercedes Actros",
      status: "operacional",
      ultimoChecklist: "2024-01-16",
      conformidades: 19,
      naoConformidades: 1,
      proximaManutencao: "2024-02-28"
    },
    {
      id: 6,
      prefixo: "QCG-02",
      modelo: "Volvo FH",
      status: "operacional",
      ultimoChecklist: "2024-01-14",
      conformidades: 16,
      naoConformidades: 4,
      proximaManutencao: "2024-02-10"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operacional':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Operacional</Badge>;
      case 'manutencao':
        return <Badge className="bg-red-100 text-red-800"><Wrench className="h-3 w-3 mr-1" />Manutenção</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getConformidadePercentual = (conformidades: number, naoConformidades: number) => {
    const total = conformidades + naoConformidades;
    return total > 0 ? (conformidades / total) * 100 : 0;
  };

  return (
    <div className="space-y-6">
      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Viaturas</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dados.total_viaturas}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operacionais</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{dados.viaturas_operacionais}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Checklists Realizados</CardTitle>
            <AlertTriangle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{dados.checklists_realizados}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Não Conformidades</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{dados.nao_conformidades}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela Detalhada */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Status Detalhado das Viaturas
          </CardTitle>
          <CardDescription>
            Informações de inspeções e manutenções
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Viatura</th>
                  <th className="text-left py-3 px-4 font-semibold">Modelo</th>
                  <th className="text-center py-3 px-4 font-semibold">Status</th>
                  <th className="text-center py-3 px-4 font-semibold">Último Checklist</th>
                  <th className="text-center py-3 px-4 font-semibold">Conformidade</th>
                  <th className="text-center py-3 px-4 font-semibold">Próxima Manutenção</th>
                </tr>
              </thead>
              <tbody>
                {viaturas.map((viatura) => {
                  const conformidadePerc = getConformidadePercentual(viatura.conformidades, viatura.naoConformidades);
                  
                  return (
                    <tr key={viatura.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{viatura.prefixo}</td>
                      <td className="py-3 px-4">{viatura.modelo}</td>
                      <td className="text-center py-3 px-4">
                        {getStatusBadge(viatura.status)}
                      </td>
                      <td className="text-center py-3 px-4">
                        {new Date(viatura.ultimoChecklist).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="text-center py-3 px-4">
                        <div className="space-y-2">
                          <div className="text-sm">
                            {viatura.conformidades}/{viatura.conformidades + viatura.naoConformidades}
                          </div>
                          <Progress 
                            value={conformidadePerc} 
                            className="h-2 w-16 mx-auto"
                          />
                          <div className="text-xs text-muted-foreground">
                            {conformidadePerc.toFixed(0)}%
                          </div>
                        </div>
                      </td>
                      <td className="text-center py-3 px-4">
                        <div className="text-sm">
                          {new Date(viatura.proximaManutencao).toLocaleDateString('pt-BR')}
                        </div>
                        {new Date(viatura.proximaManutencao) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && (
                          <Badge variant="destructive" className="mt-1 text-xs">
                            Urgente
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
