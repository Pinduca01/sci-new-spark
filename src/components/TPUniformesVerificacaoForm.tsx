import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCreateTPVerificacao } from "@/hooks/useTPVerificacoes";
import { useBombeiros } from "@/hooks/useBombeiros";

type FormData = {
  // Identificação do Aeroporto
  aeroporto: string;
  data: string;
  responsavel_id: string;
  responsavel_nome: string;
  colaborador_id: string;
  colaborador_nome: string;
  
  // Itens de verificação de uniformes
  gandolas_bombeiro: "CONFORME" | "NAO_CONFORME";
  calcas_bombeiro: "CONFORME" | "NAO_CONFORME";
  cinto_bombeiro: "CONFORME" | "NAO_CONFORME";
  bota_seguranca: "CONFORME" | "NAO_CONFORME";
  camisas_bombeiro: "CONFORME" | "NAO_CONFORME";
  bermudas_bombeiro: "CONFORME" | "NAO_CONFORME";
  tarjeta_identificacao: "CONFORME" | "NAO_CONFORME";
  oculos_protetor: "CONFORME" | "NAO_CONFORME";
  
  // Campos condicionais para não conformidades
  gandolas_observacoes?: string;
  gandolas_imagem?: FileList;
  calcas_observacoes?: string;
  calcas_imagem?: FileList;
  cinto_observacoes?: string;
  cinto_imagem?: FileList;
  bota_observacoes?: string;
  bota_imagem?: FileList;
  camisas_observacoes?: string;
  camisas_imagem?: FileList;
  bermudas_observacoes?: string;
  bermudas_imagem?: FileList;
  tarjeta_observacoes?: string;
  tarjeta_imagem?: FileList;
  oculos_observacoes?: string;
  oculos_imagem?: FileList;
};

