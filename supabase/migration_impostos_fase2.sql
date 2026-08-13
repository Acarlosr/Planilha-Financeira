-- =============================================
-- MIGRAÇÃO ADITIVA — FASE 2: VENDAS E APURAÇÃO DE IR/DARF
-- Data: 2026-08-12
--
-- Cria a tabela de vendas de ativos (Ações e FIIs), base para o motor
-- de apuração de imposto de renda / DARF. A apuração mensal em si é
-- calculada em runtime a partir dessas linhas (não é persistida) —
-- ver src/lib/impostoInvestimentos.ts.
--
-- 100% ADITIVO: nenhuma tabela existente é alterada, renomeada ou
-- removida. Depende apenas de auth.users (já existente). Execute
-- DEPOIS de migration_investimentos_fase1.sql.
--
-- Execute no SQL Editor do Supabase. Idealmente rode primeiro em um
-- projeto de staging/cópia antes de aplicar em produção.
-- =============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TABELA: vendas_ativos
-- =============================================

CREATE TABLE IF NOT EXISTS vendas_ativos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    classe TEXT NOT NULL CHECK (classe IN ('acao', 'fii')),
    ticker TEXT NOT NULL,
    modalidade TEXT NOT NULL CHECK (modalidade IN ('swing_trade', 'day_trade')) DEFAULT 'swing_trade',
    quantidade NUMERIC(18, 8) NOT NULL,
    preco_venda NUMERIC(14, 4) NOT NULL,
    preco_custo NUMERIC(14, 4) NOT NULL, -- preço médio da posição no momento da venda
    taxas NUMERIC(14, 2) NOT NULL DEFAULT 0,
    valor_venda NUMERIC(14, 2) NOT NULL, -- quantidade * preco_venda - taxas
    valor_custo NUMERIC(14, 2) NOT NULL, -- quantidade * preco_custo
    resultado NUMERIC(14, 2) NOT NULL,   -- valor_venda - valor_custo (lucro ou prejuízo)
    data_venda DATE NOT NULL,
    posicao_id UUID, -- referência informativa à posicao_acoes/posicao_fiis de origem (sem FK, pois pode ter sido excluída)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendas_ativos_user_id ON vendas_ativos(user_id);
CREATE INDEX IF NOT EXISTS idx_vendas_ativos_data_venda ON vendas_ativos(data_venda);
CREATE INDEX IF NOT EXISTS idx_vendas_ativos_classe ON vendas_ativos(classe);

ALTER TABLE vendas_ativos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own vendas_ativos" ON vendas_ativos
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own vendas_ativos" ON vendas_ativos
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own vendas_ativos" ON vendas_ativos
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own vendas_ativos" ON vendas_ativos
    FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_vendas_ativos_updated_at BEFORE UPDATE ON vendas_ativos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
