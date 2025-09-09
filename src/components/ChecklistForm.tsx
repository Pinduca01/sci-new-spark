import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, Camera } from "lucide-react";
import { NaoConformidadeModal } from './NaoConformidadeModal';
import { useNaoConformidades } from '@/hooks/useNaoConformidades';

interface ChecklistItem {
  id: string;
  nome: string;
  status: 'conforme' | 'nao_conforme' | 'nao_aplicavel' | 'nao_existente' | '';
  justificativa: string;
  foto: string;
  naoConformidade?: {
    descricao: string;
    imagens: File[];
  };
}

interface Bombeiro {
  id: string;
  nome: string;
  equipe: string;
}

interface ChecklistFormProps {
  tipo: 'BA-MC' | 'BA-2';
  viaturaId: string;
  viaturaPrefixo: string;
  onClose: () => void;
  onSave: () => void;
}

const checklistItemsBA2 = [
  { id: '1', nome: 'Mochila de emergência completa' },
  { id: '2', nome: 'Oxímetro funcionando' },
  { id: '3', nome: 'Glicosímetro e fitas' },
  { id: '4', nome: 'Medicações básicas' },
  { id: '5', nome: 'Material para curativos' },
  { id: '6', nome: 'Equipamentos de proteção individual' },
  { id: '7', nome: 'Prancha rígida' },
  { id: '8', nome: 'Colar cervical (vários tamanhos)' },
  { id: '9', nome: 'Maca dobrável' },
  { id: '10', nome: 'Cilindro de oxigênio (carga completa)' },
];

