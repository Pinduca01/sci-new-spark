
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  Users, 
  ClipboardList, 
  BarChart3, 
  Settings,
  LogOut,
  FileText,
  Truck,
  Radio,
  Calendar,
  AlertTriangle,
  Target,
  GraduationCap,
  Activity,
  Briefcase,
  ShieldCheck,
  Shield
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

// Todos os itens de navegação em uma única lista organizada
const navigationItems = [
  { 
    title: "Dashboard", 
    url: "/dashboard", 
    icon: BarChart3,
    description: "Visão geral do sistema"
  },
  { 
    title: "Gestão de Bombeiros", 
    url: "/pessoal", 
    icon: Users,
    description: "Gestão da equipe SCI"
  },
  { 
    title: "TAF", 
    url: "/pessoal/taf", 
    icon: Activity,
    description: "Teste de Aptidão Física"
  },
  { 
    title: "Equipamentos Gerais", 
    url: "/equipamentos", 
    icon: Radio,
    description: "Controle de equipamentos"
  },
  { 
    title: "TP e Uniformes", 
    url: "/equipamentos/tp-uniformes", 
    icon: ShieldCheck,
    description: "Trajes de Proteção e Uniformes"
  },
  { 
    title: "Ocorrências", 
    url: "/ocorrencias", 
    icon: AlertTriangle,
    description: "Registro de eventos"
  },
  { 
    title: "Veículos", 
    url: "/viaturas", 
    icon: Truck,
    description: "Gestão da frota"
  },
  { 
    title: "Exercícios", 
    url: "/exercicios", 
    icon: Target,
    description: "Treinamentos e simulações"
  },
  { 
    title: "PTR-BA", 
    url: "/ptr-ba", 
    icon: GraduationCap,
    description: "Programa de Treinamento Recorrente"
  },
  { 
    title: "Atividades Acessórias", 
    url: "/atividades-acessorias", 
    icon: Briefcase,
    description: "Atividades complementares"
  },
  { 
    title: "Relatórios", 
    url: "/relatorios", 
    icon: FileText,
    description: "Geração de relatórios"
  },
  { 
    title: "Escalas", 
    url: "/escalas", 
    icon: Calendar,
    description: "Gestão de escalas"
  },
  { 
    title: "Procedimentos", 
    url: "/procedimentos", 
    icon: ClipboardList,
    description: "Protocolos e SOPs"
  }
];

const adminItems = [
  { 
    title: "Configurações", 
    url: "/configuracoes", 
    icon: Settings,
    description: "Configurações do sistema"
  }
];

export function AppSidebar({ userRole }: { userRole?: string }) {
  const { state } = useSidebar();
  const [isHovered, setIsHovered] = useState(false);
  const collapsed = state === "collapsed";
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const currentPath = location.pathname;
  
  const showFull = !collapsed || isHovered;

  const isActive = (path: string) => currentPath === path;
  
  const getNavClasses = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary/15 text-primary border-r-2 border-primary font-medium shadow-sm" 
      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-all duration-200";

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Erro ao sair",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Logout realizado com sucesso",
          description: "Até a próxima!",
        });
        navigate('/login');
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro durante o logout.",
        variant: "destructive",
      });
    }
  };

  return (
    <Sidebar 
      className={`border-r border-border/40 bg-gradient-to-b from-background to-background/95 backdrop-blur-sm transition-all duration-300 ${
        showFull ? "w-64" : "w-16"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header Moderno */}
      <SidebarHeader className="p-4 border-b border-border/40">
        <div className="flex items-center justify-center">
          {showFull ? (
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 flex items-center justify-center shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                </div>
              </div>
              
              <div className="flex flex-col">
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 via-orange-500 to-blue-600 bg-clip-text text-transparent">
                  SCI-Core
                </h1>
                <p className="text-xs text-muted-foreground font-medium">
                  Sistema Integrado
                </p>
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md">
                <div className="w-2 h-2 rounded-full bg-white"></div>
              </div>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-3">
        {/* Navegação Principal - Lista Única */}
        <SidebarGroup>
          <SidebarGroupLabel className={showFull ? "text-xs font-semibold text-muted-foreground/80 mb-2" : "sr-only"}>
            Navegação
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item, index) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-10 rounded-lg">
                    <NavLink 
                      to={item.url} 
                      className={getNavClasses}
                      title={showFull ? undefined : item.description}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {showFull && (
                        <span className="font-medium transition-opacity duration-200">
                          {item.title}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                  
                  {/* Separador visual após grupos lógicos */}
                  {showFull && (index === 0 || index === 4 || index === 9) && (
                    <Separator className="my-2 bg-border/30" />
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Administração - apenas para admin */}
        {userRole === 'admin' && (
          <>
            <Separator className="my-4 bg-border/30" />
            <SidebarGroup>
              <SidebarGroupLabel className={showFull ? "text-xs font-semibold text-muted-foreground/80 mb-2" : "sr-only"}>
                Administração
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {adminItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild className="h-10 rounded-lg">
                        <NavLink 
                          to={item.url} 
                          className={getNavClasses}
                          title={showFull ? undefined : item.description}
                        >
                          <item.icon className="w-5 h-5 flex-shrink-0" />
                          {showFull && (
                            <span className="font-medium transition-opacity duration-200">
                              {item.title}
                            </span>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="p-3 border-t border-border/40">
        <Button
          variant="ghost"
          size={showFull ? "default" : "icon"}
          onClick={handleLogout}
          className="w-full justify-start hover:bg-destructive/10 hover:text-destructive transition-all duration-200 h-10 rounded-lg"
          title={showFull ? undefined : "Sair do sistema"}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {showFull && <span className="ml-2 font-medium transition-opacity duration-200">Sair</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
