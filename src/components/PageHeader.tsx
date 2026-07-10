interface PageHeaderProps {
    title: string;
    description?: string;
    /** Slot de ações: botões, toggles, export etc. */
    actions?: React.ReactNode;
    /** Conteúdo extra abaixo do título (ex: card de total do mês) */
    children?: React.ReactNode;
}

export default function PageHeader({ title, description, actions, children }: PageHeaderProps) {
    return (
        <header className="mb-6 md:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground">{title}</h1>
                    {description && (
                        <p className="text-muted mt-1 text-sm md:text-base">{description}</p>
                    )}
                </div>
                {actions && <div className="flex items-center gap-2 sm:gap-3">{actions}</div>}
            </div>
            {children}
        </header>
    );
}
