"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import BotaoVoltar from "@/components/BotaoVoltar";
import CardResumo from "@/components/CardResumo";
import TabelaAcoes from "@/components/TabelaAcoes";
import TabelaDividendos from "@/components/TabelaDividendos";
import ResumoDividendos from "@/components/ResumoDividendos";
import NovaPosicaoModal from "@/components/NovaPosicaoModal";
import RegistrarDividendoModal from "@/components/RegistrarDividendoModal";
import PrintExportButtons from "@/components/PrintExportButtons";
import { Plus, HandCoins, Briefcase, TrendingUp, Calendar as CalIcon } from "lucide-react";
import { mockAcoes, mockDividendos } from "@/data/aplicacoes-mock";
import { useMarketQuotes } from "@/hooks/useMarketQuotes";
import { Acao, Dividendo } from "@/types/aplicacoes";

const currentMonthKey = new Date().toISOString().slice(0, 7);
const currentMonthLabel = new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

export default function AcoesPage() {
    const [acoes, setAcoes] = useState(mockAcoes);
    const [dividendos, setDividendos] = useState(mockDividendos.filter(d => ['dividendo', 'jcp'].includes(d.tipo)));
    const { quotes, updatedAt, loading: quotesLoading, error: quotesError } = useMarketQuotes(acoes.map((acao) => acao.ticker));

    const [isPosicaoModalOpen, setPosicaoModalOpen] = useState(false);
    const [isDividendoModalOpen, setDividendoModalOpen] = useState(false);

    const acoesComCotacao = acoes.map((acao) => {
        const quote = quotes[acao.ticker];
        if (!quote?.price) return acao;

        return {
            ...acao,
            valorAtual: quote.price * acao.quantidade,
        };
    });

    // Totais
    const patrimonioTotal = acoesComCotacao.reduce((acc, acao) => acc + acao.valorAtual, 0);
    const lucroAberto = acoesComCotacao.reduce((acc, acao) => acc + (acao.valorAtual - (acao.quantidade * acao.precoMedio)), 0);

    const dividendosMes = dividendos
        .filter(d => d.dataPagamento.startsWith(currentMonthKey))
        .reduce((acc, d) => acc + d.valorTotal, 0);

    const dividendosAcumulados = dividendos.reduce((acc, d) => acc + d.valorTotal, 0);

    const handleDeleteAcao = (id: string) => {
        setAcoes(prev => prev.filter(a => a.id !== id));
    };

    const handleDeleteDividendo = (id: string) => {
        setDividendos(prev => prev.filter(d => d.id !== id));
    };

    return (
        <div className="min-h-screen border-t border-transparent">
            <Sidebar />

            <main className="md:ml-64 p-4 pt-24 md:p-8 transition-all duration-300">
                <BotaoVoltar label="Voltar para Aplicações" fallbackUrl="/aplicacao" />

                <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Ações (B3)</h1>
                        <p className="text-muted mt-1">
                            Gerencie sua carteira de renda variável e proventos
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <PrintExportButtons title="Ações B3" period="Extrato de posições e proventos" />
                        <button
                            onClick={() => setDividendoModalOpen(true)}
                            className="flex items-center justify-center gap-2 px-4 py-3 text-foreground font-medium rounded-lg transition-all border"
                            style={{
                                background: "var(--card-bg)",
                                borderColor: "var(--card-border)",
                            }}
                        >
                            <HandCoins size={18} style={{ color: "var(--accent)" }} />
                            Lançar Provento
                        </button>
                        <button
                            onClick={() => setPosicaoModalOpen(true)}
                            className="btn-primary flex items-center justify-center gap-2 px-5 py-3 font-medium rounded-lg transition-all"
                        >
                            <Plus size={20} />
                            Nova Posição
                        </button>
                    </div>
                </header>

                {/* Resumo */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <CardResumo
                        titulo="Patrimônio em Ações"
                        valor={patrimonioTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        icone={<Briefcase size={24} />}
                        corGrafico="from-amber-500 to-orange-400"
                        subtexto={`<span class="${lucroAberto >= 0 ? 'text-emerald-400' : 'text-red-400'}">
              ${lucroAberto >= 0 ? '+' : ''}${lucroAberto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span> de lucro aberto`}
                    />
                    <CardResumo
                        titulo="Dividendos no Mês"
                        valor={dividendosMes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        icone={<CalIcon size={24} />}
                        corGrafico="from-amber-500 to-amber-400"
                    />
                    <CardResumo
                        titulo="Dividendos Acumulados"
                        valor={dividendosAcumulados.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        icone={<TrendingUp size={24} />}
                        corGrafico="from-indigo-700 to-blue-600"
                    />
                </div>

                <div className="glass-card mb-8 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-foreground">Cotações da B3</p>
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
                    {/* Tabela de Posições */}
                    <section>
                        <h2 className="text-xl font-bold text-foreground border-b border-white/10 pb-3 mb-6">
                            Minhas Posições
                        </h2>
                        <div className="glass-card rounded-2xl p-1 overflow-hidden">
                            <TabelaAcoes acoes={acoesComCotacao} onDelete={handleDeleteAcao} />
                        </div>
                    </section>

                    {/* Seção Dividendos */}
                    <section>
                        <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-6">
                            <h2 className="text-xl font-bold text-foreground">
                                Proventos Recebidos
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

            <NovaPosicaoModal
                isOpen={isPosicaoModalOpen}
                onClose={() => setPosicaoModalOpen(false)}
                onSave={(acao: Acao) => setAcoes((prev) => [acao, ...prev])}
            />
            <RegistrarDividendoModal
                isOpen={isDividendoModalOpen}
                onClose={() => setDividendoModalOpen(false)}
                onSave={(div: Dividendo) => setDividendos((prev) => [div, ...prev])}
            />
        </div>
    );
}
