import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'admin' | 'gs_base' | 'ba_ce' | 'ba_lr' | 'ba_mc' | 'ba_2';

interface UserRoleData {
  role: AppRole | null;
  baseId: string | null;
  baseName: string | null;
  loading: boolean;
  isAdmin: boolean;
  isGS: boolean;
  isBACE: boolean;
  isBALR: boolean;
  isBAMC: boolean;
  isBA2: boolean;
  canManageUsers: boolean;
  canAccessSCI: boolean;
  canDoChecklist: boolean;
}

export const useUserRole = (): UserRoleData => {
  const [role, setRole] = useState<AppRole | null>(null);
  const [baseId, setBaseId] = useState<string | null>(null);
  const [baseName, setBaseName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setLoading(false);
          return;
        }

        // Buscar role do usuário
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (roleError) {
          console.error('Erro ao buscar role:', roleError);
        }

        // Buscar base_id e nome da base
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select(`
            base_id,
            bases (
              nome
            )
          `)
          .eq('user_id', user.id)
          .single();

        if (profileError) {
          console.error('Erro ao buscar profile:', profileError);
        }

        setRole(roleData?.role || null);
        setBaseId(profileData?.base_id || null);
        setBaseName((profileData?.bases as any)?.nome || null);
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchUserData();
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    role,
    baseId,
    baseName,
    loading,
    isAdmin: role === 'admin',
    isGS: role === 'gs_base',
    isBACE: role === 'ba_ce',
    isBALR: role === 'ba_lr',
    isBAMC: role === 'ba_mc',
    isBA2: role === 'ba_2',
    canManageUsers: role === 'admin' || role === 'gs_base',
    canAccessSCI: role === 'admin' || role === 'gs_base' || role === 'ba_ce' || role === 'ba_lr',
    canDoChecklist: role === 'ba_mc' || role === 'ba_2'
  };
};
