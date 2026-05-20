"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import BotaoVoltar from "@/components/BotaoVoltar";
import CardResumo from "@/components/CardResumo";
import TabelaFIIs from "@/components/TabelaFIIs";
import TabelaDividendos from "@/components/TabelaDividendos";
import ResumoDividendos from "@/components/ResumoDividendos";
import NovaPosicaoFIIModal from "@/components/NovaPosicaoFIIModal";
import RegistrarDividendoModal from "@/components/RegistrarDividendoModal";
import { Plus, HandCoins, Building, TrendingUp, Percent } from "lucide-react";
import { mockFIIs, mockDividendos } from "@/data/aplicacoes-mock";
import { useMarketQuotes } from "@/hooks/useMarketQuotes";
import { Dividendo, FII } from "@/types/aplicacoes";

const currentMonthKey = new Date().toISOString().slice(0, 7);
const currentMonthLabel = new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

export default function FIIsPage() {
    const [fiis, setFiis] = useState(mockFIIs);
    const [dividendos, setDividendos] = useState(mockDividendos.filter(d => ['rendimento_fii', 'amortizacao'].includes(d.tipo)));
    const { quotes, updatedAt, loading: quotesLoading, error: quotesError } = useMarketQuotes(fiis.map((fii) => fii.ticker));

    const [isPosicaoModalOpen, setPosicaoModalOpen] = useState(false);
    const [isDividendoModalOpen, setDividendoModalOpen] = useState(false);

    const fiisComCotacao = fiis.map((fii) => {
        const quote = quotes[fii.ticker];
        if (!quote?.price) return fii;

        return {
            ...fii,
            valorAtual: quote.price * fii.quantidade,
        };
    });

    // Totais
    const patrimonioTotal = fiisComCotacao.reduce((acc, fii) => acc + fii.valorAtual, 0);
    const yieldMedio = fiisComCotacao.length > 0
        ? (fiisComCotacao.reduce((acc, fii) => acc + fii.dyAnual, 0) / fiisComCotacao.length).toFixed(2)
        : "0.00";

    const dividendosMes = dividendos
        .filter(d => d.dataPagamento.startsWith(currentMonthKey))
        .reduce((acc, d) => acc + d.valorTotal, 0);

    const dividendosAcumulados = dividendos.reduce((acc, d) => acc + d.valorTotal, 0);

    const handleDeleteFII = (id: string) => {
        setFiis(prev => prev.filter(f => f.id !== id));
    };

    const handleDeleteDividendo = (id: string) => {
        setDividendos(prev => prev.filter(d => d.id !== id));
    };

    return (
        <div className="min-h-screen">
            <Sidebar />

            <main className="md:ml-64 p-4 pt-24 md:p-8 transition-all duration-300">
                <BotaoVoltar label="Voltar para Aplicações" fallbackUrl="/aplicacao" />

                <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Fundos Imobiliários</h1>
                        <p className="text-muted mt-1">
                            Renda mensal passiva com imóveis e recebíveis
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setDividendoModalOpen(true)}
                            className="flex items-center justify-center gap-2 px-4 py-3 text-foreground font-medium rounded-lg transition-all border"
                            style={{
                                background: "var(--card-bg)",
                                borderColor: "var(--card-border)",
                            }}
                        >
                            <HandCoins size={18} style={{ color: "var(--accent)" }} />
                            Lançar Rendimento
                        </button>
                        <button
                            onClick={() => setPosicaoModalOpen(true)}
                            className="btn-primary flex items-center justify-center gap-2 px-5 py-3 font-medium rounded-lg transition-all"
                        >
                            <Plus size={20} />
                            Novo Fundo
                        </button>
                    </div>
                </header>

                {/* Resumo */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
                    <div className="xl:col-span-1">
                        <CardResumo
                            titulo="Total Aplicado"
                            valor={patrimonioTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            icone={<Building size={24} />}
                            corGrafico="from-amber-500 to-orange-400"
                        />
                    </div>
                    <div className="xl:col-span-1">
                        <CardResumo
                            titulo="Rendimentos no Mês"
                            valor={dividendosMes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            icone={<HandCoins size={24} />}
                            corGrafico="from-amber-600 to-amber-400"
                        />
                    </div>
                    <div className="xl:col-span-1">
                        <CardResumo
                            titulo="Rendimentos Acumulados"
                            valor={dividendosAcumulados.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            icone={<TrendingUp size={24} />}
                            corGrafico="from-emerald-600 to-emerald-400"
                        />
                    </div>
                    <div className="xl:col-span-1">
                        <CardResumo
                            titulo="Yield Médio (12m)"
                            valor={`${yieldMedio}%`}
                            icone={<Percent size={24} />}
                            corGrafico="from-indigo-700 to-blue-600"
                        />
                    </div>
                </div>

                <div className="glass-card mb-8 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-foreground">Cotações dos FIIs</p>
                        <p className="text-sm text-muted">
                            {quotesLoading
                                ? "Atualizando valores de mercado..."
                                : quotesError
                                    ? "Usando os valores locais como fallback."
                                    : "Valores atualizados a cada 60 segundos quando a fonte externa responde."}
                        </p>
                    </div>
                    <div className="rounded-lg border px-3 py-2 text-sm font-medium" style={{ borderColor: "var(--card-border)", color: "var(--accent)" }}>
                        {updatedAt ? new Date(updatedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "Aguardando dados"}
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Tabela de Fundos */}
                    <section>
                        <h2 className="text-xl font-bold text-foreground border-b border-white/10 pb-3 mb-6">
                            Meus Fundos
                        </h2>
                        <div className="glass-card rounded-2xl p-1 overflow-hidden">
                            <TabelaFIIs fiis={fiisComCotacao} onDelete={handleDeleteFII} />
                        </div>
                    </section>

                    {/* Seção Rendimentos */}
                    <section>
                        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-6">
                            <h2 className="text-xl font-bold text-foreground">
                                Rendimentos Recebidos
                            </h2>
                            <select className="px-3 py-1.5 bg-black/20 text-foreground border border-white/10 rounded-lg outline-none text-sm font-medium">
                                <option value={currentMonthKey}>{currentMonthLabel}</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 glass-card rounded-2xl p-1 overflow-hidden">
                                <TabelaDividendos dividendos={dividendos} onDelete={handleDeleteDividendo} />
                            </div>
                            <div className="lg:col-span-1">
                                <ResumoDividendos
                                    totalMes={dividendosMes}
                                    totalAcumulado={dividendosAcumulados}
                                    mesAberto={currentMonthLabel}
                                />
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            <NovaPosicaoFIIModal
                isOpen={isPosicaoModalOpen}
                onClose={() => setPosicaoModalOpen(false)}
                onSave={(fii: FII) => setFiis((prev) => [fii, ...prev])}
            />

            {/* Reusing dividendos modal since they share structure */}
            <RegistrarDividendoModal
                isOpen={isDividendoModalOpen}
                onClose={() => setDividendoModalOpen(false)}
                onSave={(div: Dividendo) => setDividendos((prev) => [div, ...prev])}
            />
        </div>
    );
}
