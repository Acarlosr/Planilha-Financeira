-- =============================================
-- SCHEMA ADICIONAL: CARTÕES E PARCELAS
-- Execute este script DEPOIS do schema.sql principal
-- =============================================

-- =============================================
-- TABELA DE CARTÕES
-- =============================================

CREATE TABLE IF NOT EXISTS cartoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    banco TEXT NOT NULL,
    bandeira TEXT NOT NULL CHECK (bandeira IN ('Visa', 'Mastercard', 'Amex', 'Elo')),
    ultimos_digitos TEXT,
    cor TEXT NOT NULL,
    limite DECIMAL(10, 2) DEFAULT 0,
    dia_fechamento INTEGER DEFAULT 1,
    dia_vencimento INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE cartoes ADD COLUMN IF NOT EXISTS limite DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE cartoes ADD COLUMN IF NOT EXISTS dia_fechamento INTEGER DEFAULT 1;
ALTER TABLE cartoes ADD COLUMN IF NOT EXISTS dia_vencimento INTEGER DEFAULT 10;

-- =============================================
-- ADICIONAR CAMPOS DE PARCELAMENTO EM DESPESAS
-- =============================================

-- Adicionar campo de cartão
ALTER TABLE despesas ADD COLUMN IF NOT EXISTS cartao_id UUID REFERENCES cartoes(id) ON DELETE SET NULL;
ALTER TABLE despesas ADD COLUMN IF NOT EXISTS boleto BOOLEAN DEFAULT FALSE;
ALTER TABLE despesas ADD COLUMN IF NOT EXISTS data_vencimento DATE;

-- Adicionar campos de parcelamento
ALTER TABLE despesas ADD COLUMN IF NOT EXISTS parcelada BOOLEAN DEFAULT FALSE;
ALTER TABLE despesas ADD COLUMN IF NOT EXISTS parcela_atual INTEGER;
ALTER TABLE despesas ADD COLUMN IF NOT EXISTS parcela_total INTEGER;
ALTER TABLE despesas ADD COLUMN IF NOT EXISTS parcela_grupo_id UUID;

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_cartoes_user_id ON cartoes(user_id);
CREATE INDEX IF NOT EXISTS idx_despesas_cartao_id ON despesas(cartao_id);
CREATE INDEX IF NOT EXISTS idx_despesas_data_vencimento ON despesas(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_despesas_parcela_grupo ON despesas(parcela_grupo_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE cartoes ENABLE ROW LEVEL SECURITY;

-- Policies para Cartões
CREATE POLICY "Users can view their own cartoes" ON cartoes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cartoes" ON cartoes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cartoes" ON cartoes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cartoes" ON cartoes
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- TRIGGER PARA UPDATED_AT
-- =============================================

CREATE TRIGGER update_cartoes_updated_at BEFORE UPDATE ON cartoes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
