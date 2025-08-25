import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateEPIDistribuicao, type EPIDistribuicao } from "@/hooks/useEPIsDistribuicao";
import { useBombeiros } from "@/hooks/useBombeiros";

type FormData = Omit<EPIDistribuicao, "id" | "created_at" | "updated_at">;

const EPIDistribuicaoForm = () => {
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<FormData>();
  const createDistribuicao = useCreateEPIDistribuicao();
  const { bombeiros = [] } = useBombeiros();

  const mesAtual = new Date().getMonth() + 1;
  const anoAtual = new Date().getFullYear();

  const onSubmit = async (data: FormData) => {
    try {
      await createDistribuicao.mutateAsync({
        ...data,
        mes_referencia: mesAtual,
        ano_referencia: anoAtual,
        data_entrega: new Date().toISOString().split('T')[0]
      });
      reset();
    } catch (error) {
      console.error("Erro ao salvar distribuição:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registrar Distribuição de EPI/Uniforme</CardTitle>
        <CardDescription>
          Registre a entrega de equipamentos ou uniformes para bombeiros.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bombeiro_nome">Bombeiro</Label>
              <Select onValueChange={(value) => {
                const bombeiro = bombeiros.find(b => b.id === value);
                if (bombeiro) {
                  setValue("bombeiro_nome", bombeiro.nome);
                  setValue("bombeiro_id", bombeiro.id);
                  setValue("equipe_id", bombeiro.equipe_id);
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o bombeiro" />
                </SelectTrigger>
                <SelectContent>
                  {bombeiros.map((bombeiro) => (
                    <SelectItem key={bombeiro.id} value={bombeiro.id}>
                      {bombeiro.nome} - {bombeiro.equipe}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_item">Tipo de Item</Label>
              <Select onValueChange={(value) => setValue("tipo_item", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="epi">EPI</SelectItem>
                  <SelectItem value="uniforme">Uniforme</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="item_descricao">Descrição do Item</Label>
              <Input
                id="item_descricao"
                placeholder="Ex: Bota de segurança, Camisa operacional..."
                {...register("item_descricao", { required: "Campo obrigatório" })}
              />
              {errors.item_descricao && (
                <p className="text-sm text-destructive">{errors.item_descricao.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantidade_prevista">Quantidade Prevista</Label>
              <Input
                id="quantidade_prevista"
                type="number"
                min="0"
                {...register("quantidade_prevista", { 
                  required: "Campo obrigatório",
                  valueAsNumber: true 
                })}
              />
              {errors.quantidade_prevista && (
                <p className="text-sm text-destructive">{errors.quantidade_prevista.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantidade_entregue">Quantidade Entregue</Label>
              <Input
                id="quantidade_entregue"
                type="number"
                min="0"
                {...register("quantidade_entregue", { 
                  required: "Campo obrigatório",
                  valueAsNumber: true 
                })}
              />
              {errors.quantidade_entregue && (
                <p className="text-sm text-destructive">{errors.quantidade_entregue.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsavel_entrega_nome">Responsável pela Entrega</Label>
              <Select onValueChange={(value) => {
                const bombeiro = bombeiros.find(b => b.id === value);
                if (bombeiro) {
                  setValue("responsavel_entrega_nome", bombeiro.nome);
                  setValue("responsavel_entrega_id", bombeiro.id);
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              placeholder="Observações sobre a entrega..."
              {...register("observacoes")}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={createDistribuicao.isPending}
          >
            {createDistribuicao.isPending ? "Salvando..." : "Registrar Distribuição"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default EPIDistribuicaoForm;
