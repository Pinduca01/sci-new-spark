import { useSyncManager } from '@/hooks/useSyncManager';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

export const OnlineStatusBadge = () => {
  const { isOnline, syncing, pendingCount, startSync } = useSyncManager();

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
      <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium shadow-lg ${
        isOnline 
          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
          : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      }`}>
        {isOnline ? (
          <Wifi className="w-4 h-4" />
        ) : (
          <WifiOff className="w-4 h-4" />
        )}
        <span>{isOnline ? 'Online' : 'Offline'}</span>
        
        {pendingCount > 0 && (
          <Badge variant="secondary" className="ml-1">
            {pendingCount}
          </Badge>
        )}
      </div>

      {isOnline && pendingCount > 0 && (
        <Button
          size="sm"
          variant="outline"
          onClick={startSync}
          disabled={syncing}
          className="h-9 shadow-lg"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Sincronizando...' : 'Sincronizar'}
        </Button>
      )}
    </div>
  );
};
