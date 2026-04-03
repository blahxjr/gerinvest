# 🔧 POSTGRESQL NÃO ESTÁ INSTALADO

## ❌ Problema

```
psql : O termo 'psql' não é reconhecido como nome de cmdlet
```

**Causa:** PostgreSQL não está instalado OU não está no PATH do Windows.

---

## ✅ SOLUÇÃO — Passo a Passo

### Opção A: PostgreSQL Não Está Instalado (RECOMENDADO)

**1. Baixe PostgreSQL:**
- Vá a: https://www.postgresql.org/download/windows/
- Clique em **"Download the installer"**
- Escolha versão **14 ou superior** (recomendo versão recente)

**2. Execute o instalador:**
- Clique no arquivo `postgresql-xx-windows-x64.exe`
- Clique **Next** (aceite locais padrão)
- **Password** para usuário `postgres`: use uma senha simples (ex: `postgres`)
- Deixe porta como **5432** (padrão)
- **Finish** para completar instalação

**3. Reinicie seu Windows** (recomendado)

**4. Teste:**
```bash
psql --version
```

Deve retornar algo como: `psql (PostgreSQL) 16.0`

---

### Opção B: PostgreSQL Instalado Mas NÃO no PATH

**1. Encontre onde PostgreSQL foi instalado:**

Procure por uma pasta similar a:
```
C:\Program Files\PostgreSQL\16\bin
C:\Program Files\PostgreSQL\15\bin
```

**2. Abra PowerShell como ADMINISTRADOR:**
- Clique direito no PowerShell
- Selecione **"Executar como administrador"**

**3. Adicione ao PATH:**

```powershell
# Substitua "16" pela sua versão
[Environment]::SetEnvironmentVariable(
  'Path', 
  "$env:Path;C:\Program Files\PostgreSQL\16\bin", 
  [System.EnvironmentVariableTarget]::Machine
)
```

**4. Feche ALL PowerShell windows e abra uma nova**

**5. Teste:**
```bash
psql --version
```

---

## 🎯 Verificar se PostgreSQL está instalado

**No Windows, procure por:**
- Painel de Controle → Programas → Desinstalar um programa
- Procure por `PostgreSQL`

Se não achar, PostgreSQL **NÃO está instalado**.

---

## ✅ Depois de Instalar/Configurar

Execute:
```bash
psql -U postgres
```

Você deve entrar no prompt:
```
postgres=#
```

Se entrou, PostgreSQL está funcionando! 🎉

Agora siga: `docs/PROXIMO_PASSO_CRIAR_BANCO.md`

---

## 🆘 Se Ainda Não Funcionar

```bash
# Testar diagnóstico:
npm run db:diagnose

# Se retornar erro de conexão:
# PostgreSQL está instalado mas não rodando
# Procure por "Services" no Windows e inicie "postgresql-x64-16" (ou sua versão)
```

---

## 📋 Checklist

```
[ ] Procurou em "Programas" e não achou PostgreSQL
[ ] Baixou PostgreSQL de https://www.postgresql.org/download/windows/
[ ] Executou o instalador .exe
[ ] Completou instalação (Next, Next, Finish)
[ ] Reiniciou Windows
[ ] Testou: psql --version (funciona)
```

Depois de todos OK, avisa! 👍
