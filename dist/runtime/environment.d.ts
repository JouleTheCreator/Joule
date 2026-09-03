import { ValorTempoExecucao } from "./values";
export default class Ambiente {
    private variaveis;
    private pai?;
    constructor(pai?: Ambiente);
    declarar(nome: string, valor: ValorTempoExecucao): ValorTempoExecucao;
    atribuir(nome: string, valor: ValorTempoExecucao): ValorTempoExecucao;
    pesquisar(nome: string): ValorTempoExecucao;
    resolver(nome: string): Ambiente | undefined;
}
export declare function criarAmbienteGlobal(): Ambiente;
