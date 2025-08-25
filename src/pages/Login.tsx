import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { User, Session } from '@supabase/supabase-js';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

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
      <div className="min-h-screen abstract-bg flex items-center justify-center">
        <Card className="glass-card">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Verificando autenticação...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen abstract-bg flex flex-col items-center justify-center p-4">
      {/* Login Card */}
      <Card className="glass-card w-full max-w-md relative z-10 border-0">
        <CardHeader className="text-center space-y-6">
          {/* Logo SCI-Core - apenas o ícone */}
          <div className="mx-auto w-20 h-20 rounded-2xl flex items-center justify-center">
            <img 
              src="/lovable-uploads/a158ba50-7bfe-4ce6-bc26-0db3511ee40f.png" 
              alt="SCI-Core"
              className="w-20 h-20 object-contain"
            />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              SCI-Core
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground mt-2">
              Sistema de Gestão para Seção Contraincêndio
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                id="email" 
                placeholder="seuemail@dominio.com" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                id="password"
                placeholder="********"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
                <span className="sr-only">Mostrar senha</span>
              </Button>
            </div>
          </div>
          <Button 
            className="w-full" 
            onClick={() => handleLogin('email')}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            Ou entre com
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleLogin('google')}
            disabled={isLoading}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 h-4 w-4"
            >
              <path d="M20.283 10.356h-8.327v3.451h4.792c-.446 2.193-2.313 3.453-4.792 3.453a5.27 5.27 0 0 1-5.279-5.279 5.27 5.27 0 0 1 5.279-5.279c1.259 0 2.394.447 3.29 1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233a8.908 8.908 0 0 0-8.908 8.908 8.908 8.908 0 0 0 8.908 8.908c5.458 0 8.992-3.586 8.992-8.908 0-.545-.049-1.09-.139-1.621z" />
            </svg>
            Entrar com Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
