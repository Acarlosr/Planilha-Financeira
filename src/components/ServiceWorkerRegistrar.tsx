"use client";

import { useEffect } from "react";

// Registra o Service Worker para habilitar PWA (cache offline + instalação)
export default function ServiceWorkerRegistrar() {
    useEffect(() => {
        if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

        navigator.serviceWorker
            .register("/sw.js", { scope: "/" })
            .then((reg) => {
                if (process.env.NODE_ENV === "development") {
                    console.log("[SW] Registrado com sucesso:", reg.scope);
                }
            })
            .catch((err) => {
                if (process.env.NODE_ENV === "development") {
                    console.warn("[SW] Falha ao registrar:", err);
                }
            });
    }, []);

    return null;
}
