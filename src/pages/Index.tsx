import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from '@supabase/supabase-js';
import { Users, ArrowRight } from "lucide-react";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGetStarted = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen abstract-bg flex items-center justify-center p-4">
      {/* Abstract geometric shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-gradient-to-tl from-primary/5 to-transparent blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gradient-to-r from-primary/8 to-transparent blur-2xl animate-pulse delay-500" />
      </div>

      <div className="relative z-10 text-center space-y-8 max-w-4xl mx-auto">
        {/* Logo and Title */}
        <div className="space-y-6">
          <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-2xl">
            <Users className="w-10 h-10 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-4">
              SCI-Core
            </h1>
            <p className="text-2xl text-muted-foreground">
              Plataforma de Gestão Científica
            </p>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-4">
          <p className="text-xl text-foreground/80 max-w-2xl mx-auto leading-relaxed">
            Revolucione seus projetos de pesquisa com uma plataforma completa de gestão científica, 
            análise de dados e colaboração em tempo real.
          </p>
        </div>

        {/* CTA Button */}
        <div className="pt-8">
          <Button
            variant="orange"
            size="lg"
            onClick={handleGetStarted}
            className="text-lg px-8 py-6 shadow-2xl"
          >
            {user ? 'Ir para Dashboard' : 'Fazer Login'}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
          <div className="glass-card p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6 text-primary-foreground" />
            </div>
            <h3 className="text-lg font-semibold">Colaboração</h3>
            <p className="text-sm text-muted-foreground">
              Trabalhe em equipe com ferramentas avançadas de colaboração
            </p>
          </div>
          
          <div className="glass-card p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6 text-primary-foreground" />
            </div>
            <h3 className="text-lg font-semibold">Análise</h3>
            <p className="text-sm text-muted-foreground">
              Analise dados científicos com ferramentas poderosas
            </p>
          </div>
          
          <div className="glass-card p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6 text-primary-foreground" />
            </div>
            <h3 className="text-lg font-semibold">Gestão</h3>
            <p className="text-sm text-muted-foreground">
              Gerencie projetos de forma eficiente e organizada
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
