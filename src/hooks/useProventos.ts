import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/database.types";
import { Dividendo } from "@/types/aplicacoes";

type Row = Database["public"]["Tables"]["proventos"]["Row"];

const rowToProvento = (row: Row): Dividendo => ({
    id: row.id,
    ticker: row.ticker,
    tipo: row.tipo,
    dataEx: row.data_ex,
    dataPagamento: row.data_pagamento,
    valorPorCota: Number(row.valor_por_cota),
    quantidadeNaData: Number(row.quantidade_na_data),
    valorTotal: Number(row.valor_total),
});

/**
 * Todos os proventos do usuário (dividendo, JCP, rendimento FII, amortização).
 * As páginas de Ações e FIIs filtram por `tipo` no cliente, igual ao
 * comportamento anterior com os dados mock.
 */
export function useProventos() {
    const [proventos, setProventos] = useState<Dividendo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProventos = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setProventos([]);
                return;
            }

            const { data, error } = await supabase
                .from("proventos")
                .select("*")
                .eq("user_id", user.id)
                .order("data_pagamento", { ascending: false });

            if (error) throw error;
            setProventos((data || []).map(rowToProvento));
        } catch (err) {
            const message = err instanceof Error ? err.message : "Erro ao carregar proventos";
            setError(message);
            setProventos([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProventos();
    }, [fetchProventos]);

    const insertProvento = useCallback(async (input: Omit<Dividendo, "id">) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado");

        const { data, error } = await supabase
            .from("proventos")
            .insert({
                user_id: user.id,
                ticker: input.ticker,
                tipo: input.tipo,
                data_ex: input.dataEx,
                data_pagamento: input.dataPagamento,
                valor_por_cota: input.valorPorCota,
                quantidade_na_data: input.quantidadeNaData,
                valor_total: input.valorTotal,
            })
            .select()
            .single();

        if (error) throw error;
        const provento = rowToProvento(data);
        setProventos((prev) => [provento, ...prev]);
        return provento;
    }, []);

    const deleteProvento = useCallback(async (id: string) => {
        const { error } = await supabase.from("proventos").delete().eq("id", id);
        if (error) throw error;
        setProventos((prev) => prev.filter((d) => d.id !== id));
    }, []);

    return { proventos, loading, error, insertProvento, deleteProvento, refetch: fetchProventos };
}
