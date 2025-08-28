import { useForm, useFieldArray } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateTPHigienizacao, type TPHigienizacao } from "@/hooks/useTPHigienizacoes";
import { useBombeiros } from "@/hooks/useBombeiros";
import { Plus, Trash2 } from "lucide-react";

type FormData = {
  aeroporto: string;
  responsavel_id: string;
  responsavel_nome: string;
  data: string;
  quantidade_higienizada: number;
  numeracoes_tps: { numeracao: string }[];
  quantidade_total_sci: number;
  observacoes?: string;
};

const TPHigienizacaoForm = () => {
  const { register, handleSubmit, formState: { errors }, reset, setValue, control } = useForm<FormData>({
    defaultValues: {
      numeracoes_tps: [{ numeracao: "" }]
    }
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "numeracoes_tps"
  });
  const createHigienizacao = useCreateTPHigienizacao();
  const { bombeiros = [] } = useBombeiros();

  const mesAtual = new Date().getMonth() + 1;
  const anoAtual = new Date().getFullYear();

  const onSubmit = async (data: FormData) => {
    try {
      // Adaptar dados para o formato esperado pelo backend
      const adaptedData = {
        base: data.aeroporto,
        responsavel_id: data.responsavel_id,
        responsavel_nome: data.responsavel_nome,
        mes_referencia: mesAtual,
        ano_referencia: anoAtual,
        data_higienizacao: data.data,
        quantidade_higienizada: data.quantidade_higienizada,
        quantidade_total: data.quantidade_total_sci,
        tipo_higienizacao: "manual", // Valor padrão
        observacoes: data.observacoes || ""
      };
      
      await createHigienizacao.mutateAsync(adaptedData);
      reset({
        numeracoes_tps: [{ numeracao: "" }]
      });
    } catch (error) {
      console.error("Erro ao salvar higienização:", error);
    }
  };

  const addNumeracao = () => {
    append({ numeracao: "" });
  };

  const removeNumeracao = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Higienização</CardTitle>
        <CardDescription>
          Registre uma nova higienização de trajes de proteção.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Seção de Identificação */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary border-b pb-2">Identificação do Aeroporto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="aeroporto">Aeroporto</Label>
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
                {errors.aeroporto && (
                  <p className="text-sm text-destructive">{errors.aeroporto.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsavel_nome">Responsável pela Verificação</Label>
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
                {errors.responsavel_id && (
                  <p className="text-sm text-destructive">{errors.responsavel_id.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="data">Data</Label>
                <Input
                  id="data"
                  type="date"
                  {...register("data", { 
                    required: "Campo obrigatório"
                  })}
                />
                {errors.data && (
                  <p className="text-sm text-destructive">{errors.data.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Seção de Quantidades */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary border-b pb-2">Informações de Higienização</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantidade_higienizada">Quantidade de TP Higienizado</Label>
                <Input
                  id="quantidade_higienizada"
                  type="number"
                  min="0"
                  {...register("quantidade_higienizada", { 
                    required: "Campo obrigatório",
                    valueAsNumber: true 
                  })}
                />
                {errors.quantidade_higienizada && (
                  <p className="text-sm text-destructive">{errors.quantidade_higienizada.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantidade_total_sci">Quantidade Total de TPs na SCI</Label>
                <Input
                  id="quantidade_total_sci"
                  type="number"
                  min="0"
                  {...register("quantidade_total_sci", { 
                    required: "Campo obrigatório",
                    valueAsNumber: true 
                  })}
                />
                {errors.quantidade_total_sci && (
                  <p className="text-sm text-destructive">{errors.quantidade_total_sci.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Seção de Numerações dos TPs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-primary border-b pb-2 flex-1">Numeração de Identificação dos TPs Higienizados</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addNumeracao}
                className="ml-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar TP
              </Button>
            </div>
            
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <div className="flex-1">
                    <Input
                      placeholder={`Numeração do TP ${index + 1}`}
                      {...register(`numeracoes_tps.${index}.numeracao`, {
                        required: "Numeração é obrigatória"
                      })}
                    />
                    {errors.numeracoes_tps?.[index]?.numeracao && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.numeracoes_tps[index]?.numeracao?.message}
                      </p>
                    )}
                  </div>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeNumeracao(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              placeholder="Observações sobre a higienização..."
              {...register("observacoes")}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
            disabled={createHigienizacao.isPending}
          >
            {createHigienizacao.isPending ? "Salvando..." : "Registrar Higienização"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TPHigienizacaoForm;
