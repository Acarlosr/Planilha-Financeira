"use client";

import { useMemo } from "react";
import Sidebar from "@/components/Sidebar";
import BotaoVoltar from "@/components/BotaoVoltar";
import PrintExportButtons from "@/components/PrintExportButtons";
import { useVendasAtivos } from "@/hooks/useVendasAtivos";
import {
    apurarHistorico,
    GRUPO_LABEL,
    ApuracaoMensal,
} from "@/lib/impostoInvestimentos";
import { AlertTriangle, Receipt, ShieldCheck, CircleDollarSign } from "lucide-react";

const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatCompetencia = (competencia: string) => {
    const [year, month] = competencia.split("-");
    const label = new Date(Number(year), Number(month) - 1, 1).toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
    });
    return label.charAt(0).toUpperCase() + label.slice(1);
};

const formatDate = (value: string) => {
    const [year, month, day] = value.split("-");
    return `${day}/${month}/${year}`;
};

const STATUS_LABEL: Record<ApuracaoMensal["status"], string> = {
    isento: "Isento",
    a_pagar: "A pagar",
    abaixo_do_minimo: "Acumulado (< R$10)",
    sem_operacao_tributavel: "Sem imposto",
};

const STATUS_STYLE: Record<ApuracaoMensal["status"], { bg: string; text: string }> = {
    isento: { bg: "rgba(59, 130, 246, 0.12)", text: "#60a5fa" },
    a_pagar: { bg: "rgba(239, 68, 68, 0.12)", text: "#f87171" },
    abaixo_do_minimo: { bg: "rgba(245, 158, 11, 0.12)", text: "#fbbf24" },
    sem_operacao_tributavel: { bg: "rgba(16, 185, 129, 0.12)", text: "#34d399" },
};

function StatusBadge({ status }: { status: ApuracaoMensal["status"] }) {
    const style = STATUS_STYLE[status];
    return (
        <span
            className="px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ background: style.bg, color: style.text }}
        >
            {STATUS_LABEL[status]}
        </span>
    );
}

