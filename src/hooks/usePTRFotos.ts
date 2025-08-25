
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const usePTRFotos = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Upload de foto para storage
  const uploadFoto = async (file: File, instrucaoId: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${instrucaoId}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('ptr-fotos')
      .upload(fileName, file);

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from('ptr-fotos')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  // Salvar referência da foto no banco
  const salvarFoto = useMutation({
    mutationFn: async ({ 
      instrucaoId, 
      fotoUrl, 
      descricao, 
      ordem 
    }: { 
      instrucaoId: string; 
      fotoUrl: string; 
      descricao?: string; 
      ordem: number;
    }) => {
      const { data, error } = await supabase
        .from('ptr_fotos')
        .insert({
          ptr_instrucao_id: instrucaoId,
          foto_url: fotoUrl,
          descricao,
          ordem
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ptr-instrucoes'] });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao salvar foto: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Upload completo (arquivo + banco)
  const uploadFotoCompleto = useMutation({
    mutationFn: async ({ 
      file, 
      instrucaoId, 
      descricao, 
      ordem 
    }: { 
      file: File; 
      instrucaoId: string; 
      descricao?: string; 
      ordem: number;
    }) => {
      // 1. Upload do arquivo
      const fotoUrl = await uploadFoto(file, instrucaoId);
      
      // 2. Salvar referência no banco
      const { data, error } = await supabase
        .from('ptr_fotos')
        .insert({
          ptr_instrucao_id: instrucaoId,
          foto_url: fotoUrl,
          descricao,
          ordem
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ptr-instrucoes'] });
      toast({
        title: "Sucesso",
        description: "Foto enviada com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao enviar foto: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Deletar foto
  const deletarFoto = useMutation({
    mutationFn: async (fotoId: string) => {
      // Primeiro buscar a foto para pegar a URL
      const { data: foto, error: fetchError } = await supabase
        .from('ptr_fotos')
        .select('foto_url')
        .eq('id', fotoId)
        .single();

      if (fetchError) throw fetchError;

      // Extrair o path do storage da URL
      const urlParts = foto.foto_url.split('/');
      const bucketPath = urlParts.slice(-2).join('/'); // instrucaoId/filename

      // Deletar do storage
      const { error: storageError } = await supabase.storage
        .from('ptr-fotos')
        .remove([bucketPath]);

      if (storageError) throw storageError;

      // Deletar do banco
      const { error: dbError } = await supabase
        .from('ptr_fotos')
        .delete()
        .eq('id', fotoId);

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ptr-instrucoes'] });
      toast({
        title: "Sucesso",
        description: "Foto deletada com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao deletar foto: " + error.message,
        variant: "destructive",
      });
    }
  });

  return {
    uploadFoto,
    salvarFoto,
    uploadFotoCompleto,
    deletarFoto
  };
};
