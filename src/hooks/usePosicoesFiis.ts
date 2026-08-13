import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/database.types";
import { FII } from "@/types/aplicacoes";

type Row = Database["public"]["Tables"]["posicoes_fiis"]["Row"];

const rowToFII = (row: Row): FII => ({
    id: row.id,
    ticker: row.ticker,
    nome: row.nome,
    setor: row.setor,
    quantidade: Number(row.quantidade),
    precoMedio: Number(row.preco_medio),
    valorAtual: Number(row.valor_atual),
    dyAnual: Number(row.dy_anual),
    cnpj: row.cnpj ?? undefined,
});

export function usePosicoesFiis() {
    const [fiis, setFiis] = useState<FII[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchFiis = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setFiis([]);
                return;
            }

            const { data, error } = await supabase
                .from("posicoes_fiis")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setFiis((data || []).map(rowToFII));
        } catch (err) {
            const message = err instanceof Error ? err.message : "Erro ao carregar FIIs";
            setError(message);
            setFiis([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFiis();
    }, [fetchFiis]);

    const insertFii = useCallback(async (input: Omit<FII, "id">) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado");

        const { data, error } = await supabase
            .from("posicoes_fiis")
            .insert({
                user_id: user.id,
                ticker: input.ticker,
                nome: input.nome,
                setor: input.setor,
                quantidade: input.quantidade,
                preco_medio: input.precoMedio,
                valor_atual: input.valorAtual,
                dy_anual: input.dyAnual,
                cnpj: input.cnpj ?? null,
            })
            .select()
            .single();

        if (error) throw error;
        const fii = rowToFII(data);
        setFiis((prev) => [fii, ...prev]);
        return fii;
    }, []);

    const deleteFii = useCallback(async (id: string) => {
        const { error } = await supabase.from("posicoes_fiis").delete().eq("id", id);
        if (error) throw error;
        setFiis((prev) => prev.filter((f) => f.id !== id));
    }, []);

    return { fiis, loading, error, insertFii, deleteFii, refetch: fetchFiis };
}
