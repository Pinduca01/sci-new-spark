import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface NaoConformidade {
  id?: string;
  checklist_id: string;
  item_id: string;
  item_nome: string;
  secao: string;
  descricao: string;
  imagem_url?: string;
  imagem_nome?: string;
  bombeiro_responsavel: string;
  data_registro?: string;
  created_at?: string;
  updated_at?: string;
}

export const useNaoConformidades = () => {
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Função para fazer upload de imagem para o Supabase Storage
  const uploadImagem = async (file: File): Promise<{ url: string; nome: string } | null> => {
    try {
      setUploading(true);
      
      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `nao-conformidades/${fileName}`;

      // Fazer upload do arquivo
      const { error: uploadError } = await supabase.storage
        .from('nao-conformidades')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        toast({
          title: "Erro no Upload",
          description: "Não foi possível fazer upload da imagem.",
          variant: "destructive",
        });
        return null;
      }

      // Obter URL pública da imagem
      const { data: { publicUrl } } = supabase.storage
        .from('nao-conformidades')
        .getPublicUrl(filePath);

      return {
        url: publicUrl,
        nome: file.name
      };
    } catch (error) {
      console.error('Erro no upload da imagem:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado no upload da imagem.",
        variant: "destructive",
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  // Função para salvar não conformidade no banco
  const salvarNaoConformidade = async (naoConformidade: Omit<NaoConformidade, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('nao_conformidades')
        .insert(naoConformidade);

      if (error) {
        console.error('Erro ao salvar não conformidade:', error);
        toast({
          title: "Erro ao Salvar",
          description: "Não foi possível salvar a não conformidade.",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Sucesso",
        description: "Não conformidade salva com sucesso!",
      });
      return true;
    } catch (error) {
      console.error('Erro ao salvar não conformidade:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao salvar não conformidade.",
        variant: "destructive",
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Função para salvar não conformidade com imagem
  const salvarNaoConformidadeComImagem = async (
    naoConformidade: Omit<NaoConformidade, 'id' | 'created_at' | 'updated_at' | 'imagem_url' | 'imagem_nome'>,
    imagem?: File
  ): Promise<boolean> => {
    try {
      let imagemData = null;
      
      // Se há imagem, fazer upload primeiro
      if (imagem) {
        imagemData = await uploadImagem(imagem);
        if (!imagemData) {
          return false; // Upload falhou
        }
      }

      // Preparar dados para salvar
      const dadosParaSalvar: Omit<NaoConformidade, 'id' | 'created_at' | 'updated_at'> = {
        ...naoConformidade,
        imagem_url: imagemData?.url,
        imagem_nome: imagemData?.nome
      };

      return await salvarNaoConformidade(dadosParaSalvar);
    } catch (error) {
      console.error('Erro ao salvar não conformidade com imagem:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao processar não conformidade.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Função para buscar não conformidades de um checklist
  const buscarNaoConformidades = async (checklistId: string): Promise<NaoConformidade[]> => {
    try {
      const { data, error } = await supabase
        .from('nao_conformidades')
        .select('*')
        .eq('checklist_id', checklistId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar não conformidades:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Erro ao buscar não conformidades:', error);
      return [];
    }
  };

  // Função para deletar imagem do storage
  const deletarImagem = async (imagemUrl: string): Promise<boolean> => {
    try {
      // Extrair o caminho da imagem da URL
      const url = new URL(imagemUrl);
      const pathSegments = url.pathname.split('/');
      const filePath = pathSegments.slice(-2).join('/'); // pega 'nao-conformidades/filename'

      const { error } = await supabase.storage
        .from('nao-conformidades')
        .remove([filePath]);

      if (error) {
        console.error('Erro ao deletar imagem:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao deletar imagem:', error);
      return false;
    }
  };

  return {
    uploading,
    saving,
    uploadImagem,
    salvarNaoConformidade,
    salvarNaoConformidadeComImagem,
    buscarNaoConformidades,
    deletarImagem
  };
};