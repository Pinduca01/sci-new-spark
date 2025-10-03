-- Verificar e criar política RLS para profiles permitindo usuários lerem seus próprios dados
-- Esta política é essencial para evitar loading infinito quando o usuário recarrega a página

-- Primeiro, remover política existente se houver conflito
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;

-- Criar política que permite usuários autenticados lerem apenas seu próprio profile
CREATE POLICY "profiles_select_own"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Garantir que RLS está habilitado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;