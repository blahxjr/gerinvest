-- Migration 005: Dados de Exemplo para Multiativo Schema
-- Alinhado com docs/ai/05-data-models.md
-- Data: 2026-04-03

BEGIN;

-- 1. Inserir carteiras de exemplo
INSERT INTO carteiras (id, nome, descricao, perfil, moeda_base) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Carteira Principal', 'Investimentos de longo prazo', 'moderado', 'BRL'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Reserva em Dólar', 'Exposição em moeda estrangeira', 'conservador', 'USD'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Criptos Especulativas', 'Alto risco', 'arrojado', 'BRL')
ON CONFLICT DO NOTHING;

-- 2. Inserir ativos de exemplo (uma amostra de cada classe)
INSERT INTO ativos (id, ticker, nome, classe, subclasse, pais, moeda, setor, segmento, metadata) VALUES
  -- ACAO_BR
  ('550e8400-e29b-41d4-a716-446655440011', 'PETR4', 'Petrobras PN', 'ACAO_BR', NULL, 'BRA', 'BRL', 'Petróleo e Gás', NULL, '{"ibovespa": true}'),
  ('550e8400-e29b-41d4-a716-446655440012', 'VALE3', 'Vale ON', 'ACAO_BR', NULL, 'BRA', 'BRL', 'Mineração', NULL, '{"ibovespa": true}'),
  
  -- FII
  ('550e8400-e29b-41d4-a716-446655440021', 'MXRF11', 'Maxi Renda Variável FII', 'FII', 'FII_PAPEL', 'BRA', 'BRL', NULL, 'Papel', '{"dividend_yield": 0.067}'),
  ('550e8400-e29b-41d4-a716-446655440022', 'KNRI11', 'Kinea Renda Industrial FII', 'FII', 'FII_TIJOLO', 'BRA', 'BRL', NULL, 'Logístico', '{"dividend_yield": 0.065}'),
  
  -- ETF_BR
  ('550e8400-e29b-41d4-a716-446655440031', 'IVVB11', 'iShares S&P 500 BDR', 'ETF_BR', NULL, 'BRA', 'BRL', NULL, NULL, '{"benchmark": "^INDU"}'),
  
  -- BDR
  ('550e8400-e29b-41d4-a716-446655440041', 'AAPL34', 'Apple Inc. BDR', 'BDR', NULL, 'USA', 'USD', 'Tecnologia', NULL, '{"ratio": "1:1"}'),
  
  -- ACAO_EUA
  ('550e8400-e29b-41d4-a716-446655440051', 'AAPL', 'Apple Inc.', 'ACAO_EUA', NULL, 'USA', 'USD', 'Tecnologia', NULL, '{"exchange": "NASDAQ"}'),
  
  -- ETF_EUA
  ('550e8400-e29b-41d4-a716-446655440061', 'SPY', 'SPDR S&P 500 ETF', 'ETF_EUA', NULL, 'USA', 'USD', NULL, NULL, '{"benchmark": "^GSPC"}'),
  
  -- FUNDO
  ('550e8400-e29b-41d4-a716-446655440071', 'XPML', 'XP Macro Fundo', 'FUNDO', 'FUNDO_MULTIMERCADO', 'BRA', 'BRL', NULL, NULL, '{"category": "ANBIMA_MM"}'),
  
  -- CRIPTO
  ('550e8400-e29b-41d4-a716-446655440081', 'BTC', 'Bitcoin', 'CRIPTO', 'CRIPTO_BASE', 'INT', 'USD', NULL, NULL, '{"exchange": "Binance"}'),
  ('550e8400-e29b-41d4-a716-446655440082', 'ETH', 'Ethereum', 'CRIPTO', 'CRIPTO_BASE', 'INT', 'USD', NULL, NULL, '{"exchange": "Binance"}'),
  
  -- RENDA_FIXA
  ('550e8400-e29b-41d4-a716-446655440091', 'TESOURO_SELIC_2026', 'Tesouro Selic 2026', 'RENDA_FIXA', 'RF_TESOURO', 'BRA', 'BRL', NULL, NULL, '{"indexer": "SELIC", "issuer": "TESOURO_NACIONAL"}'),
  ('550e8400-e29b-41d4-a716-446655440092', 'TESOURO_IPCA_2030', 'Tesouro IPCA+ 2030', 'RENDA_FIXA', 'RF_IPCA', 'BRA', 'BRL', NULL, NULL, '{"indexer": "IPCA", "issuer": "TESOURO_NACIONAL"}'),
  
  -- POUPANCA
  ('550e8400-e29b-41d4-a716-446655440101', 'POUPANCA', 'Poupança BB', 'POUPANCA', NULL, 'BRA', 'BRL', NULL, NULL, '{"issuer": "BANCO_DO_BRASIL"}'),
  
  -- PREVIDENCIA
  ('550e8400-e29b-41d4-a716-446655440111', 'VGBL_XPML', 'VGBL XP Macro', 'PREVIDENCIA', NULL, 'BRA', 'BRL', NULL, NULL, '{"tipo": "VGBL"}')
  
ON CONFLICT DO NOTHING;

-- 3. Inserir posições de exemplo
INSERT INTO posicoes (id, carteira_id, ativo_id, quantidade, preco_medio, valor_atual_bruto, valor_atual_brl, moeda_original, instituicao, conta, data_entrada) VALUES
  -- Carteira Principal: mix de ações + FII + ETF
  ('550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440011', 100, 25.50, 2800, 2800, 'BRL', 'Nubank', 'Principal', '2025-01-01'),
  ('550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440012', 50, 65.00, 3500, 3500, 'BRL', 'Nubank', 'Principal', '2025-02-01'),
  ('550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440021', 200, 10.50, 2200, 2200, 'BRL', 'Nubank', 'Principal', '2025-01-15'),
  ('550e8400-e29b-41d4-a716-446655440204', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440091', 1000, 9.80, 10200, 10200, 'BRL', 'Tesouro Direto', 'Principal', '2024-06-01'),
  
  -- Reserva em Dólar: BDR + ETF EUA
  ('550e8400-e29b-41d4-a716-446655440205', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440041', 10, 150.00, 1500, 7650, 'USD', 'XP', 'Dólar', '2025-01-01'),
  ('550e8400-e29b-41d4-a716-446655440206', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440061', 5, 400.00, 2000, 10200, 'USD', 'XP', 'Dólar', '2025-02-01'),
  
  -- Criptos: 2 BTC + 5 ETH
  ('550e8400-e29b-41d4-a716-446655440207', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440081', 2, 45000.00, 95000, 484500, 'USD', 'Binance', 'Spot', '2024-06-01'),
  ('550e8400-e29b-41d4-a716-446655440208', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440082', 5, 3000.00, 16500, 84150, 'USD', 'Binance', 'Spot', '2024-07-01')
  
ON CONFLICT DO NOTHING;

-- 4. Commit automático ao final
COMMIT;

-- 5. Logging
SELECT 'Migration 005: Dados de exemplo inseridos com sucesso!' AS status;
