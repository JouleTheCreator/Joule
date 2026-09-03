import * as fs from "fs";
import AnalisadorSintatico from "./frontend/parser";
import { avaliar, criarAmbienteGlobal } from "./runtime/interpreter";

// Ponto de entrada principal do interpretador Joule

const ficheiro = process.argv[2];

if (!ficheiro) {
  console.log("Repl vAlpha 0.1 (Joule)");
  console.error("Por favor, forneça um ficheiro como argumento.");
  process.exit(1);
}

if (!fs.existsSync(ficheiro)) {
  console.error(`Ficheiro não encontrado: ${ficheiro}`);
  process.exit(1);
}

// Validar a extensão
if (!ficheiro.endsWith(".jou")) {
  console.error("Extensão Inválida use arquivos .jou");
  process.exit(1);
}

const codigoFonte = fs.readFileSync(ficheiro, "utf8");

const analisador = new AnalisadorSintatico();
const programa = analisador.produzirAST(codigoFonte);

const ambiente = criarAmbienteGlobal();
avaliar(programa, ambiente);
