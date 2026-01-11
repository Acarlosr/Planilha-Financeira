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
