"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/database.types";
import Sidebar from "@/components/Sidebar";
import MonthYearPicker from "@/components/MonthYearPicker";
import PrintExportButtons from "@/components/PrintExportButtons";
import IncomeModal from "@/components/IncomeModal";
import {
    Plus,
    Trash2,
    RotateCcw,
    Edit,
} from "lucide-react";

// Categorias de Receita conforme especificado
const fallbackCategoriasReceita = [
    { id: "salario", label: "Salário Mensal", icone: "💼", cor: "from-emerald-500 to-emerald-400" },
    { id: "decimo", label: "13º Salário / Bônus", icone: "🎁", cor: "from-amber-500 to-amber-400" },
    { id: "freela", label: "Freelance / Extra", icone: "⚡", cor: "from-purple-500 to-purple-400" },
    { id: "vendas", label: "Vendas Online", icone: "📦", cor: "from-blue-500 to-blue-400" },
    { id: "reembolso", label: "Reembolso", icone: "back", cor: "from-teal-500 to-teal-400" },
    { id: "anterior", label: "Saldo Anterior", icone: "🏦", cor: "from-indigo-500 to-indigo-400" },
];

const mesesNomes = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

interface IncomeItem {
    id: number | string;
    description: string;
    value: number;
    date: string;
    category: string;
}

const initialIncomeData: IncomeItem[] = [];
type CategoriaReceita = Database["public"]["Tables"]["categorias_receita"]["Row"];

function ReceitasContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [user, setUser] = useState<any>(null);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [incomeData, setIncomeData] = useState<IncomeItem[]>(initialIncomeData);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingIncome, setEditingIncome] = useState<IncomeItem | null>(null);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [categoriasReceitaDb, setCategoriasReceitaDb] = useState<CategoriaReceita[]>([]);
    const [categoriasReady, setCategoriasReady] = useState(false);

    const currentMonth = searchParams.get("month") ? parseInt(searchParams.get("month")!) : new Date().getMonth() + 1;
    const currentYear = searchParams.get("year") ? parseInt(searchParams.get("year")!) : new Date().getFullYear();
    const statementScope = searchParams.get("scope") === "annual" ? "annual" : "monthly";

    const mesAnoLabel = statementScope === "annual" ? `Ano ${currentYear}` : `${mesesNomes[currentMonth - 1]} ${currentYear}`;

    const handleDateChange = (newDate: { month: number; year: number }) => {
        const params = new URLSearchParams(searchParams);
        params.set("month", newDate.month.toString());
        params.set("year", newDate.year.toString());
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleScopeChange = (scope: "monthly" | "annual") => {
        const params = new URLSearchParams(searchParams);
        params.set("scope", scope);
        router.push(`${pathname}?${params.toString()}`);
    };

    const loadCategorias = useCallback(async () => {
        const { data, error } = await supabase
            .from("categorias_receita")
            .select("*")
            .order("created_at", { ascending: true });

        if (error) {
            console.error("Erro ao carregar categorias de receita:", error);
            setCategoriasReceitaDb([]);
        } else {
            setCategoriasReceitaDb(data ?? []);
        }
        setCategoriasReady(true);
    }, []);

    const loadData = useCallback(async (userId: string) => {
        setIsLoadingData(true);

        const startDate = statementScope === "annual"
            ? `${currentYear}-01-01`
            : `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
        const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
        const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;
        const endDate = statementScope === "annual"
            ? `${currentYear + 1}-01-01`
            : `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;

        const { data, error } = await supabase
            .from('receitas')
            .select('*')
            .eq('user_id', userId)
            .gte('data', startDate)
            .lt('data', endDate)
            .order('data', { ascending: false });

        if (error) {
            console.error("Erro ao carregar receitas (Tabela pode não existir):", error);
            setIsLoadingData(false);
            return;
        }

        const mappedData = data.map((dbItem: any) => {
            const [year, month, day] = dbItem.data.split('-');
            return {
                id: dbItem.id,
                description: dbItem.descricao,
                value: Number(dbItem.valor),
                date: `${day}/${month}/${year}`,
                category: dbItem.categoria_id
            };
        });

        setIncomeData(mappedData);
        setIsLoadingData(false);
    }, [currentMonth, currentYear, statementScope]);

    useEffect(() => {
        const init = async () => {
            const [{ data: { session } }] = await Promise.all([
                supabase.auth.getSession(),
                loadCategorias(),
            ]);
            if (!session) {
                setIsLoadingData(false);
                return;
            }
            setUser(session.user);
            await loadData(session.user.id);
        };
        init();
    }, [currentMonth, currentYear, loadCategorias, loadData]);

    const handleSaveIncome = async (newIncome: { description: string; value: number; date: string; category: string }) => {
        if (!user) {
            alert("Sua sessão expirou. Faça login novamente.");
            throw new Error("Usuário não autenticado");
        }

        if (!categoriasReceitaDb.some((categoria) => categoria.id === newIncome.category)) {
            alert("Categoria de receita inválida. Rode o script de reparo/seed no Supabase e recarregue a página.");
            throw new Error("Categoria de receita inválida");
        }

        const pgDate = newIncome.date.includes("-")
            ? newIncome.date
            : newIncome.date.split('/').reverse().join('-');

        const dbItem = {
            user_id: user.id,
            descricao: newIncome.description,
            valor: newIncome.value,
            data: pgDate,
            categoria_id: newIncome.category,
        };

        const { data, error } = await supabase.from('receitas').insert(dbItem).select().single();

        if (error) {
            console.error(error);
            alert(`Erro ao salvar receita: ${error.message}`);
            throw error;
        }

        const newItem: IncomeItem = {
            id: data.id,
            description: data.descricao,
            value: Number(data.valor),
            date: newIncome.date, // mantém formato visual pt-BR
            category: data.categoria_id,
        };
        
        setIncomeData(prev => [newItem, ...prev]);
    };

    const handleDeleteIncome = async (id: number | string) => {
        const { error } = await supabase.from('receitas').delete().eq('id', id);
        if (error) {
            console.error("Erro ao deletar:", error);
            alert("Erro ao excluir do banco de dados.");
            return;
        }
        setIncomeData(prev => prev.filter(item => item.id !== id));
    };

    const handleUpdateIncome = async (updated: { description: string; value: number; date: string; category: string }) => {
        if (!editingIncome) return;

        const pgDate = updated.date.includes("/")
            ? updated.date.split("/").reverse().join("-")
            : updated.date;

        const { error } = await supabase
            .from("receitas")
            .update({
                descricao: updated.description,
                valor: updated.value,
                data: pgDate,
                categoria_id: updated.category,
            })
            .eq("id", editingIncome.id);

        if (error) {
            console.error("Erro ao atualizar receita:", error);
            alert(`Erro ao atualizar receita: ${error.message}`);
            throw error;
        }

        const [year, month, day] = pgDate.split("-");
        setIncomeData(prev =>
            prev.map(item =>
                item.id === editingIncome.id
                    ? { ...item, description: updated.description, value: updated.value, date: `${day}/${month}/${year}`, category: updated.category }
                    : item
            )
        );
        setEditingIncome(null);
    };

    const getItemsByCategory = (categoryId: string) => {
        return incomeData.filter((item) => item.category === categoryId);
    };

    const getTotalByCategory = (categoryId: string) => {
        return incomeData
            .filter((item) => item.category === categoryId)
            .reduce((sum, item) => sum + item.value, 0);
    };

    const totalReceitas = incomeData.reduce((sum, item) => sum + item.value, 0);

    const categoriasReceita = categoriasReceitaDb.length > 0
        ? categoriasReceitaDb.map((categoria) => ({
            id: categoria.id,
            label: categoria.nome,
            icone: categoria.icone,
            cor: categoria.cor,
        }))
        : fallbackCategoriasReceita;

    const getCategoryById = (id: string) => {
        return categoriasReceita.find((c) => c.id === id);
    };

    const renderIcon = (icone: string) => {
        if (icone === "back") {
            return <RotateCcw size={24} className="text-white" />;
        }
        return <span className="text-2xl">{icone}</span>;
    };

    return (
        <div className="min-h-screen">
            <Sidebar />

            <main className="md:ml-64 p-4 pt-20 md:p-8 md:pt-8 transition-all duration-300">
                {/* Header */}
                <header className="mb-6 md:mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Receitas</h1>
                            <p className="text-muted mt-1 text-sm md:text-base">
                                Gerencie suas fontes de renda
                            </p>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                            <PrintExportButtons title="Receitas" period={mesAnoLabel} />
                            <div className="no-print flex rounded-lg border p-1" style={{ borderColor: "var(--card-border)", background: "var(--card-bg)" }}>
                                <button
                                    type="button"
                                    onClick={() => handleScopeChange("monthly")}
                                    className="rounded-md px-3 py-2 text-sm font-medium"
                                    style={statementScope === "monthly" ? { background: "var(--accent)", color: "white" } : { color: "var(--text-secondary)" }}
                                >
                                    Mensal
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleScopeChange("annual")}
                                    className="rounded-md px-3 py-2 text-sm font-medium"
                                    style={statementScope === "annual" ? { background: "var(--accent)", color: "white" } : { color: "var(--text-secondary)" }}
                                >
                                    Anual
                                </button>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2.5 md:px-5 md:py-3 text-foreground font-medium rounded-xl transition-all hover:shadow-lg no-print text-sm md:text-base"
                                style={{
                                    background: "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
                                    boxShadow: "0 4px 15px rgba(16, 185, 129, 0.4)",
                                }}
                            >
                                <Plus size={18} />
                                <span className="hidden sm:inline">Nova Receita</span>
                                <span className="sm:hidden">Nova</span>
                            </button>
                        </div>
                    </div>

                    {/* Total Summary */}
                    <div className="mt-6 glass-card p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-muted text-sm font-medium">Total de Receitas</p>
                                <h2 className="text-3xl font-bold text-emerald-400 mt-1">
                                    R$ {totalReceitas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                </h2>
                            </div>
                            <div className="flex items-center gap-2">
                                <MonthYearPicker
                                    date={{ month: currentMonth, year: currentYear }}
                                    onChange={handleDateChange}
                                />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Category Cards */}
                <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4 mb-6 md:mb-8">
                    {categoriasReceita.map((cat) => {
                        const total = getTotalByCategory(cat.id);
                        const isActive = activeCategory === cat.id;

                        return (
                            <div
                                key={cat.id}
                                onClick={() => setActiveCategory(isActive ? null : cat.id)}
                                className={`soft-card p-2 md:p-4 cursor-pointer transition-all duration-300 ${isActive ? "ring-2 ring-purple-400 ring-offset-1 md:ring-offset-2 scale-[1.03]" : "hover:scale-102 active:scale-95"
                                    }`}
                            >
                                <div className="flex flex-col items-center text-center gap-1.5 md:gap-3">
                                    <div
                                        className={`w-10 h-10 md:w-14 md:h-14 rounded-lg md:rounded-xl flex items-center justify-center bg-gradient-to-br ${cat.cor}`}
                                        style={{
                                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                                        }}
                                    >
                                        {renderIcon(cat.icone)}
                                    </div>
                                    <div className="min-w-0 w-full">
                                        <p className="text-muted text-[10px] md:text-xs font-medium leading-tight truncate">{cat.label}</p>
                                        <h3 className="text-sm md:text-lg font-bold text-foreground mt-0.5 md:mt-1">
                                            R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Items List */}
                <div className="glass-card p-4 md:p-6">
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                        <h2 className="text-base md:text-xl font-bold text-foreground">
                            {activeCategory
                                ? getCategoryById(activeCategory)?.label
                                : "Todas as Receitas"}
                        </h2>
                        {activeCategory && (
                            <button
                                onClick={() => setActiveCategory(null)}
                                className="text-sm text-[#7CFF6B] hover:text-[#6FEB5A] font-medium"
                            >
                                Ver todas
                            </button>
                        )}
                    </div>

                        {isLoadingData ? (
                            <div className="text-center py-12 text-muted">Acessando banco de dados...</div>
                        ) : activeCategory && getItemsByCategory(activeCategory).length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-muted">Nenhuma receita nesta categoria</p>
                            </div>
                        ) : incomeData.length === 0 ? (
                            <div className="text-center py-8 md:py-12">
                                <p className="text-muted text-sm md:text-base">Nenhuma receita registrada. Clique em "Nova Receita" para adicionar.</p>
                            </div>
                        ) : (
                            <div className="space-y-2 md:space-y-3">
                                {(activeCategory
                                    ? getItemsByCategory(activeCategory)
                                    : incomeData
                                ).map((item) => {
                                    const cat = getCategoryById(item.category);
                                    return (
                                        <div
                                            key={item.id}
                                            data-print-row="true"
                                            className="flex items-center justify-between p-3 md:p-4 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 transition-colors group"
                                        >
                                            <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
                                                <div
                                                    className={`w-9 h-9 md:w-11 md:h-11 rounded-lg flex-shrink-0 flex items-center justify-center bg-gradient-to-br ${cat?.cor}`}
                                                >
                                                    {cat && (
                                                        <span className="text-base md:text-lg">
                                                            {cat.icone === "back" ? (
                                                                <RotateCcw size={16} className="text-white" />
                                                            ) : (
                                                                cat.icone
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-medium text-foreground text-sm md:text-base truncate">{item.description}</p>
                                                    <div className="flex items-center gap-1.5 md:gap-2 mt-0.5">
                                                        <span className="text-[10px] md:text-xs text-muted">{item.date}</span>
                                                        <span className="text-[10px] md:text-xs text-muted hidden sm:inline">•</span>
                                                        <span className="text-[10px] md:text-xs text-muted hidden sm:inline">{cat?.label}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 md:gap-4 flex-shrink-0 ml-2">
                                                <span className="font-bold text-emerald-400 text-sm md:text-lg whitespace-nowrap">
                                                    + R$ {item.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                                </span>
                                                <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => {
                                                            setEditingIncome(item);
                                                            setIsModalOpen(true);
                                                        }}
                                                        className="p-1.5 md:p-2 hover:bg-white/10 active:bg-white/20 rounded-lg transition-colors"
                                                    >
                                                        <Edit size={14} className="text-muted" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (confirm(`Excluir "${item.description}"?`)) {
                                                                handleDeleteIncome(item.id);
                                                            }
                                                        }}
                                                        className="p-1.5 md:p-2 hover:bg-red-500/20 active:bg-red-500/30 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={14} className="text-red-400" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                </div>
            </main>

            <IncomeModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingIncome(null);
                }}
                onSave={editingIncome ? handleUpdateIncome : handleSaveIncome}
                categorias={categoriasReady && categoriasReceitaDb.length > 0 ? categoriasReceita : []}
                initialIncome={editingIncome}
            />
        </div>
    );
}

export default function ReceitasPage() {
    return (
        <Suspense fallback={<div>Carregando...</div>}>
            <ReceitasContent />
        </Suspense>
    );
}
