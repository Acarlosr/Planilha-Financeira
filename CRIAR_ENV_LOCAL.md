# ⚠️ INSTRUÇÕES: Criar arquivo .env.local

O arquivo `.env.local` precisa ser criado manualmente na raiz do projeto.

## Como criar:

1. **Abra o VS Code**
2. **Crie um arquivo** chamado `.env.local` na raiz do projeto (`dashboard-financeiro`)
3. **Cole este conteúdo** (EXATAMENTE 2 LINHAS):

```
NEXT_PUBLIC_SUPABASE_URL=https://dyaeipcrifqipvjsuuxr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5YWVpcGNyaWZxaXB2anN1dXhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2MjIzMDQsImV4cCI6MjA1MjE5ODMwNH0.bngXPg5LwBSb4BrpZnfCjg_XFzyjoR8gKNOxUCQMULk
```

4. **Salve o arquivo** (Ctrl+S)
5. **Pare o servidor** (Ctrl+C no terminal onde está rodando `npm run dev`)
6. **Rode novamente:** `npm run dev`

## ✅ Verificar se funcionou:

Acesse `http://localhost:3000` - se não aparecer erro de "supabaseUrl is required", está funcionando!

---

**Motivo:** O PowerShell está quebrando a linha da chave ao criar o arquivo via comando, então precisa ser criado manualmente.
