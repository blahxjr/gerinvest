# ⚡ AÇÃO IMEDIATA — O que Fazer AGORA

## 🔴 STATUS ATUAL

```
✅ Projeto Next.js funciona (npm run dev)
✅ .env.local criado
✅ Código pronto
❌ PostgreSQL não está instalado/acessível
```

---

## 🎯 PRÓXIMO PASSO (Escolha um)

### OPÇÃO 1: Script Automático (RECOMENDADO) ⚡

Abra PowerShell e execute:

```bash
powershell -ExecutionPolicy Bypass -File scripts/check-postgres-windows.ps1
```

Este script vai:
- ✅ Verificar se PostgreSQL está instalado
- ✅ Indicar se está no PATH
- ✅ Sugerir ações necessárias

---

### OPÇÃO 2: Manual Step-by-Step

**Passo 1:** Instalar PostgreSQL
```
Ir a: https://www.postgresql.org/download/windows/
Baixar: Download the installer (versão 14+)
Executar: postgresql-xx-windows-x64.exe
Seguir passos (aceite defaults, senha: postgres)
Reiniciar Windows
```

**Passo 2:** Verificar instalação
```bash
psql --version
# Deve retornar: psql (PostgreSQL) xx.x
```

**Passo 3:** Criar banco de dados
```bash
psql -U postgres
# (digite "postgres" como senha)

# Dentro do prompt postgres=#:
CREATE DATABASE gerinvest;
\q
```

**Passo 4:** Testar conexão
```bash
npm run db:diagnose
# Deve retornar: ✅ Conexão PostgreSQL OK
```

**Passo 5:** Voltar ao MVP
```bash
npm run dev
# Acessa: http://localhost:3000/cadastro
# Tenta criar carteira ✅
```

---

## 📖 Documentação Completa

Se precisar de mais detalhes:

- **Rápido:** `docs/INSTALAR_POSTGRESQL.md`
- **Todos os passos:** `docs/SETUP_COMPLETO_POSTGRESQL.md`
- **Com troubleshooting:** `docs/SETUP_POSTGRESQL.md`

---

## 🚀 RECOMENDAÇÃO

```
👉 Execute o script automático PRIMEIRO:
   
   powershell -ExecutionPolicy Bypass -File scripts/check-postgres-windows.ps1
```

Ele vai diagnosticar tudo e dizer exatamente o que fazer next!

---

**Avise quando tiver PostgreSQL instalado / funcionando! 👍**
