import DashboardWithCarteiras from '@/ui/components/dashboard/DashboardWithCarteiras';
import DashboardClient from '@/ui/components/dashboard/DashboardClient';
import { getPortfolioRepository } from '@/infra/repositories/postgresPortfolioRepository';
import { unstable_cache } from 'next/cache';

const getCachedData = unstable_cache(
  async () => {
    try {
      const repo = getPortfolioRepository();
      const [carteiras, allPositions] = await Promise.all([
        repo.getAllCarteiras(),
        repo.getAllPositionsEnriched(),
      ]);

      // Associar posições a cada carteira para o seletor
      const carteirasComPosicoes = carteiras.map((c) => ({
        id: c.id,
        nome: c.nome,
        descricao: c.descricao,
        posicoes: allPositions.filter((p: any) => p.carteiraId === c.id),
      }));

      return { carteiras: carteirasComPosicoes, allPositions };
    } catch (error) {
      console.error('Erro ao buscar dados do PostgreSQL:', error);
      return { carteiras: [], allPositions: [] };
    }
  },
  ['portfolio-dashboard'],
  { revalidate: 60 }
);

export default async function Home() {
  const { carteiras, allPositions } = await getCachedData();

  return (
    <DashboardClient>
      <DashboardWithCarteiras carteiras={carteiras} allPositions={allPositions} />
    </DashboardClient>
  );
}