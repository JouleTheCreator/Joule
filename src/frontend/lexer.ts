// Linguagem Joule - Analisador Léxico

export enum TipoToken {
  // Tipos Literais
  Numero,
  Identificador,
  Texto,
  // Palavras-chave
  Seja,
  Constante,
  Funcao,
  Se,
  Senao,
  SenaoSe,
  Para,

  // Agrupamento e Operadores
  OperadorBinario,
  Igual, // =
  Virgula, // ,
  DoisPontos, // :
  PontoVirgula, // ;
  Ponto, // .
  AbreParentese, // (
  FechaParentese, // )
  AbreChave, // {
  FechaChave, // }
  AbreColchete, // [
  FechaColchete, // ]
  Maior, // >
  Menor, // <
  MaiorIgual, // >=
  MenorIgual, // <=
  ComparacaoIgual, // ==
  ComparacaoDiferente, // !=
  Exclamacao, // !
  E, // &&
  Comercial, // &
  Ou, // ||
  Barra, // |
  Ternario, // ->

  FimDoArquivo,
  NovaLinha,
}

const PALAVRAS_CHAVE: Record<string, TipoToken> = {
  seja: TipoToken.Seja,
  constante: TipoToken.Constante,
  funcao: TipoToken.Funcao,
  se: TipoToken.Se,
  senao: TipoToken.Senao,
  senaose: TipoToken.SenaoSe,
  para: TipoToken.Para,
};

const CARACTERES_TOKEN: Record<string, TipoToken> = {
  "(": TipoToken.AbreParentese,
  ")": TipoToken.FechaParentese,
  "{": TipoToken.AbreChave,
  "}": TipoToken.FechaChave,
  "[": TipoToken.AbreColchete,
  "]": TipoToken.FechaColchete,
  "+": TipoToken.OperadorBinario,
  "*": TipoToken.OperadorBinario,
  "%": TipoToken.OperadorBinario,
  ".": TipoToken.Ponto,
  ";": TipoToken.PontoVirgula,
  ":": TipoToken.DoisPontos,
  ",": TipoToken.Virgula,
  "\n": TipoToken.NovaLinha,
};

const ESCAPADOS: Record<string, string> = {
  n: "\n",
  t: "\t",
  r: "\r",
};

const tipoTokenReverso: Record<number, string> = Object.keys(TipoToken)
  .filter(
    (chave) => typeof TipoToken[chave as keyof typeof TipoToken] === "number",
  )
  .reduce(
    (obj, chave) => {
      obj[TipoToken[chave as keyof typeof TipoToken]] = chave;
      return obj;
    },
    {} as Record<number, string>,
  );

export interface Token {
  valor: string;
  tipo: TipoToken;
  bruto: string;
  toString: () => object;
}

function token(
  valor: string = "",
  tipo: TipoToken,
  bruto: string = valor,
): Token {
  return {
    valor,
    tipo,
    bruto,
    toString: () => {
      return { valor, tipo: tipoTokenReverso[tipo] };
    },
  };
}

function eAlfabetico(src: string, primeiroCaractere: boolean = false) {
  if (primeiroCaractere) {
    return /^[A-Za-z_]+$/.test(src);
  }
  return /^[A-Za-z0-9_]+$/.test(src);
}

function eIgnoravel(str: string) {
  return str == " " || str == "\n" || str == "\t" || str == "\r";
}

function eInteiro(str: string) {
  const c = str.charCodeAt(0);
  const limites = ["0".charCodeAt(0), "9".charCodeAt(0)];
  return c >= limites[0] && c <= limites[1];
}

function obterIdentificadoresAnteriores(tokens: Array<Token>): Token[] {
  const invertido = [...tokens].reverse();
  const novosTokens: Token[] = [];
  for (const token of invertido) {
    if (
      token.tipo == TipoToken.Identificador ||
      token.tipo == TipoToken.Ponto ||
      token.tipo == TipoToken.AbreColchete ||
      token.tipo == TipoToken.FechaColchete ||
      (tokens[tokens.length - novosTokens.length - 2] &&
        tokens[tokens.length - novosTokens.length - 2].tipo ==
          TipoToken.AbreColchete &&
        token.tipo == TipoToken.Numero)
    ) {
      novosTokens.push(token);
    } else {
      break;
    }
  }
  return novosTokens.length > 0 ? novosTokens.reverse() : (null as any);
}

