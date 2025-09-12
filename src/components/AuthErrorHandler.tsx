import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

/**
 * Componente para interceptar e tratar erros de autenticação
 * Especialmente útil para lidar com tokens expirados
 */
export const AuthErrorHandler = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Interceptar erros do Supabase
    const originalConsoleError = console.error;
    
    console.error = (...args) => {
      const errorMessage = args.join(' ');
      
      // Detectar erros relacionados a refresh token
      if (
        errorMessage.includes('Invalid Refresh Token') ||
        errorMessage.includes('Refresh Token Not Found') ||
        errorMessage.includes('AuthApiError') ||
        errorMessage.includes('refresh_token_not_found')
      ) {
        handleAuthError();
      }
      
      // Detectar erros de rede que podem indicar problemas de conectividade
      if (
        errorMessage.includes('Failed to fetch') ||
        errorMessage.includes('net::ERR_ABORTED') ||
        errorMessage.includes('TypeError: Failed to fetch')
      ) {
        console.warn('Erro de conectividade detectado:', errorMessage);
        // Não forçar logout para erros de rede, apenas logar
      }
      
      // Chamar o console.error original
      originalConsoleError.apply(console, args);
    };

    // Interceptar erros não capturados
    const handleUnhandledError = (event: ErrorEvent) => {
      if (
        event.error?.message?.includes('Invalid Refresh Token') ||
        event.error?.message?.includes('Refresh Token Not Found') ||
        event.error?.message?.includes('AuthApiError')
      ) {
        handleAuthError();
      }
    };

    // Interceptar promises rejeitadas
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      if (
        reason?.message?.includes('Invalid Refresh Token') ||
        reason?.message?.includes('Refresh Token Not Found') ||
        reason?.message?.includes('AuthApiError')
      ) {
        handleAuthError();
      }
    };

    window.addEventListener('error', handleUnhandledError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      // Restaurar console.error original
      console.error = originalConsoleError;
      window.removeEventListener('error', handleUnhandledError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  const handleAuthError = async () => {
    try {
      // Limpar tokens do localStorage
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('supabase') || key.includes('auth'))) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Forçar logout no Supabase
      await supabase.auth.signOut();
      
      // Mostrar notificação ao usuário
      toast({
        title: "Sessão Expirada",
        description: "Sua sessão expirou. Por favor, faça login novamente.",
        variant: "destructive",
      });
      
      // Redirecionar para login após um pequeno delay
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
      
    } catch (error) {
      console.error('Erro ao limpar sessão expirada:', error);
      // Mesmo com erro, redirecionar para login
      navigate('/login', { replace: true });
    }
  };

  // Este componente não renderiza nada
  return null;
};

export default AuthErrorHandler;