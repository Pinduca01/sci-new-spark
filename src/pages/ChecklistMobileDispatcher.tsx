import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useUserRole } from '@/hooks/useUserRole';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ChecklistMobileDispatcher() {
  const navigate = useNavigate();
  const { loading, canDoChecklist } = useUserRole();

  useEffect(() => {
    const run = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/checklist-mobile/login');
        return;
      }

      if (!loading) {
        if (!canDoChecklist) {
          toast.error('Você não tem permissão para acessar checklists');
          navigate('/login');
          return;
        }

        // Ambos os perfis vão para a lista de viaturas
        navigate('/checklist-mobile/viaturas');
      }
    };

    run();
  }, [navigate, loading, canDoChecklist]);

  return (
    <div className="min-h-screen p-6 flex flex-col items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-sm text-muted-foreground">
        Direcionando você ao checklist correto...
      </p>
    </div>
  );
}