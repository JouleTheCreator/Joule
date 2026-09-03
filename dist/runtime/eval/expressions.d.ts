import Ambiente from "../environment";
import * as ast from "../../frontend/ast";
import { ValorTempoExecucao } from "../values";
export declare function avaliarExpressao(no: ast.Expressao, ambiente: Ambiente): ValorTempoExecucao;
