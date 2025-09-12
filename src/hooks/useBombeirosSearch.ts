import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Bombeiro } from './useBombeiros';

export interface BombeiroSearchOptions {
  searchTerm?: string;
  equipe?: string;
  funcao?: string;
  status?: string;
  includeInactive?: boolean;
}

export interface BombeiroWithDetails extends Bombeiro {
  displayName: string;
  searchableText: string;
  statusDisplay: string;
  equipeDisplay: string;
}

export const useBombeirosSearch = (options: BombeiroSearchOptions = {}) => {
  const [searchTerm, setSearchTerm] = useState(options.searchTerm || '');
  const [selectedEquipe, setSelectedEquipe] = useState(options.equipe || '');
  const [selectedFuncao, setSelectedFuncao] = useState(options.funcao || '');
  const [selectedStatus, setSelectedStatus] = useState(options.status || 'ativo');

  // Buscar todos os bombeiros com dados completos
  const {
    data: bombeiros = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['bombeiros-search', selectedStatus, options.includeInactive],
    queryFn: async () => {
      let query = supabase
        .from('bombeiros')
        .select('*')
        .order('nome');

      // Filtrar por status se não incluir inativos
      if (!options.includeInactive) {
        query = query.eq('status', selectedStatus || 'ativo');
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Bombeiro[];
    },
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
    cacheTime: 10 * 60 * 1000, // Manter em cache por 10 minutos
  });

  // Processar dados dos bombeiros para busca
  const bombeirosProcessados = useMemo((): BombeiroWithDetails[] => {
    return bombeiros.map(bombeiro => {
      const statusDisplay = {
        'ativo': 'Ativo',
        'ferias': 'Férias',
        'licenca_medica': 'Licença Médica',
        'afastamento': 'Afastamento'
      }[bombeiro.status] || bombeiro.status;

      const equipeDisplay = bombeiro.equipe ? `Equipe ${bombeiro.equipe}` : 'Sem equipe';
      
      const displayName = `${bombeiro.nome} - ${bombeiro.funcao_completa}`;
      
      const searchableText = [
        bombeiro.nome,
        bombeiro.funcao,
        bombeiro.funcao_completa,
        bombeiro.equipe,
        bombeiro.matricula,
        bombeiro.email
      ].filter(Boolean).join(' ').toLowerCase();

      return {
        ...bombeiro,
        displayName,
        searchableText,
        statusDisplay,
        equipeDisplay
      };
    });
  }, [bombeiros]);

  // Filtrar bombeiros baseado nos critérios de busca
  const bombeirosFiltrados = useMemo(() => {
    let filtered = bombeirosProcessados;

    // Filtro por termo de busca
    if (searchTerm.trim()) {
      const termLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(bombeiro => 
        bombeiro.searchableText.includes(termLower)
      );
    }

    // Filtro por equipe
    if (selectedEquipe) {
      filtered = filtered.filter(bombeiro => bombeiro.equipe === selectedEquipe);
    }

    // Filtro por função
    if (selectedFuncao) {
      filtered = filtered.filter(bombeiro => bombeiro.funcao === selectedFuncao);
    }

    // Ordenar por relevância (nome primeiro, depois função)
    return filtered.sort((a, b) => {
      // Se há termo de busca, priorizar matches no nome
      if (searchTerm.trim()) {
        const termLower = searchTerm.toLowerCase();
        const aNameMatch = a.nome.toLowerCase().includes(termLower);
        const bNameMatch = b.nome.toLowerCase().includes(termLower);
        
        if (aNameMatch && !bNameMatch) return -1;
        if (!aNameMatch && bNameMatch) return 1;
      }
      
      // Ordenação alfabética por nome
      return a.nome.localeCompare(b.nome, 'pt-BR');
    });
  }, [bombeirosProcessados, searchTerm, selectedEquipe, selectedFuncao]);

  // Obter listas únicas para filtros
  const equipesDisponiveis = useMemo(() => {
    const equipes = [...new Set(bombeiros.map(b => b.equipe))].filter(Boolean);
    return equipes.sort();
  }, [bombeiros]);

  const funcoesDisponiveis = useMemo(() => {
    const funcoes = [...new Set(bombeiros.map(b => b.funcao))].filter(Boolean);
    return funcoes.sort();
  }, [bombeiros]);

  const statusDisponiveis = useMemo(() => {
    const status = [...new Set(bombeiros.map(b => b.status))].filter(Boolean);
    return status.sort();
  }, [bombeiros]);

  // Estatísticas
  const estatisticas = useMemo(() => {
    const total = bombeirosFiltrados.length;
    const porEquipe = bombeirosFiltrados.reduce((acc, bombeiro) => {
      const equipeNome = bombeiro.equipe || 'Sem equipe';
      acc[equipeNome] = (acc[equipeNome] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const porFuncao = bombeirosFiltrados.reduce((acc, bombeiro) => {
      acc[bombeiro.funcao] = (acc[bombeiro.funcao] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      porEquipe,
      porFuncao
    };
  }, [bombeirosFiltrados]);

  // Funções de controle
  const limparFiltros = () => {
    setSearchTerm('');
    setSelectedEquipe('');
    setSelectedFuncao('');
    setSelectedStatus('ativo');
  };

  const buscarPorEquipe = (equipe: string) => {
    setSelectedEquipe(equipe);
  };

  const buscarPorFuncao = (funcao: string) => {
    setSelectedFuncao(funcao);
  };

  // Função para destacar texto na busca
  const destacarTexto = (texto: string, termo: string) => {
    if (!termo.trim()) return texto;
    
    const regex = new RegExp(`(${termo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return texto.replace(regex, '<mark>$1</mark>');
  };

  return {
    // Dados
    bombeiros: bombeirosFiltrados,
    bombeirosOriginais: bombeiros,
    
    // Estados de busca
    searchTerm,
    setSearchTerm,
    selectedEquipe,
    setSelectedEquipe,
    selectedFuncao,
    setSelectedFuncao,
    selectedStatus,
    setSelectedStatus,
    
    // Opções para filtros
    equipesDisponiveis,
    funcoesDisponiveis,
    statusDisponiveis,
    
    // Estatísticas
    estatisticas,
    
    // Estados de carregamento
    isLoading,
    error,
    
    // Funções utilitárias
    limparFiltros,
    buscarPorEquipe,
    buscarPorFuncao,
    destacarTexto,
    refetch
  };
};

// Hook específico para seleção de responsável
export const useBombeirosResponsavel = () => {
  return useBombeirosSearch({
    status: 'ativo',
    includeInactive: false
  });
};

// Hook para busca com debounce
export const useDebouncedBombeirosSearch = (delay: number = 300) => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Implementar debounce
  useState(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, delay);

    return () => clearTimeout(timer);
  });

  const searchHook = useBombeirosSearch({
    searchTerm: debouncedSearchTerm,
    status: 'ativo'
  });

  return {
    ...searchHook,
    searchTerm,
    setSearchTerm,
    isSearching: searchTerm !== debouncedSearchTerm
  };
};