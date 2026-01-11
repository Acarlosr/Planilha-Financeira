"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import {
    Plus,
    Calendar,
    Edit,
    Trash2,
    ShoppingCart,
    Home,
    Car,
    Utensils,
    Heart,
    Smartphone,
    GraduationCap,
    Shirt,
} from "lucide-react";

// Categorias de Despesas
const categoriasDespesa = [
    { id: "moradia", label: "Moradia", icone: Home, cor: "from-blue-500 to-blue-400" },
    { id: "alimentacao", label: "Alimentação", icone: Utensils, cor: "from-orange-500 to-orange-400" },
    { id: "transporte", label: "Transporte", icone: Car, cor: "from-purple-500 to-purple-400" },
    { id: "saude", label: "Saúde", icone: Heart, cor: "from-red-500 to-red-400" },
    { id: "educacao", label: "Educação", icone: GraduationCap, cor: "from-green-500 to-green-400" },
    { id: "lazer", label: "Lazer", icone: Smartphone, cor: "from-pink-500 to-pink-400" },
    { id: "vestuario", label: "Vestuário", icone: Shirt, cor: "from-indigo-500 to-indigo-400" },
    { id: "compras", label: "Compras", icone: ShoppingCart, cor: "from-teal-500 to-teal-400" },
];

interface ExpenseItem {
    id: number;
    description: string;
    value: number;
    date: string;
    category: string;
}

const expenseData: ExpenseItem[] = [
    { id: 1, description: "Aluguel Janeiro", value: 2500.0, date: "05/01/2026", category: "moradia" },
    { id: 2, description: "Condomínio", value: 450.0, date: "05/01/2026", category: "moradia" },
    { id: 3, description: "Energia elétrica", value: 280.0, date: "08/01/2026", category: "moradia" },
    { id: 4, description: "Internet + TV", value: 150.0, date: "10/01/2026", category: "moradia" },
    { id: 5, description: "Supermercado - Compra mensal", value: 1200.0, date: "03/01/2026", category: "alimentacao" },
    { id: 6, description: "Restaurante - Almoço", value: 85.0, date: "07/01/2026", category: "alimentacao" },
    { id: 7, description: "Padaria", value: 45.0, date: "09/01/2026", category: "alimentacao" },
    { id: 8, description: "iFood - Jantar", value: 62.0, date: "10/01/2026", category: "alimentacao" },
    { id: 9, description: "Gasolina", value: 320.0, date: "04/01/2026", category: "transporte" },
    { id: 10, description: "Uber", value: 78.0, date: "06/01/2026", category: "transporte" },
    { id: 11, description: "Estacionamento", value: 25.0, date: "08/01/2026", category: "transporte" },
    { id: 12, description: "Plano de saúde", value: 580.0, date: "05/01/2026", category: "saude" },
    { id: 13, description: "Farmácia - Medicamentos", value: 125.0, date: "07/01/2026", category: "saude" },
    { id: 14, description: "Consulta médica", value: 250.0, date: "09/01/2026", category: "saude" },
    { id: 15, description: "Curso online - Udemy", value: 89.90, date: "02/01/2026", category: "educacao" },
    { id: 16, description: "Livros técnicos", value: 145.0, date: "06/01/2026", category: "educacao" },
    { id: 17, description: "Netflix", value: 55.90, date: "05/01/2026", category: "lazer" },
    { id: 18, description: "Spotify", value: 21.90, date: "05/01/2026", category: "lazer" },
    { id: 19, description: "Cinema", value: 68.0, date: "08/01/2026", category: "lazer" },
    { id: 20, description: "Tênis esportivo", value: 380.0, date: "04/01/2026", category: "vestuario" },
    { id: 21, description: "Camisetas", value: 120.0, date: "07/01/2026", category: "vestuario" },
    { id: 22, description: "Amazon - Eletrônicos", value: 450.0, date: "03/01/2026", category: "compras" },
    { id: 23, description: "Mercado Livre - Acessórios", value: 95.0, date: "09/01/2026", category: "compras" },
];

