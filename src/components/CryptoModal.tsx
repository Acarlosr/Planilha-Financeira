"use client";

import { useState, useEffect } from "react";
import { X, Bitcoin, TrendingUp, TrendingDown, Loader2 } from "lucide-react";

interface CryptoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (crypto: {
        coinId: string;
        coinName: string;
        coinSymbol: string;
        coinImage: string;
        quantity: number;
        purchasePrice: number;
        type: "compra" | "venda";
        date: string;
    }) => void;
}

interface CoinOption {
    id: string;
    name: string;
    symbol: string;
    image: string;
    current_price: number;
}

export default function CryptoModal({ isOpen, onClose, onSave }: CryptoModalProps) {
    const [type, setType] = useState<"compra" | "venda">("compra");
    const [coinId, setCoinId] = useState("");
    const [quantity, setQuantity] = useState("");
    const [purchasePrice, setPurchasePrice] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [loading, setLoading] = useState(false);
    const [coins, setCoins] = useState<CoinOption[]>([]);
    const [loadingCoins, setLoadingCoins] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchCoins();
        }
    }, [isOpen]);

    const fetchCoins = async () => {
        setLoadingCoins(true);
        try {
            const response = await fetch(
                "https://api.coingecko.com/api/v3/coins/markets?vs_currency=brl&order=market_cap_desc&per_page=50&page=1&sparkline=false"
            );
            if (response.ok) {
                const data = await response.json();
                setCoins(data);
            }
        } catch (error) {
            console.error("Error fetching coins:", error);
        } finally {
            setLoadingCoins(false);
        }
    };

    const selectedCoin = coins.find((c) => c.id === coinId);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!coinId || !quantity || !purchasePrice) return;

        const coin = coins.find((c) => c.id === coinId);
        if (!coin) return;

        setLoading(true);

        // Format date to DD/MM/YYYY
        const [year, month, day] = date.split("-");
        const formattedDate = `${day}/${month}/${year}`;

        onSave({
            coinId,
            coinName: coin.name,
            coinSymbol: coin.symbol.toUpperCase(),
            coinImage: coin.image,
            quantity: parseFloat(quantity),
            purchasePrice: parseFloat(purchasePrice),
            type,
            date: formattedDate,
        });

        // Reset form
        setType("compra");
        setCoinId("");
        setQuantity("");
        setPurchasePrice("");
        setDate(new Date().toISOString().split("T")[0]);
        setLoading(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className="relative w-full max-w-md rounded-2xl p-6 border border-white/10 animate-in slide-in-from-bottom-4 duration-300"
                style={{
                    background: "rgba(10, 22, 40, 0.98)",
                    backdropFilter: "blur(20px)",
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{
                                background: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                            }}
                        >
                            <Bitcoin size={20} className="text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Nova Transação Cripto</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Type Toggle */}
                    <div className="flex gap-2 p-1 rounded-xl border border-white/10" style={{ background: "rgba(255, 255, 255, 0.03)" }}>
                        <button
                            type="button"
                            onClick={() => setType("compra")}
                            className={`flex-1 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${type === "compra"
                                ? "text-black"
                                : "text-gray-400 hover:text-white"
                                }`}
                            style={type === "compra" ? {
                                background: "linear-gradient(135deg, #10B981 0%, #34D399 100%)"
                            } : {}}
                        >
                            <TrendingUp size={18} />
                            Compra
                        </button>
                        <button
                            type="button"
                            onClick={() => setType("venda")}
                            className={`flex-1 py-2.5 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${type === "venda"
                                ? "text-white"
                                : "text-gray-400 hover:text-white"
                                }`}
                            style={type === "venda" ? {
                                background: "linear-gradient(135deg, #EF4444 0%, #F87171 100%)"
                            } : {}}
                        >
                            <TrendingDown size={18} />
                            Venda
                        </button>
                    </div>

                    {/* Coin Select */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Criptomoeda
                        </label>
                        <select
                            value={coinId}
                            onChange={(e) => {
                                setCoinId(e.target.value);
                                const coin = coins.find((c) => c.id === e.target.value);
                                if (coin) {
                                    setPurchasePrice(coin.current_price.toString());
                                }
                            }}
                            required
                            className="w-full px-4 py-3 rounded-xl text-white outline-none transition-all border border-white/10 focus:border-amber-500/50"
                            style={{ background: "rgba(255, 255, 255, 0.05)" }}
                        >
                            <option value="">Selecione uma moeda</option>
                            {loadingCoins ? (
                                <option disabled>Carregando...</option>
                            ) : (
                                coins.map((coin) => (
                                    <option key={coin.id} value={coin.id}>
                                        {coin.name} ({coin.symbol.toUpperCase()})
                                    </option>
                                ))
                            )}
                        </select>
                    </div>

                    {/* Selected Coin Preview */}
                    {selectedCoin && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                            <img
                                src={selectedCoin.image}
                                alt={selectedCoin.name}
                                className="w-8 h-8 rounded-full"
                            />
                            <div className="flex-1">
                                <p className="font-medium text-white">{selectedCoin.name}</p>
                                <p className="text-xs text-gray-400">
                                    Preço atual: R$ {selectedCoin.current_price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Quantity */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Quantidade
                        </label>
                        <input
                            type="number"
                            step="any"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            placeholder="0.001"
                            required
                            className="w-full px-4 py-3 rounded-xl text-white placeholder:text-gray-500 outline-none transition-all border border-white/10 focus:border-amber-500/50"
                            style={{ background: "rgba(255, 255, 255, 0.05)" }}
                        />
                    </div>

                    {/* Purchase Price */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Preço por Unidade (R$)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            value={purchasePrice}
                            onChange={(e) => setPurchasePrice(e.target.value)}
                            placeholder="0.00"
                            required
                            className="w-full px-4 py-3 rounded-xl text-white placeholder:text-gray-500 outline-none transition-all border border-white/10 focus:border-amber-500/50"
                            style={{ background: "rgba(255, 255, 255, 0.05)" }}
                        />
                    </div>

                    {/* Total Value Preview */}
                    {quantity && purchasePrice && (
                        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                            <div className="flex justify-between">
                                <span className="text-gray-400 text-sm">Valor Total</span>
                                <span className="font-bold text-amber-400">
                                    R$ {(parseFloat(quantity) * parseFloat(purchasePrice)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Data da Transação
                        </label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-xl text-white outline-none transition-all border border-white/10 focus:border-amber-500/50"
                            style={{ background: "rgba(255, 255, 255, 0.05)" }}
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading || !coinId || !quantity || !purchasePrice}
                        className="w-full py-3.5 rounded-xl text-white font-semibold transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                            background: type === "compra"
                                ? "linear-gradient(135deg, #10B981 0%, #34D399 100%)"
                                : "linear-gradient(135deg, #EF4444 0%, #F87171 100%)",
                            boxShadow: type === "compra"
                                ? "0 4px 15px rgba(16, 185, 129, 0.4)"
                                : "0 4px 15px rgba(239, 68, 68, 0.4)",
                        }}
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                        ) : (
                            `Registrar ${type === "compra" ? "Compra" : "Venda"}`
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
