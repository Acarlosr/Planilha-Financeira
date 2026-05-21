export interface Transacao {
    id: number;
    descricao: string;
    valor: number;
    data: string;
    tipo: string;
    investimento?: string;
    meta?: string;
}

export const poupancaData = {
    evolucao: [
        { mes: "Jul", valor: 10200 },
        { mes: "Ago", valor: 10850 },
        { mes: "Set", valor: 11100 },
        { mes: "Out", valor: 11450 },
        { mes: "Nov", valor: 11900 },
        { mes: "Dez", valor: 12450 },
        { mes: "Jan", valor: 13100 },
    ],
    metas: [
        {
            id: "emergencia",
            nome: "Reserva de Emergência",
            valorAtual: 8500.0,
            valorMeta: 15000.0,
            cor: "from-red-500 to-red-400",
            icone: "🚨",
        },
        {
            id: "viagem",
            nome: "Viagem Europa",
            valorAtual: 3200.0,
            valorMeta: 12000.0,
            cor: "from-blue-500 to-blue-400",
            icone: "✈️",
        },
        {
            id: "carro",
            nome: "Carro Novo",
            valorAtual: 1400.0,
            valorMeta: 30000.0,
            cor: "from-purple-500 to-purple-400",
            icone: "🚗",
        },
    ],
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
    ],
    transacoes: [] as Transacao[]
};
