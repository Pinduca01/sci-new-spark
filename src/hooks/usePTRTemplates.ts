import { useState, useCallback, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

export interface PTRTemplate {
  id: string;
  name: string;
  file: ArrayBuffer;
  mappings: {
    data?: string;
    codigo?: string;
    equipe?: string;
    participantes_inicio?: string;
    ptr_inicio?: string;
    observacoes?: string;
  };
  createdAt: Date;
}

interface StoredTemplate {
  id: string;
  name: string;
  file: string; // Base64 in storage
  mappings: {
    data?: string;
    codigo?: string;
    equipe?: string;
    participantes_inicio?: string;
    ptr_inicio?: string;
    observacoes?: string;
  };
  createdAt: string;
}

const STORAGE_KEY = 'ptr-excel-templates';

// Cache para conversões já realizadas
const templateCache = new Map<string, ArrayBuffer>();

// Helper functions for robust Base64 conversion with caching
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  try {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    return btoa(binary);
  } catch (error) {
    console.error('[PTR Templates] Erro na conversão para Base64:', error);
    throw error;
  }
};

const base64ToArrayBuffer = (base64: string, cacheKey?: string): ArrayBuffer => {
  try {
    // Check cache first
    if (cacheKey && templateCache.has(cacheKey)) {
      return templateCache.get(cacheKey)!;
    }

    const binaryString = atob(base64);
    const len = binaryString.length;
    
    // Validate size before processing
    if (len > 10 * 1024 * 1024) { // 10MB limit
      throw new Error('Template muito grande (>10MB)');
    }
    
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const buffer = bytes.buffer;
    
    // Cache the result
    if (cacheKey) {
      templateCache.set(cacheKey, buffer);
    }
    
    return buffer;
  } catch (error) {
    console.error('[PTR Templates] Erro na conversão Base64:', error);
    throw error;
  }
};

// Async helper to safely load templates from storage
const loadTemplatesFromStorageAsync = async (): Promise<PTRTemplate[]> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const storedTemplates: StoredTemplate[] = JSON.parse(stored);
    const templates: PTRTemplate[] = [];
    
    for (const stored of storedTemplates) {
      try {
        // Use cache key for this template
        const cacheKey = `template-${stored.id}`;
        
        const template: PTRTemplate = {
          id: stored.id,
          name: stored.name,
          file: base64ToArrayBuffer(stored.file, cacheKey),
          mappings: stored.mappings,
          createdAt: new Date(stored.createdAt)
        };
        templates.push(template);
      } catch (error) {
        console.warn('[PTR Templates] Template corrompido removido:', stored.name, error);
        continue;
      }
    }
    
    console.log('[PTR Templates] Templates carregados:', templates.length);
    return templates;
  } catch (error) {
    console.error('[PTR Templates] Erro ao carregar templates, limpando storage:', error);
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
};

