import Sidebar from "@/components/Sidebar";
import SummaryCards from "@/components/SummaryCards";
import CashFlowChart from "@/components/CashFlowChart";
import TransactionsTable from "@/components/TransactionsTable";
import UserMenu from "@/components/UserMenu";
import ThemeToggle from "@/components/ThemeToggle";
import TrialBanner from "@/components/TrialBanner";
import Link from "next/link";
import { Bell, Search, Plus, TrendingDown, TrendingUp, WalletCards } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="md:ml-64 p-4 pt-24 md:p-8 transition-all duration-300">
        {/* Header */}
        <header className="flex flex-col gap-5 mb-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard financeiro</h1>
            <p className="text-muted mt-1 max-w-2xl">
              Acompanhe saldo, entradas, saídas e movimentações recentes com dados sincronizados da sua conta.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div
              className="hidden md:flex items-center gap-3 px-4 py-2.5 rounded-xl border border-white/10"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(10px)",
              }}
            >
              <Search size={18} className="text-muted" />
              <input
                type="text"
                placeholder="Buscar transações..."
                className="bg-transparent outline-none text-sm text-white w-48 placeholder:text-muted"
              />
            </div>

            {/* Notifications */}
            <button
              className="relative w-11 h-11 rounded-xl flex items-center justify-center transition-all hover:bg-white/10 border border-white/10"
              style={{
                background: "rgba(255, 255, 255, 0.05)",
              }}
            >
              <Bell size={20} className="text-muted" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#7CFF6B] rounded-full border-2 border-[#0a1628]" />
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Profile with Dropdown */}
            <UserMenu />
          </div>
        </header>

        {/* Trial Banner */}
        <TrialBanner />

        <section className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Link
            href="/receitas"
            className="group flex items-center justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-4 text-emerald-200 transition hover:border-emerald-400/40 hover:bg-emerald-500/15"
          >
            <span className="flex items-center gap-3 font-medium">
              <TrendingUp size={18} />
              Nova receita
            </span>
            <Plus size={18} className="transition group-hover:rotate-90" />
          </Link>
          <Link
            href="/despesas"
            className="group flex items-center justify-between rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-4 text-red-200 transition hover:border-red-400/40 hover:bg-red-500/15"
          >
            <span className="flex items-center gap-3 font-medium">
              <TrendingDown size={18} />
              Nova despesa
            </span>
            <Plus size={18} className="transition group-hover:rotate-90" />
          </Link>
          <Link
            href="/settings/subscription"
            className="group flex items-center justify-between rounded-xl border border-[#7CFF6B]/20 bg-[#7CFF6B]/10 px-4 py-4 text-[#D8FFD2] transition hover:border-[#7CFF6B]/50 hover:bg-[#7CFF6B]/15"
          >
            <span className="flex items-center gap-3 font-medium">
              <WalletCards size={18} />
              Plano e limites
            </span>
            <Plus size={18} className="transition group-hover:rotate-90" />
          </Link>
        </section>

        {/* Summary Cards */}
        <section className="mb-8">
          <SummaryCards />
        </section>

        {/* Cash Flow Chart */}
        <section className="mb-8">
          <CashFlowChart />
        </section>

        {/* Transactions Table */}
        <section className="mb-8">
          <TransactionsTable />
        </section>

        {/* Footer */}
        <footer className="text-center py-6 text-muted text-sm">
          © 2026 FinançasPro. Desenvolvido com ❤️ para suas finanças.
        </footer>
      </main>
    </div>
  );
}
