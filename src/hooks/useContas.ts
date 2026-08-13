import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/database.types";

export type Conta = Database["public"]["Tables"]["contas"]["Row"];
export type ContaInsert = Database["public"]["Tables"]["contas"]["Insert"];
export type ContaUpdate = Database["public"]["Tables"]["contas"]["Update"];

export function useContas() {
    const [contas, setContas] = useState<Conta[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchContas = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setContas([]);
                return;
            }

            const { data, error } = await supabase
                .from("contas")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: true });

            if (error) throw error;
            setContas(data || []);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Erro ao carregar contas";
            setError(message);
            setContas([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchContas();
    }, [fetchContas]);

    const insertConta = useCallback(async (input: Omit<ContaInsert, "user_id">) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado");

        const { data, error } = await supabase
            .from("contas")
            .insert({ ...input, user_id: user.id })
            .select()
            .single();

        if (error) throw error;
        setContas((prev) => [...prev, data]);
        return data;
    }, []);

    const updateConta = useCallback(async (id: string, input: ContaUpdate) => {
        const { data, error } = await supabase
            .from("contas")
            .update(input)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        setContas((prev) => prev.map((c) => (c.id === id ? data : c)));
        return data;
    }, []);

    const deleteConta = useCallback(async (id: string) => {
        const { error } = await supabase.from("contas").delete().eq("id", id);
        if (error) throw error;
        setContas((prev) => prev.filter((c) => c.id !== id));
    }, []);

    return { contas, loading, error, insertConta, updateConta, deleteConta, refetch: fetchContas };
}
