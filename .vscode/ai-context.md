# Contexto Fixo para IA — GerInvest

Você está trabalhando no projeto **GerInvest**, uma plataforma de consolidação e análise de carteiras de investimento.

## 📊 Estado Atual (Março 2026)
- ✅ Protótipo funcional: Dashboard, importação CSV/Excel, edição de posições
- ✅ Stack: Next.js 16.2.1, TypeScript, TailwindCSS, Recharts, PostgreSQL
- ⏳ Multiativo: 13 classes documentadas, ~4 implementadas
- ⏳ Análise de diversificação: estrutura proposta, não codificada
- ❌ Integração B3/Brapi: não implementada

## 🎯 Objetivo de Longo Prazo
Consolidar e analisar todas as classes de ativos:
- Ativos da B3 (ações, FIIs, ETFs)
- Bolsa americana (ações, ETFs, REITs, BDRs)
- Fundos de investimento
- Criptomoedas
- Renda fixa
- Poupança
- Previdência privada

Com diagnóstico inteligente de diversificação por perfil.

## ⚠️ REGRAS ABSOLUTAS (Críticas)
1. **Leia `docs/ai/` antes de qualquer mudança estrutural** — ordem: 00 → 03 → 04 → 05 → 06
2. **Não invente ClasseAtivo, endpoint, script ou migration** — confira no código primeiro
3. **Não misture roadmap com implementação** — `01-project-analysis.md` indica o que existe
4. **Ambiguidade = bloqueador** — pergunte antes de implementar
5. **Mudanças em regra financeira exigem update em `06-business-rules.md`**

## 📚 Leitura Obrigatória
- Estado real: `docs/ai/01-project-analysis.md`
- Domínio: `docs/ai/03-domain-model.md`
- Arquitetura: `docs/ai/04-tech-architecture.md`
- Tipos/SQL: `docs/ai/05-data-models.md`
- Regras: `docs/ai/06-business-rules.md`
- Tarefas: `docs/ai/09-copilot-task-system.md`

## 📋 Formato de Resposta
1. Diagnóstico
2. Impacto
3. Proposta
4. Arquivos afetados
5. Próximos passos

---

## 🚀 STATUS DO SISTEMA DE TAREFAS (docs/ai/09-copilot-task-system.md)

| Tarefa | Descrição | Status | Bloqueador? |
|--------|-----------|--------|------------|
| **A** | Formalizar memória do projeto (docs coerentes) | ✅ COMPLETA | ~~Sim~~ |
| **B** | Formalize multiativo taxonomy em code (tipos) | ✅ COMPLETA | ~~Sim~~ |
| **C** | Crie serviços de análise | ✅ COMPLETA | ~~Sim~~ |
| **D** | Migrations para multiativo schema | ✅ COMPLETA | ~~Sim~~ |
| **E** | UI expandida para cadastro | ⏳ **PRONTA** | Pronto! ✓ |

### 🏁 Tarefas Completas (A-D)
- ✅ **A**: Documentação coerente (11 arquivos em docs/ai/)
- ✅ **B**: 13 ClasseAtivo + 17 SubclasseAtivo em TypeScript
- ✅ **C**: 5 serviços de análise (1.415 linhas)
- ✅ **D**: Migrations + schema PostgreSQL (250 linhas SQL)
