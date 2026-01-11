-- =============================================
-- SCHEMA DO DASHBOARD FINANCEIRO
-- =============================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABELAS DE CATEGORIAS
-- =============================================

-- Categorias de Receita
CREATE TABLE IF NOT EXISTS categorias_receita (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome TEXT NOT NULL,
    icone TEXT NOT NULL,
    cor TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categorias de Despesa
CREATE TABLE IF NOT EXISTS categorias_despesa (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome TEXT NOT NULL,
    icone TEXT NOT NULL,
    cor TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tipos de Investimento
CREATE TABLE IF NOT EXISTS tipos_investimento (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome TEXT NOT NULL,
    icone TEXT NOT NULL,
    cor TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABELAS PRINCIPAIS
-- =============================================

-- Receitas
CREATE TABLE IF NOT EXISTS receitas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    descricao TEXT NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    data DATE NOT NULL,
    categoria_id UUID NOT NULL REFERENCES categorias_receita(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Despesas
CREATE TABLE IF NOT EXISTS despesas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    descricao TEXT NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    data DATE NOT NULL,
    categoria_id UUID NOT NULL REFERENCES categorias_despesa(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Aplicações (Investimentos)
CREATE TABLE IF NOT EXISTS aplicacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    descricao TEXT NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    data DATE NOT NULL,
    tipo_investimento_id UUID NOT NULL REFERENCES tipos_investimento(id) ON DELETE RESTRICT,
    tipo_transacao TEXT NOT NULL CHECK (tipo_transacao IN ('aporte', 'resgate')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Metas de Poupança
CREATE TABLE IF NOT EXISTS metas_poupanca (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    valor_meta DECIMAL(10, 2) NOT NULL,
    valor_atual DECIMAL(10, 2) DEFAULT 0,
    icone TEXT NOT NULL,
    cor TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Poupança (Transações)
CREATE TABLE IF NOT EXISTS poupanca (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    descricao TEXT NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    data DATE NOT NULL,
    meta_id UUID REFERENCES metas_poupanca(id) ON DELETE SET NULL,
    tipo_transacao TEXT NOT NULL CHECK (tipo_transacao IN ('deposito', 'retirada')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_receitas_user_id ON receitas(user_id);
CREATE INDEX IF NOT EXISTS idx_receitas_data ON receitas(data);
CREATE INDEX IF NOT EXISTS idx_despesas_user_id ON despesas(user_id);
CREATE INDEX IF NOT EXISTS idx_despesas_data ON despesas(data);
CREATE INDEX IF NOT EXISTS idx_aplicacoes_user_id ON aplicacoes(user_id);
CREATE INDEX IF NOT EXISTS idx_aplicacoes_data ON aplicacoes(data);
CREATE INDEX IF NOT EXISTS idx_poupanca_user_id ON poupanca(user_id);
CREATE INDEX IF NOT EXISTS idx_poupanca_data ON poupanca(data);
CREATE INDEX IF NOT EXISTS idx_metas_poupanca_user_id ON metas_poupanca(user_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE receitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE despesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE aplicacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE poupanca ENABLE ROW LEVEL SECURITY;
ALTER TABLE metas_poupanca ENABLE ROW LEVEL SECURITY;

-- Policies para Receitas
CREATE POLICY "Users can view their own receitas" ON receitas
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own receitas" ON receitas
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own receitas" ON receitas
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own receitas" ON receitas
    FOR DELETE USING (auth.uid() = user_id);

-- Policies para Despesas
CREATE POLICY "Users can view their own despesas" ON despesas
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own despesas" ON despesas
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own despesas" ON despesas
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own despesas" ON despesas
    FOR DELETE USING (auth.uid() = user_id);

-- Policies para Aplicações
CREATE POLICY "Users can view their own aplicacoes" ON aplicacoes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own aplicacoes" ON aplicacoes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own aplicacoes" ON aplicacoes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own aplicacoes" ON aplicacoes
    FOR DELETE USING (auth.uid() = user_id);

-- Policies para Poupança
CREATE POLICY "Users can view their own poupanca" ON poupanca
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own poupanca" ON poupanca
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own poupanca" ON poupanca
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own poupanca" ON poupanca
    FOR DELETE USING (auth.uid() = user_id);

-- Policies para Metas de Poupança
CREATE POLICY "Users can view their own metas" ON metas_poupanca
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own metas" ON metas_poupanca
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own metas" ON metas_poupanca
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own metas" ON metas_poupanca
    FOR DELETE USING (auth.uid() = user_id);

-- Policies para Categorias (leitura pública)
ALTER TABLE categorias_receita ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias_despesa ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipos_investimento ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categorias_receita" ON categorias_receita
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view categorias_despesa" ON categorias_despesa
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view tipos_investimento" ON tipos_investimento
    FOR SELECT USING (true);

-- =============================================
-- TRIGGERS PARA UPDATED_AT
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_receitas_updated_at BEFORE UPDATE ON receitas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_despesas_updated_at BEFORE UPDATE ON despesas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_aplicacoes_updated_at BEFORE UPDATE ON aplicacoes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_poupanca_updated_at BEFORE UPDATE ON poupanca
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_metas_poupanca_updated_at BEFORE UPDATE ON metas_poupanca
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
