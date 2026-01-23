-- =============================================
-- SAAS TRANSFORMATION - SCHEMA ADDITIONS
-- Phase 1: Core SaaS Infrastructure
-- =============================================

-- =============================================
-- 1. SUBSCRIPTION PLANS
-- =============================================

CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10, 2) DEFAULT 0,
    price_yearly DECIMAL(10, 2) DEFAULT 0,
    max_transactions INTEGER, -- NULL = unlimited
    max_dashboard_cards INTEGER DEFAULT 10,
    features JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir planos iniciais
INSERT INTO subscription_plans (name, slug, description, price_monthly, price_yearly, max_transactions, max_dashboard_cards, features) VALUES
('Free', 'free', 'Plano gratuito com funcionalidades básicas', 0, 0, 10, 3, 
    '["basic_dashboard", "transaction_tracking", "3_cards"]'::jsonb),
('Pro', 'pro', 'Plano ideal para uso pessoal com recursos avançados', 10.99, 89.90, NULL, 10, 
    '["basic_dashboard", "transaction_tracking", "unlimited_cards", "advanced_reports", "export_data", "24_months_history", "custom_categories"]'::jsonb),
('Enterprise', 'enterprise', 'Solução completa para empresas e profissionais', 99.90, 999.00, NULL, NULL, 
    '["basic_dashboard", "transaction_tracking", "unlimited_cards", "advanced_reports", "export_data", "unlimited_history", "custom_categories", "api_access", "priority_support", "multi_user", "sla_guarantee"]'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- 2. USER PROFILES
-- =============================================

CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    subscription_plan_id UUID REFERENCES subscription_plans(id) DEFAULT (SELECT id FROM subscription_plans WHERE slug = 'free'),
    subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'canceled', 'expired', 'trial')),
    trial_ends_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    subscription_started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    subscription_ends_at TIMESTAMP WITH TIME ZONE,
    is_suspended BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 3. DASHBOARD PREFERENCES
-- =============================================

CREATE TABLE IF NOT EXISTS dashboard_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    card_id TEXT NOT NULL,
    is_visible BOOLEAN DEFAULT true,
    position INTEGER DEFAULT 0,
    size TEXT DEFAULT 'default' CHECK (size IN ('small', 'default', 'large')),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, card_id)
);

-- Cards disponíveis padrão
-- Será inserido automaticamente quando usuário fizer primeiro login
-- via trigger ou app logic

-- =============================================
-- 4. USER ACTIVITY LOGS
-- =============================================

CREATE TABLE IF NOT EXISTS user_activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id UUID,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index para queries de admin
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON user_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON user_activity_logs(action);

-- =============================================
-- 5. TRANSACTION QUOTAS (para controle de limites)
-- =============================================

CREATE TABLE IF NOT EXISTS transaction_quotas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    transactions_count INTEGER DEFAULT 0,
    quota_limit INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, period_start)
);

-- =============================================
-- INDICES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_plan ON user_profiles(subscription_plan_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON user_profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_dashboard_prefs_user_id ON dashboard_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_transaction_quotas_user_id ON transaction_quotas(user_id);
CREATE INDEX IF NOT EXISTS idx_transaction_quotas_period ON transaction_quotas(period_start, period_end);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- User Profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Admin pode ver todos os perfis
CREATE POLICY "Admins can view all profiles" ON user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = auth.uid() AND up.role = 'admin'
        )
    );

-- Usuários veem apenas seu próprio perfil
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (id = auth.uid());

-- Usuários podem atualizar seu próprio perfil (exceto role)
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (id = auth.uid())
    WITH CHECK (id = auth.uid() AND role = (SELECT role FROM user_profiles WHERE id = auth.uid()));

-- Apenas admins podem inserir perfis
CREATE POLICY "Admins can insert profiles" ON user_profiles
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Dashboard Preferences
ALTER TABLE dashboard_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own dashboard preferences" ON dashboard_preferences
    FOR ALL USING (user_id = auth.uid());

-- Admin pode ver todas as preferências
CREATE POLICY "Admins can view all preferences" ON dashboard_preferences
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Activity Logs
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem ver logs
CREATE POLICY "Admins can view all activity logs" ON user_activity_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Sistema pode inserir logs (via service_role)
CREATE POLICY "System can insert activity logs" ON user_activity_logs
    FOR INSERT WITH CHECK (true);

-- Transaction Quotas
ALTER TABLE transaction_quotas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own quotas" ON transaction_quotas
    FOR SELECT USING (user_id = auth.uid());

-- Admin pode ver todos os quotas
CREATE POLICY "Admins can view all quotas" ON transaction_quotas
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Subscription Plans (público para leitura)
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active plans" ON subscription_plans
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage plans" ON subscription_plans
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =============================================
-- TRIGGERS
-- =============================================

-- Atualizar updated_at automaticamente
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dashboard_preferences_updated_at BEFORE UPDATE ON dashboard_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transaction_quotas_updated_at BEFORE UPDATE ON transaction_quotas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- FUNCTION: Criar perfil ao registrar usuário
-- =============================================

CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
DECLARE
    free_plan_id UUID;
BEGIN
    -- Buscar ID do plano free
    SELECT id INTO free_plan_id FROM subscription_plans WHERE slug = 'free' LIMIT 1;
    
    -- Criar perfil do usuário
    INSERT INTO user_profiles (id, email, full_name, subscription_plan_id)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'nome', ''),
        free_plan_id
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- =============================================
-- FUNCTION: Inicializar dashboard preferences
-- =============================================

