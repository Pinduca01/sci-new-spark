import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Truck, Download, WifiOff } from 'lucide-react';
import { toast } from 'sonner';
import { useOfflineAuth } from '@/hooks/useOfflineAuth';
import { OnlineStatusBadge } from '@/components/checklist-mobile/OnlineStatusBadge';

const ChecklistMobileLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const { saveOfflineAuth, loginOffline, offlineAuthAvailable } = useOfflineAuth();

  useEffect(() => {
    // Verificar se já está logado
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Verificar se é BA-MC ou BA-2
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();

        if (roleData?.role === 'ba_mc' || roleData?.role === 'ba_2') {
          navigate('/checklist-mobile');
        } else {
          // Não é BA-MC/BA-2, fazer logout
          await supabase.auth.signOut();
        }
      }
      
      setChecking(false);
    };

    checkSession();

    // PWA Install Prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Online/Offline listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [navigate]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      toast.success('App instalado com sucesso!');
    }
    
    setDeferredPrompt(null);
    setShowInstallButton(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Preencha todos os campos');
      return;
    }

    setLoading(true);

    try {
      // Tentar login offline primeiro se não houver conexão
      if (!isOnline && offlineAuthAvailable) {
        const offlineData = await loginOffline(email, password);
        toast.success('Login offline realizado com sucesso!');
        navigate('/checklist-mobile');
        return;
      }

      // Login online
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Verificar role do usuário
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', authData.user.id)
        .single();

      if (roleError) throw roleError;

      // Verificar se é BA-MC ou BA-2
      if (roleData.role !== 'ba_mc' && roleData.role !== 'ba_2') {
        await supabase.auth.signOut();
        toast.error('Acesso negado. Esta área é exclusiva para BA-MC e BA-2.');
        return;
      }

      // Verificar se está ativo
      const { data: profileData } = await supabase
        .from('profiles')
        .select('ativo')
        .eq('user_id', authData.user.id)
        .single();

      if (!profileData?.ativo) {
        await supabase.auth.signOut();
        toast.error('Usuário inativo. Entre em contato com o administrador.');
        return;
      }

      // Buscar dados do bombeiro
      const { data: bombeiroData } = await supabase
        .from('bombeiros')
        .select('*')
        .eq('user_id', authData.user.id)
        .single();

      // Salvar credenciais para login offline
      await saveOfflineAuth(email, password, {
        user: authData.user,
        role: roleData.role,
        funcao: bombeiroData?.funcao,
        bombeiro: bombeiroData
      });

      toast.success('Login realizado com sucesso!');
      navigate('/checklist-mobile');
    } catch (error: any) {
      console.error('Erro ao fazer login:', error);
      
      // Mensagens específicas baseadas no tipo de erro
      const errorMessage = error.message || '';
      
      if (errorMessage.includes('Invalid login credentials')) {
        toast.error('Email ou senha incorretos');
      } else if (errorMessage.includes('Email not confirmed')) {
        toast.error('Email não confirmado. Verifique sua caixa de entrada.');
      } else if (!navigator.onLine) {
        toast.error('Sem conexão com internet. Tente login offline se disponível.');
      } else {
        toast.error(errorMessage || 'Erro ao fazer login');
      }
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <OnlineStatusBadge />
      
      <div className="w-full max-w-md space-y-4">
        {/* Botão Instalar App */}
        {showInstallButton && (
          <Card className="border-2 border-primary bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                  <Download className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">Instalar App</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Instale para acesso rápido e funcionamento offline
                  </p>
                  <Button
                    onClick={handleInstallClick}
                    className="w-full"
                    variant="default"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Instalar Agora
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Alerta Offline */}
        {!isOnline && (
          <Card className="border-2 border-orange-500 bg-orange-50 dark:bg-orange-950">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <WifiOff className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <div>
                  <p className="font-medium text-orange-900 dark:text-orange-100">Modo Offline</p>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    {offlineAuthAvailable 
                      ? 'Você pode fazer login com suas credenciais salvas' 
                      : 'Faça login online primeiro para usar offline'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Card de Login */}
        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Truck className="w-12 h-12 text-primary" />
            </div>
            <CardTitle className="text-2xl">Checklist Mobile</CardTitle>
            <CardDescription>
              Acesso exclusivo para BA-MC e BA-2
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu.email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChecklistMobileLogin;
