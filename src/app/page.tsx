import Sidebar from "@/components/Sidebar";
import SummaryCards from "@/components/SummaryCards";
import CashFlowChart from "@/components/CashFlowChart";
import TransactionsTable from "@/components/TransactionsTable";
import UserMenu from "@/components/UserMenu";
import ThemeToggle from "@/components/ThemeToggle";
import TrialBanner from "@/components/TrialBanner";
import DataConnectionStatus from "@/components/DataConnectionStatus";
import FinancialRadar from "@/components/FinancialRadar";
import PaymentReminders from "@/components/PaymentReminders";
import BudgetUsageAlert from "@/components/BudgetUsageAlert";
import Link from "next/link";
import { Bell, Search, Plus, TrendingDown, TrendingUp } from "lucide-react";

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
              className="hidden md:flex items-center gap-3 px-4 py-2.5 rounded-lg border"
              style={{
                background: "var(--card-bg)",
                borderColor: "var(--card-border)",
                backdropFilter: "blur(10px)",
              }}
            >
              <Search size={18} className="text-muted" />
              <input
                type="text"
                placeholder="Buscar transações..."
                className="bg-transparent outline-none text-sm text-foreground w-48 placeholder:text-muted"
              />
            </div>

            {/* Notifications */}
            <button
              className="relative w-11 h-11 rounded-lg flex items-center justify-center transition-all hover:bg-white/10 border"
              style={{
                background: "var(--card-bg)",
                borderColor: "var(--card-border)",
              }}
            >
              <Bell size={20} className="text-muted" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full border-2" style={{ background: "var(--accent)", borderColor: "var(--background-light)" }} />
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Profile with Dropdown */}
            <UserMenu />
          </div>
        </header>

        {/* Trial Banner */}
        <TrialBanner />

        <section className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            href="/receitas"
            className="group flex items-center justify-between rounded-lg border px-4 py-4 transition"
            style={{
              background: "color-mix(in srgb, var(--success) 10%, transparent)",
              borderColor: "color-mix(in srgb, var(--success) 20%, transparent)",
              color: "var(--success)",
            }}
          >
            <span className="flex items-center gap-3 font-medium">
              <TrendingUp size={18} />
              Nova receita
            </span>
            <Plus size={18} className="transition group-hover:rotate-90" />
          </Link>
          <Link
            href="/despesas"
            className="group flex items-center justify-between rounded-lg border px-4 py-4 transition"
            style={{
              background: "color-mix(in srgb, var(--danger) 10%, transparent)",
              borderColor: "color-mix(in srgb, var(--danger) 20%, transparent)",
              color: "var(--danger)",
            }}
          >
            <span className="flex items-center gap-3 font-medium">
              <TrendingDown size={18} />
              Nova despesa
            </span>
            <Plus size={18} className="transition group-hover:rotate-90" />
          </Link>
        </section>

        <BudgetUsageAlert />

        <PaymentReminders />

        <FinancialRadar />

        <DataConnectionStatus />

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
          © 2026 FinançasPro. Desenvolvido para suas finanças.
        </footer>
      </main>
    </div>
  );
}
