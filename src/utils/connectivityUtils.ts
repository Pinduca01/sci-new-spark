/**
 * Utilitário para verificar conectividade e diferenciar erros de rede de erros de autenticação
 */

export const isNetworkError = (error: any): boolean => {
  if (!error) return false;

  const errorMessage = error.message || error.toString();
  
  // Erros típicos de conectividade
  const networkErrorPatterns = [
    'Failed to fetch',
    'NetworkError',
    'Network request failed',
    'net::ERR_',
    'ECONNREFUSED',
    'ETIMEDOUT',
    'TypeError: Failed to fetch'
  ];

  return networkErrorPatterns.some(pattern => 
    errorMessage.includes(pattern)
  );
};

export const isAuthError = (error: any): boolean => {
  if (!error) return false;

  const errorMessage = error.message || error.toString();
  
  // Erros específicos de autenticação/sessão
  const authErrorPatterns = [
    'Invalid Refresh Token',
    'Refresh Token Not Found',
    'refresh_token_not_found',
    'AuthApiError',
    'JWT expired',
    'invalid_grant'
  ];

  return authErrorPatterns.some(pattern => 
    errorMessage.includes(pattern)
  );
};

export const checkConnectivity = async (): Promise<boolean> => {
  // Verificação rápida do navigator
  if (!navigator.onLine) {
    return false;
  }

  // Tentar um HEAD request simples
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch('https://www.google.com/favicon.ico', {
      method: 'HEAD',
      mode: 'no-cors',
      signal: controller.signal
    });
    
    clearTimeout(timeout);
    return true;
  } catch {
    return false;
  }
};

export const getErrorType = (error: any): 'network' | 'auth' | 'unknown' => {
  if (isNetworkError(error)) return 'network';
  if (isAuthError(error)) return 'auth';
  return 'unknown';
};