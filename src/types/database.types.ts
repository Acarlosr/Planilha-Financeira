export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            categorias_receita: {
                Row: {
                    id: string
                    nome: string
                    icone: string
                    cor: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    nome: string
                    icone: string
                    cor: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    nome?: string
                    icone?: string
                    cor?: string
                    created_at?: string
                }
            }
            categorias_despesa: {
                Row: {
                    id: string
                    nome: string
                    icone: string
                    cor: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    nome: string
                    icone: string
                    cor: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    nome?: string
                    icone?: string
                    cor?: string
                    created_at?: string
                }
            }
            tipos_investimento: {
                Row: {
                    id: string
                    nome: string
                    icone: string
                    cor: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    nome: string
                    icone: string
                    cor: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    nome?: string
                    icone?: string
                    cor?: string
                    created_at?: string
                }
            }
            receitas: {
                Row: {
                    id: string
                    user_id: string
                    descricao: string
                    valor: number
                    data: string
                    categoria_id: string
                    conta_id: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    descricao: string
                    valor: number
                    data: string
                    categoria_id: string
                    conta_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    descricao?: string
                    valor?: number
                    data?: string
                    categoria_id?: string
                    conta_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            despesas: {
                Row: {
                    id: string
                    user_id: string
                    descricao: string
                    valor: number
                    data: string
                    categoria_id: string
                    cartao_id: string | null
                    conta_id: string | null
                    boleto: boolean | null
                    data_vencimento: string | null
                    parcelada: boolean
                    parcela_atual: number | null
                    parcela_total: number | null
                    parcela_grupo_id: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    descricao: string
                    valor: number
                    data: string
                    categoria_id: string
                    cartao_id?: string | null
                    conta_id?: string | null
                    boleto?: boolean | null
                    data_vencimento?: string | null
                    parcelada?: boolean
                    parcela_atual?: number | null
                    parcela_total?: number | null
                    parcela_grupo_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    descricao?: string
                    valor?: number
                    data?: string
                    categoria_id?: string
                    cartao_id?: string | null
                    conta_id?: string | null
                    boleto?: boolean | null
                    data_vencimento?: string | null
                    parcelada?: boolean
                    parcela_atual?: number | null
                    parcela_total?: number | null
                    parcela_grupo_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            aplicacoes: {
                Row: {
                    id: string
                    user_id: string
                    descricao: string
                    valor: number
                    data: string
                    tipo_investimento_id: string
                    tipo_transacao: 'aporte' | 'resgate'
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    descricao: string
                    valor: number
                    data: string
                    tipo_investimento_id: string
                    tipo_transacao: 'aporte' | 'resgate'
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    descricao?: string
                    valor?: number
                    data?: string
                    tipo_investimento_id?: string
                    tipo_transacao?: 'aporte' | 'resgate'
                    created_at?: string
                    updated_at?: string
                }
            }
            poupanca: {
                Row: {
                    id: string
                    user_id: string
                    descricao: string
                    valor: number
                    data: string
                    meta_id: string | null
                    tipo_transacao: 'deposito' | 'retirada'
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    descricao: string
                    valor: number
                    data: string
                    meta_id?: string | null
                    tipo_transacao: 'deposito' | 'retirada'
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    descricao?: string
                    valor?: number
                    data?: string
                    meta_id?: string | null
                    tipo_transacao?: 'deposito' | 'retirada'
                    created_at?: string
                    updated_at?: string
                }
            }
            metas_poupanca: {
                Row: {
                    id: string
                    user_id: string
                    nome: string
                    valor_meta: number
                    valor_atual: number
                    icone: string
                    cor: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    nome: string
                    valor_meta: number
                    valor_atual?: number
                    icone: string
                    cor: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    nome?: string
                    valor_meta?: number
                    valor_atual?: number
                    icone?: string
                    cor?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            cartoes: {
                Row: {
                    id: string
                    user_id: string
                    nome: string
                    banco: string
                    bandeira: 'Visa' | 'Mastercard' | 'Amex' | 'Elo'
                    ultimos_digitos: string | null
                    cor: string
                    limite: number | null
                    dia_fechamento: number | null
                    dia_vencimento: number | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    nome: string
                    banco: string
                    bandeira: 'Visa' | 'Mastercard' | 'Amex' | 'Elo'
                    ultimos_digitos?: string | null
                    cor: string
                    limite?: number | null
                    dia_fechamento?: number | null
                    dia_vencimento?: number | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    nome?: string
                    banco?: string
                    bandeira?: 'Visa' | 'Mastercard' | 'Amex' | 'Elo'
                    ultimos_digitos?: string | null
                    cor?: string
                    limite?: number | null
                    dia_fechamento?: number | null
                    dia_vencimento?: number | null
                    created_at?: string
                    updated_at?: string
                }
            }
            posicoes_acoes: {
                Row: {
                    id: string
                    user_id: string
                    ticker: string
                    empresa: string
                    quantidade: number
                    preco_medio: number
                    valor_atual: number
                    corretora: string | null
                    data_compra: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    ticker: string
                    empresa: string
                    quantidade: number
                    preco_medio: number
                    valor_atual?: number
                    corretora?: string | null
                    data_compra: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    ticker?: string
                    empresa?: string
                    quantidade?: number
                    preco_medio?: number
                    valor_atual?: number
                    corretora?: string | null
                    data_compra?: string
                    created_at?: string
                    updated_at?: string
                }
            }
            posicoes_fiis: {
                Row: {
                    id: string
                    user_id: string
                    ticker: string
                    nome: string
                    setor: string
                    quantidade: number
                    preco_medio: number
                    valor_atual: number
                    dy_anual: number
                    cnpj: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    ticker: string
                    nome: string
                    setor: string
                    quantidade: number
                    preco_medio: number
                    valor_atual?: number
                    dy_anual?: number
                    cnpj?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    ticker?: string
                    nome?: string
                    setor?: string
                    quantidade?: number
                    preco_medio?: number
                    valor_atual?: number
                    dy_anual?: number
                    cnpj?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            titulos_tesouro: {
                Row: {
                    id: string
                    user_id: string
                    titulo: string
                    tipo: 'selic' | 'ipca' | 'pre'
                    data_compra: string
                    vencimento: string
                    valor_aplicado: number
                    quantidade: number
                    taxa: string
                    rendimento_acumulado: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    titulo: string
                    tipo: 'selic' | 'ipca' | 'pre'
                    data_compra: string
                    vencimento: string
                    valor_aplicado: number
                    quantidade: number
                    taxa: string
                    rendimento_acumulado?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    titulo?: string
                    tipo?: 'selic' | 'ipca' | 'pre'
                    data_compra?: string
                    vencimento?: string
                    valor_aplicado?: number
                    quantidade?: number
                    taxa?: string
                    rendimento_acumulado?: number
                    created_at?: string
                    updated_at?: string
                }
            }
            titulos_renda_fixa: {
                Row: {
                    id: string
                    user_id: string
                    tipo: 'CDB' | 'LCI' | 'LCA'
                    instituicao: string
                    indexador: 'CDI' | 'IPCA' | 'pre'
                    taxa: string
                    data_aplicacao: string
                    vencimento: string
                    valor_aplicado: number
                    rendimento_acumulado: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    tipo: 'CDB' | 'LCI' | 'LCA'
                    instituicao: string
                    indexador: 'CDI' | 'IPCA' | 'pre'
                    taxa: string
                    data_aplicacao: string
                    vencimento: string
                    valor_aplicado: number
                    rendimento_acumulado?: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    tipo?: 'CDB' | 'LCI' | 'LCA'
                    instituicao?: string
                    indexador?: 'CDI' | 'IPCA' | 'pre'
                    taxa?: string
                    data_aplicacao?: string
                    vencimento?: string
                    valor_aplicado?: number
                    rendimento_acumulado?: number
                    created_at?: string
                    updated_at?: string
                }
            }
            proventos: {
                Row: {
                    id: string
                    user_id: string
                    ticker: string
                    tipo: 'dividendo' | 'jcp' | 'rendimento_fii' | 'amortizacao'
                    data_ex: string
                    data_pagamento: string
                    valor_por_cota: number
                    quantidade_na_data: number
                    valor_total: number
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    ticker: string
                    tipo: 'dividendo' | 'jcp' | 'rendimento_fii' | 'amortizacao'
                    data_ex: string
                    data_pagamento: string
                    valor_por_cota: number
                    quantidade_na_data: number
                    valor_total: number
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    ticker?: string
                    tipo?: 'dividendo' | 'jcp' | 'rendimento_fii' | 'amortizacao'
                    data_ex?: string
                    data_pagamento?: string
                    valor_por_cota?: number
                    quantidade_na_data?: number
                    valor_total?: number
                    created_at?: string
                    updated_at?: string
                }
            }
            contas: {
                Row: {
                    id: string
                    user_id: string
                    nome: string
                    instituicao: string | null
                    tipo: 'corrente' | 'poupanca' | 'carteira' | 'investimento' | 'outro'
                    cor: string
                    icone: string
                    saldo_inicial: number
                    ativa: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    nome: string
                    instituicao?: string | null
                    tipo?: 'corrente' | 'poupanca' | 'carteira' | 'investimento' | 'outro'
                    cor?: string
                    icone?: string
                    saldo_inicial?: number
                    ativa?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    nome?: string
                    instituicao?: string | null
                    tipo?: 'corrente' | 'poupanca' | 'carteira' | 'investimento' | 'outro'
                    cor?: string
                    icone?: string
                    saldo_inicial?: number
                    ativa?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            vendas_ativos: {
                Row: {
                    id: string
                    user_id: string
                    classe: 'acao' | 'fii'
                    ticker: string
                    modalidade: 'swing_trade' | 'day_trade'
                    quantidade: number
                    preco_venda: number
                    preco_custo: number
                    taxas: number
                    valor_venda: number
                    valor_custo: number
                    resultado: number
                    data_venda: string
                    posicao_id: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    classe: 'acao' | 'fii'
                    ticker: string
                    modalidade?: 'swing_trade' | 'day_trade'
                    quantidade: number
                    preco_venda: number
                    preco_custo: number
                    taxas?: number
                    valor_venda: number
                    valor_custo: number
                    resultado: number
                    data_venda: string
                    posicao_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    classe?: 'acao' | 'fii'
                    ticker?: string
                    modalidade?: 'swing_trade' | 'day_trade'
                    quantidade?: number
                    preco_venda?: number
                    preco_custo?: number
                    taxas?: number
                    valor_venda?: number
                    valor_custo?: number
                    resultado?: number
                    data_venda?: string
                    posicao_id?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}