// Novo checklist BA-MC organizado por seções
const checklistSections = {
  'check_externo': {
    title: 'CHECK EXTERNO',
    items: [
      { id: 'ext_1', nome: 'NÍVEL DO LIQUIDO DE ARREFECIMENTO' },
      { id: 'ext_2', nome: 'NÍVEL LIQUIDO DE ARREFECIMENTO DO MOTOR ESTACIONÁRIO' },
      { id: 'ext_3', nome: 'ÓLEO DA DIREÇÃO HIDRÁULICA' },
      { id: 'ext_4', nome: 'NÍVEL ÓLEO DE MOTOR' },
      { id: 'ext_5', nome: 'NÍVEL ÓLEO DO MOTOR ESTACIONÁRIO' },
      { id: 'ext_6', nome: 'VAZAMENTOS EM GERAL' },
      { id: 'ext_7', nome: 'NÍVEL ÓLEO BOMBA INCÊNDIO' },
      { id: 'ext_8', nome: 'NÍVEL DA BOMBA DE ESCORVA' },
      { id: 'ext_9', nome: 'NÍVEL DA ÁGUA LIMPADOR PARABRISA' },
      { id: 'ext_10', nome: 'FILTRO DE AR DO MOTOR' },
      { id: 'ext_11', nome: 'FREIO ESTACIONÁRIO' },
      { id: 'ext_12', nome: 'SISTEMA DE FRENAGEM' },
      { id: 'ext_13', nome: 'SISTEMA SUSPENSÃO' },
      { id: 'ext_14', nome: 'CHAVE DE EMERGENCIA' },
      { id: 'ext_15', nome: 'SILENCIOSO/ESCAPAMENTO' },
      { id: 'ext_16', nome: 'DRENOS E REGISTROS' },
      { id: 'ext_17', nome: 'FILTRO DE AR' },
      { id: 'ext_18', nome: 'BATERIA /POLOS E TERMINAIS' },
      { id: 'ext_19', nome: 'CONDIÇÃO GERAL DOS PNEUS' },
      { id: 'ext_20', nome: 'LATARIA E PINTURA' }
    ]
  },
  'cabine': {
    title: 'CABINE',
    items: [
      { id: 'cab_1', nome: 'IGNIÇÃO/PARTIDA' },
      { id: 'cab_2', nome: 'COMBUSTIVÉL' },
      { id: 'cab_3', nome: 'BANCOS' },
      { id: 'cab_4', nome: 'NÍVEL DO ADITIVO ARLA 32 (PAINEL)' },
      { id: 'cab_5', nome: 'COMANDOS DO PAINEL' },
      { id: 'cab_6', nome: 'RÁDIO' },
      { id: 'cab_7', nome: 'CARTÃO DE ABASTECIMENTO' },
      { id: 'cab_8', nome: 'TEMPERATURA DO MOTOR' },
      { id: 'cab_9', nome: 'PRESSÃO SISTEMA DE AR' },
      { id: 'cab_10', nome: 'PRESSÃO DO ÓLEO DO MOTOR' },
      { id: 'cab_11', nome: 'GPS' },
      { id: 'cab_12', nome: 'INCLINÔMETRO' },
      { id: 'cab_13', nome: 'CONTROLE REMOTO DOS FARÓIS DE BUSCA DIANTEIRO' },
      { id: 'cab_14', nome: 'SUSPÉNSÃO' },
      { id: 'cab_15', nome: 'EXTINTOR' },
      { id: 'cab_16', nome: 'MACACO E ACESSÓRIOS' },
      { id: 'cab_17', nome: 'BOLSA DE FERRAMENTAS' }
    ]
  },
  'eletrica': {
    title: 'ELÉTRICA',
    items: [
      { id: 'ele_1', nome: 'FAROL ALTO/BAIXO' },
      { id: 'ele_2', nome: 'LUZ DE NEBLINA DIANTEIRA E TRASEIRA' },
      { id: 'ele_3', nome: 'LUZ DE POSIÇÃO DIREITA E ESQUERDA' },
      { id: 'ele_4', nome: 'PISCA ALERTA' },
      { id: 'ele_5', nome: 'LUZES DE PERÍMETRO' },
      { id: 'ele_6', nome: 'LUZ DE ADVERTÊNCIA PARA TRÁFEGO AÉREO' },
      { id: 'ele_7', nome: 'FAROL DE BUSCA DIANTERIA E TRASEIRA' },
      { id: 'ele_8', nome: 'LUZ DE MARCHA A RÉ' },
      { id: 'ele_9', nome: 'GIROFLEX' },
      { id: 'ele_10', nome: 'SIRENE' },
      { id: 'ele_11', nome: 'VENTILADOR/VENTOINHA' },
      { id: 'ele_12', nome: 'LIMPADOR DE PARA-BRISA' },
      { id: 'ele_13', nome: 'AR CONDICIONADO' },
      { id: 'ele_14', nome: 'ILUMINAÇÃO DO CANHÃO DE TETO' },
      { id: 'ele_15', nome: 'ILUMINAÇÃO DOS COMPARTIMENTOS' },
      { id: 'ele_16', nome: 'LUZES DE TRABALHO DO TETO' },
      { id: 'ele_17', nome: 'RETROVISORES' },
      { id: 'ele_18', nome: 'RETROVISORES ELÉTRICOS' },
      { id: 'ele_19', nome: 'VIDROS ELÉTRICOS' }
    ]
  },
  'sistema_incendio': {
    title: 'SISTEMA CONTRA INCÊNDIO',
    items: [
      { id: 'inc_1', nome: 'NÍVEL DE LGE' },
      { id: 'inc_2', nome: 'NÍVEL DE ÁGUA' },
      { id: 'inc_3', nome: 'NÍVEL DO PQS' },
      { id: 'inc_4', nome: 'BOMBA CONTRA INCENDIO' },
      { id: 'inc_5', nome: 'BOMBA DE ESCORVA' },
      { id: 'inc_6', nome: 'BOMBA MANUAL PNEUMATICA' },
      { id: 'inc_7', nome: 'VALVULAS PNEUMATICAS' },
      { id: 'inc_8', nome: 'CANHAO MONITOR (TETO)' },
      { id: 'inc_9', nome: 'CANHAO DE PARA CHOQUE' },
      { id: 'inc_10', nome: 'ASPERSORES' },
      { id: 'inc_11', nome: 'SISTEMA PO QUIMICO' },
      { id: 'inc_12', nome: 'NITROGENIO' },
      { id: 'inc_13', nome: 'PAINEL DA BOMBA' },
      { id: 'inc_14', nome: 'PAINEL DOS INSTRUMENTOS' },
      { id: 'inc_15', nome: 'BOTAO DE EMERGENCIA DO CANHAO DE TETO' },
      { id: 'inc_16', nome: 'BOTAO DE EMERGENCIA DO CANHAO DE PARA CHOQUE' },
      { id: 'inc_17', nome: 'BOTAO DE EMERGENCIA DA BOMBA MANUAL PNEUMATICA' },
      { id: 'inc_18', nome: 'MANGOTINHO E PISTOLA PQ' },
      { id: 'inc_19', nome: 'ESTRUTURA TANQUE DE AGUA' },
      { id: 'inc_20', nome: 'ESTRUTURA TANQUE DE LGE' },
      { id: 'inc_21', nome: 'ESTRUTURA RESERVATORIO DE PO QUIMICO' },
      { id: 'inc_22', nome: 'BOCAL PARA SUCCAO' },
      { id: 'inc_23', nome: 'CONEXAO DO HIDRANTE' },
      { id: 'inc_24', nome: 'VAZAMENTOS DIVERSOS' },
      { id: 'inc_25', nome: 'CONECTOR DE ALIMENTACAO' },
      { id: 'inc_26', nome: 'GUINCHO' },
      { id: 'inc_27', nome: 'RETROVISORES' },
      { id: 'inc_28', nome: 'MAÇANETA DAS PORTAS' },
      { id: 'inc_29', nome: 'PORTAS DOS COMPARTIMENTOS' },
      { id: 'inc_30', nome: 'ESCADA TRASEIRA' },
      { id: 'inc_31', nome: 'UNIDADE DE PARTIDA RAPIDA' },
      { id: 'inc_32', nome: 'RALO P/SUCCAO' },
      { id: 'inc_33', nome: 'GANCHO DIANTEIRO PARA REBOQUE' },
      { id: 'inc_34', nome: 'GANCHO TRASEIRO PARA REBOQUE' }
    ]
  },
  'parte_superior': {
    title: 'PARTE SUPERIOR',
    items: [
      { id: 'sup_1', nome: 'TANQUE DE AGUA' },
      { id: 'sup_2', nome: 'TANQUE DE LGE' },
      { id: 'sup_3', nome: 'ANTENA DO RADIO' },
      { id: 'sup_4', nome: 'TAMPA DO ABASTECIMENTO DE AGUA' },
      { id: 'sup_5', nome: 'TAMPA DO ABASTECIMENTO DE LGE' },
      { id: 'sup_6', nome: 'TRAVA DE SEGURANCA DE SOBRE PRESSAO DO TANQUE DE AGUA' },
      { id: 'sup_7', nome: 'ANTENA (DEVS) SISTEMA DE VISAO OLHO DE AGUIA' },
      { id: 'sup_8', nome: 'SISTEMA DE ARMAZENAMENTO DE AQUISICAO E MONITORAMENTO DE DADOS (MADASS)' },
      { id: 'sup_9', nome: 'ESCOTILHA DA CABINE' }
    ]
  }
};

