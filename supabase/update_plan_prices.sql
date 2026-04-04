-- =============================================
-- ATUALIZAR PREÇOS DOS PLANOS
-- Execute este script para corrigir os valores
-- =============================================

-- Atualizar Plano Pro
UPDATE subscription_plans
SET 
    price_monthly = 10.99,
    price_yearly = 89.90,
    description = 'Plano ideal para uso pessoal com recursos avançados'
WHERE slug = 'pro';

-- Atualizar Plano Enterprise (mantendo valores ou ajuste se necessário)
UPDATE subscription_plans
SET 
    price_monthly = 99.90,
    price_yearly = 999.00,
    description = 'Solução completa para empresas e profissionais'
WHERE slug = 'enterprise';

-- Verificar se os valores foram atualizados
SELECT slug, name, price_monthly, price_yearly 
FROM subscription_plans 
ORDER BY price_monthly;

-- Resultado esperado:
-- free        | Free       | 0.00   | 0.00
-- pro         | Pro        | 10.99  | 89.90
-- enterprise  | Enterprise | 99.90  | 999.00
