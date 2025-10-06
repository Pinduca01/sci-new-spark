import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Truck, Download, WifiOff, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useOfflineAuth } from '@/hooks/useOfflineAuth';
import { OnlineStatusBadge } from '@/components/checklist-mobile/OnlineStatusBadge';
import AnimatedBackground from '@/components/AnimatedBackground';
import WaveHeader from '@/components/WaveHeader';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';

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

  const handlePasswordReset = async () => {
    if (!email) {
      toast.error('Informe seu e-mail para recuperar a senha');
      return;
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success('Enviamos um link de recuperação para seu e-mail');
    } catch (err: any) {
      toast.error(err?.message || 'Não foi possível enviar o link');
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
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute top-3 right-3 z-20">
        <OnlineStatusBadge />
      </div>

      {/* Hero com onda */}
      <div className="relative z-10">
        <WaveHeader title="Welcome" subtitle="Faça login para continuar" />
      </div>

      {/* Conteúdo sobreposto ao hero */}
      <div className="relative z-20 -mt-10 flex items-start justify-center px-4">
        <div className="w-full max-w-sm space-y-4">
          {showInstallButton && (
            <Alert className="border-primary/20 bg-primary/5">
              <div className="flex items-start gap-3">
                <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                  <Download className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Instalar App</p>
                  <AlertDescription>
                    Instale para acesso rápido e funcionamento offline.
                  </AlertDescription>
                  <Button onClick={handleInstallClick} className="mt-3 w-full h-10">
                    <Download className="w-4 h-4 mr-2" />
                    Instalar agora
                  </Button>
                </div>
              </div>
            </Alert>
          )}

          {!isOnline && (
            <Alert className="border-orange-500/30 bg-orange-50 dark:bg-orange-950">
              <div className="flex items-start gap-3">
                <WifiOff className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
                <div>
                  <p className="font-medium">Modo offline</p>
                  <AlertDescription className="text-sm">
                    {offlineAuthAvailable
                      ? 'Você pode fazer login com credenciais salvas.'
                      : 'Faça login online primeiro para habilitar o modo offline.'}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          )}

          <Card className="backdrop-blur-sm bg-white/90 dark:bg-neutral-900/80 border border-border/60 shadow-sm rounded-2xl">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                  <Truck className="w-6 h-6 text-primary" />
                </div>
              </div>
              <CardTitle className="text-xl tracking-tight">Checklist Mobile</CardTitle>
              <CardDescription className="text-sm">Acesso exclusivo para BA-MC e BA-2</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm">E-mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu.email@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      className="pl-10 h-11 rounded-none border-0 border-b border-muted bg-transparent focus-visible:ring-0 focus-visible:border-primary"
                      autoComplete="username"
                      inputMode="email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      className="pl-10 h-11 rounded-none border-0 border-b border-muted bg-transparent focus-visible:ring-0 focus-visible:border-primary"
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full h-11" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    'Entrar'
                  )}
                </Button>
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Checkbox id="remember" />
                    Lembrar-me
                  </label>
                  <button
                    type="button"
                    onClick={handlePasswordReset}
                    className="text-sm text-primary hover:underline"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <p className="text-center text-xs text-muted-foreground">
                  Não tem conta? Fale com o administrador.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChecklistMobileLogin;
