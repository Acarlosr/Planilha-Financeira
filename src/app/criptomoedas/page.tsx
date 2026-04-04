"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import CryptoPortfolio from "@/components/CryptoPortfolio";
import CryptoModal from "@/components/CryptoModal";
import { Coins, LineChart, Wallet, Plus } from "lucide-react";

export default function CriptoPage() {
    const [currency, setCurrency] = useState<"brl" | "usd">("brl");
    const [activeTab, setActiveTab] = useState<"market" | "portfolio">("market");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [myCryptos, setMyCryptos] = useState<any[]>([]);

    const [coins, setCoins] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCoins = async () => {
            setLoading(true);
            setCoins([]); // Clear old data immediately when currency changes
            try {
                const response = await fetch(
                    `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=10&page=1&sparkline=false`
                );
                if (!response.ok) {
                    throw new Error('API rate limit or error');
                }
                const data = await response.json();
                setCoins(data);
            } catch (error) {
                console.error("Error fetching crypto data:", error);
                // If API fails, keep loading state for a moment then show empty
                setTimeout(() => setLoading(false), 500);
                return;
            } finally {
                setLoading(false);
            }
        };

        fetchCoins();
        // Refresh every 60 seconds
        const interval = setInterval(fetchCoins, 60000);
        return () => clearInterval(interval);
    }, [currency]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat(currency === "brl" ? "pt-BR" : "en-US", {
            style: "currency",
            currency: currency === "brl" ? "BRL" : "USD",
        }).format(value);
    };

    return (
        <div className="min-h-screen">
            <Sidebar />

            <main className="ml-64 p-8 transition-all duration-300">
                {/* Header */}
                <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                            <Coins className="text-amber-400" size={32} />
                            Criptomoedas
                        </h1>
                        <p className="text-muted mt-1">
                            Acompanhe o mercado e gerencie sua carteira
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* New Crypto Button */}
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-5 py-3 text-foreground font-medium rounded-xl transition-all hover:shadow-lg"
                            style={{
                                background: "linear-gradient(135deg, #FFD700 0%, #FFC700 100%)",
                                boxShadow: "0 4px 15px rgba(255, 215, 0, 0.4)",
                            }}
                        >
                            <Plus size={20} />
                            Nova Transação
                        </button>

                        {/* Currency Toggle */}
                        <div className="flex items-center gap-3 p-1.5 rounded-xl border border-white/10" style={{ background: "rgba(255,255,255,0.05)" }}>
                            <button
                                onClick={() => setCurrency("brl")}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${currency === "brl"
                                    ? "bg-emerald-500/20 text-emerald-400"
                                    : "text-gray-400 hover:bg-white/5"
                                    }`}
                            >
                                BRL (R$)
                            </button>
                            <button
                                onClick={() => setCurrency("usd")}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${currency === "usd"
                                    ? "bg-[#FFD700]/20 text-[#FFD700]"
                                    : "text-gray-400 hover:bg-white/5"
                                    }`}
                            >
                                USD ($)
                            </button>
                        </div>
                    </div>
                </header>

                {/* Tabs */}
                <div className="flex items-center gap-2 mb-6 border-b border-white/10">
                    <button
                        onClick={() => setActiveTab("market")}
                        className={`pb-4 px-4 text-sm font-medium transition-all relative ${activeTab === "market"
                            ? "text-amber-400"
                            : "text-gray-400 hover:text-foreground"
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <LineChart size={18} />
                            Mercado (Top 10)
                        </div>
                        {activeTab === "market" && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-400 rounded-t-full" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("portfolio")}
                        className={`pb-4 px-4 text-sm font-medium transition-all relative ${activeTab === "portfolio"
                            ? "text-amber-400"
                            : "text-gray-400 hover:text-foreground"
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <Wallet size={18} />
                            Minhas Criptos
                        </div>
                        {activeTab === "portfolio" && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-400 rounded-t-full" />
                        )}
                    </button>
                </div>

                {/* Content */}
                <div className="glass-card p-6 min-h-[400px]">
                    {activeTab === "market" ? (
                        <>
                            {loading ? (
                                <div className="text-center py-12 text-muted">
                                    Carregando cotações...
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="text-left text-sm text-muted border-b border-white/10">
                                                <th className="pb-4 font-medium pl-4">Moeda</th>
                                                <th className="pb-4 font-medium">Preço Atual</th>
                                                <th className="pb-4 font-medium">Variação 24h</th>
                                                <th className="pb-4 font-medium">Capitalização</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm">
                                            {coins.map((coin) => (
                                                <tr key={coin.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                    <td className="py-4 pl-4">
                                                        <div className="flex items-center gap-3">
                                                            <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                                                            <div>
                                                                <p className="font-semibold text-foreground">{coin.name}</p>
                                                                <p className="text-xs text-muted uppercase">{coin.symbol}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 font-medium text-foreground">
                                                        {formatCurrency(coin.current_price)}
                                                    </td>
                                                    <td className="py-4">
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${coin.price_change_percentage_24h >= 0
                                                            ? "bg-emerald-500/20 text-emerald-400"
                                                            : "bg-red-500/20 text-red-400"
                                                            }`}>
                                                            {coin.price_change_percentage_24h > 0 ? "+" : ""}
                                                            {coin.price_change_percentage_24h?.toFixed(2)}%
                                                        </span>
                                                    </td>
                                                    <td className="py-4 text-muted">
                                                        {formatCurrency(coin.market_cap)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </>
                    ) : (
                        <CryptoPortfolio />
                    )}
                </div>
            </main>

            <CryptoModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={(crypto) => {
                    console.log("Nova cripto adicionada:", crypto);
                    setMyCryptos(prev => [...prev, { ...crypto, id: Date.now() }]);
                    alert(`${crypto.coinName} adicionado com sucesso!`);
                }}
            />
        </div>
    );
}
