# 🔐 Configuração do Google OAuth no Supabase

Para habilitar login com Google, você precisa configurar o OAuth no Supabase Dashboard.

---

## Passo a Passo

### 1. Acessar Configurações de Autenticação

1. Acesse [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecione seu projeto
3. No menu lateral, clique em **Authentication** → **Providers**

### 2. Habilitar Google Provider

1. Procure por **Google** na lista de providers
2. Clique para expandir
3. Ative o toggle **Enable Sign in with Google**

### 3. Configurar Credenciais do Google

Você tem duas opções:

#### Opção A: Usar Credenciais do Supabase (Mais Rápido)

- O Supabase fornece credenciais de desenvolvimento
- **Limitação:** Só funciona em localhost
- **Recomendado para:** Testes locais

#### Opção B: Criar suas Próprias Credenciais (Recomendado para Produção)

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Vá em **APIs & Services** → **Credentials**
4. Clique em **Create Credentials** → **OAuth client ID**
5. Escolha **Web application**
6. Configure:
   - **Name:** FinançasPro
   - **Authorized JavaScript origins:**
     - `http://localhost:3000`
     - `https://dyaeipcrifqipvjsuuxr.supabase.co`
   - **Authorized redirect URIs:**
     - `https://dyaeipcrifqipvjsuuxr.supabase.co/auth/v1/callback`
7. Copie o **Client ID** e **Client Secret**
8. Cole no Supabase em **Google Provider Settings**

### 4. Configurar Redirect URL

No Supabase, em **URL Configuration**:

- **Site URL:** `http://localhost:3000` (desenvolvimento)
- **Redirect URLs:** 
  - `http://localhost:3000/**`
  - `http://localhost:3000/`

### 5. Salvar Configurações

Clique em **Save** no final da página.

---

## ✅ Testar Google OAuth

1. Acesse `http://localhost:3000/login`
2. Clique em **Continuar com Google**
3. Faça login com sua conta Google
4. Você será redirecionado para o dashboard

---

## 🐛 Troubleshooting

### Erro: "redirect_uri_mismatch"
- **Solução:** Verifique se a redirect URI no Google Cloud Console está correta
- Deve ser exatamente: `https://dyaeipcrifqipvjsuuxr.supabase.co/auth/v1/callback`

### Erro: "OAuth client not found"
- **Solução:** Verifique se copiou corretamente o Client ID e Client Secret

### Login funciona mas não redireciona
- **Solução:** Verifique a Site URL nas configurações do Supabase

---

## 📝 Próximos Passos

Após configurar o Google OAuth:

1. ✅ Testar login com Google
2. ✅ Testar cadastro com email/senha
3. ✅ Verificar se o logout funciona
4. ✅ Testar proteção de rotas

**Autenticação completa!** 🚀
