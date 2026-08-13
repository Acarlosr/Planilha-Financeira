# Auditoria Técnica — Saldo Claro / Planilha Financeira
**Data:** 11/08/2026 · **Escopo:** análise sem alteração de código · **Ótica:** escritório de contabilidade + produto/UI

Base analisada: Next.js 16.2.2 / React 19 / Tailwind 4 / Supabase / Recharts. 92 arquivos TS/TSX, ~15.850 linhas.

---

## 1. Sumário executivo

| Área | Estado | Risco |
|---|---|---|
| Receitas / Despesas / Cartões | Funcional, persistido no Supabase | Baixo |
| Aplicações (agregado) | Persiste só aporte/resgate; sem rentabilidade real | Médio |
| Ações / FIIs / Tesouro / CDB | **Não persistem — `useState(mock…)`, dados somem no F5** | **Crítico** |
| Apuração de IR / DARF | **Inexistente** (zero ocorrências de "DARF", "imposto", "alíquota" no código) | **Crítico** |
| Radar Financeiro | Cotação real (Yahoo), **sparkline é desenho fixo** | **Alto (credibilidade)** |
| Design system | Tokens bons em `globals.css`, mas contornados por hex hardcoded | Médio |
| Acessibilidade | 13 `aria-label` em 92 arquivos; `confirm()` nativo | Médio |
| Testes | 1 arquivo (`finance.test.ts`) | Médio |

**Diagnóstico em uma frase:** a camada de caixa (débito/crédito) está sólida; a camada de investimento é uma casca visual — bonita, mas sem persistência, sem custo médio auditável e sem apuração fiscal. É exatamente aí que está o maior valor não capturado do produto.

---

## 2. Achados críticos

### 2.1 Carteiras de investimento não persistem
`src/app/aplicacao/acoes/page.tsx:23`, `fiis/page.tsx:22`, `tesouro/page.tsx:16`, `cdb/page.tsx:14`

```ts
const [acoes, setAcoes] = useState(mockAcoes);   // mockAcoes = []
```

`src/data/aplicacoes-mock.ts` exporta arrays vazios. Não existe tabela em `supabase/*.sql` para `posicoes_acoes`, `fiis`, `tesouro`, `renda_fixa` ou `dividendos`. Consequência: o usuário cadastra uma posição, vê o card preencher, recarrega a página e perde tudo. As telas mais "premium" do app são as menos confiáveis.

`src/types/database.types.ts` também está defasado — só cobre as 9 tabelas antigas.

### 2.2 Nenhuma apuração fiscal
Busca por `darf|imposto|alíquota|IRRF|come-cotas|isenção` em `src/`: **0 resultados**.

Para um app que se posiciona como controle de investimentos no Brasil, isso significa que o usuário ainda precisa de uma planilha paralela para não cair na malha fina. É a lacuna funcional mais cara do produto.

### 2.3 Sparklines fictícias em cards de mercado
`src/components/FinancialRadar.tsx:168`

```tsx
<path d={insight.tone === "negative" ? "M2 9 C18 14, 32 8, …" : "M2 31 C18 24, …"} />
```

Duas curvas fixas — uma "para cima", outra "para baixo" — escolhidas pelo sinal da variação. O card exibe preço real ao lado de um gráfico inventado. Num produto financeiro isso é passivo reputacional: parece histórico, não é. Ou puxa série real (`range=1mo&interval=1d` do mesmo endpoint Yahoo já usado) ou remove o traço.

### 2.4 Métricas placeholder exibidas como reais
`src/app/aplicacao/page.tsx`

```ts
const rentabilidadeMedia = "0.0";
const rendimentoSeteDias = 0;
```

Renderizado como `0.0% a.a.` num card de destaque. O usuário lê "meu investimento não rende".

---

## 3. Módulo de investimentos — remodelagem proposta

### 3.1 Modelo de dados (o ponto de partida)
O modelo atual (`aplicacoes` com `valor` + `tipo_transacao`) é um livro-caixa, não um controle de carteira. Falta a granularidade que qualquer apuração exige.

Proposta mínima — três tabelas:

