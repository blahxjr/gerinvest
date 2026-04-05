# Guia de Cadastro Manual - Alocação por Banco

Este guia descreve o fluxo para alocar investimentos por banco/carteira no GerInvest (BB, Nubank, BTG/EQI, Nomad e Mercado Pago), reaproveitando ativos já importados quando possível.

## Onde acessar

1. Abra o menu lateral.
2. Clique em "Cadastro Manual Invest.".
3. Acesse a rota: /cadastro-manual-bb.

## O que a tela faz

- Permite escolher modelo rápido: BB, Nubank, BTG/EQI, Nomad e Mercado Pago.
- Permite alocar FUNDO, RENDA_FIXA (CDB), ACAO_BR, FII, ETF_BR, BDR, ACAO_EUA, ETF_EUA, REIT e CRIPTO.
- Permite definir moeda original por posição (BRL, USD, EUR).
- Reutiliza ativos já existentes por ticker/nome-classe (evita duplicação).
- Cria carteira apenas se ainda não existir com o mesmo nome.
- Cria posições vinculadas à carteira e à instituição/conta informada.

## Campos do cabeçalho

- Nome da carteira: nome exibido no sistema.
- Perfil: conservador, moderado ou arrojado.
- Instituição: corretora/banco custodiante.
- Conta: número da conta de investimento.
- Descrição: texto livre para identificação.

## Campos por fundo

- Tipo: FUNDO, RENDA_FIXA, ACAO_BR, FII, ETF_BR, BDR, ACAO_EUA, ETF_EUA, REIT ou CRIPTO.
- Nome: obrigatório.
- Ticker: opcional, mas recomendado para facilitar filtros.
- Subclasse: obrigatória para FUNDO e RENDA_FIXA.
- CNPJ: opcional.
- Moeda: BRL, USD ou EUR.
- Cotas/Qtd: quantidade do ativo.
- Preço Médio: valor médio por cota.
- Valor Atual BRL: saldo atual em reais.
- Data Entrada: data inicial da posição.
- Data Vencimento: obrigatória para RENDA_FIXA.

## Regras de validação

- Nome da carteira, instituição e conta são obrigatórios.
- Cada linha precisa de nome.
- Para ações/FIIs/ETFs/REIT/BDR/cripto, ticker é obrigatório.
- Valor Atual BRL não pode ser negativo.
- Quantidade e preço médio não podem ser negativos.
- Para RENDA_FIXA, data de vencimento é obrigatória.

## Resultado esperado

Ao clicar em "Salvar carteira no banco":

1. O sistema busca carteira existente pelo nome.
2. Se não existir, cria a carteira.
3. Para cada linha, tenta reutilizar ativo já cadastrado por ticker (ou nome+classe).
4. Cria somente os ativos que não existirem.
5. Cria as posições na carteira/instituição/conta informadas.
6. Exibe totais de ativos criados, reutilizados e posições criadas.

## Se ocorrer erro

- Se o ticker informado não existir e conflitar com algum ativo, ajuste a linha.
- Se um ativo/posição falhar, a tela mostra mensagem com o ponto de falha.
- Ajuste os dados e repita o envio.

## Checklist rápido

- Ativos de ações/FII/ETF/BDR/internacional já importados pela planilha (quando houver).
- Tela /cadastro-manual-bb preenchida com instituição correta.
- Carteiras separadas por banco (ex.: Carteira Nubank, Carteira BTG/EQI, Carteira Nomad, Carteira Mercado Pago).
- Cadastro executado com retorno de sucesso.
