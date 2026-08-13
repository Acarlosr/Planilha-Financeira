"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    loading?: boolean;
}

const VARIANT_CLASS: Record<ButtonVariant, string> = {
    primary: "btn-primary",
    secondary: "btn-secondary-glass",
    danger: "btn-danger-glass",
    ghost: "btn-ghost-glass",
};

/**
 * Botão reutilizável. `primary` reaproveita a classe `.btn-primary` que já
 * existe em globals.css; `secondary`/`danger`/`ghost` usam os mesmos tokens
 * de cor (`--card-bg`, `--card-border`, `--danger`) que hoje são repetidos
 * como `style={{...}}` inline em dezenas de botões pelo app.
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant = "primary", loading = false, disabled, className = "", children, ...rest }, ref) => {
        return (
            <button
                ref={ref}
                disabled={disabled || loading}
                className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${VARIANT_CLASS[variant]} ${className}`}
                {...rest}
            >
                {loading ? (
                    <>
                        <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" aria-hidden="true" />
                        <span>Processando...</span>
                    </>
                ) : (
                    children
                )}
            </button>
        );
    }
);

Button.displayName = "Button";

export default Button;
