import Ambiente, { criarAmbienteGlobal } from "./environment";
import * as ast from "../frontend/ast";
import { ValorTempoExecucao } from "./values";
export declare function avaliar(no: ast.Declaracao | ast.Expressao, ambiente: Ambiente): ValorTempoExecucao;
export declare function avaliarProgramaMultiplo(declaracoes: ast.Declaracao[], ambiente: Ambiente): ValorTempoExecucao;
export { criarAmbienteGlobal };
