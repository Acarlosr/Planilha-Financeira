import { TesouroDireto, Acao, FII, Dividendo, RendaFixaPrivada } from '../types/aplicacoes';

export const mockTesouroDireto: TesouroDireto[] = [
    {
        id: 'td-1',
        titulo: 'Tesouro Selic 2029',
        tipo: 'selic',
        dataCompra: '2026-01-05',
        vencimento: '2029-03-01',
        valorAplicado: 8000,
        quantidade: 0.5,
        taxa: 'Selic + 0%',
        rendimentoAcumulado: 320,
    },
    {
        id: 'td-2',
        titulo: 'Tesouro IPCA+ 2035',
        tipo: 'ipca',
        dataCompra: '2025-12-20',
        vencimento: '2035-05-15',
        valorAplicado: 7500,
        quantidade: 2.5,
        taxa: 'IPCA + 6,2%',
        rendimentoAcumulado: 180,
    },
    {
        id: 'td-3',
        titulo: 'Tesouro Prefixado 2027',
        tipo: 'pre',
        dataCompra: '2025-11-10',
        vencimento: '2027-01-01',
        valorAplicado: 3000,
        quantidade: 3,
        taxa: '14,5% a.a.',
        rendimentoAcumulado: 95,
    }
];

export const mockAcoes: Acao[] = [
    {
        id: 'ac-1',
        ticker: 'ITSA4',
        empresa: 'Itaúsa',
        quantidade: 100,
        precoMedio: 8.50,
        valorAtual: 920,
        corretora: 'XP Investimentos',
        dataCompra: '2025-06-15'
    },
    {
        id: 'ac-2',
        ticker: 'PETR4',
        empresa: 'Petrobras',
        quantidade: 50,
        precoMedio: 24.00,
        valorAtual: 1925,
        corretora: 'NuInvest',
        dataCompra: '2025-03-20'
    },
    {
        id: 'ac-3',
        ticker: 'WEGE3',
        empresa: 'WEG',
        quantidade: 30,
        precoMedio: 32.50,
        valorAtual: 1110,
        corretora: 'XP Investimentos',
        dataCompra: '2025-08-05'
    }
];

export const mockFIIs: FII[] = [
    {
        id: 'fii-1',
        ticker: 'HGLG11',
        nome: 'CSHG Logística',
        setor: 'Logística',
        quantidade: 5,
        precoMedio: 100.00,
        valorAtual: 812.50,
        dyAnual: 8.4
    },
    {
        id: 'fii-2',
        ticker: 'MXRF11',
        nome: 'Maxi Renda',
        setor: 'Papel',
        quantidade: 60,
        precoMedio: 10.00,
        valorAtual: 645.00,
        dyAnual: 11.2
    },
    {
        id: 'fii-3',
        ticker: 'VISC11',
        nome: 'Vinci Shopping Centers',
        setor: 'Shoppings',
        quantidade: 10,
        precoMedio: 115.50,
        valorAtual: 1180.00,
        dyAnual: 8.9
    }
];

export const mockDividendos: Dividendo[] = [
    {
        id: 'div-1',
        ticker: 'ITSA4',
        tipo: 'dividendo',
        dataEx: '2026-01-02',
        dataPagamento: '2026-01-15',
        valorPorCota: 0.42,
        quantidadeNaData: 100,
        valorTotal: 42.00
    },
    {
        id: 'div-2',
        ticker: 'PETR4',
        tipo: 'jcp',
        dataEx: '2025-12-25',
        dataPagamento: '2026-01-20',
        valorPorCota: 1.20,
        quantidadeNaData: 50,
        valorTotal: 60.00
    },
    {
        id: 'div-3',
        ticker: 'HGLG11',
        tipo: 'rendimento_fii',
        dataEx: '2025-12-30',
        dataPagamento: '2026-01-10',
        valorPorCota: 1.28,
        quantidadeNaData: 5,
        valorTotal: 6.40
    },
    {
        id: 'div-4',
        ticker: 'MXRF11',
        tipo: 'rendimento_fii',
        dataEx: '2025-12-30',
        dataPagamento: '2026-01-12',
        valorPorCota: 0.095,
        quantidadeNaData: 60,
        valorTotal: 5.70
    }
];

export const mockRendaFixaPrivada: RendaFixaPrivada[] = [
    {
        id: 'rf-1',
        tipo: 'CDB',
        instituicao: 'XP Investimentos',
        indexador: 'CDI',
        taxa: '110% CDI',
        dataAplicacao: '2025-10-01',
        vencimento: '2026-10-01',
        valorAplicado: 2000,
        rendimentoAcumulado: 87.00
    },
    {
        id: 'rf-2',
        tipo: 'LCI',
        instituicao: 'BTG Pactual',
        indexador: 'CDI',
        taxa: '95% CDI',
        dataAplicacao: '2025-11-05',
        vencimento: '2026-05-05',
        valorAplicado: 1200,
        rendimentoAcumulado: 38.00
    },
    {
        id: 'rf-3',
        tipo: 'LCA',
        instituicao: 'Banco Inter',
        indexador: 'IPCA',
        taxa: 'IPCA + 5%',
        dataAplicacao: '2025-12-01',
        vencimento: '2026-12-01',
        valorAplicado: 5000,
        rendimentoAcumulado: 45.00
    }
];
