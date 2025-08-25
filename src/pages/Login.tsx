
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Lock, Mail, Shield } from "lucide-react";
import { User, Session } from '@supabase/supabase-js';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { toast } = useToast();
  const navigate = useNavigate();

  // Mouse tracking for interactive background
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    // Check if the user is already logged in
    const checkAuth = async () => {
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
      setIsCheckingAuth(false);
    };

    checkAuth();
  }, [navigate, toast]);

  const handleLogin = async (type: 'email' | 'google') => {
    setIsLoading(true);
    try {
      if (type === 'email') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          toast({
            title: "Erro ao fazer login",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Login realizado com sucesso",
            description: "Redirecionando...",
          });
          navigate('/dashboard');
        }
      } else if (type === 'google') {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/dashboard`,
          },
        });

        if (error) {
          toast({
            title: "Erro ao fazer login com o Google",
            description: error.message,
            variant: "destructive",
          });
        }
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
      <div className="min-h-screen login-3d-bg flex items-center justify-center">
        <Card className="glass-card-3d animate-scale-in">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="loading-spinner-3d mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Verificando autenticação...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen login-3d-bg overflow-hidden">
      {/* Interactive Background Elements */}
      <div className="floating-particles">
        {[...Array(12)].map((_, i) => (
          <div key={i} className={`particle particle-${i + 1}`}></div>
        ))}
      </div>
      
      {/* Geometric Shapes */}
      <div className="geometric-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
      </div>

      {/* Dynamic Gradient Overlay */}
      <div 
        className="dynamic-gradient"
        style={{
          transform: `translate(${mousePosition.x * 0.1}px, ${mousePosition.y * 0.1}px)`,
        }}
      ></div>

      {/* Main Content */}
      <div className="login-container">
        {/* Login Card with 3D Effects */}
        <Card className="login-card-3d animate-card-entrance">
          <CardHeader className="text-center space-y-6 pb-8">
            {/* Logo moderno consistente com sidebar */}
            <div className="logo-container-3d">
              <div className="flex items-center justify-center space-x-4">
                {/* Ícone 3D */}
                <div className="logo-icon-3d">
                  <div className="icon-base">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <div className="icon-accent">
                    <div className="accent-dot"></div>
                  </div>
                </div>
                
                {/* Texto com gradiente */}
                <div className="logo-text-3d">
                  <h1 className="text-4xl font-black bg-gradient-to-r from-primary via-orange-500 to-blue-600 bg-clip-text text-transparent">
                    SCI-Core
                  </h1>
                  <p className="text-sm text-muted-foreground font-medium -mt-1">
                    Sistema Integrado
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <CardDescription className="text-base text-muted-foreground">
                Sistema de Gestão para Seção Contraincêndio
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 px-8 pb-8">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <div className="input-container-3d">
                <Mail className="input-icon" />
                <Input 
                  id="email" 
                  placeholder="seuemail@dominio.com" 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-3d"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
              <div className="input-container-3d">
                <Lock className="input-icon" />
                <Input
                  id="password"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-3d"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle-3d"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button 
              className="button-3d w-full"
              onClick={() => handleLogin('email')}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner-3d-small mr-2"></div>
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>

            <div className="divider-3d">
              <span>Ou entre com</span>
            </div>

            <Button
              variant="outline"
              className="button-3d-outline w-full"
              onClick={() => handleLogin('google')}
              disabled={isLoading}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2"
              >
                <path d="M20.283 10.356h-8.327v3.451h4.792c-.446 2.193-2.313 3.453-4.792 3.453a5.27 5.27 0 0 1-5.279-5.279 5.27 5.27 0 0 1 5.279-5.279c1.259 0 2.394.447 3.29 1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233a8.908 8.908 0 0 0-8.908 8.908 8.908 8.908 0 0 0 8.908 8.908c5.458 0 8.992-3.586 8.992-8.908 0-.545-.049-1.09-.139-1.621z" />
              </svg>
              Entrar com Google
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
