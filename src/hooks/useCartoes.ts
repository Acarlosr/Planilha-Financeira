import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/database.types";

type Cartao = Database["public"]["Tables"]["cartoes"]["Row"];

export function useCartoes() {
    const [cartoes, setCartoes] = useState<Cartao[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCartoes = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setCartoes([]);
                return;
            }

            const { data, error } = await supabase
                .from("cartoes")
                .select("*")
                .eq("user_id", user.id)
                .order("nome");

            if (error) throw error;
            setCartoes(data || []);
        } catch (error) {
            console.error("Erro ao buscar cartões:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCartoes();
    }, []);

    return { cartoes, loading, refetch: fetchCartoes };
}
