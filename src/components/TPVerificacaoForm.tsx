import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateTPVerificacao, type TPVerificacao } from "@/hooks/useTPVerificacoes";
import { useBombeiros } from "@/hooks/useBombeiros";
import { useEquipes } from "@/hooks/useEquipes";
import { AssinaturaDigital } from "@/components/AssinaturaDigital";
import { useToast } from "@/hooks/use-toast";



type FormData = {
  // Cabeçalho do formulário
  data_verificacao: string;
  local_contrato: string;
  ba_ce_id: string;
  ba_ce_nome: string;
  equipe_id: string;
  responsavel_id: string;
  responsavel_nome: string;
  
  // Integrantes da equipe (12 campos uniformes)
  integrante_1_id?: string;
  integrante_2_id?: string;
  integrante_3_id?: string;
  integrante_4_id?: string;
  integrante_5_id?: string;
  integrante_6_id?: string;
  integrante_7_id?: string;
  integrante_8_id?: string;
  integrante_9_id?: string;
  integrante_10_id?: string;
  integrante_11_id?: string;
  integrante_12_id?: string;
  
  // Checklist de verificação (8 itens das imagens)
  item1_conforme: "S" | "N"; // As vestimentas possuem algum tipo de dano?
  item1_observacoes?: string;
  
  item2_conforme: "S" | "N"; // Existem vestimentas nos moldes dos pontos de verificação?
  item2_observacoes?: string;
  
  item3_conforme: "S" | "N"; // Os capacetes possuem avarias de qualquer natureza?
  item3_observacoes?: string;
  
  item4_conforme: "S" | "N"; // As botas apresentam algum tipo de alteração?
  item4_observacoes?: string;
  
  item5_conforme: "S" | "N"; // As luvas apresentam algum tipo de alteração?
  item5_observacoes?: string;
  
  item6_conforme: "S" | "N"; // As botas apresentam algum tipo de alteração?
  item6_observacoes?: string;
  
  item7_conforme: "S" | "N"; // As luvas apresentam algum tipo de alteração?
  item7_observacoes?: string;
  
  item8_conforme: "S" | "N"; // Os botas dos vestimentas estão funcionando?
  item8_observacoes?: string;
};

