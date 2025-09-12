import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useBombeiros } from "@/hooks/useBombeiros";
import { useEquipes } from "@/hooks/useEquipes";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { ClipboardCheck, AlertCircle, CheckCircle, XCircle, Clock, Users, ArrowRight, ArrowLeft, Save, Eye } from "lucide-react";

type FormData = {
  // Informações básicas
  data_verificacao: string;
  local: string;
  responsavel: string;
  equipe: string;
  membros_equipe: string[];
};

type VerificacaoStatus = 'conforme' | 'nao_conforme' | 'nao_verificado';

type CategoriaVerificacao = {
  id: string;
  titulo: string;
  perguntas: {
    id: string;
    texto: string;
    status: VerificacaoStatus;
    membros_afetados: string[];
    observacoes: string;
  }[];
};

type HistoricoVerificacao = {
  id: string;
  data_verificacao: string;
  local: string;
  responsavel: string;
  equipe: string;
  status: string;
  percentual_conformidade: number;
  total_conformes: number;
  total_nao_conformes: number;
};

const TPVerificacaoForm = () => {
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<FormData>();
  const { bombeiros = [] } = useBombeiros();
  const { data: equipes = [] } = useEquipes();
  const { toast } = useToast();
  
  // Estados do sistema
  const [etapaAtual, setEtapaAtual] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [verificacaoId, setVerificacaoId] = useState<string | null>(null);
  const [membrosEquipeSelecionada, setMembrosEquipeSelecionada] = useState<string[]>([]);
  const [modalNaoConforme, setModalNaoConforme] = useState<{aberto: boolean; perguntaId: string; categoriaId: string}>({aberto: false, perguntaId: '', categoriaId: ''});
  const [membrosAfetados, setMembrosAfetados] = useState<string[]>([]);
  const [observacoesModal, setObservacoesModal] = useState('');
  const [historicoVerificacoes, setHistoricoVerificacoes] = useState<HistoricoVerificacao[]>([]);
  
  // Dados do formulário
  const equipeSelecionada = watch('equipe');
  const localSelecionado = watch('local');
  const responsavelSelecionado = watch('responsavel');
  
  // Pré-preencher campos com valores padrão
  useEffect(() => {
    const hoje = new Date();
    const dataFormatada = hoje.toISOString().split('T')[0];
    setValue('data_verificacao', dataFormatada);
    setValue('local', 'Santa Genoveva - GYN');
  }, [setValue]);
  
  // Atualizar membros da equipe quando equipe for selecionada
  useEffect(() => {
    if (equipeSelecionada && bombeiros.length > 0) {
      // Buscar bombeiros que pertencem à equipe selecionada
      const membrosDaEquipe = bombeiros.filter(bombeiro => 
        bombeiro.equipe === equipeSelecionada && bombeiro.status === 'ativo'
      );
      const nomesMembros = membrosDaEquipe.map(bombeiro => bombeiro.nome);
      setMembrosEquipeSelecionada(nomesMembros);
      setValue('membros_equipe', nomesMembros);
    }
  }, [equipeSelecionada, bombeiros, setValue]);

  // Estrutura das categorias de verificação
  const [categorias, setCategorias] = useState<CategoriaVerificacao[]>([
    {
      id: 'cat1',
      titulo: 'IDENTIFICAÇÃO E VALIDADE',
      perguntas: [
        { id: 'etiquetas_visiveis', texto: 'Todos os EPIs estão com etiquetas legíveis e visíveis?', status: 'nao_verificado', membros_afetados: [], observacoes: '' },
        { id: 'ca_valido', texto: 'Todos os EPIs possuem CA válido e dentro da validade?', status: 'nao_verificado', membros_afetados: [], observacoes: '' }
      ]
    },
    {
      id: 'cat2',
      titulo: 'CAPACETES',
      perguntas: [
        { id: 'capacetes_integros', texto: 'Os capacetes estão íntegros, sem avarias, exposição térmica/química ou desgastes que comprometam a segurança?', status: 'nao_verificado', membros_afetados: [], observacoes: '' }
      ]
    },
    {
      id: 'cat3',
      titulo: 'VESTIMENTAS',
      perguntas: [
        { id: 'vestimentas_integras', texto: 'As vestimentas estão íntegras, sem avarias, deformidades, defeitos ou ganchos que comprometam a segurança?', status: 'nao_verificado', membros_afetados: [], observacoes: '' },
        { id: 'bom_estado', texto: 'As vestimentas estão em bom estado, sem rasgos, desgastes ou manchas excessivas?', status: 'nao_verificado', membros_afetados: [], observacoes: '' },
        { id: 'faixas_reflexivas', texto: 'As faixas reflexivas das vestimentas estão íntegras e com reflexibilidade adequada?', status: 'nao_verificado', membros_afetados: [], observacoes: '' },
        { id: 'bolsos_dispositivos', texto: 'Os bolsos e dispositivos das vestimentas estão funcionando adequadamente?', status: 'nao_verificado', membros_afetados: [], observacoes: '' },
        { id: 'costuras_integras', texto: 'As costuras das vestimentas estão íntegras e sem danos?', status: 'nao_verificado', membros_afetados: [], observacoes: '' },
        { id: 'barreira_umidade', texto: 'A barreira de umidade das vestimentas está preservada (sem furos, manchas ou rasgos)?', status: 'nao_verificado', membros_afetados: [], observacoes: '' },
        { id: 'punhos_elasticidade', texto: 'Os punhos das vestimentas mantêm elasticidade adequada e o sistema de encaixe está funcionando perfeitamente?', status: 'nao_verificado', membros_afetados: [], observacoes: '' },
        { id: 'costuras_seladas', texto: 'Todas as costuras estão devidamente seladas e em perfeitas condições?', status: 'nao_verificado', membros_afetados: [], observacoes: '' }
      ]
    },
    {
      id: 'cat4',
      titulo: 'CALÇADOS',
      perguntas: [
        { id: 'botas_bom_estado', texto: 'As botas estão em bom estado, sem mudança de cor excessiva, rasgos, desgastes ou manchas que comprometam sua função?', status: 'nao_verificado', membros_afetados: [], observacoes: '' },
        { id: 'solas_integras', texto: 'As solas das botas estão íntegras e sem alterações que interfiram na performance do equipamento?', status: 'nao_verificado', membros_afetados: [], observacoes: '' }
      ]
    },
    {
      id: 'cat5',
      titulo: 'LUVAS',
      perguntas: [
        { id: 'luvas_bom_estado', texto: 'As luvas estão em bom estado, sem mudança de cor excessiva, rasgos, desgastes ou manchas que comprometam sua função?', status: 'nao_verificado', membros_afetados: [], observacoes: '' },
        { id: 'costuras_luvas', texto: 'As costuras das luvas estão íntegras e sem desgastes que interfiram na performance do equipamento?', status: 'nao_verificado', membros_afetados: [], observacoes: '' }
      ]
    },
    {
      id: 'cat6',
      titulo: 'CAPUZES/BALACLAVAS',
      perguntas: [
        { id: 'capuzes_bom_estado', texto: 'Os capuzes/balaclavas estão em bom estado, sem mudança de cor excessiva, rasgos, desgastes, manchas ou danos que interfiram na performance do equipamento?', status: 'nao_verificado', membros_afetados: [], observacoes: '' }
      ]
    }
  ]);
  
  // Carregar histórico de verificações
  useEffect(() => {
    carregarHistorico();
  }, []);
  
  const carregarHistorico = async () => {
    try {
      const { data, error } = await supabase
        .from('tp_verificacoes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      if (data) {
        setHistoricoVerificacoes(data.map(item => ({
          id: item.id,
          data_verificacao: new Date(item.data_verificacao).toLocaleDateString('pt-BR'),
          local: item.local,
          responsavel: item.responsavel,
          equipe: item.equipe,
          status: item.status,
          percentual_conformidade: item.percentual_conformidade || 0,
          total_conformes: item.total_conformes || 0,
          total_nao_conformes: item.total_nao_conformes || 0
        })));
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };
  
  // Função para marcar resposta
  const marcarResposta = (categoriaId: string, perguntaId: string, status: VerificacaoStatus) => {
    if (status === 'nao_conforme') {
      setModalNaoConforme({ aberto: true, perguntaId, categoriaId });
      setMembrosAfetados([]);
      setObservacoesModal('');
    } else {
      setCategorias(prev => prev.map(cat => 
        cat.id === categoriaId 
          ? {
              ...cat,
              perguntas: cat.perguntas.map(p => 
                p.id === perguntaId 
                  ? { ...p, status, membros_afetados: [], observacoes: '' }
                  : p
              )
            }
          : cat
      ));
    }
  };
  
  // Confirmar não conformidade
  const confirmarNaoConformidade = () => {
    const { categoriaId, perguntaId } = modalNaoConforme;
    
    setCategorias(prev => prev.map(cat => 
      cat.id === categoriaId 
        ? {
            ...cat,
            perguntas: cat.perguntas.map(p => 
              p.id === perguntaId 
                ? { 
                    ...p, 
                    status: 'nao_conforme', 
                    membros_afetados: membrosAfetados,
                    observacoes: observacoesModal
                  }
                : p
            )
          }
        : cat
    ));
    
    setModalNaoConforme({ aberto: false, perguntaId: '', categoriaId: '' });
    setMembrosAfetados([]);
    setObservacoesModal('');
  };
  
  // Calcular estatísticas
  const calcularEstatisticas = () => {
    let totalPerguntas = 0;
    let conformes = 0;
    let naoConformes = 0;
    let naoVerificados = 0;
    
    categorias.forEach(cat => {
      cat.perguntas.forEach(pergunta => {
        totalPerguntas++;
        if (pergunta.status === 'conforme') conformes++;
        else if (pergunta.status === 'nao_conforme') naoConformes++;
        else naoVerificados++;
      });
    });
    
    const percentualConformidade = totalPerguntas > 0 ? (conformes / totalPerguntas) * 100 : 0;
    
    return { totalPerguntas, conformes, naoConformes, naoVerificados, percentualConformidade };
  };

  // Função para resetar o formulário ao estado inicial
  const resetFormulario = () => {
    // Reset da etapa atual
    setEtapaAtual(1);
    
    // Reset dos estados do sistema
    setIsSaving(false);
    setVerificacaoId(null);
    setMembrosEquipeSelecionada([]);
    setModalNaoConforme({aberto: false, perguntaId: '', categoriaId: ''});
    setMembrosAfetados([]);
    setObservacoesModal('');
    
    // Reset do formulário react-hook-form
    reset({
      data_verificacao: new Date().toISOString().split('T')[0],
      local: 'Santa Genoveva - GYN',
      responsavel: '',
      equipe: '',
      membros_equipe: []
    });
    
    // Reset das categorias ao estado inicial
    setCategorias([
      {
        id: 'cat1',
        titulo: 'IDENTIFICAÇÃO E VALIDADE',
        perguntas: [
          { id: 'etiquetas_visiveis', texto: 'Todos os EPIs estão com etiquetas legíveis e visíveis?', status: 'nao_verificado', membros_afetados: [], observacoes: '' },
          { id: 'ca_valido', texto: 'Todos os EPIs possuem CA válido e dentro da validade?', status: 'nao_verificado', membros_afetados: [], observacoes: '' }
        ]
      },
      {
        id: 'cat2',
        titulo: 'CAPACETES',
        perguntas: [
          { id: 'capacetes_integros', texto: 'Os capacetes estão íntegros, sem avarias, exposição térmica/química ou desgastes que comprometam a segurança?', status: 'nao_verificado', membros_afetados: [], observacoes: '' }
        ]
      },
      {
        id: 'cat3',
        titulo: 'VESTIMENTAS',
        perguntas: [
          { id: 'vestimentas_integras', texto: 'As vestimentas estão íntegras, sem avarias, deformidades, defeitos ou ganchos que comprometam a segurança?', status: 'nao_verificado', membros_afetados: [], observacoes: '' },
          { id: 'bom_estado', texto: 'As vestimentas estão em bom estado, sem rasgos, desgastes ou manchas excessivas?', status: 'nao_verificado', membros_afetados: [], observacoes: '' },
          { id: 'faixas_reflexivas', texto: 'As faixas reflexivas das vestimentas estão íntegras e com reflexibilidade adequada?', status: 'nao_verificado', membros_afetados: [], observacoes: '' },
          { id: 'bolsos_dispositivos', texto: 'Os bolsos e dispositivos das vestimentas estão funcionando adequadamente?', status: 'nao_verificado', membros_afetados: [], observacoes: '' },
          { id: 'costuras_integras', texto: 'As costuras das vestimentas estão íntegras e sem danos?', status: 'nao_verificado', membros_afetados: [], observacoes: '' },
          { id: 'barreira_umidade', texto: 'A barreira de umidade das vestimentas está preservada (sem furos, manchas ou rasgos)?', status: 'nao_verificado', membros_afetados: [], observacoes: '' },
          { id: 'punhos_elasticidade', texto: 'Os punhos das vestimentas mantêm elasticidade adequada e o sistema de encaixe está funcionando perfeitamente?', status: 'nao_verificado', membros_afetados: [], observacoes: '' },
          { id: 'costuras_seladas', texto: 'Todas as costuras estão devidamente seladas e em perfeitas condições?', status: 'nao_verificado', membros_afetados: [], observacoes: '' }
        ]
      },
      {
        id: 'cat4',
        titulo: 'CALÇADOS',
        perguntas: [
          { id: 'botas_bom_estado', texto: 'As botas estão em bom estado, sem mudança de cor excessiva, rasgos, desgastes ou manchas que comprometam sua função?', status: 'nao_verificado', membros_afetados: [], observacoes: '' },
          { id: 'solas_integras', texto: 'As solas das botas estão íntegras e sem alterações que interfiram na performance do equipamento?', status: 'nao_verificado', membros_afetados: [], observacoes: '' }
        ]
      },
      {
        id: 'cat5',
        titulo: 'LUVAS',
        perguntas: [
          { id: 'luvas_bom_estado', texto: 'As luvas estão em bom estado, sem mudança de cor excessiva, rasgos, desgastes ou manchas que comprometam sua função?', status: 'nao_verificado', membros_afetados: [], observacoes: '' },
          { id: 'costuras_luvas', texto: 'As costuras das luvas estão íntegras e sem desgastes que interfiram na performance do equipamento?', status: 'nao_verificado', membros_afetados: [], observacoes: '' }
        ]
      },
      {
        id: 'cat6',
        titulo: 'CAPUZES/BALACLAVAS',
        perguntas: [
          { id: 'capuzes_bom_estado', texto: 'Os capuzes/balaclavas estão em bom estado, sem mudança de cor excessiva, rasgos, desgastes, manchas ou danos que interfiram na performance do equipamento?', status: 'nao_verificado', membros_afetados: [], observacoes: '' }
        ]
      }
    ]);
  };
  
  // Salvar verificação
  const salvarVerificacao = async () => {
    const dados = watch();
    const stats = calcularEstatisticas();
    
    if (!dados.local || !dados.responsavel || !dados.equipe) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos básicos antes de salvar.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Preparar dados para o Supabase
      const dadosSupabase: any = {
        data_verificacao: dados.data_verificacao,
        local: dados.local,
        responsavel: dados.responsavel,
        equipe: dados.equipe,
        membros_equipe: dados.membros_equipe || [],
        status: stats.naoVerificados === 0 ? 'concluida' : 'em_andamento',
        etapa_atual: etapaAtual,
        total_conformes: stats.conformes,
        total_nao_conformes: stats.naoConformes,
        total_nao_verificados: stats.naoVerificados,
        percentual_conformidade: stats.percentualConformidade
      };
      
      // Adicionar dados das categorias com mapeamento correto
      categorias.forEach(cat => {
        cat.perguntas.forEach(pergunta => {
          // Mapear nomes das colunas conforme estrutura da tabela
          let nomeCampo = '';
          
          if (cat.id === 'cat1') {
            if (pergunta.id === 'etiquetas_visiveis') {
              nomeCampo = 'cat1_etiquetas_visiveis';
            } else if (pergunta.id === 'ca_valido') {
              nomeCampo = 'cat1_ca_valido';
            }
          } else if (cat.id === 'cat2') {
            if (pergunta.id === 'capacetes_integros') {
              nomeCampo = 'cat2_capacetes_integros';
            }
          } else if (cat.id === 'cat3') {
            if (pergunta.id === 'vestimentas_integras') {
              nomeCampo = 'cat3_vestimentas_integras';
            } else if (pergunta.id === 'bom_estado') {
              nomeCampo = 'cat3_bom_estado';
            } else if (pergunta.id === 'faixas_reflexivas') {
              nomeCampo = 'cat3_faixas_reflexivas';
            } else if (pergunta.id === 'bolsos_dispositivos') {
              nomeCampo = 'cat3_bolsos_dispositivos';
            } else if (pergunta.id === 'costuras_integras') {
              nomeCampo = 'cat3_costuras_integras';
            } else if (pergunta.id === 'barreira_umidade') {
              nomeCampo = 'cat3_barreira_umidade';
            } else if (pergunta.id === 'punhos_elasticidade') {
              nomeCampo = 'cat3_punhos_elasticidade';
            } else if (pergunta.id === 'costuras_seladas') {
              nomeCampo = 'cat3_costuras_seladas';
            }
          } else if (cat.id === 'cat4') {
            if (pergunta.id === 'botas_bom_estado') {
              nomeCampo = 'cat4_botas_bom_estado';
            } else if (pergunta.id === 'solas_integras') {
              nomeCampo = 'cat4_solas_integras';
            }
          } else if (cat.id === 'cat5') {
            if (pergunta.id === 'luvas_bom_estado') {
              nomeCampo = 'cat5_luvas_bom_estado';
            } else if (pergunta.id === 'costuras_luvas') {
              nomeCampo = 'cat5_costuras_luvas';
            }
          } else if (cat.id === 'cat6') {
            if (pergunta.id === 'capuzes_bom_estado') {
              nomeCampo = 'cat6_capuzes_bom_estado';
            }
          }
          
          if (nomeCampo) {
            dadosSupabase[nomeCampo] = pergunta.status;
            
            // Mapear colunas de membros conforme estrutura da tabela
             if (cat.id === 'cat1' && pergunta.id === 'etiquetas_visiveis') {
               dadosSupabase['cat1_etiquetas_membros'] = pergunta.membros_afetados;
               dadosSupabase['cat1_etiquetas_observacoes'] = pergunta.observacoes;
             } else if (cat.id === 'cat1' && pergunta.id === 'ca_valido') {
               dadosSupabase['cat1_ca_membros'] = pergunta.membros_afetados;
               dadosSupabase['cat1_ca_observacoes'] = pergunta.observacoes;
             } else if (cat.id === 'cat2' && pergunta.id === 'capacetes_integros') {
               dadosSupabase['cat2_capacetes_membros'] = pergunta.membros_afetados;
               dadosSupabase['cat2_capacetes_observacoes'] = pergunta.observacoes;
             } else if (cat.id === 'cat3') {
               if (pergunta.id === 'vestimentas_integras') {
                 dadosSupabase['cat3_vestimentas_membros'] = pergunta.membros_afetados;
                 dadosSupabase['cat3_vestimentas_observacoes'] = pergunta.observacoes;
               } else if (pergunta.id === 'bom_estado') {
                 dadosSupabase['cat3_bom_estado_membros'] = pergunta.membros_afetados;
                 dadosSupabase['cat3_bom_estado_observacoes'] = pergunta.observacoes;
               } else if (pergunta.id === 'faixas_reflexivas') {
                 dadosSupabase['cat3_faixas_membros'] = pergunta.membros_afetados;
                 dadosSupabase['cat3_faixas_observacoes'] = pergunta.observacoes;
               } else if (pergunta.id === 'bolsos_dispositivos') {
                 dadosSupabase['cat3_bolsos_membros'] = pergunta.membros_afetados;
                 dadosSupabase['cat3_bolsos_observacoes'] = pergunta.observacoes;
               } else if (pergunta.id === 'costuras_integras') {
                 dadosSupabase['cat3_costuras_membros'] = pergunta.membros_afetados;
                 dadosSupabase['cat3_costuras_observacoes'] = pergunta.observacoes;
               } else if (pergunta.id === 'barreira_umidade') {
                 dadosSupabase['cat3_barreira_membros'] = pergunta.membros_afetados;
                 dadosSupabase['cat3_barreira_observacoes'] = pergunta.observacoes;
               } else if (pergunta.id === 'punhos_elasticidade') {
                 dadosSupabase['cat3_punhos_membros'] = pergunta.membros_afetados;
                 dadosSupabase['cat3_punhos_observacoes'] = pergunta.observacoes;
               } else if (pergunta.id === 'costuras_seladas') {
                 dadosSupabase['cat3_seladas_membros'] = pergunta.membros_afetados;
                 dadosSupabase['cat3_seladas_observacoes'] = pergunta.observacoes;
               }
             } else if (cat.id === 'cat4') {
               if (pergunta.id === 'botas_bom_estado') {
                 dadosSupabase['cat4_botas_membros'] = pergunta.membros_afetados;
                 dadosSupabase['cat4_botas_observacoes'] = pergunta.observacoes;
               } else if (pergunta.id === 'solas_integras') {
                 dadosSupabase['cat4_solas_membros'] = pergunta.membros_afetados;
                 dadosSupabase['cat4_solas_observacoes'] = pergunta.observacoes;
               }
             } else if (cat.id === 'cat5') {
               if (pergunta.id === 'luvas_bom_estado') {
                 dadosSupabase['cat5_luvas_membros'] = pergunta.membros_afetados;
                 dadosSupabase['cat5_luvas_observacoes'] = pergunta.observacoes;
               } else if (pergunta.id === 'costuras_luvas') {
                 dadosSupabase['cat5_costuras_membros'] = pergunta.membros_afetados;
                 dadosSupabase['cat5_costuras_observacoes'] = pergunta.observacoes;
               }
             } else if (cat.id === 'cat6' && pergunta.id === 'capuzes_bom_estado') {
               dadosSupabase['cat6_capuzes_membros'] = pergunta.membros_afetados;
               dadosSupabase['cat6_capuzes_observacoes'] = pergunta.observacoes;
             }
          }
        });
      });
      
      let resultado;
      if (verificacaoId) {
        resultado = await supabase
          .from('tp_verificacoes')
          .update(dadosSupabase)
          .eq('id', verificacaoId);
      } else {
        resultado = await supabase
          .from('tp_verificacoes')
          .insert([dadosSupabase])
          .select();
        
        if (resultado.data && resultado.data[0]) {
          setVerificacaoId(resultado.data[0].id);
        }
      }
      
      if (resultado.error) throw resultado.error;
      
      toast({
        title: "Verificação salva",
        description: "Os dados foram salvos com sucesso.",
        variant: "default"
      });
      
      // Recarregar histórico
      carregarHistorico();
      
      // Reset automático do formulário após salvamento bem-sucedido
      setTimeout(() => {
        resetFormulario();
        toast({
          title: "Formulário resetado",
          description: "O checklist foi resetado e está pronto para uma nova verificação.",
          variant: "default"
        });
      }, 1500); // Pequeno delay para mostrar o sucesso
      
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar a verificação.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const onSubmit = async (data: FormData) => {
    await salvarVerificacao();
  };

  const stats = calcularEstatisticas();
  
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="space-y-6">
        {/* Cabeçalho com indicador de progresso */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-6 w-6" />
                Verificação de Traje de Proteção (TP)
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={etapaAtual === 1 ? "default" : "secondary"}>1</Badge>
                <ArrowRight className="h-4 w-4" />
                <Badge variant={etapaAtual === 2 ? "default" : "secondary"}>2</Badge>
                <ArrowRight className="h-4 w-4" />
                <Badge variant={etapaAtual === 3 ? "default" : "secondary"}>3</Badge>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>
        
        {/* Etapa 1: Informações Básicas */}
        {etapaAtual === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">1</span>
                </div>
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="data_verificacao">Data da Verificação *</Label>
                  <Input
                    id="data_verificacao"
                    type="date"
                    {...register('data_verificacao', { required: 'Data é obrigatória' })}
                  />
                  {errors.data_verificacao && (
                    <p className="text-sm text-red-600">{errors.data_verificacao.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="local">Local *</Label>
                  <Input
                    id="local"
                    placeholder="Ex: Santa Genoveva - GYN"
                    {...register('local', { required: 'Local é obrigatório' })}
                  />
                  {errors.local && (
                    <p className="text-sm text-red-600">{errors.local.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="responsavel">Responsável *</Label>
                  <Select onValueChange={(value) => setValue('responsavel', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o responsável" />
                    </SelectTrigger>
                    <SelectContent>
                      {bombeiros.map((bombeiro) => (
                        <SelectItem key={bombeiro.id} value={bombeiro.nome}>
                          {bombeiro.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.responsavel && (
                    <p className="text-sm text-red-600">{errors.responsavel.message}</p>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={() => {
                    if (localSelecionado && responsavelSelecionado) {
                      setEtapaAtual(2);
                    } else {
                      toast({
                        title: "Campos obrigatórios",
                        description: "Preencha todos os campos antes de continuar.",
                        variant: "destructive"
                      });
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Iniciar Verificação
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Etapa 2: Seleção de Equipe */}
        {etapaAtual === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-semibold">2</span>
                </div>
                Seleção de Equipe
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="equipe">Equipe *</Label>
                <Select onValueChange={(value) => setValue('equipe', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a equipe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Alfa">Alfa</SelectItem>
                    <SelectItem value="Bravo">Bravo</SelectItem>
                    <SelectItem value="Charlie">Charlie</SelectItem>
                    <SelectItem value="Delta">Delta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {membrosEquipeSelecionada.length > 0 && (
                <div className="space-y-2">
                  <Label>Membros da Equipe {equipeSelecionada}</Label>
                  <div className="flex flex-wrap gap-2">
                    {membrosEquipeSelecionada.map((membro, index) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {membro}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex justify-between">
                <Button 
                  variant="outline"
                  onClick={() => setEtapaAtual(1)}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Button>
                <Button 
                  onClick={() => {
                    if (equipeSelecionada) {
                      setEtapaAtual(3);
                    } else {
                      toast({
                        title: "Selecione uma equipe",
                        description: "É necessário selecionar uma equipe para continuar.",
                        variant: "destructive"
                      });
                    }
                  }}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Continuar Verificação
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Etapa 3: Verificação por Categorias */}
        {etapaAtual === 3 && (
          <>
            {/* Painel de estatísticas */}
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-green-600">{stats.conformes}</div>
                    <div className="text-sm text-gray-600">Conformes</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-red-600">{stats.naoConformes}</div>
                    <div className="text-sm text-gray-600">Não Conformes</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-gray-600">{stats.naoVerificados}</div>
                    <div className="text-sm text-gray-600">Não Verificados</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-2xl font-bold text-blue-600">{stats.percentualConformidade.toFixed(1)}%</div>
                    <div className="text-sm text-gray-600">Conformidade</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Cards das categorias */}
            {categorias.map((categoria) => (
              <Card key={categoria.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{categoria.titulo}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {categoria.perguntas.map((pergunta) => (
                    <div key={pergunta.id} className="border rounded-lg p-4 space-y-3">
                      <p className="font-medium">{pergunta.texto}</p>
                      
                      <div className="flex gap-2">
                        <Button
                          variant={pergunta.status === 'conforme' ? 'default' : 'outline'}
                          className={`flex-1 ${pergunta.status === 'conforme' ? 'bg-green-600 hover:bg-green-700' : 'hover:bg-green-50'}`}
                          onClick={() => marcarResposta(categoria.id, pergunta.id, 'conforme')}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          ✓ CONFORME
                        </Button>
                        
                        <Button
                          variant={pergunta.status === 'nao_conforme' ? 'destructive' : 'outline'}
                          className="flex-1"
                          onClick={() => marcarResposta(categoria.id, pergunta.id, 'nao_conforme')}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          ✗ NÃO CONFORME
                        </Button>
                      </div>
                      
                      {pergunta.status === 'nao_conforme' && pergunta.membros_afetados.length > 0 && (
                        <div className="bg-red-50 p-3 rounded-lg space-y-2">
                          <div className="flex flex-wrap gap-1">
                            <span className="text-sm font-medium text-red-700">Membros afetados:</span>
                            {pergunta.membros_afetados.map((membro, index) => (
                              <Badge key={index} variant="destructive" className="text-xs">
                                {membro}
                              </Badge>
                            ))}
                          </div>
                          {pergunta.observacoes && (
                            <p className="text-sm text-red-700">
                              <strong>Observações:</strong> {pergunta.observacoes}
                            </p>
                          )}
                        </div>
                      )}
                      
                      {pergunta.status === 'nao_verificado' && (
                        <div className="flex items-center gap-2 text-gray-500">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">Aguardando verificação</span>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
            
            {/* Botões de navegação e salvamento */}
            <div className="flex justify-between">
              <Button 
                variant="outline"
                onClick={() => setEtapaAtual(2)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={salvarVerificacao}
                  disabled={isSaving}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? 'Salvando...' : 'Salvar Progresso'}
                </Button>
                
                {stats.naoVerificados === 0 && (
                  <Button 
                    onClick={handleSubmit(onSubmit)}
                    disabled={isSaving}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <ClipboardCheck className="mr-2 h-4 w-4" />
                    Finalizar Verificação
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
        
        {/* Modal para não conformidades */}
        <Dialog open={modalNaoConforme.aberto} onOpenChange={(aberto) => setModalNaoConforme(prev => ({ ...prev, aberto }))}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Registrar Não Conformidade</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Membros Afetados</Label>
                <div className="space-y-2">
                  {membrosEquipeSelecionada.map((membro) => (
                    <div key={membro} className="flex items-center space-x-2">
                      <Checkbox
                        id={membro}
                        checked={membrosAfetados.includes(membro)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setMembrosAfetados(prev => [...prev, membro]);
                          } else {
                            setMembrosAfetados(prev => prev.filter(m => m !== membro));
                          }
                        }}
                      />
                      <Label htmlFor={membro}>{membro}</Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações (opcional)</Label>
                <Textarea
                  id="observacoes"
                  placeholder="Descreva detalhes da não conformidade..."
                  value={observacoesModal}
                  onChange={(e) => setObservacoesModal(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Sugestões de Ações Corretivas</Label>
                <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-700">
                  • Substituir equipamento danificado<br/>
                  • Realizar limpeza adequada<br/>
                  • Verificar validade dos EPIs<br/>
                  • Solicitar manutenção preventiva
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setModalNaoConforme(prev => ({ ...prev, aberto: false }))}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={confirmarNaoConformidade}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Confirmar Não Conformidade
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Histórico de Verificações */}
        {historicoVerificacoes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Histórico de Verificações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {historicoVerificacoes.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 flex justify-between items-center">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.data_verificacao}</span>
                        <Badge variant={item.status === 'concluida' ? 'default' : 'secondary'}>
                          {item.status === 'concluida' ? 'Concluída' : 'Em Andamento'}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        {item.local} • Equipe {item.equipe} • {item.responsavel}
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="text-lg font-semibold text-blue-600">
                        {item.percentual_conformidade.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.total_conformes}C / {item.total_nao_conformes}NC
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TPVerificacaoForm;
