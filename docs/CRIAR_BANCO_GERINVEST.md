# ✅ PostgreSQL já está funcionando no VS Code!

## 📊 Sua Situação

```
✅ PostgreSQL instalado e rodando
✅ Conexão configurada em 127.0.0.1@5432 (VS Code)
✅ Bancos presentes: postgres, projinvest
❌ Falta: banco "gerinvest"
```

---

## 🎯 Criar Banco "gerinvest" (2 min)

### Opção A: Usar VS Code PostgreSQL Extension (RECOMENDADO)

**Passo 1:** No VS Code, encontre o painel do PostgreSQL (esquerda)

**Passo 2:** Clique com **direito** na conexão `127.0.0.1@5432`

**Passo 3:** Selecione **"Create Database"**

**Passo 4:** Preencha:
- **Database Name**: `gerinvest`
- **Owner**: `postgres`
- Clique **Create**

**Resultado:**
```
✅ Banco "gerinvest" aparecerá na lista
```

---

### Opção B: Usar Terminal PowerShell

```bash
psql -U postgres

# Dentro do prompt postgres=#:
CREATE DATABASE gerinvest;

# Verificar:
\l

# Sair:
\q
```

---

## ✅ Depois de Criar o Banco

### Testar Conexão

```bash
npm run db:diagnose
```

Deve retornar:
```
✅ Conexão PostgreSQL OK
✅ 0 tabelas encontradas (vazio, é esperado)
✅ DIAGNÓSTICO COMPLETO - Tudo OK!
```

---

### Iniciar Servidor

```bash
npm run dev
```

Acesse: `http://localhost:3000/cadastro`

Tente **criar uma carteira** → Deve funcionar agora! ✅

---

## 🚀 Comando Rápido (Se não vire da UI)

```bash
psql -U postgres -c "CREATE DATABASE gerinvest;"
```

Pronto! Banco criado.

---

**Avise quando criar o banco! Depois testamos o MVP** 👍
