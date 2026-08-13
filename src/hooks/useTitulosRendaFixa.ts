import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/database.types";
import { RendaFixaPrivada } from "@/types/aplicacoes";

type Row = Database["public"]["Tables"]["titulos_renda_fixa"]["Row"];

const rowToTitulo = (row: Row): RendaFixaPrivada => ({
    id: row.id,
    tipo: row.tipo,
    instituicao: row.instituicao,
    indexador: row.indexador,
    taxa: row.taxa,
    dataAplicacao: row.data_aplicacao,
    vencimento: row.vencimento,
    valorAplicado: Number(row.valor_aplicado),
    rendimentoAcumulado: Number(row.rendimento_acumulado),
});

export function useTitulosRendaFixa() {
    const [titulos, setTitulos] = useState<RendaFixaPrivada[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTitulos = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setTitulos([]);
                return;
            }

            const { data, error } = await supabase
                .from("titulos_renda_fixa")
                .select("*")
                .eq("user_id", user.id)
                .order("data_aplicacao", { ascending: false });

            if (error) throw error;
            setTitulos((data || []).map(rowToTitulo));
        } catch (err) {
            const message = err instanceof Error ? err.message : "Erro ao carregar títulos de renda fixa";
            setError(message);
            setTitulos([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTitulos();
    }, [fetchTitulos]);

    const insertTitulo = useCallback(async (input: Omit<RendaFixaPrivada, "id">) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado");

        const { data, error } = await supabase
            .from("titulos_renda_fixa")
            .insert({
                user_id: user.id,
                tipo: input.tipo,
                instituicao: input.instituicao,
                indexador: input.indexador,
                taxa: input.taxa,
                data_aplicacao: input.dataAplicacao,
                vencimento: input.vencimento,
                valor_aplicado: input.valorAplicado,
                rendimento_acumulado: input.rendimentoAcumulado,
            })
            .select()
            .single();

        if (error) throw error;
        const titulo = rowToTitulo(data);
        setTitulos((prev) => [titulo, ...prev]);
        return titulo;
    }, []);

    const deleteTitulo = useCallback(async (id: string) => {
        const { error } = await supabase.from("titulos_renda_fixa").delete().eq("id", id);
        if (error) throw error;
        setTitulos((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return { titulos, loading, error, insertTitulo, deleteTitulo, refetch: fetchTitulos };
}
