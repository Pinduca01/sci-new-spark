import { Check, X, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StatusSelectorProps {
  value: 'conforme' | 'nao_conforme' | 'nao_aplicavel' | null;
  onChange: (status: 'conforme' | 'nao_conforme' | 'nao_aplicavel') => void;
  disabled?: boolean;
}

export const StatusSelector = ({ value, onChange, disabled }: StatusSelectorProps) => {
  return (
    <div className="flex gap-2">
      <Button
        type="button"
        variant={value === 'conforme' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onChange('conforme')}
        disabled={disabled}
        className="flex-1 h-12 touch-manipulation"
      >
        <Check className="w-5 h-5 mr-2" />
        Conforme
      </Button>

      <Button
        type="button"
        variant={value === 'nao_conforme' ? 'destructive' : 'outline'}
        size="sm"
        onClick={() => onChange('nao_conforme')}
        disabled={disabled}
        className="flex-1 h-12 touch-manipulation"
      >
        <X className="w-5 h-5 mr-2" />
        Não Conforme
      </Button>

      <Button
        type="button"
        variant={value === 'nao_aplicavel' ? 'secondary' : 'outline'}
        size="sm"
        onClick={() => onChange('nao_aplicavel')}
        disabled={disabled}
        className="flex-1 h-12 touch-manipulation"
      >
        <Minus className="w-5 h-5 mr-2" />
        N/A
      </Button>
    </div>
  );
};
