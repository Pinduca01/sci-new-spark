
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { rateLimiter } from '@/utils/securityUtils';

// URL do Supabase para construir a chave de autenticação
const SUPABASE_URL = "https://rfgmqogwhlnfrhifsbbg.supabase.co";

// Função para limpar tokens expirados do localStorage
const clearExpiredTokens = () => {
  try {
    // Limpar dados de autenticação do Supabase
    const supabaseAuthKey = `sb-${SUPABASE_URL.split('//')[1].split('.')[0]}-auth-token`;
    localStorage.removeItem(supabaseAuthKey);
    
    // Limpar outras chaves relacionadas à autenticação
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('supabase') || key.includes('auth'))) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    console.log('Tokens expirados removidos do localStorage');
  } catch (error) {
    console.error('Erro ao limpar tokens expirados:', error);
  }
};

export const useSecureAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Erro ao obter sessão:', error);
        // Se houver erro relacionado a refresh token, limpar tokens
        if (error.message.includes('refresh') || error.message.includes('token')) {
          clearExpiredTokens();
        }
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }
      
      setIsAuthenticated(!!session);
      if (session) {
        fetchUserRole();
      } else {
        setLoading(false);
      }
    }).catch((error) => {
      console.error('Erro inesperado ao obter sessão:', error);
      clearExpiredTokens();
      setIsAuthenticated(false);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event);
      
      // Se houver erro de token, limpar localStorage
      if (event === 'TOKEN_REFRESHED' && !session) {
        clearExpiredTokens();
      }
      
      setIsAuthenticated(!!session);
      if (session) {
        fetchUserRole();
      } else {
        setUserRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async () => {
    try {
      // Buscar role e status ativo do perfil
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role, ativo')
        .single();

      if (profileError) {
        // Se houver erro relacionado à autenticação, limpar tokens
        if (profileError.message.includes('JWT') || profileError.message.includes('token') || profileError.message.includes('refresh')) {
          clearExpiredTokens();
          setIsAuthenticated(false);
          setUserRole(null);
          setLoading(false);
          return;
        }
        throw profileError;
      }

      // Verificar se o usuário está ativo
      if (profileData?.ativo === false) {
        console.warn('Usuário inativo tentou acessar o sistema');
        await signOut();
        throw new Error('Sua conta está inativa. Entre em contato com o administrador.');
      }
      
      setUserRole(profileData?.role || 'user');
    } catch (error) {
      console.error('Error fetching user role:', error);
      if (error instanceof Error && error.message.includes('inativa')) {
        // Propagar erro de conta inativa
        throw error;
      }
      setUserRole('user');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    // Rate limit sign out attempts
    const clientId = 'signout-' + (localStorage.getItem('device_id') || 'unknown');
    
    if (!rateLimiter.isAllowed(clientId, 5, 60000)) { // 5 attempts per minute
      throw new Error('Muitas tentativas de logout. Tente novamente em 1 minuto.');
    }

    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } finally {
      // Sempre limpar tokens do localStorage após logout
      clearExpiredTokens();
    }
  };

  // Função para forçar limpeza de tokens (útil para casos de erro)
  const clearAuthTokens = () => {
    clearExpiredTokens();
    setIsAuthenticated(false);
    setUserRole(null);
  };

  const hasRole = (role: string): boolean => {
    return userRole === role;
  };

  const isAdmin = (): boolean => {
    return hasRole('admin');
  };

  const requireAuth = (): boolean => {
    if (!isAuthenticated) {
      throw new Error('Acesso negado. Faça login para continuar.');
    }
    return true;
  };

  const requireRole = (role: string): boolean => {
    requireAuth();
    if (!hasRole(role)) {
      throw new Error('Acesso negado. Permissões insuficientes.');
    }
    return true;
  };

  return {
    isAuthenticated,
    userRole,
    loading,
    signOut,
    hasRole,
    isAdmin,
    requireAuth,
    requireRole,
    clearAuthTokens
  };
};
