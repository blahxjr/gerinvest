# 🎯 PRÓXIMO PASSO — Criar Banco de Dados

## ✅ Sua configuração está OK!

```
✅ .env.local encontrado
✅ DATABASE_URL lido corretamente
❌ Banco "gerinvest" não existe
```

---

## 🔧 Solução Rápida (2 min)

### Passo 1: Abrir PowerShell e conectar ao PostgreSQL

```bash
psql -U postgres
```

Você verá:
```
postgres=#
```

### Passo 2: Criar o banco `gerinvest`

Dentro do prompt `postgres=#`, execute:

```sql
CREATE DATABASE gerinvest;
```

Você deve ver:
```
CREATE DATABASE
```

### Passo 3: Verificar se foi criado

```sql
\l
```

Você deve ver `gerinvest` na lista de bancos.

### Passo 4: Sair

```sql
\q
```

---

## ✅ Testar Novamente

Após criar o banco, execute:

```bash
npm run db:diagnose
```

Deve retornar:
```
✅ Conexão PostgreSQL OK
✅ DIAGNÓSTICO COMPLETO - Tudo OK!
```

---

## 🚀 Se Tudo Der OK

1. **Reinicia o servidor**: `npm run dev`
2. **Tenta criar carteira**: `http://localhost:3000/cadastro`
3. **Deve funcionar agora! ✅**

---

**Precisa de ajuda?** Veja `docs/SETUP_POSTGRESQL.md`
