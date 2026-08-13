-- =============================================
-- MIGRAÇÃO ADITIVA — FASE 1: PERSISTÊNCIA DE INVESTIMENTOS
-- Data: 2026-08-12
--
-- Cria 5 tabelas novas para as telas de Ações, FIIs, Tesouro Direto
-- e CDB/LCI/LCA, que hoje guardam dados só em memória (useState local)
-- e perdem tudo ao recarregar a página.
--
-- 100% ADITIVO: nenhuma tabela existente é alterada, renomeada ou
-- removida. Não afeta receitas, despesas, cartões, aplicacoes,
-- poupanca, metas_poupanca nem nenhum dado já em produção.
--
-- Execute no SQL Editor do Supabase. Idealmente rode primeiro em um
-- projeto de staging/cópia antes de aplicar em produção.
-- =============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Função de updated_at (idempotente — já deve existir do schema.sql,
-- recriada aqui via CREATE OR REPLACE para a migração ser autossuficiente)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TABELA: posicoes_acoes
-- =============================================

CREATE TABLE IF NOT EXISTS posicoes_acoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    ticker TEXT NOT NULL,
    empresa TEXT NOT NULL,
    quantidade NUMERIC(18, 8) NOT NULL,
    preco_medio NUMERIC(14, 4) NOT NULL,
    valor_atual NUMERIC(14, 2) NOT NULL DEFAULT 0,
    corretora TEXT,
    data_compra DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABELA: posicoes_fiis
-- =============================================

CREATE TABLE IF NOT EXISTS posicoes_fiis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    ticker TEXT NOT NULL,
    nome TEXT NOT NULL,
    setor TEXT NOT NULL,
    quantidade NUMERIC(18, 8) NOT NULL,
    preco_medio NUMERIC(14, 4) NOT NULL,
    valor_atual NUMERIC(14, 2) NOT NULL DEFAULT 0,
    dy_anual NUMERIC(6, 2) NOT NULL DEFAULT 0,
    cnpj TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABELA: titulos_tesouro
-- =============================================

CREATE TABLE IF NOT EXISTS titulos_tesouro (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('selic', 'ipca', 'pre')),
    data_compra DATE NOT NULL,
    vencimento DATE NOT NULL,
    valor_aplicado NUMERIC(14, 2) NOT NULL,
    quantidade NUMERIC(18, 8) NOT NULL,
    taxa TEXT NOT NULL,
    rendimento_acumulado NUMERIC(14, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABELA: titulos_renda_fixa (CDB / LCI / LCA)
-- =============================================

CREATE TABLE IF NOT EXISTS titulos_renda_fixa (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL CHECK (tipo IN ('CDB', 'LCI', 'LCA')),
    instituicao TEXT NOT NULL,
    indexador TEXT NOT NULL CHECK (indexador IN ('CDI', 'IPCA', 'pre')),
    taxa TEXT NOT NULL,
    data_aplicacao DATE NOT NULL,
    vencimento DATE NOT NULL,
    valor_aplicado NUMERIC(14, 2) NOT NULL,
    rendimento_acumulado NUMERIC(14, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABELA: proventos (dividendos, JCP, rendimento FII, amortização)
-- =============================================

CREATE TABLE IF NOT EXISTS proventos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    ticker TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('dividendo', 'jcp', 'rendimento_fii', 'amortizacao')),
    data_ex DATE NOT NULL,
    data_pagamento DATE NOT NULL,
    valor_por_cota NUMERIC(14, 6) NOT NULL,
    quantidade_na_data NUMERIC(18, 8) NOT NULL,
    valor_total NUMERIC(14, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ÍNDICES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_posicoes_acoes_user_id ON posicoes_acoes(user_id);
CREATE INDEX IF NOT EXISTS idx_posicoes_fiis_user_id ON posicoes_fiis(user_id);
CREATE INDEX IF NOT EXISTS idx_titulos_tesouro_user_id ON titulos_tesouro(user_id);
CREATE INDEX IF NOT EXISTS idx_titulos_renda_fixa_user_id ON titulos_renda_fixa(user_id);
CREATE INDEX IF NOT EXISTS idx_proventos_user_id ON proventos(user_id);
CREATE INDEX IF NOT EXISTS idx_proventos_ticker ON proventos(ticker);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE posicoes_acoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE posicoes_fiis ENABLE ROW LEVEL SECURITY;
ALTER TABLE titulos_tesouro ENABLE ROW LEVEL SECURITY;
ALTER TABLE titulos_renda_fixa ENABLE ROW LEVEL SECURITY;
ALTER TABLE proventos ENABLE ROW LEVEL SECURITY;

-- Policies: posicoes_acoes
CREATE POLICY "Users can view their own posicoes_acoes" ON posicoes_acoes
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own posicoes_acoes" ON posicoes_acoes
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own posicoes_acoes" ON posicoes_acoes
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own posicoes_acoes" ON posicoes_acoes
    FOR DELETE USING (auth.uid() = user_id);

-- Policies: posicoes_fiis
CREATE POLICY "Users can view their own posicoes_fiis" ON posicoes_fiis
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own posicoes_fiis" ON posicoes_fiis
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own posicoes_fiis" ON posicoes_fiis
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own posicoes_fiis" ON posicoes_fiis
    FOR DELETE USING (auth.uid() = user_id);

-- Policies: titulos_tesouro
CREATE POLICY "Users can view their own titulos_tesouro" ON titulos_tesouro
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own titulos_tesouro" ON titulos_tesouro
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own titulos_tesouro" ON titulos_tesouro
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own titulos_tesouro" ON titulos_tesouro
    FOR DELETE USING (auth.uid() = user_id);

-- Policies: titulos_renda_fixa
CREATE POLICY "Users can view their own titulos_renda_fixa" ON titulos_renda_fixa
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own titulos_renda_fixa" ON titulos_renda_fixa
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own titulos_renda_fixa" ON titulos_renda_fixa
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own titulos_renda_fixa" ON titulos_renda_fixa
    FOR DELETE USING (auth.uid() = user_id);

-- Policies: proventos
CREATE POLICY "Users can view their own proventos" ON proventos
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own proventos" ON proventos
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own proventos" ON proventos
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own proventos" ON proventos
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- TRIGGERS DE UPDATED_AT
-- =============================================

CREATE TRIGGER update_posicoes_acoes_updated_at BEFORE UPDATE ON posicoes_acoes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posicoes_fiis_updated_at BEFORE UPDATE ON posicoes_fiis
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_titulos_tesouro_updated_at BEFORE UPDATE ON titulos_tesouro
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_titulos_renda_fixa_updated_at BEFORE UPDATE ON titulos_renda_fixa
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proventos_updated_at BEFORE UPDATE ON proventos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
