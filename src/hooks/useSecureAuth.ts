
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { rateLimiter } from '@/utils/securityUtils';

export type UserRoleType = 
  | 'diretoria'
  | 'gerente_secao' 
  | 'chefe_equipe'
  | 'lider_resgate'
  | 'motorista_condutor'
  | 'bombeiro_aerodromo';

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  role: string;
  role_type: UserRoleType;
  contexto_id: string | null;
  nivel_hierarquico: number;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export const useSecureAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRoleType | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      if (session) {
        fetchUserProfile();
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (session) {
        fetchUserProfile();
      } else {
        setUserRole(null);
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .single();

      if (error) throw error;
      
      setUserProfile(data);
      setUserRole(data?.role_type || 'bombeiro_aerodromo');
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserRole('bombeiro_aerodromo');
      setUserProfile(null);
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

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const hasRole = (role: UserRoleType): boolean => {
    return userRole === role;
  };

  const hasMinimumRole = (minimumRole: UserRoleType): boolean => {
    if (!userProfile) return false;
    
    const roleHierarchy: Record<UserRoleType, number> = {
      'diretoria': 1,
      'gerente_secao': 2,
      'chefe_equipe': 3,
      'lider_resgate': 4,
      'motorista_condutor': 5,
      'bombeiro_aerodromo': 6
    };

    const userLevel = roleHierarchy[userRole as UserRoleType] || 6;
    const requiredLevel = roleHierarchy[minimumRole];
    
    return userLevel <= requiredLevel;
  };

  const isAdmin = (): boolean => {
    return hasRole('diretoria');
  };

  const isManager = (): boolean => {
    return hasMinimumRole('gerente_secao');
  };

  const isLeader = (): boolean => {
    return hasMinimumRole('chefe_equipe');
  };

  const requireAuth = (): boolean => {
    if (!isAuthenticated) {
      throw new Error('Acesso negado. Faça login para continuar.');
    }
    return true;
  };

  const requireRole = (role: UserRoleType): boolean => {
    requireAuth();
    if (!hasRole(role)) {
      throw new Error('Acesso negado. Permissões insuficientes.');
    }
    return true;
  };

  const requireMinimumRole = (minimumRole: UserRoleType): boolean => {
    requireAuth();
    if (!hasMinimumRole(minimumRole)) {
      throw new Error('Acesso negado. Nível hierárquico insuficiente.');
    }
    return true;
  };

  const getRoleName = (role?: UserRoleType): string => {
    const roleNames: Record<UserRoleType, string> = {
      'diretoria': 'Diretoria',
      'gerente_secao': 'Gerente de Seção',
      'chefe_equipe': 'Chefe de Equipe',
      'lider_resgate': 'Líder de Resgate',
      'motorista_condutor': 'Motorista Condutor',
      'bombeiro_aerodromo': 'Bombeiro de Aeródromo'
    };

    return roleNames[role || userRole || 'bombeiro_aerodromo'];
  };

  return {
    isAuthenticated,
    userRole,
    userProfile,
    loading,
    signOut,
    hasRole,
    hasMinimumRole,
    isAdmin,
    isManager,
    isLeader,
    requireAuth,
    requireRole,
    requireMinimumRole,
    getRoleName,
    refreshProfile: fetchUserProfile
  };
};
