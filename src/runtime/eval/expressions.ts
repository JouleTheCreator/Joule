import Ambiente from "../environment";
import * as ast from "../../frontend/ast";
import { ValorTempoExecucao, VALOR_NULO, VALOR_NUMERO, VALOR_TEXTO, VALOR_BOOLEANO, VALOR_OBJETO, VALOR_VETOR, VALOR_FUNCAO, TipoValor } from "../values";
import { avaliar } from "../interpreter";

export function avaliarExpressao(no: ast.Expressao, ambiente: Ambiente): ValorTempoExecucao {
    switch (no.tipo) {
        case "LiteralNumerico":
            return VALOR_NUMERO((no as ast.LiteralNumerico).valor);
        case "LiteralTexto":
            return VALOR_TEXTO((no as ast.LiteralTexto).valor);
        case "LiteralBooleano":
            return VALOR_BOOLEANO((no as ast.LiteralBooleano).valor);
        case "LiteralNulo":
            return VALOR_NULO();
        case "Identificador":
            return avaliarIdentificador(no as ast.Identificador, ambiente);
        case "ExpressaoBinaria":
            return avaliarExpressaoBinaria(no as ast.ExpressaoBinaria, ambiente);
        case "ExpressaoChamada":
            return avaliarChamada(no as ast.ExpressaoChamada, ambiente);
        case "ExpressaoMembro":
            return avaliarMembro(no as ast.ExpressaoMembro, ambiente);
        case "ExpressaoAtribuicao":
            return avaliarAtribuicao(no as ast.ExpressaoAtribuicao, ambiente);
        case "ExpressaoUnaria":
            return avaliarExpressaoUnaria(no as ast.ExpressaoUnaria, ambiente);
        case "LiteralObjeto":
            return avaliarObjeto(no as ast.LiteralObjeto, ambiente);
        case "LiteralVetor":
            return avaliarVetor(no as ast.LiteralVetor, ambiente);
        default:
            console.error("Tipo de expressão não reconhecido: ", no.tipo);
            process.exit(1);
    }
}

function avaliarExpressaoUnaria(no: ast.ExpressaoUnaria, ambiente: Ambiente): ValorTempoExecucao {
    const operando = avaliar(no.operando, ambiente);
    const operador = no.operador;

    if (operador === "!") {
        return VALOR_BOOLEANO(!operando.valor);
    }

    if (operador === "-") {
        if (operando.tipo === "numero") {
            return VALOR_NUMERO(-operando.valor);
        }
        console.error("Operador unário '-' requer valor numérico, encontrado: ", operando.tipo);
        process.exit(1);
    }

    console.error("Operador unário não reconhecido: ", operador);
    process.exit(1);
}

function avaliarIdentificador(identificador: ast.Identificador, ambiente: Ambiente): ValorTempoExecucao {
    const valor = ambiente.pesquisar(identificador.simbolo);

    return valor;
}

function avaliarExpressaoBinaria(noEsquerdo: ast.ExpressaoBinaria, ambiente: Ambiente): ValorTempoExecucao {
    const esquerda = avaliar(noEsquerdo.esquerda, ambiente);
    const direita = avaliar(noEsquerdo.direita, ambiente);
    const operador = noEsquerdo.operador;

    // Operadores aritméticos e de comparação para números
    if (esquerda.tipo == "numero" && direita.tipo == "numero") {
        switch (operador) {
            case "+":
                return VALOR_NUMERO(esquerda.valor + direita.valor);
            case "-":
                return VALOR_NUMERO(esquerda.valor - direita.valor);
            case "*":
                return VALOR_NUMERO(esquerda.valor * direita.valor);
            case "/":
                return VALOR_NUMERO(esquerda.valor / direita.valor);
            case "%":
                return VALOR_NUMERO(esquerda.valor % direita.valor);
            case "==":
                return VALOR_BOOLEANO(esquerda.valor == direita.valor);
            case "!=":
                return VALOR_BOOLEANO(esquerda.valor != direita.valor);
            case "<":
                return VALOR_BOOLEANO(esquerda.valor < direita.valor);
            case ">":
                return VALOR_BOOLEANO(esquerda.valor > direita.valor);
            case ">=":
                return VALOR_BOOLEANO(esquerda.valor >= direita.valor);
            case "<=":
                return VALOR_BOOLEANO(esquerda.valor <= direita.valor);
            default:
                console.error("Operador não reconhecido para números: ", operador);
                process.exit(1);
        }
    }

    // Operadores para texto
    if (esquerda.tipo == "texto" && direita.tipo == "texto") {
        switch (operador) {
            case "+":
                return VALOR_TEXTO(esquerda.valor + direita.valor);
            case "==":
                return VALOR_BOOLEANO(esquerda.valor == direita.valor);
            case "!=":
                return VALOR_BOOLEANO(esquerda.valor != direita.valor);
            default:
                console.error("Operador não reconhecido para texto: ", operador);
                process.exit(1);
        }
    }

    // Operadores para texto + número (concatenação)
    if (esquerda.tipo == "texto" && direita.tipo == "numero") {
        switch (operador) {
            case "+":
                return VALOR_TEXTO(esquerda.valor + direita.valor);
            case "*":
                return VALOR_TEXTO(esquerda.valor.repeat(direita.valor));
            default:
                console.error("Operador não reconhecido para texto e numero: ", operador);
                process.exit(1);
        }
    }

    // Operadores lógicos (booleanos)
    if (esquerda.tipo == "booleano" && direita.tipo == "booleano") {
        switch (operador) {
            case "&&":
                return VALOR_BOOLEANO(esquerda.valor && direita.valor);
            case "||":
                return VALOR_BOOLEANO(esquerda.valor || direita.valor);
            case "==":
                return VALOR_BOOLEANO(esquerda.valor == direita.valor);
            case "!=":
                return VALOR_BOOLEANO(esquerda.valor != direita.valor);
            default:
                console.error("Operador não reconhecido para booleanos: ", operador);
                process.exit(1);
        }
    }

    // Igualdade/desigualdade entre tipos diferentes
    switch (operador) {
        case "==":
            return VALOR_BOOLEANO(esquerda.valor == direita.valor);
        case "!=":
            return VALOR_BOOLEANO(esquerda.valor != direita.valor);
        case "&&":
            return VALOR_BOOLEANO(esquerda.valor && direita.valor);
        case "||":
            return VALOR_BOOLEANO(esquerda.valor || direita.valor);
        default:
            console.error("Operador não reconhecido para tipos " + esquerda.tipo + " e " + direita.tipo + ": ", operador);
            process.exit(1);
    }
}

