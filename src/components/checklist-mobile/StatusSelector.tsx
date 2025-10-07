import { Check, X, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StatusSelectorProps {
  value: 'conforme' | 'nao_conforme' | 'nao_aplicavel' | null;
  onChange: (status: 'conforme' | 'nao_conforme' | 'nao_aplicavel') => void;
  disabled?: boolean;
}

export const StatusSelector = ({ value, onChange, disabled }: StatusSelectorProps) => {
  return (
    <div className="grid grid-cols-3 gap-3">
      <Button
        type="button"
        variant={value === 'conforme' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onChange('conforme')}
        disabled={disabled}
        aria-label="Conforme"
        title="Conforme"
        className="h-14 touch-manipulation rounded-lg shadow-sm active:scale-95 transition-transform flex-col gap-1 px-2"
      >
        <Check className="w-5 h-5" />
        <span className="text-xs font-medium">Conforme</span>
      </Button>

      <Button
        type="button"
        variant={value === 'nao_conforme' ? 'destructive' : 'outline'}
        size="sm"
        onClick={() => onChange('nao_conforme')}
        disabled={disabled}
        aria-label="Não Conforme"
        title="Não Conforme"
        className="h-14 touch-manipulation rounded-lg shadow-sm active:scale-95 transition-transform flex-col gap-1 px-2"
      >
        <X className="w-5 h-5" />
        <span className="text-xs font-medium">Não Conforme</span>
      </Button>

      <Button
        type="button"
        variant={value === 'nao_aplicavel' ? 'secondary' : 'outline'}
        size="sm"
        onClick={() => onChange('nao_aplicavel')}
        disabled={disabled}
        aria-label="Não Aplicável"
        title="Não Aplicável"
        className="h-14 touch-manipulation rounded-lg shadow-sm active:scale-95 transition-transform flex-col gap-1 px-2"
      >
        <Minus className="w-5 h-5" />
        <span className="text-xs font-medium">N/A</span>
      </Button>
    </div>
  );
};