export default function ImpostosPage() {
    const { vendas, loading, error } = useVendasAtivos();

    const apuracoes = useMemo(
        () =>
            apurarHistorico(
                vendas.map((v) => ({
                    classe: v.classe,
                    modalidade: v.modalidade,
                    dataVenda: v.dataVenda,
                    valorVenda: v.valorVenda,
                    resultado: v.resultado,
                }))
            ),
        [vendas]
    );

    // Última competência apurada de cada grupo (o "mês corrente" para fins de destaque)
    const ultimaPorGrupo = useMemo(() => {
        const map = new Map<string, ApuracaoMensal>();
        for (const a of apuracoes) {
            map.set(a.grupo, a); // como está ordenado por competência asc, o último sobrescreve
        }
        return Array.from(map.values());
    }, [apuracoes]);

    const totalAPagar = ultimaPorGrupo.reduce((sum, a) => sum + a.impostoDevido, 0);

    return (
        <div className="min-h-screen">
            <Sidebar />

            <main className="md:ml-64 p-4 pt-24 md:p-8 transition-all duration-300">
                <BotaoVoltar label="Voltar para Aplicações" fallbackUrl="/aplicacao" />

                <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                            <Receipt size={28} style={{ color: "var(--accent)" }} />
                            IR &amp; DARF — Ações e FIIs
                        </h1>
                        <p className="text-muted mt-1">
                            Apuração mensal calculada a partir das vendas registradas em Ações e FIIs.
                        </p>
                    </div>
                    <PrintExportButtons title="IR e DARF - Ações e FIIs" period="Memória de cálculo completa" />
                </header>

                <div
                    className="mb-8 rounded-xl border p-4 flex gap-3 text-sm"
                    style={{ borderColor: "rgba(96, 165, 250, 0.25)", background: "rgba(59, 130, 246, 0.06)" }}
                >
                    <AlertTriangle size={18} className="text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-muted">
                        Esta página é uma ferramenta de organização e não substitui orientação profissional.
                        Os valores são calculados com as regras gerais de 2026 (alíquotas, isenção de R$ 20.000/mês
                        para ações swing trade, código DARF 6015) a partir apenas das vendas que você registrou
                        aqui. Confirme sempre com um contador antes de pagar qualquer DARF.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 rounded-xl border p-4 text-sm text-red-300" style={{ borderColor: "rgba(248, 113, 113, 0.24)", background: "rgba(239, 68, 68, 0.08)" }}>
                        Não foi possível carregar suas vendas: {error}
                    </div>
                )}

                {loading ? (
                    <div className="glass-card p-8 text-center text-muted">Carregando apuração...</div>
                ) : vendas.length === 0 ? (
                    <div className="glass-card p-10 text-center">
                        <ShieldCheck size={32} className="mx-auto mb-3 text-muted" />
                        <p className="text-foreground font-medium">Nenhuma venda registrada ainda</p>
                        <p className="text-muted text-sm mt-1">
                            Use o botão &quot;Vender&quot; nas posições de Ações ou FIIs para registrar uma venda —
                            a apuração de IR aparece aqui automaticamente.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Resumo do mês mais recente por grupo */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                            {ultimaPorGrupo.map((a) => (
                                <div key={a.grupo} className="glass-card p-6">
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-muted text-sm font-medium">{GRUPO_LABEL[a.grupo]}</p>
                                        <StatusBadge status={a.status} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-foreground mb-1">
                                        {formatCurrency(a.impostoDevido)}
                                    </h3>
                                    <p className="text-xs text-muted mb-3">
                                        {formatCompetencia(a.competencia)} · código {a.codigoDarf} · vence {formatDate(a.vencimento)}
                                    </p>
                                    <div className="text-xs text-muted space-y-1 border-t pt-3" style={{ borderColor: "var(--card-border)" }}>
                                        <div className="flex justify-between"><span>Total vendido</span><span className="text-foreground">{formatCurrency(a.totalVendas)}</span></div>
                                        <div className="flex justify-between"><span>Resultado do mês</span><span className={a.resultadoMes >= 0 ? "text-emerald-400" : "text-red-400"}>{formatCurrency(a.resultadoMes)}</span></div>
                                        {a.prejuizoUsado > 0 && (
                                            <div className="flex justify-between"><span>Prejuízo compensado</span><span className="text-foreground">{formatCurrency(a.prejuizoUsado)}</span></div>
                                        )}
                                        {a.prejuizoAcumuladoRestante > 0 && (
                                            <div className="flex justify-between"><span>Prejuízo a compensar</span><span className="text-foreground">{formatCurrency(a.prejuizoAcumuladoRestante)}</span></div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="glass-card p-6 mb-8 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <CircleDollarSign size={22} style={{ color: "var(--accent)" }} />
                                <div>
                                    <p className="text-sm text-muted">Total a pagar agora (último mês apurado por grupo)</p>
                                    <p className="text-xs text-muted">Código DARF 6015 — some os grupos que estiverem &quot;a pagar&quot; num único DARF, se forem da mesma competência.</p>
                                </div>
                            </div>
                            <span className="text-2xl font-bold text-foreground">{formatCurrency(totalAPagar)}</span>
                        </div>

                        {/* Memória de cálculo mensal */}
                        <section className="mb-10">
                            <h2 className="text-xl font-bold text-foreground border-b border-white/10 pb-3 mb-6">
                                Memória de Cálculo — Apuração Mensal
                            </h2>
                            <div className="glass-card rounded-2xl overflow-hidden overflow-x-auto">
                                <table className="w-full text-left border-collapse text-sm">
                                    <thead>
                                        <tr className="border-b text-muted" style={{ borderColor: "var(--card-border)" }}>
                                            <th className="py-3 px-4 font-medium">Competência</th>
                                            <th className="py-3 px-4 font-medium">Grupo</th>
                                            <th className="py-3 px-4 font-medium text-right">Vendido</th>
                                            <th className="py-3 px-4 font-medium text-right">Resultado</th>
                                            <th className="py-3 px-4 font-medium text-right">Base Cálculo</th>
                                            <th className="py-3 px-4 font-medium text-right">Alíquota</th>
                                            <th className="py-3 px-4 font-medium text-right">Imposto</th>
                                            <th className="py-3 px-4 font-medium">Status</th>
                                            <th className="py-3 px-4 font-medium">Vencimento</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {apuracoes.map((a) => (
                                            <tr key={`${a.competencia}-${a.grupo}`} className="border-b" style={{ borderColor: "var(--card-border)" }} data-print-row="true">
                                                <td className="py-3 px-4 text-foreground">{formatCompetencia(a.competencia)}</td>
                                                <td className="py-3 px-4 text-muted">{GRUPO_LABEL[a.grupo]}</td>
                                                <td className="py-3 px-4 text-right text-muted">{formatCurrency(a.totalVendas)}</td>
                                                <td className={`py-3 px-4 text-right font-medium ${a.resultadoMes >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                                    {formatCurrency(a.resultadoMes)}
                                                </td>
                                                <td className="py-3 px-4 text-right text-muted">{formatCurrency(a.baseCalculo)}</td>
                                                <td className="py-3 px-4 text-right text-muted">{(a.aliquota * 100).toFixed(0)}%</td>
                                                <td className="py-3 px-4 text-right font-bold text-foreground">{formatCurrency(a.impostoDevido)}</td>
                                                <td className="py-3 px-4"><StatusBadge status={a.status} /></td>
                                                <td className="py-3 px-4 text-muted">{formatDate(a.vencimento)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* Operações individuais */}
                        <section>
                            <h2 className="text-xl font-bold text-foreground border-b border-white/10 pb-3 mb-6">
                                Vendas Registradas
                            </h2>
                            <div className="glass-card rounded-2xl overflow-hidden overflow-x-auto">
                                <table className="w-full text-left border-collapse text-sm">
                                    <thead>
                                        <tr className="border-b text-muted" style={{ borderColor: "var(--card-border)" }}>
                                            <th className="py-3 px-4 font-medium">Data</th>
                                            <th className="py-3 px-4 font-medium">Ticker</th>
                                            <th className="py-3 px-4 font-medium">Modalidade</th>
                                            <th className="py-3 px-4 font-medium text-right">Qtd.</th>
                                            <th className="py-3 px-4 font-medium text-right">Preço Venda</th>
                                            <th className="py-3 px-4 font-medium text-right">Preço Custo</th>
                                            <th className="py-3 px-4 font-medium text-right">Resultado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {vendas.map((v) => (
                                            <tr key={v.id} className="border-b" style={{ borderColor: "var(--card-border)" }} data-print-row="true">
                                                <td className="py-3 px-4 text-muted">{formatDate(v.dataVenda)}</td>
                                                <td className="py-3 px-4 font-bold text-foreground">{v.ticker}</td>
                                                <td className="py-3 px-4 text-muted">{v.modalidade === "day_trade" ? "Day Trade" : "Swing Trade"}</td>
                                                <td className="py-3 px-4 text-right text-muted">{v.quantidade}</td>
                                                <td className="py-3 px-4 text-right text-muted">{formatCurrency(v.precoVenda)}</td>
                                                <td className="py-3 px-4 text-right text-muted">{formatCurrency(v.precoCusto)}</td>
                                                <td className={`py-3 px-4 text-right font-medium ${v.resultado >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                                    {formatCurrency(v.resultado)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </>
                )}
            </main>
        </div>
    );
}
