
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSecurityContext } from '@/components/SecurityProvider';
import { UserRoleType } from '@/hooks/useSecureAuth';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRoleType;
  minimumRole?: UserRoleType;
  allowedRoles?: UserRoleType[];
  fallbackPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  minimumRole,
  allowedRoles,
  fallbackPath = '/dashboard'
}) => {
  const { 
    isAuthenticated, 
    userRole, 
    loading, 
    hasRole, 
    hasMinimumRole 
  } = useSecurityContext();
  const location = useLocation();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen abstract-bg flex items-center justify-center">
        <Card className="glass-card">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Verificando permissões...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check specific role requirement
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="min-h-screen abstract-bg flex items-center justify-center p-6">
        <Card className="glass-card max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Acesso Negado</h2>
            <p className="text-muted-foreground mb-4">
              Esta página requer permissões específicas que você não possui.
            </p>
            <p className="text-sm text-muted-foreground">
              Seu nível: <span className="font-medium">{userRole}</span><br />
              Necessário: <span className="font-medium">{requiredRole}</span>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check minimum role requirement
  if (minimumRole && !hasMinimumRole(minimumRole)) {
    return (
      <div className="min-h-screen abstract-bg flex items-center justify-center p-6">
        <Card className="glass-card max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Nível Hierárquico Insuficiente</h2>
            <p className="text-muted-foreground mb-4">
              Esta funcionalidade requer um nível hierárquico superior.
            </p>
            <p className="text-sm text-muted-foreground">
              Seu nível: <span className="font-medium">{userRole}</span><br />
              Mínimo necessário: <span className="font-medium">{minimumRole}</span>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check allowed roles list
  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};
