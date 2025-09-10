import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export interface AgenteExtintor {
  id: string;
  tipo: 'LGE' | 'PO_QUIMICO' | 'NITROGENIO';
  fabricante: string;
  lote?: string;
  quantidade: number;
  unidade: string;
  situacao: 'ESTOQUE' | 'EM_USO' | 'MANUTENCAO' | 'DESCARTADO';
  data_validade?: string;
  data_fabricacao: string;
  data_teste_hidrostatico?: string;
  validade_ensaio?: string;
  proximo_teste_hidrostatico?: string;
  data_modificacao?: string;
  created_at: string;
  updated_at: string;
}

export interface Movimentacao {
  id: string;
  agente_id: string;
  usuario_id: string;
  tipo_movimentacao: 'ENTRADA' | 'SAIDA';
  quantidade: number;
  equipe: 'Alfa' | 'Bravo' | 'Charlie' | 'Delta';
  observacoes?: string;
  data_movimentacao: string;
  created_at: string;
  agente_extintor?: AgenteExtintor;
}



export interface LoteRecomendado {
  tipo: string;
  fabricante: string;
  quantidade_disponivel: number;
  data_vencimento: string;
  dias_para_vencimento: number;
}

export const useAgentesExtintores = () => {
  const [agentes, setAgentes] = useState<AgenteExtintor[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar agentes extintores
  const fetchAgentes = async () => {
    try {
      const { data, error } = await supabase
        .from('agentes_extintores')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAgentes(data || []);
    } catch (err) {
      console.error('Erro ao carregar agentes:', err);
      setError('Erro ao carregar agentes extintores');
      toast.error('Erro ao carregar agentes extintores');
    }
  };

  // Carregar movimentações
  const fetchMovimentacoes = async () => {
    try {
      const { data, error } = await supabase
        .from('movimentacoes')
        .select(`
          *,
          agente_extintor:agentes_extintores(*)
        `)
        .order('data_movimentacao', { ascending: false })
        .limit(50);

      if (error) throw error;
      setMovimentacoes(data || []);
    } catch (err) {
      console.error('Erro ao carregar movimentações:', err);
      setError('Erro ao carregar movimentações');
    }
  };



  // Criar novo agente extintor
  const createAgente = async (agente: Omit<AgenteExtintor, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Verificar se já existe um registro com mesmo tipo, lote e data de fabricação
      if (agente.lote && agente.data_fabricacao) {
        const { data: existingAgente, error: searchError } = await supabase
          .from('agentes_extintores')
          .select('*')
          .eq('tipo', agente.tipo)
          .eq('lote', agente.lote)
          .eq('data_fabricacao', agente.data_fabricacao)
          .single();

        if (searchError && searchError.code !== 'PGRST116') {
          throw searchError;
        }

        // Se encontrou um registro existente, somar as quantidades
        if (existingAgente) {
          const novaQuantidade = existingAgente.quantidade + agente.quantidade;
          
          const { data: updatedAgente, error: updateError } = await supabase
            .from('agentes_extintores')
            .update({ 
              quantidade: novaQuantidade,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingAgente.id)
            .select()
            .single();

          if (updateError) throw updateError;
          
          // Atualizar o estado local
          setAgentes(prev => prev.map(a => 
            a.id === existingAgente.id ? updatedAgente : a
          ));
          
          toast.success(`Quantidade somada ao registro existente! Nova quantidade: ${novaQuantidade}`);
          return updatedAgente;
        }
      }

      // Se não encontrou registro existente, criar novo normalmente
      const { data, error } = await supabase
        .from('agentes_extintores')
        .insert([agente])
        .select()
        .single();

      if (error) throw error;
      
      setAgentes(prev => [data, ...prev]);
      toast.success('Agente extintor criado com sucesso!');
      return data;
    } catch (err) {
      console.error('Erro ao criar agente:', err);
      toast.error('Erro ao criar agente extintor');
      throw err;
    }
  };

  // Atualizar agente extintor
  const updateAgente = async (id: string, updates: Partial<AgenteExtintor>) => {
    try {
      const { data, error } = await supabase
        .from('agentes_extintores')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setAgentes(prev => prev.map(agente => 
        agente.id === id ? data : agente
      ));
      toast.success('Agente extintor atualizado com sucesso!');
      return data;
    } catch (err) {
      console.error('Erro ao atualizar agente:', err);
      toast.error('Erro ao atualizar agente extintor');
      throw err;
    }
  };

  // Excluir agente extintor
  const deleteAgente = async (id: string) => {
    try {
      const { error } = await supabase
        .from('agentes_extintores')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setAgentes(prev => prev.filter(agente => agente.id !== id));
      toast.success('Agente extintor excluído com sucesso!');
    } catch (err) {
      console.error('Erro ao excluir agente:', err);
      toast.error('Erro ao excluir agente extintor');
      throw err;
    }
  };

  // Registrar movimentação
  const registrarMovimentacao = async (movimentacao: Omit<Movimentacao, 'id' | 'created_at' | 'agente_extintor'>) => {
    try {
      const { data, error } = await supabase
        .from('movimentacoes')
        .insert([movimentacao])
        .select(`
          *,
          agente_extintor:agentes_extintores(*)
        `)
        .single();

      if (error) throw error;
      
      // Atualizar quantidade do agente
      const agente = agentes.find(a => a.id === movimentacao.agente_id);
      if (agente) {
        const novaQuantidade = movimentacao.tipo_movimentacao === 'ENTRADA' 
          ? agente.quantidade + movimentacao.quantidade
          : agente.quantidade - movimentacao.quantidade;
        
        await updateAgente(agente.id, { quantidade: novaQuantidade });
      }
      
      setMovimentacoes(prev => [data, ...prev]);
      toast.success('Movimentação registrada com sucesso!');
      return data;
    } catch (err) {
      console.error('Erro ao registrar movimentação:', err);
      toast.error('Erro ao registrar movimentação');
      throw err;
    }
  };

  // Excluir movimentação
  const deleteMovimentacao = async (id: string) => {
    try {
      // Buscar a movimentação antes de excluir para reverter a quantidade
      const movimentacao = movimentacoes.find(m => m.id === id);
      if (!movimentacao) {
        throw new Error('Movimentação não encontrada');
      }

      // Excluir a movimentação do banco
      const { error } = await supabase
        .from('movimentacoes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Reverter a quantidade no agente extintor
      const agente = agentes.find(a => a.id === movimentacao.agente_id);
      if (agente) {
        const quantidadeRevertida = movimentacao.tipo_movimentacao === 'ENTRADA' 
          ? agente.quantidade - movimentacao.quantidade  // Se foi entrada, subtrair
          : agente.quantidade + movimentacao.quantidade; // Se foi saída, somar de volta
        
        await updateAgente(agente.id, { quantidade: quantidadeRevertida });
      }
      
      // Remover da lista local
      setMovimentacoes(prev => prev.filter(mov => mov.id !== id));
      toast.success('Movimentação excluída com sucesso!');
    } catch (err) {
      console.error('Erro ao excluir movimentação:', err);
      toast.error('Erro ao excluir movimentação');
      throw err;
    }
  };



  // Estatísticas do dashboard
  const getEstatisticas = () => {
    const totalLGE = agentes
      .filter(a => a.tipo === 'LGE')
      .reduce((sum, a) => sum + a.quantidade, 0);
    
    const totalPoQuimico = agentes
      .filter(a => a.tipo === 'PO_QUIMICO')
      .reduce((sum, a) => sum + a.quantidade, 0);
    
    const totalNitrogenio = agentes
      .filter(a => a.tipo === 'NITROGENIO')
      .reduce((sum, a) => sum + a.quantidade, 0);

    // Alertas de validade (próximos 30 dias)
    const hoje = new Date();
    const em30Dias = new Date(hoje.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    const alertasValidade = agentes.filter(agente => {
      const dataValidade = new Date(agente.data_validade);
      return dataValidade <= em30Dias && dataValidade >= hoje;
    });

    return {
      totalLGE,
      totalPoQuimico,
      totalNitrogenio,
      alertasValidade,
      totalAgentes: agentes.length,
      agentesPorTipo: {
        LGE: agentes.filter(a => a.tipo === 'LGE').length,
        PO_QUIMICO: agentes.filter(a => a.tipo === 'PO_QUIMICO').length,
        NITROGENIO: agentes.filter(a => a.tipo === 'NITROGENIO').length,
      }
    };
  };

  // Buscar agentes por período (para relatórios)
  const fetchAgentesPorPeriodo = async (mes: number, ano: number): Promise<AgenteExtintor[]> => {
    try {
      // Criar datas de início e fim do mês
      const inicioMes = new Date(ano, mes - 1, 1).toISOString();
      const fimMes = new Date(ano, mes, 0, 23, 59, 59, 999).toISOString();

      const { data, error } = await supabase
        .from('agentes_extintores')
        .select('*')
        .gte('created_at', inicioMes)
        .lte('created_at', fimMes)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar agentes por período:', err);
      toast.error('Erro ao buscar agentes do período selecionado');
      throw err;
    }
  };

  // Obter recomendação de lote (FIFO)
  const getRecomendacaoLote = async (tipo: string): Promise<LoteRecomendado | null> => {
    try {
      // Buscar agentes do tipo especificado, ordenados por data de validade (FIFO)
      const agentesFiltrados = agentes
        .filter(agente => agente.tipo === tipo && agente.quantidade > 0)
        .sort((a, b) => new Date(a.data_validade || '').getTime() - new Date(b.data_validade || '').getTime());
      
      if (agentesFiltrados.length === 0) {
        return null;
      }
      
      const agenteRecomendado = agentesFiltrados[0];
      const hoje = new Date();
      const dataVencimento = new Date(agenteRecomendado.data_validade || '');
      const diasParaVencimento = Math.ceil((dataVencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        tipo: agenteRecomendado.tipo,
        fabricante: agenteRecomendado.fabricante,
        quantidade_disponivel: agenteRecomendado.quantidade,
        data_vencimento: agenteRecomendado.data_validade || '',
        dias_para_vencimento: diasParaVencimento
      };
    } catch (err) {
      console.error('Erro ao obter recomendação de lote:', err);
      return null;
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchAgentes(),
        fetchMovimentacoes()
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    // Estados
    agentes,
    movimentacoes,
    loading,
    error,
    
    // Funções
    fetchAgentes,
    fetchMovimentacoes,
    fetchAgentesPorPeriodo,
    createAgente,
    updateAgente,
    deleteAgente,
    registrarMovimentacao,
    deleteMovimentacao,
    getEstatisticas,
    getRecomendacaoLote,
    
    // Utilitários
    refetch: () => {
      fetchAgentes();
      fetchMovimentacoes();
    }
  };
};

export default useAgentesExtintores;