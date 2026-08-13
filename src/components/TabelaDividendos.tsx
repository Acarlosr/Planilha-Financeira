"use client";

import { Dividendo } from "@/types/aplicacoes";
import { Trash2 } from "lucide-react";
import { useConfirm } from "@/hooks/useConfirm";

interface TabelaDividendosProps {
    dividendos: Dividendo[];
    onDelete?: (id: string) => void;
}

export default function TabelaDividendos({ dividendos, onDelete }: TabelaDividendosProps) {
    const { confirm, ConfirmDialog } = useConfirm();
    const getTipoBadge = (tipo: string) => {
        switch (tipo) {
            case 'dividendo': return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full">Dividendo</span>;
            case 'jcp': return <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs font-medium rounded-full">JCP</span>;
            case 'rendimento_fii': return <span className="px-2 py-1 bg-amber-500/20 text-amber-400 text-xs font-medium rounded-full">Rendimento</span>;
            case 'amortizacao': return <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded-full">Amortização</span>;
            default: return null;
        }
    };

    const formatDate = (isoStr: string) => {
        const [y, m, d] = isoStr.split('-');
        return `${d}/${m}/${y}`;
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-white/10 text-muted text-sm">
                        <th className="pb-3 px-4 font-medium">Pagamento</th>
                        <th className="pb-3 px-4 font-medium">Ativo</th>
                        <th className="pb-3 px-4 font-medium hidden sm:table-cell">Tipo</th>
                        <th className="pb-3 px-4 font-medium text-right hidden sm:table-cell">R$/cota</th>
                        <th className="pb-3 px-4 font-medium text-right hidden md:table-cell">Cotas</th>
                        <th className="pb-3 px-4 font-medium text-right">Total Recebido</th>
                        {onDelete && <th className="pb-3 px-4 font-medium text-center w-16"></th>}
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {dividendos.map((div) => (
                        <tr key={div.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                            <td className="py-4 px-4 text-muted">{formatDate(div.dataPagamento)}</td>
                            <td className="py-4 px-4 font-bold text-foreground">{div.ticker}</td>
                            <td className="py-4 px-4 hidden sm:table-cell">{getTipoBadge(div.tipo)}</td>
                            <td className="py-4 px-4 text-right text-muted hidden sm:table-cell">
                                {div.valorPorCota.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 4 })}
                            </td>
                            <td className="py-4 px-4 text-right text-muted hidden md:table-cell">{div.quantidadeNaData}</td>
                            <td className="py-4 px-4 text-right font-medium text-emerald-400">
                                + {div.valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </td>
                            {onDelete && (
                                <td className="py-4 px-4 text-center">
                                    <button
                                        onClick={async () => {
                                            if (await confirm(`Excluir provento de "${div.ticker}"?`)) {
                                                onDelete(div.id);
                                            }
                                        }}
                                        className="p-2 hover:bg-red-500/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        title="Excluir"
                                    >
                                        <Trash2 size={16} className="text-red-400" />
                                    </button>
                                </td>
                            )}
                        </tr>
                    ))}
                    {dividendos.length === 0 && (
                        <tr>
                            <td colSpan={onDelete ? 7 : 6} className="py-8 text-center text-muted">Nenhum provento neste período.</td>
                        </tr>
                    )}
                </tbody>
            </table>
            {ConfirmDialog}
        </div>
    );
}
