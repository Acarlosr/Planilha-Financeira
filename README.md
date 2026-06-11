# FinançasPro - Dashboard Financeiro SaaS

Sistema de gerenciamento financeiro pessoal em beta, com dashboard, autenticação, controle de receitas/despesas, investimentos, metas e radar financeiro.

![Next.js](https://img.shields.io/badge/Next.js-16.1-black)
![React](https://img.shields.io/badge/React-19.2-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)

---

## 🚀 Funcionalidades

### Gestão Financeira
- ✅ Controle de receitas e despesas
- ✅ Gerenciamento de investimentos
- ✅ Metas de poupança
- ✅ Portfolio de criptomoedas
- ✅ Cartões de crédito e parcelas
- ✅ Gráficos principais
- ✅ Exportação PDF em beta

### SaaS Features
- ✅ Autenticação com Supabase
- ✅ Perfil de usuário e planos no banco
- ✅ Feature gating inicial por plano
- ⚠️ Checkout em preparação, sem cobrança real nesta versão
- ⚠️ Área administrativa, quotas e plano Enterprise ainda são base técnica, não produto final

### UI/UX
- ✅ Design moderno dark theme
- ✅ Animações suaves
- ✅ Tema Neon Green (#7CFF6B)
- ✅ Responsivo
- ✅ Componentes reutilizáveis

---

## 📦 Planos de Assinatura

| Recurso | Beta atual | Pro planejado |
|---------|------------|---------------|
| **Preço** | Sem cobrança ativa | A definir |
| **Transações** | Controle básico | Limites e histórico ampliados |
| **Dashboard** | Cards principais | Personalização avançada |
| **Relatórios** | Gráficos principais | Relatórios avançados |
| **Exportação** | PDF em beta | PDF/Excel aprimorado |
| **Pagamento** | Não conectado | Gateway + webhook |

---

## 🛠️ Tecnologias

### Frontend
- **Next.js 16.1** - Framework React com SSR
- **React 19.2** - Biblioteca UI
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Recharts** - Gráficos
- **Lucide React** - Ícones

### Backend
- **Supabase** - BaaS (PostgreSQL)
- **Row Level Security (RLS)** - Segurança
- **PostgreSQL Functions** - Lógica de negócio
- **Triggers** - Automação

### Autenticação
- **Supabase Auth** - Sistema de autenticação
- **OAuth Providers** - Google e outros provedores configuráveis no Supabase
- **Email OTP** - Magic links
- **Role-based Access** - Admin/User

---

## 📁 Estrutura do Projeto

```
dashboard-financeiro/
├── src/
│   ├── app/
│   │   ├── landing/          # Landing page
│   │   ├── pricing/          # Página de planos
│   │   ├── settings/
│   │   │   └── subscription/ # Gerenciar assinatura
│   │   ├── admin/            # Área administrativa (em desenvolvimento)
│   │   ├── receitas/         # Receitas
│   │   ├── despesas/         # Despesas
│   │   ├── aplicacao/        # Investimentos
│   │   ├── poupanca/         # Poupança
│   │   ├── criptomoedas/     # Crypto portfolio
│   │   ├── login/            # Login page
│   │   └── cadastro/         # Sign up
│   │
│   ├── components/
│   │   ├── UpgradePrompt.tsx     # Modal de upgrade
│   │   ├── TrialBanner.tsx       # Banner de trial
│   │   ├── FeatureGate.tsx       # Gate de features
│   │   ├── Sidebar.tsx           # Navegação
│   │   ├── SummaryCards.tsx      # Cards de resumo
│   │   └── ...
│   │
│   ├── contexts/
│   │   ├── SubscriptionContext.tsx  # Context de assinatura
│   │   └── ThemeContext.tsx         # Tema dark/light
│   │
│   ├── hooks/
│   │   ├── useFeatureAccess.ts      # Verificar features
│   │   └── useUserRole.ts           # Verificar roles
│   │
│   ├── types/
│   │   └── saas.ts                  # TypeScript types
│   │
│   └── middleware.ts                # Route protection
│
├── supabase/
│   ├── saas_schema.sql              # Schema SaaS completo
│   ├── create_admin_manual.sql      # Criar admin
│   ├── update_plan_prices.sql       # Atualizar preços
│   ├── fix_pricing_page.sql         # Corrigir RLS
│   └── MIGRATION_GUIDE.md           # Guia de setup
│
└── package.json
```

---

## 🗄️ Database Schema

### Tabelas Principais

**subscription_plans**
- 3 planos (Free, Pro, Enterprise)
- Preços mensais e anuais
- Features e limites

**user_profiles**
- Perfil do usuário
- Role (admin/user)
- Subscription info
- Trial period

**dashboard_preferences**
- Customização do dashboard
- Cards visíveis/ocultos
- Ordem e tamanho

**user_activity_logs**
- Logs de auditoria
- Apenas para admins

**transaction_quotas**
- Controle de limites mensais

### Security (RLS)
- ✅ Usuários veem apenas próprios dados
- ✅ Admin pode ver tudo
- ✅ Planos públicos para pricing page
- ✅ Logs apenas para admin

---

## 🚀 Quick Start

### 1. Clone o repositório

```bash
git clone https://github.com/Acarlosr/Planilha-Financeira.git
cd Planilha-Financeira/dashboard-financeiro
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

Crie `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
```

### 4. Setup do Supabase

#### 4.1. Executar Schema SQL

1. Abra [Supabase Dashboard](https://app.supabase.com)
2. Vá em **SQL Editor**
3. Execute `supabase/saas_schema.sql`

#### 4.2. Criar Admin

Execute:
```sql
-- Veja supabase/create_admin_manual.sql
```

#### 4.3. Corrigir RLS para Pricing Page

Execute:
```sql
-- Veja supabase/fix_pricing_page.sql
```

### 5. Rodar o projeto

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

---

## 📖 Guias de Setup

- **[MIGRATION_GUIDE.md](supabase/MIGRATION_GUIDE.md)** - Guia completo de setup do banco
- **[create_admin_manual.sql](supabase/create_admin_manual.sql)** - Como criar primeiro admin
- **[fix_pricing_page.sql](supabase/fix_pricing_page.sql)** - Corrigir acesso aos planos

---

## 🔐 Autenticação

### Providers OAuth
- ✅ Google
- ✅ GitHub  
- ✅ Microsoft (Azure)

### Email
- ✅ Magic links (OTP)
- ✅ Confirmação automática

### Roles
- **user** - Acesso padrão
- **admin** - Acesso total + área administrativa

---

## 🎨 Componentes SaaS

### `<SubscriptionContext>`
Provê dados de assinatura globalmente

```tsx
const { user, plan, isAdmin, isTrial, trialDaysLeft } = useSubscription();
```

### `<FeatureGate>`
Controla acesso a features

```tsx
<FeatureGate feature="advanced_reports">
  <AdvancedReports />
</FeatureGate>
```

### `<UpgradePrompt>`
Modal/Banner de upgrade

```tsx
<UpgradePrompt 
  variant="modal" 
  planRequired="pro"
  reason="Limite atingido"
/>
```

### `<TrialBanner>`
Banner de trial com countdown

```tsx
<TrialBanner />
```

---

## 🔧 Hooks

### `useFeatureAccess(feature)`
Verifica se usuário tem acesso a uma feature

```tsx
const { hasAccess, planRequired } = useFeatureAccess('export_data');
```

### `useQuotaLimit(type, usage)`
Verifica limites de uso

```tsx
const { hasAccess, maxLimit } = useQuotaLimit('transactions', 15);
```

### `useUserRole()`
Verifica role do usuário

```tsx
const { isAdmin } = useUserRole();
```

---

## 🛣️ Proteção de Rotas

**Middleware** protege automaticamente:
- `/admin/*` - Apenas admins
- `/export/*` - Apenas Pro/Enterprise
- `/api-access/*` - Apenas Enterprise

Redireciona para `/pricing` se não tiver acesso.

---

## 📊 Métricas Admin (em desenvolvimento)

- Total de usuários
- Usuários por plano
- Revenue mensal
- Crescimento
- Usuários ativos
- Logs de atividade

---

## 🎯 Roadmap

### ✅ Fase 1: Database & Infrastructure
- [x] Schema SQL completo
- [x] RLS policies
- [x] Triggers e functions
- [x] TypeScript types

### ✅ Fase 2: Frontend Integration
- [x] SubscriptionContext
- [x] Feature access hooks
- [x] Paywall components
- [x] Pricing page
- [x] Settings page
- [x] Middleware

### 🚧 Fase 3: Dashboard Customization
- [ ] Drag & drop cards
- [x] Salvar preferências (tabela `dashboard_preferences` + painel "Personalizar painel")
- [ ] Resize cards
- [x] Restore defaults (botão "Mostrar todos")

### 🚧 Fase 4: Admin Area
- [x] Dashboard de métricas (`/admin`)
- [x] Lista de usuários (busca + status + plano)
- [ ] User management (editar/suspender pelo painel)
- [ ] Activity logs viewer

### 🚧 Fase 5: Payments
- [ ] Integração com gateway (Stripe / Mercado Pago / PagSeguro) — requer credenciais do provedor
- [ ] Checkout flow real
- [ ] Webhooks de confirmação
- [ ] Invoice management

### 🚧 Fase 6: Advanced Features
- [ ] API pública
- [ ] Multi-user (Enterprise)
- [ ] White-label
- [ ] Advanced analytics

---

## 🐛 Troubleshooting

### Pricing page não mostra planos

Execute `supabase/fix_pricing_page.sql` para corrigir RLS.

### Erro ao criar usuário

Use `supabase/create_admin_manual.sql` para criar perfil manualmente.

### "Invalid API key"

Verifique `.env.local` com credenciais corretas do Supabase.

---

## 📝 Scripts SQL Úteis

### Atualizar preço de plano
```sql
UPDATE subscription_plans
SET price_monthly = 10.99
WHERE slug = 'pro';
```

### Tornar usuário admin
```sql
UPDATE user_profiles
SET role = 'admin'
WHERE email = 'usuario@email.com';
```

### Ver todos os admins
```sql
SELECT email, role FROM user_profiles WHERE role = 'admin';
```

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'feat: Nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT.

---

## 👨‍💻 Autor

**Carlos Rocha** - [GitHub](https://github.com/Acarlosr)

---

## 🙏 Agradecimentos

- Next.js team
- Supabase team
- Comunidade open source

---

**Feito com ❤️ e ☕ por Carlos Rocha**
