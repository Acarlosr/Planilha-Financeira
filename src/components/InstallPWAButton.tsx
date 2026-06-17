"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

// Captura o evento do browser antes de descartar o prompt nativo
interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPWAButton() {
    const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Verifica se já está instalado como PWA
        if (window.matchMedia("(display-mode: standalone)").matches) {
            setIsInstalled(true);
            return;
        }

        const handler = (e: Event) => {
            e.preventDefault(); // Impede o prompt automático do browser
            setInstallPrompt(e as BeforeInstallPromptEvent);
        };

        window.addEventListener("beforeinstallprompt", handler);
        window.addEventListener("appinstalled", () => setIsInstalled(true));

        return () => {
            window.removeEventListener("beforeinstallprompt", handler);
        };
    }, []);

    // Não mostra nada se já instalado ou se o browser não suporta
    if (isInstalled || !installPrompt) return null;

    const handleInstall = async () => {
        if (!installPrompt) return;
        await installPrompt.prompt();
        const { outcome } = await installPrompt.userChoice;
        if (outcome === "accepted") {
            setInstallPrompt(null);
            setIsInstalled(true);
        }
    };

    return (
        <button
            onClick={handleInstall}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:brightness-110 border"
            style={{
                background: "linear-gradient(135deg, var(--accent), #d97706)",
                borderColor: "var(--accent)",
                color: "#000",
                boxShadow: "0 2px 12px color-mix(in srgb, var(--accent) 30%, transparent)",
            }}
            title="Instalar SaldoClaro como app"
        >
            <Download size={16} />
            <span className="hidden sm:inline">Instalar App</span>
        </button>
    );
}
