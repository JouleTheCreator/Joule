import {
  ValorTempoExecucao,
  VALOR_NULO,
  VALOR_NUMERO,
  VALOR_TEXTO,
  VALOR_BOOLEANO,
  VALOR_OBJETO,
  VALOR_NATIVO_FN,
  VALOR_VETOR,
  VALOR_FUNCAO,
  TipoValor,
} from "./values";
import type { DeclaracaoFuncao } from "../frontend/ast";
import * as fs from "fs";

export default class Ambiente {
  private variaveis: Map<string, ValorTempoExecucao>;
  private pai?: Ambiente;

  constructor(pai?: Ambiente) {
    this.variaveis = new Map();
    this.pai = pai;
  }

  public declarar(nome: string, valor: ValorTempoExecucao): ValorTempoExecucao {
    if (this.variaveis.has(nome)) {
      console.error(`Variável '${nome}' já declarada neste escopo.`);
      process.exit(1);
    }

    this.variaveis.set(nome, valor);

    return valor;
  }

  public atribuir(nome: string, valor: ValorTempoExecucao): ValorTempoExecucao {
    this.variaveis.set(nome, valor);
    return valor;
  }

  public pesquisar(nome: string): ValorTempoExecucao {
    const ambiente: Ambiente | undefined = this.resolver(nome);

    return ambiente?.variaveis.get(nome) ?? VALOR_NULO();
  }

  public resolver(nome: string): Ambiente | undefined {
    if (this.variaveis.has(nome)) return this;

    if (this.pai == undefined) return undefined;

    return this.pai.resolver(nome);
  }
}

