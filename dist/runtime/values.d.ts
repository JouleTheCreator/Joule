export type TipoValor = "nulo" | "numero" | "texto" | "booleano" | "objeto" | "vetor" | "nativo-fn" | "funcao" | "vazio";
/**
 * Representa um valor em tempo de execução na linguagem.
 * Tipo distingue os vários tipos de valores.
 */
export interface ValorTempoExecucao {
    tipo: TipoValor;
    valor: any;
}
export interface ValorFuncao extends ValorTempoExecucao {
    tipo: "funcao";
    valor: string;
    corpo: DeclaracaoFuncao;
    escopoPai: Ambiente;
}
export interface ValorNativoFn extends ValorTempoExecucao {
    tipo: "nativo-fn";
    valor: string;
    chamar: (argumentos: ValorTempoExecucao[], escopo: Ambiente) => ValorTempoExecucao;
}
export interface ValorObjeto extends ValorTempoExecucao {
    tipo: "objeto";
    valor: {
        [chave: string]: ValorTempoExecucao;
    };
}
export interface ValorVetor extends ValorTempoExecucao {
    tipo: "vetor";
    valor: ValorTempoExecucao[];
}
import type Ambiente from "./environment";
import type { DeclaracaoFuncao } from "../frontend/ast";
export declare function VALOR_NULO(): ValorTempoExecucao;
export declare function VALOR_NUMERO(valor: number): ValorTempoExecucao;
export declare function VALOR_TEXTO(valor: string): ValorTempoExecucao;
export declare function VALOR_BOOLEANO(valor: boolean): ValorTempoExecucao;
export declare function VALOR_OBJETO(valor: {
    [chave: string]: ValorTempoExecucao;
}): ValorTempoExecucao;
export declare function VALOR_VETOR(valor: ValorTempoExecucao[]): ValorTempoExecucao;
export declare function VALOR_NATIVO_FN(nome: string, chamar: (argumentos: ValorTempoExecucao[], escopo: Ambiente) => ValorTempoExecucao): ValorNativoFn;
export declare function VALOR_FUNCAO(nome: string, corpo: DeclaracaoFuncao, escopoPai: Ambiente): ValorFuncao;
export declare function VALOR_VAZIO(): ValorTempoExecucao;
