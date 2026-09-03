"use strict";
// Linguagem Joule - Analisador Sintático
// Responsável por produzir a AST a partir de fluxo de tokens
Object.defineProperty(exports, "__esModule", { value: true });
const lexer_1 = require("./lexer");
class AnalisadorSintatico {
    constructor() {
        this.tokens = [];
    }
    /**
     * Produz uma AST a partir de código-fonte.
     */
    produzirAST(codigoFonte) {
        const tokens = (0, lexer_1.tokenizar)(codigoFonte);
        this.tokens = tokens.filter((t) => t.tipo !== lexer_1.TipoToken.NovaLinha);
        const corpo = [];
        while (this.naoNoFimDoArquivo() &&
            this.tokens[0]?.tipo !== lexer_1.TipoToken.FimDoArquivo) {
            corpo.push(this.analisarDeclaracao());
        }
        return {
            tipo: "Programa",
            corpo,
        };
    }
    naoNoFimDoArquivo() {
        return this.tokens[0].tipo != lexer_1.TipoToken.FimDoArquivo;
    }
    obterProximoToken() {
        const token = this.tokens[0];
        this.tokens = this.tokens.slice(1);
        return token;
    }
    avancar(tipo, mensagemErro, valor) {
        const tokenAnterior = this.tokens[0];
        if (!tokenAnterior || tokenAnterior.tipo !== tipo) {
            console.error(mensagemErro, this.tokens[0]);
            process.exit(1);
        }
        if (valor) {
            if (tokenAnterior.valor !== valor) {
                console.error(mensagemErro, this.tokens[0]);
                process.exit(1);
            }
        }
        this.obterProximoToken();
        return tokenAnterior;
    }
    avancarSe(tipo, valor) {
        const tokenAnterior = this.tokens[0];
        if (!tokenAnterior || tokenAnterior.tipo !== tipo)
            return false;
        if (valor) {
            if (tokenAnterior.valor !== valor)
                return false;
        }
        this.obterProximoToken();
        return true;
    }
    // ============================================
    // CADEIA DE EXPRESSÕES (precedência crescente)
    // ============================================
    // analisarExpressao
    //   → analisarAtribuicao
    //     → analisarLogicoOU  (||)
    //       → analisarLogicoE  (&&)
    //         → analisarComparacao  (== != < > <= >=)
    //           → analisarAditiva  (+ -)
    //             → analisarMultiplicativa  (* / %)
    //               → analisarChamada  (. [] ())
    //                 → analisarExpressaoPrimaria
    analisarExpressao() {
        return this.analisarAtribuicao();
    }
    analisarAtribuicao() {
        const esquerda = this.analisarLogicoOU();
        if (this.avancarSe(lexer_1.TipoToken.Igual)) {
            if (esquerda.tipo !== "Identificador" &&
                esquerda.tipo !== "ExpressaoMembro") {
                console.error("Lado esquerdo da atribuição inválido: ", esquerda);
                process.exit(1);
            }
            return {
                tipo: "ExpressaoAtribuicao",
                atribuido: esquerda,
                valor: this.analisarExpressao(),
            };
        }
        return esquerda;
    }
    analisarLogicoOU() {
        let esquerda = this.analisarLogicoE();
        while (this.tokens[0]?.tipo === lexer_1.TipoToken.Ou) {
            this.obterProximoToken();
            const direita = this.analisarLogicoE();
            esquerda = {
                tipo: "ExpressaoBinaria",
                esquerda,
                direita,
                operador: "||",
            };
        }
        return esquerda;
    }
    analisarLogicoE() {
        let esquerda = this.analisarComparacao();
        while (this.tokens[0]?.tipo === lexer_1.TipoToken.E) {
            this.obterProximoToken();
            const direita = this.analisarComparacao();
            esquerda = {
                tipo: "ExpressaoBinaria",
                esquerda,
                direita,
                operador: "&&",
            };
        }
        return esquerda;
    }
    analisarComparacao() {
        let esquerda = this.analisarAditiva();
        while (true) {
            const tk = this.tokens[0];
            if (!tk)
                break;
            if (tk.tipo === lexer_1.TipoToken.ComparacaoIgual ||
                tk.tipo === lexer_1.TipoToken.ComparacaoDiferente ||
                tk.tipo === lexer_1.TipoToken.Menor ||
                tk.tipo === lexer_1.TipoToken.Maior ||
                tk.tipo === lexer_1.TipoToken.MenorIgual ||
                tk.tipo === lexer_1.TipoToken.MaiorIgual) {
                const operador = this.obterProximoToken().valor;
                const direita = this.analisarAditiva();
                esquerda = {
                    tipo: "ExpressaoBinaria",
                    esquerda,
                    direita,
                    operador,
                };
            }
            else {
                break;
            }
        }
        return esquerda;
    }
    analisarAditiva() {
        let esquerda = this.analisarMultiplicativa();
        while (true) {
            const tk = this.tokens[0];
            if (!tk)
                break;
            if (tk.tipo === lexer_1.TipoToken.OperadorBinario &&
                (tk.valor === "+" || tk.valor === "-")) {
                const operador = this.obterProximoToken().valor;
                const direita = this.analisarMultiplicativa();
                esquerda = {
                    tipo: "ExpressaoBinaria",
                    esquerda,
                    direita,
                    operador,
                };
            }
            else {
                break;
            }
        }
        return esquerda;
    }
    analisarMultiplicativa() {
        let esquerda = this.analisarUnaria();
        while (true) {
            const tk = this.tokens[0];
            if (!tk)
                break;
            if (tk.tipo === lexer_1.TipoToken.OperadorBinario &&
                (tk.valor === "*" || tk.valor === "/" || tk.valor === "%")) {
                const operador = this.obterProximoToken().valor;
                const direita = this.analisarChamada();
                esquerda = {
                    tipo: "ExpressaoBinaria",
                    esquerda,
                    direita,
                    operador,
                };
            }
            else {
                break;
            }
        }
        return esquerda;
    }
    analisarUnaria() {
        if (this.tokens[0]?.tipo === lexer_1.TipoToken.Exclamacao) {
            this.obterProximoToken(); // !
            const operando = this.analisarUnaria();
            return {
                tipo: "ExpressaoUnaria",
                operador: "!",
                operando,
            };
        }
        if (this.tokens[0]?.tipo === lexer_1.TipoToken.OperadorBinario &&
            this.tokens[0]?.valor === "-") {
            this.obterProximoToken(); // -
            const operando = this.analisarUnaria();
            return {
                tipo: "ExpressaoUnaria",
                operador: "-",
                operando,
            };
        }
        return this.analisarChamada();
    }
    analisarChamada() {
        return this.analisarExpressoesAdicionais(this.analisarExpressaoPrimaria());
    }
    analisarExpressaoPrimaria() {
        switch (this.tokens[0]?.tipo) {
            case lexer_1.TipoToken.Identificador:
                const idToken = this.obterProximoToken();
                if (idToken.valor === "verdadeiro") {
                    return {
                        tipo: "LiteralBooleano",
                        valor: true,
                    };
                }
                if (idToken.valor === "falso") {
                    return {
                        tipo: "LiteralBooleano",
                        valor: false,
                    };
                }
                if (idToken.valor === "nulo") {
                    return { tipo: "LiteralNulo" };
                }
                return {
                    tipo: "Identificador",
                    simbolo: idToken.valor,
                };
            case lexer_1.TipoToken.Numero:
                return {
                    tipo: "LiteralNumerico",
                    valor: parseFloat(this.obterProximoToken().valor),
                };
            case lexer_1.TipoToken.Texto:
                return {
                    tipo: "LiteralTexto",
                    valor: this.obterProximoToken().valor,
                };
            case lexer_1.TipoToken.AbreParentese:
                this.obterProximoToken(); // abre parêntese
                const expressao = this.analisarExpressao();
                this.avancar(lexer_1.TipoToken.FechaParentese, "Parêntese de fechamento ')' esperado");
                return expressao;
            case lexer_1.TipoToken.AbreColchete:
                this.obterProximoToken(); // [
                const valores = [];
                // @ts-ignore
                if (this.tokens[0]?.tipo !== lexer_1.TipoToken.FechaColchete) {
                    valores.push(this.analisarExpressao());
                    while (this.avancarSe(lexer_1.TipoToken.Virgula)) {
                        valores.push(this.analisarExpressao());
                    }
                }
                this.avancar(lexer_1.TipoToken.FechaColchete, "Colchete de fechamento ']' esperado");
                return {
                    tipo: "LiteralVetor",
                    valores,
                };
            case lexer_1.TipoToken.AbreChave:
                this.obterProximoToken(); // {
                const propriedades = [];
                // @ts-ignore
                if (this.tokens[0]?.tipo !== lexer_1.TipoToken.FechaChave) {
                    const chave = this.obterProximoToken().valor;
                    this.avancar(lexer_1.TipoToken.DoisPontos, "Dois pontos ':' esperados após a chave do objeto");
                    const valor = this.analisarExpressao();
                    propriedades.push({ tipo: "Propriedade", chave, valor });
                    while (this.avancarSe(lexer_1.TipoToken.Virgula)) {
                        const chave2 = this.obterProximoToken().valor;
                        this.avancar(lexer_1.TipoToken.DoisPontos, "Dois pontos ':' esperados após a chave do objeto");
                        const valor2 = this.analisarExpressao();
                        propriedades.push({
                            tipo: "Propriedade",
                            chave: chave2,
                            valor: valor2,
                        });
                    }
                }
                this.avancar(lexer_1.TipoToken.FechaChave, "Chave de fechamento '}' esperada");
                return {
                    tipo: "LiteralObjeto",
                    propriedades,
                };
            default:
                console.error("Token inesperado encontrado durante a análise: ", this.tokens[0]);
                process.exit(1);
        }
    }
    analisarExpressoesAdicionais(chamador) {
        if (this.avancarSe(lexer_1.TipoToken.Ponto)) {
            const prop = this.obterProximoToken().valor;
            return this.analisarExpressoesAdicionais({
                tipo: "ExpressaoMembro",
                objeto: chamador,
                propriedade: {
                    tipo: "Identificador",
                    simbolo: prop,
                },
                computado: false,
            });
        }
        if (this.avancarSe(lexer_1.TipoToken.AbreColchete)) {
            const expr = this.analisarExpressao();
            this.avancar(lexer_1.TipoToken.FechaColchete, "Colchete de fechamento ']' esperado");
            return this.analisarExpressoesAdicionais({
                tipo: "ExpressaoMembro",
                objeto: chamador,
                propriedade: expr,
                computado: true,
            });
        }
        if (this.avancarSe(lexer_1.TipoToken.AbreParentese)) {
            const args = new Array();
            if (this.tokens[0]?.tipo !== lexer_1.TipoToken.FechaParentese) {
                args.push(this.analisarExpressao());
                while (this.avancarSe(lexer_1.TipoToken.Virgula)) {
                    args.push(this.analisarExpressao());
                }
            }
            this.avancar(lexer_1.TipoToken.FechaParentese, "Parêntese de fechamento ')' esperado");
            return this.analisarExpressoesAdicionais({
                tipo: "ExpressaoChamada",
                chamador,
                argumentos: args,
            });
        }
        return chamador;
    }
    // ============================================
    // COMANDOS
    // ============================================
    analisarCorpo() {
        this.avancar(lexer_1.TipoToken.AbreChave, "Chave de abertura '{' esperada");
        const corpo = [];
        while (this.naoNoFimDoArquivo() &&
            this.tokens[0]?.tipo !== lexer_1.TipoToken.FechaChave &&
            this.tokens[0]?.tipo !== lexer_1.TipoToken.FimDoArquivo) {
            corpo.push(this.analisarDeclaracao());
        }
        this.avancar(lexer_1.TipoToken.FechaChave, "Chave de fechamento '}' esperada");
        return corpo;
    }
    analisarDeclaracaoVariavel(declaracaoSeja = false) {
        this.obterProximoToken(); // avance sobre o token seja/constante
        const identificador = this.obterProximoToken().valor;
        const temIgual = this.avancarSe(lexer_1.TipoToken.Igual);
        if (!declaracaoSeja && !temIgual) {
            console.error("Constantes devem ter um valor: ", identificador);
            process.exit(1);
        }
        const declaracao = {
            tipo: "DeclaracaoVariavel",
            constante: !declaracaoSeja,
            identificador,
            valor: temIgual ? this.analisarExpressao() : undefined,
        };
        return declaracao;
    }
    analisarDeclaracaoFuncao() {
        this.obterProximoToken(); // avance sobre o token funcao
        const nome = this.obterProximoToken().valor;
        const args = new Array();
        this.avancar(lexer_1.TipoToken.AbreParentese, "Parêntese de abertura '(' esperado após nome de função");
        if (this.tokens[0]?.tipo !== lexer_1.TipoToken.FechaParentese) {
            args.push(this.obterProximoToken().valor);
            while (this.avancarSe(lexer_1.TipoToken.Virgula)) {
                args.push(this.obterProximoToken().valor);
            }
        }
        this.avancar(lexer_1.TipoToken.FechaParentese, "Parêntese de fechamento ')' esperado");
        const corpo = this.analisarCorpo();
        return {
            tipo: "DeclaracaoFuncao",
            parametros: args,
            nome,
            corpo,
        };
    }
    analisarDeclaracaoSe() {
        this.obterProximoToken(); // consome o token se
        return this.analisarSeInterno();
    }
    analisarSeInterno() {
        const teste = this.analisarExpressao();
        const corpo = this.analisarCorpo();
        let alternativo;
        if (this.avancarSe(lexer_1.TipoToken.SenaoSe)) {
            alternativo = [this.analisarSeInterno()];
        }
        else if (this.avancarSe(lexer_1.TipoToken.Senao)) {
            alternativo = this.analisarCorpo();
        }
        return {
            tipo: "DeclaracaoSe",
            teste,
            corpo,
            alternativo,
        };
    }
    analisarDeclaracaoTentarPegar() {
        if (this.tokens[0]?.valor !== "tentar") {
            console.error("'tentar' esperado, encontrado: ", this.tokens[0]);
            process.exit(1);
        }
        this.obterProximoToken(); // avance sobre o token tentar
        const corpo = this.analisarCorpo();
        let alternativo = [];
        // @ts-ignore
        if (this.tokens[0]?.valor === "pegar") {
            this.obterProximoToken(); // avance sobre o token pegar
            if (this.tokens[0]?.valor !== undefined &&
                this.tokens[0]?.tipo === lexer_1.TipoToken.Identificador) {
                this.obterProximoToken(); // avance sobre o identificador de erro
            }
            alternativo = this.analisarCorpo();
        }
        return {
            tipo: "DeclaracaoTentarPegar",
            corpo,
            alternativo,
        };
    }
    analisarDeclaracaoPara() {
        this.obterProximoToken(); // avance sobre o token para
        this.avancar(lexer_1.TipoToken.AbreParentese, "Parêntese de abertura '(' esperado após 'para'");
        const inicializacao = this.analisarDeclaracaoVariavel(true); // seja no loop para
        this.avancarSe(lexer_1.TipoToken.PontoVirgula);
        const teste = this.analisarExpressao();
        this.avancarSe(lexer_1.TipoToken.PontoVirgula);
        const atualizacao = this.analisarExpressao();
        this.avancar(lexer_1.TipoToken.FechaParentese, "Parêntese de fechamento ')' esperado");
        const corpo = this.analisarCorpo();
        return {
            tipo: "DeclaracaoPara",
            inicializacao,
            teste,
            atualizacao,
            corpo,
        };
    }
    analisarDeclaracao() {
        switch (this.tokens[0]?.tipo) {
            case lexer_1.TipoToken.Seja:
                return this.analisarDeclaracaoVariavel(true);
            case lexer_1.TipoToken.Constante:
                return this.analisarDeclaracaoVariavel(false);
            case lexer_1.TipoToken.Funcao:
                return this.analisarDeclaracaoFuncao();
            case lexer_1.TipoToken.Se:
                return this.analisarDeclaracaoSe();
            case lexer_1.TipoToken.Para:
                return this.analisarDeclaracaoPara();
            case lexer_1.TipoToken.Identificador:
                if (this.tokens[0]?.valor === "tentar") {
                    return this.analisarDeclaracaoTentarPegar();
                }
                return this.analisarExpressao();
            default:
                return this.analisarExpressao();
        }
    }
}
exports.default = AnalisadorSintatico;
//# sourceMappingURL=parser.js.map