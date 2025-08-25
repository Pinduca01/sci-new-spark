
import React from 'react';
import { useLocation } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { 
  Home, 
  BarChart3, 
  Users, 
  Radio, 
  AlertTriangle, 
  Truck, 
  Target, 
  GraduationCap, 
  Briefcase,
  FileText,
  Calendar,
  ClipboardList,
  Settings,
  Activity,
  ShieldCheck
} from 'lucide-react';

const routeConfig = {
  '/dashboard': {
    title: 'Dashboard',
    icon: BarChart3,
    parent: null
  },
  '/pessoal': {
    title: 'Gestão de Bombeiros',
    icon: Users,
    parent: '/dashboard'
  },
  '/pessoal/taf': {
    title: 'TAF',
    icon: Activity,
    parent: '/pessoal'
  },
  '/equipamentos': {
    title: 'Equipamentos Gerais',
    icon: Radio,
    parent: '/dashboard'
  },
  '/equipamentos/tp-uniformes': {
    title: 'TP e Uniformes',
    icon: ShieldCheck,
    parent: '/equipamentos'
  },
  '/ocorrencias': {
    title: 'Ocorrências',
    icon: AlertTriangle,
    parent: '/dashboard'
  },
  '/viaturas': {
    title: 'Veículos',
    icon: Truck,
    parent: '/dashboard'
  },
  '/exercicios': {
    title: 'Exercícios',
    icon: Target,
    parent: '/dashboard'
  },
  '/ptr-ba': {
    title: 'PTR-BA',
    icon: GraduationCap,
    parent: '/dashboard'
  },
  '/atividades-acessorias': {
    title: 'Atividades Acessórias',
    icon: Briefcase,
    parent: '/dashboard'
  },
  '/relatorios': {
    title: 'Relatórios',
    icon: FileText,
    parent: '/dashboard'
  },
  '/escalas': {
    title: 'Escalas',
    icon: Calendar,
    parent: '/dashboard'
  },
  '/procedimentos': {
    title: 'Procedimentos',
    icon: ClipboardList,
    parent: '/dashboard'
  },
  '/configuracoes': {
    title: 'Configurações',
    icon: Settings,
    parent: '/dashboard'
  }
};

export const HeaderBreadcrumb = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const buildBreadcrumbPath = (path: string): Array<{path: string, config: any}> => {
    const config = routeConfig[path];
    if (!config) return [];

    const breadcrumbs = [];
    
    if (config.parent && config.parent !== path) {
      breadcrumbs.push(...buildBreadcrumbPath(config.parent));
    }
    
    breadcrumbs.push({ path, config });
    return breadcrumbs;
  };

  const breadcrumbs = buildBreadcrumbPath(currentPath);
  
  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((breadcrumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const Icon = breadcrumb.config.icon;
          
          return (
            <React.Fragment key={breadcrumb.path}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="flex items-center space-x-2">
                    <Icon className="w-4 h-4" />
                    <span>{breadcrumb.config.title}</span>
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink 
                    href={breadcrumb.path}
                    className="flex items-center space-x-2 hover:text-foreground"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{breadcrumb.config.title}</span>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
