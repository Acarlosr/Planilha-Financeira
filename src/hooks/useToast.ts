import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { ToastMessage, ToastType } from "@/components/Toast";

export function useToast() {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const addToast = useCallback((message: string, type: ToastType = "success") => {
        const id = uuidv4();
        setToasts((prev) => [...prev, { id, message, type }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const toast = {
        success: (message: string) => addToast(message, "success"),
        error: (message: string) => addToast(message, "error"),
        warning: (message: string) => addToast(message, "warning"),
    };

    return { toasts, toast, removeToast };
}
