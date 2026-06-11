export interface Transacao {
    id: number | string;
    descricao: string;
    valor: number;
    data: string;
    tipo: string;
    investimento?: string;
    meta?: string;
}

export interface MetaPoupanca {
    id: string;
    nome: string;
    valorAtual: number;
    valorMeta: number;
    cor: string;
    icone: string;
}

export const poupancaData = {
    evolucao: [
        { mes: "Jul", valor: 0 },
        { mes: "Ago", valor: 0 },
        { mes: "Set", valor: 0 },
        { mes: "Out", valor: 0 },
        { mes: "Nov", valor: 0 },
        { mes: "Dez", valor: 0 },
        { mes: "Jan", valor: 0 },
    ],
    metas: [] as MetaPoupanca[],
    transacoes: [] as Transacao[]
};

export const aplicacaoData = {
    rentabilidade: [
        { mes: "Jul", valor: 0 },
        { mes: "Ago", valor: 0 },
        { mes: "Set", valor: 0 },
        { mes: "Out", valor: 0 },
        { mes: "Nov", valor: 0 },
        { mes: "Dez", valor: 0 },
        { mes: "Jan", valor: 0 },
    ],
    tipos: [
        {
            id: "tesouro",
            nome: "Tesouro Direto",
            saldo: 0,
            rentabilidade: 0,
            cor: "from-blue-500 to-blue-400",
            icone: "🏛️",
        },
        {
            id: "acoes",
            nome: "Ações",
            saldo: 0,
            rentabilidade: 0,
            cor: "from-green-500 to-green-400",
            icone: "📈",
        },
        {
            id: "fiis",
            nome: "Fundos Imobiliários",
            saldo: 0,
            rentabilidade: 0,
            cor: "from-purple-500 to-purple-400",
            icone: "🏢",
        },
        {
            id: "cdb",
            nome: "CDB/LCI/LCA",
            saldo: 0,
            rentabilidade: 0,
            cor: "from-amber-500 to-amber-400",
            icone: "💰",
        },
        {
            id: "poupanca",
            nome: "Poupança",
            saldo: 0,
            rentabilidade: 0,
            cor: "from-emerald-500 to-emerald-400",
            icone: "🐷",
        },
        {
            id: "outros",
            nome: "Outros",
            saldo: 0,
            rentabilidade: 0,
            cor: "from-slate-500 to-slate-400",
            icone: "📦",
        },
    ],
    transacoes: [] as Transacao[]
};
