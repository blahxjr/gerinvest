# GerInvest — Modelo de Domínio

## Entidades principais

### Carteira
Representa um agrupamento lógico de investimentos de uma pessoa.
Exemplos:
- Carteira Principal
- Aposentadoria
- Reserva em Dólar
- Carteira Cripto

### Classe de ativo
Representa o grande grupo do investimento.

Classes alvo:
- ACAO_BR
- FII
- ETF_BR
- BDR
- ACAO_EUA
- ETF_EUA
- REIT
- FUNDO
- CRIPTO
- RENDA_FIXA
- POUPANCA
- PREVIDENCIA
- ALTERNATIVO

### Subclasse / estratégia
Permite diagnóstico interno dentro da classe.

Exemplos:
- FII: tijolo, papel, fof, desenvolvimento
- FII tijolo: logístico, laje, shopping, hotel, residencial
- Cripto: base, infraestrutura, defi, especulativo
- Fundo: renda fixa, multimercado, ações, cambial, fof
- Renda fixa: pós-fixado, IPCA, prefixado

### Ativo
Representa o instrumento financeiro em si.
Exemplos:
- PETR4
- MXRF11
- IVVB11
- AAPL
- BTC
- Tesouro Selic 2029
- Fundo XP Macro

### Posição
Representa a exposição do usuário a um ativo.
Uma posição deve guardar:
- quantidade
- preço médio
- valor atual
- moeda original
- instituição
- conta
- custódia
- datas relevantes

## Princípios do domínio

1. Nem todo ativo tem ticker de bolsa.
2. Nem todo ativo tem liquidez diária.
3. Nem todo ativo tem preço em BRL.
4. O sistema deve armazenar moeda original e valor convertido.
5. A análise de diversificação deve olhar a carteira em dois níveis:
   - macro: entre classes
   - micro: dentro de cada classe
