"use strict";
// Linguagem Joule - Analisador Léxico
Object.defineProperty(exports, "__esModule", { value: true });
exports.TipoToken = void 0;
exports.tokenizar = tokenizar;
var TipoToken;
(function (TipoToken) {
    // Tipos Literais
    TipoToken[TipoToken["Numero"] = 0] = "Numero";
    TipoToken[TipoToken["Identificador"] = 1] = "Identificador";
    TipoToken[TipoToken["Texto"] = 2] = "Texto";
    // Palavras-chave
    TipoToken[TipoToken["Seja"] = 3] = "Seja";
    TipoToken[TipoToken["Constante"] = 4] = "Constante";
    TipoToken[TipoToken["Funcao"] = 5] = "Funcao";
    TipoToken[TipoToken["Se"] = 6] = "Se";
    TipoToken[TipoToken["Senao"] = 7] = "Senao";
    TipoToken[TipoToken["SenaoSe"] = 8] = "SenaoSe";
    TipoToken[TipoToken["Para"] = 9] = "Para";
    // Agrupamento e Operadores
    TipoToken[TipoToken["OperadorBinario"] = 10] = "OperadorBinario";
    TipoToken[TipoToken["Igual"] = 11] = "Igual";
    TipoToken[TipoToken["Virgula"] = 12] = "Virgula";
    TipoToken[TipoToken["DoisPontos"] = 13] = "DoisPontos";
    TipoToken[TipoToken["PontoVirgula"] = 14] = "PontoVirgula";
    TipoToken[TipoToken["Ponto"] = 15] = "Ponto";
    TipoToken[TipoToken["AbreParentese"] = 16] = "AbreParentese";
    TipoToken[TipoToken["FechaParentese"] = 17] = "FechaParentese";
    TipoToken[TipoToken["AbreChave"] = 18] = "AbreChave";
    TipoToken[TipoToken["FechaChave"] = 19] = "FechaChave";
    TipoToken[TipoToken["AbreColchete"] = 20] = "AbreColchete";
    TipoToken[TipoToken["FechaColchete"] = 21] = "FechaColchete";
    TipoToken[TipoToken["Maior"] = 22] = "Maior";
    TipoToken[TipoToken["Menor"] = 23] = "Menor";
    TipoToken[TipoToken["MaiorIgual"] = 24] = "MaiorIgual";
    TipoToken[TipoToken["MenorIgual"] = 25] = "MenorIgual";
    TipoToken[TipoToken["ComparacaoIgual"] = 26] = "ComparacaoIgual";
    TipoToken[TipoToken["ComparacaoDiferente"] = 27] = "ComparacaoDiferente";
    TipoToken[TipoToken["Exclamacao"] = 28] = "Exclamacao";
    TipoToken[TipoToken["E"] = 29] = "E";
    TipoToken[TipoToken["Comercial"] = 30] = "Comercial";
    TipoToken[TipoToken["Ou"] = 31] = "Ou";
    TipoToken[TipoToken["Barra"] = 32] = "Barra";
    TipoToken[TipoToken["Ternario"] = 33] = "Ternario";
    TipoToken[TipoToken["FimDoArquivo"] = 34] = "FimDoArquivo";
    TipoToken[TipoToken["NovaLinha"] = 35] = "NovaLinha";
})(TipoToken || (exports.TipoToken = TipoToken = {}));
const PALAVRAS_CHAVE = {
    seja: TipoToken.Seja,
    constante: TipoToken.Constante,
    funcao: TipoToken.Funcao,
    se: TipoToken.Se,
    senao: TipoToken.Senao,
    senaose: TipoToken.SenaoSe,
    para: TipoToken.Para,
};
const CARACTERES_TOKEN = {
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
const ESCAPADOS = {
    n: "\n",
    t: "\t",
    r: "\r",
};
const tipoTokenReverso = Object.keys(TipoToken)
    .filter((chave) => typeof TipoToken[chave] === "number")
    .reduce((obj, chave) => {
    obj[TipoToken[chave]] = chave;
    return obj;
}, {});
function token(valor = "", tipo, bruto = valor) {
    return {
        valor,
        tipo,
        bruto,
        toString: () => {
            return { valor, tipo: tipoTokenReverso[tipo] };
        },
    };
}
function eAlfabetico(src, primeiroCaractere = false) {
    if (primeiroCaractere) {
        return /^[A-Za-z_]+$/.test(src);
    }
    return /^[A-Za-z0-9_]+$/.test(src);
}
function eIgnoravel(str) {
    return str == " " || str == "\n" || str == "\t" || str == "\r";
}
function eInteiro(str) {
    const c = str.charCodeAt(0);
    const limites = ["0".charCodeAt(0), "9".charCodeAt(0)];
    return c >= limites[0] && c <= limites[1];
}
function obterIdentificadoresAnteriores(tokens) {
    const invertido = [...tokens].reverse();
    const novosTokens = [];
    for (const token of invertido) {
        if (token.tipo == TipoToken.Identificador ||
            token.tipo == TipoToken.Ponto ||
            token.tipo == TipoToken.AbreColchete ||
            token.tipo == TipoToken.FechaColchete ||
            (tokens[tokens.length - novosTokens.length - 2] &&
                tokens[tokens.length - novosTokens.length - 2].tipo ==
                    TipoToken.AbreColchete &&
                token.tipo == TipoToken.Numero)) {
            novosTokens.push(token);
        }
        else {
            break;
        }
    }
    return novosTokens.length > 0 ? novosTokens.reverse() : null;
}
function tokenizar(codigoFonte) {
    const tokens = new Array();
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
                    num += src.shift();
                }
                else if (eInteiro(src[0])) {
                    num += src.shift();
                }
                else
                    break;
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
                }
                else {
                    tokens.push(token("=", TipoToken.Igual));
                }
                break;
            case "&":
                src.shift();
                if (src[0] == "&") {
                    src.shift();
                    tokens.push(token("&&", TipoToken.E));
                }
                else {
                    tokens.push(token("&", TipoToken.Comercial));
                }
                break;
            case "|":
                src.shift();
                if (src[0] == "|") {
                    src.shift();
                    tokens.push(token("||", TipoToken.Ou));
                }
                else {
                    tokens.push(token("|", TipoToken.Barra));
                }
                break;
            case "!":
                src.shift();
                if (String(src[0]) == "=") {
                    src.shift();
                    tokens.push(token("!=", TipoToken.ComparacaoDiferente));
                }
                else {
                    tokens.push(token("!", TipoToken.Exclamacao));
                }
                break;
            case ">":
                src.shift();
                if (src[0] == "=") {
                    src.shift();
                    tokens.push(token(">=", TipoToken.MaiorIgual));
                }
                else {
                    tokens.push(token(">", TipoToken.Maior));
                }
                break;
            case "<":
                src.shift();
                if (src[0] == "=") {
                    src.shift();
                    tokens.push(token("<=", TipoToken.MenorIgual));
                }
                else {
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
                        if (escapado)
                            continue;
                    }
                    else if (chave == '"') {
                        if (!escapado) {
                            break;
                        }
                        escapado = false;
                    }
                    else if (escapado) {
                        escapado = false;
                        if (ESCAPADOS[chave]) {
                            str += ESCAPADOS[chave];
                            continue;
                        }
                        else {
                            str += `\\`;
                        }
                    }
                    str += chave;
                }
                tokens.push(token(str, TipoToken.Texto, bruto.substring(0, bruto.length - 1)));
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
                    if (identAnteriores == null &&
                        tokens[tokens.length - 1]?.tipo != TipoToken.FechaParentese) {
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
                    }
                    else if (src[1] == "/") {
                        do {
                            src.shift();
                        } while (src.length > 0 && src[0] != "\n");
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
                }
                else if (eAlfabetico(caractere, true)) {
                    let ident = "";
                    ident += src.shift();
                    while (src.length > 0 && eAlfabetico(src[0])) {
                        ident += src.shift();
                    }
                    const reservada = PALAVRAS_CHAVE[ident];
                    if (typeof reservada == "number") {
                        tokens.push(token(ident, reservada));
                    }
                    else {
                        tokens.push(token(ident, TipoToken.Identificador));
                    }
                }
                else if (eIgnoravel(src[0])) {
                    src.shift();
                }
                else {
                    console.error("Caractere não reconhecido encontrado no código-fonte: ", src[0].charCodeAt(0), src[0]);
                    process.exit(1);
                }
                break;
        }
    }
    tokens.push(token("FimDoArquivo", TipoToken.FimDoArquivo));
    return tokens;
}
//# sourceMappingURL=lexer.js.map