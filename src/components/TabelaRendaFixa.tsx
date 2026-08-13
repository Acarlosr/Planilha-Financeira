"use client";

import { RendaFixaPrivada } from "@/types/aplicacoes";
import { Trash2 } from "lucide-react";
import { useConfirm } from "@/hooks/useConfirm";

interface TabelaRendaFixaProps {
    titulos: RendaFixaPrivada[];
    onDelete?: (id: string) => void;
}

export default function TabelaRendaFixa({ titulos, onDelete }: TabelaRendaFixaProps) {
    const { confirm, ConfirmDialog } = useConfirm();
    const getTipoBadge = (tipo: string) => {
        switch (tipo) {
            case 'CDB': return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded-full border border-blue-500/30">CDB</span>;
            case 'LCI': return <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full border border-emerald-500/30">LCI</span>;
            case 'LCA': return <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full border border-emerald-500/30">LCA</span>;
            default: return null;
        }
    };

    const formatDate = (isoStr: string) => {
        const [y, m, d] = isoStr.split('-');
        return `${d}/${m}/${y}`;
    };

    const isVencendoLogo = (isoStr: string) => {
        const vencimentoRawDate = new Date(isoStr);
        const currDate = new Date('2026-02-23'); // Mocking current date for demo stability
        const diffTime = vencimentoRawDate.getTime() - currDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays > 0 && diffDays <= 30;
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-white/10 text-muted text-sm">
                        <th className="pb-3 px-4 font-medium">Tipo</th>
                        <th className="pb-3 px-4 font-medium">Instituição</th>
                        <th className="pb-3 px-4 font-medium hidden sm:table-cell">Indexador</th>
                        <th className="pb-3 px-4 font-medium hidden lg:table-cell">Taxa</th>
                        <th className="pb-3 px-4 font-medium hidden md:table-cell">Data Aplic.</th>
                        <th className="pb-3 px-4 font-medium">Vencimento</th>
                        <th className="pb-3 px-4 font-medium text-right">Valor</th>
                        <th className="pb-3 px-4 font-medium text-right">Rendimento</th>
                        {onDelete && <th className="pb-3 px-4 font-medium text-center w-16"></th>}
                    </tr>
                </thead>
                <tbody className="text-sm">
                    {titulos.map((t) => {
                        const vencendo = isVencendoLogo(t.vencimento);

                        return (
                            <tr key={t.id} className={`border-b border-white/5 transition-colors group ${vencendo ? 'bg-orange-500/10 hover:bg-orange-500/20' : 'hover:bg-white/5'}`}>
                                <td className="py-4 px-4">{getTipoBadge(t.tipo)}</td>
                                <td className="py-4 px-4 font-bold text-foreground">{t.instituicao}</td>
                                <td className="py-4 px-4 text-muted hidden sm:table-cell">{t.indexador}</td>
                                <td className="py-4 px-4 text-cyan-400 hidden lg:table-cell font-medium">{t.taxa}</td>
                                <td className="py-4 px-4 text-muted hidden md:table-cell">{formatDate(t.dataAplicacao)}</td>
                                <td className="py-4 px-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-muted">{formatDate(t.vencimento)}</span>
                                        {vencendo && (
                                            <span className="text-[10px] uppercase font-bold text-orange-400">
                                                Vencendo logo (&lt; 30d)
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="py-4 px-4 text-right text-foreground font-medium">
                                    {t.valorAplicado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </td>
                                <td className="py-4 px-4 text-right font-bold text-emerald-400">
                                    + {t.rendimentoAcumulado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </td>
                                {onDelete && (
                                    <td className="py-4 px-4 text-center">
                                        <button
                                            onClick={async () => {
                                                if (await confirm(`Excluir "${t.tipo} - ${t.instituicao}"?`)) {
                                                    onDelete(t.id);
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
                        );
                    })}
                    {titulos.length === 0 && (
                        <tr>
                            <td colSpan={onDelete ? 9 : 8} className="py-8 text-center text-muted">Nenhum título cadastrado.</td>
                        </tr>
                    )}
                </tbody>
            </table>
            {ConfirmDialog}
        </div>
    );
}
