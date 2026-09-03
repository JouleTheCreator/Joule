export declare enum TipoToken {
    Numero = 0,
    Identificador = 1,
    Texto = 2,
    Seja = 3,
    Constante = 4,
    Funcao = 5,
    Se = 6,
    Senao = 7,
    SenaoSe = 8,
    Para = 9,
    OperadorBinario = 10,
    Igual = 11,// =
    Virgula = 12,// ,
    DoisPontos = 13,// :
    PontoVirgula = 14,// ;
    Ponto = 15,// .
    AbreParentese = 16,// (
    FechaParentese = 17,// )
    AbreChave = 18,// {
    FechaChave = 19,// }
    AbreColchete = 20,// [
    FechaColchete = 21,// ]
    Maior = 22,// >
    Menor = 23,// <
    MaiorIgual = 24,// >=
    MenorIgual = 25,// <=
    ComparacaoIgual = 26,// ==
    ComparacaoDiferente = 27,// !=
    Exclamacao = 28,// !
    E = 29,// &&
    Comercial = 30,// &
    Ou = 31,// ||
    Barra = 32,// |
    Ternario = 33,// ->
    FimDoArquivo = 34,
    NovaLinha = 35
}
export interface Token {
    valor: string;
    tipo: TipoToken;
    bruto: string;
    toString: () => object;
}
export declare function tokenizar(codigoFonte: string): Token[];
