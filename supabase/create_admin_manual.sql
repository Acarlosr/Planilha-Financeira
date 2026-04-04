-- =============================================
-- SOLUÇÃO: Criar Admin sem Trigger
-- Execute este script direto no SQL Editor
-- =============================================

-- PASSO 1: Desabilitar trigger temporariamente
-- Isso previne o erro ao criar usuário
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS create_user_profile();

-- PASSO 2: Agora você pode criar usuário via UI
-- Vá em Authentication > Users > Add user
-- Email: seu@email.com
-- Password: sua_senha
-- ☑️ Auto Confirm User

-- PASSO 3: Depois de criar, execute este SQL
-- (Substitua os UUIDs pelos valores corretos)

-- 3.1. Buscar ID do plano free
SELECT id, slug FROM subscription_plans WHERE slug = 'free';
-- Copie o UUID do resultado acima

-- 3.2. Buscar ID do usuário recém-criado
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 1;
-- Copie o UUID do usuário

-- 3.3. Criar perfil manualmente
-- SUBSTITUIR OS UUIDs ABAIXO PELOS VALORES COPIADOS:
INSERT INTO user_profiles (
    id,
    email,
    full_name,
    role,
    subscription_plan_id,
    subscription_status,
    trial_ends_at
)
SELECT
    'COLE_UUID_DO_USUARIO_AQUI'::uuid,
    'seu@email.com',
    'Admin',
    'admin',
    id,  -- pega automaticamente do plano free
    'active',
    NOW() + INTERVAL '7 days'
FROM subscription_plans
WHERE slug = 'free';

-- PASSO 4: Verificar se funcionou
SELECT 
    up.id,
    up.email,
    up.role,
    sp.name as plano,
    up.subscription_status
FROM user_profiles up
LEFT JOIN subscription_plans sp ON up.subscription_plan_id = sp.id
WHERE up.role = 'admin';

-- =============================================
-- RESULTADO ESPERADO:
-- Deve mostrar seu usuário com role = admin
-- =============================================

-- OPCIONAL: Recriar trigger para futuros usuários
-- (Execute apenas se quiser que novos usuários tenham perfil automático)
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
DECLARE
    free_plan_id UUID;
BEGIN
    SELECT id INTO free_plan_id FROM subscription_plans WHERE slug = 'free' LIMIT 1;
    
    INSERT INTO user_profiles (id, email, full_name, subscription_plan_id)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'nome', ''),
        free_plan_id
    );
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Em caso de erro, apenas loga mas não falha a criação do usuário
        RAISE WARNING 'Failed to create user profile: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_user_profile();
