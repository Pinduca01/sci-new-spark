import React, { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { isAuthError, isNetworkError } from '@/utils/connectivityUtils';

/**
 * Componente para interceptar e tratar erros REAIS de autenticação
 * NÃO trata erros de conectividade como problemas de sessão
 */
export const AuthErrorHandler = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const handlingRef = useRef(false);

  useEffect(() => {
    // Interceptar erros do Supabase
    const originalConsoleError = console.error;
    
    console.error = (...args) => {
      const errorObj = args[0];
      
      // Verificar se é erro de autenticação REAL (não de rede)
      if (isAuthError(errorObj)) {
        console.warn('[AuthErrorHandler] Erro de autenticação detectado:', errorObj);
        handleAuthError();
      } else if (isNetworkError(errorObj)) {
        console.warn('[AuthErrorHandler] Erro de rede detectado (não causa logout):', errorObj);
        // NÃO fazer logout em erros de rede
      }
      
      // Chamar o console.error original
      originalConsoleError.apply(console, args);
    };

    // Interceptar erros não capturados
    const handleUnhandledError = (event: ErrorEvent) => {
      if (isAuthError(event.error)) {
        console.warn('[AuthErrorHandler] Erro de autenticação não capturado:', event.error);
        handleAuthError();
      }
    };

    // Interceptar promises rejeitadas
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (isAuthError(event.reason)) {
        console.warn('[AuthErrorHandler] Promise rejeitada por erro de autenticação:', event.reason);
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
    if (handlingRef.current) {
      console.log('[AuthErrorHandler] Já está tratando erro, ignorando...');
      return;
    }
    
    handlingRef.current = true;
    
    try {
      console.log('[AuthErrorHandler] Iniciando limpeza de sessão expirada...');
      
      // Verificar role do usuário para saber pra onde redirecionar
      const { data: { session } } = await supabase.auth.getSession();
      let redirectPath = '/login';
      
      if (session?.user) {
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();
        
        // Se for BA-MC ou BA-2, redirecionar para login mobile
        if (roleData?.role === 'ba_mc' || roleData?.role === 'ba_2') {
          redirectPath = '/checklist-mobile/login';
        }
      }
      
      // Limpar APENAS tokens do Supabase (preservar sci_offline_auth)
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes('supabase') && !key.includes('sci_offline_auth')) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => {
        console.log('[AuthErrorHandler] Removendo chave:', key);
        localStorage.removeItem(key);
      });
      
      // Forçar logout no Supabase
      await supabase.auth.signOut();
      
      console.log('[AuthErrorHandler] Redirecionando para:', redirectPath);
      
      // Mostrar notificação ao usuário
      toast({
        title: "Sessão Expirada",
        description: "Sua sessão expirou. Por favor, faça login novamente.",
        variant: "destructive",
      });
      
      // Redirecionar para login após um pequeno delay
      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 2000);
      
    } catch (error) {
      console.error('[AuthErrorHandler] Erro ao limpar sessão:', error);
      // Mesmo com erro, redirecionar para login
      navigate('/login', { replace: true });
    } finally {
      // Reset flag após 5 segundos para evitar lock permanente
      setTimeout(() => {
        handlingRef.current = false;
      }, 5000);
    }
  };

  // Este componente não renderiza nada
  return null;
};

export default AuthErrorHandler;