export function criarAmbienteGlobal(): Ambiente {
  const tempoInicio = Date.now();
  const ambiente = new Ambiente();

  // Nota: verdadeiro, falso, nulo são tratados como literais no parser
  // e não precisam ser declarados como variáveis de ambiente

  // Definir função nativa: imprimir
  ambiente.declarar(
    "imprimir",
    VALOR_NATIVO_FN("imprimir", (argumentos, escopo) => {
      let valor = argumentos[0];
      if (valor.tipo == "vetor" || valor.tipo == "objeto") {
        console.log(JSON.stringify(valor.valor));
      } else {
        console.log(valor.valor);
      }
      return VALOR_NULO();
    }),
  );

  // Definir função nativa: executar
  ambiente.declarar(
    "executar",
    VALOR_NATIVO_FN("executar", (argumentos, escopo) => {
      const cmd = argumentos[0];
      if (cmd.tipo != "texto") {
        console.error("O argumento de executar() deve ser do tipo texto");
        process.exit(1);
      }

      const resultado = require("child_process").execSync(cmd.valor).toString();
      return VALOR_TEXTO(resultado);
    }),
  );

  // Definir função nativa: carac
  ambiente.declarar(
    "carac",
    VALOR_NATIVO_FN("carac", (argumentos, escopo) => {
      const str = argumentos[0];
      const indice = argumentos[1];
      if (str.tipo != "texto" || indice.tipo != "numero") {
        console.error(
          "O primeiro argumento de carac() deve ser texto e o segundo deve ser numero",
        );
        process.exit(1);
      }

      const caractere = str.valor.charAt(indice.valor);
      return VALOR_TEXTO(caractere);
    }),
  );

  // Definir função nativa: aparar
  ambiente.declarar(
    "aparar",
    VALOR_NATIVO_FN("aparar", (argumentos, escopo) => {
      const str = argumentos[0];
      if (str.tipo != "texto") {
        console.error("O argumento de aparar() deve ser do tipo texto");
        process.exit(1);
      }

      return VALOR_TEXTO(str.valor.trim());
    }),
  );

  // Definir função nativa: dividir
  ambiente.declarar(
    "dividir",
    VALOR_NATIVO_FN("dividir", (argumentos, escopo) => {
      const str = argumentos[0];
      const separador = argumentos[1];
      if (str.tipo != "texto") {
        console.error(
          "O primeiro argumento de dividir() deve ser do tipo texto",
        );
        process.exit(1);
      }

      const partes = str.valor.split(separador?.valor || ",");
      return VALOR_VETOR(partes.map((parte: string) => VALOR_TEXTO(parte)));
    }),
  );

  // Definir função nativa: entrada
  ambiente.declarar(
    "entrada",
    VALOR_NATIVO_FN("entrada", (argumentos, escopo) => {
      const argumento = argumentos[0];
      const pergunta = argumento?.tipo == "texto" ? argumento.valor : "> ";
      const resposta = require("readline-sync").question(pergunta);
      return VALOR_TEXTO(resposta);
    }),
  );

  // Definir objeto nativo: mat
  const fnsMat: Record<
    string,
    (argumentos: ValorTempoExecucao[]) => ValorTempoExecucao
  > = {
    pot: (argumentos) => {
      return VALOR_NUMERO(Math.pow(argumentos[0].valor, argumentos[1].valor));
    },
    raiz: (argumentos) => {
      return VALOR_NUMERO(Math.sqrt(argumentos[0].valor));
    },
    abs: (argumentos) => {
      return VALOR_NUMERO(Math.abs(argumentos[0].valor));
    },
    piso: (argumentos) => {
      return VALOR_NUMERO(Math.floor(argumentos[0].valor));
    },
    teto: (argumentos) => {
      return VALOR_NUMERO(Math.ceil(argumentos[0].valor));
    },
    arred: (argumentos) => {
      return VALOR_NUMERO(Math.round(argumentos[0].valor));
    },
    aleat: (argumentos) => {
      return VALOR_NUMERO(Math.random());
    },
    seno: (argumentos) => {
      return VALOR_NUMERO(Math.sin(argumentos[0].valor));
    },
    cosseno: (argumentos) => {
      return VALOR_NUMERO(Math.cos(argumentos[0].valor));
    },
    tan: (argumentos) => {
      return VALOR_NUMERO(Math.tan(argumentos[0].valor));
    },
    pi: (argumentos) => {
      return VALOR_NUMERO(Math.PI);
    },
  };

  // Declarar mat e suas propriedades
  const propriedadesMat: Record<string, ValorTempoExecucao> = {};
  // pi é uma constante, não uma função
  propriedadesMat["pi"] = VALOR_NUMERO(Math.PI);
  for (const chave of Object.keys(fnsMat)) {
    if (chave === "pi") continue; // já definido acima como valor
    propriedadesMat[chave] = VALOR_NATIVO_FN(chave, (argumentos, escopo) => {
      return fnsMat[chave](argumentos);
    });
  }
  ambiente.declarar("mat", VALOR_OBJETO(propriedadesMat));

  // Definir função nativa: analisarNumero
  ambiente.declarar(
    "analisarNumero",
    VALOR_NATIVO_FN("analisarNumero", (argumentos, escopo) => {
      const valor = argumentos[0];
      if (valor.tipo != "texto") {
        console.error("O argumento de analisarNumero() deve ser do tipo texto");
        process.exit(1);
      }

      return VALOR_NUMERO(parseFloat(valor.valor));
    }),
  );

  // Definir função nativa: concatenar
  ambiente.declarar(
    "concatenar",
    VALOR_NATIVO_FN("concatenar", (argumentos, escopo) => {
      const str1 = argumentos[0];
      const str2 = argumentos[1];
      if (str1.tipo != "texto" || str2.tipo != "texto") {
        console.error("Os argumentos de concatenar() devem ser do tipo texto");
        process.exit(1);
      }

      return VALOR_TEXTO(str1.valor + str2.valor);
    }),
  );

  // Definir função nativa: formatar
  ambiente.declarar(
    "formatar",
    VALOR_NATIVO_FN("formatar", (argumentos, escopo) => {
      const formato = argumentos[0];
      const valores = argumentos.slice(1);

      if (formato.tipo != "texto") {
        console.error(
          "O primeiro argumento de formatar() deve ser do tipo texto",
        );
        process.exit(1);
      }

      let resultado = formato.valor;
      for (let i = 0; i < valores.length; i++) {
        resultado = resultado.replace("{}", String(valores[i].valor));
      }

      return VALOR_TEXTO(resultado);
    }),
  );

  // Definir função nativa: tempo
  ambiente.declarar(
    "tempo",
    VALOR_NATIVO_FN("tempo", (argumentos, escopo) => {
      return VALOR_NUMERO(Date.now());
    }),
  );

  // Declarar temporizador
  ambiente.declarar(
    "temporizador",
    VALOR_NATIVO_FN("temporizador", (argumentos, escopo) => {
      const milissegundos = argumentos[0];
      const funcaoRetorno = argumentos[1];

      if (milissegundos.tipo != "numero") {
        console.error(
          "O primeiro argumento de temporizador() deve ser do tipo numero",
        );
        process.exit(1);
      }

      if (funcaoRetorno.tipo != "funcao") {
        console.error(
          "O segundo argumento de temporizador() deve ser do tipo funcao",
        );
        process.exit(1);
      }

      setTimeout(() => {
        (funcaoRetorno as any).corpo.corpo.forEach((declaracao: any) => {
          avaliar(declaracao, escopo);
        });
      }, milissegundos.valor);

      return VALOR_NULO();
    }),
  );

  // Declarar intervalo
  ambiente.declarar(
    "intervalo",
    VALOR_NATIVO_FN("intervalo", (argumentos, escopo) => {
      const milissegundos = argumentos[0];
      const funcaoRetorno = argumentos[1];

      if (milissegundos.tipo != "numero") {
        console.error(
          "O primeiro argumento de intervalo() deve ser do tipo numero",
        );
        process.exit(1);
      }

      if (funcaoRetorno.tipo != "funcao") {
        console.error(
          "O segundo argumento de intervalo() deve ser do tipo funcao",
        );
        process.exit(1);
      }

      setInterval(() => {
        (funcaoRetorno as any).corpo.corpo.forEach((declaracao: any) => {
          avaliar(declaracao, escopo);
        });
      }, milissegundos.valor);

      return VALOR_NULO();
    }),
  );

  // Declarar sistema de arquivos
  const propriedadesSistemaArq: Record<string, ValorTempoExecucao> = {
    ler: VALOR_NATIVO_FN("ler", (argumentos, escopo) => {
      const caminho = argumentos[0];
      if (caminho.tipo != "texto") {
        console.error("O argumento de ler() deve ser do tipo texto");
        process.exit(1);
      }

      try {
        const conteudo = fs.readFileSync(caminho.valor, "utf8");
        return VALOR_TEXTO(conteudo);
      } catch (e: any) {
        return VALOR_TEXTO("");
      }
    }),
    escrever: VALOR_NATIVO_FN("escrever", (argumentos, escopo) => {
      const caminho = argumentos[0];
      const conteudo = argumentos[1];
      if (caminho.tipo != "texto" || conteudo.tipo != "texto") {
        console.error("Os argumentos de escrever() devem ser do tipo texto");
        process.exit(1);
      }

      fs.writeFileSync(caminho.valor, conteudo.valor, "utf8");
      return VALOR_NULO();
    }),
    existe: VALOR_NATIVO_FN("existe", (argumentos, escopo) => {
      const caminho = argumentos[0];
      if (caminho.tipo != "texto") {
        console.error("O argumento de existe() deve ser do tipo texto");
        process.exit(1);
      }

      return VALOR_BOOLEANO(fs.existsSync(caminho.valor));
    }),
    apagar: VALOR_NATIVO_FN("apagar", (argumentos, escopo) => {
      const caminho = argumentos[0];
      if (caminho.tipo != "texto") {
        console.error("O argumento de apagar() deve ser do tipo texto");
        process.exit(1);
      }

      try {
        fs.unlinkSync(caminho.valor);
        return VALOR_BOOLEANO(true);
      } catch (e: any) {
        return VALOR_BOOLEANO(false);
      }
    }),
  };
  ambiente.declarar("sistemaarq", VALOR_OBJETO(propriedadesSistemaArq));

  // Declarar tipo
  ambiente.declarar(
    "tipo",
    VALOR_NATIVO_FN("tipo", (argumentos, escopo) => {
      const valor = argumentos[0];
      return VALOR_TEXTO(valor.tipo);
    }),
  );

  // Declarar comprimento
  ambiente.declarar(
    "comprimento",
    VALOR_NATIVO_FN("comprimento", (argumentos, escopo) => {
      const valor = argumentos[0];
      if (valor.tipo == "vetor") {
        return VALOR_NUMERO(valor.valor.length);
      } else if (valor.tipo == "texto") {
        return VALOR_NUMERO(valor.valor.length);
      } else if (valor.tipo == "objeto") {
        return VALOR_NUMERO(Object.keys(valor.valor).length);
      }

      return VALOR_NUMERO(0);
    }),
  );

  // Declarar empilhar
  ambiente.declarar(
    "empilhar",
    VALOR_NATIVO_FN("empilhar", (argumentos, escopo) => {
      const vetor = argumentos[0];
      const elemento = argumentos[1];

      if (vetor.tipo != "vetor") {
        console.error(
          "O primeiro argumento de empilhar() deve ser do tipo vetor",
        );
        process.exit(1);
      }

      vetor.valor.push(elemento);
      return vetor;
    }),
  );

  // Declarar desempilhar
  ambiente.declarar(
    "desempilhar",
    VALOR_NATIVO_FN("desempilhar", (argumentos, escopo) => {
      const vetor = argumentos[0];

      if (vetor.tipo != "vetor") {
        console.error("O argumento de desempilhar() deve ser do tipo vetor");
        process.exit(1);
      }

      vetor.valor.pop();
      return vetor;
    }),
  );

  // Declarar saida
  ambiente.declarar(
    "saida",
    VALOR_NATIVO_FN("saida", (argumentos, escopo) => {
      const codigo = argumentos[0];

      if (codigo.tipo != "numero") {
        console.error("O argumento de saida() deve ser do tipo numero");
        process.exit(1);
      }

      console.log(
        `\nJoule executado em ${(Date.now() - tempoInicio).toLocaleString()}ms`,
      );
      process.exit(codigo.valor);
      return VALOR_NULO();
    }),
  );

  return ambiente;
}

// Declaração antecipada para que temporizador e intervalo possam usar avaliar
declare function avaliar(no: any, ambiente: Ambiente): ValorTempoExecucao;
