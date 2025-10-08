import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Truck, Download, WifiOff } from 'lucide-react';
import { EnvelopeSimple, LockSimple, Eye, EyeSlash } from 'phosphor-react';
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
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [lastAttemptAt, setLastAttemptAt] = useState<number>(0);
  const [attemptCooldownMs, setAttemptCooldownMs] = useState<number>(2000);
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIosHint, setShowIosHint] = useState(false);
  const [greeting, setGreeting] = useState('Bom dia');
  const [showPassword, setShowPassword] = useState(false);
  
  const { saveOfflineAuth, loginOffline, offlineAuthAvailable } = useOfflineAuth();

  useEffect(() => {
    // Verificar se já está logado
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Verificar se o usuário está cadastrado e ativo
        const { data: bombeiro } = await supabase
          .from('bombeiros')
          .select('id, nome, ativo')
          .eq('user_id', session.user.id)
          .single();

        if (bombeiro && bombeiro.ativo) {
          navigate('/checklist-mobile/viaturas');
        } else {
          // Não está cadastrado ou inativo, fazer logout
          await supabase.auth.signOut();
        }
      }
      
      setChecking(false);
    };

    checkSession();

    const standalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    const ua = window.navigator.userAgent.toLowerCase();
    const isiOS = /iphone|ipad|ipod/.test(ua);
    setIsIOS(isiOS);

    const dismissed = localStorage.getItem('pwaInstallDismissed') === '1';
    if (!standalone && !dismissed && isiOS) {
      setShowIosHint(true);
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      if (standalone || dismissed || isiOS) return;
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    const handleAppInstalled = () => {
      localStorage.removeItem('pwaInstallDismissed');
      setShowInstallButton(false);
      setShowIosHint(false);
      setDeferredPrompt(null);
      toast.success('App instalado com sucesso!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Online/Offline listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [navigate]);

  // Cumprimento dinâmico conforme horário
  useEffect(() => {
    const computeGreeting = () => {
      const h = new Date().getHours();
      if (h >= 5 && h < 12) return 'Bom dia';
      if (h >= 12 && h < 18) return 'Boa tarde';
      return 'Boa noite';
    };
    setGreeting(computeGreeting());
    const id = setInterval(() => setGreeting(computeGreeting()), 60000);
    return () => clearInterval(id);
  }, []);

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

  const handleDismissInstall = () => {
    localStorage.setItem('pwaInstallDismissed', '1');
    setShowInstallButton(false);
    setShowIosHint(false);
    setDeferredPrompt(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const now = Date.now();
    if (now - lastAttemptAt < attemptCooldownMs) {
      const waitMs = attemptCooldownMs - (now - lastAttemptAt);
      const waitSeconds = Math.ceil(waitMs / 1000);
      toast.error(`Aguarde ${waitSeconds}s antes de tentar novamente`);
      return;
    }
    setLastAttemptAt(now);

    const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    const emailValid = !!email && isValidEmail(email);
    const passwordValid = !!password && password.length >= 6;
    setEmailError(emailValid ? '' : 'Informe um e-mail válido');
    setPasswordError(passwordValid ? '' : 'A senha deve ter ao menos 6 caracteres');
    if (!emailValid || !passwordValid) {
      toast.error('Verifique os campos de e-mail e senha');
      return;
    }

    setLoading(true);

    try {
      // Tentar login offline primeiro se não houver conexão
      if (!isOnline && offlineAuthAvailable) {
        const offlineData = await loginOffline(email, password);
        toast.success('Login offline realizado com sucesso!');
        navigate('/checklist-mobile/viaturas');
        return;
      }

      // Login online
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Verificar se o usuário está cadastrado e ativo
      const { data: bombeiroData } = await supabase
        .from('bombeiros')
        .select('*')
        .eq('user_id', authData.user.id)
        .single();

      if (!bombeiroData || !bombeiroData.ativo) {
        await supabase.auth.signOut();
        toast.error('Usuário não cadastrado ou inativo. Entre em contato com o administrador.');
        return;
      }

      // Salvar credenciais para login offline se "Lembrar-me" estiver marcado
      if (rememberMe) {
        await saveOfflineAuth(email, password, {
          user: authData.user,
          role: authData.user.role,
          funcao: bombeiroData?.funcao,
          bombeiro: bombeiroData
        });
      }

      toast.success('Login realizado com sucesso!');
      // Resetar contadores/cooldown após sucesso
      setFailedAttempts(0);
      setAttemptCooldownMs(2000);
      navigate('/checklist-mobile/viaturas');
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
      // Ajustar cooldown por tentativas falhas (backoff simples)
      setFailedAttempts((prev) => {
        const next = prev + 1;
        // Após 3 falhas, aumentar cooldown para 5s, limite 10s
        if (next >= 3) {
          setAttemptCooldownMs((ms) => Math.min(ms * 2, 10000));
        }
        return next;
      });
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
        <WaveHeader title={`${greeting}!`} subtitle="Faça login para continuar" />
      </div>

      {(showInstallButton || showIosHint) && (
        <div className="relative z-10 px-4 mt-2">
          <div className="w-full max-w-sm mx-auto">
            <Alert className="border-primary/20 bg-primary/5">
              <div className="flex items-start gap-3">
                <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                  <Download className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  {showIosHint ? (
                    <>
                      <p className="font-medium">Instalar no iOS</p>
                      <AlertDescription>
                        No Safari, toque em "Compartilhar" e depois "Adicionar à Tela de Início".
                      </AlertDescription>
                      <Button variant="outline" size="sm" className="mt-3 w-full h-10" onClick={handleDismissInstall}>
                        Não mostrar novamente
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="font-medium">Instalar App</p>
                      <AlertDescription>
                        Instale para acesso rápido e funcionamento offline.
                      </AlertDescription>
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <Button onClick={handleInstallClick} className="h-10">
                          <Download className="w-4 h-4 mr-2" />
                          Instalar agora
                        </Button>
                        <Button variant="outline" onClick={handleDismissInstall} className="h-10">
                          Não mostrar novamente
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Alert>
          </div>
        </div>
      )}

      {/* Conteúdo sobreposto ao hero */}
      <div className="relative z-20 -mt-10 flex items-start justify-center px-4">
        <div className="w-full max-w-sm space-y-4">
          

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

          <Card className="bg-white dark:bg-neutral-900 border border-border/60 shadow-sm rounded-2xl">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                  <Truck className="w-6 h-6 text-primary" />
                </div>
              </div>
              <CardTitle className="text-xl tracking-tight">Checklist Mobile</CardTitle>
              <CardDescription className="text-sm">Sistema de verificação de viaturas e equipamentos</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm">E-mail</Label>
                  <div className="relative">
                    <EnvelopeSimple
                      size={22}
                      weight="regular"
                      className="absolute left-3 inset-y-0 my-auto text-muted-foreground pointer-events-none [shape-rendering:geometricPrecision]"
                      aria-hidden
                    />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu.email@exemplo.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError('');
                      }}
                      onBlur={() => {
                        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
                        setEmailError(isValid ? '' : 'Informe um e-mail válido');
                      }}
                      disabled={loading}
                      className="pl-10 h-11 rounded-none border-0 border-b border-muted bg-transparent focus-visible:ring-0 focus-visible:border-primary"
                      autoComplete="username"
                      inputMode="email"
                      aria-invalid={!!emailError}
                      aria-describedby={emailError ? 'email-error' : undefined}
                    />
                    {emailError && (
                      <p id="email-error" className="mt-1 text-xs text-destructive">{emailError}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm">Senha</Label>
                  <div className="relative">
                    <LockSimple
                      size={22}
                      weight="regular"
                      className="absolute left-3 inset-y-0 my-auto text-muted-foreground pointer-events-none [shape-rendering:geometricPrecision]"
                      aria-hidden
                    />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (passwordError) setPasswordError('');
                      }}
                      onBlur={() => {
                        setPasswordError(password.length >= 6 ? '' : 'A senha deve ter ao menos 6 caracteres');
                      }}
                      disabled={loading}
                      className="pl-10 pr-10 h-11 rounded-none border-0 border-b border-muted bg-transparent focus-visible:ring-0 focus-visible:border-primary"
                      autoComplete="current-password"
                      aria-invalid={!!passwordError}
                      aria-describedby={passwordError ? 'password-error' : undefined}
                    />
                    {passwordError && (
                      <p id="password-error" className="mt-1 text-xs text-destructive">{passwordError}</p>
                    )}
                    <button
                      type="button"
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      onClick={() => setShowPassword((s) => !s)}
                      className="absolute right-3 inset-y-0 my-auto text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeSlash size={24} weight="regular" className="[shape-rendering:geometricPrecision]" />
                      ) : (
                        <Eye size={24} weight="regular" className="[shape-rendering:geometricPrecision]" />
                      )}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full h-11" disabled={loading || !!emailError || !!passwordError}>
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
                  <label htmlFor="remember" className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Checkbox id="remember" checked={rememberMe} onCheckedChange={(v) => setRememberMe(!!v)} />
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
