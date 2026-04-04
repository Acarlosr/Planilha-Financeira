import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/database.types";
import { CATEGORIAS_DESPESA } from "@/constants/categories";

type Categoria = Database["public"]["Tables"]["categorias_despesa"]["Row"];

export function useCategorias() {
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCategorias = async () => {
        try {
            setLoading(true);
            // Busca categorias do banco
            const { data, error } = await supabase
                .from("categorias_despesa")
                .select("*");

            if (error) throw error;

            if (data && data.length > 0) {
                setCategorias(data);
            } else {
                // Se não tiver categorias, tenta usar as estáticas mapeadas (fallback) ou insere?
                // Idealmente o seed.sql já inseriu. 
                // Se estiver vazio, vamos retornar vazio e lidar na UI ou inserir default.
                setCategorias([]);
            }
        } catch (error) {
            console.error("Erro ao buscar categorias:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategorias();
    }, []);

    // Helper para combinar dados do banco com ícones/cores estáticos (se necessário)
    // Como o banco tem icone/cor como TEXT, podemos usar um map ou confiar no banco.
    // O seed.sql deve ter inserido os nomes dos ícones.

    return { categorias, loading, refetch: fetchCategorias };
}
