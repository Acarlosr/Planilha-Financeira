export interface TesouroDireto {
    id: string;
    titulo: string; // Ex: "Tesouro Selic 2029"
    tipo: 'selic' | 'ipca' | 'pre';
    dataCompra: string; // ISO date
    vencimento: string; // ISO date
    valorAplicado: number;
    quantidade: number; // unidades do título
    taxa: string; // Ex: "Selic + 0%" | "IPCA + 6,2%" | "14,5% a.a."
    rendimentoAcumulado: number;
}

export interface Acao {
    id: string;
    ticker: string; // Ex: "ITSA4"
    empresa: string; // Ex: "Itaúsa"
    quantidade: number; // cotas atuais
    precoMedio: number; // R$ por cota
    valorAtual: number; // R$ total atual
    corretora?: string;
    dataCompra: string;
}

export interface FII {
    id: string;
    ticker: string; // Ex: "HGLG11"
    nome: string; // Ex: "CSHG Logística"
    setor: string; // Ex: "Logística" | "Papel" | "Shoppings"
    quantidade: number; // cotas
    precoMedio: number; // R$ por cota
    valorAtual: number; // R$ total
    dyAnual: number; // Dividend Yield % 12 meses
    cnpj?: string; // Ex: "11.222.333/0001-44"
}

export interface Dividendo {
    id: string;
    ticker: string;
    tipo: 'dividendo' | 'jcp' | 'rendimento_fii' | 'amortizacao';
    dataEx: string; // data com direito ao provento
    dataPagamento: string; // data do crédito na conta
    valorPorCota: number; // R$
    quantidadeNaData: number; // cotas que o usuário tinha na data ex
    valorTotal: number; // valorPorCota * quantidadeNaData
}

export interface RendaFixaPrivada {
    id: string;
    tipo: 'CDB' | 'LCI' | 'LCA';
    instituicao: string; // Ex: "XP Investimentos"
    indexador: 'CDI' | 'IPCA' | 'pre';
    taxa: string; // Ex: "110% CDI" | "IPCA + 4%" | "14,5% a.a."
    dataAplicacao: string;
    vencimento: string;
    valorAplicado: number;
    rendimentoAcumulado: number;
}
