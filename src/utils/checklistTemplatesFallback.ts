// Fallback simples para quando não houver template ativo no banco
export function buildFallbackTemplateForViatura(tipo: string) {
  const sections = [
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
    {
      categoria: 'EQUIPAMENTOS',
      itens: [
        'Kit primeiros socorros',
        'Extintor a bordo',
        'Rádio de comunicação',
      ],
    },
  ];

  let idx = 1;
  const itens = sections.flatMap((sec) =>
    sec.itens.map((nome) => ({
      id: `${sec.categoria.toLowerCase().split(' ')[0]}_${idx++}`,
      nome,
      categoria: sec.categoria,
    }))
  );

  return {
    id: `fallback_${tipo}`,
    nome: 'Checklist BA-MC (Fallback)',
    tipo_viatura: tipo,
    itens,
  };
}