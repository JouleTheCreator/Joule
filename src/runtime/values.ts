// --- Linguagem Joule                                           ---
// -----------------------------------------------------------

export type TipoValor =
  | "nulo"
  | "numero"
  | "texto"
  | "booleano"
  | "objeto"
  | "vetor"
  | "nativo-fn"
  | "funcao"
  | "vazio";

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
  chamar: (
    argumentos: ValorTempoExecucao[],
    escopo: Ambiente,
  ) => ValorTempoExecucao;
}

export interface ValorObjeto extends ValorTempoExecucao {
  tipo: "objeto";
  valor: { [chave: string]: ValorTempoExecucao };
}

export interface ValorVetor extends ValorTempoExecucao {
  tipo: "vetor";
  valor: ValorTempoExecucao[];
}

import type Ambiente from "./environment";
import type { DeclaracaoFuncao } from "../frontend/ast";

export function VALOR_NULO(): ValorTempoExecucao {
  return { tipo: "nulo", valor: null };
}

export function VALOR_NUMERO(valor: number): ValorTempoExecucao {
  return { tipo: "numero", valor };
}

export function VALOR_TEXTO(valor: string): ValorTempoExecucao {
  return { tipo: "texto", valor };
}

export function VALOR_BOOLEANO(valor: boolean): ValorTempoExecucao {
  return { tipo: "booleano", valor };
}

export function VALOR_OBJETO(valor: {
  [chave: string]: ValorTempoExecucao;
}): ValorTempoExecucao {
  return { tipo: "objeto", valor };
}

export function VALOR_VETOR(valor: ValorTempoExecucao[]): ValorTempoExecucao {
  return { tipo: "vetor", valor };
}

export function VALOR_NATIVO_FN(
  nome: string,
  chamar: (
    argumentos: ValorTempoExecucao[],
    escopo: Ambiente,
  ) => ValorTempoExecucao,
): ValorNativoFn {
  return { tipo: "nativo-fn", valor: nome, chamar };
}

export function VALOR_FUNCAO(
  nome: string,
  corpo: DeclaracaoFuncao,
  escopoPai: Ambiente,
): ValorFuncao {
  return {
    tipo: "funcao",
    valor: nome,
    corpo,
    escopoPai,
  };
}

export function VALOR_VAZIO(): ValorTempoExecucao {
  return VALOR_NULO();
}