const TPVerificacaoForm = () => {
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<FormData>();
  const createVerificacao = useCreateTPVerificacao();
  const { bombeiros = [] } = useBombeiros();
  const { data: equipes = [] } = useEquipes();
  const { toast } = useToast();
  const [checklistItems, setChecklistItems] = useState({
    item1: "S" as "S" | "N",
    item2: "S" as "S" | "N",
    item3: "S" as "S" | "N",
    item4: "S" as "S" | "N",
    item5: "S" as "S" | "N",
    item6: "S" as "S" | "N",
    item7: "S" as "S" | "N",
    item8: "S" as "S" | "N"
  });
  
  // Estados para assinatura digital
  const [assinatura, setAssinatura] = useState<{
    documentoId: string;
    linkAssinatura: string;
    status: string;
    assinaturaBase64?: string;
  } | null>(null);
  const [documentoEnviado, setDocumentoEnviado] = useState(false);
  const [statusAssinatura, setStatusAssinatura] = useState<'rascunho' | 'enviado' | 'assinado'>('rascunho');

  // Rastrear bombeiros selecionados nos campos de integrantes
  const integrantesSelecionados = {
    integrante_1_id: watch('integrante_1_id'),
    integrante_2_id: watch('integrante_2_id'),
    integrante_3_id: watch('integrante_3_id'),
    integrante_4_id: watch('integrante_4_id'),
    integrante_5_id: watch('integrante_5_id'),
    integrante_6_id: watch('integrante_6_id'),
    integrante_7_id: watch('integrante_7_id'),
    integrante_8_id: watch('integrante_8_id'),
    integrante_9_id: watch('integrante_9_id'),
    integrante_10_id: watch('integrante_10_id'),
    integrante_11_id: watch('integrante_11_id'),
    integrante_12_id: watch('integrante_12_id')
  };

  // Função para obter bombeiros disponíveis para um campo específico
  const getBombeirosDisponiveis = (campoAtual: string) => {
    const bombeirosSelecionados = Object.entries(integrantesSelecionados)
      .filter(([campo, valor]) => campo !== campoAtual && valor)
      .map(([_, valor]) => valor);
    
    return bombeiros.filter(bombeiro => !bombeirosSelecionados.includes(bombeiro.id));
  };
  


  const mesAtual = new Date().getMonth() + 1;
  const anoAtual = new Date().getFullYear();

  // Pré-preencher campos com valores padrão
  useEffect(() => {
    const hoje = new Date();
    const dataFormatada = hoje.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    setValue('data_verificacao', dataFormatada);
    setValue('local_contrato', 'Santa Genoveva - GYN'); // Valor padrão temporário
  }, [setValue]);

  // Observar mudanças na equipe selecionada para permitir seleção manual se necessário
  const equipeId = watch('equipe_id');



  const onSubmit = async (data: FormData) => {
    // Verificar se há assinatura
    if (!assinatura || assinatura.status !== 'assinado') {
      toast({
        title: "Assinatura obrigatória",
        description: "Por favor, aguarde a conclusão da assinatura digital antes de salvar.",
        variant: "destructive"
      });
      return;
    }

    // Validar se há observações para itens não conformes
    const nonConformItems = [];
    if (checklistItems.item1 === "N" && !data.item1_observacoes) nonConformItems.push("Item 1");
    if (checklistItems.item2 === "N" && !data.item2_observacoes) nonConformItems.push("Item 2");
    if (checklistItems.item3 === "N" && !data.item3_observacoes) nonConformItems.push("Item 3");
    if (checklistItems.item4 === "N" && !data.item4_observacoes) nonConformItems.push("Item 4");
    if (checklistItems.item5 === "N" && !data.item5_observacoes) nonConformItems.push("Item 5");
    if (checklistItems.item6 === "N" && !data.item6_observacoes) nonConformItems.push("Item 6");
    if (checklistItems.item7 === "N" && !data.item7_observacoes) nonConformItems.push("Item 7");
    if (checklistItems.item8 === "N" && !data.item8_observacoes) nonConformItems.push("Item 8");
    
    if (nonConformItems.length > 0) {
      toast({
        title: "Observações obrigatórias",
        description: `Observações são obrigatórias para itens não conformes: ${nonConformItems.join(", ")}`,
        variant: "destructive"
      });
      return;
    }

    try {
      // Contar itens conformes e não conformes
      const itensConformes = Object.values(checklistItems).filter(status => status === "S").length;
      const itensNaoConformes = Object.values(checklistItems).filter(status => status === "N").length;
      
      // Compilar observações
      const observacoes = [
        data.item1_observacoes && `Item 1: ${data.item1_observacoes}`,
        data.item2_observacoes && `Item 2: ${data.item2_observacoes}`,
        data.item3_observacoes && `Item 3: ${data.item3_observacoes}`,
        data.item4_observacoes && `Item 4: ${data.item4_observacoes}`,
        data.item5_observacoes && `Item 5: ${data.item5_observacoes}`,
        data.item6_observacoes && `Item 6: ${data.item6_observacoes}`,
        data.item7_observacoes && `Item 7: ${data.item7_observacoes}`,
        data.item8_observacoes && `Item 8: ${data.item8_observacoes}`
      ].filter(Boolean).join("\n");
      
      // Adaptar dados para o formato esperado pelo backend
      const adaptedData = {
        base: data.local_contrato,
        responsavel_id: data.responsavel_id,
        responsavel_nome: data.responsavel_nome,
        data_verificacao: data.data_verificacao,
        equipe_id: data.equipe_id,
        mes_referencia: mesAtual,
        ano_referencia: anoAtual,
        tp_conformes: itensConformes,
        tp_nao_conformes: itensNaoConformes,
        total_verificados: 8, // Total de itens verificados
        observacoes: `Verificação de ${data.data_verificacao}\n${observacoes}`,
        // Adicionar dados da assinatura
        documento_autentique_id: assinatura.documentoId,
        status_assinatura: assinatura.status,
        assinatura_data: new Date().toISOString(),
        assinatura_base64: assinatura.assinaturaBase64,
        documento_enviado: documentoEnviado
      };
      
      await createVerificacao.mutateAsync(adaptedData);
      reset();
      setChecklistItems({
        item1: "S",
        item2: "S",
        item3: "S",
        item4: "S",
        item5: "S",
        item6: "S",
        item7: "S",
        item8: "S"
      });
      
      // Reset assinatura
      setAssinatura(null);
      setDocumentoEnviado(false);
      setStatusAssinatura('rascunho');
      
      toast({
        title: "Verificação salva",
        description: "Verificação de TP salva com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao salvar verificação:", error);
      toast({
        title: "Erro ao salvar",
        description: "Erro ao salvar verificação. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  // Definir os itens do checklist conforme as imagens
  const checklistItemsData = [
    { id: 'item1', text: 'Todos os TPs estão com etiquetas legíveis?' },
    { id: 'item2', text: 'Todos os TPs estão com CA legível?' },
    { id: 'item3', text: 'Os capacetes possuem sinais de avarias, exposição a agentes térmicos, químicos, desgastes ou qualquer outro dano que possam comprometer a integridade física dos bombeiros?' },
    { id: 'item4', text: 'As vestimentas possuem sinais de avarias, deformidades, defeitos, gambiarras nos botões de pressão, no mosquetão, zíper e fecho de argolas e ganchos que possam comprometer a integridade física dos bombeiros?' },
    { id: 'item5', text: 'As vestimentas possuem rasgos, desgastes excessivos, manchas ou qualquer tipo de variação fora do usual?' },
    { id: 'item6', text: 'As faixas reflexivas das vestimentas estão danificadas, rasgadas ou perderam a refletividade?' },
    { id: 'item7', text: 'As vestimentas possuem sinais de avarias nos bolsos ou em qualquer dispositivo instalado nas mesmas?' },
    { id: 'item8', text: 'Os bolsos das vestimentas estão funcionando perfeitamente?' },
    { id: 'item9', text: 'As costuras possuem algum tipo de dano?' },
    { id: 'item10', text: 'Existem buracos, manchas, rasgos que possam comprometer a barreira de umidade das vestimentas?' },
    { id: 'item11', text: 'Existe resistência das malhas dos punhos das vestimentas? A elasticidade está dentro da normalidade? O sistema de encaixe do polegar, quando existente, está em perfeitas condições?' },
    { id: 'item12', text: 'Todas as costuras estão seladas e em perfeitas condições?' },
    { id: 'item13', text: 'As botas apresentam algum tipo de mudança de cor, rasgos, desgastes excessivos, manchas ou qualquer tipo de variação fora do usual?' },
    { id: 'item14', text: 'As botas apresentam algum tipo de alteração na sola ou qualquer outro dano, desgaste que interfira na performance do equipamento?' },
    { id: 'item15', text: 'As luvas apresentam algum tipo de mudança de cor, rasgos, desgastes excessivos, manchas ou qualquer tipo de variação que seja fora do usual?' },
    { id: 'item16', text: 'As luvas apresentam algum tipo de dano nas costuras ou qualquer desgaste que interfira na performance do equipamento?' },
    { id: 'item17', text: 'Os capuzes balaclavas apresentam algum tipo de mudança de cor, rasgos, desgastes excessivos, manchas ou qualquer tipo de variação fora do usual ou dano que interfira na performance do equipamento?' }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      {/* Cabeçalho */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-orange-600 mb-4">VERIFICAÇÃO DE TRAJES DE PROTEÇÃO - TP</h1>
        <div className="text-right text-sm mb-4">2024</div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Seção de Identificação */}
        <div className="border border-gray-400">
          <div className="bg-gray-100 p-2 text-center font-semibold border-b border-gray-400">
            REGISTRAR NOVA VERIFICAÇÃO
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div>
                <Label className="text-sm font-semibold">RESPONSÁVEL PELA VERIFICAÇÃO:</Label>
                <Select onValueChange={(value) => {
                  const bombeiro = bombeiros.find(b => b.id === value);
                  if (bombeiro) {
                    setValue("responsavel_nome", bombeiro.nome);
                    setValue("responsavel_id", bombeiro.id);
                    // Preencher automaticamente a equipe baseada no bombeiro selecionado
                    if (bombeiro.equipe_id) {
                      setValue("equipe_id", bombeiro.equipe_id);
                      
                      // Preencher automaticamente os integrantes da equipe
                      const bombeirosDaEquipe = bombeiros.filter(b => b.equipe_id === bombeiro.equipe_id);
                      
                      // Preencher os 12 campos uniformes com os bombeiros da equipe
                      bombeirosDaEquipe.slice(0, 12).forEach((bombeiroEquipe, index) => {
                        setValue(`integrante_${index + 1}_id` as keyof FormData, bombeiroEquipe.id);
                      });
                    }
                  }
                }}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {bombeiros.filter(bombeiro => bombeiro.funcao === 'BA-CE').map((bombeiro) => (
                      <SelectItem key={bombeiro.id} value={bombeiro.id}>
                        {bombeiro.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Label className="text-sm font-semibold">LOCAL/CONTRATO:</Label>
                <Input
                  className="mt-1"
                  {...register("local_contrato", { required: true })}
                  placeholder="Ex: SBSV - Salvador"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold">DATA:</Label>
                <Input
                  type="date"
                  className="mt-1"
                  {...register("data_verificacao", { required: true })}
                />
              </div>
            </div>
            
            {/* Seção de Equipe */}
            <div className="mb-4">
              <Label className="text-sm font-semibold">EQUIPE:</Label>
              <Select value={watch("equipe_id") || ""} onValueChange={(value) => setValue("equipe_id", value)}>
                <SelectTrigger className="mt-1 max-w-xs">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {equipes.filter(equipe => equipe.ativa).map((equipe) => (
                    <SelectItem key={equipe.id} value={equipe.id}>
                      {equipe.nome_equipe}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Seção de Integrantes da Equipe */}
            <div className="border-t pt-3">
              <Label className="text-sm font-semibold text-gray-700 mb-3 block">INTEGRANTES DA EQUIPE:</Label>
              
              {/* 12 Campos Uniformes de Integrantes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => {
                  const campoAtual = `integrante_${num}_id`;
                  const bombeirosDisponiveis = getBombeirosDisponiveis(campoAtual);
                  const valorAtual = watch(campoAtual as keyof FormData);
                  
                  return (
                    <div key={`integrante_${num}`}>
                      <Label className="text-xs font-medium text-gray-600">Integrante {num}:</Label>
                      <Select 
                        value={valorAtual || ""} 
                        onValueChange={(value) => {
                          if (value === "__clear__") {
                            setValue(`integrante_${num}_id` as keyof FormData, undefined);
                          } else {
                            setValue(`integrante_${num}_id` as keyof FormData, value);
                          }
                        }}
                      >
                        <SelectTrigger className="mt-1 h-8 text-xs">
                          <SelectValue placeholder="Selecionar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__clear__">-- Limpar seleção --</SelectItem>
                          {bombeirosDisponiveis.map((bombeiro) => (
                            <SelectItem key={bombeiro.id} value={bombeiro.id}>
                              {bombeiro.nome} - {bombeiro.funcao}
                            </SelectItem>
                          ))}
                          {/* Mostrar o bombeiro atualmente selecionado mesmo se já foi usado em outro campo */}
                          {valorAtual && !bombeirosDisponiveis.find(b => b.id === valorAtual) && (
                            (() => {
                              const bombeiroSelecionado = bombeiros.find(b => b.id === valorAtual);
                              return bombeiroSelecionado ? (
                                <SelectItem key={bombeiroSelecionado.id} value={bombeiroSelecionado.id}>
                                  {bombeiroSelecionado.nome} - {bombeiroSelecionado.funcao}
                                </SelectItem>
                              ) : null;
                            })()
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Checklist de Verificação */}
        <div className="border border-gray-400 mt-6">
          <div className="bg-gray-100 p-2 text-center font-semibold border-b border-gray-400">
            CHECKLIST DE VERIFICAÇÃO DE TRAJES DE PROTEÇÃO (TP-1)
          </div>
          
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-400 p-2 text-sm font-semibold w-12">ITEM</th>
                <th className="border border-gray-400 p-2 text-sm font-semibold">VERIFICAÇÃO</th>
                <th className="border border-gray-400 p-2 text-sm font-semibold w-16">S</th>
                <th className="border border-gray-400 p-2 text-sm font-semibold w-16">N</th>
                <th className="border border-gray-400 p-2 text-sm font-semibold w-64">DESCRIÇÃO DA NÃO CONFORMIDADE/ AÇÃO CORRETIVA ADOTADA</th>
              </tr>
            </thead>
            <tbody>
              {checklistItemsData.map((item, index) => (
                <tr key={item.id}>
                  <td className="border border-gray-400 p-2 text-center font-semibold">{index + 1}</td>
                  <td className="border border-gray-400 p-2 text-sm">{item.text}</td>
                  <td className="border border-gray-400 p-2 text-center">
                    <input
                      type="radio"
                      name={`${item.id}_conforme`}
                      value="S"
                      checked={checklistItems[item.id] === "S"}
                      onChange={() => setChecklistItems(prev => ({ ...prev, [item.id]: "S" }))}
                      className="w-4 h-4"
                    />
                  </td>
                  <td className="border border-gray-400 p-2 text-center">
                    <input
                      type="radio"
                      name={`${item.id}_conforme`}
                      value="N"
                      checked={checklistItems[item.id] === "N"}
                      onChange={() => setChecklistItems(prev => ({ ...prev, [item.id]: "N" }))}
                      className="w-4 h-4"
                    />
                  </td>
                  <td className="border border-gray-400 p-1">
                    <Textarea
                      placeholder={checklistItems[item.id] === "N" ? "Descreva a não conformidade..." : ""}
                      className="min-h-[60px] text-xs border-0 resize-none"
                      {...register(`item${index + 1}_observacoes` as keyof FormData, {
                        required: checklistItems[item.id] === "N" ? "Campo obrigatório para não conformidade" : false
                      })}
                      disabled={checklistItems[item.id] === "S"}
                    />
                    {errors[`${item.id}_observacoes` as keyof typeof errors] && (
                      <p className="text-xs text-red-600 mt-1">
                        {errors[`${item.id}_observacoes` as keyof typeof errors]?.message}
                      </p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Seção de Assinatura */}
        <div className="border border-gray-400 mt-6">
          <div className="bg-gray-100 p-2 text-center font-semibold border-b border-gray-400">
            ASSINATURA DIGITAL DO RESPONSÁVEL
          </div>
          
          <div className="p-4">
            <div className="space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                <p><strong>LEGENDA:</strong> S = SIM | N = NÃO QUANDO "NÃO" DESCREVER A NÃO CONFORMIDADE</p>
              </div>
              
              <AssinaturaDigital
                onAssinaturaConcluida={(dados) => {
                  setAssinatura(dados);
                  setStatusAssinatura('assinado');
                  toast({
                    title: "Assinatura concluída",
                    description: "A assinatura foi concluída com sucesso."
                  });
                }}
                signatarios={[
                  {
                    nome: watch("responsavel_nome") || "Responsável",
                    email: "responsavel@bombeiros.gov.br"
                  }
                ]}
                verificacaoData={{
                  data_verificacao: watch("data_verificacao") || new Date().toISOString().split('T')[0],
                  local_contrato: watch("local_contrato") || "",
                  ba_ce_nome: watch("ba_ce_nome") || "",
                  responsavel_nome: watch("responsavel_nome") || "",
                  equipe_id: watch("equipe_id") || "",
                  integrantes: [
                    watch("integrante_1_id"),
                    watch("integrante_2_id"),
                    watch("integrante_3_id"),
                    watch("integrante_4_id"),
                    watch("integrante_5_id"),
                    watch("integrante_6_id"),
                    watch("integrante_7_id"),
                    watch("integrante_8_id"),
                    watch("integrante_9_id"),
                    watch("integrante_10_id"),
                    watch("integrante_11_id"),
                    watch("integrante_12_id")
                  ].filter(Boolean) as string[],
                  checklist: [
                    {
                      item: "As vestimentas possuem algum tipo de dano?",
                      conforme: (watch("item1_conforme") || "N") as "S" | "N",
                      observacoes: watch("item1_observacoes") || ""
                    },
                    {
                      item: "Existem vestimentas nos moldes dos pontos de verificação?",
                      conforme: (watch("item2_conforme") || "N") as "S" | "N",
                      observacoes: watch("item2_observacoes") || ""
                    },
                    {
                      item: "Os capacetes possuem avarias de qualquer natureza?",
                      conforme: (watch("item3_conforme") || "N") as "S" | "N",
                      observacoes: watch("item3_observacoes") || ""
                    },
                    {
                      item: "As botas apresentam algum tipo de alteração?",
                      conforme: (watch("item4_conforme") || "N") as "S" | "N",
                      observacoes: watch("item4_observacoes") || ""
                    },
                    {
                      item: "As luvas apresentam algum tipo de alteração?",
                      conforme: (watch("item5_conforme") || "N") as "S" | "N",
                      observacoes: watch("item5_observacoes") || ""
                    },
                    {
                      item: "As botas apresentam algum tipo de alteração? (Item 6)",
                      conforme: (watch("item6_conforme") || "N") as "S" | "N",
                      observacoes: watch("item6_observacoes") || ""
                    },
                    {
                      item: "As luvas apresentam algum tipo de alteração? (Item 7)",
                      conforme: (watch("item7_conforme") || "N") as "S" | "N",
                      observacoes: watch("item7_observacoes") || ""
                    },
                    {
                      item: "Os botas dos vestimentas estão funcionando?",
                      conforme: (watch("item8_conforme") || "N") as "S" | "N",
                      observacoes: watch("item8_observacoes") || ""
                    }
                  ]
                }}
              />
              
              {assinatura && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Status:</strong> {assinatura.status === 'assinado' ? 'Documento assinado' : 'Processando assinatura'}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    <strong>ID do Documento:</strong> {assinatura.documentoId}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-center space-x-4 mt-6">
          <Button type="button" variant="outline" onClick={() => window.history.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={createVerificacao.isPending} className="bg-orange-600 hover:bg-orange-700">
            {createVerificacao.isPending ? "Salvando..." : "Salvar Verificação"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TPVerificacaoForm;
