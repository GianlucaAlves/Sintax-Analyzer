import { describe, expect, it } from 'vitest';

import { Lexer } from '../Lexer.js';
import { Parser } from '../Parser.js';

describe('Parser', () => {
  const lexer = new Lexer();
  const parser = new Parser();

  it('retorna null para delimitadores balanceados', () => {
    const tokens = lexer.tokenize('{[()]}');

    expect(parser.validate(tokens)).toBeNull();
  });

  it('retorna erro para fechamento cruzado', () => {
    const tokens = lexer.tokenize('([)]');

    expect(parser.validate(tokens)).toEqual({
      line: 1,
      column: 3,
      char: ')',
      message: "Esperado fechamento de '[' (aberto na Linha 1, Coluna 2), mas encontrado ')'.",
    });
  });

  it('retorna erro para abertura sem fechamento apontando para a primeira abertura nao fechada', () => {
    const tokens = lexer.tokenize('(((');

    expect(parser.validate(tokens)).toEqual({
      line: 1,
      column: 1,
      char: '(',
      message: "'(' aberto na Linha 1, Coluna 1 nunca foi fechado.",
    });
  });

  it('retorna erro para fechamento sem abertura', () => {
    const tokens = lexer.tokenize(')');

    expect(parser.validate(tokens)).toEqual({
      line: 1,
      column: 1,
      char: ')',
      message: "Fechamento ')' sem abertura correspondente.",
    });
  });

  it('retorna o primeiro erro encontrado com linha e coluna corretas', () => {
    const tokens = lexer.tokenize('( [ ) ]');

    expect(parser.validate(tokens)).toEqual({
      line: 1,
      column: 5,
      char: ')',
      message: "Esperado fechamento de '[' (aberto na Linha 1, Coluna 3), mas encontrado ')'.",
    });
  });
});
