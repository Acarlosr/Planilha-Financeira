# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

# Projeto: FinançasPro - Saldo Claro
URL: https://www.saldoclaro.xyz/

## Objetivo
Transformar o dashboard financeiro existente em uma experiência premium, moderna e profissional.

## Stack Atual
- [Especifique: React/Next.js/Vue/HTML-CSS-JS puro]
- Tailwind CSS
- Chart.js ou biblioteca de gráficos

## Diretrizes de Design Premium
Siga rigorosamente o Design System do ui-ux-pro-max em `.ui-ux-pro-max/`

### Estilo Visual
- **Tema**: Dark Mode sofisticado com gradientes sutis
- **Cores**:
  - Verde neon (#10b981) para receitas/positivo
  - Rosa/vermelho (#f43f5e) para despesas/negativo
  - Azul ciano (#06b6d4) para saldo
  - Âmbar/dourado (#f59e0b) para investimentos
- **Efeitos**: Glassmorphism, sombras suaves, bordas brilhantes
- **Tipografia**: Inter ou Plus Jakarta Sans para UI; JetBrains Mono para valores

### Componentes a Melhorar
1. **Cards de Métricas**: Adicionar gradientes animados, ícones com glow, sparklines
2. **Sidebar**: Efeitos hover elegantes, indicadores ativos com gradiente
3. **Gráficos**: Tooltips customizados, animações suaves
4. **Tabela de Transações**: Linhas com hover effect, status badges
5. **Botões**: Estados loading, microinterações

### Acessibilidade
- Contraste mínimo WCAG AAA
- Focus visible em todos elementos interativos
- ARIA labels completos
- Navegação por teclado

### Responsividade
- Mobile-first
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Cards empilham em mobile, grid em desktop