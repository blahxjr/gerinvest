import "./globals.css";
import AppSidebar from "@/components/app-sidebar";
import ThemeToggle from "../components/theme-toggle";

export const metadata = {
  title: "ProjInvest",
  description: "Gestão de carteira de investimentos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="flex min-h-screen bg-[radial-gradient(circle_at_top,#0d1b34_0%,#020617_45%,#020617_100%)] text-slate-100">
          <AppSidebar />
          <div className="flex-1">
            <header className="sticky top-0 z-20 border-b border-white/10 glass px-4 py-3 lg:px-8">
              <div className="mx-auto flex max-w-[1500px] items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-300">GerInvest</p>
                  <h1 className="text-lg font-semibold text-white">Painel Executivo</h1>
                </div>
                <ThemeToggle />
              </div>
            </header>
            <main className="p-6 lg:p-8">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}