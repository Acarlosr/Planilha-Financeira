"use client";

import { Plus, LayoutGrid } from "lucide-react";
import type { Database } from "@/types/database.types";

type Cartao = Database["public"]["Tables"]["cartoes"]["Row"];

interface CardTabsProps {
    cartoes: Cartao[];
    activeCardId: string | null;
    onSelectCard: (id: string | null) => void;
    onAddCard: () => void;
}

const getCardGradient = (bandeira: string) => {
    switch (bandeira.toLowerCase()) {
        case 'visa': return 'from-blue-600 to-blue-400';
        case 'mastercard': return 'from-orange-600 to-orange-400';
        case 'amex': return 'from-emerald-600 to-emerald-400';
        case 'elo': return 'from-amber-500 to-yellow-400';
        default: return 'from-gray-600 to-gray-400';
    }
};

export default function CardTabs({ cartoes, activeCardId, onSelectCard, onAddCard }: CardTabsProps) {
    return (
        <div className="flex items-center gap-3 overflow-x-auto pb-4 pt-2 px-1 max-w-full scrollbar-thin">
            {/* Tab "Todos" */}
            <button
                onClick={() => onSelectCard(null)}
                className={`
                    flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap
                    ${activeCardId === null
                        ? "bg-gray-800 text-white shadow-lg shadow-gray-200 scale-105"
                        : "bg-white text-gray-500 hover:bg-gray-50 border border-transparent hover:border-gray-200"
                    }
                `}
            >
                <LayoutGrid size={16} />
                <span className="font-medium">Todos</span>
            </button>

            {/* Lista de Cartões */}
            {cartoes.map((cartao) => {
                const isActive = activeCardId === cartao.id;
                const gradient = getCardGradient(cartao.bandeira);

                return (
                    <button
                        key={cartao.id}
                        onClick={() => onSelectCard(cartao.id)}
                        className={`
                            flex items-center gap-3 px-4 py-2 rounded-xl transition-all whitespace-nowrap group
                            ${isActive
                                ? "bg-white ring-2 ring-purple-500 shadow-lg scale-105"
                                : "bg-white text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200"
                            }
                        `}
                    >
                        <div className={`
                            w-8 h-5 rounded flex items-center justify-center text-[10px] font-bold text-white shadow-sm bg-gradient-to-r ${gradient}
                        `}>
                            {cartao.bandeira === 'Mastercard' ? 'MC' : cartao.bandeira === 'Amex' ? 'AM' : cartao.bandeira.toUpperCase()}
                        </div>
                        <div className="flex flex-col items-start leading-none">
                            <span className={`text-sm font-medium ${isActive ? 'text-purple-700' : 'text-gray-700'}`}>
                                {cartao.nome}
                            </span>
                            {cartao.ultimos_digitos && (
                                <span className="text-[10px] text-muted">
                                    •••• {cartao.ultimos_digitos}
                                </span>
                            )}
                        </div>
                    </button>
                );
            })}

            {/* Botão Adicionar */}
            <button
                onClick={onAddCard}
                className="flex items-center gap-1.5 px-3 py-2 text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors font-medium text-sm whitespace-nowrap ml-2 border border-purple-200 border-dashed"
            >
                <Plus size={16} />
                Adicionar Cartão
            </button>
        </div>
    );
}
