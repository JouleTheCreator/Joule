export declare enum TipoToken {
    Numero = 0,
    Identificador = 1,
    Texto = 2,
    Seja = 3,
    Constante = 4,
    Funcao = 5,
    Se = 6,
    Senao = 7,
    MasSe = 8,
    Para = 9,
    Escolha = 10,
    Caso = 11,
    Padrao = 12,
    OperadorBinario = 13,
    Igual = 14,// =
    Virgula = 15,// ,
    DoisPontos = 16,// :
    PontoVirgula = 17,// ;
    Ponto = 18,// .
    AbreParentese = 19,// (
    FechaParentese = 20,// )
    AbreChave = 21,// {
    FechaChave = 22,// }
    AbreColchete = 23,// [
    FechaColchete = 24,// ]
    Maior = 25,// >
    Menor = 26,// <
    MaiorIgual = 27,// >=
    MenorIgual = 28,// <=
    ComparacaoIgual = 29,// ==
    ComparacaoDiferente = 30,// !=
    Exclamacao = 31,// !
    E = 32,// &&
    Comercial = 33,// &
    Ou = 34,// ||
    Barra = 35,// |
    Ternario = 36,// ->
    FimDoArquivo = 37,
    NovaLinha = 38
}
export interface Token {
    valor: string;
    tipo: TipoToken;
    bruto: string;
    toString: () => object;
}
export declare function tokenizar(codigoFonte: string): Token[];
