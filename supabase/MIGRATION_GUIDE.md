# Aplicando Migrations SaaS no Supabase

Este guia contém os passos para aplicar as migrations do sistema SaaS no seu projeto Supabase.

## Passo 1: Acessar o Supabase SQL Editor

1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Clique em "SQL Editor" no menu lateral

## Passo 2: Executar a Migration

1. Abra o arquivo `supabase/saas_schema.sql`
2. Copie todo o conteúdo
3. Cole no SQL Editor do Supabase
4. Clique em "Run" para executar

**Importante**: Execute o script completo de uma só vez. Ele inclui:
- Criação de todas as tabelas
- RLS Policies
- Triggers
- Functions
- Materialized View
- Dados seed (planos Free, Pro, Enterprise)

## Passo 3: Verificar Instalação

Execute este SQL para verificar se tudo foi criado corretamente:

```sql
-- Verificar tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'subscription_plans',
    'user_profiles',
    'dashboard_preferences',
    'user_activity_logs',
    'transaction_quotas'
);

-- Verificar planos inseridos
SELECT * FROM subscription_plans ORDER BY price_monthly;

-- Verificar materialized view
SELECT * FROM admin_metrics;
```

Você deve ver:
- 5 tabelas listadas
- 3 planos (Free, Pro, Enterprise)
- Métricas admin inicializadas

## Passo 4: Criar Primeiro Usuário Admin

### Opção A: Via Supabase Auth UI

1. Vá em "Authentication" > "Users"
2. Clique em "Add User"
3. Preencha email e senha
4. Depois que o usuário for criado, execute este SQL:

```sql
-- Substituir 'email@exemplo.com' pelo email do admin
UPDATE user_profiles 
SET role = 'admin'
WHERE email = 'email@exemplo.com';
```

### Opção B: Via SQL (para desenvolvimento)

```sql
-- APENAS PARA DESENVOLVIMENTO/TESTE
-- Em produção, use a opção A

-- 1. Criar usuário no auth.users (pode precisar de service_role key)
-- Nota: Isso geralmente é feito via API do Supabase em produção

-- 2. Após criar o usuário, atualizar o perfil para admin
UPDATE user_profiles 
SET role = 'admin'
WHERE id = 'UUID_DO_USUARIO_AQUI';
```

## Passo 5: Configurar Refresh Automático das Métricas (Opcional)

Para atualizar as métricas admin automaticamente a cada hora:

```sql
-- Criar extensão pg_cron se ainda não existir
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Agendar refresh a cada hora
SELECT cron.schedule(
    'refresh-admin-metrics',
    '0 * * * *', -- A cada hora
    $$REFRESH MATERIALIZED VIEW CONCURRENTLY admin_metrics$$
);
```

## Passo 6: Testar RLS Policies

### Teste 1: Usuário comum não pode ver outros perfis

```sql
-- Fazer login como usuário comum no app
-- Tentar buscar todos os perfis (deve retornar apenas o próprio)
SELECT * FROM user_profiles;
```

### Teste 2: Admin pode ver todos os perfis

```sql
-- Fazer login como admin no app
-- Buscar todos os perfis (deve retornar todos)
SELECT * FROM user_profiles;
```

### Teste 3: Activity logs visível apenas para admin

```sql
-- Como usuário comum: deve retornar vazio ou erro de permissão
SELECT * FROM user_activity_logs;

-- Como admin: deve retornar todos os logs
SELECT * FROM user_activity_logs ORDER BY created_at DESC LIMIT 10;
```

## Passo 7: Inicializar Preferências de Dashboard (Opcional)

Para usuários existentes, você pode inicializar as preferências de dashboard:

```sql
-- Para todos os usuários existentes
DO $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN SELECT id FROM user_profiles LOOP
        PERFORM initialize_dashboard_preferences(user_record.id);
    END LOOP;
END $$;
```

## Passo 8: Limpar cards legados do dashboard existente

Se o projeto ja tinha preferencias salvas antes da reducao para os 6 cards atuais, execute tambem o arquivo `supabase/cleanup_dashboard_preferences.sql`.

Esse script:
- atualiza a funcao `initialize_dashboard_preferences` para usar apenas os cards atuais;
- remove registros antigos de `dashboard_preferences` que nao existem mais no frontend.

SQL de verificacao opcional:

```sql
SELECT DISTINCT card_id
FROM dashboard_preferences
ORDER BY card_id;
```

Resultado esperado:
- `budget_vs_actual`
- `bills_calendar`
- `financial_radar`
- `summary_cards`
- `cash_flow_chart`
- `transactions_table`

## Troubleshooting

### Erro: "auth.users does not exist"

Se você receber este erro ao criar o trigger `on_auth_user_created`:

```sql
-- Certifique-se de que você está usando o schema correto
-- O schema auth é interno do Supabase
-- Execute apenas: DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
```

### Erro: "permission denied for schema auth"

Você precisa executar o SQL com privilégios suficientes:
- Use o SQL Editor do Supabase Dashboard (conecta como postgres)
- OU use a service_role key via API

### Erro ao criar Materialized View

```sql
-- Se a view já existir, delete primeiro:
DROP MATERIALIZED VIEW IF EXISTS admin_metrics;

-- Depois execute novamente o CREATE MATERIALIZED VIEW
```

## Próximos Passos

Após aplicar as migrations:

1. ✅ **Criar Context de Subscription** (`SubscriptionContext.tsx`)
2. ✅ **Implementar `useFeatureAccess` hook**
3. ✅ **Criar Middleware de proteção de rotas**
4. ✅ **Implementar área de admin**
5. ✅ **Criar componentes de customização do dashboard**

## Notas Importantes

> [!IMPORTANT]
> - O primeiro usuário admin deve ser criado manualmente
> - RLS policies garantem segurança dos dados
> - Novos usuários automaticamente recebem plano Free
> - Trial period é de 7 dias por padrão
> - O trigger `on_auth_user_created` cria o perfil automaticamente

> [!WARNING]
> - Não delete subscription_plans se usuários estiverem usando
> - Sempre teste RLS policies em ambiente de dev primeiro
> - Materialized view precisa ser refreshed periodicamente
