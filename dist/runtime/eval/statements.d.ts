import Ambiente from "../environment";
import * as ast from "../../frontend/ast";
import { ValorTempoExecucao } from "../values";
export declare function avaliarDeclaracao(no: ast.Declaracao, ambiente: Ambiente): ValorTempoExecucao;
