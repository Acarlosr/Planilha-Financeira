"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import CryptoPortfolio from "@/components/CryptoPortfolio";
import { Coins, LineChart, Wallet } from "lucide-react";

export default function CriptoPage() {
    const [currency, setCurrency] = useState<"brl" | "usd">("brl");
    const [activeTab, setActiveTab] = useState<"market" | "portfolio">("market");

    const [coins, setCoins] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCoins = async () => {
            setLoading(true);
            try {
                const response = await fetch(
                    `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=10&page=1&sparkline=false`
                );
                const data = await response.json();
                setCoins(data);
            } catch (error) {
                console.error("Error fetching crypto data:", error);
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
        <div className="min-h-screen" style={{ background: "#FDFBF7" }}>
            <Sidebar />

            <main className="ml-64 p-8 transition-all duration-300">
                {/* Header */}
                <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                            <Coins className="text-yellow-500" size={32} />
                            Criptomoedas
                        </h1>
                        <p className="text-gray-500 mt-1">
                            Acompanhe o mercado e gerencie sua carteira
                        </p>
                    </div>

                    <div className="flex items-center gap-3 bg-white p-1.5 rounded-xl shadow-sm border border-gray-100">
                        <button
                            onClick={() => setCurrency("brl")}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${currency === "brl"
                                ? "bg-green-100 text-green-700 shadow-sm"
                                : "text-gray-500 hover:bg-gray-50"
                                }`}
                        >
                            BRL (R$)
                        </button>
                        <button
                            onClick={() => setCurrency("usd")}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${currency === "usd"
                                ? "bg-blue-100 text-blue-700 shadow-sm"
                                : "text-gray-500 hover:bg-gray-50"
                                }`}
                        >
                            USD ($)
                        </button>
                    </div>
                </header>

                {/* Tabs */}
                <div className="flex items-center gap-2 mb-6 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab("market")}
                        className={`pb-4 px-4 text-sm font-medium transition-all relative ${activeTab === "market"
                            ? "text-yellow-600"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <LineChart size={18} />
                            Mercado (Top 10)
                        </div>
                        {activeTab === "market" && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-yellow-500 rounded-t-full" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab("portfolio")}
                        className={`pb-4 px-4 text-sm font-medium transition-all relative ${activeTab === "portfolio"
                            ? "text-yellow-600"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <Wallet size={18} />
                            Minhas Criptos
                        </div>
                        {activeTab === "portfolio" && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-yellow-500 rounded-t-full" />
                        )}
                    </button>
                </div>

                {/* Content */}
                <div className="soft-card p-6 min-h-[400px]">
                    {activeTab === "market" ? (
                        <>
                            {loading ? (
                                <div className="text-center py-12 text-gray-400">
                                    Carregando cotações...
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                                                <th className="pb-4 font-medium pl-4">Moeda</th>
                                                <th className="pb-4 font-medium">Preço Atual</th>
                                                <th className="pb-4 font-medium">Variação 24h</th>
                                                <th className="pb-4 font-medium">Capitalização</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm">
                                            {coins.map((coin) => (
                                                <tr key={coin.id} className="border-b border-gray-50/50 hover:bg-gray-50 transition-colors">
                                                    <td className="py-4 pl-4">
                                                        <div className="flex items-center gap-3">
                                                            <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                                                            <div>
                                                                <p className="font-semibold text-gray-800">{coin.name}</p>
                                                                <p className="text-xs text-gray-500 uppercase">{coin.symbol}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 font-medium text-gray-800">
                                                        {formatCurrency(coin.current_price)}
                                                    </td>
                                                    <td className="py-4">
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${coin.price_change_percentage_24h >= 0
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-red-100 text-red-700"
                                                            }`}>
                                                            {coin.price_change_percentage_24h > 0 ? "+" : ""}
                                                            {coin.price_change_percentage_24h?.toFixed(2)}%
                                                        </span>
                                                    </td>
                                                    <td className="py-4 text-gray-500">
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
        </div>
    );
}
