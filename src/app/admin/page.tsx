"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useSubscription } from "@/contexts/SubscriptionContext";
import {
    Users,
    UserPlus,
    Crown,
    DollarSign,
    Activity,
    ShieldAlert,
    ArrowLeft,
    Loader2,
    Search,
} from "lucide-react";

interface AdminUserRow {
    id: string;
    email: string;
    full_name: string | null;
    role: "user" | "admin";
    subscription_status: string;
    created_at: string;
    subscription_plan: { name: string; slug: string; price_monthly: number } | null;
}

const formatCurrency = (value: number) =>
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const formatDate = (value: string) =>
    new Date(value).toLocaleDateString("pt-BR");

const statusColor = (status: string) => {
    switch (status) {
        case "active":
            return "var(--success)";
        case "trial":
            return "var(--accent)";
        case "canceled":
        case "expired":
            return "var(--danger)";
        default:
            return "var(--text-secondary)";
    }
};

export default function AdminPage() {
    const { isAdmin, loading: subLoading } = useSubscription();
    const [users, setUsers] = useState<AdminUserRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [busca, setBusca] = useState("");

    const carregarUsuarios = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const { data, error } = await supabase
                .from("user_profiles")
                .select(`
                    id,
                    email,
                    full_name,
                    role,
                    subscription_status,
                    created_at,
                    subscription_plan:subscription_plans(name, slug, price_monthly)
                `)
                .order("created_at", { ascending: false });

            if (error) throw error;

            const normalizado = (data ?? []).map((item) => {
                const raw = item as Record<string, unknown>;
                const plano = Array.isArray(raw.subscription_plan)
                    ? raw.subscription_plan[0]
                    : raw.subscription_plan;
                return { ...(raw as unknown as AdminUserRow), subscription_plan: plano ?? null };
            });

            setUsers(normalizado);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Erro ao carregar usuários";
            setError(message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isAdmin) carregarUsuarios();
    }, [isAdmin, carregarUsuarios]);

    // Métricas calculadas
    const metrics = useMemo(() => {
        const now = Date.now();
        const days30 = now - 30 * 24 * 60 * 60 * 1000;
        const days7 = now - 7 * 24 * 60 * 60 * 1000;

        let novos30 = 0;
        let novos7 = 0;
        let free = 0;
        let pro = 0;
        let enterprise = 0;
        let ativos = 0;
        let trial = 0;
        let mrr = 0;

        users.forEach((u) => {
            const created = new Date(u.created_at).getTime();
            if (created >= days30) novos30 += 1;
            if (created >= days7) novos7 += 1;

            const slug = u.subscription_plan?.slug;
            if (slug === "free") free += 1;
            else if (slug === "pro") pro += 1;
            else if (slug === "enterprise") enterprise += 1;

            if (u.subscription_status === "active") {
                ativos += 1;
                mrr += Number(u.subscription_plan?.price_monthly ?? 0);
            }
            if (u.subscription_status === "trial") trial += 1;
        });

        return {
            total: users.length,
            novos30,
            novos7,
            free,
            pro,
            enterprise,
            ativos,
            trial,
            mrr,
        };
    }, [users]);

    const usuariosFiltrados = useMemo(() => {
        const termo = busca.trim().toLowerCase();
        if (!termo) return users;
        return users.filter(
            (u) =>
                u.email?.toLowerCase().includes(termo) ||
                (u.full_name ?? "").toLowerCase().includes(termo)
        );
    }, [users, busca]);

    // Guarda de acesso no cliente (o proxy já bloqueia no servidor)
    if (subLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" style={{ color: "var(--accent)" }} />
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center p-8">
                <div className="glass-card max-w-md p-8 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full" style={{ background: "color-mix(in srgb, var(--danger) 12%, transparent)", color: "var(--danger)" }}>
                        <ShieldAlert size={28} />
                    </div>
                    <h1 className="text-xl font-bold text-foreground">Acesso restrito</h1>
                    <p className="text-muted mt-2">
                        Esta área é exclusiva para administradores.
                    </p>
                    <Link
                        href="/"
                        className="mt-6 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 font-medium text-white"
                        style={{ background: "var(--accent)" }}
                    >
                        <ArrowLeft size={18} />
                        Voltar ao Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    const metricCards = [
        { label: "Total de usuários", value: metrics.total, icon: <Users size={22} />, gradient: "from-blue-500 to-blue-400" },
        { label: "Novos (30 dias)", value: metrics.novos30, icon: <UserPlus size={22} />, gradient: "from-emerald-500 to-emerald-400" },
        { label: "Assinaturas ativas", value: metrics.ativos, icon: <Activity size={22} />, gradient: "from-violet-500 to-violet-400" },
        { label: "Receita mensal (MRR)", value: formatCurrency(metrics.mrr), icon: <DollarSign size={22} />, gradient: "from-amber-500 to-amber-400" },
    ];

    return (
        <div className="min-h-screen p-4 pt-12 md:p-8">
            <div className="mx-auto max-w-6xl">
                <Link
                    href="/"
                    className="mb-6 inline-flex items-center gap-2 text-muted transition-colors hover:text-foreground"
                >
                    <ArrowLeft size={20} />
                    Voltar ao Dashboard
                </Link>

                <header className="mb-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg" style={{ background: "color-mix(in srgb, var(--accent) 14%, transparent)", color: "var(--accent)" }}>
                            <Crown size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Painel administrativo</h1>
                            <p className="text-muted">Métricas e gestão de usuários</p>
                        </div>
                    </div>
                </header>

                {error && (
                    <div
                        className="mb-6 rounded-lg border p-4 text-sm"
                        style={{
                            borderColor: "color-mix(in srgb, var(--danger) 24%, transparent)",
                            background: "color-mix(in srgb, var(--danger) 8%, transparent)",
                            color: "var(--danger)",
                        }}
                    >
                        {error}
                    </div>
                )}

                {/* Métricas principais */}
                <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {metricCards.map((card) => (
                        <div key={card.label} className="glass-card p-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-muted text-sm font-medium mb-1">{card.label}</p>
                                    <h3 className="text-2xl font-bold text-foreground">{card.value}</h3>
                                </div>
                                <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${card.gradient} text-white`}>
                                    {card.icon}
                                </div>
                            </div>
                        </div>
                    ))}
                </section>

                {/* Distribuição por plano */}
                <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="glass-card p-5">
                        <p className="text-muted text-sm">Plano Free</p>
                        <p className="text-xl font-bold text-foreground">{metrics.free}</p>
                    </div>
                    <div className="glass-card p-5">
                        <p className="text-muted text-sm">Plano Pro</p>
                        <p className="text-xl font-bold" style={{ color: "var(--success)" }}>{metrics.pro}</p>
                    </div>
                    <div className="glass-card p-5">
                        <p className="text-muted text-sm">Em trial</p>
                        <p className="text-xl font-bold" style={{ color: "var(--accent)" }}>{metrics.trial}</p>
                    </div>
                </section>

                {/* Tabela de usuários */}
                <section className="glass-card overflow-hidden">
                    <div className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-center sm:justify-between" style={{ borderColor: "var(--card-border)" }}>
                        <h2 className="text-lg font-bold text-foreground">Usuários ({usuariosFiltrados.length})</h2>
                        <div
                            className="flex items-center gap-2 rounded-lg border px-3 py-2"
                            style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}
                        >
                            <Search size={16} className="text-muted" />
                            <input
                                type="text"
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                                placeholder="Buscar por email ou nome..."
                                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted sm:w-64"
                            />
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="h-7 w-7 animate-spin" style={{ color: "var(--accent)" }} />
                        </div>
                    ) : usuariosFiltrados.length === 0 ? (
                        <p className="p-8 text-center text-sm text-muted">Nenhum usuário encontrado.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b text-xs uppercase text-muted" style={{ borderColor: "var(--card-border)" }}>
                                        <th className="px-5 py-3 font-medium">Usuário</th>
                                        <th className="px-5 py-3 font-medium">Plano</th>
                                        <th className="px-5 py-3 font-medium">Status</th>
                                        <th className="px-5 py-3 font-medium">Papel</th>
                                        <th className="px-5 py-3 font-medium">Cadastro</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usuariosFiltrados.map((u) => (
                                        <tr
                                            key={u.id}
                                            className="border-b transition-colors hover:bg-white/5"
                                            style={{ borderColor: "var(--card-border)" }}
                                        >
                                            <td className="px-5 py-3">
                                                <p className="font-medium text-foreground">
                                                    {u.full_name || u.email?.split("@")[0]}
                                                </p>
                                                <p className="text-xs text-muted">{u.email}</p>
                                            </td>
                                            <td className="px-5 py-3 text-foreground">
                                                {u.subscription_plan?.name ?? "—"}
                                            </td>
                                            <td className="px-5 py-3">
                                                <span
                                                    className="rounded-full px-2 py-1 text-xs font-semibold capitalize"
                                                    style={{
                                                        color: statusColor(u.subscription_status),
                                                        background: `color-mix(in srgb, ${statusColor(u.subscription_status)} 12%, transparent)`,
                                                    }}
                                                >
                                                    {u.subscription_status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3">
                                                {u.role === "admin" ? (
                                                    <span className="inline-flex items-center gap-1 font-medium" style={{ color: "var(--accent)" }}>
                                                        <Crown size={14} /> Admin
                                                    </span>
                                                ) : (
                                                    <span className="text-muted">Usuário</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3 text-muted">{formatDate(u.created_at)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
