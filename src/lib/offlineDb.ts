import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface OfflineChecklist {
  id: string;
  viatura_id: string;
  template_id: string;
  bombeiro_id: string;
  bombeiro_nome: string;
  data_checklist: string;
  hora_checklist: string;
  status: 'pending_sync' | 'syncing' | 'synced' | 'error';
  itens_checklist: any[];
  assinatura_base64?: string;
  photos: Array<{
    item_id: string;
    blob: Blob;
    name: string;
  }>;
  nao_conformidades: any[];
  created_offline: boolean;
  sync_attempts: number;
  last_sync_attempt?: string;
  sync_error?: string;
}

interface OfflineDBSchema extends DBSchema {
  checklists: {
    key: string;
    value: OfflineChecklist;
    indexes: { 'by-status': string };
  };
  cache: {
    key: string;
    value: {
      key: string;
      data: any;
      timestamp: number;
    };
  };
}

let dbInstance: IDBPDatabase<OfflineDBSchema> | null = null;

export const initOfflineDB = async () => {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<OfflineDBSchema>('sci-checklist-offline', 1, {
    upgrade(db) {
      // Store para checklists offline
      if (!db.objectStoreNames.contains('checklists')) {
        const checklistStore = db.createObjectStore('checklists', { keyPath: 'id' });
        checklistStore.createIndex('by-status', 'status');
      }

      // Store para cache geral (templates, viaturas, bombeiros)
      if (!db.objectStoreNames.contains('cache')) {
        db.createObjectStore('cache', { keyPath: 'key' });
      }
    },
  });

  return dbInstance;
};

export const saveChecklistOffline = async (checklist: Omit<OfflineChecklist, 'sync_attempts' | 'created_offline'>) => {
  const db = await initOfflineDB();
  
  const offlineChecklist: OfflineChecklist = {
    ...checklist,
    sync_attempts: 0,
    created_offline: true,
    status: 'pending_sync',
  };

  await db.put('checklists', offlineChecklist);
  return offlineChecklist.id;
};

export const getChecklistsToSync = async (): Promise<OfflineChecklist[]> => {
  const db = await initOfflineDB();
  const tx = db.transaction('checklists', 'readonly');
  const index = tx.store.index('by-status');
  
  const pending = await index.getAll('pending_sync');
  const errors = await index.getAll('error');
  
  return [...pending, ...errors];
};

export const updateChecklistStatus = async (
  id: string, 
  status: OfflineChecklist['status'], 
  error?: string
) => {
  const db = await initOfflineDB();
  const checklist = await db.get('checklists', id);
  
  if (!checklist) return;

  checklist.status = status;
  checklist.last_sync_attempt = new Date().toISOString();
  
  if (status === 'error') {
    checklist.sync_attempts += 1;
    checklist.sync_error = error;
  }

  await db.put('checklists', checklist);
};

export const markAsSynced = async (id: string) => {
  await updateChecklistStatus(id, 'synced');
};

export const deleteLocalChecklist = async (id: string) => {
  const db = await initOfflineDB();
  await db.delete('checklists', id);
};

export const getPendingCount = async (): Promise<number> => {
  const db = await initOfflineDB();
  const tx = db.transaction('checklists', 'readonly');
  const index = tx.store.index('by-status');
  
  const pending = await index.count('pending_sync');
  const errors = await index.count('error');
  
  return pending + errors;
};

// Cache functions
export const saveToCache = async (key: string, data: any) => {
  const db = await initOfflineDB();
  await db.put('cache', {
    key,
    data,
    timestamp: Date.now(),
  });
};

export const getFromCache = async (key: string, maxAge: number = 24 * 60 * 60 * 1000) => {
  const db = await initOfflineDB();
  const cached = await db.get('cache', key);
  
  if (!cached) return null;
  
  const age = Date.now() - cached.timestamp;
  if (age > maxAge) {
    await db.delete('cache', key);
    return null;
  }
  
  return cached.data;
};

export const clearCache = async () => {
  const db = await initOfflineDB();
  await db.clear('cache');
};
