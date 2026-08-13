import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/database.types";
import { VendaAtivo } from "@/types/aplicacoes";
import { calcularResultadoVenda } from "@/lib/impostoInvestimentos";

type Row = Database["public"]["Tables"]["vendas_ativos"]["Row"];

const rowToVenda = (row: Row): VendaAtivo => ({
    id: row.id,
    classe: row.classe,
    ticker: row.ticker,
    modalidade: row.modalidade,
    quantidade: Number(row.quantidade),
    precoVenda: Number(row.preco_venda),
    precoCusto: Number(row.preco_custo),
    taxas: Number(row.taxas),
    valorVenda: Number(row.valor_venda),
    valorCusto: Number(row.valor_custo),
    resultado: Number(row.resultado),
    dataVenda: row.data_venda,
    posicaoId: row.posicao_id ?? undefined,
});

export interface RegistrarVendaInput {
    classe: "acao" | "fii";
    ticker: string;
    modalidade: "swing_trade" | "day_trade";
    quantidade: number;
    precoVenda: number;
    precoCusto: number;
    taxas: number;
    dataVenda: string;
    posicaoId: string;
    /** quantidade restante na posição de origem, para decidir se ela fecha ou só reduz */
    quantidadeRestanteNaPosicao: number;
}

export function useVendasAtivos() {
    const [vendas, setVendas] = useState<VendaAtivo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchVendas = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setVendas([]);
                return;
            }

            const { data, error } = await supabase
                .from("vendas_ativos")
                .select("*")
                .eq("user_id", user.id)
                .order("data_venda", { ascending: false });

            if (error) throw error;
            setVendas((data || []).map(rowToVenda));
        } catch (err) {
            const message = err instanceof Error ? err.message : "Erro ao carregar vendas";
            setError(message);
            setVendas([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchVendas();
    }, [fetchVendas]);

    /**
     * Registra uma venda e ajusta a posição de origem: reduz a quantidade
     * restante, ou remove a posição se a venda zerou o saldo.
     */
    const registrarVenda = useCallback(async (input: RegistrarVendaInput) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Usuário não autenticado");

        const { valorVenda, valorCusto, resultado } = calcularResultadoVenda(
            input.quantidade,
            input.precoVenda,
            input.precoCusto,
            input.taxas
        );

        const { data, error } = await supabase
            .from("vendas_ativos")
            .insert({
                user_id: user.id,
                classe: input.classe,
                ticker: input.ticker,
                modalidade: input.modalidade,
                quantidade: input.quantidade,
                preco_venda: input.precoVenda,
                preco_custo: input.precoCusto,
                taxas: input.taxas,
                valor_venda: valorVenda,
                valor_custo: valorCusto,
                resultado,
                data_venda: input.dataVenda,
                posicao_id: input.posicaoId,
            })
            .select()
            .single();

        if (error) throw error;

        const tabelaPosicao = input.classe === "acao" ? "posicoes_acoes" : "posicoes_fiis";
        if (input.quantidadeRestanteNaPosicao <= 0) {
            const { error: deleteError } = await supabase
                .from(tabelaPosicao)
                .delete()
                .eq("id", input.posicaoId);
            if (deleteError) throw deleteError;
        } else {
            const { error: updateError } = await supabase
                .from(tabelaPosicao)
                .update({ quantidade: input.quantidadeRestanteNaPosicao })
                .eq("id", input.posicaoId);
            if (updateError) throw updateError;
        }

        const venda = rowToVenda(data);
        setVendas((prev) => [venda, ...prev]);
        return venda;
    }, []);

    const deleteVenda = useCallback(async (id: string) => {
        const { error } = await supabase.from("vendas_ativos").delete().eq("id", id);
        if (error) throw error;
        setVendas((prev) => prev.filter((v) => v.id !== id));
    }, []);

    return { vendas, loading, error, registrarVenda, deleteVenda, refetch: fetchVendas };
}
