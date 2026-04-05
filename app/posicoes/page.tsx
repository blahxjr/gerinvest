import { getPortfolioRepository } from '@/infra/repositories/postgresPortfolioRepository';

type SearchParamsInput = Promise<{
  cliente?: string | string[];
  carteira?: string | string[];
  instituicao?: string | string[];
  classe?: string | string[];
  busca?: string | string[];
  page?: string | string[];
  sortBy?: string | string[];
  sortDir?: string | string[];
}>;

type SortField =
  | 'cliente'
  | 'carteira'
  | 'ticker'
  | 'descricao'
  | 'classe'
  | 'instituicao'
  | 'conta'
  | 'quantidade'
  | 'preco'
  | 'valor';

const PAGE_SIZE = 25;

function parseSortField(value: string): SortField {
  const allowed: SortField[] = [
    'cliente',
    'carteira',
    'ticker',
    'descricao',
    'classe',
    'instituicao',
    'conta',
    'quantidade',
    'preco',
    'valor',
  ];
  return allowed.includes(value as SortField) ? (value as SortField) : 'valor';
}

function parseSortDir(value: string): 'asc' | 'desc' {
  return value === 'asc' ? 'asc' : 'desc';
}

function parsePage(value: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.floor(parsed);
}

function getSearchParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

