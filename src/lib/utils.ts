import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Função utilitária para formatar horas
export const formatarHora = (hora?: string) => {
  return hora || '--:--';
};

// Função utilitária para formatar data
export const formatarData = (dataISO: string) => {
  return new Date(dataISO).toLocaleDateString('pt-BR');
};

// Função utilitária para converter tempo em segundos
export const timeToSeconds = (timeString: string): number => {
  if (!timeString || timeString === '00:00') return 0;
  const [minutes, seconds] = timeString.split(':').map(Number);
  return (minutes * 60) + seconds;
};

// Função utilitária para converter segundos em tempo
export const secondsToTime = (seconds?: number): string => {
  if (!seconds || seconds === 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};
