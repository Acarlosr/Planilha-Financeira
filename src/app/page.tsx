import Sidebar from "@/components/Sidebar";
import SummaryCards from "@/components/SummaryCards";
import CashFlowChart from "@/components/CashFlowChart";
import TransactionsTable from "@/components/TransactionsTable";
import UserMenu from "@/components/UserMenu";
import ThemeToggle from "@/components/ThemeToggle";
import TrialBanner from "@/components/TrialBanner";
import { Bell, Search } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="md:ml-64 p-4 pt-24 md:p-8 transition-all duration-300">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted mt-1">
              Bem-vindo de volta! Aqui está o resumo das suas finanças.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-white/10"
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
