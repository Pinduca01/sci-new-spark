import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface OfflineAuthData {
  user_id: string;
  email: string;
  role: string;
  funcao: string;
  bombeiro_data: any;
  token_expires_at: string;
  password_hash: string;
}

const OFFLINE_TOKEN_DAYS = 7;
const OFFLINE_AUTH_KEY = 'sci_offline_auth';

// Simple hash function for password verification
const hashPassword = async (password: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const useOfflineAuth = () => {
  const [offlineAuthAvailable, setOfflineAuthAvailable] = useState(false);

  useEffect(() => {
    checkOfflineAuthAvailability();
  }, []);

  const checkOfflineAuthAvailability = () => {
    const stored = localStorage.getItem(OFFLINE_AUTH_KEY);
    setOfflineAuthAvailable(!!stored);
  };

  const saveOfflineAuth = async (email: string, password: string, userData: any) => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + OFFLINE_TOKEN_DAYS);

    const passwordHash = await hashPassword(password);

    const offlineData: OfflineAuthData = {
      user_id: userData.user.id,
      email: email,
      role: userData.role,
      funcao: userData.funcao,
      bombeiro_data: userData.bombeiro,
      token_expires_at: expiresAt.toISOString(),
      password_hash: passwordHash,
    };

    localStorage.setItem(OFFLINE_AUTH_KEY, JSON.stringify(offlineData));
    setOfflineAuthAvailable(true);
  };

  const loginOffline = async (email: string, password: string): Promise<any> => {
    const stored = localStorage.getItem(OFFLINE_AUTH_KEY);
    
    if (!stored) {
      throw new Error('Nenhuma credencial offline salva. Faça login online primeiro.');
    }

    const data: OfflineAuthData = JSON.parse(stored);

    // Verificar email
    if (data.email !== email) {
      throw new Error('Email incorreto');
    }

    // Verificar senha
    const passwordHash = await hashPassword(password);
    if (data.password_hash !== passwordHash) {
      throw new Error('Senha incorreta');
    }

    // Verificar expiração
    if (new Date(data.token_expires_at) < new Date()) {
      throw new Error('Sessão offline expirada. Conecte à internet para fazer login.');
    }

    // Retornar dados do usuário
    return {
      user: {
        id: data.user_id,
        email: data.email,
      },
      role: data.role,
      funcao: data.funcao,
      bombeiro: data.bombeiro_data,
    };
  };

  const clearOfflineAuth = () => {
    localStorage.removeItem(OFFLINE_AUTH_KEY);
    setOfflineAuthAvailable(false);
  };

  const validateOfflineToken = (): boolean => {
    const stored = localStorage.getItem(OFFLINE_AUTH_KEY);
    if (!stored) return false;

    try {
      const data: OfflineAuthData = JSON.parse(stored);
      return new Date(data.token_expires_at) > new Date();
    } catch {
      return false;
    }
  };

  return {
    offlineAuthAvailable,
    saveOfflineAuth,
    loginOffline,
    clearOfflineAuth,
    validateOfflineToken,
  };
};
