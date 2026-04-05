-- ============================================================
-- seed_carteira_bb.sql
-- Carteira Banco do Brasil - JOSE FERREIRA SANTOS JR
-- Extrato em: 02/04/2026 | Agência 2314-0 | Conta 16629-4
--
-- Uso:
--   $env:PGPASSWORD = 'postgres'
--   & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d gerinvest -f scripts/seed_carteira_bb.sql
-- ============================================================

BEGIN;

-- ─────────────────────────────────────────────────────────────
-- 1. CARTEIRA
-- ─────────────────────────────────────────────────────────────
INSERT INTO carteiras (id, nome, descricao, perfil, moeda_base)
VALUES (
  'bb000000-0000-0000-0000-000000000001',
  'Carteira BB',
  'Fundos de Investimento Banco do Brasil — Agência 2314-0 / Conta 16629-4',
  'moderado',
  'BRL'
)
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- 2. ATIVOS (fundos)
-- ─────────────────────────────────────────────────────────────
INSERT INTO ativos (id, ticker, nome, classe, subclasse, pais, moeda, benchmark, metadata)
VALUES
  -- Multimercados
  (
    'bb000000-0000-0000-0001-000000000001',
    'MM_ARBITRAGEM',
    'MM Arbitragem',
    'FUNDO', 'FUNDO_MULTIMERCADO', 'BRA', 'BRL', 'CDI',
    '{"cnpj": "06.015.361/0001-98", "gestora": "BB Gestão de Recursos", "categoria": "Multimercado Arbitragem"}'
  ),
  (
    'bb000000-0000-0000-0001-000000000003',
    'ESP_MM_KAPITALO',
    'Esp MM Kapitalo',
    'FUNDO', 'FUNDO_MULTIMERCADO', 'BRA', 'BRL', 'CDI',
    '{"cnpj": "34.616.836/0001-37", "gestora": "Kapitalo", "categoria": "Multimercado Especializado"}'
  ),

  -- Fundos de Ações
  (
    'bb000000-0000-0000-0001-000000000002',
    'ACOES_BOLSA_BR',
    'Ações Bolsa Brasil',
    'FUNDO', 'FUNDO_ACOES', 'BRA', 'BRL', 'IBOV',
    '{"cnpj": "09.005.823/0001-84", "gestora": "BB Gestão de Recursos", "categoria": "Ações Ativo Brasil"}'
  ),
  (
    'bb000000-0000-0000-0001-000000000004',
    'ACOES_GLOBAIS_ATIVO',
    'Ações Globais Ativo',
    'FUNDO', 'FUNDO_ACOES', 'USA', 'BRL', 'MSCI ACWI',
    '{"cnpj": "39.255.695/0001-98", "gestora": "BB Gestão de Recursos", "categoria": "Ações Ativo Global"}'
  ),

  -- Renda Fixa
  (
    'bb000000-0000-0000-0001-000000000005',
    'RF_TESOURO_PRE',
    'RF Tesouro Prefixado',
    'FUNDO', 'FUNDO_RENDA_FIXA', 'BRA', 'BRL', 'IRF-M',
    '{"cnpj": "39.342.722/0001-60", "gestora": "BB Gestão de Recursos", "categoria": "RF Tesouro Prefixado", "indexador": "PREFIXADO"}'
  ),
  (
    'bb000000-0000-0000-0001-000000000006',
    'RF_TESOURO_IPCA',
    'RF Tesouro Inflação',
    'FUNDO', 'FUNDO_RENDA_FIXA', 'BRA', 'BRL', 'IMA-B',
    '{"cnpj": "39.354.724/0001-79", "gestora": "BB Gestão de Recursos", "categoria": "RF Tesouro Inflação", "indexador": "IPCA"}'
  ),
  (
    'bb000000-0000-0000-0001-000000000007',
    'RF_BANCOS_CRED_PRIV',
    'RF Bancos Cred Priv',
    'FUNDO', 'FUNDO_RENDA_FIXA', 'BRA', 'BRL', 'CDI',
    '{"cnpj": "55.052.563/0001-15", "gestora": "BB Gestão de Recursos", "categoria": "RF Crédito Privado", "indexador": "CDI"}'
  )

ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- 3. POSIÇÕES
--    precoMedio = valor da cota na data de aplicação
--    valorAtualBruto = saldo atual em R$ (extrato de 02/04/2026)
--    valorAtualBrl  = igual ao bruto (BRL já é a moeda base)
-- ─────────────────────────────────────────────────────────────
INSERT INTO posicoes (
  id, carteira_id, ativo_id,
  quantidade, preco_medio, valor_atual_bruto, valor_atual_brl,
  moeda_original, instituicao, conta, data_entrada
)
VALUES
  -- 1. MM Arbitragem
  (
    'bb000000-0000-0000-0002-000000000001',
    'bb000000-0000-0000-0000-000000000001',
    'bb000000-0000-0000-0001-000000000001',
    464.613193, 5.380820079, 2500.13, 2500.13,
    'BRL', 'Banco do Brasil', '16629-4', '2026-04-01'
  ),
  -- 2. Ações Bolsa Brasil
  (
    'bb000000-0000-0000-0002-000000000002',
    'bb000000-0000-0000-0000-000000000001',
    'bb000000-0000-0000-0001-000000000002',
    1626.995149, 2.304862434, 3761.56, 3761.56,
    'BRL', 'Banco do Brasil', '16629-4', '2026-03-31'
  ),
  -- 3. Esp MM Kapitalo
  (
    'bb000000-0000-0000-0002-000000000003',
    'bb000000-0000-0000-0000-000000000001',
    'bb000000-0000-0000-0001-000000000003',
    1358.877346, 1.839753975, 2500.00, 2500.00,
    'BRL', 'Banco do Brasil', '16629-4', '2026-04-01'
  ),
  -- 4. Ações Globais Ativo
  (
    'bb000000-0000-0000-0002-000000000004',
    'bb000000-0000-0000-0000-000000000001',
    'bb000000-0000-0000-0001-000000000004',
    1297.720588, 1.926454756, 2517.72, 2517.72,
    'BRL', 'Banco do Brasil', '16629-4', '2026-03-31'
  ),
  -- 5. RF Tesouro Prefixado
  (
    'bb000000-0000-0000-0002-000000000005',
    'bb000000-0000-0000-0000-000000000001',
    'bb000000-0000-0000-0001-000000000005',
    1663.156970, 1.503165392, 2503.97, 2503.97,
    'BRL', 'Banco do Brasil', '16629-4', '2026-03-31'
  ),
  -- 6. RF Tesouro Inflação
  (
    'bb000000-0000-0000-0002-000000000006',
    'bb000000-0000-0000-0000-000000000001',
    'bb000000-0000-0000-0001-000000000006',
    3665.275287, 1.364154015, 5001.64, 5001.64,
    'BRL', 'Banco do Brasil', '16629-4', '2026-04-01'
  ),
  -- 7. RF Bancos Cred Priv
  (
    'bb000000-0000-0000-0002-000000000007',
    'bb000000-0000-0000-0000-000000000001',
    'bb000000-0000-0000-0001-000000000007',
    5512.352116, 1.133817265, 6256.74, 6256.74,
    'BRL', 'Banco do Brasil', '16629-4', '2026-03-31'
  )

ON CONFLICT (id) DO NOTHING;

COMMIT;

-- Verificação
SELECT
  a.nome AS fundo,
  a.subclasse,
  p.quantidade AS cotas,
  p.preco_medio AS valor_cota_entrada,
  p.valor_atual_brl AS saldo_brl,
  p.data_entrada
FROM posicoes p
JOIN ativos a ON a.id = p.ativo_id
WHERE p.carteira_id = 'bb000000-0000-0000-0000-000000000001'
ORDER BY p.valor_atual_brl DESC;
