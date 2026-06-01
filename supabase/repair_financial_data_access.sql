-- ============================================================
-- SaldoClaro / FinancasPro - reparo de schema, RLS e diagnostico
-- Execute no Supabase SQL Editor do projeto usado em producao.
--
-- Este script:
-- 1. Garante tabelas/colunas usadas pelo dashboard.
-- 2. Recria policies RLS para o usuario ver/salvar os proprios dados.
-- 3. Recarrega o schema cache do PostgREST.
-- 4. Mostra consultas de diagnostico para conferir email/user_id.
--
-- Observacao: o erro
-- relation "supabase_migrations.schema_migrations" does not exist
-- costuma vir do painel/CLI de migrations. Ele nao e, sozinho, a
-- causa de saldo zerado no app. O saldo zerado geralmente e env errado,
-- RLS sem policy, schema cache antigo ou dados salvos em outro user_id.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Mantem compatibilidade com consultas do painel/CLI de migrations.
CREATE SCHEMA IF NOT EXISTS supabase_migrations;

CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (
    version TEXT PRIMARY KEY,
    statements TEXT[],
    name TEXT
);

-- ============================================================
-- Tabelas base
-- ============================================================

CREATE TABLE IF NOT EXISTS public.categorias_receita (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome TEXT NOT NULL,
    icone TEXT NOT NULL,
    cor TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.categorias_despesa (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome TEXT NOT NULL,
    icone TEXT NOT NULL,
    cor TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tipos_investimento (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome TEXT NOT NULL,
    icone TEXT NOT NULL,
    cor TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.receitas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    descricao TEXT NOT NULL,
    valor NUMERIC(10, 2) NOT NULL,
    data DATE NOT NULL,
    categoria_id UUID REFERENCES public.categorias_receita(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.despesas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    descricao TEXT NOT NULL,
    valor NUMERIC(10, 2) NOT NULL,
    data DATE NOT NULL,
    categoria_id UUID REFERENCES public.categorias_despesa(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.aplicacoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    descricao TEXT NOT NULL,
    valor NUMERIC(10, 2) NOT NULL,
    data DATE NOT NULL,
    tipo_investimento_id UUID REFERENCES public.tipos_investimento(id) ON DELETE RESTRICT,
    tipo_transacao TEXT NOT NULL CHECK (tipo_transacao IN ('aporte', 'resgate')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.metas_poupanca (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    valor_meta NUMERIC(10, 2) NOT NULL,
    valor_atual NUMERIC(10, 2) DEFAULT 0,
    icone TEXT NOT NULL DEFAULT 'PiggyBank',
    cor TEXT NOT NULL DEFAULT 'from-amber-500 to-amber-400',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.poupanca (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    descricao TEXT NOT NULL,
    valor NUMERIC(10, 2) NOT NULL,
    data DATE NOT NULL,
    meta_id UUID REFERENCES public.metas_poupanca(id) ON DELETE SET NULL,
    tipo_transacao TEXT NOT NULL CHECK (tipo_transacao IN ('deposito', 'retirada')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.cartoes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    banco TEXT NOT NULL,
    bandeira TEXT NOT NULL,
    ultimos_digitos TEXT,
    cor TEXT NOT NULL DEFAULT 'gray',
    limite NUMERIC(10, 2) DEFAULT 0,
    dia_fechamento INTEGER DEFAULT 1,
    dia_vencimento INTEGER DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Seeds publicos obrigatorios para selects e foreign keys
-- ============================================================

INSERT INTO public.categorias_receita (nome, icone, cor)
SELECT 'Salário Mensal', '💼', 'from-emerald-500 to-emerald-400'
WHERE NOT EXISTS (SELECT 1 FROM public.categorias_receita WHERE nome = 'Salário Mensal');

INSERT INTO public.categorias_receita (nome, icone, cor)
SELECT '13º Salário / Bônus', '🎁', 'from-amber-500 to-amber-400'
WHERE NOT EXISTS (SELECT 1 FROM public.categorias_receita WHERE nome = '13º Salário / Bônus');

INSERT INTO public.categorias_receita (nome, icone, cor)
SELECT 'Freelance / Extra', '⚡', 'from-purple-500 to-purple-400'
WHERE NOT EXISTS (SELECT 1 FROM public.categorias_receita WHERE nome = 'Freelance / Extra');

INSERT INTO public.categorias_receita (nome, icone, cor)
SELECT 'Vendas Online', '📦', 'from-blue-500 to-blue-400'
WHERE NOT EXISTS (SELECT 1 FROM public.categorias_receita WHERE nome = 'Vendas Online');

INSERT INTO public.categorias_receita (nome, icone, cor)
SELECT 'Reembolso', '🔄', 'from-teal-500 to-teal-400'
WHERE NOT EXISTS (SELECT 1 FROM public.categorias_receita WHERE nome = 'Reembolso');

INSERT INTO public.categorias_receita (nome, icone, cor)
SELECT 'Saldo Anterior', '🏦', 'from-indigo-500 to-indigo-400'
WHERE NOT EXISTS (SELECT 1 FROM public.categorias_receita WHERE nome = 'Saldo Anterior');

INSERT INTO public.categorias_despesa (nome, icone, cor)
SELECT 'Moradia', 'Home', 'from-blue-500 to-blue-400'
WHERE NOT EXISTS (SELECT 1 FROM public.categorias_despesa WHERE nome = 'Moradia');

INSERT INTO public.categorias_despesa (nome, icone, cor)
SELECT 'Alimentação', 'Utensils', 'from-orange-500 to-orange-400'
WHERE NOT EXISTS (SELECT 1 FROM public.categorias_despesa WHERE nome = 'Alimentação');

INSERT INTO public.categorias_despesa (nome, icone, cor)
SELECT 'Transporte', 'Car', 'from-purple-500 to-purple-400'
WHERE NOT EXISTS (SELECT 1 FROM public.categorias_despesa WHERE nome = 'Transporte');

INSERT INTO public.categorias_despesa (nome, icone, cor)
SELECT 'Saúde', 'Heart', 'from-red-500 to-red-400'
WHERE NOT EXISTS (SELECT 1 FROM public.categorias_despesa WHERE nome = 'Saúde');

INSERT INTO public.categorias_despesa (nome, icone, cor)
SELECT 'Educação', 'GraduationCap', 'from-green-500 to-green-400'
WHERE NOT EXISTS (SELECT 1 FROM public.categorias_despesa WHERE nome = 'Educação');

INSERT INTO public.categorias_despesa (nome, icone, cor)
SELECT 'Lazer', 'Smartphone', 'from-pink-500 to-pink-400'
WHERE NOT EXISTS (SELECT 1 FROM public.categorias_despesa WHERE nome = 'Lazer');

INSERT INTO public.categorias_despesa (nome, icone, cor)
SELECT 'Vestuário', 'Shirt', 'from-indigo-500 to-indigo-400'
WHERE NOT EXISTS (SELECT 1 FROM public.categorias_despesa WHERE nome = 'Vestuário');

INSERT INTO public.categorias_despesa (nome, icone, cor)
SELECT 'Compras', 'ShoppingCart', 'from-teal-500 to-teal-400'
WHERE NOT EXISTS (SELECT 1 FROM public.categorias_despesa WHERE nome = 'Compras');

INSERT INTO public.tipos_investimento (nome, icone, cor)
SELECT 'Tesouro Direto', '🏛️', 'from-blue-500 to-blue-400'
WHERE NOT EXISTS (SELECT 1 FROM public.tipos_investimento WHERE nome = 'Tesouro Direto');

INSERT INTO public.tipos_investimento (nome, icone, cor)
SELECT 'Ações', '📈', 'from-green-500 to-green-400'
WHERE NOT EXISTS (SELECT 1 FROM public.tipos_investimento WHERE nome = 'Ações');

INSERT INTO public.tipos_investimento (nome, icone, cor)
SELECT 'Fundos Imobiliários', '🏢', 'from-purple-500 to-purple-400'
WHERE NOT EXISTS (SELECT 1 FROM public.tipos_investimento WHERE nome = 'Fundos Imobiliários');

INSERT INTO public.tipos_investimento (nome, icone, cor)
SELECT 'CDB/LCI/LCA', '💰', 'from-amber-500 to-amber-400'
WHERE NOT EXISTS (SELECT 1 FROM public.tipos_investimento WHERE nome = 'CDB/LCI/LCA');

-- ============================================================
-- Colunas adicionadas em evolucoes do app
-- ============================================================

ALTER TABLE public.receitas ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.despesas ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.despesas ADD COLUMN IF NOT EXISTS cartao_id UUID REFERENCES public.cartoes(id) ON DELETE SET NULL;
ALTER TABLE public.despesas ADD COLUMN IF NOT EXISTS boleto BOOLEAN DEFAULT FALSE;
ALTER TABLE public.despesas ADD COLUMN IF NOT EXISTS data_vencimento DATE;
ALTER TABLE public.despesas ADD COLUMN IF NOT EXISTS parcelada BOOLEAN DEFAULT FALSE;
ALTER TABLE public.despesas ADD COLUMN IF NOT EXISTS parcela_atual INTEGER;
ALTER TABLE public.despesas ADD COLUMN IF NOT EXISTS parcela_total INTEGER;
ALTER TABLE public.despesas ADD COLUMN IF NOT EXISTS parcela_grupo_id UUID;

ALTER TABLE public.aplicacoes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.poupanca ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.metas_poupanca ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.cartoes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.cartoes ADD COLUMN IF NOT EXISTS limite NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE public.cartoes ADD COLUMN IF NOT EXISTS dia_fechamento INTEGER DEFAULT 1;
ALTER TABLE public.cartoes ADD COLUMN IF NOT EXISTS dia_vencimento INTEGER DEFAULT 10;

-- O modal de cartao oferece Hipercard; evita falha por CHECK antigo.
ALTER TABLE public.cartoes DROP CONSTRAINT IF EXISTS cartoes_bandeira_check;

-- ============================================================
-- Indices
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_receitas_user_id ON public.receitas(user_id);
CREATE INDEX IF NOT EXISTS idx_receitas_data ON public.receitas(data);
CREATE INDEX IF NOT EXISTS idx_despesas_user_id ON public.despesas(user_id);
CREATE INDEX IF NOT EXISTS idx_despesas_data ON public.despesas(data);
CREATE INDEX IF NOT EXISTS idx_despesas_cartao_id ON public.despesas(cartao_id);
CREATE INDEX IF NOT EXISTS idx_despesas_data_vencimento ON public.despesas(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_despesas_parcela_grupo ON public.despesas(parcela_grupo_id);
CREATE INDEX IF NOT EXISTS idx_aplicacoes_user_id ON public.aplicacoes(user_id);
CREATE INDEX IF NOT EXISTS idx_aplicacoes_data ON public.aplicacoes(data);
CREATE INDEX IF NOT EXISTS idx_poupanca_user_id ON public.poupanca(user_id);
CREATE INDEX IF NOT EXISTS idx_poupanca_data ON public.poupanca(data);
CREATE INDEX IF NOT EXISTS idx_metas_poupanca_user_id ON public.metas_poupanca(user_id);
CREATE INDEX IF NOT EXISTS idx_cartoes_user_id ON public.cartoes(user_id);

-- ============================================================
-- Trigger updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_receitas_updated_at ON public.receitas;
CREATE TRIGGER update_receitas_updated_at
BEFORE UPDATE ON public.receitas
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_despesas_updated_at ON public.despesas;
CREATE TRIGGER update_despesas_updated_at
BEFORE UPDATE ON public.despesas
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_aplicacoes_updated_at ON public.aplicacoes;
CREATE TRIGGER update_aplicacoes_updated_at
BEFORE UPDATE ON public.aplicacoes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_poupanca_updated_at ON public.poupanca;
CREATE TRIGGER update_poupanca_updated_at
BEFORE UPDATE ON public.poupanca
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_metas_poupanca_updated_at ON public.metas_poupanca;
CREATE TRIGGER update_metas_poupanca_updated_at
BEFORE UPDATE ON public.metas_poupanca
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_cartoes_updated_at ON public.cartoes;
CREATE TRIGGER update_cartoes_updated_at
BEFORE UPDATE ON public.cartoes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- RLS e policies
-- ============================================================

ALTER TABLE public.receitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.despesas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aplicacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poupanca ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metas_poupanca ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cartoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias_receita ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias_despesa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipos_investimento ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own receitas" ON public.receitas;
DROP POLICY IF EXISTS "Users can insert their own receitas" ON public.receitas;
DROP POLICY IF EXISTS "Users can update their own receitas" ON public.receitas;
DROP POLICY IF EXISTS "Users can delete their own receitas" ON public.receitas;
CREATE POLICY "Users can view their own receitas" ON public.receitas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own receitas" ON public.receitas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own receitas" ON public.receitas FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own receitas" ON public.receitas FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own despesas" ON public.despesas;
DROP POLICY IF EXISTS "Users can insert their own despesas" ON public.despesas;
DROP POLICY IF EXISTS "Users can update their own despesas" ON public.despesas;
DROP POLICY IF EXISTS "Users can delete their own despesas" ON public.despesas;
CREATE POLICY "Users can view their own despesas" ON public.despesas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own despesas" ON public.despesas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own despesas" ON public.despesas FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own despesas" ON public.despesas FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own aplicacoes" ON public.aplicacoes;
DROP POLICY IF EXISTS "Users can insert their own aplicacoes" ON public.aplicacoes;
DROP POLICY IF EXISTS "Users can update their own aplicacoes" ON public.aplicacoes;
DROP POLICY IF EXISTS "Users can delete their own aplicacoes" ON public.aplicacoes;
CREATE POLICY "Users can view their own aplicacoes" ON public.aplicacoes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own aplicacoes" ON public.aplicacoes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own aplicacoes" ON public.aplicacoes FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own aplicacoes" ON public.aplicacoes FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own poupanca" ON public.poupanca;
DROP POLICY IF EXISTS "Users can insert their own poupanca" ON public.poupanca;
DROP POLICY IF EXISTS "Users can update their own poupanca" ON public.poupanca;
DROP POLICY IF EXISTS "Users can delete their own poupanca" ON public.poupanca;
CREATE POLICY "Users can view their own poupanca" ON public.poupanca FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own poupanca" ON public.poupanca FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own poupanca" ON public.poupanca FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own poupanca" ON public.poupanca FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own metas" ON public.metas_poupanca;
DROP POLICY IF EXISTS "Users can insert their own metas" ON public.metas_poupanca;
DROP POLICY IF EXISTS "Users can update their own metas" ON public.metas_poupanca;
DROP POLICY IF EXISTS "Users can delete their own metas" ON public.metas_poupanca;
CREATE POLICY "Users can view their own metas" ON public.metas_poupanca FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own metas" ON public.metas_poupanca FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own metas" ON public.metas_poupanca FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own metas" ON public.metas_poupanca FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own cartoes" ON public.cartoes;
DROP POLICY IF EXISTS "Users can insert their own cartoes" ON public.cartoes;
DROP POLICY IF EXISTS "Users can update their own cartoes" ON public.cartoes;
DROP POLICY IF EXISTS "Users can delete their own cartoes" ON public.cartoes;
CREATE POLICY "Users can view their own cartoes" ON public.cartoes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own cartoes" ON public.cartoes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own cartoes" ON public.cartoes FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own cartoes" ON public.cartoes FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view categorias_receita" ON public.categorias_receita;
DROP POLICY IF EXISTS "Anyone can view categorias_despesa" ON public.categorias_despesa;
DROP POLICY IF EXISTS "Anyone can view tipos_investimento" ON public.tipos_investimento;
CREATE POLICY "Anyone can view categorias_receita" ON public.categorias_receita FOR SELECT USING (true);
CREATE POLICY "Anyone can view categorias_despesa" ON public.categorias_despesa FOR SELECT USING (true);
CREATE POLICY "Anyone can view tipos_investimento" ON public.tipos_investimento FOR SELECT USING (true);

-- Recarrega o schema cache usado pela API REST do Supabase/PostgREST.
NOTIFY pgrst, 'reload schema';

-- ============================================================
-- Diagnostico: rode estas consultas depois do reparo.
-- Se aparecerem valores em um email/user_id diferente do usuario logado,
-- o app vai mostrar zero por causa do RLS.
-- ============================================================

SELECT id, email, created_at
FROM auth.users
ORDER BY created_at DESC;

SELECT 'receitas' AS tabela, user_id, COUNT(*) AS registros, COALESCE(SUM(valor), 0) AS total
FROM public.receitas
GROUP BY user_id
UNION ALL
SELECT 'despesas' AS tabela, user_id, COUNT(*) AS registros, COALESCE(SUM(valor), 0) AS total
FROM public.despesas
GROUP BY user_id
UNION ALL
SELECT 'aplicacoes' AS tabela, user_id, COUNT(*) AS registros, COALESCE(SUM(CASE WHEN tipo_transacao = 'resgate' THEN -valor ELSE valor END), 0) AS total
FROM public.aplicacoes
GROUP BY user_id
UNION ALL
SELECT 'poupanca' AS tabela, user_id, COUNT(*) AS registros, COALESCE(SUM(CASE WHEN tipo_transacao = 'retirada' THEN -valor ELSE valor END), 0) AS total
FROM public.poupanca
GROUP BY user_id
ORDER BY tabela, user_id;

-- Se precisar migrar dados de um email antigo para o email novo, edite e rode
-- o bloco abaixo manualmente. Nao rode sem trocar os emails.
--
-- WITH old_user AS (
--     SELECT id FROM auth.users WHERE email = 'email-antigo@exemplo.com'
-- ),
-- new_user AS (
--     SELECT id FROM auth.users WHERE email = 'email-novo@exemplo.com'
-- )
-- UPDATE public.receitas SET user_id = (SELECT id FROM new_user)
-- WHERE user_id = (SELECT id FROM old_user);
--
-- WITH old_user AS (
--     SELECT id FROM auth.users WHERE email = 'email-antigo@exemplo.com'
-- ),
-- new_user AS (
--     SELECT id FROM auth.users WHERE email = 'email-novo@exemplo.com'
-- )
-- UPDATE public.despesas SET user_id = (SELECT id FROM new_user)
-- WHERE user_id = (SELECT id FROM old_user);
--
-- WITH old_user AS (
--     SELECT id FROM auth.users WHERE email = 'email-antigo@exemplo.com'
-- ),
-- new_user AS (
--     SELECT id FROM auth.users WHERE email = 'email-novo@exemplo.com'
-- )
-- UPDATE public.aplicacoes SET user_id = (SELECT id FROM new_user)
-- WHERE user_id = (SELECT id FROM old_user);
--
-- WITH old_user AS (
--     SELECT id FROM auth.users WHERE email = 'email-antigo@exemplo.com'
-- ),
-- new_user AS (
--     SELECT id FROM auth.users WHERE email = 'email-novo@exemplo.com'
-- )
-- UPDATE public.poupanca SET user_id = (SELECT id FROM new_user)
-- WHERE user_id = (SELECT id FROM old_user);
