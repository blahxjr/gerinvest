# 🚨 ERRO: "client password must be a string" — SOLUÇÃO RÁPIDA

## O Problema
```
Error: SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string
    at async PostgresPortfolioRepository.createCarteira
```

**Causa:** `DATABASE_URL` não está configurada correctamente no `.env.local`

---

## ✅ Solução Rápida (5 min)

### Passo 1: Criar `.env.local`

Crie arquivo `c:\dev\gerinvest\.env.local`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gerinvest
```

### Passo 2: Verificar PostgreSQL

```bash
# No terminal/PowerShell:

# Verificar se PostgreSQL está instalado
psql --version

# Se não funcionar, instale em: https://www.postgresql.org/download/windows/
```

### Passo 3: Criar banco de dados

```bash
# Conectar ao PostgreSQL
psql -U postgres

# Dentro do prompt psql (postgres=#):
CREATE DATABASE gerinvest;
\l

# Você deve ver "gerinvest" na lista
# Sair:
\q
```

### Passo 4: Testar Conexão

```bash
# No seu projeto:
cd c:\dev\gerinvest
npm run db:diagnose

# Deve retornar: ✅ Conexão PostgreSQL OK
```

### Passo 5: Reiniciar Servidor

```bash
# Parar servidor (Ctrl+C se estiver rodando)
# Iniciar:
npm run dev

# Tenta criar carteira novamente
```

---

## 🔧 Se Não Funcionar

### Se `psql --version` não funciona:
**PostgreSQL não está instalado**
→ [Download e instale aqui](https://www.postgresql.org/download/windows/)

### Se erro "password must be a string":
1. Verificar `.env.local` existe
2. Verificar DATABASE_URL tem valor
3. Tentar com aspas: `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gerinvest"`

### Se erro "could not connect to server":
**PostgreSQL não está rodando**
- Windows: Procure "Services" e inicie PostgreSQL
- Ou na PowerShell: `pg_ctl -D "C:\Program Files\PostgreSQL\16\data" start`

### Se erro "database does not exist":
```bash
createdb gerinvest
```

---

## 📋 Arquivo `.env.local` Pronto

Copie e cole em `c:\dev\gerinvest\.env.local`:

```env
# PostgreSQL Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gerinvest

# Se customizou credenciais, ajuste aqui:
# DATABASE_URL=postgresql://seu_user:sua_senha@localhost:5432/gerinvest
```

---

## 🎯 Próximas Passos

Depois que `npm run db:diagnose` retornar ✅:

1. Reinicia `npm run dev`
2. Abre `http://localhost:3000/cadastro`
3. Preenche e salva carteira
4. Deve funcionar! ✅

---

**Precisa de ajuda?** Leia `docs/SETUP_POSTGRESQL.md` para guia completo.
