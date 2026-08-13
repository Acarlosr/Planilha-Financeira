"use client";

import { useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import BotaoVoltar from "@/components/BotaoVoltar";
import CardResumo from "@/components/CardResumo";
import TabelaFIIs from "@/components/TabelaFIIs";
import TabelaDividendos from "@/components/TabelaDividendos";
import ResumoDividendos from "@/components/ResumoDividendos";
import NovaPosicaoFIIModal from "@/components/NovaPosicaoFIIModal";
import RegistrarDividendoModal from "@/components/RegistrarDividendoModal";
import VenderAtivoModal, { AtivoParaVenda } from "@/components/VenderAtivoModal";
import PrintExportButtons from "@/components/PrintExportButtons";
import { Plus, HandCoins, Building, TrendingUp, Percent, Receipt, FileUp } from "lucide-react";
import { useMarketQuotes } from "@/hooks/useMarketQuotes";
import { usePosicoesFiis } from "@/hooks/usePosicoesFiis";
import { useProventos } from "@/hooks/useProventos";
import { useVendasAtivos } from "@/hooks/useVendasAtivos";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/Toast";
import { Dividendo, FII } from "@/types/aplicacoes";

const currentMonthKey = new Date().toISOString().slice(0, 7);
const currentMonthLabel = new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

export default function FIIsPage() {
    const { fiis, loading: fiisLoading, error: fiisError, insertFii, deleteFii, refetch: refetchFiis } = usePosicoesFiis();
    const { proventos, loading: proventosLoading, error: proventosError, insertProvento, deleteProvento } = useProventos();
    const { registrarVenda } = useVendasAtivos();
    const dividendos = proventos.filter(d => ['rendimento_fii', 'amortizacao'].includes(d.tipo));
    const { quotes, updatedAt, loading: quotesLoading, error: quotesError } = useMarketQuotes(fiis.map((fii) => fii.ticker));
    const { toasts, toast, removeToast } = useToast();

    const [isPosicaoModalOpen, setPosicaoModalOpen] = useState(false);
    const [isDividendoModalOpen, setDividendoModalOpen] = useState(false);
    const [ativoParaVender, setAtivoParaVender] = useState<AtivoParaVenda | null>(null);

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

    const handleDeleteFII = async (id: string) => {
        try {
            await deleteFii(id);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Erro ao excluir fundo");
        }
    };

    const handleDeleteDividendo = async (id: string) => {
        try {
            await deleteProvento(id);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Erro ao excluir rendimento");
        }
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
                            {fiisLoading || proventosLoading
                                ? "Carregando seus fundos..."
                                : "Renda mensal passiva com imóveis e recebíveis"}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <PrintExportButtons title="Fundos Imobiliários" period="Extrato de posições e rendimentos" />
                        <Link
                            href="/aplicacao/impostos"
                            className="flex items-center justify-center gap-2 px-4 py-3 text-foreground font-medium rounded-lg transition-all border"
                            style={{
                                background: "var(--card-bg)",
                                borderColor: "var(--card-border)",
                            }}
                        >
                            <Receipt size={18} style={{ color: "var(--accent)" }} />
                            IR &amp; DARF
                        </Link>
                        <Link
                            href="/aplicacao/importar-nota"
                            className="flex items-center justify-center gap-2 px-4 py-3 text-foreground font-medium rounded-lg transition-all border"
                            style={{
                                background: "var(--card-bg)",
                                borderColor: "var(--card-border)",
                            }}
                        >
                            <FileUp size={18} style={{ color: "var(--accent)" }} />
                            Importar Nota
                        </Link>
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

                {(fiisError || proventosError) && (
                    <div className="mb-6 rounded-xl border p-4 text-sm text-red-300" style={{ borderColor: "rgba(248, 113, 113, 0.24)", background: "rgba(239, 68, 68, 0.08)" }}>
                        Não foi possível carregar seus dados: {fiisError || proventosError}
                    </div>
                )}

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
                            <TabelaFIIs
                                fiis={fiisComCotacao}
                                onDelete={handleDeleteFII}
                                onSell={(fii) => setAtivoParaVender({ id: fii.id, ticker: fii.ticker, quantidade: fii.quantidade, precoMedio: fii.precoMedio })}
                            />
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
                onSave={async (fii: FII) => {
                    try {
                        await insertFii(fii);
                        toast.success("Fundo registrado com sucesso.");
                    } catch (err) {
                        toast.error(err instanceof Error ? err.message : "Erro ao salvar fundo");
                    }
                }}
            />

            {/* Reusing dividendos modal since they share structure */}
            <RegistrarDividendoModal
                isOpen={isDividendoModalOpen}
                onClose={() => setDividendoModalOpen(false)}
                onSave={async (div: Dividendo) => {
                    try {
                        await insertProvento(div);
                        toast.success("Rendimento registrado com sucesso.");
                    } catch (err) {
                        toast.error(err instanceof Error ? err.message : "Erro ao salvar rendimento");
                    }
                }}
            />

            <VenderAtivoModal
                isOpen={Boolean(ativoParaVender)}
                ativo={ativoParaVender}
                onClose={() => setAtivoParaVender(null)}
                onConfirm={async ({ quantidade, precoVenda, taxas, dataVenda, modalidade }) => {
                    if (!ativoParaVender) return;
                    try {
                        await registrarVenda({
                            classe: "fii",
                            ticker: ativoParaVender.ticker,
                            modalidade,
                            quantidade,
                            precoVenda,
                            precoCusto: ativoParaVender.precoMedio,
                            taxas,
                            dataVenda,
                            posicaoId: ativoParaVender.id,
                            quantidadeRestanteNaPosicao: ativoParaVender.quantidade - quantidade,
                        });
                        await refetchFiis();
                        toast.success("Venda registrada. Confira a apuração em IR & DARF.");
                    } catch (err) {
                        toast.error(err instanceof Error ? err.message : "Erro ao registrar venda");
                    }
                }}
            />

            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </div>
    );
}