```sql
-- Toda compra/venda, com o detalhe que a Receita exige
operacoes (
  id, user_id, data, ativo_id, classe,          -- acao|fii|etf|bdr|cripto|rf
  operacao,                                      -- compra|venda
  modalidade,                                    -- swing|day_trade
  quantidade numeric, preco_unitario numeric,
  taxas numeric,                                 -- corretagem+emolumentos → entram no custo
  corretora text
)

-- Proventos separados por natureza (tributação difere)
proventos (
  id, user_id, ativo_id, tipo,                   -- dividendo|jcp|rendimento_fii|amortizacao
  data_ex, data_pagamento, valor_por_cota, quantidade_na_data,
  ir_retido numeric                              -- JCP: 15% na fonte
)

-- Fechamento mensal auditável (imutável após apuração)
apuracao_mensal (
  id, user_id, competencia date, classe, modalidade,
  total_vendas, ganho_liquido, prejuizo_acumulado_anterior,
  base_calculo, aliquota, irrf_retido, imposto_devido,
  codigo_darf, status, pago_em
)
```

**Regra de ouro contábil:** `operacoes` e `proventos` são append-only. Correção vira estorno + novo lançamento, nunca `UPDATE`. Isso é o que transforma o app de "planilha bonita" em algo defensável numa fiscalização.

### 3.2 Custo médio
Hoje `precoMedio` é um campo digitado pelo usuário. Deveria ser **derivado**:

- Compra → `PM = (PM×Qtd_ant + Preço×Qtd_nova + taxas) / (Qtd_ant + Qtd_nova)`
- Venda → PM **não muda**; resultado = `(Preço_venda − PM) × Qtd − taxas`
- Qtd zerada → PM zera; reentrada recomeça
- Desdobramento/grupamento/bonificação → ajusta quantidade e PM sem gerar resultado

Sem isso, nenhum número de lucro no app é confiável.

### 3.3 Motor de apuração e DARF

Regras vigentes em 2026 (a MP 1.303/2025 caducou na Câmara — a tabela regressiva e as isenções continuam valendo):

| Classe | Alíquota | Isenção | Código DARF | Observação |
|---|---|---|---|---|
| Ações — swing trade | 15% | vendas ≤ R$ 20.000/mês | **6015** | isenção é sobre o **volume vendido**, não sobre o lucro |
| Ações — day trade | 20% | nenhuma | 6015 | IRRF 1% ("dedo-duro") abatível |
| FIIs | 20% | **nenhuma** | 6015 | rendimento mensal é isento; **ganho na venda não é** |
| ETF de ações | 15% | nenhuma | 6015 | erro clássico: aplicar a isenção de R$ 20k |
| BDR | 15% | nenhuma | 6015 | — |
| Cripto | 15% (até R$ 5 mi) | vendas ≤ R$ 35.000/mês | **4600** | limite considera o conjunto de criptoativos |
| Renda fixa / Tesouro | regressiva 22,5% → 15% | LCI/LCA/CRI/CRA isentos | retido na fonte | app só precisa **projetar**, não gerar DARF |

Prazo: último dia útil do mês seguinte ao da operação. Valor mínimo de recolhimento: R$ 10 — abaixo disso, acumula para o mês seguinte.

Compensação de prejuízo:
- Swing compensa com swing; day trade só com day trade — **caixas estanques**
- Prejuízo não prescreve, mas o saldo precisa ser controlado mês a mês
- Prejuízo em operação isenta (venda ≤ R$ 20k) **não é compensável**

Entregável na tela: card "IR do mês" com semáforo (Isento / A recolher / Vencido), valor, código, vencimento, e um botão que gera a memória de cálculo em PDF — operação a operação, com PM e taxas. Esse PDF é o produto real para quem tem contador.

### 3.4 Cards de investimento — o que falta
Hoje (`CardResumo.tsx`): título, valor, ícone com gradiente, subtexto. Um card estático.

O que um card de investimento premium precisa mostrar:

1. **Separar preço de resultado** — Patrimônio ≠ Lucro. Hoje "lucro aberto" vive escondido num `subtexto` com `dangerouslySetInnerHTML` (`acoes/page.tsx:105`) — risco de XSS e semântica pobre.
2. **Rentabilidade em duas linhas**: nominal e real (descontado IPCA). Rendimento nominal sem inflação é o número que engana o investidor pessoa física.
3. **% CDI** — o benchmark que todo brasileiro entende.
4. **Yield on Cost** para FIIs/ações: provento anual ÷ custo médio, não ÷ preço de mercado.
5. **Lucro bruto vs. líquido de IR** — a diferença entre um app de controle e um app de decisão.
6. **Sparkline real** (série de fechamentos), não path decorativo.
7. **Estado vazio útil**: "Nenhuma posição — importe sua nota de corretagem" em vez de R$ 0,00.

