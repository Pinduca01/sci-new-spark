import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

// DEPRECATED: Este hook está sendo substituído por useUserRole
interface UserProfile {
  id?: string;
  user_id: string;
  email: string;
  full_name: string | null;
  base_id?: string;
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
  ativo?: boolean;
}

interface UseUserProfileReturn {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useUserProfile = (user: User | null): UseUserProfileReturn => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchProfile = async (userId: string, attempt = 1): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          console.log('Perfil não encontrado, usando fallback...');
          setProfile({
            user_id: userId,
            email: user?.email || 'usuario@exemplo.com',
            full_name: user?.user_metadata?.full_name || 'Usuário',
            ativo: true
          });
          setLoading(false);
          return;
        } else {
          throw fetchError;
        }
      } else {
        setProfile(data);
        setRetryCount(0);
      }
    } catch (err: any) {
      console.error(`Erro ao buscar perfil (tentativa ${attempt}):`, err);
      
      // Retry logic for network errors com timeout reduzido
      if (attempt < 3 && isNetworkError(err)) {
        console.log(`Tentando novamente em 1000ms...`);
        setTimeout(() => {
          fetchProfile(userId, attempt + 1);
        }, 1000);
        return;
      }
      
      // Após 3 tentativas, finalizar loading com fallback
      setProfile({
        user_id: userId,
        email: user?.email || 'usuario@exemplo.com',
        full_name: user?.user_metadata?.full_name || 'Usuário',
        ativo: true
      });
      
      setError(`Erro ao carregar perfil: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const createProfile = async (userId: string): Promise<void> => {
    try {
      // DEPRECATED: perfis agora são criados pelo admin via edge function
      console.warn('Tentativa de criar perfil automaticamente - não suportado no novo sistema');
      
      // Set fallback profile para não quebrar componentes antigos
      setProfile({
        user_id: userId,
        email: user?.email || 'usuario@exemplo.com',
        full_name: user?.user_metadata?.full_name || 'Usuário',
        ativo: true
      });
    } catch (err: any) {
      console.error('Erro ao criar perfil:', err);
      
      // Set fallback profile even if creation fails
      setProfile({
        user_id: userId,
        email: user?.email || 'usuario@exemplo.com',
        full_name: user?.user_metadata?.full_name || 'Usuário',
        ativo: true
      });
    }
  };

  const isNetworkError = (error: any): boolean => {
    return (
      error?.message?.includes('Failed to fetch') ||
      error?.message?.includes('NetworkError') ||
      error?.message?.includes('ERR_NETWORK') ||
      error?.code === 'NETWORK_ERROR'
    );
  };

  const refetch = async (): Promise<void> => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchProfile(user.id);
      
      // Timeout de segurança - forçar finalização após 5s
      const timeoutId = setTimeout(() => {
        console.warn('Timeout ao carregar perfil - usando fallback');
        setProfile({
          user_id: user.id,
          email: user.email || 'usuario@exemplo.com',
          full_name: user.user_metadata?.full_name || 'Usuário',
          ativo: true
        });
        setLoading(false);
      }, 5000);
      
      return () => clearTimeout(timeoutId);
    } else {
      setProfile(null);
      setError(null);
      setLoading(false);
    }
  }, [user?.id]);

  return {
    profile,
    loading,
    error,
    refetch
  };
};