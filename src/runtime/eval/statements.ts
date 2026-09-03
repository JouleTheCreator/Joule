import Ambiente from "../environment";
import * as ast from "../../frontend/ast";
import { ValorTempoExecucao, VALOR_NULO, VALOR_NUMERO, VALOR_TEXTO, VALOR_BOOLEANO, VALOR_OBJETO, VALOR_VETOR, VALOR_FUNCAO, TipoValor } from "../values";
import { avaliar } from "../interpreter";

export function avaliarDeclaracao(no: ast.Declaracao, ambiente: Ambiente): ValorTempoExecucao {
    switch (no.tipo) {
        case "DeclaracaoVariavel":
            return avaliarDeclaracaoVariavel(no as ast.DeclaracaoVariavel, ambiente);
        case "DeclaracaoSe":
            return avaliarDeclaracaoSe(no as ast.DeclaracaoSe, ambiente);
        case "DeclaracaoPara":
            return avaliarDeclaracaoPara(no as ast.DeclaracaoPara, ambiente);
        case "DeclaracaoTentarPegar":
            return avaliarDeclaracaoTentarPegar(no as ast.DeclaracaoTentarPegar, ambiente);
        case "DeclaracaoFuncao":
            return avaliarDeclaracaoFuncao(no as ast.DeclaracaoFuncao, ambiente);
        default:
            console.error("Tipo de declaração não reconhecido: ", no.tipo);
            process.exit(1);
    }
}

function avaliarDeclaracaoVariavel(declaracao: ast.DeclaracaoVariavel, ambiente: Ambiente): ValorTempoExecucao {
    const valor = declaracao.valor ? avaliar(declaracao.valor, ambiente) : VALOR_NULO();
    ambiente.declarar(declaracao.identificador, valor);
    return valor;
}

function avaliarDeclaracaoSe(declaracao: ast.DeclaracaoSe, ambiente: Ambiente): ValorTempoExecucao {
    const teste = avaliar(declaracao.teste, ambiente);

    if (eVerdadeiro(teste)) {
        return avaliarBloco(declaracao.corpo, ambiente);
    } else if (declaracao.alternativo) {
        return avaliarBloco(declaracao.alternativo, ambiente);
    }

    return VALOR_NULO();
}

function avaliarDeclaracaoPara(declaracao: ast.DeclaracaoPara, ambiente: Ambiente): ValorTempoExecucao {
    const escopo = new Ambiente(ambiente);

    avaliarDeclaracaoVariavel(declaracao.inicializacao, escopo);

    while (true) {
        const teste = avaliar(declaracao.teste, escopo);

        if (!eVerdadeiro(teste)) break;

        avaliarBloco(declaracao.corpo, escopo);

        avaliar(declaracao.atualizacao, escopo);
    }

    return VALOR_NULO();
}

function avaliarDeclaracaoTentarPegar(declaracao: ast.DeclaracaoTentarPegar, ambiente: Ambiente): ValorTempoExecucao {
    try {
        return avaliarBloco(declaracao.corpo, ambiente);
    } catch (erro: any) {
        if (declaracao.alternativo && declaracao.alternativo.length > 0) {
            const escopoPegar = new Ambiente(ambiente);
            escopoPegar.declarar("erro", VALOR_TEXTO(String(erro?.message || erro)));
            return avaliarBloco(declaracao.alternativo, escopoPegar);
        }
        return VALOR_NULO();
    }
}

function avaliarDeclaracaoFuncao(declaracao: ast.DeclaracaoFuncao, ambiente: Ambiente): ValorTempoExecucao {
    const fn = VALOR_FUNCAO(declaracao.nome, declaracao, ambiente);
    ambiente.declarar(declaracao.nome, fn);
    return VALOR_NULO();
}

function avaliarBloco(declaracoes: ast.Declaracao[], ambiente: Ambiente): ValorTempoExecucao {
    let ultimoResultado: ValorTempoExecucao = VALOR_NULO();

    for (const declaracao of declaracoes) {
        ultimoResultado = avaliar(declaracao, ambiente);
    }

    return ultimoResultado;
}

function eVerdadeiro(valor: ValorTempoExecucao): boolean {
    if (valor.tipo == "booleano") return valor.valor;
    if (valor.tipo == "nulo") return false;
    if (valor.tipo == "numero") return valor.valor != 0;
    if (valor.tipo == "texto") return valor.valor.length > 0;

    return true;
}
