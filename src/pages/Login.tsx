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

  const handleLogin = async () => {
    setIsLoading(true);
    try {
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
              onClick={handleLogin}
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
