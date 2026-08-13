// Extração de texto de PDF no navegador (usado só pela página de import de nota de corretagem).
// Roda inteiramente no cliente — o PDF não sobe pra nenhum servidor.

/** Extrai e concatena o texto de todas as páginas de um PDF. */
export async function extrairTextoPDF(file: File): Promise<string> {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url
    ).toString();

    const buffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;

    let textoCompleto = "";
    for (let i = 1; i <= pdf.numPages; i++) {
        const pagina = await pdf.getPage(i);
        const conteudo = await pagina.getTextContent();
        const textoPagina = conteudo.items
            .map((item) => ("str" in item ? item.str : ""))
            .join(" ");
        textoCompleto += textoPagina + "\n";
    }

    return textoCompleto;
}
