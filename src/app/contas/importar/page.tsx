"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import Button from "@/components/ui/Button";
import { useContas } from "@/hooks/useContas";
import { useCategorias } from "@/hooks/useCategorias";
import { useToast } from "@/hooks/useToast";
import { ToastContainer } from "@/components/Toast";
import { supabase } from "@/lib/supabase";
import { Database } from "@/types/database.types";
import {
    parseOFX,
    parseCSV,
    sugerirMapeamentoCSV,
    converterLinhasCSV,
    marcarPossiveisDuplicatas,
    TransacaoImportada,
    MapeamentoCSV,
} from "@/lib/importarExtrato";
import { ArrowLeft, Upload, FileUp, AlertTriangle } from "lucide-react";

type CategoriaReceita = Database["public"]["Tables"]["categorias_receita"]["Row"];

interface LinhaPreview extends TransacaoImportada {
    id: string;
    incluir: boolean;
    duplicada: boolean;
    categoriaId: string;
}

type Etapa = "upload" | "mapear" | "preview";

const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function ImportarExtratoPage() {
    const { contas } = useContas();
    const { categorias: categoriasDespesa } = useCategorias();
    const { toasts, toast, removeToast } = useToast();

    const [categoriasReceita, setCategoriasReceita] = useState<CategoriaReceita[]>([]);

    const [etapa, setEtapa] = useState<Etapa>("upload");
    const [contaId, setContaId] = useState("");
    const [nomeArquivo, setNomeArquivo] = useState("");
    const [csvBruto, setCsvBruto] = useState<{ cabecalhos: string[]; linhas: string[][] } | null>(null);
    const [mapeamento, setMapeamento] = useState<MapeamentoCSV>({ data: -1, descricao: -1, valor: -1 });
    const [linhas, setLinhas] = useState<LinhaPreview[]>([]);
    const [processando, setProcessando] = useState(false);
    const [erro, setErro] = useState<string | null>(null);

    const categoriaDespesaDefault = categoriasDespesa[0]?.id ?? "";
    const categoriaReceitaDefault = categoriasReceita[0]?.id ?? "";

    const carregarCategoriasReceita = useCallback(async () => {
        const { data } = await supabase.from("categorias_receita").select("*").order("created_at", { ascending: true });
        setCategoriasReceita(data ?? []);
    }, []);

    const construirPreview = useCallback(
        async (transacoes: TransacaoImportada[]) => {
            if (transacoes.length === 0) {
                setErro("Nenhuma transação reconhecida nesse arquivo.");
                return;
            }

            await carregarCategoriasReceita();

            const datas = transacoes.map((t) => t.data);
            const dataMin = datas.reduce((a, b) => (a < b ? a : b));
            const dataMax = datas.reduce((a, b) => (a > b ? a : b));

            const [receitasExistentes, despesasExistentes] = await Promise.all([
                supabase.from("receitas").select("data, valor, descricao").eq("conta_id", contaId).gte("data", dataMin).lte("data", dataMax),
                supabase.from("despesas").select("data, valor, descricao").eq("conta_id", contaId).gte("data", dataMin).lte("data", dataMax),
            ]);

            const existentes = [...(receitasExistentes.data ?? []), ...(despesasExistentes.data ?? [])].map((r) => ({
                data: r.data,
                valor: Number(r.valor),
                descricao: r.descricao,
            }));

            const marcadas = marcarPossiveisDuplicatas(transacoes, existentes);

            setLinhas(
                marcadas.map((t, i) => ({
                    ...t,
                    id: `${i}-${t.data}-${t.valor}`,
                    incluir: !t.duplicada,
                    categoriaId: "",
                }))
            );
            setEtapa("preview");
        },
        [carregarCategoriasReceita, contaId]
    );

    const handleArquivo = async (file: File) => {
        setErro(null);
        setNomeArquivo(file.name);
        const conteudo = await file.text();
        const ehOFX = /\.(ofx|qfx)$/i.test(file.name);

        if (ehOFX) {
            const transacoes = parseOFX(conteudo);
            await construirPreview(transacoes);
        } else {
            const bruto = parseCSV(conteudo);
            if (bruto.linhas.length === 0) {
                setErro("Não foi possível ler linhas nesse CSV.");
                return;
            }
            setCsvBruto(bruto);
            setMapeamento(sugerirMapeamentoCSV(bruto.cabecalhos));
            setEtapa("mapear");
        }
    };

    const confirmarMapeamento = async () => {
        if (!csvBruto) return;
        if (mapeamento.data === -1 || mapeamento.descricao === -1 || mapeamento.valor === -1) {
            setErro("Selecione as três colunas (Data, Descrição e Valor) antes de continuar.");
            return;
        }
        setErro(null);
        const transacoes = converterLinhasCSV(csvBruto.linhas, mapeamento);
        await construirPreview(transacoes);
    };

    const linhasComCategoriaPadrao = useMemo(
        () =>
            linhas.map((l) => ({
                ...l,
                categoriaId: l.categoriaId || (l.tipo === "despesa" ? categoriaDespesaDefault : categoriaReceitaDefault),
            })),
        [linhas, categoriaDespesaDefault, categoriaReceitaDefault]
    );

    const totalIncluidas = linhasComCategoriaPadrao.filter((l) => l.incluir).length;

    const handleImportar = async () => {
        const selecionadas = linhasComCategoriaPadrao.filter((l) => l.incluir);
        if (selecionadas.length === 0) {
            toast.error("Selecione ao menos uma transação para importar.");
            return;
        }
        if (selecionadas.some((l) => !l.categoriaId)) {
            toast.error("Todas as transações selecionadas precisam de uma categoria.");
            return;
        }

        setProcessando(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Usuário não autenticado");

            const receitasParaInserir = selecionadas
                .filter((l) => l.tipo === "receita")
                .map((l) => ({
                    user_id: user.id,
                    descricao: l.descricao,
                    valor: l.valor,
                    data: l.data,
                    categoria_id: l.categoriaId,
                    conta_id: contaId,
                }));

            const despesasParaInserir = selecionadas
                .filter((l) => l.tipo === "despesa")
                .map((l) => ({
                    user_id: user.id,
                    descricao: l.descricao,
                    valor: l.valor,
                    data: l.data,
                    categoria_id: l.categoriaId,
                    conta_id: contaId,
                }));

            if (receitasParaInserir.length > 0) {
                const { error } = await supabase.from("receitas").insert(receitasParaInserir);
                if (error) throw error;
            }
            if (despesasParaInserir.length > 0) {
                const { error } = await supabase.from("despesas").insert(despesasParaInserir);
                if (error) throw error;
            }

            toast.success(`${selecionadas.length} lançamento(s) importado(s) com sucesso.`);
            setEtapa("upload");
            setLinhas([]);
            setCsvBruto(null);
            setNomeArquivo("");
        } catch (err) {
            toast.error(err instanceof Error ? err.message : "Erro ao importar transações.");
        } finally {
            setProcessando(false);
        }
    };

    const atualizarLinha = (id: string, patch: Partial<LinhaPreview>) => {
        setLinhas((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
    };

    return (
        <div className="min-h-screen">
            <Sidebar />

            <main className="md:ml-64 p-4 pt-24 md:p-8 transition-all duration-300 max-w-4xl">
                <header className="mb-8">
                    <Link href="/contas" className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground mb-3 transition-colors">
                        <ArrowLeft size={16} />
                        Voltar para Contas
                    </Link>
                    <h1 className="text-3xl font-bold text-foreground">Importar Extrato</h1>
                    <p className="text-muted mt-1">Importe um arquivo OFX ou CSV do seu banco e lance as transações automaticamente.</p>
                </header>

                {erro && (
                    <div className="mb-6 rounded-xl border p-4 text-sm text-red-300 flex items-center gap-2" style={{ borderColor: "rgba(248, 113, 113, 0.24)", background: "rgba(239, 68, 68, 0.08)" }}>
                        <AlertTriangle size={16} />
                        {erro}
                    </div>
                )}

                {etapa === "upload" && (
                    <div className="glass-card p-6 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-muted mb-2">Conta de destino</label>
                            <select
                                value={contaId}
                                onChange={(e) => setContaId(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl text-white outline-none transition-all border border-white/10 focus:border-blue-500/50"
                                style={{ background: "rgba(255, 255, 255, 0.05)" }}
                            >
                                <option value="">Selecione uma conta</option>
                                {contas.map((c) => (
                                    <option key={c.id} value={c.id}>{c.icone} {c.nome}</option>
                                ))}
                            </select>
                            {contas.length === 0 && (
                                <p className="mt-2 text-xs text-amber-300">
                                    Você ainda não tem contas cadastradas. <Link href="/contas" className="underline">Crie uma conta</Link> antes de importar.
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-muted mb-2">Arquivo (.ofx, .qfx ou .csv)</label>
                            <label
                                className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition-colors ${contaId ? "border-white/15 hover:border-blue-500/40 cursor-pointer" : "border-white/5 opacity-50 cursor-not-allowed"}`}
                            >
                                <Upload className="text-muted" size={28} />
                                <span className="text-sm text-muted">{nomeArquivo || "Clique para escolher o arquivo"}</span>
                                <input
                                    type="file"
                                    accept=".ofx,.qfx,.csv"
                                    disabled={!contaId}
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleArquivo(file);
                                    }}
                                />
                            </label>
                        </div>
                    </div>
                )}

                {etapa === "mapear" && csvBruto && (
                    <div className="glass-card p-6 space-y-6">
                        <div className="flex items-center gap-2">
                            <FileUp className="text-muted" size={18} />
                            <p className="text-sm text-muted">Confirme quais colunas do CSV correspondem a cada campo.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {(["data", "descricao", "valor"] as const).map((campo) => (
                                <div key={campo}>
                                    <label className="block text-sm font-medium text-muted mb-1 capitalize">{campo}</label>
                                    <select
                                        value={mapeamento[campo]}
                                        onChange={(e) => setMapeamento((prev) => ({ ...prev, [campo]: Number(e.target.value) }))}
                                        className="w-full px-3 py-2.5 rounded-xl text-white outline-none transition-all border border-white/10 focus:border-blue-500/50"
                                        style={{ background: "rgba(255, 255, 255, 0.05)" }}
                                    >
                                        <option value={-1}>Selecione a coluna</option>
                                        {csvBruto.cabecalhos.map((c, i) => (
                                            <option key={i} value={i}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>

                        <div className="overflow-x-auto rounded-xl border border-white/10">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        {csvBruto.cabecalhos.map((c, i) => (
                                            <th key={i} className="text-left px-3 py-2 text-muted font-medium">{c}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {csvBruto.linhas.slice(0, 4).map((linha, i) => (
                                        <tr key={i} className="border-b border-white/5 last:border-0">
                                            {linha.map((valor, j) => (
                                                <td key={j} className="px-3 py-2 text-foreground">{valor}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex gap-3">
                            <Button variant="secondary" onClick={() => { setEtapa("upload"); setCsvBruto(null); }}>Voltar</Button>
                            <Button onClick={confirmarMapeamento}>Continuar</Button>
                        </div>
                    </div>
                )}

                {etapa === "preview" && (
                    <div className="glass-card p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted">
                                {linhas.length} transação(ões) encontrada(s) · {totalIncluidas} selecionada(s) para importar
                            </p>
                        </div>

                        <div className="overflow-x-auto rounded-xl border border-white/10">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="px-3 py-2"></th>
                                        <th className="text-left px-3 py-2 text-muted font-medium">Data</th>
                                        <th className="text-left px-3 py-2 text-muted font-medium">Descrição</th>
                                        <th className="text-right px-3 py-2 text-muted font-medium">Valor</th>
                                        <th className="text-left px-3 py-2 text-muted font-medium">Categoria</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {linhasComCategoriaPadrao.map((l) => (
                                        <tr key={l.id} className="border-b border-white/5 last:border-0">
                                            <td className="px-3 py-2">
                                                <input
                                                    type="checkbox"
                                                    checked={l.incluir}
                                                    onChange={(e) => atualizarLinha(l.id, { incluir: e.target.checked })}
                                                />
                                            </td>
                                            <td className="px-3 py-2 text-foreground font-numeric">{l.data.split("-").reverse().join("/")}</td>
                                            <td className="px-3 py-2 text-foreground">
                                                {l.descricao}
                                                {l.duplicada && (
                                                    <span className="ml-2 inline-flex items-center gap-1 text-xs text-amber-300">
                                                        <AlertTriangle size={12} /> possível duplicata
                                                    </span>
                                                )}
                                            </td>
                                            <td className={`px-3 py-2 text-right font-numeric font-medium ${l.tipo === "despesa" ? "text-red-400" : "text-emerald-400"}`}>
                                                {l.tipo === "despesa" ? "-" : "+"}{formatCurrency(l.valor)}
                                            </td>
                                            <td className="px-3 py-2">
                                                <select
                                                    value={l.categoriaId}
                                                    onChange={(e) => atualizarLinha(l.id, { categoriaId: e.target.value })}
                                                    className="px-2 py-1.5 rounded-lg text-white text-xs outline-none border border-white/10"
                                                    style={{ background: "rgba(255, 255, 255, 0.05)" }}
                                                >
                                                    {(l.tipo === "despesa" ? categoriasDespesa : categoriasReceita).map((cat) => (
                                                        <option key={cat.id} value={cat.id}>{cat.icone} {cat.nome}</option>
                                                    ))}
                                                </select>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex gap-3">
                            <Button variant="secondary" onClick={() => { setEtapa("upload"); setLinhas([]); setNomeArquivo(""); }}>Cancelar</Button>
                            <Button onClick={handleImportar} loading={processando}>
                                Importar {totalIncluidas} lançamento(s)
                            </Button>
                        </div>
                    </div>
                )}
            </main>

            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </div>
    );
}
