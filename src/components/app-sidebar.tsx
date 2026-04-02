"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string };

const navItems: NavItem[] = [
  { href: "/", label: "Dashboard" },
  { href: "/clientes", label: "Clientes" },
  { href: "/contas", label: "Contas" },
  { href: "/ativos", label: "Ativos" },
  { href: "/posicoes", label: "Posições" },
  { href: "/importacao", label: "Importação" },
];

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[260px] border-r border-slate-800 bg-gradient-to-b from-[#0f172a] via-[#111827] to-[#0b1121] p-6">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-xl bg-slate-800/40 px-3 py-2 text-sm font-bold text-sky-300">
          <span>⚡</span>
          <span>ProjInvest</span>
        </div>
      </div>

      <nav className="space-y-1" aria-label="Navegação principal">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-sky-500/25 text-sky-200 ring-1 ring-sky-400"
                  : "text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 rounded-xl border border-slate-700 bg-slate-900/70 p-3 text-xs text-slate-400">
        <p className="text-slate-300 font-semibold">Tema</p>
        <p>Dark Pro</p>
      </div>
    </aside>
  );
}
