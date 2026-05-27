import { describe, expect, it } from 'vitest';

import { Lexer } from '../Lexer.js';
import { Parser } from '../Parser.js';

describe('Parser', () => {
  const lexer = new Lexer();
  const parser = new Parser();

  it('retorna array vazio para delimitadores balanceados', () => {
    const tokens = lexer.tokenize('{[()]}');

    expect(parser.validate(tokens)).toEqual([]);
  });

  it('retorna erro para fechamento cruzado', () => {
    const tokens = lexer.tokenize('([)]');

    expect(parser.validate(tokens)).toEqual([
      {
        line: 1,
        column: 3,
        char: ')',
        message: "Esperado ']' para fechar '[' (aberto na Linha 1, Coluna 2), mas encontrado ')'.",
      },
      {
        line: 1,
        column: 4,
        char: ']',
        message: "Fechamento ']' sem abertura correspondente.",
      },
      {
        line: 1,
        column: 1,
        char: '(',
        message: "'(' aberto na Linha 1, Coluna 1 nunca foi fechado.",
      },
    ]);
  });

  it('classifica fechamentos extras dentro de bloco corretamente', () => {
    const tokens = lexer.tokenize('int main(){\n    ))(\n}');

    expect(parser.validate(tokens)).toEqual([
      {
        line: 2,
        column: 5,
        char: ')',
        message: "Fechamento ')' sem abertura correspondente.",
      },
      {
        line: 2,
        column: 6,
        char: ')',
        message: "Fechamento ')' sem abertura correspondente.",
      },
      {
        line: 2,
        column: 7,
        char: '(',
        message: "'(' aberto na Linha 2, Coluna 7 nunca foi fechado.",
      },
    ]);
  });

  it('retorna erro para abertura sem fechamento', () => {
    const tokens = lexer.tokenize('(((');

    expect(parser.validate(tokens)).toEqual([
      {
        line: 1,
        column: 3,
        char: '(',
        message: "'(' aberto na Linha 1, Coluna 3 nunca foi fechado.",
      },
      {
        line: 1,
        column: 2,
        char: '(',
        message: "'(' aberto na Linha 1, Coluna 2 nunca foi fechado.",
      },
      {
        line: 1,
        column: 1,
        char: '(',
        message: "'(' aberto na Linha 1, Coluna 1 nunca foi fechado.",
      },
    ]);
  });

  it('retorna erro para fechamento sem abertura', () => {
    const tokens = lexer.tokenize(')');

    expect(parser.validate(tokens)).toEqual([
      {
        line: 1,
        column: 1,
        char: ')',
        message: "Fechamento ')' sem abertura correspondente.",
      },
    ]);
  });

  it('mantem fechamento cruzado para caso [ )', () => {
    const tokens = lexer.tokenize('[\n)\n}');

    expect(parser.validate(tokens)).toEqual([
      {
        line: 2,
        column: 1,
        char: ')',
        message: "Fechamento ')' sem abertura correspondente.",
      },
      {
        line: 3,
        column: 1,
        char: '}',
        message: "Fechamento '}' sem abertura correspondente.",
      },
      {
        line: 1,
        column: 1,
        char: '[',
        message: "'[' aberto na Linha 1, Coluna 1 nunca foi fechado.",
      },
    ]);
  });

  it('classifica ) extra como fechamento sem abertura correspondente', () => {
    const tokens = lexer.tokenize('int main() {\n  print(\"oi\"));\n}');

    expect(parser.validate(tokens)).toEqual([
      {
        line: 2,
        column: 14,
        char: ')',
        message: "Fechamento ')' sem abertura correspondente.",
      },
    ]);
  });

  it('retorna mais de um erro com recuperacao simples', () => {
    const tokens = lexer.tokenize('int main() {\n  if (x > 0] {\n    print(\"ok\"));\n  }\n}');

    expect(parser.validate(tokens)).toEqual([
      {
        line: 2,
        column: 12,
        char: ']',
        message: "Fechamento ']' sem abertura correspondente.",
      },
      {
        line: 3,
        column: 16,
        char: ')',
        message: "Fechamento ')' sem abertura correspondente.",
      },
      {
        line: 2,
        column: 6,
        char: '(',
        message: "'(' aberto na Linha 2, Coluna 6 nunca foi fechado.",
      },
    ]);
  });

  it('retorna ate 3 erros incluindo abertura nao fechada no fim', () => {
    const tokens = lexer.tokenize('int main() {\n  if (x > 0] {\n    print(\"ok\"));\n  }');

    expect(parser.validate(tokens)).toEqual([
      {
        line: 2,
        column: 12,
        char: ']',
        message: "Fechamento ']' sem abertura correspondente.",
      },
      {
        line: 3,
        column: 16,
        char: ')',
        message: "Fechamento ')' sem abertura correspondente.",
      },
      {
        line: 2,
        column: 6,
        char: '(',
        message: "'(' aberto na Linha 2, Coluna 6 nunca foi fechado.",
      },
      {
        line: 1,
        column: 12,
        char: '{',
        message: "'{' aberto na Linha 1, Coluna 12 nunca foi fechado.",
      },
    ]);
  });
});