// Async helper to safely load active template from storage  
const loadActiveTemplateFromStorageAsync = async (): Promise<PTRTemplate | null> => {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}-active`);
    if (!stored) return null;
    
    const storedTemplate: StoredTemplate = JSON.parse(stored);
    
    // Use cache key for active template
    const cacheKey = `active-${storedTemplate.id}`;
    
    const template: PTRTemplate = {
      id: storedTemplate.id,
      name: storedTemplate.name,
      file: base64ToArrayBuffer(storedTemplate.file, cacheKey),
      mappings: storedTemplate.mappings,
      createdAt: new Date(storedTemplate.createdAt)
    };
    
    console.log('[PTR Templates] Template ativo carregado:', template.name);
    return template;
  } catch (error) {
    console.error('[PTR Templates] Erro ao carregar template ativo, removendo:', error);
    localStorage.removeItem(`${STORAGE_KEY}-active`);
    return null;
  }
};

export const usePTRTemplates = () => {
  const [templates, setTemplates] = useState<PTRTemplate[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<PTRTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Async loading on mount - prevents blocking initialization
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('[PTR Templates] Iniciando carregamento assíncrono...');
        
        // Load templates and active template in parallel
        const [loadedTemplates, loadedActiveTemplate] = await Promise.all([
          loadTemplatesFromStorageAsync(),
          loadActiveTemplateFromStorageAsync()
        ]);
        
        setTemplates(loadedTemplates);
        setActiveTemplate(loadedActiveTemplate);
        
        console.log('[PTR Templates] Carregamento concluído:', {
          templates: loadedTemplates.length,
          activeTemplate: loadedActiveTemplate?.name || 'nenhum'
        });
      } catch (error) {
        console.error('[PTR Templates] Erro no carregamento inicial:', error);
        // Reset to safe state if loading fails
        setTemplates([]);
        setActiveTemplate(null);
        
        // Clear potentially corrupted data
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(`${STORAGE_KEY}-active`);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const saveTemplate = useCallback(async (template: PTRTemplate) => {
    try {
      console.log('[PTR Templates] Salvando template:', template.name, 'Tamanho:', template.file.byteLength);
      
      const updatedTemplates = [...templates.filter(t => t.id !== template.id), template];
      setTemplates(updatedTemplates);
      
      // Convert to storage format
      const templatesForStorage: StoredTemplate[] = updatedTemplates.map(t => ({
        id: t.id,
        name: t.name,
        file: arrayBufferToBase64(t.file),
        mappings: t.mappings,
        createdAt: t.createdAt.toISOString()
      }));
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(templatesForStorage));
      console.log('[PTR Templates] Template salvo com sucesso no localStorage');
      
      toast({
        title: "Template salvo com sucesso",
        description: `Template "${template.name}" foi salvo.`
      });
    } catch (error) {
      console.error('[PTR Templates] Erro ao salvar template:', error);
      toast({
        title: "Erro ao salvar template",
        description: "Não foi possível salvar o template. Verifique o tamanho do arquivo.",
        variant: "destructive"
      });
    }
  }, [templates]);

  const deleteTemplate = useCallback((templateId: string) => {
    const updatedTemplates = templates.filter(t => t.id !== templateId);
    setTemplates(updatedTemplates);
    
    const templatesForStorage: StoredTemplate[] = updatedTemplates.map(t => ({
      id: t.id,
      name: t.name,
      file: arrayBufferToBase64(t.file),
      mappings: t.mappings,
      createdAt: t.createdAt.toISOString()
    }));
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templatesForStorage));
    
    if (activeTemplate?.id === templateId) {
      setActiveTemplate(null);
      localStorage.removeItem(`${STORAGE_KEY}-active`);
    }
    
    toast({
      title: "Template removido",
      description: "Template foi removido com sucesso."
    });
  }, [templates, activeTemplate]);

  const setActive = useCallback((template: PTRTemplate | null) => {
    console.log('[PTR Templates] Definindo template ativo:', template?.name || 'nenhum');
    setActiveTemplate(template);
    
    if (template) {
      const templateForStorage: StoredTemplate = {
        id: template.id,
        name: template.name,
        file: arrayBufferToBase64(template.file),
        mappings: template.mappings,
        createdAt: template.createdAt.toISOString()
      };
      localStorage.setItem(`${STORAGE_KEY}-active`, JSON.stringify(templateForStorage));
      console.log('[PTR Templates] Template ativo salvo no localStorage');
    } else {
      localStorage.removeItem(`${STORAGE_KEY}-active`);
      console.log('[PTR Templates] Template ativo removido do localStorage');
    }
  }, []);

  const getTemplateFile = useCallback((template: PTRTemplate) => {
    try {
      // Template in memory should always have ArrayBuffer
      if (template.file instanceof ArrayBuffer) {
        console.log('[PTR Templates] Template válido, tamanho:', template.file.byteLength);
        return template.file;
      }
      
      throw new Error('Template em formato inválido na memória');
    } catch (error) {
      console.error('[PTR Templates] Erro ao acessar template:', error);
      throw new Error('Template corrompido ou inválido');
    }
  }, []);

  return {
    templates,
    activeTemplate,
    isLoading,
    saveTemplate,
    deleteTemplate,
    setActive,
    getTemplateFile
  };
};