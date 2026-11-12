"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.criarAmbienteGlobal = void 0;
exports.avaliar = avaliar;
exports.avaliarProgramaMultiplo = avaliarProgramaMultiplo;
const environment_1 = require("./environment");
Object.defineProperty(exports, "criarAmbienteGlobal", { enumerable: true, get: function () { return environment_1.criarAmbienteGlobal; } });
const values_1 = require("./values");
const expressions_1 = require("./eval/expressions");
const statements_1 = require("./eval/statements");
// O avaliador (interpreter) avalia a AST nó a nó.
function avaliar(no, ambiente) {
    switch (no.tipo) {
        case "Programa":
            return avaliarPrograma(no, ambiente);
        case "DeclaracaoVariavel":
            return (0, statements_1.avaliarDeclaracao)(no, ambiente);
        case "ExpressaoAtribuicao":
            return (0, expressions_1.avaliarExpressao)(no, ambiente);
        case "DeclaracaoSe":
            return (0, statements_1.avaliarDeclaracao)(no, ambiente);
        case "DeclaracaoPara":
            return (0, statements_1.avaliarDeclaracao)(no, ambiente);
        case "DeclaracaoTentarPegar":
            return (0, statements_1.avaliarDeclaracao)(no, ambiente);
        case "DeclaracaoEscolha":
            return (0, statements_1.avaliarDeclaracao)(no, ambiente);
        case "DeclaracaoFuncao":
            return (0, statements_1.avaliarDeclaracao)(no, ambiente);
        default:
            return (0, expressions_1.avaliarExpressao)(no, ambiente);
    }
}
function avaliarPrograma(programa, ambiente) {
    return avaliarProgramaMultiplo(programa.corpo, ambiente);
}
function avaliarProgramaMultiplo(declaracoes, ambiente) {
    let ultimoResultado = (0, values_1.VALOR_NULO)();
    for (const declaracao of declaracoes) {
        ultimoResultado = avaliar(declaracao, ambiente);
    }
    return ultimoResultado;
}
//# sourceMappingURL=interpreter.js.map