"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";
import Button from "./Button";

export interface ConfirmDialogState {
    message: string;
    tone?: "danger" | "neutral";
    confirmLabel?: string;
    cancelLabel?: string;
}

interface ConfirmDialogProps {
    state: ConfirmDialogState | null;
    onConfirm: () => void;
    onCancel: () => void;
}

/**
 * Substitui o `window.confirm()` nativo do navegador por um diálogo no
 * mesmo visual do resto do app. Use via o hook `useConfirm()`.
 */
export default function ConfirmDialog({ state, onConfirm, onCancel }: ConfirmDialogProps) {
    const confirmButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (state) confirmButtonRef.current?.focus();
    }, [state]);

    useEffect(() => {
        if (!state) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onCancel();
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [state, onCancel]);

    if (!state) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-message"
        >
            <div
                className="w-full max-w-sm rounded-2xl border border-white/10 shadow-2xl overflow-hidden p-6"
                style={{ background: "linear-gradient(180deg, rgba(30, 41, 59, 0.97) 0%, rgba(15, 23, 42, 0.97) 100%)" }}
            >
                <div className="flex items-start gap-3 mb-6">
                    <div className="w-9 h-9 rounded-full bg-red-500/15 flex items-center justify-center shrink-0">
                        <AlertTriangle size={18} className="text-red-400" aria-hidden="true" />
                    </div>
                    <p id="confirm-dialog-message" className="text-foreground font-medium pt-1.5">
                        {state.message}
                    </p>
                </div>
                <div className="flex items-center justify-end gap-3">
                    <Button variant="ghost" onClick={onCancel}>
                        {state.cancelLabel ?? "Cancelar"}
                    </Button>
                    <Button ref={confirmButtonRef} variant="danger" onClick={onConfirm}>
                        {state.confirmLabel ?? "Excluir"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
