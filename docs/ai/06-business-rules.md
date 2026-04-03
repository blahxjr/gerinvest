# GerInvest — Regras de Negócio Canônicas

## Regra 1: não inventar classe de ativo
Toda classe usada no código deve existir no enum oficial do projeto.

## Regra 2: valor consolidado sempre em BRL
Mesmo quando o ativo estiver em USD ou outra moeda, o sistema deve calcular a consolidação em BRL.

## Regra 3: manter moeda original
Nunca perder o valor na moeda original do ativo.

## Regra 4: diversificação é avaliada em dois níveis
- Entre classes
- Dentro da classe

## Regra 5: concentração excessiva deve ser sinalizada
Sugestão inicial:
- >20% em um único ativo: alerta
- >40% em uma única classe: alerta
- >70% concentrado em um único subtipo dentro da classe: alerta

## Regra 6: cada classe tem lógica própria
- FII: analisar tipo e segmento
- Cripto: analisar camada e custódia
- Fundo: analisar categoria e benchmark
- Renda fixa: analisar indexador, liquidez e vencimento
- Previdência: analisar tipo e horizonte

## Regra 7: cadastro manual é obrigatório como fallback
Nenhuma integração externa pode ser pré-requisito para a existência do ativo na carteira.

## Regra 8: roadmap não é funcionalidade implementada
A documentação e a IA devem distinguir claramente:
- o que já existe
- o que está em planejamento
