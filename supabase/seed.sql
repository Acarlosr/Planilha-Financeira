-- =============================================
-- SEED DATA - DADOS DE EXEMPLO
-- =============================================
-- Execute este script DEPOIS do schema.sql
-- =============================================

-- =============================================
-- CATEGORIAS DE RECEITA
-- =============================================

INSERT INTO categorias_receita (id, nome, icone, cor) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Salário Mensal', '💼', 'from-emerald-500 to-emerald-400'),
('550e8400-e29b-41d4-a716-446655440002', '13º Salário / Bônus', '🎁', 'from-amber-500 to-amber-400'),
('550e8400-e29b-41d4-a716-446655440003', 'Freelance / Extra', '⚡', 'from-purple-500 to-purple-400'),
('550e8400-e29b-41d4-a716-446655440004', 'Vendas Online', '📦', 'from-blue-500 to-blue-400'),
('550e8400-e29b-41d4-a716-446655440005', 'Reembolso', '🔄', 'from-teal-500 to-teal-400'),
('550e8400-e29b-41d4-a716-446655440006', 'Saldo Anterior', '🏦', 'from-indigo-500 to-indigo-400')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- CATEGORIAS DE DESPESA
-- =============================================

INSERT INTO categorias_despesa (id, nome, icone, cor) VALUES
('650e8400-e29b-41d4-a716-446655440001', 'Moradia', 'Home', 'from-blue-500 to-blue-400'),
('650e8400-e29b-41d4-a716-446655440002', 'Alimentação', 'Utensils', 'from-orange-500 to-orange-400'),
('650e8400-e29b-41d4-a716-446655440003', 'Transporte', 'Car', 'from-purple-500 to-purple-400'),
('650e8400-e29b-41d4-a716-446655440004', 'Saúde', 'Heart', 'from-red-500 to-red-400'),
('650e8400-e29b-41d4-a716-446655440005', 'Educação', 'GraduationCap', 'from-green-500 to-green-400'),
('650e8400-e29b-41d4-a716-446655440006', 'Lazer', 'Smartphone', 'from-pink-500 to-pink-400'),
('650e8400-e29b-41d4-a716-446655440007', 'Vestuário', 'Shirt', 'from-indigo-500 to-indigo-400'),
('650e8400-e29b-41d4-a716-446655440008', 'Compras', 'ShoppingCart', 'from-teal-500 to-teal-400'),
('650e8400-e29b-41d4-a716-446655440009', 'Cartão de Crédito', 'CreditCard', 'from-indigo-500 to-indigo-400'),
('650e8400-e29b-41d4-a716-446655440010', 'Streaming', 'Tv', 'from-cyan-500 to-cyan-400'),
('650e8400-e29b-41d4-a716-446655440011', 'Internet/TV/Celular', 'Wifi', 'from-teal-500 to-teal-400'),
('650e8400-e29b-41d4-a716-446655440012', 'Delivery', 'Utensils', 'from-orange-500 to-orange-400'),
('650e8400-e29b-41d4-a716-446655440013', 'Academia', 'Dumbbell', 'from-cyan-500 to-cyan-400'),
('650e8400-e29b-41d4-a716-446655440014', 'Água', 'Droplets', 'from-blue-500 to-blue-400'),
('650e8400-e29b-41d4-a716-446655440015', 'Luz', 'Lightbulb', 'from-teal-500 to-teal-400'),
('650e8400-e29b-41d4-a716-446655440016', 'Viagens', 'Plane', 'from-indigo-500 to-indigo-400'),
('650e8400-e29b-41d4-a716-446655440017', 'Outros', 'MoreHorizontal', 'from-slate-500 to-slate-400')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- TIPOS DE INVESTIMENTO
-- =============================================

