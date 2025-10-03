import { Progress } from '@/components/ui/progress';

interface ChecklistProgressProps {
  completed: number;
  total: number;
  percentage: number;
}

export const ChecklistProgress = ({ completed, total, percentage }: ChecklistProgressProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Progresso</span>
        <span className="text-muted-foreground">
          {completed} de {total} itens
        </span>
      </div>
      <Progress value={percentage} className="h-2" />
      <p className="text-xs text-center text-muted-foreground">
        {percentage.toFixed(0)}% completo
      </p>
    </div>
  );
};
