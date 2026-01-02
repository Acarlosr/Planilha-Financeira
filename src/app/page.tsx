import Sidebar from "@/components/Sidebar";
import SummaryCards from "@/components/SummaryCards";
import CashFlowChart from "@/components/CashFlowChart";
import TransactionsTable from "@/components/TransactionsTable";
import { Bell, Search, User } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: "#FDFBF7" }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="ml-64 p-8 transition-all duration-300">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-500 mt-1">
              Bem-vindo de volta! Aqui está o resumo das suas finanças.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div
              className="flex items-center gap-3 px-4 py-2.5 bg-white rounded-xl"
              style={{
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.04)",
              }}
            >
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Buscar transações..."
                className="bg-transparent outline-none text-sm text-gray-600 w-48 placeholder:text-gray-400"
              />
            </div>

            {/* Notifications */}
            <button
              className="relative w-11 h-11 bg-white rounded-xl flex items-center justify-center transition-all hover:shadow-md"
              style={{
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.04)",
              }}
            >
              <Bell size={20} className="text-gray-600" />
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-purple-500 rounded-full border-2 border-white" />
            </button>

            {/* User Profile */}
            <div
              className="flex items-center gap-3 px-3 py-2 bg-white rounded-xl cursor-pointer transition-all hover:shadow-md"
              style={{
                boxShadow: "0 2px 10px rgba(0, 0, 0, 0.04)",
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{
                  background: "linear-gradient(135deg, #A855F7 0%, #C084FC 100%)",
                }}
              >
                <User size={18} className="text-white" />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-800">Carlos R.</p>
                <p className="text-xs text-gray-500">Administrador</p>
              </div>
            </div>
          </div>
        </header>

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
        <footer className="text-center py-6 text-gray-400 text-sm">
          © 2026 FinançasPro. Desenvolvido com ❤️ para suas finanças.
        </footer>
      </main>
    </div>
  );
}
