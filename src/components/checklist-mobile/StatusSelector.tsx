import { Check, X, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StatusSelectorProps {
  value: 'conforme' | 'nao_conforme' | 'nao_aplicavel' | null;
  onChange: (status: 'conforme' | 'nao_conforme' | 'nao_aplicavel') => void;
  disabled?: boolean;
}

export const StatusSelector = ({ value, onChange, disabled }: StatusSelectorProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant={value === 'conforme' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onChange('conforme')}
        disabled={disabled}
        aria-label="Conforme"
        title="Conforme"
        className="min-w-[96px] flex-1 h-12 touch-manipulation rounded-lg shadow-sm active:scale-[0.98] whitespace-nowrap justify-center"
      >
        <Check className="w-4 h-4 mr-1.5" />
        <span className="text-sm">Conforme</span>
      </Button>

      <Button
        type="button"
        variant={value === 'nao_conforme' ? 'destructive' : 'outline'}
        size="sm"
        onClick={() => onChange('nao_conforme')}
        disabled={disabled}
        aria-label="Não Conforme"
        title="Não Conforme"
        className="min-w-[96px] flex-1 h-12 touch-manipulation rounded-lg shadow-sm active:scale-[0.98] whitespace-nowrap justify-center"
      >
        <X className="w-4 h-4 mr-1.5" />
        <span className="text-sm">Não Conforme</span>
      </Button>

      <Button
        type="button"
        variant={value === 'nao_aplicavel' ? 'secondary' : 'outline'}
        size="sm"
        onClick={() => onChange('nao_aplicavel')}
        disabled={disabled}
        aria-label="Não Aplicável"
        title="Não Aplicável"
        className="min-w-[88px] flex-1 h-12 touch-manipulation rounded-lg shadow-sm active:scale-[0.98] whitespace-nowrap justify-center"
      >
        <Minus className="w-4 h-4 mr-1.5" />
        <span className="text-sm">N/A</span>
      </Button>
    </div>
  );
};