export function tokenizar(codigoFonte: string): Token[] {
  const tokens = new Array<Token>();
  const src = codigoFonte.split("");

  while (src.length > 0) {
    const caractere = src[0];

    // Números (incluindo negativos)
    if (eInteiro(caractere) || (caractere == "-" && eInteiro(src[1]))) {
      let num = src.shift();
      let ponto = false;
      while (src.length > 0) {
        if (src[0] == "." && !ponto) {
          ponto = true;
          num += src.shift()!;
        } else if (eInteiro(src[0])) {
          num += src.shift()!;
        } else break;
      }
      tokens.push(token(num, TipoToken.Numero));
      continue;
    }

    // Caracteres com lógica especial de lookahead
    switch (caractere) {
      case "=":
        src.shift();
        if (src[0] == "=") {
          src.shift();
          tokens.push(token("==", TipoToken.ComparacaoIgual));
        } else {
          tokens.push(token("=", TipoToken.Igual));
        }
        break;

      case "&":
        src.shift();
        if (src[0] == "&") {
          src.shift();
          tokens.push(token("&&", TipoToken.E));
        } else {
          tokens.push(token("&", TipoToken.Comercial));
        }
        break;

      case "|":
        src.shift();
        if (src[0] == "|") {
          src.shift();
          tokens.push(token("||", TipoToken.Ou));
        } else {
          tokens.push(token("|", TipoToken.Barra));
        }
        break;

      case "!":
        src.shift();
        if (String(src[0]) == "=") {
          src.shift();
          tokens.push(token("!=", TipoToken.ComparacaoDiferente));
        } else {
          tokens.push(token("!", TipoToken.Exclamacao));
        }
        break;

      case ">":
        src.shift();
        if (src[0] == "=") {
          src.shift();
          tokens.push(token(">=", TipoToken.MaiorIgual));
        } else {
          tokens.push(token(">", TipoToken.Maior));
        }
        break;

      case "<":
        src.shift();
        if (src[0] == "=") {
          src.shift();
          tokens.push(token("<=", TipoToken.MenorIgual));
        } else {
          tokens.push(token("<", TipoToken.Menor));
        }
        break;

      case '"': {
        let str = "";
        let bruto = "";
        src.shift();
        let escapado = false;
        while (src.length > 0) {
          const chave = src.shift();
          bruto += chave;
          if (chave == "\\") {
            escapado = !escapado;
            if (escapado) continue;
          } else if (chave == '"') {
            if (!escapado) {
              break;
            }
            escapado = false;
          } else if (escapado) {
            escapado = false;
            if (ESCAPADOS[chave]) {
              str += ESCAPADOS[chave];
              continue;
            } else {
              str += `\\`;
            }
          }
          str += chave;
        }
        tokens.push(
          token(str, TipoToken.Texto, bruto.substring(0, bruto.length - 1)),
        );
        break;
      }

      case "-":
        if (src[1] == ">") {
          src.shift();
          src.shift();
          tokens.push(token("->", TipoToken.Ternario));
          break;
        }
        // Tratamento de negação unária: -5 vira 0 - 5
        if (src[1] != src[0]) {
          const identAnteriores = obterIdentificadoresAnteriores(tokens);
          if (
            identAnteriores == null &&
            tokens[tokens.length - 1]?.tipo != TipoToken.FechaParentese
          ) {
            tokens.push(token("0", TipoToken.Numero));
            tokens.push(token(src.shift(), TipoToken.OperadorBinario));
            break;
          }
        }
      // Fall-through para ++
      // eslint-disable-next-line no-fallthrough
      case "+":
        if (src[1] == src[0]) {
          const tokensAnteriores = obterIdentificadoresAnteriores(tokens);
          if (tokensAnteriores != null) {
            tokens.push(token("=", TipoToken.Igual));
            tokensAnteriores.forEach((tk) => tokens.push(tk));
            tokens.push(token(src.shift(), TipoToken.OperadorBinario));
            tokens.push(token("1", TipoToken.Numero));
            src.shift();
            break;
          }
        }
      // Fall-through para *=, /=
      // eslint-disable-next-line no-fallthrough
      case "*":
      case "/":
        if (src[1] == "=") {
          const tokensAnteriores = obterIdentificadoresAnteriores(tokens);
          if (tokensAnteriores == null) {
            // Sem identificador anterior, só emite o operador
            tokens.push(token(src.shift(), TipoToken.OperadorBinario));
            break;
          }
          tokens.push(token("=", TipoToken.Igual));
          tokensAnteriores.forEach((tk) => tokens.push(tk));
          tokens.push(token(src.shift(), TipoToken.OperadorBinario));
          src.shift(); // consome o =
          break;
        }
        // Comentários
        if (src[0] == "/") {
          if (src[1] == "*") {
            let ultimoValor = "";
            while (src.length > 0) {
              const proximoValor = src.shift();
              if (ultimoValor == "*" && proximoValor == "/") {
                break;
              }
              ultimoValor = proximoValor;
            }
            break;
          } else if (src[1] == "/") {
            do {
              src.shift();
            } while (src.length > 0 && (src[0] as string) != "\n");
            break;
          }
        }
        // Emitir operador binário normal (+ - * /)
        tokens.push(token(src.shift(), TipoToken.OperadorBinario));
        break;

      default:
        // Caracteres simples de mapeamento direto
        const tipoToken = CARACTERES_TOKEN[caractere];
        if (tipoToken) {
          tokens.push(token(src.shift(), tipoToken));
        } else if (eAlfabetico(caractere, true)) {
          let ident = "";
          ident += src.shift();
          while (src.length > 0 && eAlfabetico(src[0])) {
            ident += src.shift();
          }
          const reservada = PALAVRAS_CHAVE[ident];
          if (typeof reservada == "number") {
            tokens.push(token(ident, reservada));
          } else {
            tokens.push(token(ident, TipoToken.Identificador));
          }
        } else if (eIgnoravel(src[0])) {
          src.shift();
        } else {
          console.error(
            "Caractere não reconhecido encontrado no código-fonte: ",
            src[0].charCodeAt(0),
            src[0],
          );
          process.exit(1);
        }
        break;
    }
  }

  tokens.push(token("FimDoArquivo", TipoToken.FimDoArquivo));
  return tokens;
}
