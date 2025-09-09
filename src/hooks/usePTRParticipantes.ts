
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PTRParticipante {
  id?: string;
  ptr_instrucao_id: string;
  bombeiro_id: string;
  presente?: boolean;
  observacoes?: string;
  situacao_ba?: 'P' | 'A' | 'EO';
}

export const usePTRParticipantes = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Adicionar participantes a uma instrução
  const adicionarParticipantes = useMutation({
    mutationFn: async ({ instrucaoId, bombeirosIds }: { instrucaoId: string; bombeirosIds: string[] }) => {
      const participantes = bombeirosIds.map(bombeiroId => ({
        ptr_instrucao_id: instrucaoId,
        bombeiro_id: bombeiroId,
        presente: false,
        situacao_ba: 'P' as const
      }));

      const { data, error } = await supabase
        .from('ptr_participantes')
        .insert(participantes)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ptr-instrucoes'] });
      toast({
        title: "Sucesso",
        description: "Participantes adicionados com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao adicionar participantes: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Atualizar presença de participante
  const atualizarPresenca = useMutation({
    mutationFn: async ({ participanteId, presente, observacoes, situacao_ba }: { 
      participanteId: string; 
      presente: boolean; 
      observacoes?: string;
      situacao_ba?: 'P' | 'A' | 'EO';
    }) => {
      const { data, error } = await supabase
        .from('ptr_participantes')
        .update({ presente, observacoes, situacao_ba })
        .eq('id', participanteId)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ptr-instrucoes'] });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar presença: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Atualizar múltiplas presenças
  const atualizarMultiplasPresencas = useMutation({
    mutationFn: async (atualizacoes: Array<{ id: string; presente: boolean; observacoes?: string; situacao_ba?: 'P' | 'A' | 'EO' }>) => {
      const promises = atualizacoes.map(({ id, presente, observacoes, situacao_ba }) =>
        supabase
          .from('ptr_participantes')
          .update({ presente, observacoes, situacao_ba })
          .eq('id', id)
      );

      const results = await Promise.all(promises);
      
      const errors = results.filter(result => result.error);
      if (errors.length > 0) {
        throw new Error('Erro ao atualizar algumas presenças');
      }

      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ptr-instrucoes'] });
      toast({
        title: "Sucesso",
        description: "Presenças atualizadas com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar presenças: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Remover participante
  const removerParticipante = useMutation({
    mutationFn: async (participanteId: string) => {
      const { error } = await supabase
        .from('ptr_participantes')
        .delete()
        .eq('id', participanteId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ptr-instrucoes'] });
      toast({
        title: "Sucesso",
        description: "Participante removido com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao remover participante: " + error.message,
        variant: "destructive",
      });
    }
  });

  return {
    adicionarParticipantes,
    atualizarPresenca,
    atualizarMultiplasPresencas,
    removerParticipante
  };
};
