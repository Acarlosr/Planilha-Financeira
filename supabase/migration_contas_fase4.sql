-- =============================================
-- MIGRAÇÃO ADITIVA — FASE 4.1: CONTAS BANCÁRIAS
-- Data: 2026-08-12
--
-- Cria a tabela `contas` (carteiras/contas bancárias do usuário) e adiciona
-- uma coluna opcional `conta_id` em `receitas` e `despesas` para vincular
-- cada lançamento a uma conta. Tudo aditivo:
--   - `contas` é tabela nova.
--   - `conta_id` é coluna NOVA, NULLABLE, com ON DELETE SET NULL — excluir
--     uma conta nunca apaga receitas/despesas, só desvincula.
--   - Lançamentos existentes continuam funcionando exatamente como hoje,
--     com conta_id = NULL ("sem conta vinculada").
--
-- Execute no SQL Editor do Supabase, DEPOIS das migrações de Fase 1 e 2.
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
-- TABELA: contas
-- =============================================

CREATE TABLE IF NOT EXISTS contas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    instituicao TEXT,
    tipo TEXT NOT NULL CHECK (tipo IN ('corrente', 'poupanca', 'carteira', 'investimento', 'outro')) DEFAULT 'corrente',
    cor TEXT NOT NULL DEFAULT '#3B82F6',
    icone TEXT NOT NULL DEFAULT '🏦',
    saldo_inicial NUMERIC(14, 2) NOT NULL DEFAULT 0,
    ativa BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contas_user_id ON contas(user_id);

ALTER TABLE contas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own contas" ON contas
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own contas" ON contas
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own contas" ON contas
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own contas" ON contas
    FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_contas_updated_at BEFORE UPDATE ON contas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- VÍNCULO OPCIONAL: receitas.conta_id / despesas.conta_id
-- =============================================

ALTER TABLE receitas ADD COLUMN IF NOT EXISTS conta_id UUID REFERENCES contas(id) ON DELETE SET NULL;
ALTER TABLE despesas ADD COLUMN IF NOT EXISTS conta_id UUID REFERENCES contas(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_receitas_conta_id ON receitas(conta_id);
CREATE INDEX IF NOT EXISTS idx_despesas_conta_id ON despesas(conta_id);
