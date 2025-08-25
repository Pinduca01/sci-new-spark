import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateTPVerificacao, type TPVerificacao } from "@/hooks/useTPVerificacoes";
import { useBombeiros } from "@/hooks/useBombeiros";

type FormData = Omit<TPVerificacao, "id" | "created_at" | "updated_at">;

const TPVerificacaoForm = () => {
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<FormData>();
  const createVerificacao = useCreateTPVerificacao();
  const { bombeiros = [] } = useBombeiros();

  const mesAtual = new Date().getMonth() + 1;
  const anoAtual = new Date().getFullYear();

  const onSubmit = async (data: FormData) => {
    try {
      await createVerificacao.mutateAsync({
        ...data,
        mes_referencia: mesAtual,
        ano_referencia: anoAtual,
        data_verificacao: new Date().toISOString().split('T')[0]
      });
      reset();
    } catch (error) {
      console.error("Erro ao salvar verificação:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova Verificação de TP</CardTitle>
        <CardDescription>
          Registre uma nova verificação mensal dos trajes de proteção.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="base">Base</Label>
              <Select onValueChange={(value) => setValue("base", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a base" />
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="tp_conformes">TPs Conformes</Label>
              <Input
                id="tp_conformes"
                type="number"
                min="0"
                {...register("tp_conformes", { 
                  required: "Campo obrigatório",
                  valueAsNumber: true 
                })}
              />
              {errors.tp_conformes && (
                <p className="text-sm text-destructive">{errors.tp_conformes.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tp_nao_conformes">TPs Não Conformes</Label>
              <Input
                id="tp_nao_conformes"
                type="number"
                min="0"
                {...register("tp_nao_conformes", { 
                  required: "Campo obrigatório",
                  valueAsNumber: true 
                })}
              />
              {errors.tp_nao_conformes && (
                <p className="text-sm text-destructive">{errors.tp_nao_conformes.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_verificados">Total Verificado</Label>
              <Input
                id="total_verificados"
                type="number"
                min="0"
                {...register("total_verificados", { 
                  required: "Campo obrigatório",
                  valueAsNumber: true 
                })}
              />
              {errors.total_verificados && (
                <p className="text-sm text-destructive">{errors.total_verificados.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              placeholder="Observações sobre a verificação..."
              {...register("observacoes")}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={createVerificacao.isPending}
          >
            {createVerificacao.isPending ? "Salvando..." : "Registrar Verificação"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default TPVerificacaoForm;
