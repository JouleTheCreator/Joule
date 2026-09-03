"use strict";
// --- Linguagem Joule                                           ---
// -----------------------------------------------------------
Object.defineProperty(exports, "__esModule", { value: true });
exports.VALOR_NULO = VALOR_NULO;
exports.VALOR_NUMERO = VALOR_NUMERO;
exports.VALOR_TEXTO = VALOR_TEXTO;
exports.VALOR_BOOLEANO = VALOR_BOOLEANO;
exports.VALOR_OBJETO = VALOR_OBJETO;
exports.VALOR_VETOR = VALOR_VETOR;
exports.VALOR_NATIVO_FN = VALOR_NATIVO_FN;
exports.VALOR_FUNCAO = VALOR_FUNCAO;
exports.VALOR_VAZIO = VALOR_VAZIO;
function VALOR_NULO() {
    return { tipo: "nulo", valor: null };
}
function VALOR_NUMERO(valor) {
    return { tipo: "numero", valor };
}
function VALOR_TEXTO(valor) {
    return { tipo: "texto", valor };
}
function VALOR_BOOLEANO(valor) {
    return { tipo: "booleano", valor };
}
function VALOR_OBJETO(valor) {
    return { tipo: "objeto", valor };
}
function VALOR_VETOR(valor) {
    return { tipo: "vetor", valor };
}
function VALOR_NATIVO_FN(nome, chamar) {
    return { tipo: "nativo-fn", valor: nome, chamar };
}
function VALOR_FUNCAO(nome, corpo, escopoPai) {
    return {
        tipo: "funcao",
        valor: nome,
        corpo,
        escopoPai,
    };
}
function VALOR_VAZIO() {
    return VALOR_NULO();
}
//# sourceMappingURL=values.js.map