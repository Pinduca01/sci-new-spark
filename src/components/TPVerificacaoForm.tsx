import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCreateTPVerificacao, type TPVerificacao } from "@/hooks/useTPVerificacoes";
import { useBombeiros } from "@/hooks/useBombeiros";

type FormData = {
  // Identificação do Aeroporto
  aeroporto: string;
  data: string;
  responsavel_id: string;
  responsavel_nome: string;
  colaborador_id: string;
  colaborador_nome: string;
  
  // Itens de verificação de TPs
  trajes_satisfatorios: "CONFORME" | "NAO_CONFORME";
  botas_satisfatorias: "CONFORME" | "NAO_CONFORME";
  balaclavas_satisfatorias: "CONFORME" | "NAO_CONFORME";
  luvas_satisfatorias: "CONFORME" | "NAO_CONFORME";
  capacetes_satisfatorios: "CONFORME" | "NAO_CONFORME";
  
  // Campos condicionais para não conformidades
  trajes_observacoes?: string;
  trajes_imagem?: FileList;
  botas_observacoes?: string;
  botas_imagem?: FileList;
  balaclavas_observacoes?: string;
  balaclavas_imagem?: FileList;
  luvas_observacoes?: string;
  luvas_imagem?: FileList;
  capacetes_observacoes?: string;
  capacetes_imagem?: FileList;
};

