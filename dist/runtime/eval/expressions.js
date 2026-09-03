"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.avaliarExpressao = avaliarExpressao;
const environment_1 = __importDefault(require("../environment"));
const values_1 = require("../values");
const interpreter_1 = require("../interpreter");
function avaliarExpressao(no, ambiente) {
    switch (no.tipo) {
        case "LiteralNumerico":
            return (0, values_1.VALOR_NUMERO)(no.valor);
        case "LiteralTexto":
            return (0, values_1.VALOR_TEXTO)(no.valor);
        case "LiteralBooleano":
            return (0, values_1.VALOR_BOOLEANO)(no.valor);
        case "LiteralNulo":
            return (0, values_1.VALOR_NULO)();
        case "Identificador":
            return avaliarIdentificador(no, ambiente);
        case "ExpressaoBinaria":
            return avaliarExpressaoBinaria(no, ambiente);
        case "ExpressaoChamada":
            return avaliarChamada(no, ambiente);
        case "ExpressaoMembro":
            return avaliarMembro(no, ambiente);
        case "ExpressaoAtribuicao":
            return avaliarAtribuicao(no, ambiente);
        case "ExpressaoUnaria":
            return avaliarExpressaoUnaria(no, ambiente);
        case "LiteralObjeto":
            return avaliarObjeto(no, ambiente);
        case "LiteralVetor":
            return avaliarVetor(no, ambiente);
        default:
            console.error("Tipo de expressão não reconhecido: ", no.tipo);
            process.exit(1);
    }
}
function avaliarExpressaoUnaria(no, ambiente) {
    const operando = (0, interpreter_1.avaliar)(no.operando, ambiente);
    const operador = no.operador;
    if (operador === "!") {
        return (0, values_1.VALOR_BOOLEANO)(!operando.valor);
    }
    if (operador === "-") {
        if (operando.tipo === "numero") {
            return (0, values_1.VALOR_NUMERO)(-operando.valor);
        }
        console.error("Operador unário '-' requer valor numérico, encontrado: ", operando.tipo);
        process.exit(1);
    }
    console.error("Operador unário não reconhecido: ", operador);
    process.exit(1);
}
function avaliarIdentificador(identificador, ambiente) {
    const valor = ambiente.pesquisar(identificador.simbolo);
    return valor;
}
function avaliarExpressaoBinaria(noEsquerdo, ambiente) {
    const esquerda = (0, interpreter_1.avaliar)(noEsquerdo.esquerda, ambiente);
    const direita = (0, interpreter_1.avaliar)(noEsquerdo.direita, ambiente);
    const operador = noEsquerdo.operador;
    // Operadores aritméticos e de comparação para números
    if (esquerda.tipo == "numero" && direita.tipo == "numero") {
        switch (operador) {
            case "+":
                return (0, values_1.VALOR_NUMERO)(esquerda.valor + direita.valor);
            case "-":
                return (0, values_1.VALOR_NUMERO)(esquerda.valor - direita.valor);
            case "*":
                return (0, values_1.VALOR_NUMERO)(esquerda.valor * direita.valor);
            case "/":
                return (0, values_1.VALOR_NUMERO)(esquerda.valor / direita.valor);
            case "%":
                return (0, values_1.VALOR_NUMERO)(esquerda.valor % direita.valor);
            case "==":
                return (0, values_1.VALOR_BOOLEANO)(esquerda.valor == direita.valor);
            case "!=":
                return (0, values_1.VALOR_BOOLEANO)(esquerda.valor != direita.valor);
            case "<":
                return (0, values_1.VALOR_BOOLEANO)(esquerda.valor < direita.valor);
            case ">":
                return (0, values_1.VALOR_BOOLEANO)(esquerda.valor > direita.valor);
            case ">=":
                return (0, values_1.VALOR_BOOLEANO)(esquerda.valor >= direita.valor);
            case "<=":
                return (0, values_1.VALOR_BOOLEANO)(esquerda.valor <= direita.valor);
            default:
                console.error("Operador não reconhecido para números: ", operador);
                process.exit(1);
        }
    }
    // Operadores para texto
    if (esquerda.tipo == "texto" && direita.tipo == "texto") {
        switch (operador) {
            case "+":
                return (0, values_1.VALOR_TEXTO)(esquerda.valor + direita.valor);
            case "==":
                return (0, values_1.VALOR_BOOLEANO)(esquerda.valor == direita.valor);
            case "!=":
                return (0, values_1.VALOR_BOOLEANO)(esquerda.valor != direita.valor);
            default:
                console.error("Operador não reconhecido para texto: ", operador);
                process.exit(1);
        }
    }
    // Operadores para texto + número (concatenação)
    if (esquerda.tipo == "texto" && direita.tipo == "numero") {
        switch (operador) {
            case "+":
                return (0, values_1.VALOR_TEXTO)(esquerda.valor + direita.valor);
            case "*":
                return (0, values_1.VALOR_TEXTO)(esquerda.valor.repeat(direita.valor));
            default:
                console.error("Operador não reconhecido para texto e numero: ", operador);
                process.exit(1);
        }
    }
    // Operadores lógicos (booleanos)
    if (esquerda.tipo == "booleano" && direita.tipo == "booleano") {
        switch (operador) {
            case "&&":
                return (0, values_1.VALOR_BOOLEANO)(esquerda.valor && direita.valor);
            case "||":
                return (0, values_1.VALOR_BOOLEANO)(esquerda.valor || direita.valor);
            case "==":
                return (0, values_1.VALOR_BOOLEANO)(esquerda.valor == direita.valor);
            case "!=":
                return (0, values_1.VALOR_BOOLEANO)(esquerda.valor != direita.valor);
            default:
                console.error("Operador não reconhecido para booleanos: ", operador);
                process.exit(1);
        }
    }
    // Igualdade/desigualdade entre tipos diferentes
    switch (operador) {
        case "==":
            return (0, values_1.VALOR_BOOLEANO)(esquerda.valor == direita.valor);
        case "!=":
            return (0, values_1.VALOR_BOOLEANO)(esquerda.valor != direita.valor);
        case "&&":
            return (0, values_1.VALOR_BOOLEANO)(esquerda.valor && direita.valor);
        case "||":
            return (0, values_1.VALOR_BOOLEANO)(esquerda.valor || direita.valor);
        default:
            console.error("Operador não reconhecido para tipos " + esquerda.tipo + " e " + direita.tipo + ": ", operador);
            process.exit(1);
    }
}
function avaliarChamada(chamada, ambiente) {
    const chamador = (0, interpreter_1.avaliar)(chamada.chamador, ambiente);
    if (chamador.tipo == "nativo-fn") {
        const resultado = chamador.chamar(chamada.argumentos.map((argumento) => (0, interpreter_1.avaliar)(argumento, ambiente)), ambiente);
        return resultado;
    }
    if (chamador.tipo == "funcao") {
        const fn = chamador;
        const escopo = new environment_1.default(fn.escopoPai);
        for (let i = 0; i < fn.corpo.parametros.length; i++) {
            const parametro = fn.corpo.parametros[i];
            const argumento = chamada.argumentos[i];
            const valor = argumento ? (0, interpreter_1.avaliar)(argumento, ambiente) : (0, values_1.VALOR_NULO)();
            escopo.declarar(parametro, valor);
        }
        return avaliarBloco(fn.corpo.corpo, escopo);
    }
    console.error("Não é possível chamar valor do tipo: ", chamador.tipo);
    process.exit(1);
}
function avaliarBloco(declaracoes, ambiente) {
    let ultimoResultado = (0, values_1.VALOR_NULO)();
    for (const declaracao of declaracoes) {
        ultimoResultado = (0, interpreter_1.avaliar)(declaracao, ambiente);
    }
    return ultimoResultado;
}
function avaliarMembro(membro, ambiente) {
    const objeto = (0, interpreter_1.avaliar)(membro.objeto, ambiente);
    if (objeto.tipo == "objeto") {
        if (membro.computado) {
            const propriedade = (0, interpreter_1.avaliar)(membro.propriedade, ambiente);
            return objeto.valor[propriedade.valor] ?? (0, values_1.VALOR_NULO)();
        }
        else {
            const propriedade = membro.propriedade.simbolo;
            return objeto.valor[propriedade] ?? (0, values_1.VALOR_NULO)();
        }
    }
    if (objeto.tipo == "vetor") {
        if (membro.computado) {
            const indice = (0, interpreter_1.avaliar)(membro.propriedade, ambiente);
            return objeto.valor[indice.valor] ?? (0, values_1.VALOR_NULO)();
        }
    }
    if (objeto.tipo == "texto") {
        if (membro.computado) {
            const indice = (0, interpreter_1.avaliar)(membro.propriedade, ambiente);
            return (0, values_1.VALOR_TEXTO)(objeto.valor.charAt(indice.valor));
        }
    }
    console.error("Não é possível acessar membro de valor do tipo: ", objeto.tipo);
    process.exit(1);
}
function avaliarAtribuicao(atribuicao, ambiente) {
    const valor = (0, interpreter_1.avaliar)(atribuicao.valor, ambiente);
    if (atribuicao.atribuido.tipo == "Identificador") {
        const nome = atribuicao.atribuido.simbolo;
        const escopoPai = ambiente.resolver(nome);
        if (!escopoPai) {
            ambiente.declarar(nome, valor);
        }
        else {
            escopoPai.atribuir(nome, valor);
        }
        return valor;
    }
    if (atribuicao.atribuido.tipo == "ExpressaoMembro") {
        const membro = atribuicao.atribuido;
        const objeto = (0, interpreter_1.avaliar)(membro.objeto, ambiente);
        if (objeto.tipo == "objeto") {
            const propriedade = membro.computado
                ? (0, interpreter_1.avaliar)(membro.propriedade, ambiente).valor
                : membro.propriedade.simbolo;
            objeto.valor[propriedade] = valor;
            return valor;
        }
        if (objeto.tipo == "vetor") {
            if (membro.computado) {
                const indice = (0, interpreter_1.avaliar)(membro.propriedade, ambiente).valor;
                objeto.valor[indice] = valor;
                return valor;
            }
        }
    }
    console.error("Atribuição inválida");
    process.exit(1);
}
function avaliarObjeto(objeto, ambiente) {
    const propriedades = {};
    for (const prop of objeto.propriedades) {
        propriedades[prop.chave] = prop.valor ? (0, interpreter_1.avaliar)(prop.valor, ambiente) : (0, values_1.VALOR_NULO)();
    }
    return (0, values_1.VALOR_OBJETO)(propriedades);
}
function avaliarVetor(vetor, ambiente) {
    const valores = vetor.valores.map((valor) => (0, interpreter_1.avaliar)(valor, ambiente));
    return (0, values_1.VALOR_VETOR)(valores);
}
//# sourceMappingURL=expressions.js.map