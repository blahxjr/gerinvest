import "./globals.css";
import AppSidebar from "@/components/app-sidebar";

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
          <main className="flex-1 p-6 lg:p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}