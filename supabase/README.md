# 🚀 Setup do Supabase - Dashboard Financeiro

## Passo a Passo para Configurar o Banco de Dados

### 1. Acessar o SQL Editor do Supabase

1. Acesse [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. No menu lateral, clique em **SQL Editor**

### 2. Executar o Schema

1. Clique em **New Query**
2. Copie todo o conteúdo do arquivo `supabase/schema.sql`
3. Cole no editor
4. Clique em **Run** (ou pressione `Ctrl + Enter`)

**✅ Você verá:** "Success. No rows returned"

### 3. Executar o Seed (Dados de Exemplo)

1. Clique em **New Query** novamente
2. Copie todo o conteúdo do arquivo `supabase/seed.sql`
3. Cole no editor
4. Clique em **Run**

**✅ Você verá:** "Success. No rows returned"

### 4. Verificar as Tabelas Criadas

1. No menu lateral, clique em **Table Editor**
2. Você deve ver as seguintes tabelas:
   - ✅ categorias_receita (6 registros)
   - ✅ categorias_despesa (8 registros)
   - ✅ tipos_investimento (4 registros)
   - ✅ receitas (vazia por enquanto)
   - ✅ despesas (vazia por enquanto)
   - ✅ aplicacoes (vazia por enquanto)
   - ✅ poupanca (vazia por enquanto)
   - ✅ metas_poupanca (vazia por enquanto)

### 5. Verificar RLS (Row Level Security)

1. Clique em qualquer tabela (ex: `receitas`)
2. Vá na aba **Policies**
3. Você deve ver 4 policies:
   - ✅ Users can view their own receitas
   - ✅ Users can insert their own receitas
   - ✅ Users can update their own receitas
   - ✅ Users can delete their own receitas

---

## 🔐 Próximo Passo: Autenticação

Após executar o schema, você precisa:

1. **Criar um usuário de teste** (ou usar autenticação real)
2. **Popular dados de exemplo** para esse usuário

### Opção A: Criar Usuário de Teste Manualmente

1. No Supabase Dashboard, vá em **Authentication** → **Users**
2. Clique em **Add user**
3. Preencha:
   - Email: `teste@exemplo.com`
   - Password: `senha123`
4. Clique em **Create user**
5. Copie o **UUID** do usuário criado

### Opção B: Usar Autenticação Real (Recomendado)

Vamos implementar login/registro na próxima etapa!

---

## 📊 Popular Dados de Exemplo (Opcional)

Se você criou um usuário de teste, pode popular dados manualmente:

1. Abra o **SQL Editor**
2. Substitua `USER_ID_AQUI` pelo UUID do seu usuário
3. Execute os comandos comentados no final do `seed.sql`

Exemplo:
```sql
-- Substitua pelo seu user_id real
INSERT INTO receitas (user_id, descricao, valor, data, categoria_id) VALUES
('seu-uuid-aqui', 'Salário Janeiro', 8500.00, '2026-01-05', '550e8400-e29b-41d4-a716-446655440001');
```

---

## ✅ Checklist

- [ ] Schema executado com sucesso
- [ ] Seed executado com sucesso
- [ ] 8 tabelas criadas
- [ ] Categorias populadas (6 + 8 + 4 = 18 registros)
- [ ] RLS habilitado em todas as tabelas
- [ ] Usuário de teste criado (opcional)

---

## 🐛 Troubleshooting

### Erro: "relation already exists"
- **Solução:** As tabelas já existem. Você pode ignorar ou deletar e recriar.

### Erro: "permission denied"
- **Solução:** Certifique-se de estar usando o SQL Editor com permissões de admin.

### Erro: "uuid_generate_v4() does not exist"
- **Solução:** A extensão UUID não foi habilitada. Execute:
  ```sql
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  ```

---

## 📝 Próximos Passos

Após configurar o banco:

1. ✅ Implementar autenticação (login/registro)
2. ✅ Criar hooks para buscar dados do Supabase
3. ✅ Atualizar páginas para usar dados reais
4. ✅ Implementar CRUD completo

**Bora continuar!** 🚀
