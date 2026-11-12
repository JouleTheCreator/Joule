import * as ast from "./ast";
export default class AnalisadorSintatico {
    private tokens;
    /**
     * Produz uma AST a partir de código-fonte.
     */
    produzirAST(codigoFonte: string): ast.Programa;
    private naoNoFimDoArquivo;
    private obterProximoToken;
    private avancar;
    private avancarSe;
    private analisarExpressao;
    private analisarAtribuicao;
    private analisarLogicoOU;
    private analisarLogicoE;
    private analisarComparacao;
    private analisarAditiva;
    private analisarMultiplicativa;
    private analisarUnaria;
    private analisarChamada;
    private analisarExpressaoPrimaria;
    private analisarExpressoesAdicionais;
    private analisarCorpo;
    private analisarDeclaracaoVariavel;
    private analisarDeclaracaoFuncao;
    private analisarDeclaracaoSe;
    private analisarSeInterno;
    private analisarDeclaracaoEscolha;
    private analisarDeclaracaoTentarPegar;
    private analisarDeclaracaoPara;
    analisarDeclaracao(): ast.Declaracao;
}
