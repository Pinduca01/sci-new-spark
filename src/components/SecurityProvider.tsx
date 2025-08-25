
import React, { createContext, useContext, useEffect } from 'react';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { securityHeaders } from '@/utils/securityUtils';

interface SecurityContextType {
  isAuthenticated: boolean;
  userRole: string | null;
  loading: boolean;
  isAdmin: () => boolean;
  hasRole: (role: string) => boolean;
  requireAuth: () => boolean;
  requireRole: (role: string) => boolean;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const useSecurityContext = () => {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurityContext must be used within a SecurityProvider');
  }
  return context;
};

interface SecurityProviderProps {
  children: React.ReactNode;
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({ children }) => {
  const auth = useSecureAuth();

  useEffect(() => {
    // Set security headers (client-side awareness)
    const setSecurityHeaders = () => {
      // Add CSP meta tag if not present
      if (!document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
        const cspMeta = document.createElement('meta');
        cspMeta.setAttribute('http-equiv', 'Content-Security-Policy');
        cspMeta.setAttribute('content', securityHeaders['Content-Security-Policy']);
        document.head.appendChild(cspMeta);
      }

      // Add other security meta tags
      if (!document.querySelector('meta[name="referrer"]')) {
        const referrerMeta = document.createElement('meta');
        referrerMeta.setAttribute('name', 'referrer');
        referrerMeta.setAttribute('content', 'strict-origin-when-cross-origin');
        document.head.appendChild(referrerMeta);
      }
    };

    setSecurityHeaders();

    // Generate and store device ID for rate limiting
    if (!localStorage.getItem('device_id')) {
      const deviceId = crypto.randomUUID();
      localStorage.setItem('device_id', deviceId);
    }

    // Security event listeners
    const handleContextMenu = (e: Event) => {
      // Allow context menu in development
      if (process.env.NODE_ENV === 'production') {
        e.preventDefault();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable F12, Ctrl+Shift+I, Ctrl+U in production
      if (process.env.NODE_ENV === 'production') {
        if (
          e.key === 'F12' ||
          (e.ctrlKey && e.shiftKey && e.key === 'I') ||
          (e.ctrlKey && e.key === 'u')
        ) {
          e.preventDefault();
        }
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const value: SecurityContextType = {
    isAuthenticated: auth.isAuthenticated,
    userRole: auth.userRole,
    loading: auth.loading,
    isAdmin: auth.isAdmin,
    hasRole: auth.hasRole,
    requireAuth: auth.requireAuth,
    requireRole: auth.requireRole
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};
