import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { 
  Shield, 
  Users, 
  ClipboardList, 
  BarChart3, 
  Settings,
  LogOut,
  FileText,
  Truck,
  Radio,
  Calendar,
  AlertTriangle
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const mainNavItems = [
  { 
    title: "Dashboard", 
    url: "/dashboard", 
    icon: BarChart3,
    description: "Visão geral do sistema"
  },
  { 
    title: "Controle de Pessoal", 
    url: "/pessoal", 
    icon: Users,
    description: "Gestão da equipe SCI"
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
    title: "Equipamentos", 
    url: "/equipamentos", 
    icon: Radio,
    description: "Controle de equipamentos"
  }
];

const reportItems = [
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
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary/10 text-primary border-r-2 border-primary" 
      : "hover:bg-muted/50 text-muted-foreground hover:text-foreground";

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
      className={`border-r border-border/50 bg-background/50 backdrop-blur-sm transition-all duration-300 ${
        showFull ? "w-64" : "w-16"
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header */}
      <SidebarHeader className="p-4 border-b border-border/50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
          {showFull && (
            <div className="transition-opacity duration-200">
              <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                SCI-Core
              </h2>
              <p className="text-xs text-muted-foreground">
                Seção Contraincêndio
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        {/* Navegação Principal */}
        <SidebarGroup>
          <SidebarGroupLabel className={showFull ? "" : "sr-only"}>
            Navegação Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavCls}
                      title={showFull ? undefined : item.description}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {showFull && (
                        <span className="font-medium transition-opacity duration-200">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Gestão e Relatórios */}
        <SidebarGroup>
          <SidebarGroupLabel className={showFull ? "" : "sr-only"}>
            Gestão & Relatórios
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {reportItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavCls}
                      title={showFull ? undefined : item.description}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {showFull && (
                        <span className="font-medium transition-opacity duration-200">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Administração - apenas para admin */}
        {userRole === 'admin' && (
          <SidebarGroup>
            <SidebarGroupLabel className={showFull ? "" : "sr-only"}>
              Administração
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        className={getNavCls}
                        title={showFull ? undefined : item.description}
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        {showFull && (
                          <span className="font-medium transition-opacity duration-200">{item.title}</span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="p-2 border-t border-border/50">
        <Button
          variant="ghost"
          size={showFull ? "sm" : "icon"}
          onClick={handleLogout}
          className="w-full justify-start hover:bg-destructive/10 hover:text-destructive"
          title={showFull ? undefined : "Sair do sistema"}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {showFull && <span className="ml-2 transition-opacity duration-200">Sair</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}