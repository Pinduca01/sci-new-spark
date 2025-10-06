import { useSyncManager } from '@/hooks/useSyncManager';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

export const OnlineStatusBadge = () => {
  const { isOnline } = useSyncManager();

  return (
    <div className="fixed top-2 right-2 z-50" role="status" aria-live="polite">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              tabIndex={0}
              aria-label={isOnline ? 'Online' : 'Offline'}
              className={`block h-3 w-3 rounded-full border shadow focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isOnline ? 'bg-green-500 border-green-600 focus:ring-green-500' : 'bg-gray-400 border-gray-500 focus:ring-gray-400'
              }`}
            />
          </TooltipTrigger>
          <TooltipContent side="bottom" align="center">
            {isOnline ? 'Online' : 'Offline'}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