INSERT INTO tipos_investimento (id, nome, icone, cor) VALUES
('750e8400-e29b-41d4-a716-446655440001', 'Tesouro Direto', '🏛️', 'from-blue-500 to-blue-400'),
('750e8400-e29b-41d4-a716-446655440002', 'Ações', '📈', 'from-green-500 to-green-400'),
('750e8400-e29b-41d4-a716-446655440003', 'Fundos Imobiliários', '🏢', 'from-purple-500 to-purple-400'),
('750e8400-e29b-41d4-a716-446655440004', 'CDB/LCI/LCA', '💰', 'from-amber-500 to-amber-400')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- NOTA IMPORTANTE
-- =============================================
-- Os dados de receitas, despesas, aplicações e poupança
-- serão inseridos automaticamente quando o usuário
-- fizer login pela primeira vez.
-- 
-- Isso porque eles dependem do user_id que só existe
-- após a autenticação.
-- 
-- Você pode criar um usuário de teste e inserir dados
-- manualmente substituindo 'USER_ID_AQUI' pelo UUID real.
-- =============================================

-- Exemplo de como inserir dados após ter um usuário:
/*
-- Substitua 'USER_ID_AQUI' pelo UUID do seu usuário

-- RECEITAS DE EXEMPLO
INSERT INTO receitas (user_id, descricao, valor, data, categoria_id) VALUES
('USER_ID_AQUI', 'Saldo conta corrente', 5200.00, '2026-01-01', '550e8400-e29b-41d4-a716-446655440006'),
('USER_ID_AQUI', 'Salário Janeiro', 8500.00, '2026-01-05', '550e8400-e29b-41d4-a716-446655440001'),
('USER_ID_AQUI', 'Projeto Website Cliente A', 3200.00, '2025-12-15', '550e8400-e29b-41d4-a716-446655440003');

-- DESPESAS DE EXEMPLO
INSERT INTO despesas (user_id, descricao, valor, data, categoria_id) VALUES
('USER_ID_AQUI', 'Aluguel Janeiro', 2500.00, '2026-01-05', '650e8400-e29b-41d4-a716-446655440001'),
('USER_ID_AQUI', 'Supermercado - Compra mensal', 1200.00, '2026-01-03', '650e8400-e29b-41d4-a716-446655440002'),
('USER_ID_AQUI', 'Gasolina', 320.00, '2026-01-04', '650e8400-e29b-41d4-a716-446655440003');

-- METAS DE POUPANÇA
INSERT INTO metas_poupanca (user_id, nome, valor_meta, valor_atual, icone, cor) VALUES
('USER_ID_AQUI', 'Reserva de Emergência', 15000.00, 8500.00, '🚨', 'from-red-500 to-red-400'),
('USER_ID_AQUI', 'Viagem Europa', 12000.00, 3200.00, '✈️', 'from-blue-500 to-blue-400'),
('USER_ID_AQUI', 'Carro Novo', 30000.00, 1400.00, '🚗', 'from-purple-500 to-purple-400');

-- APLICAÇÕES
INSERT INTO aplicacoes (user_id, descricao, valor, data, tipo_investimento_id, tipo_transacao) VALUES
('USER_ID_AQUI', 'Aporte mensal - Tesouro Selic', 1000.00, '2026-01-05', '750e8400-e29b-41d4-a716-446655440001', 'aporte'),
('USER_ID_AQUI', 'Compra ITSA4 - 100 ações', 850.00, '2026-01-08', '750e8400-e29b-41d4-a716-446655440002', 'aporte');

-- POUPANÇA
INSERT INTO poupanca (user_id, descricao, valor, data, meta_id, tipo_transacao) VALUES
('USER_ID_AQUI', 'Depósito mensal - Reserva', 650.00, '2026-01-05', (SELECT id FROM metas_poupanca WHERE nome = 'Reserva de Emergência' LIMIT 1), 'deposito'),
('USER_ID_AQUI', 'Extra freelance - Viagem', 800.00, '2026-01-08', (SELECT id FROM metas_poupanca WHERE nome = 'Viagem Europa' LIMIT 1), 'deposito');
*/