function avaliarChamada(chamada: ast.ExpressaoChamada, ambiente: Ambiente): ValorTempoExecucao {
    const chamador = avaliar(chamada.chamador, ambiente);

    if (chamador.tipo == "nativo-fn") {
        const resultado = (chamador as any).chamar(chamada.argumentos.map((argumento) => avaliar(argumento, ambiente)), ambiente);
        return resultado;
    }

    if (chamador.tipo == "funcao") {
        const fn = chamador as any;
        const escopo = new Ambiente(fn.escopoPai);

        for (let i = 0; i < fn.corpo.parametros.length; i++) {
            const parametro = fn.corpo.parametros[i];
            const argumento = chamada.argumentos[i];

            const valor = argumento ? avaliar(argumento, ambiente) : VALOR_NULO();
            escopo.declarar(parametro, valor);
        }

        return avaliarBloco(fn.corpo.corpo, escopo);
    }

    console.error("Não é possível chamar valor do tipo: ", chamador.tipo);
    process.exit(1);
}

function avaliarBloco(declaracoes: ast.Declaracao[], ambiente: Ambiente): ValorTempoExecucao {
    let ultimoResultado: ValorTempoExecucao = VALOR_NULO();

    for (const declaracao of declaracoes) {
        ultimoResultado = avaliar(declaracao, ambiente);
    }

    return ultimoResultado;
}

import { avaliar as avaliarDeclaracaoRef } from "../interpreter";

function avaliarMembro(membro: ast.ExpressaoMembro, ambiente: Ambiente): ValorTempoExecucao {
    const objeto = avaliar(membro.objeto, ambiente);

    if (objeto.tipo == "objeto") {
        if (membro.computado) {
            const propriedade = avaliar(membro.propriedade, ambiente);
            return objeto.valor[propriedade.valor] ?? VALOR_NULO();
        } else {
            const propriedade = (membro.propriedade as ast.Identificador).simbolo;
            return objeto.valor[propriedade] ?? VALOR_NULO();
        }
    }

    if (objeto.tipo == "vetor") {
        if (membro.computado) {
            const indice = avaliar(membro.propriedade, ambiente);
            return objeto.valor[indice.valor] ?? VALOR_NULO();
        }
    }

    if (objeto.tipo == "texto") {
        if (membro.computado) {
            const indice = avaliar(membro.propriedade, ambiente);
            return VALOR_TEXTO(objeto.valor.charAt(indice.valor));
        }
    }

    console.error("Não é possível acessar membro de valor do tipo: ", objeto.tipo);
    process.exit(1);
}

function avaliarAtribuicao(atribuicao: ast.ExpressaoAtribuicao, ambiente: Ambiente): ValorTempoExecucao {
    const valor = avaliar(atribuicao.valor, ambiente);

    if (atribuicao.atribuido.tipo == "Identificador") {
        const nome = (atribuicao.atribuido as ast.Identificador).simbolo;
        const escopoPai = ambiente.resolver(nome);

        if (!escopoPai) {
            ambiente.declarar(nome, valor);
        } else {
            escopoPai.atribuir(nome, valor);
        }

        return valor;
    }

    if (atribuicao.atribuido.tipo == "ExpressaoMembro") {
        const membro = atribuicao.atribuido as ast.ExpressaoMembro;
        const objeto = avaliar(membro.objeto, ambiente);

        if (objeto.tipo == "objeto") {
            const propriedade = membro.computado
                ? avaliar(membro.propriedade, ambiente).valor
                : (membro.propriedade as ast.Identificador).simbolo;

            objeto.valor[propriedade] = valor;
            return valor;
        }

        if (objeto.tipo == "vetor") {
            if (membro.computado) {
                const indice = avaliar(membro.propriedade, ambiente).valor;
                objeto.valor[indice] = valor;
                return valor;
            }
        }
    }

    console.error("Atribuição inválida");
    process.exit(1);
}

function avaliarObjeto(objeto: ast.LiteralObjeto, ambiente: Ambiente): ValorTempoExecucao {
    const propriedades: Record<string, ValorTempoExecucao> = {};

    for (const prop of objeto.propriedades) {
        propriedades[prop.chave] = prop.valor ? avaliar(prop.valor, ambiente) : VALOR_NULO();
    }

    return VALOR_OBJETO(propriedades);
}

function avaliarVetor(vetor: ast.LiteralVetor, ambiente: Ambiente): ValorTempoExecucao {
    const valores = vetor.valores.map((valor) => avaliar(valor, ambiente));
    return VALOR_VETOR(valores);
}
