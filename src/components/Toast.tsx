"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning";

export interface ToastMessage {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastProps {
    toasts: ToastMessage[];
    onRemove: (id: string) => void;
}

const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-400 shrink-0" />,
    error: <XCircle className="h-5 w-5 text-red-400 shrink-0" />,
    warning: <AlertCircle className="h-5 w-5 text-amber-400 shrink-0" />,
};

const backgrounds = {
    success: "bg-green-950/90 border-green-700",
    error: "bg-red-950/90 border-red-700",
    warning: "bg-amber-950/90 border-amber-700",
};

function ToastItem({ toast, onRemove }: { toast: ToastMessage; onRemove: (id: string) => void }) {
    useEffect(() => {
        const timer = setTimeout(() => onRemove(toast.id), 4000);
        return () => clearTimeout(timer);
    }, [toast.id, onRemove]);

    return (
        <div
            className={`flex items-start gap-3 px-4 py-3 rounded-lg border text-sm text-white shadow-xl backdrop-blur-sm transition-all duration-300 ${backgrounds[toast.type]}`}
            role="alert"
        >
            {icons[toast.type]}
            <span className="flex-1 leading-snug">{toast.message}</span>
            <button
                onClick={() => onRemove(toast.id)}
                className="text-white/50 hover:text-white transition-colors ml-1 shrink-0"
                aria-label="Fechar notificação"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}

export function ToastContainer({ toasts, onRemove }: ToastProps) {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
            {toasts.map((toast) => (
                <div key={toast.id} className="pointer-events-auto">
                    <ToastItem toast={toast} onRemove={onRemove} />
                </div>
            ))}
        </div>
    );
}
