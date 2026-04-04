-- =============================================
-- CORRIGIR RLS PARA PÁGINAS PÚBLICAS
-- Execute este script no Supabase SQL Editor
-- =============================================

-- PROBLEMA: A página /pricing não consegue carregar os planos
-- CAUSA: RLS está bloqueando acesso anônimo à tabela subscription_plans

-- SOLUÇÃO: Permitir que usuários anônimos vejam os planos ativos

-- Remover política antiga se existir
DROP POLICY IF EXISTS "Anyone can view active plans" ON subscription_plans;

-- Criar nova política permitindo acesso anônimo
CREATE POLICY "Public can view active subscription plans" 
ON subscription_plans
FOR SELECT 
TO anon, authenticated
USING (is_active = true);

-- Verificar se funcionou
SELECT slug, name, price_monthly 
FROM subscription_plans 
WHERE is_active = true;

-- =============================================
-- RESULTADO ESPERADO:
-- Deve retornar os 3 planos (free, pro, enterprise)
-- =============================================

-- OPCIONAL: Verificar todas as policies da tabela
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'subscription_plans';
