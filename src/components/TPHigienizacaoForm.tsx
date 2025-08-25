import { useForm } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateTPHigienizacao, type TPHigienizacao } from "@/hooks/useTPHigienizacoes";
import { useBombeiros } from "@/hooks/useBombeiros";

type FormData = Omit<TPHigienizacao, "id" | "created_at" | "updated_at">;

const TPHigienizacaoForm = () => {
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<FormData>();
  const createHigienizacao = useCreateTPHigienizacao();
  const { bombeiros = [] } = useBombeiros();

  const mesAtual = new Date().getMonth() + 1;
  const anoAtual = new Date().getFullYear();

  const onSubmit = async (data: FormData) => {
    try {
      await createHigienizacao.mutateAsync({
        ...data,
        mes_referencia: mesAtual,
        ano_referencia: anoAtual,
        data_higienizacao: new Date().toISOString().split('T')[0]
      });
      reset();
    } catch (error) {
      console.error("Erro ao salvar higienização:", error);
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
              <Label htmlFor="responsavel_nome">Responsável</Label>
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
              <Label htmlFor="quantidade_higienizada">Quantidade Higienizada</Label>
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
              <Label htmlFor="quantidade_total">Quantidade Total</Label>
              <Input
                id="quantidade_total"
                type="number"
                min="0"
                {...register("quantidade_total", { 
                  required: "Campo obrigatório",
                  valueAsNumber: true 
                })}
              />
              {errors.quantidade_total && (
                <p className="text-sm text-destructive">{errors.quantidade_total.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_higienizacao">Tipo de Higienização</Label>
              <Select onValueChange={(value) => setValue("tipo_higienizacao", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mensal">Mensal</SelectItem>
                  <SelectItem value="quinzenal">Quinzenal</SelectItem>
                  <SelectItem value="emergencial">Emergencial</SelectItem>
                  <SelectItem value="especial">Especial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

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
            className="w-full"
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