export default function DespesasPage() {
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    const getItemsByCategory = (categoryId: string) => {
        return expenseData.filter((item) => item.category === categoryId);
    };

    const getTotalByCategory = (categoryId: string) => {
        return expenseData
            .filter((item) => item.category === categoryId)
            .reduce((sum, item) => sum + item.value, 0);
    };

    const totalDespesas = expenseData.reduce((sum, item) => sum + item.value, 0);

    const getCategoryById = (id: string) => {
        return categoriasDespesa.find((c) => c.id === id);
    };

    return (
        <div className="min-h-screen" style={{ background: "#FDFBF7" }}>
            <Sidebar />

            <main className="ml-64 p-8 transition-all duration-300">
                {/* Header */}
                <header className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Despesas</h1>
                            <p className="text-gray-500 mt-1">
                                Controle seus gastos e despesas mensais
                            </p>
                        </div>
                        <button
                            className="flex items-center gap-2 px-5 py-3 text-white font-medium rounded-xl transition-all hover:shadow-lg"
                            style={{
                                background: "linear-gradient(135deg, #EF4444 0%, #F87171 100%)",
                                boxShadow: "0 4px 15px rgba(239, 68, 68, 0.4)",
                            }}
                        >
                            <Plus size={20} />
                            Nova Despesa
                        </button>
                    </div>

                    {/* Total Summary */}
                    <div className="mt-6 soft-card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-500 text-sm font-medium">Total de Despesas</p>
                                <h2 className="text-3xl font-bold text-red-600 mt-1">
                                    R$ {totalDespesas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                </h2>
                            </div>
                            <div className="flex items-center gap-2 text-red-500">
                                <Calendar size={18} />
                                <span className="text-sm font-medium">Janeiro 2026</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Category Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
                    {categoriasDespesa.map((cat) => {
                        const total = getTotalByCategory(cat.id);
                        const isActive = activeCategory === cat.id;
                        const IconComponent = cat.icone;

                        return (
                            <div
                                key={cat.id}
                                onClick={() => setActiveCategory(isActive ? null : cat.id)}
                                className={`soft-card p-4 cursor-pointer transition-all duration-300 ${isActive ? "ring-2 ring-red-400 ring-offset-2 scale-105" : "hover:scale-102"
                                    }`}
                            >
                                <div className="flex flex-col items-center text-center gap-3">
                                    <div
                                        className={`w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br ${cat.cor}`}
                                        style={{
                                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                                        }}
                                    >
                                        <IconComponent size={24} className="text-white" />
                                    </div>
                                    <div>
                                        <p className="text-gray-600 text-xs font-medium leading-tight">{cat.label}</p>
                                        <h3 className="text-lg font-bold text-gray-800 mt-1">
                                            R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Items List */}
                <div className="soft-card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-800">
                            {activeCategory
                                ? getCategoryById(activeCategory)?.label
                                : "Todas as Despesas"}
                        </h2>
                        {activeCategory && (
                            <button
                                onClick={() => setActiveCategory(null)}
                                className="text-sm text-red-600 hover:text-red-700 font-medium"
                            >
                                Ver todas
                            </button>
                        )}
                    </div>

                    <div className="space-y-3">
                        {(activeCategory
                            ? getItemsByCategory(activeCategory)
                            : expenseData
                        ).map((item) => {
                            const cat = getCategoryById(item.category);
                            const IconComponent = cat?.icone;

                            return (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between p-4 rounded-xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`w-11 h-11 rounded-lg flex items-center justify-center bg-gradient-to-br ${cat?.cor}`}
                                        >
                                            {IconComponent && <IconComponent size={20} className="text-white" />}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-800">{item.description}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-xs text-gray-500">{item.date}</span>
                                                <span className="text-xs text-gray-400">•</span>
                                                <span className="text-xs text-gray-500">{cat?.label}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-bold text-red-600 text-lg">
                                            - R$ {item.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                        </span>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                                                <Edit size={16} className="text-gray-500" />
                                            </button>
                                            <button className="p-2 hover:bg-red-100 rounded-lg transition-colors">
                                                <Trash2 size={16} className="text-red-500" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Empty State */}
                    {activeCategory && getItemsByCategory(activeCategory).length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-400">Nenhuma despesa nesta categoria</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
