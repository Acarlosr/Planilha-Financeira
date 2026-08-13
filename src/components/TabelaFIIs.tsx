"use client";

import { FII } from "@/types/aplicacoes";
import { Trash2, ArrowDownCircle } from "lucide-react";
import { useConfirm } from "@/hooks/useConfirm";

interface TabelaFIIsProps {
    fiis: FII[];
    onDelete?: (id: string) => void;
    onSell?: (fii: FII) => void;
}

export default function TabelaFIIs({ fiis, onDelete, onSell }: TabelaFIIsProps) {
    const hasActions = Boolean(onDelete || onSell);
    const { confirm, ConfirmDialog } = useConfirm();
    const getCorSector = (setor: string) => {
        switch (setor.toLowerCase()) {
            case 'logística': return 'bg-blue-500/10 text-blue-700';
            case 'papel': return 'bg-amber-500/15 text-amber-700';
            case 'shoppings': return 'bg-rose-500/10 text-rose-700';
            case 'lajes corporativas': return 'bg-cyan-500/10 text-cyan-700';
            default: return 'bg-gray-500/10 text-gray-600';
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b text-muted text-sm" style={{ borderColor: "var(--card-border)" }}>
                        <th className="pb-3 px-4 font-medium">Fundo</th>
                        <th className="pb-3 px-4 font-medium hidden md:table-cell">Setor</th>
                        <th className="pb-3 px-4 font-medium text-right">Qtd. Cotas</th>
                        <th className="pb-3 px-4 font-medium text-right hidden sm:table-cell">Preço Médio</th>
                        <th className="pb-3 px-4 font-medium text-right">Valor Atual</th>
                        <th className="pb-3 px-4 font-medium text-right">DY (12m)</th>
                        {hasActions && <th className="pb-3 px-4 font-medium text-center w-24"></th>}
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {fiis.map((fii) => (
                        <tr key={fii.id} className="border-b transition-colors group hover:bg-black/5" style={{ borderColor: "var(--card-border)" }}>
                            <td className="py-4 px-4 font-bold text-foreground">
                                <div className="flex flex-col">
                                    <span className="px-2 py-1 rounded w-fit pb-1.5" style={{ background: "color-mix(in srgb, var(--accent) 10%, transparent)" }}>{fii.ticker}</span>
                                    <span className="text-xs text-muted font-normal mt-1 hidden sm:block">{fii.nome}</span>
                                </div>
                            </td>
                            <td className="py-4 px-4 hidden md:table-cell">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCorSector(fii.setor)}`}>
                                    {fii.setor}
                                </span>
                            </td>
                            <td className="py-4 px-4 text-right text-muted">{fii.quantidade}</td>
                            <td className="py-4 px-4 text-right text-muted hidden sm:table-cell">
                                {fii.precoMedio.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </td>
                            <td className="py-4 px-4 text-right text-foreground font-medium">
                                {fii.valorAtual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </td>
                            <td className="py-4 px-4 text-right">
                                <span className="font-bold text-emerald-600">
                                    {fii.dyAnual.toFixed(2)}%
                                </span>
                            </td>
                            {hasActions && (
                                <td className="py-4 px-4">
                                    <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                        {onSell && (
                                            <button
                                                onClick={() => onSell(fii)}
                                                className="p-2 hover:bg-amber-500/10 rounded-lg transition-all"
                                                title="Vender"
                                            >
                                                <ArrowDownCircle size={16} className="text-amber-500" />
                                            </button>
                                        )}
                                        {onDelete && (
                                            <button
                                                onClick={async () => {
                                                    if (await confirm(`Excluir "${fii.ticker} - ${fii.nome}"?`)) {
                                                        onDelete(fii.id);
                                                    }
                                                }}
                                                className="p-2 hover:bg-red-500/10 rounded-lg transition-all"
                                                title="Excluir"
                                            >
                                                <Trash2 size={16} className="text-red-500" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))}
                    {fiis.length === 0 && (
                        <tr>
                            <td colSpan={hasActions ? 7 : 6} className="py-8 text-center text-muted">Nenhum FII cadastrado.</td>
                        </tr>
                    )}
                </tbody>
            </table>
            {ConfirmDialog}
        </div>
    );
}
