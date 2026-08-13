"use client";

import { useCallback, useRef, useState } from "react";
import ConfirmDialog, { ConfirmDialogState } from "@/components/ui/ConfirmDialog";

/**
 * Substituto para `window.confirm()`. Uso:
 *
 *   const { confirm, ConfirmDialog } = useConfirm();
 *   ...
 *   onClick={async () => {
 *     if (await confirm(`Excluir "${nome}"?`)) onDelete(id);
 *   }}
 *   ...
 *   return <div>...{ConfirmDialog}</div>
 */
export function useConfirm() {
    const [state, setState] = useState<ConfirmDialogState | null>(null);
    const resolveRef = useRef<((value: boolean) => void) | null>(null);

    const confirm = useCallback((message: string, options?: Omit<ConfirmDialogState, "message">) => {
        return new Promise<boolean>((resolve) => {
            resolveRef.current = resolve;
            setState({ message, ...options });
        });
    }, []);

    const handleConfirm = useCallback(() => {
        resolveRef.current?.(true);
        resolveRef.current = null;
        setState(null);
    }, []);

    const handleCancel = useCallback(() => {
        resolveRef.current?.(false);
        resolveRef.current = null;
        setState(null);
    }, []);

    const dialog = <ConfirmDialog state={state} onConfirm={handleConfirm} onCancel={handleCancel} />;

    return { confirm, ConfirmDialog: dialog };
}
