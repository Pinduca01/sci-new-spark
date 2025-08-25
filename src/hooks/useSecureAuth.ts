
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { rateLimiter } from '@/utils/securityUtils';

export const useSecureAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      if (session) {
        fetchUserRole();
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
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .single();

      if (error) throw error;
      
      setUserRole(data?.role || 'user');
    } catch (error) {
      console.error('Error fetching user role:', error);
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

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
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
    requireRole
  };
};
