import Ambiente, { criarAmbienteGlobal } from "./environment";
import * as ast from "../frontend/ast";
import { ValorTempoExecucao, VALOR_NULO, VALOR_NUMERO, VALOR_TEXTO, VALOR_BOOLEANO, VALOR_OBJETO, VALOR_VETOR, VALOR_FUNCAO, TipoValor } from "./values";
import { avaliarExpressao } from "./eval/expressions";
import { avaliarDeclaracao } from "./eval/statements";

// O avaliador (interpreter) avalia a AST nó a nó.
export function avaliar(no: ast.Declaracao | ast.Expressao, ambiente: Ambiente): ValorTempoExecucao {
    switch (no.tipo) {
        case "Programa":
            return avaliarPrograma(no as ast.Programa, ambiente);
        case "DeclaracaoVariavel":
            return avaliarDeclaracao(no as ast.DeclaracaoVariavel, ambiente);
        case "ExpressaoAtribuicao":
            return avaliarExpressao(no as ast.ExpressaoAtribuicao, ambiente);
        case "DeclaracaoSe":
            return avaliarDeclaracao(no as ast.DeclaracaoSe, ambiente);
        case "DeclaracaoPara":
            return avaliarDeclaracao(no as ast.DeclaracaoPara, ambiente);
        case "DeclaracaoTentarPegar":
            return avaliarDeclaracao(no as ast.DeclaracaoTentarPegar, ambiente);
        case "DeclaracaoFuncao":
            return avaliarDeclaracao(no as ast.DeclaracaoFuncao, ambiente);
        default:
            return avaliarExpressao(no as ast.Expressao, ambiente);
    }
}

function avaliarPrograma(programa: ast.Programa, ambiente: Ambiente): ValorTempoExecucao {
    return avaliarProgramaMultiplo(programa.corpo, ambiente);
}

export function avaliarProgramaMultiplo(declaracoes: ast.Declaracao[], ambiente: Ambiente): ValorTempoExecucao {
    let ultimoResultado: ValorTempoExecucao = VALOR_NULO();

    for (const declaracao of declaracoes) {
        ultimoResultado = avaliar(declaracao, ambiente);
    }

    return ultimoResultado;
}

// Exportar criarAmbienteGlobal para ser usado pelo ponto de entrada principal
export { criarAmbienteGlobal };