const TPUniformesVerificacaoForm = () => {
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<FormData>();
  const createVerificacao = useCreateTPVerificacao();
  const { bombeiros = [] } = useBombeiros();
  const [equipmentStatus, setEquipmentStatus] = useState({
    gandolas: "CONFORME" as "CONFORME" | "NAO_CONFORME",
    calcas: "CONFORME" as "CONFORME" | "NAO_CONFORME",
    cinto: "CONFORME" as "CONFORME" | "NAO_CONFORME",
    bota: "CONFORME" as "CONFORME" | "NAO_CONFORME",
    camisas: "CONFORME" as "CONFORME" | "NAO_CONFORME",
    bermudas: "CONFORME" as "CONFORME" | "NAO_CONFORME",
    tarjeta: "CONFORME" as "CONFORME" | "NAO_CONFORME",
    oculos: "CONFORME" as "CONFORME" | "NAO_CONFORME"
  });

  const mesAtual = new Date().getMonth() + 1;
  const anoAtual = new Date().getFullYear();

  const onSubmit = async (data: FormData) => {
    // Validar se há observações ou imagens para itens não conformes
    const hasNonConformity = Object.values(equipmentStatus).some(status => status === "NAO_CONFORME");
    
    if (hasNonConformity) {
      const missingObservations = [];
      if (equipmentStatus.gandolas === "NAO_CONFORME" && !data.gandolas_observacoes && !data.gandolas_imagem?.[0]) {
        missingObservations.push("Gandolas de Bombeiro");
      }
      if (equipmentStatus.calcas === "NAO_CONFORME" && !data.calcas_observacoes && !data.calcas_imagem?.[0]) {
        missingObservations.push("Calças de Bombeiro");
      }
      if (equipmentStatus.cinto === "NAO_CONFORME" && !data.cinto_observacoes && !data.cinto_imagem?.[0]) {
        missingObservations.push("Cinto de Bombeiro");
      }
      if (equipmentStatus.bota === "NAO_CONFORME" && !data.bota_observacoes && !data.bota_imagem?.[0]) {
        missingObservations.push("Bota de Segurança");
      }
      if (equipmentStatus.camisas === "NAO_CONFORME" && !data.camisas_observacoes && !data.camisas_imagem?.[0]) {
        missingObservations.push("Camisas de Bombeiro");
      }
      if (equipmentStatus.bermudas === "NAO_CONFORME" && !data.bermudas_observacoes && !data.bermudas_imagem?.[0]) {
        missingObservations.push("Bermudas de Bombeiro");
      }
      if (equipmentStatus.tarjeta === "NAO_CONFORME" && !data.tarjeta_observacoes && !data.tarjeta_imagem?.[0]) {
        missingObservations.push("Tarjeta de Identificação");
      }
      if (equipmentStatus.oculos === "NAO_CONFORME" && !data.oculos_observacoes && !data.oculos_imagem?.[0]) {
        missingObservations.push("Óculos de Proteção/Protetor Auricular");
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
        total_verificados: 8, // Total de itens verificados
        observacoes: `Colaborador: ${data.colaborador_nome}\nVerificação de Uniformes de Bombeiro de Aeródromo`
      };
      
      await createVerificacao.mutateAsync(adaptedData);
      reset();
      setEquipmentStatus({
        gandolas: "CONFORME",
        calcas: "CONFORME",
        cinto: "CONFORME",
        bota: "CONFORME",
        camisas: "CONFORME",
        bermudas: "CONFORME",
        tarjeta: "CONFORME",
        oculos: "CONFORME"
      });
    } catch (error) {
      console.error("Erro ao salvar verificação:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verificação de Uniformes</CardTitle>
        <CardDescription>
          Registre a verificação dos uniformes de bombeiro de aeródromo.
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
                <Label htmlFor="responsavel">Responsável *</Label>
                <Select onValueChange={(value) => {
                  const bombeiro = bombeiros.find(b => b.id === value);
                  if (bombeiro) {
                    setValue("responsavel_id", bombeiro.id);
                    setValue("responsavel_nome", bombeiro.nome);
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
                <Label htmlFor="colaborador">Colaborador *</Label>
                <Select onValueChange={(value) => {
                  const bombeiro = bombeiros.find(b => b.id === value);
                  if (bombeiro) {
                    setValue("colaborador_id", bombeiro.id);
                    setValue("colaborador_nome", bombeiro.nome);
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o colaborador" />
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
            </div>
          </div>

          {/* ITENS DE VERIFICAÇÃO */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary border-b pb-2">Itens de Verificação</h3>
            
            <div className="grid grid-cols-1 gap-6">
              {/* 1. Gandolas de Bombeiro */}
              <div className="space-y-3 p-4 border rounded-lg">
                <Label className="text-base font-medium">COLABORADOR POSSUI 2 GANDOLAS DE BOMBEIRO DE AERODROMO</Label>
                <RadioGroup 
                  value={equipmentStatus.gandolas}
                  onValueChange={(value: "CONFORME" | "NAO_CONFORME") => {
                    setEquipmentStatus(prev => ({ ...prev, gandolas: value }));
                  }}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="CONFORME" id="gandolas-conforme" />
                    <Label htmlFor="gandolas-conforme">CONFORME</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="NAO_CONFORME" id="gandolas-nao-conforme" />
                    <Label htmlFor="gandolas-nao-conforme">NÃO CONFORME</Label>
                  </div>
                </RadioGroup>
                
                {equipmentStatus.gandolas === "NAO_CONFORME" && (
                  <div className="space-y-3 mt-4 p-3 bg-red-50 rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="gandolas_observacoes">Observações (obrigatório)</Label>
                      <Textarea
                        id="gandolas_observacoes"
                        placeholder="Descreva o problema encontrado..."
                        {...register("gandolas_observacoes")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gandolas_imagem">Upload de Imagem</Label>
                      <Input
                        id="gandolas_imagem"
                        type="file"
                        accept="image/*"
                        {...register("gandolas_imagem")}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Calças de Bombeiro */}
              <div className="space-y-3 p-4 border rounded-lg">
                <Label className="text-base font-medium">COLABORADOR POSSUI 2 CALÇAS DE BOMBEIRO DE AERODROMO</Label>
                <RadioGroup 
                  value={equipmentStatus.calcas}
                  onValueChange={(value: "CONFORME" | "NAO_CONFORME") => {
                    setEquipmentStatus(prev => ({ ...prev, calcas: value }));
                  }}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="CONFORME" id="calcas-conforme" />
                    <Label htmlFor="calcas-conforme">CONFORME</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="NAO_CONFORME" id="calcas-nao-conforme" />
                    <Label htmlFor="calcas-nao-conforme">NÃO CONFORME</Label>
                  </div>
                </RadioGroup>
                
                {equipmentStatus.calcas === "NAO_CONFORME" && (
                  <div className="space-y-3 mt-4 p-3 bg-red-50 rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="calcas_observacoes">Observações (obrigatório)</Label>
                      <Textarea
                        id="calcas_observacoes"
                        placeholder="Descreva o problema encontrado..."
                        {...register("calcas_observacoes")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="calcas_imagem">Upload de Imagem</Label>
                      <Input
                        id="calcas_imagem"
                        type="file"
                        accept="image/*"
                        {...register("calcas_imagem")}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Cinto de Bombeiro */}
              <div className="space-y-3 p-4 border rounded-lg">
                <Label className="text-base font-medium">COLABORADOR POSSUI CINTO DE BOMBEIRO DE AERODROMO</Label>
                <RadioGroup 
                  value={equipmentStatus.cinto}
                  onValueChange={(value: "CONFORME" | "NAO_CONFORME") => {
                    setEquipmentStatus(prev => ({ ...prev, cinto: value }));
                  }}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="CONFORME" id="cinto-conforme" />
                    <Label htmlFor="cinto-conforme">CONFORME</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="NAO_CONFORME" id="cinto-nao-conforme" />
                    <Label htmlFor="cinto-nao-conforme">NÃO CONFORME</Label>
                  </div>
                </RadioGroup>
                
                {equipmentStatus.cinto === "NAO_CONFORME" && (
                  <div className="space-y-3 mt-4 p-3 bg-red-50 rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="cinto_observacoes">Observações (obrigatório)</Label>
                      <Textarea
                        id="cinto_observacoes"
                        placeholder="Descreva o problema encontrado..."
                        {...register("cinto_observacoes")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cinto_imagem">Upload de Imagem</Label>
                      <Input
                        id="cinto_imagem"
                        type="file"
                        accept="image/*"
                        {...register("cinto_imagem")}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Bota de Segurança */}
              <div className="space-y-3 p-4 border rounded-lg">
                <Label className="text-base font-medium">COLABORADOR POSSUI BOTA DE SEGURANÇA</Label>
                <RadioGroup 
                  value={equipmentStatus.bota}
                  onValueChange={(value: "CONFORME" | "NAO_CONFORME") => {
                    setEquipmentStatus(prev => ({ ...prev, bota: value }));
                  }}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="CONFORME" id="bota-conforme" />
                    <Label htmlFor="bota-conforme">CONFORME</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="NAO_CONFORME" id="bota-nao-conforme" />
                    <Label htmlFor="bota-nao-conforme">NÃO CONFORME</Label>
                  </div>
                </RadioGroup>
                
                {equipmentStatus.bota === "NAO_CONFORME" && (
                  <div className="space-y-3 mt-4 p-3 bg-red-50 rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="bota_observacoes">Observações (obrigatório)</Label>
                      <Textarea
                        id="bota_observacoes"
                        placeholder="Descreva o problema encontrado..."
                        {...register("bota_observacoes")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bota_imagem">Upload de Imagem</Label>
                      <Input
                        id="bota_imagem"
                        type="file"
                        accept="image/*"
                        {...register("bota_imagem")}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 5. Camisas de Bombeiro */}
              <div className="space-y-3 p-4 border rounded-lg">
                <Label className="text-base font-medium">COLABORADOR POSSUI 2 CAMISAS DE BOMBEIRO DE AERODROMO</Label>
                <RadioGroup 
                  value={equipmentStatus.camisas}
                  onValueChange={(value: "CONFORME" | "NAO_CONFORME") => {
                    setEquipmentStatus(prev => ({ ...prev, camisas: value }));
                  }}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="CONFORME" id="camisas-conforme" />
                    <Label htmlFor="camisas-conforme">CONFORME</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="NAO_CONFORME" id="camisas-nao-conforme" />
                    <Label htmlFor="camisas-nao-conforme">NÃO CONFORME</Label>
                  </div>
                </RadioGroup>
                
                {equipmentStatus.camisas === "NAO_CONFORME" && (
                  <div className="space-y-3 mt-4 p-3 bg-red-50 rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="camisas_observacoes">Observações (obrigatório)</Label>
                      <Textarea
                        id="camisas_observacoes"
                        placeholder="Descreva o problema encontrado..."
                        {...register("camisas_observacoes")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="camisas_imagem">Upload de Imagem</Label>
                      <Input
                        id="camisas_imagem"
                        type="file"
                        accept="image/*"
                        {...register("camisas_imagem")}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 6. Bermudas de Bombeiro */}
              <div className="space-y-3 p-4 border rounded-lg">
                <Label className="text-base font-medium">COLABORADOR POSSUI 2 BERMUDAS DE BOMBEIRO DE AERODROMO</Label>
                <RadioGroup 
                  value={equipmentStatus.bermudas}
                  onValueChange={(value: "CONFORME" | "NAO_CONFORME") => {
                    setEquipmentStatus(prev => ({ ...prev, bermudas: value }));
                  }}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="CONFORME" id="bermudas-conforme" />
                    <Label htmlFor="bermudas-conforme">CONFORME</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="NAO_CONFORME" id="bermudas-nao-conforme" />
                    <Label htmlFor="bermudas-nao-conforme">NÃO CONFORME</Label>
                  </div>
                </RadioGroup>
                
                {equipmentStatus.bermudas === "NAO_CONFORME" && (
                  <div className="space-y-3 mt-4 p-3 bg-red-50 rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="bermudas_observacoes">Observações (obrigatório)</Label>
                      <Textarea
                        id="bermudas_observacoes"
                        placeholder="Descreva o problema encontrado..."
                        {...register("bermudas_observacoes")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bermudas_imagem">Upload de Imagem</Label>
                      <Input
                        id="bermudas_imagem"
                        type="file"
                        accept="image/*"
                        {...register("bermudas_imagem")}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 7. Tarjeta de Nome/Função */}
              <div className="space-y-3 p-4 border rounded-lg">
                <Label className="text-base font-medium">COLABORADOR POSSUI TARJETA DE NOME/FUNÇÃO</Label>
                <RadioGroup 
                  value={equipmentStatus.tarjeta}
                  onValueChange={(value: "CONFORME" | "NAO_CONFORME") => {
                    setEquipmentStatus(prev => ({ ...prev, tarjeta: value }));
                  }}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="CONFORME" id="tarjeta-conforme" />
                    <Label htmlFor="tarjeta-conforme">CONFORME</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="NAO_CONFORME" id="tarjeta-nao-conforme" />
                    <Label htmlFor="tarjeta-nao-conforme">NÃO CONFORME</Label>
                  </div>
                </RadioGroup>
                
                {equipmentStatus.tarjeta === "NAO_CONFORME" && (
                  <div className="space-y-3 mt-4 p-3 bg-red-50 rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="tarjeta_observacoes">Observações (obrigatório)</Label>
                      <Textarea
                        id="tarjeta_observacoes"
                        placeholder="Descreva o problema encontrado..."
                        {...register("tarjeta_observacoes")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tarjeta_imagem">Upload de Imagem</Label>
                      <Input
                        id="tarjeta_imagem"
                        type="file"
                        accept="image/*"
                        {...register("tarjeta_imagem")}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 8. Óculos de Proteção/Protetor Auricular */}
              <div className="space-y-3 p-4 border rounded-lg">
                <Label className="text-base font-medium">COLABORADOR POSSUI ÓCULOS DE PROTEÇÃO/PROTETOR AURICULAR</Label>
                <RadioGroup 
                  value={equipmentStatus.oculos}
                  onValueChange={(value: "CONFORME" | "NAO_CONFORME") => {
                    setEquipmentStatus(prev => ({ ...prev, oculos: value }));
                  }}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="CONFORME" id="oculos-conforme" />
                    <Label htmlFor="oculos-conforme">CONFORME</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="NAO_CONFORME" id="oculos-nao-conforme" />
                    <Label htmlFor="oculos-nao-conforme">NÃO CONFORME</Label>
                  </div>
                </RadioGroup>
                
                {equipmentStatus.oculos === "NAO_CONFORME" && (
                  <div className="space-y-3 mt-4 p-3 bg-red-50 rounded-lg">
                    <div className="space-y-2">
                      <Label htmlFor="oculos_observacoes">Observações (obrigatório)</Label>
                      <Textarea
                        id="oculos_observacoes"
                        placeholder="Descreva o problema encontrado..."
                        {...register("oculos_observacoes")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="oculos_imagem">Upload de Imagem</Label>
                      <Input
                        id="oculos_imagem"
                        type="file"
                        accept="image/*"
                        {...register("oculos_imagem")}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
            FINALIZAR CHECKLIST MENSAL
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TPUniformesVerificacaoForm;