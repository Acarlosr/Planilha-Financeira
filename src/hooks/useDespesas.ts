import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/database.types";
import { startOfMonth, endOfMonth, format } from "date-fns";

type Despesa = Database["public"]["Tables"]["despesas"]["Row"];

export function useDespesas(month: number, year: number) {
    const [despesas, setDespesas] = useState<Despesa[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDespesas = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setDespesas([]);
                setLoading(false);
                return;
            }

            const startDate = format(startOfMonth(new Date(year, month - 1)), 'yyyy-MM-dd');
            const endDate = format(endOfMonth(new Date(year, month - 1)), 'yyyy-MM-dd');

            const { data, error } = await supabase
                .from("despesas")
                .select("*")
                .eq("user_id", user.id)
                .gte("data", startDate)
                .lte("data", endDate)
                .order("data", { ascending: false });

            if (error) throw error;

            setDespesas(data || []);
        } catch (err: any) {
            console.error("Erro ao buscar despesas:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [month, year]);

    useEffect(() => {
        fetchDespesas();
    }, [fetchDespesas]);

    return { despesas, loading, error, refetch: fetchDespesas };
}