CREATE OR REPLACE FUNCTION initialize_dashboard_preferences(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
    default_cards TEXT[] := ARRAY[
        'summary_cards',
        'cash_flow_chart',
        'transactions_table',
        'category_breakdown',
        'monthly_comparison',
        'savings_goals',
        'investment_portfolio',
        'crypto_portfolio',
        'bills_calendar',
        'budget_vs_actual'
    ];
    card TEXT;
    free_plan_max_cards INT;
    position_counter INT := 0;
BEGIN
    -- Buscar limite de cards do plano free
    SELECT max_dashboard_cards INTO free_plan_max_cards 
    FROM subscription_plans 
    WHERE slug = 'free';
    
    -- Inserir preferências padrão
    FOREACH card IN ARRAY default_cards
    LOOP
        INSERT INTO dashboard_preferences (user_id, card_id, is_visible, position)
        VALUES (
            p_user_id,
            card,
            position_counter < free_plan_max_cards, -- Apenas primeiros N cards visíveis no free
            position_counter
        )
        ON CONFLICT (user_id, card_id) DO NOTHING;
        
        position_counter := position_counter + 1;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- FUNCTION: Verificar quota de transações
-- =============================================

CREATE OR REPLACE FUNCTION check_transaction_quota(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_plan_id UUID;
    max_transactions INT;
    current_month_start DATE;
    current_month_end DATE;
    current_count INT;
BEGIN
    -- Buscar plano do usuário
    SELECT subscription_plan_id INTO user_plan_id
    FROM user_profiles
    WHERE id = p_user_id;
    
    -- Buscar limite do plano
    SELECT sp.max_transactions INTO max_transactions
    FROM subscription_plans sp
    WHERE sp.id = user_plan_id;
    
    -- Se NULL = ilimitado
    IF max_transactions IS NULL THEN
        RETURN true;
    END IF;
    
    -- Definir período (mês atual)
    current_month_start := DATE_TRUNC('month', NOW())::DATE;
    current_month_end := (DATE_TRUNC('month', NOW()) + INTERVAL '1 month - 1 day')::DATE;
    
    -- Contar transações do mês
    SELECT COUNT(*) INTO current_count
    FROM (
        SELECT id FROM receitas WHERE user_id = p_user_id AND data >= current_month_start AND data <= current_month_end
        UNION ALL
        SELECT id FROM despesas WHERE user_id = p_user_id AND data >= current_month_start AND data <= current_month_end
    ) AS all_transactions;
    
    -- Atualizar quota
    INSERT INTO transaction_quotas (user_id, period_start, period_end, transactions_count, quota_limit)
    VALUES (p_user_id, current_month_start, current_month_end, current_count, max_transactions)
    ON CONFLICT (user_id, period_start)
    DO UPDATE SET transactions_count = current_count, updated_at = NOW();
    
    -- Retornar se está dentro do limite
    RETURN current_count < max_transactions;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- MATERIALIZED VIEW: Admin Metrics
-- =============================================

CREATE MATERIALIZED VIEW IF NOT EXISTS admin_metrics AS
SELECT 
    COUNT(DISTINCT up.id) as total_users,
    COUNT(DISTINCT CASE WHEN up.created_at > NOW() - INTERVAL '30 days' THEN up.id END) as new_users_30d,
    COUNT(DISTINCT CASE WHEN up.created_at > NOW() - INTERVAL '7 days' THEN up.id END) as new_users_7d,
    COUNT(DISTINCT CASE WHEN sp.slug = 'free' THEN up.id END) as free_plan_users,
    COUNT(DISTINCT CASE WHEN sp.slug = 'pro' THEN up.id END) as pro_plan_users,
    COUNT(DISTINCT CASE WHEN sp.slug = 'enterprise' THEN up.id END) as enterprise_users,
    COUNT(DISTINCT CASE WHEN up.subscription_status = 'active' THEN up.id END) as active_subscriptions,
    COUNT(DISTINCT CASE WHEN up.subscription_status = 'trial' THEN up.id END) as trial_users,
    COALESCE(SUM(CASE WHEN sp.slug = 'pro' AND up.subscription_status = 'active' THEN sp.price_monthly ELSE 0 END), 0) as monthly_revenue_pro,
    COALESCE(SUM(CASE WHEN sp.slug = 'enterprise' AND up.subscription_status = 'active' THEN sp.price_monthly ELSE 0 END), 0) as monthly_revenue_enterprise,
    NOW() as last_updated
FROM user_profiles up
LEFT JOIN subscription_plans sp ON up.subscription_plan_id = sp.id;

-- Index para refresh mais rápido
CREATE UNIQUE INDEX IF NOT EXISTS admin_metrics_unique_idx ON admin_metrics (last_updated);

-- Function para refresh
CREATE OR REPLACE FUNCTION refresh_admin_metrics()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY admin_metrics;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- COMMENTS (Documentação)
-- =============================================

COMMENT ON TABLE subscription_plans IS 'Planos de assinatura disponíveis (Free, Pro, Enterprise)';
COMMENT ON TABLE user_profiles IS 'Perfis de usuários com informações de assinatura e role';
COMMENT ON TABLE dashboard_preferences IS 'Preferências de customização do dashboard por usuário';
COMMENT ON TABLE user_activity_logs IS 'Logs de atividade para auditoria (visível apenas para admins)';
COMMENT ON TABLE transaction_quotas IS 'Controle de quotas de transações por período';
COMMENT ON FUNCTION check_transaction_quota IS 'Verifica se usuário está dentro da quota mensal de transações';
COMMENT ON FUNCTION initialize_dashboard_preferences IS 'Inicializa preferências padrão do dashboard para novo usuário';
