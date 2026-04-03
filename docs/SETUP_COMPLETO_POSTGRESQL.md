# 🚀 SETUP GUIA COMPLETO — PostgreSQL no Windows

## 📋 Sua Situação Atual

```
✅ Node.js instalado
✅ Projeto Next.js configurado
✅ .env.local criado com DATABASE_URL
❌ PostgreSQL NÃO está acessível pelo PowerShell
❌ Banco de dados 'gerinvest' não foi criado
```

---

## 🎯 ROTEIRO COMPLETO (15 min)

### Fase 1: Checar PostgreSQL (2 min)

```bash
# Execute este script para diagnosticar:
powershell -ExecutionPolicy Bypass -File scripts/check-postgres-windows.ps1
```

Ele vai:
- ✅ Verificar se PostgreSQL está instalado
- ✅ Se estiver no PATH
- ✅ Sugerir ações se não estiver

### Fase 2A: Se PostgreSQL NÃO está instalado

Siga: `docs/INSTALAR_POSTGRESQL.md` → **Opção A**

Resumo:
1. Baixe de: https://www.postgresql.org/download/windows/
2. Execute o instalador
3. Complete steps (aceite defaults, portão 5432, senha `postgres`)
4. Reinicie Windows
5. Continua na Fase 3

### Fase 2B: Se PostgreSQL está instalado mas NÃO no PATH

Siga: `docs/INSTALAR_POSTGRESQL.md` → **Opção B**

Resumo:
1. Abra PowerShell como ADMINISTRADOR
2. Execute o comando de adicionar ao PATH
3. Feche e reabra PowerShell
4. Continua na Fase 3

### Fase 3: Criar Banco de Dados (3 min)

Siga: `docs/PROXIMO_PASSO_CRIAR_BANCO.md`

Resumo:
```bash
psql -U postgres

# Dentro do prompt postgres=#:
CREATE DATABASE gerinvest;
\l
\q
```

### Fase 4: Validar Tudo (2 min)

```bash
npm run db:diagnose
```

Deve retornar:
```
✅ Conexão PostgreSQL OK
✅ DIAGNÓSTICO COMPLETO - Tudo OK!
```

### Fase 5: Testar MVP (5 min)

```bash
npm run dev

# Abre http://localhost:3000/cadastro
# Tenta criar carteira
# Deve funcionar! ✅
```

---

## 🆘 TROUBLESHOOTING

| Problema | Solução |
|----------|---------|
| `psql não é reconhecido` | Execute: `scripts/check-postgres-windows.ps1` |
| "Permission denied" ao adicionar PATH | PowerShell precisa ser como ADMINISTRADOR |
| "Password authentication failed" | Senha do usuário postgres incorreta (padrão é `postgres`) |
| "database 'gerinvest' does not exist" | Execute: `CREATE DATABASE gerinvest;` no psql |
| npm run db:diagnose still fails | Reinicie Windows e tente novamente |

---

## 📚 Arquivos de Ajuda

- **`docs/INSTALAR_POSTGRESQL.md`** — Instalação completa
- **`docs/PROXIMO_PASSO_CRIAR_BANCO.md`** — Criar banco
- **`docs/SETUP_POSTGRESQL.md`** — Setup detalhado
- **`scripts/check-postgres-windows.ps1`** — Verificador automático
- **`scripts/diagnose-postgres.js`** — Teste de conexão

---

## ✅ Checklist Rápido

Quando tiver tudo configurado:

```
[ ] PostgreSQL instalado (psql --version funciona)
[ ] psql acessível pelo PowerShell
[ ] Banco 'gerinvest' criado no PostgreSQL
[ ] npm run db:diagnose retorna ✅
[ ] npm run dev funciona sem erros de database
[ ] http://localhost:3000/cadastro abre
[ ] Consegue criar carteira com sucesso
```

Quando todos forem ✅, MVP está funcionando! 🎉

---

## 🚀 Próximo Comando

```bash
# Executa verificador automático:
powershell -ExecutionPolicy Bypass -File scripts/check-postgres-windows.ps1
```

Avise o resultado! 👍
