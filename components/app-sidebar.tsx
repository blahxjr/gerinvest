"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { ComponentType } from "react";
import {
  House,
  BriefcaseBusiness,
  HandCoins,
  Shield,
  ChartNoAxesCombined,
  Zap,
  ClipboardList,
  Settings,
  Menu,
  X,
} from "lucide-react";

type NavItem = { href: string; label: string; icon: ComponentType<{ className?: string }> };

const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: House },
  { href: "/posicoes", label: "Carteira", icon: BriefcaseBusiness },
  { href: "/proventos", label: "Proventos", icon: HandCoins },
  { href: "/posicoes?classe=RENDA_FIXA", label: "Renda Fixa", icon: Shield },
  { href: "/posicoes?classe=ACAO_BR", label: "Ações/FIIs", icon: ChartNoAxesCombined },
  { href: "/?tab=cotacoes", label: "Cotações", icon: Zap },
  { href: "/importacao", label: "Relatórios", icon: ClipboardList },
  { href: "/cadastro", label: "Configurações", icon: Settings },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="fixed left-3 top-3 z-30 rounded-lg bg-slate-900/80 p-2 text-slate-100 ring-1 ring-white/20 backdrop-blur lg:hidden"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Abrir menu lateral"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      {open && (
        <button
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Fechar menu"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-[280px] border-r border-slate-700/80 bg-gradient-to-b from-[#0f172a] via-[#111827] to-[#0b1121] p-6 transition-transform duration-300 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 rounded-xl bg-slate-800/50 px-3 py-2 text-sm font-bold text-sky-300">
            <Zap className="h-4 w-4" />
            <span>GerInvest Pro</span>
          </div>
        </div>

        <nav className="space-y-1" aria-label="Navegação principal">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href.split("?")[0] + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-sky-600/30 text-sky-100 ring-1 ring-sky-400/70 shadow-lg"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 rounded-xl border border-slate-700/70 bg-slate-900/70 p-3 text-xs text-slate-300">
          <p className="font-semibold">Conta Premium</p>
          <p className="text-slate-400">Monitoramento em tempo real</p>
        </div>
      </aside>
    </>
  );
}
