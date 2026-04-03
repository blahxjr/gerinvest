# Guia de Introdução — GerInvest

> Como configurar e executar o GerInvest localmente para desenvolvimento.

## 📋 Pré-requisitos

- **Node.js** 18.0 ou superior (recomendado: 20.x)
- **npm** ou **yarn**
- **Git** para controle de versão
- Editor de código (VS Code recomendado)

### Verificar versões

```bash
node --version  # Deve ser 18.0+
npm --version   # Deve ser 8.0+
```

## 🚀 Instalação Rápida

### 1. Clonar o repositório

```bash
git clone https://github.com/seu-usuario/gerinvest.git
cd gerinvest
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar ambiente (opcional)

```bash
cp .env.example .env.local
# Edite .env.local se necessário
```

### 4. Executar o projeto

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## 🏗️ O que acontece na instalação?

O comando `npm install` baixa e instala:

- **Next.js 16.2.1**: Framework React para produção
- **TypeScript 5.x**: Tipagem estática
- **TailwindCSS 4.x**: Estilização utilitária
- **Recharts 3.8.1**: Gráficos interativos
- **csv-parse & xlsx**: Processamento de dados
- **Zod**: Validação de schemas

## 🧪 Primeiro teste

1. **Acesse o dashboard** em `http://localhost:3000`
2. **Verifique os KPIs**: Devem mostrar zeros inicialmente
3. **Teste a importação**: Vá para `/importacao` e faça upload de uma planilha Excel

### Planilha de exemplo

Crie uma planilha Excel com as colunas:
- `ticker`, `assetClass`, `quantity`, `price`, `grossValue`
- Exemplo: `VALE3`, `ACOES`, `100`, `45.50`, `4550.00`

## 🔧 Desenvolvimento

### Scripts disponíveis

```bash
npm run dev      # Desenvolvimento com hot reload
npm run build    # Build de produção
npm run start    # Servidor de produção
npm run lint     # Verificação de código
```

### Estrutura do projeto

```
gerinvest/
├── app/                 # Páginas Next.js
├── src/
│   ├── core/           # Lógica de negócio
│   ├── infra/          # Implementações I/O
│   └── ui/             # Componentes React
├── public/data/        # CSVs gerados
└── docs/               # Documentação
```

## 🐛 Problemas comuns

### Erro: "Port 3000 already in use"

```bash
# Mate processos na porta 3000
npx kill-port 3000
# Ou use outra porta
npm run dev -- -p 3001
```

### Erro: "Module not found"

```bash
# Limpe cache e reinstale
rm -rf node_modules package-lock.json
npm install
```

### Erro no build

```bash
# Verifique TypeScript
npx tsc --noEmit
# Execute linting
npm run lint
```

## 📚 Próximos passos

1. **Explore o código**: Comece por `app/page.tsx`
2. **Entenda os dados**: Veja `src/core/domain/types.ts`
3. **Teste as APIs**: Use `/api/upload-positions`
4. **Leia a documentação**: `gerainvest-documentacao.md`

## 🤝 Contribuição

1. Crie uma branch: `git checkout -b feature/nova-feature`
2. Faça commits: `git commit -m "feat: descrição"`
3. Push: `git push origin feature/nova-feature`
4. Abra um PR

## 📞 Suporte

- **Issues**: Para bugs e solicitações
- **Discussions**: Para perguntas gerais
- **Discord/Slack**: Para chat em tempo real (futuro)

---

*Última atualização: Março 2026*