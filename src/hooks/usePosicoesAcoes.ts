import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/database.types";
import { Acao } from "@/types/aplicacoes";

type Row = Database["public"]["Tables"]["posicoes_acoes"]["Row"];

const rowToAcao = (row: Row): Acao => ({
    id: row.id,
    ticker: row.ticker,
    empresa: row.empresa,
    quantidade: Number(row.quantidade),
    precoMedio: Number(row.preco_medio),
    valorAtual: Number(row.valor_atual),
    corretora: row.corretora ?? undefined,
    dataCompra: row.data_compra,
});

export function usePosicoesAcoes() {
    const [acoes, setAcoes] = useState<Acao[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAcoes = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setAcoes([]);
                return;
            }

            const { data, error } = await supabase
                .from("posicoes_acoes")
                .select("*")
                .eq("user_id", user.id)
                .order("data_compra", { ascending: false });

            if (error) throw error;
            setAcoes((data || []).map(rowToAcao));
        } catch (err) {
            const message = err instanceof Error ? err.message : "Erro ao carregar ações";
            setError(message);
            setAcoes([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAcoes();
    }, [fetchAcoes]);

    const insertAcao = useCallback(async (input: Omit<Acao, "id">) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado");

        const { data, error } = await supabase
            .from("posicoes_acoes")
            .insert({
                user_id: user.id,
                ticker: input.ticker,
                empresa: input.empresa,
                quantidade: input.quantidade,
                preco_medio: input.precoMedio,
                valor_atual: input.valorAtual,
                corretora: input.corretora ?? null,
                data_compra: input.dataCompra,
            })
            .select()
            .single();

        if (error) throw error;
        const acao = rowToAcao(data);
        setAcoes((prev) => [acao, ...prev]);
        return acao;
    }, []);

    const deleteAcao = useCallback(async (id: string) => {
        const { error } = await supabase.from("posicoes_acoes").delete().eq("id", id);
        if (error) throw error;
        setAcoes((prev) => prev.filter((a) => a.id !== id));
    }, []);

    return { acoes, loading, error, insertAcao, deleteAcao, refetch: fetchAcoes };
}
