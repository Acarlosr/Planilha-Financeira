"use client";

import { ArrowUpRight } from "lucide-react";

interface Aporte {
    id: string | number;
    data: string;
    descricao: string;
    valor: number;
}

interface HistoricoAportesProps {
    aportes: Aporte[];
}

export default function HistoricoAportes({ aportes }: HistoricoAportesProps) {
    return (
        <div className="space-y-4">
            {aportes.map((aporte) => (
                <div
                    key={aporte.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                            <ArrowUpRight size={18} className="text-emerald-400" />
                        </div>
                        <div>
                            <p className="font-medium text-foreground">{aporte.descricao}</p>
                            <p className="text-xs text-muted mt-1">{aporte.data}</p>
                        </div>
                    </div>
                    <span className="font-bold text-emerald-400 whitespace-nowrap">
                        + {aporte.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                </div>
            ))}

            {aportes.length === 0 && (
                <div className="text-center py-8 text-muted border border-dashed border-white/10 rounded-xl">
                    Nenhum aporte registrado
                </div>
            )}
        </div>
    );
}
