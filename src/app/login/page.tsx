"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { X, Mail, Loader2 } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
    const [email, setEmail] = useState("");
    const [emailSent, setEmailSent] = useState(false);
    const [otp, setOtp] = useState("");
    const [erro, setErro] = useState("");

    // Login com Provider OAuth
    const handleOAuthLogin = async (provider: 'google' | 'facebook' | 'apple') => {
        setLoadingProvider(provider);
        setErro("");
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                }
            });
            if (error) throw error;
        } catch (error: any) {
            setErro(error.message);
            setLoadingProvider(null);
        }
    };

    // Enviar OTP por email
    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setErro("");
        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    shouldCreateUser: true,
                },
            });

            if (error) throw error;
            setEmailSent(true);
        } catch (error: any) {
            setErro(error.message || "Erro ao enviar código.");
        } finally {
            setLoading(false);
        }
    };

    // Verificar OTP
    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setErro("");
        setLoading(true);

        try {
            const { error } = await supabase.auth.verifyOtp({
                email,
                token: otp,
                type: 'email',
            });

            if (error) throw error;
            router.push("/");
            router.refresh();
        } catch {
            setErro("Código inválido ou expirado.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
            style={{
                background: "linear-gradient(135deg, #0a1628 0%, #1a365d 50%, #0f4c81 100%)"
            }}
        >
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute -top-20 -left-20 w-80 h-80 rounded-full opacity-30"
                    style={{
                        background: "linear-gradient(135deg, #7CFF6B 0%, #6FEB5A 100%)",
                        filter: "blur(40px)"
                    }}
                />
                <div
                    className="absolute top-1/4 -right-20 w-96 h-96 rounded-full opacity-20"
                    style={{
                        background: "linear-gradient(135deg, #7CFF6B 0%, #6FEB5A 100%)",
                        filter: "blur(60px)"
                    }}
                />
            </div>

            {/* Auth Card */}
            <div
                className="w-full max-w-md relative z-10 rounded-3xl p-8 border border-white/10 animate-in slide-in-from-bottom-4 duration-500"
                style={{
                    background: "rgba(15, 23, 42, 0.95)",
                    backdropFilter: "blur(20px)",
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
                }}
            >
                {/* Close Button */}
                <Link
                    href="/landing"
                    className="absolute top-4 right-4 p-2 text-muted hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                    <X size={20} />
                </Link>

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-foreground mb-3">
                        Entrar ou cadastrar
                    </h1>
                    <p className="text-muted text-sm leading-relaxed">
                        Você vai poder aproveitar todas as funcionalidades do FinançasPro:
                        controle de receitas, despesas, investimentos e muito mais.
                    </p>
                </div>

                {/* Error Message */}
                {erro && (
                    <div className="mb-6 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm text-center">
                        {erro}
                    </div>
                )}

                {!emailSent ? (
                    <>
                        {/* Social Login Buttons */}
                        <div className="space-y-3 mb-6">
                            {/* Google */}
                            <button
                                type="button"
                                onClick={() => handleOAuthLogin('google')}
                                disabled={!!loadingProvider}
                                className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-all disabled:opacity-50"
                                style={{ background: "rgba(255, 255, 255, 0.03)" }}
                            >
                                {loadingProvider === 'google' ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                )}
                                Entrar com o Google
                            </button>

                            {/* Facebook */}
                            <button
                                type="button"
                                onClick={() => handleOAuthLogin('facebook')}
                                disabled={!!loadingProvider}
                                className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border border-blue-500/30 text-blue-400 font-medium hover:bg-blue-500/10 transition-all disabled:opacity-50"
                                style={{ background: "rgba(59, 130, 246, 0.05)" }}
                            >
                                {loadingProvider === 'facebook' ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                )}
                                Entrar com o Facebook
                            </button>

                            {/* Apple */}
                            <button
                                type="button"
                                onClick={() => handleOAuthLogin('apple')}
                                disabled={!!loadingProvider}
                                className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-all disabled:opacity-50"
                                style={{ background: "rgba(255, 255, 255, 0.03)" }}
                            >
                                {loadingProvider === 'apple' ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                                    </svg>
                                )}
                                Entrar com a Apple
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="flex items-center gap-4 my-6">
                            <div className="flex-1 h-px bg-white/10"></div>
                            <span className="text-muted text-sm">OU</span>
                            <div className="flex-1 h-px bg-white/10"></div>
                        </div>

                        {/* Email Form */}
                        <form onSubmit={handleSendOtp}>
                            <div className="mb-4">
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Endereço de e-mail"
                                    className="w-full px-4 py-3.5 rounded-xl text-white placeholder:text-muted outline-none transition-all border border-white/10 focus:border-[#7CFF6B]/50"
                                    style={{ background: "rgba(255, 255, 255, 0.03)" }}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading || !email}
                                className="w-full py-3.5 rounded-xl text-foreground font-semibold transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                    background: "linear-gradient(135deg, #7CFF6B 0%, #6FEB5A 100%)",
                                    boxShadow: "0 4px 15px rgba(30, 64, 175, 0.4)"
                                }}
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                                ) : (
                                    "Continuar"
                                )}
                            </button>
                        </form>
                    </>
                ) : (
                    /* OTP Verification */
                    <form onSubmit={handleVerifyOtp} className="animate-in slide-in-from-right-4 duration-300">
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-14 h-14 bg-[#7CFF6B]/20 text-[#7CFF6B] rounded-full mb-4">
                                <Mail className="w-7 h-7" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-1">Verifique seu e-mail</h3>
                            <p className="text-muted text-sm">
                                Enviamos um código para <span className="text-foreground font-medium">{email}</span>
                            </p>
                        </div>

                        <div className="mb-4">
                            <input
                                type="text"
                                required
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                placeholder="000000"
                                className="w-full px-4 py-4 text-center text-2xl tracking-[0.5em] font-bold rounded-xl text-white placeholder:text-gray-600 outline-none transition-all border border-white/10 focus:border-[#7CFF6B]/50"
                                style={{ background: "rgba(255, 255, 255, 0.03)" }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || otp.length < 6}
                            className="w-full py-3.5 rounded-xl text-foreground font-semibold transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed mb-3"
                            style={{
                                background: "linear-gradient(135deg, #7CFF6B 0%, #6FEB5A 100%)",
                                boxShadow: "0 4px 15px rgba(30, 64, 175, 0.4)"
                            }}
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                            ) : (
                                "Verificar"
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setEmailSent(false);
                                setOtp("");
                            }}
                            className="w-full py-2 text-muted hover:text-foreground text-sm font-medium transition-colors"
                        >
                            Voltar e corrigir e-mail
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
