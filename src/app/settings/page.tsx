"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useSubscription } from "@/contexts/SubscriptionContext";
import {
    ArrowLeft,
    User,
    Mail,
    Lock,
    CreditCard,
    Crown,
    CheckCircle2,
    Loader2,
} from "lucide-react";

export default function SettingsPage() {
    const { user, plan, refreshProfile } = useSubscription();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [savingProfile, setSavingProfile] = useState(false);
    const [profileMsg, setProfileMsg] = useState<string | null>(null);

    const [novaSenha, setNovaSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [savingSenha, setSavingSenha] = useState(false);
    const [senhaMsg, setSenhaMsg] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);

    useEffect(() => {
        const init = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (authUser) {
                setEmail(authUser.email ?? "");
                setFullName(
                    user?.full_name ||
                    authUser.user_metadata?.full_name ||
                    authUser.user_metadata?.nome ||
                    ""
                );
            }
        };
        init();
    }, [user]);

    const salvarPerfil = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingProfile(true);
        setProfileMsg(null);
        try {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (!authUser) throw new Error("Usuário não autenticado");

            // Atualiza metadados do auth
            const { error: authError } = await supabase.auth.updateUser({
                data: { full_name: fullName, nome: fullName },
            });
            if (authError) throw authError;

            // Atualiza perfil na tabela
            const { error: profileError } = await supabase
                .from("user_profiles")
                .update({ full_name: fullName })
                .eq("id", authUser.id);
            if (profileError) throw profileError;

            await refreshProfile();
            setProfileMsg("Perfil atualizado com sucesso.");
        } catch (err) {
            const message = err instanceof Error ? err.message : "Erro ao salvar perfil";
            setProfileMsg(message);
        } finally {
            setSavingProfile(false);
        }
    };

    const alterarSenha = async (e: React.FormEvent) => {
        e.preventDefault();
        setSenhaMsg(null);

        if (novaSenha.length < 6) {
            setSenhaMsg({ tipo: "erro", texto: "A senha deve ter no mínimo 6 caracteres." });
            return;
        }
        if (novaSenha !== confirmarSenha) {
            setSenhaMsg({ tipo: "erro", texto: "As senhas não coincidem." });
            return;
        }

        setSavingSenha(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: novaSenha });
            if (error) throw error;
            setNovaSenha("");
            setConfirmarSenha("");
            setSenhaMsg({ tipo: "ok", texto: "Senha alterada com sucesso." });
        } catch (err) {
            const message = err instanceof Error ? err.message : "Erro ao alterar senha";
            setSenhaMsg({ tipo: "erro", texto: message });
        } finally {
            setSavingSenha(false);
        }
    };

    return (
        <div className="min-h-screen p-4 pt-12 md:p-8">
            <div className="mx-auto max-w-3xl">
                <Link
                    href="/"
                    className="mb-6 inline-flex items-center gap-2 text-muted transition-colors hover:text-foreground"
                >
                    <ArrowLeft size={20} />
                    Voltar ao Dashboard
                </Link>

                <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Configurações</h1>
                <p className="text-muted mb-8">Gerencie seus dados de conta e segurança</p>

                {/* Perfil */}
                <section className="glass-card mb-6 p-6 md:p-8">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: "color-mix(in srgb, var(--accent) 12%, transparent)", color: "var(--accent)" }}>
                            <User size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-foreground">Dados do perfil</h2>
                    </div>

                    <form onSubmit={salvarPerfil} className="space-y-4">
                        <div>
                            <label className="mb-1 block text-sm font-medium text-muted">Nome completo</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Seu nome"
                                    className="glass-input w-full py-2.5 pl-10 pr-4 text-foreground"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium text-muted">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    disabled
                                    className="glass-input w-full cursor-not-allowed py-2.5 pl-10 pr-4 text-muted opacity-70"
                                />
                            </div>
                            <p className="mt-1 text-xs text-muted">O email não pode ser alterado por aqui.</p>
                        </div>

                        {profileMsg && (
                            <p className="text-sm" style={{ color: "var(--success)" }}>{profileMsg}</p>
                        )}

                        <button
                            type="submit"
                            disabled={savingProfile}
                            className="flex items-center gap-2 rounded-lg px-5 py-2.5 font-medium text-white transition-all hover:brightness-110 disabled:opacity-70"
                            style={{ background: "var(--accent)" }}
                        >
                            {savingProfile ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                            Salvar alterações
                        </button>
                    </form>
                </section>

                {/* Senha */}
                <section className="glass-card mb-6 p-6 md:p-8">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: "color-mix(in srgb, var(--accent) 12%, transparent)", color: "var(--accent)" }}>
                            <Lock size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-foreground">Alterar senha</h2>
                    </div>

                    <form onSubmit={alterarSenha} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-muted">Nova senha</label>
                                <input
                                    type="password"
                                    value={novaSenha}
                                    onChange={(e) => setNovaSenha(e.target.value)}
                                    placeholder="••••••••"
                                    className="glass-input w-full px-4 py-2.5 text-foreground"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-muted">Confirmar senha</label>
                                <input
                                    type="password"
                                    value={confirmarSenha}
                                    onChange={(e) => setConfirmarSenha(e.target.value)}
                                    placeholder="••••••••"
                                    className="glass-input w-full px-4 py-2.5 text-foreground"
                                />
                            </div>
                        </div>

                        {senhaMsg && (
                            <p
                                className="text-sm"
                                style={{ color: senhaMsg.tipo === "ok" ? "var(--success)" : "var(--danger)" }}
                            >
                                {senhaMsg.texto}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={savingSenha}
                            className="flex items-center gap-2 rounded-lg px-5 py-2.5 font-medium text-white transition-all hover:brightness-110 disabled:opacity-70"
                            style={{ background: "var(--accent)" }}
                        >
                            {savingSenha ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
                            Alterar senha
                        </button>
                    </form>
                </section>

                {/* Assinatura (atalho) */}
                <section className="glass-card p-6 md:p-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: "color-mix(in srgb, var(--accent) 12%, transparent)", color: "var(--accent)" }}>
                                <CreditCard size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-foreground">Assinatura</h2>
                                <p className="text-sm text-muted">
                                    Plano atual: <span className="font-medium text-foreground">{plan?.name ?? "—"}</span>
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/settings/subscription"
                            className="inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 font-medium text-foreground transition-colors hover:bg-white/5"
                            style={{ borderColor: "var(--card-border)" }}
                        >
                            <Crown size={18} style={{ color: "var(--accent)" }} />
                            Gerenciar assinatura
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
}
