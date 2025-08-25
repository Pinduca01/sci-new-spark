import {
  Home,
  Calendar,
  ClipboardCheck,
  Activity,
  Target,
  Truck,
  Package,
  AlertTriangle,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const AppSidebar = () => {
  const items = [
    {
      title: "Dashboard",
      url: "/",
      icon: Home,
    },
    {
      title: "Controle Pessoal", 
      url: "/controle-pessoal",
      icon: Users,
    },
    {
      title: "Escalas",
      url: "/escalas", 
      icon: Calendar,
    },
    {
      title: "PTR-BA",
      url: "/ptrba",
      icon: ClipboardCheck,
    },
    {
      title: "TAF",
      url: "/taf",
      icon: Activity,
    },
    {
      title: "Exercícios",
      url: "/exercicios",
      icon: Target,
    },
    {
      title: "Viaturas",
      url: "/viaturas",
      icon: Truck,
    },
    {
      title: "Equipamentos",
      url: "/equipamentos",
      icon: Package,
    },
    {
      title: "Ocorrências",
      url: "/ocorrencias", 
      icon: AlertTriangle,
    },
  ]

  return (
    <div className="flex flex-col h-full bg-secondary w-60 py-4">
      <div className="px-4 pb-4">
        <h1 className="text-2xl font-bold">SCI - 2°GBM</h1>
        <p className="text-muted-foreground">Sistema de Controle Integrado</p>
      </div>

      <nav className="flex-1 space-y-1 px-2">
        {items.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            className={({ isActive }) =>
              `group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground ${
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground"
              }`
            }
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.title}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default AppSidebar;
