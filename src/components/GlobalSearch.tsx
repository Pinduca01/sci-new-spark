
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { 
  User, 
  Truck, 
  Package, 
  AlertCircle, 
  FileText, 
  Search,
  Home,
  Users,
  Target,
  Shield
} from 'lucide-react';
import { useBombeiros } from '@/hooks/useBombeiros';
import { useMateriais } from '@/hooks/useMateriais';

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  icon: any;
  action: () => void;
  category: string;
}

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GlobalSearch = ({ open, onOpenChange }: GlobalSearchProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { bombeiros } = useBombeiros();
  const { materiais } = useMateriais();

  // Static navigation items
  const navigationItems: SearchResult[] = [
    {
      id: 'nav-dashboard',
      title: 'Dashboard',
      subtitle: 'Visão geral do sistema',
      icon: Home,
      action: () => navigate('/dashboard'),
      category: 'Navegação'
    },
    {
      id: 'nav-pessoal',
      title: 'Controle de Pessoal',
      subtitle: 'Gerenciar equipe de bombeiros',
      icon: Users,
      action: () => navigate('/pessoal'),
      category: 'Navegação'
    },
    {
      id: 'nav-taf',
      title: 'TAF - Teste de Aptidão Física',
      subtitle: 'Controle de condicionamento físico',
      icon: Target,
      action: () => navigate('/pessoal/taf'),
      category: 'Navegação'
    },
    {
      id: 'nav-ocorrencias',
      title: 'Ocorrências',
      subtitle: 'Registro de emergências',
      icon: AlertCircle,
      action: () => navigate('/ocorrencias'),
      category: 'Navegação'
    },
    {
      id: 'nav-viaturas',
      title: 'Viaturas',
      subtitle: 'Gestão da frota',
      icon: Truck,
      action: () => navigate('/viaturas'),
      category: 'Navegação'
    },
    {
      id: 'nav-equipamentos',
      title: 'Equipamentos',
      subtitle: 'Controle de equipamentos',
      icon: Shield,
      action: () => navigate('/equipamentos'),
      category: 'Navegação'
    }
  ];

  // Generate search results
  const getSearchResults = (): SearchResult[] => {
    const results: SearchResult[] = [];
    const query = searchQuery.toLowerCase().trim();

    if (!query) {
      return navigationItems;
    }

    // Add matching navigation items
    navigationItems.forEach(item => {
      if (
        item.title.toLowerCase().includes(query) ||
        item.subtitle?.toLowerCase().includes(query)
      ) {
        results.push(item);
      }
    });

    // Add matching bombeiros
    bombeiros.forEach(bombeiro => {
      if (
        bombeiro.nome.toLowerCase().includes(query) ||
        bombeiro.matricula?.toLowerCase().includes(query) ||
        bombeiro.funcao.toLowerCase().includes(query) ||
        bombeiro.equipe.toLowerCase().includes(query)
      ) {
        results.push({
          id: `bombeiro-${bombeiro.id}`,
          title: bombeiro.nome,
          subtitle: `${bombeiro.funcao} - Equipe ${bombeiro.equipe} - ${bombeiro.matricula || 'S/N'}`,
          icon: User,
          action: () => {
            navigate('/pessoal');
            // Aqui poderíamos implementar abertura do modal de detalhes
          },
          category: 'Bombeiros'
        });
      }
    });

    // Add matching materiais
    materiais.forEach(material => {
      if (
        material.nome.toLowerCase().includes(query) ||
        material.categoria.toLowerCase().includes(query) ||
        material.codigo_material.toLowerCase().includes(query)
      ) {
        results.push({
          id: `material-${material.id}`,
          title: material.nome,
          subtitle: `${material.categoria} - Código: ${material.codigo_material}`,
          icon: Package,
          action: () => {
            navigate('/equipamentos');
          },
          category: 'Materiais'
        });
      }
    });

    return results;
  };

  const searchResults = getSearchResults();

  // Group results by category
  const groupedResults = searchResults.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  const handleSelect = (result: SearchResult) => {
    result.action();
    onOpenChange(false);
    setSearchQuery('');
  };

  useEffect(() => {
    if (!open) {
      setSearchQuery('');
    }
  }, [open]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput 
        placeholder="Buscar bombeiros, equipamentos, páginas..." 
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        <CommandEmpty>
          <div className="text-center py-6">
            <Search className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Nenhum resultado encontrado.
            </p>
          </div>
        </CommandEmpty>
        
        {Object.entries(groupedResults).map(([category, results]) => (
          <CommandGroup key={category} heading={category}>
            {results.map((result) => {
              const Icon = result.icon;
              return (
                <CommandItem
                  key={result.id}
                  onSelect={() => handleSelect(result)}
                  className="flex items-center gap-3 px-3 py-2 cursor-pointer"
                >
                  <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-medium text-sm truncate">
                      {result.title}
                    </span>
                    {result.subtitle && (
                      <span className="text-xs text-muted-foreground truncate">
                        {result.subtitle}
                      </span>
                    )}
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
};
