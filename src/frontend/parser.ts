// Linguagem Joule - Analisador Sintático
// Responsável por produzir a AST a partir de fluxo de tokens

import { TipoToken, tokenizar, Token } from "./lexer";
import * as ast from "./ast";

export default class AnalisadorSintatico {
  private tokens: Token[] = [];

  /**
   * Produz uma AST a partir de código-fonte.
   */
  public produzirAST(codigoFonte: string): ast.Programa {
    const tokens = tokenizar(codigoFonte);
    this.tokens = tokens.filter((t) => t.tipo !== TipoToken.NovaLinha);

    const corpo: ast.Declaracao[] = [];

    while (
      this.naoNoFimDoArquivo() &&
      this.tokens[0]?.tipo !== TipoToken.FimDoArquivo
    ) {
      corpo.push(this.analisarDeclaracao());
    }

    return {
      tipo: "Programa",
      corpo,
    } as ast.Programa;
  }

  private naoNoFimDoArquivo() {
    return this.tokens[0].tipo != TipoToken.FimDoArquivo;
  }

  private obterProximoToken(): Token {
    const token = this.tokens[0] as Token;
    this.tokens = this.tokens.slice(1);
    return token;
  }

  private avancar(tipo: TipoToken, mensagemErro: string, valor?: string) {
    const tokenAnterior = this.tokens[0] as Token;

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

  private avancarSe(tipo: TipoToken, valor?: string) {
    const tokenAnterior = this.tokens[0] as Token;

    if (!tokenAnterior || tokenAnterior.tipo !== tipo) return false;

    if (valor) {
      if (tokenAnterior.valor !== valor) return false;
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

  private analisarExpressao(): ast.Expressao {
    return this.analisarAtribuicao();
  }

  private analisarAtribuicao(): ast.Expressao {
    const esquerda = this.analisarLogicoOU();

    if (this.avancarSe(TipoToken.Igual)) {
      if (
        esquerda.tipo !== "Identificador" &&
        esquerda.tipo !== "ExpressaoMembro"
      ) {
        console.error("Lado esquerdo da atribuição inválido: ", esquerda);
        process.exit(1);
      }

      return {
        tipo: "ExpressaoAtribuicao",
        atribuido: esquerda,
        valor: this.analisarExpressao(),
      } as ast.ExpressaoAtribuicao;
    }

    return esquerda;
  }

  private analisarLogicoOU(): ast.Expressao {
    let esquerda = this.analisarLogicoE();

    while (this.tokens[0]?.tipo === TipoToken.Ou) {
      this.obterProximoToken();
      const direita = this.analisarLogicoE();
      esquerda = {
        tipo: "ExpressaoBinaria",
        esquerda,
        direita,
        operador: "||",
      } as ast.ExpressaoBinaria;
    }

    return esquerda;
  }

  private analisarLogicoE(): ast.Expressao {
    let esquerda = this.analisarComparacao();

    while (this.tokens[0]?.tipo === TipoToken.E) {
      this.obterProximoToken();
      const direita = this.analisarComparacao();
      esquerda = {
        tipo: "ExpressaoBinaria",
        esquerda,
        direita,
        operador: "&&",
      } as ast.ExpressaoBinaria;
    }

    return esquerda;
  }

  private analisarComparacao(): ast.Expressao {
    let esquerda = this.analisarAditiva();

    while (true) {
      const tk = this.tokens[0] as Token;
      if (!tk) break;

      if (
        tk.tipo === TipoToken.ComparacaoIgual ||
        tk.tipo === TipoToken.ComparacaoDiferente ||
        tk.tipo === TipoToken.Menor ||
        tk.tipo === TipoToken.Maior ||
        tk.tipo === TipoToken.MenorIgual ||
        tk.tipo === TipoToken.MaiorIgual
      ) {
        const operador = this.obterProximoToken().valor;
        const direita = this.analisarAditiva();
        esquerda = {
          tipo: "ExpressaoBinaria",
          esquerda,
          direita,
          operador,
        } as ast.ExpressaoBinaria;
      } else {
        break;
      }
    }

    return esquerda;
  }

  private analisarAditiva(): ast.Expressao {
    let esquerda = this.analisarMultiplicativa();

    while (true) {
      const tk = this.tokens[0] as Token;
      if (!tk) break;

      if (
        tk.tipo === TipoToken.OperadorBinario &&
        (tk.valor === "+" || tk.valor === "-")
      ) {
        const operador = this.obterProximoToken().valor;
        const direita = this.analisarMultiplicativa();
        esquerda = {
          tipo: "ExpressaoBinaria",
          esquerda,
          direita,
          operador,
        } as ast.ExpressaoBinaria;
      } else {
        break;
      }
    }

    return esquerda;
  }

  private analisarMultiplicativa(): ast.Expressao {
    let esquerda = this.analisarUnaria();

    while (true) {
      const tk = this.tokens[0] as Token;
      if (!tk) break;

      if (
        tk.tipo === TipoToken.OperadorBinario &&
        (tk.valor === "*" || tk.valor === "/" || tk.valor === "%")
      ) {
        const operador = this.obterProximoToken().valor;
        const direita = this.analisarChamada();
        esquerda = {
          tipo: "ExpressaoBinaria",
          esquerda,
          direita,
          operador,
        } as ast.ExpressaoBinaria;
      } else {
        break;
      }
    }

    return esquerda;
  }

  private analisarUnaria(): ast.Expressao {
    if (this.tokens[0]?.tipo === TipoToken.Exclamacao) {
      this.obterProximoToken(); // !
      const operando = this.analisarUnaria();
      return {
        tipo: "ExpressaoUnaria",
        operador: "!",
        operando,
      } as ast.ExpressaoUnaria;
    }

    if (
      this.tokens[0]?.tipo === TipoToken.OperadorBinario &&
      this.tokens[0]?.valor === "-"
    ) {
      this.obterProximoToken(); // -
      const operando = this.analisarUnaria();
      return {
        tipo: "ExpressaoUnaria",
        operador: "-",
        operando,
      } as ast.ExpressaoUnaria;
    }

    return this.analisarChamada();
  }

  private analisarChamada(): ast.Expressao {
    return this.analisarExpressoesAdicionais(this.analisarExpressaoPrimaria());
  }

  private analisarExpressaoPrimaria(): ast.Expressao {
    switch (this.tokens[0]?.tipo) {
      case TipoToken.Identificador:
        const idToken = this.obterProximoToken();
        if (idToken.valor === "verdadeiro") {
          return {
            tipo: "LiteralBooleano",
            valor: true,
          } as ast.LiteralBooleano;
        }
        if (idToken.valor === "falso") {
          return {
            tipo: "LiteralBooleano",
            valor: false,
          } as ast.LiteralBooleano;
        }
        if (idToken.valor === "nulo") {
          return { tipo: "LiteralNulo" } as ast.LiteralNulo;
        }
        return {
          tipo: "Identificador",
          simbolo: idToken.valor,
        } as ast.Identificador;
      case TipoToken.Numero:
        return {
          tipo: "LiteralNumerico",
          valor: parseFloat(this.obterProximoToken().valor),
        } as ast.LiteralNumerico;
      case TipoToken.Texto:
        return {
          tipo: "LiteralTexto",
          valor: this.obterProximoToken().valor,
        } as ast.LiteralTexto;
      case TipoToken.AbreParentese:
        this.obterProximoToken(); // abre parêntese
        const expressao = this.analisarExpressao();
        this.avancar(
          TipoToken.FechaParentese,
          "Parêntese de fechamento ')' esperado",
        );
        return expressao;
      case TipoToken.AbreColchete:
        this.obterProximoToken(); // [
        const valores: Array<ast.Expressao> = [];
        // @ts-ignore
        if (this.tokens[0]?.tipo !== TipoToken.FechaColchete) {
          valores.push(this.analisarExpressao());
          while (this.avancarSe(TipoToken.Virgula)) {
            valores.push(this.analisarExpressao());
          }
        }
        this.avancar(
          TipoToken.FechaColchete,
          "Colchete de fechamento ']' esperado",
        );
        return {
          tipo: "LiteralVetor",
          valores,
        } as ast.LiteralVetor;
      case TipoToken.AbreChave:
        this.obterProximoToken(); // {
        const propriedades: Array<ast.Propriedade> = [];
        // @ts-ignore
        if (this.tokens[0]?.tipo !== TipoToken.FechaChave) {
          const chave = this.obterProximoToken().valor;
          this.avancar(
            TipoToken.DoisPontos,
            "Dois pontos ':' esperados após a chave do objeto",
          );
          const valor = this.analisarExpressao();
          propriedades.push({ tipo: "Propriedade", chave, valor });
          while (this.avancarSe(TipoToken.Virgula)) {
            const chave2 = this.obterProximoToken().valor;
            this.avancar(
              TipoToken.DoisPontos,
              "Dois pontos ':' esperados após a chave do objeto",
            );
            const valor2 = this.analisarExpressao();
            propriedades.push({
              tipo: "Propriedade",
              chave: chave2,
              valor: valor2,
            });
          }
        }
        this.avancar(TipoToken.FechaChave, "Chave de fechamento '}' esperada");
        return {
          tipo: "LiteralObjeto",
          propriedades,
        } as ast.LiteralObjeto;

      default:
        console.error(
          "Token inesperado encontrado durante a análise: ",
          this.tokens[0],
        );
        process.exit(1);
    }
  }

  private analisarExpressoesAdicionais(chamador: ast.Expressao): ast.Expressao {
    if (this.avancarSe(TipoToken.Ponto)) {
      const prop = this.obterProximoToken().valor;
      return this.analisarExpressoesAdicionais({
        tipo: "ExpressaoMembro",
        objeto: chamador,
        propriedade: {
          tipo: "Identificador",
          simbolo: prop,
        } as ast.Identificador,
        computado: false,
      } as ast.ExpressaoMembro);
    }

    if (this.avancarSe(TipoToken.AbreColchete)) {
      const expr = this.analisarExpressao();
      this.avancar(
        TipoToken.FechaColchete,
        "Colchete de fechamento ']' esperado",
      );
      return this.analisarExpressoesAdicionais({
        tipo: "ExpressaoMembro",
        objeto: chamador,
        propriedade: expr,
        computado: true,
      } as ast.ExpressaoMembro);
    }

    if (this.avancarSe(TipoToken.AbreParentese)) {
      const args = new Array<ast.Expressao>();
      if (this.tokens[0]?.tipo !== TipoToken.FechaParentese) {
        args.push(this.analisarExpressao());
        while (this.avancarSe(TipoToken.Virgula)) {
          args.push(this.analisarExpressao());
        }
      }
      this.avancar(
        TipoToken.FechaParentese,
        "Parêntese de fechamento ')' esperado",
      );
      return this.analisarExpressoesAdicionais({
        tipo: "ExpressaoChamada",
        chamador,
        argumentos: args,
      } as ast.ExpressaoChamada);
    }

    return chamador;
  }

  // ============================================
  // COMANDOS
  // ============================================

  private analisarCorpo(): ast.Declaracao[] {
    this.avancar(TipoToken.AbreChave, "Chave de abertura '{' esperada");

    const corpo: ast.Declaracao[] = [];

    while (
      this.naoNoFimDoArquivo() &&
      this.tokens[0]?.tipo !== TipoToken.FechaChave &&
      this.tokens[0]?.tipo !== TipoToken.FimDoArquivo
    ) {
      corpo.push(this.analisarDeclaracao());
    }

    this.avancar(TipoToken.FechaChave, "Chave de fechamento '}' esperada");

    return corpo;
  }

  private analisarDeclaracaoVariavel(
    declaracaoSeja: boolean = false,
  ): ast.DeclaracaoVariavel {
    this.obterProximoToken(); // avance sobre o token seja/constante

    const identificador = this.obterProximoToken().valor;

    const temIgual = this.avancarSe(TipoToken.Igual);

    if (!declaracaoSeja && !temIgual) {
      console.error("Constantes devem ter um valor: ", identificador);
      process.exit(1);
    }

    const declaracao: ast.DeclaracaoVariavel = {
      tipo: "DeclaracaoVariavel",
      constante: !declaracaoSeja,
      identificador,
      valor: temIgual ? this.analisarExpressao() : undefined,
    };

    return declaracao;
  }

  private analisarDeclaracaoFuncao(): ast.DeclaracaoFuncao {
    this.obterProximoToken(); // avance sobre o token funcao

    const nome = this.obterProximoToken().valor;

    const args = new Array<string>();
    this.avancar(
      TipoToken.AbreParentese,
      "Parêntese de abertura '(' esperado após nome de função",
    );
    if (this.tokens[0]?.tipo !== TipoToken.FechaParentese) {
      args.push(this.obterProximoToken().valor);
      while (this.avancarSe(TipoToken.Virgula)) {
        args.push(this.obterProximoToken().valor);
      }
    }
    this.avancar(
      TipoToken.FechaParentese,
      "Parêntese de fechamento ')' esperado",
    );

    const corpo = this.analisarCorpo();

    return {
      tipo: "DeclaracaoFuncao",
      parametros: args,
      nome,
      corpo,
    } as ast.DeclaracaoFuncao;
  }

  private analisarDeclaracaoSe(): ast.DeclaracaoSe {
    this.obterProximoToken(); // consome o token se
    return this.analisarSeInterno();
  }

  private analisarSeInterno(): ast.DeclaracaoSe {
    const teste = this.analisarExpressao();

    const corpo = this.analisarCorpo();

    let alternativo: ast.Declaracao[] | undefined;

    if (this.avancarSe(TipoToken.MasSe)) {
      alternativo = [this.analisarSeInterno()];
    } else if (this.avancarSe(TipoToken.Senao)) {
      alternativo = this.analisarCorpo();
    }

    return {
      tipo: "DeclaracaoSe",
      teste,
      corpo,
      alternativo,
    } as ast.DeclaracaoSe;
  }

  private analisarDeclaracaoEscolha(): ast.DeclaracaoEscolha {
    this.obterProximoToken(); // consome o token escolha

    const discriminante = this.analisarExpressao();

    this.avancar(
      TipoToken.AbreChave,
      "Chave de abertura '{' esperada depois da express\u00e3o de 'escolha'",
    );

    const casos: ast.CasoEscolha[] = [];
    let padrao: ast.Declaracao[] | undefined;

    while (
      this.naoNoFimDoArquivo() &&
      this.tokens[0]?.tipo !== TipoToken.FechaChave &&
      this.tokens[0]?.tipo !== TipoToken.FimDoArquivo
    ) {
      if (this.avancarSe(TipoToken.Caso)) {
        const teste = this.analisarExpressao();
        const corpo = this.analisarCorpo();
        casos.push({ teste, corpo });
      } else if (this.avancarSe(TipoToken.Padrao)) {
        if (padrao !== undefined) {
          console.error(
            "Apenas um bloco 'padrao' \u00e9 permitido dentro de cada 'escolha'",
          );
          process.exit(1);
        }
        padrao = this.analisarCorpo();
      } else {
        console.error(
          "'caso' ou 'padrao' esperado dentro de 'escolha', encontrado: ",
          this.tokens[0],
        );
        process.exit(1);
      }
    }

    this.avancar(
      TipoToken.FechaChave,
      "Chave de fechamento '}' esperada no fim de 'escolha'",
    );

    return {
      tipo: "DeclaracaoEscolha",
      discriminante,
      casos,
      padrao,
    } as ast.DeclaracaoEscolha;
  }

  private analisarDeclaracaoTentarPegar(): ast.DeclaracaoTentarPegar {
    if (this.tokens[0]?.valor !== "tentar") {
      console.error("'tentar' esperado, encontrado: ", this.tokens[0]);
      process.exit(1);
    }

    this.obterProximoToken(); // avance sobre o token tentar

    const corpo = this.analisarCorpo();

    let alternativo: ast.Declaracao[] = [];

    // @ts-ignore
    if (this.tokens[0]?.valor === "pegar") {
      this.obterProximoToken(); // avance sobre o token pegar

      if (
        this.tokens[0]?.valor !== undefined &&
        this.tokens[0]?.tipo === TipoToken.Identificador
      ) {
        this.obterProximoToken(); // avance sobre o identificador de erro
      }

      alternativo = this.analisarCorpo();
    }

    return {
      tipo: "DeclaracaoTentarPegar",
      corpo,
      alternativo,
    } as ast.DeclaracaoTentarPegar;
  }

  private analisarDeclaracaoPara(): ast.DeclaracaoPara {
    this.obterProximoToken(); // avance sobre o token para

    this.avancar(
      TipoToken.AbreParentese,
      "Parêntese de abertura '(' esperado após 'para'",
    );

    const inicializacao = this.analisarDeclaracaoVariavel(true); // seja no loop para

    this.avancarSe(TipoToken.PontoVirgula);

    const teste = this.analisarExpressao();

    this.avancarSe(TipoToken.PontoVirgula);

    const atualizacao = this.analisarExpressao() as ast.ExpressaoAtribuicao;

    this.avancar(
      TipoToken.FechaParentese,
      "Parêntese de fechamento ')' esperado",
    );

    const corpo = this.analisarCorpo();

    return {
      tipo: "DeclaracaoPara",
      inicializacao,
      teste,
      atualizacao,
      corpo,
    } as ast.DeclaracaoPara;
  }

  public analisarDeclaracao(): ast.Declaracao {
    switch (this.tokens[0]?.tipo) {
      case TipoToken.Seja:
        return this.analisarDeclaracaoVariavel(true);
      case TipoToken.Constante:
        return this.analisarDeclaracaoVariavel(false);
      case TipoToken.Funcao:
        return this.analisarDeclaracaoFuncao();
      case TipoToken.Se:
        return this.analisarDeclaracaoSe();
      case TipoToken.Para:
        return this.analisarDeclaracaoPara();
      case TipoToken.Escolha:
        return this.analisarDeclaracaoEscolha();
      case TipoToken.Identificador:
        if (this.tokens[0]?.valor === "tentar") {
          return this.analisarDeclaracaoTentarPegar();
        }
        return this.analisarExpressao();
      default:
        return this.analisarExpressao();
    }
  }
}
