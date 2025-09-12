import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, X, Users, AlertCircle } from 'lucide-react';
import { useBombeirosResponsavel } from '@/hooks/useBombeirosSearch';
import { BombeiroWithDetails } from '@/hooks/useBombeirosSearch';
import { cn } from '@/lib/utils';

interface BombeiroSelectorProps {
  value?: BombeiroWithDetails | null;
  onChange: (bombeiro: BombeiroWithDetails | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  showEquipeFilter?: boolean;
  showFuncaoFilter?: boolean;
}

export const BombeiroSelector: React.FC<BombeiroSelectorProps> = ({
  value,
  onChange,
  placeholder = "Selecione um responsável...",
  disabled = false,
  className,
  showEquipeFilter = true,
  showFuncaoFilter = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    bombeiros,
    searchTerm,
    setSearchTerm,
    selectedEquipe,
    setSelectedEquipe,
    selectedFuncao,
    setSelectedFuncao,
    equipesDisponiveis,
    funcoesDisponiveis,
    estatisticas,
    isLoading,
    error,
    limparFiltros,
    destacarTexto
  } = useBombeirosResponsavel();

  // Debug: verificar dados recebidos
  useEffect(() => {
    console.log('BombeiroSelector - Dados recebidos:', {
      bombeiros: bombeiros?.length || 0,
      primeiros3: bombeiros?.slice(0, 3),
      isLoading,
      error
    });
  }, [bombeiros, isLoading, error]);

  // Debug logs para investigar problema de equipes
  React.useEffect(() => {
    console.log('🔍 BombeiroSelector Debug:', {
      totalBombeiros: bombeiros.length,
      isLoading,
      error: error?.message
    });
    
    // Verificar dados de equipe
    const bombeirosComEquipeId = bombeiros.filter(b => b.equipe_id !== null && b.equipe_id !== undefined);
    const bombeirosSemEquipeId = bombeiros.filter(b => b.equipe_id === null || b.equipe_id === undefined);
    
    console.log('📊 Estatísticas de Equipes:', {
      totalBombeiros: bombeiros.length,
      comEquipeId: bombeirosComEquipeId.length,
      semEquipeId: bombeirosSemEquipeId.length,
      percentualComEquipe: bombeiros.length > 0 ? ((bombeirosComEquipeId.length / bombeiros.length) * 100).toFixed(1) + '%' : '0%'
    });
    
    // Mostrar exemplos de bombeiros sem equipe_id
    if (bombeirosSemEquipeId.length > 0) {
      console.log('👥 Bombeiros sem equipe_id (primeiros 5):', bombeirosSemEquipeId.slice(0, 5).map(b => ({
        nome: b.nome,
        equipe_id: b.equipe_id,
        campo_equipe: (b as any).equipe,
        equipes_relacionamento: b.equipes?.nome_equipe,
        funcao: b.funcao
      })));
    }
    
    // Mostrar exemplos de bombeiros com equipe_id
    if (bombeirosComEquipeId.length > 0) {
      console.log('✅ Bombeiros com equipe_id (primeiros 3):', bombeirosComEquipeId.slice(0, 3).map(b => ({
        nome: b.nome,
        equipe_id: b.equipe_id,
        campo_equipe: (b as any).equipe,
        equipes_relacionamento: b.equipes?.nome_equipe,
        funcao: b.funcao
      })));
    }
  }, [bombeiros, isLoading, error])

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setInputValue('');
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setSearchTerm]);

  // Sincronizar busca com input
  useEffect(() => {
    setSearchTerm(inputValue);
  }, [inputValue, setSearchTerm]);

  // Atualizar input quando valor externo muda
  useEffect(() => {
    if (value) {
      setInputValue(value.nome);
    } else {
      setInputValue('');
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (!isOpen) setIsOpen(true);
  };

  const handleBombeiroSelect = (bombeiro: BombeiroWithDetails) => {
    onChange(bombeiro);
    setInputValue(bombeiro.nome);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    onChange(null);
    setInputValue('');
    setSearchTerm('');
    inputRef.current?.focus();
  };

  const handleToggleDropdown = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    if (!isOpen) {
      inputRef.current?.focus();
    }
  };

  const getEquipeColor = (equipe: string) => {
    const colors = {
      'Alfa': 'bg-red-100 text-red-800 border-red-200',
      'Bravo': 'bg-blue-100 text-blue-800 border-blue-200',
      'Charlie': 'bg-green-100 text-green-800 border-green-200',
      'Delta': 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return colors[equipe as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'Ativo': 'bg-green-100 text-green-800',
      'Férias': 'bg-orange-100 text-orange-800',
      'Licença Médica': 'bg-red-100 text-red-800',
      'Afastamento': 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className={cn("relative w-full", className)} ref={dropdownRef}>
      {/* Input Principal */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => !disabled && setIsOpen(true)}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "w-full pl-10 pr-20 py-2 border border-gray-300 rounded-lg",
              "focus:ring-2 focus:ring-blue-500 focus:border-transparent",
              "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
              "transition-all duration-200"
            )}
          />
          
          {/* Botões de ação */}
          <div className="absolute right-2 flex items-center space-x-1">
            {value && (
              <button
                type="button"
                onClick={handleClear}
                disabled={disabled}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
                title="Limpar seleção"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
            <button
              type="button"
              onClick={handleToggleDropdown}
              disabled={disabled}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <ChevronDown className={cn(
                "h-4 w-4 text-gray-400 transition-transform duration-200",
                isOpen && "transform rotate-180"
              )} />
            </button>
          </div>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-hidden">
          {/* Filtros */}
          {(showEquipeFilter || showFuncaoFilter) && (
            <div className="p-3 border-b border-gray-100 bg-gray-50">
              <div className="flex flex-wrap gap-2">
                {showEquipeFilter && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">Equipe:</span>
                    <select
                      value={selectedEquipe}
                      onChange={(e) => setSelectedEquipe(e.target.value)}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="">Todas</option>
                      {equipesDisponiveis.map(equipe => (
                        <option key={equipe.toString()} value={equipe.toString()}>
                          {`Equipe ${equipe}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                {showFuncaoFilter && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-700">Função:</span>
                    <select
                      value={selectedFuncao}
                      onChange={(e) => setSelectedFuncao(e.target.value)}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="">Todas</option>
                      {funcoesDisponiveis.map(funcao => (
                        <option key={funcao.toString()} value={funcao.toString()}>
                          {String(funcao)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                
                {(selectedEquipe || selectedFuncao || searchTerm) && (
                  <button
                    onClick={limparFiltros}
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    Limpar filtros
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Estatísticas */}
          {searchTerm && (
            <div className="px-3 py-2 bg-blue-50 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-800">
                  {estatisticas.total} resultado{estatisticas.total !== 1 ? 's' : ''} encontrado{estatisticas.total !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          )}

          {/* Lista de bombeiros */}
          <div className="max-h-64 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                Carregando...
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-600">
                <AlertCircle className="h-6 w-6 mx-auto mb-2" />
                Erro ao carregar dados
              </div>
            ) : bombeiros.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Users className="h-6 w-6 mx-auto mb-2" />
                {searchTerm ? 'Nenhum resultado encontrado' : 'Nenhum bombeiro disponível'}
              </div>
            ) : (
              bombeiros.map((bombeiro) => (
                <button
                  key={bombeiro.id}
                  onClick={() => handleBombeiroSelect(bombeiro)}
                  className={cn(
                    "w-full px-3 py-3 text-left hover:bg-gray-50 transition-colors",
                    "border-b border-gray-100 last:border-b-0",
                    value?.id === bombeiro.id && "bg-blue-50 border-blue-200"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span 
                          className="font-medium text-gray-900 truncate"
                          dangerouslySetInnerHTML={{
                            __html: destacarTexto(bombeiro.nome, searchTerm)
                          }}
                        />
                        <span className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
                          getEquipeColor(bombeiro.equipe)
                        )}>
                          {bombeiro.equipe}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span 
                          className="text-sm text-gray-600"
                          dangerouslySetInnerHTML={{
                            __html: destacarTexto(bombeiro.funcao_completa || bombeiro.funcao, searchTerm)
                          }}
                        />
                        <span className={cn(
                          "inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium",
                          getStatusColor(bombeiro.statusDisplay)
                        )}>
                          {bombeiro.statusDisplay}
                        </span>
                      </div>
                      {bombeiro.matricula && (
                        <div className="text-xs text-gray-500 mt-1">
                          Mat: {bombeiro.matricula}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BombeiroSelector;