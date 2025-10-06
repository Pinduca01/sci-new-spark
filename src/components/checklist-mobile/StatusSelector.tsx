import { Check, X, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StatusSelectorProps {
  value: 'conforme' | 'nao_conforme' | 'nao_aplicavel' | null;
  onChange: (status: 'conforme' | 'nao_conforme' | 'nao_aplicavel') => void;
  disabled?: boolean;
}

export const StatusSelector = ({ value, onChange, disabled }: StatusSelectorProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
      <Button
        type="button"
        variant={value === 'conforme' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onChange('conforme')}
        disabled={disabled}
        aria-label="Conforme"
        title="Conforme"
        className="w-full h-12 touch-manipulation rounded-lg shadow-sm active:scale-[0.98] whitespace-nowrap justify-center"
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
        className="w-full h-12 touch-manipulation rounded-lg shadow-sm active:scale-[0.98] whitespace-nowrap justify-center"
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
        className="w-full h-12 touch-manipulation rounded-lg shadow-sm active:scale-[0.98] whitespace-nowrap justify-center"
      >
        <Minus className="w-4 h-4 mr-1.5" />
        <span className="text-sm">N/A</span>
      </Button>
    </div>
  );
};
