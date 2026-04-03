# GerInvest — Nova Análise do Projeto

---

## 🗺️ ÍNDICE DE NAVEGAÇÃO (docs/ai/)

Para orientação rápida entre documentos:

| # | Arquivo | Propósito |
|---|---------|----------|
| 00 | `00-context-overview.md` | Visão geral do projeto e glossário |
| 01 | **VOCÊ ESTÁ AQUI** → `01-project-analysis.md` | Análise técnica e estado de implementação |
| 02 | `02-folder-placement-guide.md` | Onde criar novos arquivos? Convenções de nome |
| 03 | `03-domain-model.md` | Tipos, entidades, classes de ativo |
| 04 | `04-tech-architecture.md` | Serviços, repos, camadas, fluxo de dados |
| 05 | `05-data-models.md` | Schema PostgreSQL, modelos de dados |
| 06 | `06-business-rules.md` | Regras de validação, cálculos, restrições |
| 07 | `07-diversification-strategy.md` | Algoritmo de diversificação, métricas |
| 08 | `08-ai-operating-protocol.md` | Como IA deve operar neste repo |
| 09 | `09-copilot-task-system.md` | Tarefas A-E, granularidade, dependências |
| 10 | `10-prompts-library.md` | Prompts reutilizáveis para IA |

---

## Leitura estrutural do repositório

A estrutura visível do projeto indica uma base moderna e extensível:

```txt
.github/
app/
components/
docs/
migrations/
public/
scripts/
src/
.gitignore
AGENTS.md
CLAUDE.md
package.json
```

## Diagnóstico técnico

### Pontos fortes
- Separação razoável entre aplicação, componentes e documentação
- Uso de App Router, o que favorece rotas organizadas por contexto
- Presença de `migrations/`, o que sugere caminho viável para evolução com banco relacional
- Presença de `docs/`, o que facilita introduzir uma camada de memória persistente para IA
- Presença de `AGENTS.md` e `CLAUDE.md`, indicando tentativa prévia de orientar assistentes

### Riscos percebidos
- O README atual mistura fatos confirmados com suposições e itens futuros
- Ainda não há, pelo menos na documentação atual disponível, uma taxonomia estável para múltiplas classes de ativos
- Há risco de espalhar regras de negócio entre telas, services e prompts de IA sem uma fonte única de verdade
- Sem uma camada formal de contexto, a IA tenderá a:
  - repetir suposições antigas
  - inventar campos, scripts e integrações
  - misturar roadmap com funcionalidade já implementada

## Diagnóstico de produto

Hoje o GerInvest aparenta estar mais próximo de um consolidador de posições com dashboard. O maior salto de valor virá quando ele passar a suportar:

1. cadastro multiativo padronizado
2. taxonomia de ativos e subclasses
3. metas por perfil de investidor
4. regras de diagnóstico de diversificação
5. serviços de análise independentes da camada de interface

## Recomendação principal

Criar uma arquitetura de memória no próprio repositório, orientando IA e desenvolvedor humano com os mesmos documentos-base. Essa camada deve morar em `docs/ai/` e resumir:
- domínio
- arquitetura
- modelos de dados
- regras de negócio
- estratégia de diversificação
- protocolo de uso de IA

---

## ✅ ESTADO DE IMPLEMENTAÇÃO (Março 2026)

### Implementado (funcional em produção)
- ✅ Dashboard básico com KPIs
- ✅ Importação de posições (Excel, CSV)
- ✅ Gráficos interativos (Recharts)
- ✅ CRUD de posições simples
- ✅ Cache com `unstable_cache`
- ✅ Autenticação NextAuth.js
- ✅ PostgreSQL conectado
- ✅ Estrutura arquitetural em camadas (domain, infra, ui)

### Implementado Parcialmente
- ⚠️ **Multiativo**: Tipos documentados (13 classes), apenas 4-5 implementadas no código
- ⚠️ **Taxonomia**: Conceitual documentada, não codificada em TypeScript
- ⚠️ **Modelo de dados**: Schema proposto, migrations não aplicadas

### Não Implementado (apenas proposto em docs)
- ❌ **Serviços de análise**: diversificationService, fiiAnalysisService, etc.
- ❌ **Análise de diversificação**: Lógica proposta, não em código
- ❌ **Subclasses**: Necessárias para análise, ainda não modeladas
- ❌ **Integração B3/Brapi**: Proposta, não em código
- ❌ **Firebase**: Mencionado, nunca foi integrado
- ❌ **Análise de risco/correlação**: Proposto no roadmap

### Bloqueadores Críticos para Próximas Features
1. **Tarefa A** (EM EXECUÇÃO): Documentação coerente e navegável ← **você está aqui**
2. **Tarefa B**: Formalizar ClasseAtivo e subclasses em TypeScript
3. **Tarefa C**: Criar serviços de análise independentes de UI
4. **Tarefa D**: Migração BD para suportar multiativo completo

---

## 📋 CHECKLIST ANTES DE IMPLEMENTAR

Use este checklist **antes** de criar qualquer issue ou PR de feature:

- [ ] O feature está documentado em `docs/ai/`?
- [ ] A task pertence a Tarefa A, B, C, D ou E?
- [ ] Qual é a task de bloqueio (dependency)?
- [ ] Há schema de DB envolvido? Se sim, verificou `docs/ai/05-data-models.md`?
- [ ] Será necessário novo tipo em `src/core/domain/`?
