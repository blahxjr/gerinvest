# 🛠️ CONFIGURAÇÃO DE POSTGRE SQL - Guia Passo a Passo

## ⚠️ ERRO COMUM
```
Error: SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string
```

**Causa:** `DATABASE_URL` não está configurada ou está inválida.

---

## ✅ SOLUÇÃO PASSO A PASSO

### 1️⃣ Verificar se PostgreSQL está instalado

**Windows:**
```bash
# Abra PowerShell e tente conectar
psql --version

# Se não funcionar, instale em:
# https://www.postgresql.org/download/windows/
```

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux (Ubuntu):**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo service postgresql start
```

---

### 2️⃣ Criar banco de dados `gerinvest`

**Opção A: Usando terminal (recomendado)**

```bash
# Conectar ao PostgreSQL
psql -U postgres

# Dentro do psql, executar:
CREATE DATABASE gerinvest;

# Verificar se criou:
\l

# Sair:
\q
```

**Opção B: Usando pgAdmin (GUI)**
```
1. Abra pgAdmin (geralmente http://localhost:5050)
2. Right-click "Databases"
3. Create → Database
4. Nome: gerinvest
5. Clique Create
```

---

### 3️⃣ Configurar `.env.local` no projeto

**Arquivo:** `c:\dev\gerinvest\.env.local`

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gerinvest
```

**Explicação:**
```
postgresql://[usuario]:[senha]@[host]:[porta]/[banco]
              └─ postgres  → user padrão PostgreSQL
                           └─ postgres  → senha padrão
                                         └─ localhost → sua máquina
                                                       └─ 5432 → porta padrão
                                                                 └─ gerinvest → banco que criou
```

### Se você customizou credenciais:
```env
DATABASE_URL=postgresql://seu_usuario:sua_senha@localhost:5432/gerinvest
```

---

### 4️⃣ Executar Migrations

```bash
# Dentro do diretório do projeto
cd c:\dev\gerinvest

# Executar script de migrations
npm run db:migrate
```

**Se `db:migrate` não existir:**
```bash
# Executar SQL manualmente:
psql -U postgres -d gerinvest -f migrations/004_multiativo_schema.sql
```

---

### 5️⃣ Verificar Conexão

**Test da conexão:**
```bash
psql -U postgres -d gerinvest -c "SELECT 1;"

# Se retornar:
#  ?column? 
# ----------
#         1
# (1 row)
# ✅ Conexão OK!
```

---

### 6️⃣ Reiniciar Servidor Next.js

```bash
# Parar o servidor (Ctrl+C)
# Iniciar novamente:
npm run dev
```

---

## 🐛 Troubleshooting

### Erro: "error: role 'postgres' does not exist"
```bash
# Criar role postgres:
psql -U postgres -c "CREATE ROLE postgres WITH PASSWORD 'postgres' LOGIN;"
```

### Erro: "fe_sendauth: no password supplied"
```bash
# Verificar .env.local tem DATABASE_URL
# Verificar senha está correta em .env.local
# Tentar com aspas:
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gerinvest"
```

### Erro: "could not connect to server: Connection refused"
```bash
# PostgreSQL não está rodando
# Windows: psql -U postgres
# macOS: brew services start postgresql
# Linux: sudo service postgresql start
```

### Erro: "database 'gerinvest' does not exist"
```bash
# Criar banco:
psql -U postgres -c "CREATE DATABASE gerinvest;"
```

---

## ✅ Checklist Final

```
[ ] PostgreSQL instalado (psql --version retorna versão)
[ ] PostgreSQL rodando (consegue conectar)
[ ] Banco 'gerinvest' criado (psql -l mostra gerinvest)
[ ] .env.local existe com DATABASE_URL correto
[ ] Migrations executadas (psql -d gerinvest -c "\dt" mostra tabelas)
[ ] Servidor Next.js reiniciado (npm run dev)
[ ] Tenta criar carteira novamente
```

Se todos os checks passarem: ✅ **Deve funcionar!**

---

## 🚀 Testar Conexão via Node.js

Se quiser testar direto no Node:

```bash
# Criar arquivo teste.js
node -e "
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/gerinvest'
});
pool.query('SELECT NOW()', (err, res) => {
  if (err) console.error('❌ Erro:', err.message);
  else console.log('✅ Conectado!', res.rows[0]);
  process.exit();
});
"
```

---

## 🔗 Recursos Úteis

- [PostgreSQL Download](https://www.postgresql.org/download/)
- [psql Cheat Sheet](https://www.postgresql.org/docs/current/app-psql.html)
- [pgAdmin Guide](https://www.pgadmin.org/docs/)
- [Connection Strings](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING)

---

## 📋 Confirmação

Depois de seguir este guia, responda:

```
✅ PostgreSQL está rodando?
✅ Banco 'gerinvest' foi criado?
✅ .env.local foi criado com DATABASE_URL?
✅ npm run dev foi reiniciado?
```

Se todos forem **✅**, retorna para tentar criar a carteira novamente!