### 3.5 Funcionalidades ausentes de alto valor
- **Import de nota de corretagem (PDF) e extrato B3 (CEI)** — sem isso a digitação manual mata a adesão
- **Come-cotas** de fundos (maio/novembro) — hoje invisível
- **Rebalanceamento**: alocação alvo vs. real, com sugestão de aporte
- **Calendário de proventos** (data-ex vs. pagamento)
- **Informe de rendimentos consolidado** para o IRPF — a tela que faz o usuário renovar a assinatura em março
- **Preço-teto / margem de segurança** para quem investe em dividendos

---

## 4. Camada de caixa (créditos e débitos)

O que está bom: `getCreditCardDueDate` (`src/lib/finance.ts`) trata fechamento/vencimento corretamente, com testes; parcelamento com `parcela_grupo_id` é um bom modelo; RLS presente em todas as tabelas.

Lacunas sob ótica contábil:

1. **Regime de caixa vs. competência** — hoje só existe caixa. Despesa parcelada em 12x aparece 12 vezes no futuro, mas não há visão de "compromisso assumido". Um flag `regime` no relatório resolve.
2. **Sem conciliação bancária** — não há `status` (previsto/realizado/conciliado) nem importação OFX/CSV. É o que separa "anotação" de "controle".
3. **Categorias globais, não do usuário** — `categorias_receita`/`categorias_despesa` não têm `user_id`. Ninguém cria categoria própria.
4. **Sem contas/carteiras** — não existe tabela de contas bancárias. Saldo é derivado de somatório, não de saldo de conta. Impossível responder "quanto tenho no Nubank?".
5. **Sem transferência entre contas** — hoje viraria uma receita + uma despesa fantasma, inflando os dois lados do relatório.
6. **Sem recorrência** — salário e aluguel são redigitados todo mês.
7. **`select("*")` em 9 pontos** com filtro no cliente — funciona com 200 lançamentos, degrada com 5.000. Faltam agregações no banco (view materializada ou RPC) e paginação.
8. **Sem trilha de auditoria** — nenhum `deleted_at`. Exclusão é definitiva e invisível.

---

## 5. UI/UX — caminho para "dapp premium"

### O que já está bem
Tokens de tema completos em `globals.css` (light/dark), glassmorphism consistente via `.glass-card`, gradiente de fundo com grid sutil no dark, PWA instalável.

### O que quebra a percepção premium

**1. Design system contornado.** 71 ocorrências de `#7CFF6B`, 33 de `#6FEB5A`, 22 de `#FFD700` hardcoded em TSX — o `--accent` existe mas não é usado. Trocar de marca hoje exige varrer 92 arquivos (tanto que existe um `replace_colors.js` na raiz, sintoma do problema). Além disso, os hex do `CLAUDE.md` (`#10b981`, `#f43f5e`, `#06b6d4`, `#f59e0b`) não batem com os do CSS (`#7cff6b`, `#ff4f7b`, `#18f2e6`, `#ffd52e`) — a diretriz e o código divergiram.

**2. Estilos inline em massa.** 17 blocos `style={{}}` em `TransactionsTable.tsx`, 17 em `InstallmentsForm.tsx`, 16 na landing. Impede memoização, polui o diff e recria objetos a cada render.

**3. Bug visual concreto.** `aplicacao/page.tsx:200` — botão dourado com `boxShadow: rgba(59,130,246,.4)` (sombra **azul**). Copy-paste que passou.

**4. Ausência de componentes de base.** Não há `Button`, `Card`, `Badge`, `Input`, `Modal` compartilhados. Cada modal reimplementa o layout — 10 modais, 10 variações sutis de padding e borda. É a causa raiz dos itens 1–3.

**5. Feedback e estados.** `confirm()` nativo do browser em exclusões (`TabelaAcoes.tsx:56` e outros) quebra completamente a estética. Faltam skeletons (só há texto "Carregando…"), estados vazios ilustrados e otimismo de UI.

**6. Tipografia.** `CLAUDE.md` pede JetBrains Mono para valores; o token `--font-mono` existe mas os valores monetários usam a sans. Números tabulares alinhados são metade da sensação "produto financeiro sério" — `font-variant-numeric: tabular-nums` é ganho instantâneo.

**7. Hierarquia.** O dashboard empilha 8 componentes de peso visual igual (Radar, Pulse, Cards, Chart, Reminders, Budget, Rail, Table). Sem hierarquia, tudo compete e nada se destaca. Premium é sobre o que você **remove**.

