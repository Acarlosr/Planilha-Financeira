"use client";

import { Printer, Download } from "lucide-react";

interface PrintExportButtonsProps {
    title: string;
    period?: string;
}

export default function PrintExportButtons({ title, period }: PrintExportButtonsProps) {
    const applyPrintPagination = (root: ParentNode = document) => {
        const rows = Array.from(root.querySelectorAll('tbody tr, [data-print-row="true"]'));
        rows.forEach((row, index) => {
            row.classList.remove("print-page-break");
            if (index > 0 && index % 48 === 0) {
                row.classList.add("print-page-break");
            }
        });
    };

    const clearPrintPagination = () => {
        document.querySelectorAll(".print-page-break").forEach((row) => {
            row.classList.remove("print-page-break");
        });
    };

    const handlePrint = () => {
        applyPrintPagination();
        document.body.classList.add('printing');
        window.print();
        setTimeout(() => {
            document.body.classList.remove('printing');
            clearPrintPagination();
        }, 100);
    };

    const handleExportPDF = async () => {
        // Usar html2canvas e jspdf se disponíveis, senão usar print como fallback
        try {
            // Tenta usar a API nativa do navegador para salvar como PDF
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                const content = document.querySelector('main')?.innerHTML || '';

                printWindow.document.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>${title}${period ? ` - ${period}` : ''}</title>
                        <style>
                            * { margin: 0; padding: 0; box-sizing: border-box; }
                            @page { size: A4 portrait; margin: 10mm; }
                            body { 
                                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                padding: 0;
                                background: white;
                                color: #1f2937;
                            }
                            h1, h2, h3 { color: #111827; margin-bottom: 16px; }
                            .header-print { 
                                text-align: center; 
                                margin-bottom: 30px; 
                                padding-bottom: 20px;
                                border-bottom: 2px solid #e5e7eb;
                            }
                            .header-print h1 { font-size: 24px; }
                            .header-print p { color: #6b7280; font-size: 14px; }
                            table { width: 100%; border-collapse: collapse; margin: 14px 0; page-break-inside: auto; }
                            thead { display: table-header-group; }
                            tfoot { display: table-footer-group; }
                            tr { page-break-inside: avoid; break-inside: avoid; }
                            th, td { padding: 7px 8px; text-align: left; border-bottom: 1px solid #e5e7eb; font-size: 10px; line-height: 1.25; }
                            th { background: #f9fafb; font-weight: 600; }
                            [data-print-hide="true"] { display: none !important; }
                            [data-print-only="true"] { display: block !important; }
                            [data-print-row="true"] { page-break-inside: avoid; break-inside: avoid; min-height: 16px; padding: 5px 8px !important; border-bottom: 1px solid #e5e7eb; }
                            .print-page-break { break-before: page; page-break-before: always; }
                            .glass-card, .soft-card { box-shadow: none !important; border: 1px solid #e5e7eb !important; background: white !important; }
                            .value-positive { color: #059669; font-weight: bold; }
                            .value-negative { color: #dc2626; font-weight: bold; }
                            .total { font-size: 18px; font-weight: bold; margin-top: 20px; }
                            @media print {
                                body { padding: 0; }
                            }
                        </style>
                    </head>
                    <body>
                        <div class="header-print">
                            <h1>FinançasPro - ${title}</h1>
                            ${period ? `<p>Período: ${period}</p>` : ''}
                            <p>Gerado em: ${new Date().toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })}</p>
                        </div>
                        <div id="content">
                            ${content}
                        </div>
                        <script>
                            // Limpa elementos desnecessários
                            document.querySelectorAll('button, .no-print, nav, header').forEach(el => el.remove());
                            document.querySelectorAll('[data-print-hide="true"]').forEach(el => el.remove());
                            document.querySelectorAll('[data-print-only="true"]').forEach(el => {
                                el.style.display = 'block';
                            });
                            const rows = Array.from(document.querySelectorAll('tbody tr, [data-print-row="true"]'));
                            rows.forEach((row, index) => {
                                if (index > 0 && index % 48 === 0) row.classList.add('print-page-break');
                            });
                            // Ajusta cores para impressão
                            document.querySelectorAll('[class*="text-emerald"]').forEach(el => {
                                el.style.color = '#059669';
                            });
                            document.querySelectorAll('[class*="text-red"]').forEach(el => {
                                el.style.color = '#dc2626';
                            });
                            document.querySelectorAll('[class*="text-foreground"]').forEach(el => {
                                el.style.color = '#1f2937';
                            });
                            document.querySelectorAll('[class*="text-gray"]').forEach(el => {
                                el.style.color = '#6b7280';
                            });
                            document.querySelectorAll('[class*="bg-"]').forEach(el => {
                                el.style.background = 'transparent';
                            });
                            // Imprime automaticamente
                            setTimeout(() => {
                                window.print();
                            }, 500);
                        <\/script>
                    </body>
                    </html>
                `);
                printWindow.document.close();
            }
        } catch (error) {
            console.error("Error exporting PDF:", error);
            // Fallback: usar print normal
            handlePrint();
        }
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-muted hover:text-foreground border transition-all"
                style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}
                title="Imprimir"
            >
                <Printer size={18} />
                <span className="hidden sm:inline text-sm font-medium">Imprimir</span>
            </button>
            <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-muted hover:text-foreground border transition-all"
                style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}
                title="Salvar PDF"
            >
                <Download size={18} />
                <span className="hidden sm:inline text-sm font-medium">PDF</span>
            </button>
        </div>
    );
}
