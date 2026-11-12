"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.avaliarDeclaracao = avaliarDeclaracao;
const environment_1 = __importDefault(require("../environment"));
const values_1 = require("../values");
const interpreter_1 = require("../interpreter");
function avaliarDeclaracao(no, ambiente) {
    switch (no.tipo) {
        case "DeclaracaoVariavel":
            return avaliarDeclaracaoVariavel(no, ambiente);
        case "DeclaracaoSe":
            return avaliarDeclaracaoSe(no, ambiente);
        case "DeclaracaoPara":
            return avaliarDeclaracaoPara(no, ambiente);
        case "DeclaracaoEscolha":
            return avaliarDeclaracaoEscolha(no, ambiente);
        case "DeclaracaoTentarPegar":
            return avaliarDeclaracaoTentarPegar(no, ambiente);
        case "DeclaracaoFuncao":
            return avaliarDeclaracaoFuncao(no, ambiente);
        default:
            console.error("Tipo de declaração não reconhecido: ", no.tipo);
            process.exit(1);
    }
}
function avaliarDeclaracaoVariavel(declaracao, ambiente) {
    const valor = declaracao.valor
        ? (0, interpreter_1.avaliar)(declaracao.valor, ambiente)
        : (0, values_1.VALOR_NULO)();
    ambiente.declarar(declaracao.identificador, valor);
    return valor;
}
function avaliarDeclaracaoSe(declaracao, ambiente) {
    const teste = (0, interpreter_1.avaliar)(declaracao.teste, ambiente);
    if (eVerdadeiro(teste)) {
        return avaliarBloco(declaracao.corpo, ambiente);
    }
    else if (declaracao.alternativo) {
        return avaliarBloco(declaracao.alternativo, ambiente);
    }
    return (0, values_1.VALOR_NULO)();
}
function avaliarDeclaracaoPara(declaracao, ambiente) {
    const escopo = new environment_1.default(ambiente);
    avaliarDeclaracaoVariavel(declaracao.inicializacao, escopo);
    while (true) {
        const teste = (0, interpreter_1.avaliar)(declaracao.teste, escopo);
        if (!eVerdadeiro(teste))
            break;
        avaliarBloco(declaracao.corpo, escopo);
        (0, interpreter_1.avaliar)(declaracao.atualizacao, escopo);
    }
    return (0, values_1.VALOR_NULO)();
}
function avaliarDeclaracaoEscolha(declaracao, ambiente) {
    // O discriminante e avaliado UMA unica vez.
    const valor = (0, interpreter_1.avaliar)(declaracao.discriminante, ambiente);
    for (const caso of declaracao.casos) {
        const valorDoCaso = (0, interpreter_1.avaliar)(caso.teste, ambiente);
        if (saoIguais(valor, valorDoCaso)) {
            // Cada caso roda no seu proprio escopo: nao existe fall-through,
            // e variaveis declaradas dentro do caso nao vazam para fora.
            return avaliarBloco(caso.corpo, new environment_1.default(ambiente));
        }
    }
    if (declaracao.padrao) {
        return avaliarBloco(declaracao.padrao, new environment_1.default(ambiente));
    }
    return (0, values_1.VALOR_NULO)();
}
/**
 * Comparacao usada pelo 'escolha'. Equivale ao == da linguagem:
 * tipos diferentes nunca sao iguais; objetos, vetores e funcoes
 * sao comparados por identidade.
 */
function saoIguais(a, b) {
    if (a.tipo !== b.tipo)
        return false;
    switch (a.tipo) {
        case "nulo":
            return true;
        case "numero":
        case "texto":
        case "booleano":
            return a.valor === b.valor;
        default:
            return a === b;
    }
}
function avaliarDeclaracaoTentarPegar(declaracao, ambiente) {
    try {
        return avaliarBloco(declaracao.corpo, ambiente);
    }
    catch (erro) {
        if (declaracao.alternativo && declaracao.alternativo.length > 0) {
            const escopoPegar = new environment_1.default(ambiente);
            escopoPegar.declarar("erro", (0, values_1.VALOR_TEXTO)(String(erro?.message || erro)));
            return avaliarBloco(declaracao.alternativo, escopoPegar);
        }
        return (0, values_1.VALOR_NULO)();
    }
}
function avaliarDeclaracaoFuncao(declaracao, ambiente) {
    const fn = (0, values_1.VALOR_FUNCAO)(declaracao.nome, declaracao, ambiente);
    ambiente.declarar(declaracao.nome, fn);
    return (0, values_1.VALOR_NULO)();
}
function avaliarBloco(declaracoes, ambiente) {
    let ultimoResultado = (0, values_1.VALOR_NULO)();
    for (const declaracao of declaracoes) {
        ultimoResultado = (0, interpreter_1.avaliar)(declaracao, ambiente);
    }
    return ultimoResultado;
}
function eVerdadeiro(valor) {
    if (valor.tipo == "booleano")
        return valor.valor;
    if (valor.tipo == "nulo")
        return false;
    if (valor.tipo == "numero")
        return valor.valor != 0;
    if (valor.tipo == "texto")
        return valor.valor.length > 0;
    return true;
}
//# sourceMappingURL=statements.js.map