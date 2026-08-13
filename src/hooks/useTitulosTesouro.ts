import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/database.types";
import { TesouroDireto } from "@/types/aplicacoes";

type Row = Database["public"]["Tables"]["titulos_tesouro"]["Row"];

const rowToTitulo = (row: Row): TesouroDireto => ({
    id: row.id,
    titulo: row.titulo,
    tipo: row.tipo,
    dataCompra: row.data_compra,
    vencimento: row.vencimento,
    valorAplicado: Number(row.valor_aplicado),
    quantidade: Number(row.quantidade),
    taxa: row.taxa,
    rendimentoAcumulado: Number(row.rendimento_acumulado),
});

export function useTitulosTesouro() {
    const [titulos, setTitulos] = useState<TesouroDireto[]>([]);
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
                .from("titulos_tesouro")
                .select("*")
                .eq("user_id", user.id)
                .order("data_compra", { ascending: false });

            if (error) throw error;
            setTitulos((data || []).map(rowToTitulo));
        } catch (err) {
            const message = err instanceof Error ? err.message : "Erro ao carregar títulos do Tesouro";
            setError(message);
            setTitulos([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTitulos();
    }, [fetchTitulos]);

    const insertTitulo = useCallback(async (input: Omit<TesouroDireto, "id">) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado");

        const { data, error } = await supabase
            .from("titulos_tesouro")
            .insert({
                user_id: user.id,
                titulo: input.titulo,
                tipo: input.tipo,
                data_compra: input.dataCompra,
                vencimento: input.vencimento,
                valor_aplicado: input.valorAplicado,
                quantidade: input.quantidade,
                taxa: input.taxa,
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
        const { error } = await supabase.from("titulos_tesouro").delete().eq("id", id);
        if (error) throw error;
        setTitulos((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return { titulos, loading, error, insertTitulo, deleteTitulo, refetch: fetchTitulos };
}
