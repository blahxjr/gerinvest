import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "ProjInvest",
  description: "Gestão de carteira de investimentos",
};

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-lg px-3 py-2 text-slate-200 transition-colors hover:bg-slate-700 hover:text-white"
    >
      {children}
    </Link>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="flex min-h-screen bg-[radial-gradient(circle_at_top,#0d1b34_0%,#020617_45%,#020617_100%)] text-slate-100">
          <aside className="w-[260px] border-r border-slate-800 bg-gradient-to-b from-[#0f172a] via-[#111827] to-[#0b1121] p-6">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 rounded-xl bg-slate-800/40 px-3 py-2 text-sm font-bold text-sky-300">
                <span>⚡</span>
                <span>ProjInvest</span>
              </div>
            </div>

            <nav className="space-y-2">
              <NavLink href="/">Dashboard</NavLink>
              <NavLink href="/clientes">Clientes</NavLink>
              <NavLink href="/contas">Contas</NavLink>
              <NavLink href="/ativos">Ativos</NavLink>
              <NavLink href="/posicoes">Posições</NavLink>
              <NavLink href="/importacao">Importação B3</NavLink>
            </nav>

            <div className="mt-8 rounded-xl border border-slate-700 bg-slate-900/70 p-3 text-xs text-slate-400">
              <p className="text-slate-300 font-semibold">Tema</p>
              <p>Dark Pro</p>
            </div>
          </aside>

          <main className="flex-1 p-6 lg:p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}