export default async function PosicoesPage({ searchParams }: { searchParams: SearchParamsInput }) {
  const repo = getPortfolioRepository();
  const params = await searchParams;
  const positions = await repo.getAllPositions();

  const clienteFilter = getSearchParam(params.cliente);
  const carteiraFilter = getSearchParam(params.carteira);
  const instituicaoFilter = getSearchParam(params.instituicao);
  const classeFilter = getSearchParam(params.classe);
  const buscaFilter = getSearchParam(params.busca).trim().toLowerCase();
  const sortBy = parseSortField(getSearchParam(params.sortBy));
  const sortDir = parseSortDir(getSearchParam(params.sortDir));
  const requestedPage = parsePage(getSearchParam(params.page));

  const clientes = Array.from(new Set(positions.map((pos) => pos.clienteNome).filter(Boolean))).sort();
  const carteiras = Array.from(new Set(positions.map((pos) => pos.carteiraNome).filter(Boolean))).sort();
  const instituicoes = Array.from(new Set(positions.map((pos) => pos.institution || pos.instituicao).filter(Boolean))).sort();
  const classes = Array.from(new Set(positions.map((pos) => pos.assetClass || pos.classe).filter(Boolean))).sort();

  const filteredPositions = positions.filter((pos) => {
    const description = (pos.description || pos.descricao || '').toLowerCase();
    const ticker = (pos.ticker || '').toLowerCase();
    const clienteNome = pos.clienteNome || '';
    const carteiraNome = pos.carteiraNome || '';
    const instituicaoNome = pos.institution || pos.instituicao || '';
    const classeNome = pos.assetClass || pos.classe || '';

    if (clienteFilter && clienteNome !== clienteFilter) return false;
    if (carteiraFilter && carteiraNome !== carteiraFilter) return false;
    if (instituicaoFilter && instituicaoNome !== instituicaoFilter) return false;
    if (classeFilter && classeNome !== classeFilter) return false;
    if (buscaFilter && !ticker.includes(buscaFilter) && !description.includes(buscaFilter)) return false;

    return true;
  });

  const sortedPositions = [...filteredPositions].sort((left, right) => {
    const leftValue = {
      cliente: left.clienteNome || '',
      carteira: left.carteiraNome || '',
      ticker: left.ticker || '',
      descricao: left.description || left.descricao || '',
      classe: left.assetClass || left.classe || '',
      instituicao: left.institution || left.instituicao || '',
      conta: left.contaApelido || left.account || left.conta || '',
      quantidade: left.quantity ?? left.quantidade ?? 0,
      preco: left.price ?? left.precoMedio ?? 0,
      valor: left.grossValue ?? left.valorAtualBruto ?? 0,
    }[sortBy];

    const rightValue = {
      cliente: right.clienteNome || '',
      carteira: right.carteiraNome || '',
      ticker: right.ticker || '',
      descricao: right.description || right.descricao || '',
      classe: right.assetClass || right.classe || '',
      instituicao: right.institution || right.instituicao || '',
      conta: right.contaApelido || right.account || right.conta || '',
      quantidade: right.quantity ?? right.quantidade ?? 0,
      preco: right.price ?? right.precoMedio ?? 0,
      valor: right.grossValue ?? right.valorAtualBruto ?? 0,
    }[sortBy];

    let comparison = 0;
    if (typeof leftValue === 'number' && typeof rightValue === 'number') {
      comparison = leftValue - rightValue;
    } else {
      comparison = String(leftValue).localeCompare(String(rightValue), 'pt-BR');
    }

    return sortDir === 'asc' ? comparison : -comparison;
  });

  const totalPages = Math.max(1, Math.ceil(sortedPositions.length / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedPositions = sortedPositions.slice(startIndex, startIndex + PAGE_SIZE);

  const queryState = {
    cliente: clienteFilter,
    carteira: carteiraFilter,
    instituicao: instituicaoFilter,
    classe: classeFilter,
    busca: buscaFilter,
    sortBy,
    sortDir,
    page: String(currentPage),
  };

  function buildHref(overrides: Partial<Record<keyof typeof queryState, string>>): string {
    const query = new URLSearchParams();
    const merged = { ...queryState, ...overrides };

    (Object.keys(merged) as Array<keyof typeof merged>).forEach((key) => {
      const value = merged[key];
      if (value) query.set(key, value);
    });

    const raw = query.toString();
    return raw.length > 0 ? `/posicoes?${raw}` : '/posicoes';
  }

  function getSortHref(field: SortField): string {
    const nextSortDir = sortBy === field && sortDir === 'asc' ? 'desc' : 'asc';
    return buildHref({ sortBy: field, sortDir: nextSortDir, page: '1' });
  }

  function getSortIndicator(field: SortField): string {
    if (sortBy !== field) return '';
    return sortDir === 'asc' ? ' ↑' : ' ↓';
  }

  const totalFiltrado = filteredPositions.reduce((sum, pos) => sum + (pos.grossValue ?? pos.valorAtualBruto ?? 0), 0);

  return (
    <div className="main-card">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-sky-300">Posicoes</h1>
        <p className="text-slate-300">Posicoes da carteira consolidadas por cliente, carteira, instituicao e conta.</p>
      </div>

      <form className="mb-6 grid grid-cols-1 gap-3 rounded-xl border border-white/10 bg-slate-900/60 p-4 md:grid-cols-2 xl:grid-cols-5">
        <input
          type="text"
          name="busca"
          defaultValue={buscaFilter}
          placeholder="Buscar por ticker ou descricao"
          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
        />
        <select
          name="cliente"
          defaultValue={clienteFilter}
          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
        >
          <option value="">Todos os clientes</option>
          {clientes.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select
          name="carteira"
          defaultValue={carteiraFilter}
          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
        >
          <option value="">Todas as carteiras</option>
          {carteiras.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select
          name="instituicao"
          defaultValue={instituicaoFilter}
          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
        >
          <option value="">Todas as instituicoes</option>
          {instituicoes.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <select
          name="classe"
          defaultValue={classeFilter}
          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white"
        >
          <option value="">Todas as classes</option>
          {classes.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-300 md:col-span-2 xl:col-span-5">
          <div>
            <p>{filteredPositions.length} posicoes encontradas</p>
            <p>Total filtrado: {totalFiltrado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
          </div>
          <div className="flex gap-2">
            <a href="/posicoes" className="rounded-lg border border-slate-600 px-4 py-2 text-slate-200 hover:bg-slate-800">
              Limpar filtros
            </a>
            <input type="hidden" name="sortBy" value={sortBy} />
            <input type="hidden" name="sortDir" value={sortDir} />
            <button type="submit" className="rounded-lg bg-sky-500 px-4 py-2 font-semibold text-white hover:bg-sky-400">
              Filtrar
            </button>
          </div>
        </div>
      </form>

      <div className="mb-4 text-sm text-slate-300">
        Mostrando {startIndex + 1} a {Math.min(startIndex + PAGE_SIZE, sortedPositions.length)} de {filteredPositions.length} posicoes filtradas.
      </div>

      <div className="table-wrapper">
        <table className="modern-table">
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
              <th style={{ padding: '12px' }}>Cliente</th>
              <th style={{ padding: '12px' }}><a href={getSortHref('cliente')}>Cliente{getSortIndicator('cliente')}</a></th>
              <th style={{ padding: '12px' }}><a href={getSortHref('carteira')}>Carteira{getSortIndicator('carteira')}</a></th>
              <th style={{ padding: '12px' }}><a href={getSortHref('ticker')}>Ticker{getSortIndicator('ticker')}</a></th>
              <th style={{ padding: '12px' }}><a href={getSortHref('descricao')}>Descricao{getSortIndicator('descricao')}</a></th>
              <th style={{ padding: '12px' }}><a href={getSortHref('classe')}>Classe{getSortIndicator('classe')}</a></th>
              <th style={{ padding: '12px' }}><a href={getSortHref('instituicao')}>Instituicao{getSortIndicator('instituicao')}</a></th>
              <th style={{ padding: '12px' }}><a href={getSortHref('conta')}>Conta{getSortIndicator('conta')}</a></th>
              <th style={{ padding: '12px' }}><a href={getSortHref('quantidade')}>Quantidade{getSortIndicator('quantidade')}</a></th>
              <th style={{ padding: '12px' }}><a href={getSortHref('preco')}>Preco{getSortIndicator('preco')}</a></th>
              <th style={{ padding: '12px' }}><a href={getSortHref('valor')}>Valor{getSortIndicator('valor')}</a></th>
            </tr>
          </thead>
          <tbody>
            {paginatedPositions.map((pos) => (
              <tr key={pos.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '12px' }}>{pos.clienteNome || '-'}</td>
                <td style={{ padding: '12px' }}>{pos.carteiraNome || '-'}</td>
                <td style={{ padding: '12px' }}>{pos.ticker}</td>
                <td style={{ padding: '12px' }}>{pos.description || '-'}</td>
                <td style={{ padding: '12px' }}>{pos.assetClass || '-'}</td>
                <td style={{ padding: '12px' }}>{pos.institution || '-'}</td>
                <td style={{ padding: '12px' }}>{pos.contaApelido || pos.account || '-'}</td>
                <td style={{ padding: '12px' }}>{pos.quantity || 0}</td>
                <td style={{ padding: '12px' }}>{(pos.price ?? 0).toFixed(2)}</td>
                <td style={{ padding: '12px' }}>{(pos.grossValue ?? 0).toFixed(2)}</td>
              </tr>
            ))}
            {paginatedPositions.length === 0 && (
              <tr>
                <td colSpan={10} style={{ padding: '16px', textAlign: 'center' }}>
                  Nenhuma posicao corresponde aos filtros informados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {sortedPositions.length > 0 && (
        <div className="mt-4 flex items-center justify-between text-sm text-slate-300">
          <span>Pagina {currentPage} de {totalPages}</span>
          <div className="flex gap-2">
            <a
              href={buildHref({ page: String(Math.max(1, currentPage - 1)) })}
              className={`rounded-lg border px-3 py-1 ${currentPage === 1 ? 'pointer-events-none border-slate-700 text-slate-500' : 'border-slate-500 text-slate-200 hover:bg-slate-800'}`}
            >
              Anterior
            </a>
            <a
              href={buildHref({ page: String(Math.min(totalPages, currentPage + 1)) })}
              className={`rounded-lg border px-3 py-1 ${currentPage === totalPages ? 'pointer-events-none border-slate-700 text-slate-500' : 'border-slate-500 text-slate-200 hover:bg-slate-800'}`}
            >
              Proxima
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
