// Motor de importação de extratos bancários (OFX e CSV).
// Funções puras — sem chamadas ao Supabase aqui, só parsing e regras de conversão.

export interface TransacaoImportada {
    data: string; // yyyy-mm-dd
    descricao: string;
    valor: number; // sempre positivo
    tipo: "receita" | "despesa";
}

export interface MapeamentoCSV {
    data: number;
    descricao: number;
    valor: number;
}

// =============================================
// OFX
// =============================================

/** Extrai todas as transações (<STMTTRN>...</STMTTRN>) de um arquivo OFX (1.x SGML ou 2.x XML). */
export function parseOFX(conteudo: string): TransacaoImportada[] {
    const blocos = conteudo.match(/<STMTTRN>[\s\S]*?<\/STMTTRN>/gi) ?? [];

    const extrairCampo = (bloco: string, tag: string): string | null => {
        const match = bloco.match(new RegExp(`<${tag}>([^\r\n<]+)`, "i"));
        return match ? match[1].trim() : null;
    };

    const transacoes: TransacaoImportada[] = [];

    for (const bloco of blocos) {
        const dtPosted = extrairCampo(bloco, "DTPOSTED");
        const trnAmt = extrairCampo(bloco, "TRNAMT");
        const memo = extrairCampo(bloco, "MEMO") ?? extrairCampo(bloco, "NAME");

        if (!dtPosted || !trnAmt) continue;

        const ano = dtPosted.slice(0, 4);
        const mes = dtPosted.slice(4, 6);
        const dia = dtPosted.slice(6, 8);
        if (!ano || !mes || !dia) continue;

        const valorBruto = parseFloat(trnAmt.replace(",", "."));
        if (isNaN(valorBruto)) continue;

        transacoes.push({
            data: `${ano}-${mes}-${dia}`,
            descricao: memo || "Transação importada",
            valor: Math.abs(valorBruto),
            tipo: valorBruto < 0 ? "despesa" : "receita",
        });
    }

    return transacoes;
}

// =============================================
// CSV
// =============================================

/** Conta ocorrências de cada delimitador candidato na linha de cabeçalho e escolhe o mais provável. */
export function detectarDelimitadorCSV(linhaCabecalho: string): string {
    const candidatos = [";", ",", "\t"];
    let melhor = ";";
    let maiorContagem = -1;
    for (const candidato of candidatos) {
        const contagem = linhaCabecalho.split(candidato).length - 1;
        if (contagem > maiorContagem) {
            maiorContagem = contagem;
            melhor = candidato;
        }
    }
    return melhor;
}

/** Faz o split de uma linha CSV respeitando campos entre aspas duplas. */
export function parseLinhaCSV(linha: string, delimitador: string): string[] {
    const campos: string[] = [];
    let atual = "";
    let dentroDeAspas = false;

    for (let i = 0; i < linha.length; i++) {
        const char = linha[i];
        if (char === '"') {
            if (dentroDeAspas && linha[i + 1] === '"') {
                atual += '"';
                i++;
            } else {
                dentroDeAspas = !dentroDeAspas;
            }
        } else if (char === delimitador && !dentroDeAspas) {
            campos.push(atual.trim());
            atual = "";
        } else {
            atual += char;
        }
    }
    campos.push(atual.trim());
    return campos;
}

/** Faz o parse bruto de um CSV (cabeçalho + linhas), sem interpretar o significado das colunas ainda. */
export function parseCSV(conteudo: string): { cabecalhos: string[]; linhas: string[][] } {
    const todasLinhas = conteudo
        .split(/\r\n|\r|\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

    if (todasLinhas.length === 0) return { cabecalhos: [], linhas: [] };

    const delimitador = detectarDelimitadorCSV(todasLinhas[0]);
    const cabecalhos = parseLinhaCSV(todasLinhas[0], delimitador);
    const linhas = todasLinhas.slice(1).map((l) => parseLinhaCSV(l, delimitador));

    return { cabecalhos, linhas };
}

/** Tenta adivinhar quais colunas são data, descrição e valor a partir dos nomes do cabeçalho. */
export function sugerirMapeamentoCSV(cabecalhos: string[]): MapeamentoCSV {
    const encontrar = (padrao: RegExp) => cabecalhos.findIndex((c) => padrao.test(c));

    return {
        data: encontrar(/data|date/i),
        descricao: encontrar(/descri|hist[oó]rico|memo|title|lan[cç]amento/i),
        valor: encontrar(/valor|amount|value/i),
    };
}

/** Converte "1.234,56", "1234,56", "1234.56" e "-45,90" para número. */
export function parseValorBR(bruto: string): number {
    let limpo = bruto.replace(/[R$\s]/g, "");
    const negativo = /^\(.*\)$/.test(limpo);
    limpo = limpo.replace(/[()]/g, "");

    const temVirgula = limpo.includes(",");
    const temPonto = limpo.includes(".");

    if (temVirgula && temPonto) {
        // Último separador é o decimal; o outro é milhar.
        if (limpo.lastIndexOf(",") > limpo.lastIndexOf(".")) {
            limpo = limpo.replace(/\./g, "").replace(",", ".");
        } else {
            limpo = limpo.replace(/,/g, "");
        }
    } else if (temVirgula) {
        limpo = limpo.replace(",", ".");
    }

    const valor = parseFloat(limpo);
    if (isNaN(valor)) return NaN;
    return negativo ? -Math.abs(valor) : valor;
}

/** Converte dd/mm/yyyy, dd-mm-yyyy ou yyyy-mm-dd para yyyy-mm-dd. */
export function parseDataParaISO(bruto: string): string | null {
    const limpo = bruto.trim();

    const isoMatch = limpo.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;

    const brMatch = limpo.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
    if (brMatch) {
        const dia = brMatch[1].padStart(2, "0");
        const mes = brMatch[2].padStart(2, "0");
        return `${brMatch[3]}-${mes}-${dia}`;
    }

    return null;
}

/** Converte as linhas brutas do CSV em transações, usando o mapeamento de colunas escolhido. */
export function converterLinhasCSV(linhas: string[][], mapeamento: MapeamentoCSV): TransacaoImportada[] {
    const transacoes: TransacaoImportada[] = [];

    for (const linha of linhas) {
        const dataBruta = linha[mapeamento.data];
        const descricaoBruta = linha[mapeamento.descricao];
        const valorBruto = linha[mapeamento.valor];
        if (!dataBruta || !valorBruto) continue;

        const data = parseDataParaISO(dataBruta);
        const valor = parseValorBR(valorBruto);
        if (!data || isNaN(valor) || valor === 0) continue;

        transacoes.push({
            data,
            descricao: descricaoBruta?.trim() || "Transação importada",
            valor: Math.abs(valor),
            tipo: valor < 0 ? "despesa" : "receita",
        });
    }

    return transacoes;
}

// =============================================
// DUPLICATAS
// =============================================

export interface LancamentoExistente {
    data: string;
    valor: number;
    descricao: string;
}

/** Marca como duplicata qualquer transação importada que já tenha um lançamento igual (mesma data + valor). */
export function marcarPossiveisDuplicatas<T extends TransacaoImportada>(
    importadas: T[],
    existentes: LancamentoExistente[]
): (T & { duplicada: boolean })[] {
    return importadas.map((t) => {
        const duplicada = existentes.some(
            (e) => e.data === t.data && Math.abs(e.valor - t.valor) < 0.005
        );
        return { ...t, duplicada };
    });
}
