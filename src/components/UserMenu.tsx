"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { User, LogOut, ChevronDown } from "lucide-react";

export default function UserMenu() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [userName, setUserName] = useState("Usuário");
    const [userEmail, setUserEmail] = useState("");
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Buscar dados do usuário
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserName(user.user_metadata?.nome || user.email?.split('@')[0] || "Usuário");
                setUserEmail(user.email || "");
            }
        };
        getUser();

        // Fechar menu ao clicar fora
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    return (
        <div className="relative" ref={menuRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-3 py-2 bg-white rounded-xl cursor-pointer transition-all hover:shadow-md"
                style={{
                    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.04)",
                }}
            >
                <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{
                        background: "linear-gradient(135deg, #A855F7 0%, #C084FC 100%)",
                    }}
                >
                    <User size={18} className="text-white" />
                </div>
                <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-800">{userName}</p>
                    <p className="text-xs text-gray-500">{userEmail}</p>
                </div>
                <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg overflow-hidden z-50"
                    style={{
                        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                    }}
                >
                    <div className="p-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-800">{userName}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{userEmail}</p>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                    >
                        <LogOut size={18} className="text-red-500" />
                        <span className="text-sm font-medium text-gray-700">Sair</span>
                    </button>
                </div>
            )}
        </div>
    );
}
