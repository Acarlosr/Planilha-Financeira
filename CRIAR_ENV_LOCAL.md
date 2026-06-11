# ⚠️ INSTRUÇÕES: Criar arquivo .env.local

O arquivo `.env.local` precisa ser criado manualmente na raiz do projeto.

> **Importante:** nunca versione credenciais reais neste arquivo de documentação.
> Pegue os valores no painel do Supabase em **Project Settings → API**.

## Como criar:

1. **Abra o editor de código**
2. **Crie um arquivo** chamado `.env.local` na raiz do projeto (`dashboard-financeiro`)
3. **Cole este conteúdo** e substitua pelos valores do seu projeto:

```
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
```

4. **Salve o arquivo**
5. **Pare o servidor** (Ctrl+C no terminal onde está rodando `npm run dev`)
6. **Rode novamente:** `npm run dev`

## ✅ Verificar se funcionou:

Acesse `http://localhost:3000` - se não aparecer erro de "supabaseUrl is required", está funcionando!

---

**Observação:** o arquivo `.env.local` já está no `.gitignore`, então não será enviado ao repositório.
A `anon key` é pública por design (protegida por RLS), mas a `service_role key` **nunca** deve ser exposta no frontend nem versionada.
