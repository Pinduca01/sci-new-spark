import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

export interface PTRTemplate {
  id: string;
  name: string;
  file: ArrayBuffer;
  mappings: {
    data?: string;
    codigo?: string;
    participantes_inicio?: string;
    ptr_inicio?: string;
    observacoes?: string;
  };
  createdAt: Date;
}

const STORAGE_KEY = 'ptr-excel-templates';

export const usePTRTemplates = () => {
  const [templates, setTemplates] = useState<PTRTemplate[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [activeTemplate, setActiveTemplate] = useState<PTRTemplate | null>(() => {
    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}-active`);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const saveTemplate = useCallback(async (template: PTRTemplate) => {
    try {
      const updatedTemplates = [...templates.filter(t => t.id !== template.id), template];
      setTemplates(updatedTemplates);
      
      // Convert ArrayBuffer to base64 for storage
      const base64 = btoa(String.fromCharCode(...new Uint8Array(template.file)));
      const templateForStorage = {
        ...template,
        file: base64
      };
      
      const templatesForStorage = updatedTemplates.map(t => 
        t.id === template.id ? templateForStorage : {
          ...t,
          file: typeof t.file === 'string' ? t.file : btoa(String.fromCharCode(...new Uint8Array(t.file)))
        }
      );
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(templatesForStorage));
      toast({
        title: "Template salvo com sucesso",
        description: `Template "${template.name}" foi salvo.`
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar template",
        description: "Não foi possível salvar o template.",
        variant: "destructive"
      });
    }
  }, [templates]);

  const deleteTemplate = useCallback((templateId: string) => {
    const updatedTemplates = templates.filter(t => t.id !== templateId);
    setTemplates(updatedTemplates);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTemplates));
    
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
    setActiveTemplate(template);
    if (template) {
      const templateForStorage = {
        ...template,
        file: typeof template.file === 'string' ? template.file : btoa(String.fromCharCode(...new Uint8Array(template.file)))
      };
      localStorage.setItem(`${STORAGE_KEY}-active`, JSON.stringify(templateForStorage));
    } else {
      localStorage.removeItem(`${STORAGE_KEY}-active`);
    }
  }, []);

  const getTemplateFile = useCallback((template: PTRTemplate) => {
    if (template.file instanceof ArrayBuffer) {
      return template.file;
    }
    // Convert base64 back to ArrayBuffer
    const binaryString = atob(template.file as string);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }, []);

  return {
    templates,
    activeTemplate,
    saveTemplate,
    deleteTemplate,
    setActive,
    getTemplateFile
  };
};