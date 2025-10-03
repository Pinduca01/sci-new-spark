import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CameraCapture } from './CameraCapture';

interface NaoConformidadeFormProps {
  observacao: string;
  fotos: File[];
  onObservacaoChange: (value: string) => void;
  onAddFotos: (files: File[]) => void;
  onRemoveFoto: (index: number) => void;
}

export const NaoConformidadeForm = ({
  observacao,
  fotos,
  onObservacaoChange,
  onAddFotos,
  onRemoveFoto
}: NaoConformidadeFormProps) => {
  return (
    <div className="space-y-4 p-4 bg-destructive/5 rounded-lg border border-destructive/20">
      <div>
        <Label className="text-destructive font-semibold mb-2 block">
          📸 Não Conformidade Detectada
        </Label>
        <p className="text-sm text-muted-foreground mb-3">
          Adicione fotos e/ou descreva o problema (pelo menos um é obrigatório)
        </p>
      </div>

      <CameraCapture
        fotos={fotos}
        onAddFotos={onAddFotos}
        onRemoveFoto={onRemoveFoto}
      />

      <div>
        <Label htmlFor="observacao">Observações</Label>
        <Textarea
          id="observacao"
          value={observacao}
          onChange={(e) => onObservacaoChange(e.target.value)}
          placeholder="Descreva o problema encontrado..."
          rows={3}
          className="resize-none"
        />
      </div>
    </div>
  );
};
