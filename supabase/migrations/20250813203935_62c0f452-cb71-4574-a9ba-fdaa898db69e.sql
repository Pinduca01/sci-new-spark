-- Adicionar campo data_vencimento_cve
ALTER TABLE public.bombeiros 
ADD COLUMN data_vencimento_cve date;

-- Criar bucket para documentos dos bombeiros
INSERT INTO storage.buckets (id, name, public) VALUES ('documentos-bombeiros', 'documentos-bombeiros', false);

-- Criar políticas RLS para o bucket documentos-bombeiros
CREATE POLICY "Usuários autenticados podem visualizar documentos" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'documentos-bombeiros' AND auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem fazer upload de documentos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'documentos-bombeiros' AND auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar documentos" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'documentos-bombeiros' AND auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem deletar documentos" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'documentos-bombeiros' AND auth.role() = 'authenticated');