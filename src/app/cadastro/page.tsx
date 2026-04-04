"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";

export default function CadastroPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [erro, setErro] = useState("");

    // Cadastro com email/senha
    const handleCadastro = async (e: React.FormEvent) => {
        e.preventDefault();
        setErro("");

        // Validações
        if (password !== confirmPassword) {
            setErro("As senhas não coincidem.");
            return;
        }

        if (password.length < 6) {
            setErro("A senha deve ter no mínimo 6 caracteres.");
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        nome: nome,
                    },
                },
            });

            if (error) throw error;

            router.push("/");
            router.refresh();
        } catch (error: any) {
            console.error(error);
            setErro(error.message || "Erro ao criar conta.");
        } finally {
            setLoading(false);
        }
    };

    // Login com Google
    const handleGoogleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/`,
                }
            });
            if (error) throw error;
        } catch (error: any) {
            setErro(error.message);
        }
    };

    // Login com GitHub (removido - não usado mais)

    // Login com Apple
    const handleAppleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'apple',
                options: {
                    redirectTo: `${window.location.origin}/`,
                }
            });
            if (error) throw error;
        } catch (error: any) {
            setErro(error.message);
        }
    };

    // Login com Facebook
    const handleFacebookLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'facebook',
                options: {
                    redirectTo: `${window.location.origin}/`,
                }
            });
            if (error) throw error;
        } catch (error: any) {
            setErro(error.message);
        }
    };


    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
            style={{
                background: "linear-gradient(135deg, #0a1628 0%, #1a365d 50%, #0f4c81 100%)"
            }}
        >
            {/* Background Decorative Shapes */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Large curved shape top-left */}
                <div
                    className="absolute -top-20 -left-20 w-80 h-80 rounded-full opacity-30"
                    style={{
                        background: "linear-gradient(135deg, #7CFF6B 0%, #6FEB5A 100%)",
                        filter: "blur(40px)"
                    }}
                />
                {/* Curved shape right */}
                <div
                    className="absolute top-1/4 -right-20 w-96 h-96 rounded-full opacity-20"
                    style={{
                        background: "linear-gradient(135deg, #7CFF6B 0%, #6FEB5A 100%)",
                        filter: "blur(60px)"
                    }}
                />
                {/* Bottom wave */}
                <div
                    className="absolute -bottom-40 left-1/4 w-[600px] h-[400px] rounded-full opacity-25"
                    style={{
                        background: "linear-gradient(135deg, #0284c7 0%, #0369a1 100%)",
                        filter: "blur(80px)"
                    }}
                />
                {/* Floating decorative elements */}
                <div className="absolute top-16 left-20 w-16 h-16 rounded-full border-4 border-[#7CFF6B]/40 animate-pulse" />
                <div className="absolute bottom-32 right-32 w-20 h-20 rounded-xl border-4 border-[#FFD700]/30 rotate-45 animate-bounce" style={{ animationDuration: '3s' }} />
                <div className="absolute top-1/2 left-16 w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-400/20 to-blue-500/20 backdrop-blur-sm" />
            </div>

            {/* Main Content */}
            <div className="w-full max-w-md relative z-10 animate-in slide-in-from-bottom-4 duration-700">
                {/* Back Button */}
                <Link
                    href="/landing"
                    className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-xl text-muted hover:text-white transition-all hover:bg-white/10 border border-white/10 hover:border-white/20"
                    style={{
                        background: "rgba(255, 255, 255, 0.05)",
                    }}
                >
                    <ArrowLeft size={20} />
                    <span className="font-medium">Voltar</span>
                </Link>

                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-[#7CFF6B] tracking-wide">FinançasPro</h1>
                </div>

                {/* Glassmorphism Card */}
                <div
                    className="rounded-3xl p-8 border border-white/20"
                    style={{
                        background: "rgba(255, 255, 255, 0.08)",
                        backdropFilter: "blur(20px)",
                        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.1)"
                    }}
                >
                    <h2 className="text-2xl font-bold text-foreground mb-6">Create Account</h2>

                    {/* Error Message */}
                    {erro && (
                        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm">
                            {erro}
                        </div>
                    )}

                    <form onSubmit={handleCadastro} className="space-y-4">
                        {/* Nome */}
                        <div>
                            <label className="block text-sm font-medium text-muted mb-2">Full Name</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    required
                                    value={nome}
                                    onChange={(e) => setNome(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl text-white placeholder:text-muted outline-none transition-all duration-300 border border-white/10 focus:border-[#7CFF6B]/50"
                                    style={{
                                        background: "rgba(255, 255, 255, 0.05)",
                                    }}
                                    placeholder="Your name"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-muted mb-2">Email</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl text-white placeholder:text-muted outline-none transition-all duration-300 border border-white/10 focus:border-[#7CFF6B]/50"
                                    style={{
                                        background: "rgba(255, 255, 255, 0.05)",
                                    }}
                                    placeholder="username@gmail.com"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-muted mb-2">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 pr-12 rounded-xl text-white placeholder:text-muted outline-none transition-all duration-300 border border-white/10 focus:border-[#7CFF6B]/50"
                                    style={{
                                        background: "rgba(255, 255, 255, 0.05)",
                                    }}
                                    placeholder="Min. 6 characters"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-muted mb-2">Confirm Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl text-white placeholder:text-muted outline-none transition-all duration-300 border border-white/10 focus:border-[#7CFF6B]/50"
                                    style={{
                                        background: "rgba(255, 255, 255, 0.05)",
                                    }}
                                    placeholder="Repeat password"
                                />
                            </div>
                        </div>

                        {/* Create Account Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 rounded-xl text-foreground font-semibold transition-all duration-300 hover:brightness-110 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                            style={{
                                background: "linear-gradient(135deg, #7CFF6B 0%, #6FEB5A 100%)",
                                boxShadow: "0 4px 20px rgba(30, 64, 175, 0.4)"
                            }}
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                            ) : (
                                "Create Account"
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center my-6">
                        <div className="flex-1 h-px bg-white/10"></div>
                        <span className="px-4 text-sm text-muted">or continue with</span>
                        <div className="flex-1 h-px bg-white/10"></div>
                    </div>

                    {/* Social Login Buttons */}
                    <div className="space-y-3">
                        {/* Google */}
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-all"
                            style={{ background: "rgba(255, 255, 255, 0.03)" }}
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Entrar com o Google
                        </button>

                        {/* Facebook */}
                        <button
                            type="button"
                            onClick={handleFacebookLogin}
                            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border border-blue-500/30 text-blue-400 font-medium hover:bg-blue-500/10 transition-all"
                            style={{ background: "rgba(59, 130, 246, 0.05)" }}
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            </svg>
                            Entrar com o Facebook
                        </button>

                        {/* Apple */}
                        <button
                            type="button"
                            onClick={handleAppleLogin}
                            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-all"
                            style={{ background: "rgba(255, 255, 255, 0.03)" }}
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                            </svg>
                            Entrar com a Apple
                        </button>
                    </div>

                    {/* Login Link */}
                    <div className="mt-6 text-center">
                        <p className="text-muted text-sm">
                            Already have an account?{" "}
                            <Link href="/login" className="text-[#7CFF6B] font-semibold hover:text-[#6FEB5A] transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
