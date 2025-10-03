import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ChecklistStats {
  total: number;
  taxaConformidade: number;
  pendentes: number;
  naoConformidades: number;
}

export const useChecklistsStats = () => {
  // Buscar checklists de viaturas
  const { data: viaturasChecklists, isLoading: viaturasLoading } = useQuery({
    queryKey: ['checklists-viaturas-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checklists_viaturas')
        .select('*')
        .order('data_checklist', { ascending: false })
        .order('hora_checklist', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    }
  });

  // Buscar checklists de almoxarifado
  const { data: almoxarifadoChecklists, isLoading: almoxarifadoLoading } = useQuery({
    queryKey: ['checklists-almoxarifado-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checklists_almoxarifado')
        .select('*')
        .order('data_checklist', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    }
  });

  // Calcular estatísticas
  const stats: ChecklistStats | null = (() => {
    if (!viaturasChecklists || !almoxarifadoChecklists) return null;

    const totalViaturas = viaturasChecklists.length;
    const totalAlmoxarifado = almoxarifadoChecklists.length;
    const total = totalViaturas + totalAlmoxarifado;

    // Contar por status
    const aprovadosViaturas = viaturasChecklists.filter(c => 
      c.status_geral === 'APROVADO' || c.status_geral === 'CONCLUIDO'
    ).length;
    
    const aprovadosAlmoxarifado = almoxarifadoChecklists.filter(c => 
      c.status_geral === 'APROVADO'
    ).length;

    const pendentesViaturas = viaturasChecklists.filter(c => 
      c.status_geral === 'PENDENTE' || c.status_geral === 'em_andamento' || c.status_geral === 'EM_ANDAMENTO'
    ).length;
    
    const pendentesAlmoxarifado = almoxarifadoChecklists.filter(c => 
      c.status_geral === 'PENDENTE' || c.status_geral === 'em_andamento'
    ).length;

    const reprovadosViaturas = viaturasChecklists.filter(c => 
      c.status_geral === 'REPROVADO'
    ).length;
    
    const reprovadosAlmoxarifado = almoxarifadoChecklists.filter(c => 
      c.status_geral === 'REPROVADO'
    ).length;

    const totalAprovados = aprovadosViaturas + aprovadosAlmoxarifado;
    const totalPendentes = pendentesViaturas + pendentesAlmoxarifado;
    const totalReprovados = reprovadosViaturas + reprovadosAlmoxarifado;

    const taxaConformidade = total > 0 
      ? Math.round((totalAprovados / total) * 100) 
      : 0;

    return {
      total,
      taxaConformidade,
      pendentes: totalPendentes,
      naoConformidades: totalReprovados
    };
  })();

  return {
    stats,
    viaturasChecklists,
    almoxarifadoChecklists,
    isLoading: viaturasLoading || almoxarifadoLoading
  };
};