const TPVerificacaoForm = () => {
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<FormData>();
  const createVerificacao = useCreateTPVerificacao();
  const { bombeiros = [] } = useBombeiros();
  const [equipmentStatus, setEquipmentStatus] = useState({
    trajes: "CONFORME" as "CONFORME" | "NAO_CONFORME",
    botas: "CONFORME" as "CONFORME" | "NAO_CONFORME",
    balaclavas: "CONFORME" as "CONFORME" | "NAO_CONFORME",
    luvas: "CONFORME" as "CONFORME" | "NAO_CONFORME",
    capacetes: "CONFORME" as "CONFORME" | "NAO_CONFORME"
  });

  const mesAtual = new Date().getMonth() + 1;
  const anoAtual = new Date().getFullYear();

  const onSubmit = async (data: FormData) => {
    // Validar se há observações ou imagens para itens não conformes
    const hasNonConformity = Object.values(equipmentStatus).some(status => status === "NAO_CONFORME");
    
    if (hasNonConformity) {
      const missingObservations = [];
      if (equipmentStatus.trajes === "NAO_CONFORME" && !data.trajes_observacoes && !data.trajes_imagem?.[0]) {
        missingObservations.push("Trajes de Proteção");
      }
      if (equipmentStatus.botas === "NAO_CONFORME" && !data.botas_observacoes && !data.botas_imagem?.[0]) {
        missingObservations.push("Botas");
      }
      if (equipmentStatus.balaclavas === "NAO_CONFORME" && !data.balaclavas_observacoes && !data.balaclavas_imagem?.[0]) {
        missingObservations.push("Balaclavas");
      }
      if (equipmentStatus.luvas === "NAO_CONFORME" && !data.luvas_observacoes && !data.luvas_imagem?.[0]) {
        missingObservations.push("Luvas");
      }
      if (equipmentStatus.capacetes === "NAO_CONFORME" && !data.capacetes_observacoes && !data.capacetes_imagem?.[0]) {
        missingObservations.push("Capacetes");
      }
      
      if (missingObservations.length > 0) {
        alert(`Observações ou imagens são obrigatórias para itens não conformes: ${missingObservations.join(", ")}`);
        return;
      }
    }

    try {
      // Contar itens conformes e não conformes
      const itensConformes = Object.values(equipmentStatus).filter(status => status === "CONFORME").length;
      const itensNaoConformes = Object.values(equipmentStatus).filter(status => status === "NAO_CONFORME").length;
      
      // Adaptar dados para o formato esperado pelo backend
      const adaptedData = {
        base: data.aeroporto,
        responsavel_id: data.responsavel_id,
        responsavel_nome: data.responsavel_nome,
        data_verificacao: data.data,
        equipe_id: null,
        mes_referencia: mesAtual,
        ano_referencia: anoAtual,
        tp_conformes: itensConformes,
        tp_nao_conformes: itensNaoConformes,
        total_verificados: 5, // Total de itens verificados
        observacoes: `Colaborador: ${data.colaborador_nome}\nVerificação de Trajes de Proteção`
      };
      
      await createVerificacao.mutateAsync(adaptedData);
      reset();
      setEquipmentStatus({
        trajes: "CONFORME",
        botas: "CONFORME",
        balaclavas: "CONFORME",
        luvas: "CONFORME",
        capacetes: "CONFORME"
      });
    } catch (error) {
      console.error("Erro ao salvar verificação:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verificação de Trajes de Proteção (TP)</CardTitle>
        <CardDescription>
          Registre a verificação dos trajes de proteção utilizados pelos bombeiros de aeródromo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* IDENTIFICAÇÃO DO AEROPORTO */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary border-b pb-2">Identificação do Aeroporto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="aeroporto">Aeroporto *</Label>
                <Select onValueChange={(value) => setValue("aeroporto", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o aeroporto" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SBSV">SBSV - Salvador</SelectItem>
                    <SelectItem value="SBIL">SBIL - Ilhéus</SelectItem>
                    <SelectItem value="SBPS">SBPS - Porto Seguro</SelectItem>
                    <SelectItem value="SBTF">SBTF - Teixeira de Freitas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="data">Data *</Label>
                <Input
                  id="data"
                  type="date"
                  {...register("data", { required: "Campo obrigatório" })}
                />
                {errors.data && (
                  <p className="text-sm text-destructive">{errors.data.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsavel_nome">Responsável *</Label>
                <Select onValueChange={(value) => {
                  const bombeiro = bombeiros.find(b => b.id === value);
                  if (bombeiro) {
                    setValue("responsavel_nome", bombeiro.nome);
                    setValue("responsavel_id", bombeiro.id);
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o responsável" />
                  </SelectTrigger>
                  <SelectContent>
                    {bombeiros.map((bombeiro) => (
                      <SelectItem key={bombeiro.id} value={bombeiro.id}>
                        {bombeiro.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="colaborador_nome">Colaborador *</Label>
                <Select onValueChange={(value) => {
                  const bombeiro = bombeiros.find(b => b.id === value);
                  if (bombeiro) {
                    setValue("colaborador_nome", `${bombeiro.nome} - ${bombeiro.funcao || 'Bombeiro'}`);
                    setValue("colaborador_id", bombeiro.id);
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o colaborador" />
                  </SelectTrigger>
                  <SelectContent>
                    {bombeiros.map((bombeiro) => (
                      <SelectItem key={bombeiro.id} value={bombeiro.id}>
                        {bombeiro.nome} - {bombeiro.funcao || 'Bombeiro'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* ITENS DE VERIFICAÇÃO */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary border-b pb-2">Itens de Verificação</h3>
            
            <div className="grid grid-cols-1 gap-6">
              {/* 1. Trajes de Proteção */}
              <div className="space-y-3 p-4 border rounded-lg">
                <Label className="text-base font-medium">TRAJES DE PROTEÇÃO EM CONDIÇÕES SATISFATÓRIAS</Label>
                <RadioGroup 
                  value={equipmentStatus.trajes}
                  onValueChange={(value: "CONFORME" | "NAO_CONFORME") => {
                    setEquipmentStatus(prev => ({ ...prev, trajes: value }));
                    setValue("trajes_satisfatorios", value);
                  }}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="CONFORME" id="trajes-conforme" />
                    <Label htmlFor="trajes-conforme">CONFORME</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="NAO_CONFORME" id="trajes-nao-conforme" />
                    <Label htmlFor="trajes-nao-conforme">NÃO CONFORME</Label>
                  </div>
                </RadioGroup>
                
                {equipmentStatus.trajes === "NAO_CONFORME" && (
                  <div className="space-y-3 mt-4 p-3 bg-red-50 rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="trajes_observacoes">Observações (obrigatório)</Label>
                      <Textarea
                        id="trajes_observacoes"
                        placeholder="Descreva o problema encontrado..."
                        {...register("trajes_observacoes")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="trajes_imagem">Upload de Imagem</Label>
                      <Input
                        id="trajes_imagem"
                        type="file"
                        accept="image/*"
                        {...register("trajes_imagem")}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Botas */}
              <div className="space-y-3 p-4 border rounded-lg">
                <Label className="text-base font-medium">BOTAS EM CONDIÇÕES SATISFATÓRIAS</Label>
                <RadioGroup 
                  value={equipmentStatus.botas}
                  onValueChange={(value: "CONFORME" | "NAO_CONFORME") => {
                    setEquipmentStatus(prev => ({ ...prev, botas: value }));
                    setValue("botas_satisfatorias", value);
                  }}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="CONFORME" id="botas-conforme" />
                    <Label htmlFor="botas-conforme">CONFORME</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="NAO_CONFORME" id="botas-nao-conforme" />
                    <Label htmlFor="botas-nao-conforme">NÃO CONFORME</Label>
                  </div>
                </RadioGroup>
                
                {equipmentStatus.botas === "NAO_CONFORME" && (
                  <div className="space-y-3 mt-4 p-3 bg-red-50 rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="botas_observacoes">Observações (obrigatório)</Label>
                      <Textarea
                        id="botas_observacoes"
                        placeholder="Descreva o problema encontrado..."
                        {...register("botas_observacoes")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="botas_imagem">Upload de Imagem</Label>
                      <Input
                        id="botas_imagem"
                        type="file"
                        accept="image/*"
                        {...register("botas_imagem")}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Balaclavas */}
              <div className="space-y-3 p-4 border rounded-lg">
                <Label className="text-base font-medium">BALACLAVAS EM CONDIÇÕES SATISFATÓRIAS</Label>
                <RadioGroup 
                  value={equipmentStatus.balaclavas}
                  onValueChange={(value: "CONFORME" | "NAO_CONFORME") => {
                    setEquipmentStatus(prev => ({ ...prev, balaclavas: value }));
                    setValue("balaclavas_satisfatorias", value);
                  }}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="CONFORME" id="balaclavas-conforme" />
                    <Label htmlFor="balaclavas-conforme">CONFORME</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="NAO_CONFORME" id="balaclavas-nao-conforme" />
                    <Label htmlFor="balaclavas-nao-conforme">NÃO CONFORME</Label>
                  </div>
                </RadioGroup>
                
                {equipmentStatus.balaclavas === "NAO_CONFORME" && (
                  <div className="space-y-3 mt-4 p-3 bg-red-50 rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="balaclavas_observacoes">Observações (obrigatório)</Label>
                      <Textarea
                        id="balaclavas_observacoes"
                        placeholder="Descreva o problema encontrado..."
                        {...register("balaclavas_observacoes")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="balaclavas_imagem">Upload de Imagem</Label>
                      <Input
                        id="balaclavas_imagem"
                        type="file"
                        accept="image/*"
                        {...register("balaclavas_imagem")}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Luvas */}
              <div className="space-y-3 p-4 border rounded-lg">
                <Label className="text-base font-medium">LUVAS EM CONDIÇÕES SATISFATÓRIAS</Label>
                <RadioGroup 
                  value={equipmentStatus.luvas}
                  onValueChange={(value: "CONFORME" | "NAO_CONFORME") => {
                    setEquipmentStatus(prev => ({ ...prev, luvas: value }));
                    setValue("luvas_satisfatorias", value);
                  }}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="CONFORME" id="luvas-conforme" />
                    <Label htmlFor="luvas-conforme">CONFORME</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="NAO_CONFORME" id="luvas-nao-conforme" />
                    <Label htmlFor="luvas-nao-conforme">NÃO CONFORME</Label>
                  </div>
                </RadioGroup>
                
                {equipmentStatus.luvas === "NAO_CONFORME" && (
                  <div className="space-y-3 mt-4 p-3 bg-red-50 rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="luvas_observacoes">Observações (obrigatório)</Label>
                      <Textarea
                        id="luvas_observacoes"
                        placeholder="Descreva o problema encontrado..."
                        {...register("luvas_observacoes")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="luvas_imagem">Upload de Imagem</Label>
                      <Input
                        id="luvas_imagem"
                        type="file"
                        accept="image/*"
                        {...register("luvas_imagem")}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 5. Capacetes */}
              <div className="space-y-3 p-4 border rounded-lg">
                <Label className="text-base font-medium">CAPACETES EM CONDIÇÕES SATISFATÓRIAS</Label>
                <RadioGroup 
                  value={equipmentStatus.capacetes}
                  onValueChange={(value: "CONFORME" | "NAO_CONFORME") => {
                    setEquipmentStatus(prev => ({ ...prev, capacetes: value }));
                    setValue("capacetes_satisfatorios", value);
                  }}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="CONFORME" id="capacetes-conforme" />
                    <Label htmlFor="capacetes-conforme">CONFORME</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="NAO_CONFORME" id="capacetes-nao-conforme" />
                    <Label htmlFor="capacetes-nao-conforme">NÃO CONFORME</Label>
                  </div>
                </RadioGroup>
                
                {equipmentStatus.capacetes === "NAO_CONFORME" && (
                  <div className="space-y-3 mt-4 p-3 bg-red-50 rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="capacetes_observacoes">Observações (obrigatório)</Label>
                      <Textarea
                        id="capacetes_observacoes"
                        placeholder="Descreva o problema encontrado..."
                        {...register("capacetes_observacoes")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="capacetes_imagem">Upload de Imagem</Label>
                      <Input
                        id="capacetes_imagem"
                        type="file"
                        accept="image/*"
                        {...register("capacetes_imagem")}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>



          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 text-lg"
            disabled={createVerificacao.isPending}
          >
            {createVerificacao.isPending ? "Salvando..." : "FINALIZAR CHECKLIST"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TPVerificacaoForm;
