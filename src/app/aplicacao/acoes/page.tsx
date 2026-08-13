"use client";

import { useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import BotaoVoltar from "@/components/BotaoVoltar";
import CardResumo from "@/components/CardResumo";
import TabelaAcoes from "@/components/TabelaAcoes";
import TabelaDividendos from "@/components/TabelaDividendos";
import ResumoDividendos from "@/components/ResumoDividendos";
import NovaPosicaoModal from "@/components/NovaPosicaoModal";
import RegistrarDividendoModal from "@/components/RegistrarDividendoModal";
import VenderAtivoModal, { AtivoParaVenda } from "@/components/VenderAtivoModal";
import PrintExportButtons from "@/components/PrintExportButtons";
import { Plus, HandCoins, Briefcase, TrendingUp, Calendar as CalIcon, Receipt, FileUp } from "lucide-react";
import { useMarketQuotes } from "@/hooks/useMarketQuotes";
import { usePosicoesAcoes } from "@/hooks/usePosicoesAcoes";
import { useProventos } from "@/hooks/useProventos";
import { useVendasAtivos } from "@/hooks/useVendasAtivos";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/Toast";
import { Acao, Dividendo } from "@/types/aplicacoes";

const currentMonthKey = new Date().toISOString().slice(0, 7);
const currentMonthLabel = new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

export default function AcoesPage() {
    const { acoes, loading: acoesLoading, error: acoesError, insertAcao, deleteAcao, refetch: refetchAcoes } = usePosicoesAcoes();
    const { proventos, loading: proventosLoading, error: proventosError, insertProvento, deleteProvento } = useProventos();
    const { registrarVenda } = useVendasAtivos();
    const dividendos = proventos.filter(d => ['dividendo', 'jcp'].includes(d.tipo));
    const { quotes, updatedAt, loading: quotesLoading, error: quotesError } = useMarketQuotes(acoes.map((acao) => acao.ticker));
    const { toasts, toast, removeToast } = useToast();

    const [isPosicaoModalOpen, setPosicaoModalOpen] = useState(false);
    const [isDividendoModalOpen, setDividendoModalOpen] = useState(false);
    const [ativoParaVender, setAtivoParaVender] = useState<AtivoParaVenda | null>(null);

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

    const handleDeleteAcao = async (id: string) => {
        try {
            await deleteAcao(id);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Erro ao excluir posição");
        }
    };

    const handleDeleteDividendo = async (id: string) => {
        try {
            await deleteProvento(id);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Erro ao excluir provento");
        }
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
                            {acoesLoading || proventosLoading
                                ? "Carregando sua carteira..."
                                : "Gerencie sua carteira de renda variável e proventos"}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <PrintExportButtons title="Ações B3" period="Extrato de posições e proventos" />
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

                {(acoesError || proventosError) && (
                    <div className="mb-6 rounded-xl border p-4 text-sm text-red-300" style={{ borderColor: "rgba(248, 113, 113, 0.24)", background: "rgba(239, 68, 68, 0.08)" }}>
                        Não foi possível carregar seus dados: {acoesError || proventosError}
                    </div>
                )}

                {/* Resumo */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <CardResumo
                        titulo="Patrimônio em Ações"
                        valor={patrimonioTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        icone={<Briefcase size={24} />}
                        corGrafico="from-amber-500 to-orange-400"
                        subtexto={
                            <>
                                <span className={lucroAberto >= 0 ? "text-emerald-400" : "text-red-400"}>
                                    {lucroAberto >= 0 ? "+" : ""}
                                    {lucroAberto.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                                </span>{" "}
                                de lucro aberto
                            </>
                        }
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
                            <TabelaAcoes
                                acoes={acoesComCotacao}
                                onDelete={handleDeleteAcao}
                                onSell={(acao) => setAtivoParaVender({ id: acao.id, ticker: acao.ticker, quantidade: acao.quantidade, precoMedio: acao.precoMedio })}
                            />
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
                onSave={async (acao: Acao) => {
                    try {
                        await insertAcao(acao);
                        toast.success("Posição registrada com sucesso.");
                    } catch (err) {
                        toast.error(err instanceof Error ? err.message : "Erro ao salvar posição");
                    }
                }}
            />
            <RegistrarDividendoModal
                isOpen={isDividendoModalOpen}
                onClose={() => setDividendoModalOpen(false)}
                onSave={async (div: Dividendo) => {
                    try {
                        await insertProvento(div);
                        toast.success("Provento registrado com sucesso.");
                    } catch (err) {
                        toast.error(err instanceof Error ? err.message : "Erro ao salvar provento");
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
                            classe: "acao",
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
                        await refetchAcoes();
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
