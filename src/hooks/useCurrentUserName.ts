import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useCurrentUserName = () => {
  const [name, setName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchName = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setName(null);
        setLoading(false);
        return;
      }

      // Tenta buscar no perfil público (profiles)
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .single();

      if (!error && profile?.full_name) {
        setName(profile.full_name);
      } else {
        // Fallback: usa metadados do auth ou e-mail
        const meta = (user as any).user_metadata || {};
        const metaName = meta.full_name || meta.name;
        setName(metaName || user.email || null);
      }
    } catch {
      setName(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchName();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchName();
    });
    return () => subscription.unsubscribe();
  }, []);

  return { name, loading };
};