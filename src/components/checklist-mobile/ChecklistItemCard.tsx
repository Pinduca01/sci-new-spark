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

  const statusPill = (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs border transition-colors ${
        item.status === 'conforme'
          ? 'bg-green-50 text-green-700 border-green-200'
          : item.status === 'nao_conforme'
          ? 'bg-red-50 text-red-700 border-red-200'
          : item.status === 'nao_aplicavel'
          ? 'bg-zinc-50 text-zinc-700 border-zinc-200'
          : 'bg-muted text-muted-foreground'
      }`}
    >
      {item.status === 'conforme' && 'Conforme'}
      {item.status === 'nao_conforme' && 'Não Conforme'}
      {item.status === 'nao_aplicavel' && 'N/A'}
      {!item.status && 'Pendente'}
    </span>
  );

  return (
    <Card className={`transition-all hover:shadow-sm ${
      item.status === 'conforme' ? 'border-green-500/40 bg-green-50/30' : ''
    } ${
      item.status === 'nao_conforme' ? 'border-destructive/40 bg-red-50/20' : ''
    } ${
      item.status === 'nao_aplicavel' ? 'border-muted bg-muted/20' : ''
    }`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">#{index + 1}</span>
              {statusPill}
            </div>
            <h3 className="font-semibold mt-1 leading-tight">{item.nome}</h3>
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
              aria-label={expanded ? 'Recolher detalhes' : 'Expandir detalhes'}
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
