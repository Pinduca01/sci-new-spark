import { supabase } from '@/integrations/supabase/client';

interface RealTemplateItem {
  id: string;
  nome: string;
  categoria?: string;
  tipo?: 'verificacao' | 'contagem' | 'medida';
  obrigatorio?: boolean;
  unidade?: string;
  ordem?: number;
}

interface RealChecklistTemplate {
  id: string;
  nome: string;
  tipo_viatura: string;
  categoria?: string;
  itens: RealTemplateItem[];
  ativo?: boolean;
}

// Constrói um template real a partir das tabelas de equipamentos e agentes extintores.
// Fiel ao fluxo conversado: inclui seções de verificação externa/interna e de equipamentos
// com base em dados reais das tabelas `equipamentos_estoque` e `agentes_extintores`.
export async function buildRealTemplateForViatura(viaturaId: string, tipoChecklist: 'BA-MC' | 'BA-2'): Promise<RealChecklistTemplate> {
  // 1) Carregar equipamentos vinculados à viatura
  const { data: equipamentos } = await supabase
    .from('equipamentos_estoque')
    .select(`
      id,
      codigo_equipamento,
      numero_serie,
      status,
      materiais:material_id (nome, categoria, unidade_medida)
    `)
    .eq('viatura_id', viaturaId);

  // 2) Carregar agentes extintores (controle ou geral)
  // Primeiro tentamos uma tabela de controle por viatura, se existir
  let agentes: any[] = [];
  const { data: agentesControle, error: agentesControleError } = await supabase
    .from('agentes_extintores_controle')
    .select('*')
    .eq('viatura_id', viaturaId);

  if (!agentesControleError && Array.isArray(agentesControle) && agentesControle.length > 0) {
    agentes = agentesControle;
  } else {
    // Fallback para a tabela geral de agentes, sem vínculo de viatura
    const { data: agentesGerais } = await supabase
      .from('agentes_extintores')
      .select('*')
      .order('created_at', { ascending: false });
    agentes = agentesGerais || [];
  }

  // 3) Seções fixas de verificação externa e interna, fiéis ao que discutimos
  const secoesFixas = [
    {
      categoria: 'CHECK EXTERNO',
      itens: [
        'NÍVEL DO LIQUIDO DE ARREFECIMENTO',
        'NÍVEL ÓLEO DE MOTOR',
        'VAZAMENTOS EM GERAL',
      ],
    },
    {
      categoria: 'CHECK INTERNO',
      itens: [
        'Luzes e sirene',
        'Painel sem alertas',
        'Velocímetro funcionando',
      ],
    },
  ];

  let idx = 1;
  const itensFixos: RealTemplateItem[] = secoesFixas.flatMap((sec) =>
    sec.itens.map((nome) => ({
      id: `${sec.categoria.toLowerCase().split(' ')[0]}_${idx++}`,
      nome,
      categoria: sec.categoria,
      tipo: 'verificacao',
      obrigatorio: true,
      ordem: idx,
    }))
  );

  // 4) Seção de equipamentos, usando dados reais da viatura
  const itensEquipamentos: RealTemplateItem[] = (equipamentos || []).map((eq, i) => ({
    id: `equip_${eq.id}`,
    nome: eq?.materiais?.nome ? `${eq.materiais.nome} (${eq.codigo_equipamento})` : eq.codigo_equipamento,
    categoria: 'EQUIPAMENTOS',
    tipo: 'verificacao',
    obrigatorio: true,
    unidade: eq?.materiais?.unidade_medida,
    ordem: 100 + i,
  }));

  // 5) Seção de agentes extintores
  const itensAgentes: RealTemplateItem[] = (agentes || []).map((ag, i) => ({
    id: `agent_${ag.id}`,
    nome: ag.tipo_agente ? `${ag.tipo_agente} - Lote ${ag.lote || 'N/A'}` : `${ag.tipo || 'AGENTE'} - Lote ${ag.lote || 'N/A'}`,
    categoria: 'AGENTES EXTINTORES',
    tipo: 'contagem',
    obrigatorio: true,
    unidade: ag.unidade || 'un',
    ordem: 200 + i,
  }));

  const itens = [
    ...itensFixos,
    ...itensEquipamentos,
    ...itensAgentes,
  ];

  return {
    id: `real_${viaturaId}_${tipoChecklist}`,
    nome: `Checklist ${tipoChecklist} (Template Real)`,
    tipo_viatura: tipoChecklist,
    itens,
    ativo: true,
  };
}

// Constrói um template específico de equipamento a partir das duas tabelas para uso rápido.
export async function buildRealTemplateForEquipamento(equipamentoId: string): Promise<RealChecklistTemplate | null> {
  // Buscar equipamento
  const { data: equipamento } = await supabase
    .from('equipamentos_estoque')
    .select(`
      id,
      codigo_equipamento,
      numero_serie,
      status,
      materiais:material_id (nome, categoria, unidade_medida),
      viaturas:viatura_id (id, prefixo, tipo)
    `)
    .eq('id', equipamentoId)
    .single();

  if (!equipamento) return null;

  const baseNome = equipamento?.materiais?.nome || equipamento.codigo_equipamento;

  const itens: RealTemplateItem[] = [
    { id: `equip_${equipamento.id}_condicao`, nome: 'Condição geral do equipamento', categoria: 'EQUIPAMENTO', tipo: 'verificacao', obrigatorio: true, ordem: 1 },
    { id: `equip_${equipamento.id}_quantidade`, nome: 'Quantidade disponível', categoria: 'EQUIPAMENTO', tipo: 'contagem', obrigatorio: true, unidade: equipamento?.materiais?.unidade_medida || 'un', ordem: 2 },
    { id: `equip_${equipamento.id}_serie`, nome: `Número de série (${equipamento.numero_serie || 'N/A'})`, categoria: 'EQUIPAMENTO', tipo: 'verificacao', obrigatorio: false, ordem: 3 },
  ];

  return {
    id: `equip_${equipamento.id}_template_real`,
    nome: `Checklist - ${baseNome}`,
    tipo_viatura: equipamento?.viaturas?.tipo || 'GERAL',
    categoria: 'EQUIPAMENTO',
    itens,
    ativo: true,
  };
}