const equipes = ['Alfa', 'Bravo', 'Charlie', 'Delta'];

export const ChecklistForm = ({ tipo, viaturaId, viaturaPrefixo, onClose, onSave }: ChecklistFormProps) => {
  const [loading, setLoading] = useState(false);
  const [bombeiro, setBombeiro] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [equipe, setEquipe] = useState('');
  const [bombeiros, setBombeiros] = useState<Bombeiro[]>([]);
  const [loadingBombeiros, setLoadingBombeiros] = useState(true);
  
  // Hook para gerenciar não conformidades
  const { salvarNaoConformidadeComImagem, uploading, saving } = useNaoConformidades();
  
  // Estados para o modal de não conformidade
  const [modalNaoConformidade, setModalNaoConformidade] = useState<{
    isOpen: boolean;
    itemId: string;
    itemNome: string;
  }>({ isOpen: false, itemId: '', itemNome: '' });

  // Inicializar itens baseado no tipo
  const getInitialItems = () => {
    if (tipo === 'BA-2') {
      return checklistItemsBA2.map(item => ({
        ...item,
        status: '' as ChecklistItem['status'],
        justificativa: '',
        foto: ''
      }));
    } else {
      // BA-MC: combinar todos os itens das seções
      const allItems: ChecklistItem[] = [];
      Object.values(checklistSections).forEach(section => {
        section.items.forEach(item => {
          allItems.push({
            ...item,
            status: '' as ChecklistItem['status'],
            justificativa: '',
            foto: ''
          });
        });
      });
      return allItems;
    }
  };

  const [itens, setItens] = useState<ChecklistItem[]>(getInitialItems());

  // Buscar bombeiros do Supabase
  useEffect(() => {
    const fetchBombeiros = async () => {
      try {
        const { data: bombeirosData, error } = await supabase
          .from('bombeiros')
          .select('id, nome, equipe')
          .eq('status', 'ativo')
          .order('nome');

        if (error) throw error;
        setBombeiros(bombeirosData || []);
      } catch (error) {
        console.error('Erro ao buscar bombeiros:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar a lista de bombeiros",
          variant: "destructive",
        });
      } finally {
        setLoadingBombeiros(false);
      }
    };

    fetchBombeiros();
  }, []);

  const handleStatusChange = (itemId: string, status: ChecklistItem['status']) => {
    setItens(prev => prev.map(item => {
      if (item.id === itemId) {
        const updatedItem = { ...item, status };
        
        // Se o status for 'nao_conforme', abrir o modal
        if (status === 'nao_conforme') {
          setModalNaoConformidade({
            isOpen: true,
            itemId: itemId,
            itemNome: item.nome
          });
        } else {
          // Se mudou para outro status, limpar dados de não conformidade
          delete updatedItem.naoConformidade;
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const handleNaoConformidadeSave = (data: { descricao: string; imagens: File[] }) => {
    setItens(prev => prev.map(item => {
      if (item.id === modalNaoConformidade.itemId) {
        return {
          ...item,
          naoConformidade: data
        };
      }
      return item;
    }));
    setModalNaoConformidade({ isOpen: false, itemId: '', itemNome: '' });
  };

  const handleNaoConformidadeClose = () => {
    // Se o modal foi fechado sem salvar, reverter o status para vazio
    setItens(prev => prev.map(item => {
      if (item.id === modalNaoConformidade.itemId && item.status === 'nao_conforme' && !item.naoConformidade) {
        return { ...item, status: '' };
      }
      return item;
    }));
    
    setModalNaoConformidade({ isOpen: false, itemId: '', itemNome: '' });
  };

  const handleJustificativaChange = (itemId: string, justificativa: string) => {
    setItens(prev => prev.map(item => 
      item.id === itemId ? { ...item, justificativa } : item
    ));
  };



  const handleSubmit = async () => {
    // Validações
    if (!data) {
      toast({
        title: "Erro",
        description: "Por favor, selecione a data do checklist",
        variant: "destructive",
      });
      return;
    }

    if (!bombeiro) {
      toast({
        title: "Erro",
        description: "Por favor, selecione o bombeiro responsável",
        variant: "destructive",
      });
      return;
    }

    if (!equipe) {
      toast({
        title: "Erro",
        description: "Por favor, selecione a equipe",
        variant: "destructive",
      });
      return;
    }

    const itensNaoPreenchidos = itens.filter(item => item.status === '');
    if (itensNaoPreenchidos.length > 0) {
      toast({
        title: "Erro",
        description: `Existem ${itensNaoPreenchidos.length} itens não preenchidos`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const checklistData = {
        viatura_id: viaturaId,
        tipo_checklist: tipo,
        data_checklist: data,
        bombeiro_responsavel: bombeiro,
        observacoes_gerais: observacoes,
        itens_checklist: itens
      };

      // Gerar timestamp de conclusão
      const timestampConclusao = new Date().toISOString();
      
      // Validar se o timestamp foi gerado corretamente
      if (!timestampConclusao) {
        throw new Error('Erro ao gerar timestamp de conclusão');
      }

      // Salvar o checklist primeiro
      const { data: checklistResult, error } = await supabase
        .from('checklists_viaturas')
        .insert({
          viatura_id: checklistData.viatura_id,
          tipo_checklist: checklistData.tipo_checklist,
          data_checklist: checklistData.data_checklist,
          bombeiro_responsavel: checklistData.bombeiro_responsavel,
          observacoes_gerais: checklistData.observacoes_gerais,
          itens_checklist: checklistData.itens_checklist as unknown as Json,
          timestamp_conclusao: timestampConclusao
        })
        .select('id')
        .single();

      if (error) throw error;
      
      // Validar se o checklist foi salvo com sucesso e possui ID
      if (!checklistResult?.id) {
        throw new Error('Erro ao salvar checklist - ID não retornado');
      }

      const checklistId = checklistResult.id;

      // Salvar não conformidades se existirem
      const itensNaoConformes = itens.filter(item => 
        item.status === 'nao_conforme' && item.naoConformidade
      );

      if (itensNaoConformes.length > 0) {
        for (const item of itensNaoConformes) {
          if (item.naoConformidade) {
            // Determinar a seção do item
            let secao = 'Geral';
            if (tipo === 'BA-MC') {
              for (const [sectionKey, section] of Object.entries(checklistSections)) {
                if (section.items.some(sectionItem => sectionItem.id === item.id)) {
                  secao = section.title;
                  break;
                }
              }
            }

            // Preparar dados da não conformidade
            const naoConformidadeData = {
              checklist_id: checklistId,
              item_id: item.id,
              item_nome: item.nome,
              secao: secao,
              descricao: item.naoConformidade.descricao,
              bombeiro_responsavel: bombeiro,
              data_registro: new Date().toISOString()
            };

            // Salvar não conformidade com imagem (se houver)
            const primeiraImagem = item.naoConformidade.imagens[0];
            await salvarNaoConformidadeComImagem(naoConformidadeData, primeiraImagem);
          }
        }
      }

      toast({
        title: "Sucesso",
        description: "Checklist salvo com sucesso!",
      });
      
      onSave();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar checklist:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar checklist",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderChecklistBA2 = () => (
    <div className="space-y-4">
      {itens.map((item) => (
        <Card key={item.id} className="p-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">{item.nome}</span>
            <div className="flex items-center space-x-4">
              <RadioGroup
                value={item.status}
                onValueChange={(value) => handleStatusChange(item.id, value as ChecklistItem['status'])}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="conforme" id={`${item.id}-conforme`} />
                  <Label htmlFor={`${item.id}-conforme`} className="text-green-600">Conforme</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="nao_conforme" id={`${item.id}-nao-conforme`} />
                  <Label htmlFor={`${item.id}-nao-conforme`} className="text-red-600">Não Conforme</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="nao_aplicavel" id={`${item.id}-nao-aplicavel`} />
                  <Label htmlFor={`${item.id}-nao-aplicavel`} className="text-gray-600">Não Aplicável</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="nao_existente" id={`${item.id}-nao-existente`} />
                  <Label htmlFor={`${item.id}-nao-existente`} className="text-gray-600">Não Existente</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          
          {(item.status === 'nao_conforme' || item.status === 'nao_aplicavel') && (
            <div className="mt-4">
              <Label htmlFor={`justificativa-${item.id}`}>Justificativa</Label>
              <Textarea
                id={`justificativa-${item.id}`}
                value={item.justificativa}
                onChange={(e) => handleJustificativaChange(item.id, e.target.value)}
                placeholder="Descreva a justificativa..."
                className="mt-2"
              />
            </div>
          )}
          
          {item.naoConformidade && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-sm font-medium text-red-800">Não Conformidade Registrada:</p>
              <p className="text-sm text-red-700 mt-1">{item.naoConformidade.descricao}</p>
              {item.naoConformidade.imagens.length > 0 && (
                <p className="text-xs text-red-600 mt-1">
                  {item.naoConformidade.imagens.length} imagem(ns) anexada(s)
                </p>
              )}
            </div>
          )}
        </Card>
      ))}
    </div>
  );

  const renderChecklistBAMC = () => (
    <div className="space-y-6">
      {Object.entries(checklistSections).map(([sectionKey, section]) => {
        const sectionItems = itens.filter(item => 
          section.items.some(sectionItem => sectionItem.id === item.id)
        );
        
        return (
          <Card key={sectionKey} className="p-4">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-blue-800">
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {sectionItems.map((item) => (
                <div key={item.id} className="border-b pb-4 last:border-b-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{item.nome}</span>
                  </div>
                  
                  <RadioGroup
                    value={item.status}
                    onValueChange={(value) => handleStatusChange(item.id, value as ChecklistItem['status'])}
                    className="flex flex-wrap gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="conforme" id={`${item.id}-conforme`} />
                      <Label htmlFor={`${item.id}-conforme`} className="text-green-600 text-sm">Conforme</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="nao_conforme" id={`${item.id}-nao-conforme`} />
                      <Label htmlFor={`${item.id}-nao-conforme`} className="text-red-600 text-sm">Não Conforme</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="nao_aplicavel" id={`${item.id}-nao-aplicavel`} />
                      <Label htmlFor={`${item.id}-nao-aplicavel`} className="text-gray-600 text-sm">Não Aplicável</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="nao_existente" id={`${item.id}-nao-existente`} />
                      <Label htmlFor={`${item.id}-nao-existente`} className="text-gray-600 text-sm">Não Existente</Label>
                    </div>
                  </RadioGroup>
                  
                  {(item.status === 'nao_conforme' || item.status === 'nao_aplicavel') && (
                    <div className="mt-3">
                      <Label htmlFor={`justificativa-${item.id}`} className="text-sm">Justificativa</Label>
                      <Textarea
                        id={`justificativa-${item.id}`}
                        value={item.justificativa}
                        onChange={(e) => handleJustificativaChange(item.id, e.target.value)}
                        placeholder="Descreva a justificativa..."
                        className="mt-1 text-sm"
                        rows={2}
                      />
                    </div>
                  )}
                  
                  {item.naoConformidade && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                      <p className="text-sm font-medium text-red-800">Não Conformidade Registrada:</p>
                      <p className="text-sm text-red-700 mt-1">{item.naoConformidade.descricao}</p>
                      {item.naoConformidade.imagens.length > 0 && (
                        <p className="text-xs text-red-600 mt-1">
                          {item.naoConformidade.imagens.length} imagem(ns) anexada(s)
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Checklist {tipo} - {viaturaPrefixo}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Campos do cabeçalho */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <Label htmlFor="data">Data *</Label>
                <Input
                  id="data"
                  type="date"
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="bombeiro">Nome do Bombeiro *</Label>
                {loadingBombeiros ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Carregando...</span>
                  </div>
                ) : (
                  <Select value={bombeiro} onValueChange={setBombeiro}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o bombeiro" />
                    </SelectTrigger>
                    <SelectContent>
                      {bombeiros.map((b) => (
                        <SelectItem key={b.id} value={b.nome}>
                          {b.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              
              <div>
                <Label htmlFor="equipe">Equipe *</Label>
                <Select value={equipe} onValueChange={setEquipe}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a equipe" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipes.map((eq) => (
                      <SelectItem key={eq} value={eq}>
                        {eq}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Renderizar checklist baseado no tipo */}
            {tipo === 'BA-2' ? renderChecklistBA2() : renderChecklistBAMC()}

            {/* Campo de observações */}
            <div>
              <Label htmlFor="observacoes">Observações Gerais</Label>
              <Textarea
                id="observacoes"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                placeholder="Observações adicionais sobre o checklist..."
                rows={3}
              />
            </div>



            {/* Botões */}
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                type="button" 
                onClick={handleSubmit} 
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Checklist
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Não Conformidade */}
      <NaoConformidadeModal
        isOpen={modalNaoConformidade.isOpen}
        onClose={handleNaoConformidadeClose}
        onSave={handleNaoConformidadeSave}
        itemNome={modalNaoConformidade.itemNome}
        descricaoInicial={itens.find(item => item.id === modalNaoConformidade.itemId)?.naoConformidade?.descricao}
        imagensIniciais={itens.find(item => item.id === modalNaoConformidade.itemId)?.naoConformidade?.imagens}
      />
    </>
  );
};