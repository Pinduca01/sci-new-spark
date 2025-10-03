import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { StatusSelector } from './StatusSelector';
import { NaoConformidadeForm } from './NaoConformidadeForm';
import type { ChecklistItem } from '@/hooks/useChecklistMobileExecution';

interface ChecklistItemCardProps {
  item: ChecklistItem;
  index: number;
  onStatusChange: (status: 'conforme' | 'nao_conforme' | 'nao_aplicavel') => void;
  onObservacaoChange: (observacao: string) => void;
  onAddFotos: (fotos: File[]) => void;
  onRemoveFoto: (index: number) => void;
}

export const ChecklistItemCard = ({
  item,
  index,
  onStatusChange,
  onObservacaoChange,
  onAddFotos,
  onRemoveFoto
}: ChecklistItemCardProps) => {
  const [expanded, setExpanded] = useState(false);

  const handleStatusChange = (status: 'conforme' | 'nao_conforme' | 'nao_aplicavel') => {
    onStatusChange(status);
    if (status === 'nao_conforme') {
      setExpanded(true);
    } else {
      setExpanded(false);
    }
  };

  return (
    <Card className={`
      ${item.status === 'conforme' ? 'border-green-500/50' : ''}
      ${item.status === 'nao_conforme' ? 'border-destructive/50' : ''}
      ${item.status === 'nao_aplicavel' ? 'border-muted' : ''}
    `}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <span className="text-sm font-medium text-muted-foreground">
              #{index + 1}
            </span>
            <h3 className="font-semibold mt-1">{item.nome}</h3>
            {item.categoria && (
              <p className="text-xs text-muted-foreground mt-1">
                {item.categoria}
              </p>
            )}
          </div>

          {item.status === 'nao_conforme' && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="text-muted-foreground hover:text-foreground"
            >
              {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          )}
        </div>

        <StatusSelector
          value={item.status}
          onChange={handleStatusChange}
        />

        {item.status === 'nao_conforme' && expanded && (
          <NaoConformidadeForm
            observacao={item.observacao || ''}
            fotos={item.fotos || []}
            onObservacaoChange={onObservacaoChange}
            onAddFotos={onAddFotos}
            onRemoveFoto={onRemoveFoto}
          />
        )}
      </CardContent>
    </Card>
  );
};
