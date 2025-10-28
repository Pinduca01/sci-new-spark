import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Lock, Mail, Shield, Loader2 } from "lucide-react";
import { User, Session } from '@supabase/supabase-js';
import AnimatedBackground from "@/components/AnimatedBackground";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  // Email validation
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("Email é obrigatório");
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError("Formato de email inválido");
      return false;
    }
    setEmailError("");
    return true;
  };

  // Password validation
  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError("Senha é obrigatória");
      return false;
    }
    if (password.length < 6) {
      setPasswordError("Senha deve ter pelo menos 6 caracteres");
      return false;
    }
    setPasswordError("");
    return true;
  };

  // Real-time validation
  useEffect(() => {
    if (email) validateEmail(email);
  }, [email]);

  useEffect(() => {
    if (password) validatePassword(password);
  }, [password]);

  useEffect(() => {
    // Check if the user is already logged in
    const checkAuth = async () => {
      // Timeout de segurança de 10 segundos
      const timeoutId = setTimeout(() => {
        console.warn('Login: Timeout ao verificar autenticação');
        setIsCheckingAuth(false);
      }, 10000);

      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          toast({
            title: "Erro ao verificar a sessão",
            description: error.message,
            variant: "destructive",
          });
        }

        if (session?.user) {
          navigate('/dashboard');
        }
      } catch (error: any) {
        console.error('Erro ao verificar autenticação:', error);
      } finally {
        clearTimeout(timeoutId);
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [navigate, toast]);

  const handleLogin = async () => {
    // Validate before submitting
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    
    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setIsLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        toast({
          title: "Erro ao fazer login",
          description: authError.message,
          variant: "destructive",
        });
        return;
      }

      // Verificar role do usuário
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', authData.user.id)
        .single();

      if (roleError) {
        console.error('Erro ao buscar role:', roleError);
        toast({
          title: "Erro ao verificar permissões",
          description: "Entre em contato com o administrador.",
          variant: "destructive",
        });
        await supabase.auth.signOut();
        return;
      }

      // Verificar se o usuário está ativo
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('ativo')
        .eq('user_id', authData.user.id)
        .single();

      if (profileError) {
        console.error('Erro ao verificar status do usuário:', profileError);
      }

      // Se usuário está inativo, fazer logout e mostrar mensagem
      if (profileData && profileData.ativo === false) {
        await supabase.auth.signOut();
        toast({
          title: "Acesso negado",
          description: "Sua conta está inativa. Entre em contato com o administrador do sistema.",
          variant: "destructive",
        });
        return;
      }

      // Redirecionar baseado na role
      const role = roleData.role;
      
      if (role === 'ba_mc' || role === 'ba_2') {
        // BA-MC e BA-2 vão para o app mobile (domínio separado)
        toast({
          title: "Redirecionando para app mobile",
          description: "Você será direcionado para o aplicativo mobile...",
        });
        // TODO: Atualizar com URL real do mobile em produção
        window.location.href = 'https://mobile.seudominio.com/login';
        return;
      } else if (role === 'admin' || role === 'gs_base' || role === 'ba_ce' || role === 'ba_lr') {
        // Admin, GS, BA-CE e BA-LR vão para o dashboard
        toast({
          title: "Login realizado com sucesso",
          description: "Redirecionando...",
        });
        navigate('/dashboard');
      } else {
        await supabase.auth.signOut();
        toast({
          title: "Role não reconhecida",
          description: "Entre em contato com o administrador.",
          variant: "destructive",
        });
        return;
      }
    } catch (error: any) {
      toast({
        title: "Erro inesperado",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <AnimatedBackground />
        <Card className="w-full max-w-md mx-4 shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-500" />
              <p className="mt-4 text-slate-600">Verificando autenticação...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 relative overflow-hidden">
      <AnimatedBackground />
      
      {/* Main Content */}
      <div className="flex w-full max-w-6xl mx-auto px-4 items-center justify-between relative z-10">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex flex-col space-y-8 flex-1 pr-16">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-slate-800">
                  SCI-Core <span className="text-orange-500 font-black">Controle</span>
                </h1>
              </div>
            </div>
            <p className="text-lg text-slate-600 leading-relaxed max-w-md">
              Sistema integrado de gestão para Seção Contraincêndio com controle completo de operações e recursos.
            </p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              {/* Mobile Logo */}
              <div className="lg:hidden flex items-center justify-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-slate-800">
                  SCI-Core <span className="text-orange-500">Controle</span>
                </h1>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-800">Bem-vindo(a) de volta</h2>
                <CardDescription className="text-slate-600">
                  Por favor, insira seus dados para continuar.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 px-6 pb-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email</Label>
                <div className="relative group">
                  <Mail className="input-icon absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500 transition-colors duration-200 group-focus-within:text-orange-500 z-20" />
                  <Input 
                    id="email" 
                    placeholder="Digite seu email" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`pl-10 h-12 bg-white hover:bg-white focus:bg-white border-slate-200 focus:border-orange-500 focus:ring-orange-500 relative z-10 ${
                      emailError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                    aria-describedby={emailError ? 'email-error' : undefined}
                  />
                </div>
                {emailError && (
                  <p id="email-error" className="text-sm text-red-600" role="alert">
                    {emailError}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700">Senha</Label>
                <div className="relative group">
                  <Lock className="input-icon absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-500 transition-colors duration-200 group-focus-within:text-orange-500 z-20" />
                  <Input
                    id="password"
                    placeholder="Digite sua senha"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`pl-10 pr-12 h-12 bg-white hover:bg-white focus:bg-white border-slate-200 focus:border-orange-500 focus:ring-orange-500 relative z-10 ${
                      passwordError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                    }`}
                    aria-describedby={passwordError ? 'password-error' : undefined}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle-enhanced absolute right-1 top-1/2 transform -translate-y-1/2 h-10 w-10 text-slate-500 hover:text-orange-500 transition-all duration-200 hover:bg-orange-50 rounded-lg z-30"
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5 stroke-2" /> : <Eye className="h-5 w-5 stroke-2" />}
                  </Button>
                </div>
                {passwordError && (
                  <p id="password-error" className="text-sm text-red-600" role="alert">
                    {passwordError}
                  </p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 text-orange-500 border-slate-300 rounded focus:ring-orange-500" />
                  <span className="text-sm text-slate-600">Lembrar-me</span>
                </label>
                <button 
                  type="button"
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors"
                  onClick={() => {
                    toast({
                      title: "Funcionalidade em desenvolvimento",
                      description: "A recuperação de senha estará disponível em breve.",
                    });
                  }}
                >
                  Esqueci minha senha
                </button>
              </div>

              {/* Login Button */}
              <Button 
                className={`w-full h-12 text-white font-medium transition-all duration-200 ${
                  isLoading 
                    ? 'bg-slate-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 hover:shadow-lg transform hover:-translate-y-0.5'
                }`}
                onClick={handleLogin}
                disabled={isLoading || !!emailError || !!passwordError || !email || !password}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