### Acessibilidade
13 `aria-label` no projeto inteiro; 20 `aria-hidden`. Faltam: `role="dialog"` + focus trap nos 10 modais, `<caption>`/`scope` nas tabelas, `:focus-visible` consistente, `aria-live` para toasts. O `CLAUDE.md` promete WCAG AAA — o código está distante disso, e `--text-tertiary: #63738b` sobre `#070b15` provavelmente não passa nem em AA para texto pequeno.

---

## 6. Segurança e engenharia

- **Bom:** RLS em todas as tabelas, rota `/api/market/radar` valida sessão antes de responder, `.env*` no `.gitignore`, sem service-role key no cliente.
- **`dangerouslySetInnerHTML`** em `CardResumo.tsx:22` com string montada — hoje o conteúdo é interno, mas se um dia vier de campo do usuário vira XSS.
- **Yahoo Finance sem contrato** — endpoint não-oficial, sem chave, sem rate limit próprio. 14 fetches em paralelo a cada request. Se o Yahoo mudar o shape, os cards silenciosamente caem no fallback. Vale cache no servidor (Supabase/Redis) e um provedor com SLA (brapi.dev, Alpha Vantage) antes de escalar.
- **Testes:** apenas `finance.test.ts`. A regra de cartão está coberta; nada mais está. Um motor de IR **precisa** nascer com testes — é o tipo de código onde o bug custa dinheiro real do usuário.
- **Ruído no repositório:** `tsconfig.tsbuildinfo` (234 KB) e `.next/` versionados ou presentes; `replace_colors.js` na raiz; três READMEs (`README.md`, `README-readpay.md`, `CRIAR_ENV_LOCAL.md`) mais `AGENTS.md` e `CLAUDE.md` com instruções parcialmente duplicadas.
- **`any` em pontos sensíveis:** `handleSaveInvestment(investment: any)`, `useState<any[]>` no portfólio cripto.

---

## 7. Roteiro sugerido

**Fase 1 — Confiança (bloqueia tudo o mais)**
1. Criar tabelas `operacoes`, `proventos`, `posicoes` com RLS; migrar as 4 telas de mock para Supabase
2. Regenerar `database.types.ts`
3. Substituir sparklines fictícias por série real ou remover
4. Trocar `rentabilidadeMedia = "0.0"` por cálculo real ou "—"

**Fase 2 — O diferencial fiscal**
5. Motor de custo médio (função pura + testes, no padrão de `finance.ts`)
6. Apuração mensal por classe/modalidade com compensação de prejuízo
7. Card "IR do mês" + geração de DARF + memória de cálculo em PDF
8. Relatório anual pronto para o IRPF

**Fase 3 — Fundação de UI**
9. Extrair `Button`/`Card`/`Badge`/`Input`/`Modal`; eliminar hex hardcoded
10. Substituir `confirm()` por diálogo próprio; skeletons; estados vazios
11. `tabular-nums` + mono nos valores; passada de acessibilidade nos modais

**Fase 4 — Escala**
12. Import de nota de corretagem e extrato B3
13. Conciliação bancária (OFX/CSV) e contas/carteiras
14. Agregações no banco + paginação

---

## 8. Ressalva

Este documento é análise técnica de produto. As regras tributárias resumidas na seção 3.3 refletem o que estava vigente em agosto de 2026 e servem de especificação funcional — não substituem orientação de contador habilitado, e qualquer motor de apuração implementado deve ser validado por um profissional antes de ser apresentado ao usuário final como cálculo oficial.

---

### Fontes das regras fiscais
- [Ganho de Capital em Ações e ETFs 2026: Nova Alíquota e Regras](https://rolmyjuncontabilidade.com.br/investimentos/ganho-de-capital-acoes-etf-aliquota-2026/)
- [Como Declarar Ações e FIIs no IR 2026: Alíquotas, Isenção e DARF](https://www.adrianofreire.com.br/blog/como-declarar-acoes-fiis-ir-2026)
- [MP sobre tributação de investimentos é retirada de pauta e perde a validade — Câmara dos Deputados](https://www.camara.leg.br/noticias/1209479-MP-SOBRE-TRIBUTACAO-DE-INVESTIMENTOS-E-RETIRADA-DE-PAUTA-E-PERDE-A-VALIDADE)
- [MP 1.303 não aprovada: o impacto na tributação de investimentos — Daycoval](https://blog.daycoval.com.br/mp-1303/)
- [IR de criptomoedas no Brasil 2026: alíquotas, regras e obrigações](https://blueconsult.com.br/imposto-criptomoedas-brasil-2026/)
- [DARF de criptomoedas: como calcular e pagar — QINV](https://www.qinv.com.br/blog/imposto-cripto-darf-mensal-como-pagar)
