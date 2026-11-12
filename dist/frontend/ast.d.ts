export type TipoNo = "Programa" | "DeclaracaoVariavel" | "DeclaracaoFuncao" | "DeclaracaoSe" | "DeclaracaoPara" | "DeclaracaoEscolha" | "DeclaracaoTentarPegar" | "ExpressaoAtribuicao" | "ExpressaoMembro" | "ExpressaoChamada" | "Propriedade" | "LiteralObjeto" | "LiteralVetor" | "LiteralNumerico" | "Identificador" | "LiteralTexto" | "LiteralBooleano" | "LiteralNulo" | "ExpressaoBinaria" | "ExpressaoUnaria";
/**
 * Declarações não resultam em um valor em tempo de execução.
Elas contêm uma ou mais expressões internamente */
export interface Declaracao {
    tipo: TipoNo;
}
/**
 * Define um bloco que contém muitas declarações.
 * -  Apenas um programa será contido em um arquivo.
 */
export interface Programa extends Declaracao {
    tipo: "Programa";
    corpo: Declaracao[];
}
export interface DeclaracaoVariavel extends Declaracao {
    tipo: "DeclaracaoVariavel";
    constante: boolean;
    identificador: string;
    valor?: Expressao;
}
export interface DeclaracaoSe extends Declaracao {
    tipo: "DeclaracaoSe";
    teste: Expressao;
    corpo: Declaracao[];
    alternativo?: Declaracao[];
}
export interface DeclaracaoTentarPegar extends Declaracao {
    tipo: "DeclaracaoTentarPegar";
    corpo: Declaracao[];
    alternativo: Declaracao[];
}
export interface DeclaracaoFuncao extends Declaracao {
    tipo: "DeclaracaoFuncao";
    parametros: string[];
    nome: string;
    corpo: Declaracao[];
}
export interface DeclaracaoPara extends Declaracao {
    tipo: "DeclaracaoPara";
    inicializacao: DeclaracaoVariavel;
    teste: Expressao;
    atualizacao: ExpressaoAtribuicao;
    corpo: Declaracao[];
}
/**
 * Um ramo de uma DeclaracaoEscolha: `caso <teste> { ... }`.
 * Nao e um No da AST por si so, apenas agrupa teste + corpo.
 */
export interface CasoEscolha {
    teste: Expressao;
    corpo: Declaracao[];
}
/**
 * escolha <discriminante> {
 *     caso <teste> { ... }
 *     padrao { ... }
 * }
 * Nao existe fall-through: apenas o primeiro caso correspondente executa.
 */
export interface DeclaracaoEscolha extends Declaracao {
    tipo: "DeclaracaoEscolha";
    discriminante: Expressao;
    casos: CasoEscolha[];
    padrao?: Declaracao[];
}
/**  Expressões resultarão em um valor em tempo de execução, ao contrário de Declarações */
export interface Expressao extends Declaracao {
}
/**
 * Uma operação com dois lados separados por um operador.
 * Ambos os lados podem ser QUALQUER Expressão Complexa.
 * - Operadores Suportados -> + | - | / | * | %
 */
export interface ExpressaoBinaria extends Expressao {
    tipo: "ExpressaoBinaria";
    esquerda: Expressao;
    direita: Expressao;
    operador: string;
}
export interface ExpressaoChamada extends Expressao {
    tipo: "ExpressaoChamada";
    argumentos: Expressao[];
    chamador: Expressao;
}
export interface ExpressaoMembro extends Expressao {
    tipo: "ExpressaoMembro";
    objeto: Expressao;
    propriedade: Expressao;
    computado: boolean;
}
export interface ExpressaoUnaria extends Expressao {
    tipo: "ExpressaoUnaria";
    operador: string;
    operando: Expressao;
}
export interface ExpressaoAtribuicao extends Expressao {
    tipo: "ExpressaoAtribuicao";
    atribuido: Expressao;
    valor: Expressao;
}
/**
 * Representa uma variável ou símbolo definido pelo usuário no código-fonte.
 */
export interface Identificador extends Expressao {
    tipo: "Identificador";
    simbolo: string;
}
/**
 * Representa uma constante numérica no código-fonte.
 */
export interface LiteralNumerico extends Expressao {
    tipo: "LiteralNumerico";
    valor: number;
}
export interface LiteralTexto extends Expressao {
    tipo: "LiteralTexto";
    valor: string;
}
export interface LiteralBooleano extends Expressao {
    tipo: "LiteralBooleano";
    valor: boolean;
}
export interface LiteralNulo extends Expressao {
    tipo: "LiteralNulo";
}
export interface Propriedade extends Expressao {
    tipo: "Propriedade";
    chave: string;
    valor?: Expressao;
}
export interface LiteralObjeto extends Expressao {
    tipo: "LiteralObjeto";
    propriedades: Propriedade[];
}
export interface LiteralVetor extends Expressao {
    tipo: "LiteralVetor";
    valores: Array<Expressao>;
}
