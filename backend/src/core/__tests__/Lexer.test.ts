import { describe, expect, it } from 'vitest';

import { Lexer } from '../Lexer.js';

describe('Lexer', () => {
  it('marca palavra reservada isolada como KEYWORD', () => {
    const lexer = new Lexer();

    const tokens = lexer.tokenize('if');

    expect(tokens).toEqual([
      { type: 'KEYWORD', value: 'if', line: 1, column: 1 },
    ]);
  });

  it('usa TypeScript como linguagem padrao', () => {
    const lexer = new Lexer();

    const tokens = lexer.tokenize('interface');

    expect(tokens).toEqual([
      { type: 'KEYWORD', value: 'interface', line: 1, column: 1 },
    ]);
  });

  it('marca palavras reservadas conforme a linguagem selecionada', () => {
    const lexer = new Lexer();

    expect(lexer.tokenize('def', 'python')).toEqual([
      { type: 'KEYWORD', value: 'def', line: 1, column: 1 },
    ]);
    expect(lexer.tokenize('def', 'java')).toEqual([
      { type: 'IDENTIFIER', value: 'def', line: 1, column: 1 },
    ]);
    expect(lexer.tokenize('namespace', 'cpp')).toEqual([
      { type: 'KEYWORD', value: 'namespace', line: 1, column: 1 },
    ]);
    expect(lexer.tokenize('namespace', 'csharp')).toEqual([
      { type: 'KEYWORD', value: 'namespace', line: 1, column: 1 },
    ]);
  });

  it('nao marca keyword contida dentro de identificador', () => {
    const lexer = new Lexer();

    const tokens = lexer.tokenize('differ');

    expect(tokens).toEqual([
      { type: 'IDENTIFIER', value: 'differ', line: 1, column: 1 },
    ]);
  });

  it('tokeniza numeros, strings e simbolos preservando a coluna inicial', () => {
    const lexer = new Lexer();

    const tokens = lexer.tokenize('42 "ok"()[]{}');

    expect(tokens).toEqual([
      { type: 'NUMBER', value: '42', line: 1, column: 1 },
      { type: 'WHITESPACE', value: ' ', line: 1, column: 3 },
      { type: 'STRING', value: '"ok"', line: 1, column: 4 },
      { type: 'SYMBOL', value: '(', line: 1, column: 8 },
      { type: 'SYMBOL', value: ')', line: 1, column: 9 },
      { type: 'SYMBOL', value: '[', line: 1, column: 10 },
      { type: 'SYMBOL', value: ']', line: 1, column: 11 },
      { type: 'SYMBOL', value: '{', line: 1, column: 12 },
      { type: 'SYMBOL', value: '}', line: 1, column: 13 },
    ]);
  });

  it('atualiza linha e coluna corretamente em codigo multilinha', () => {
    const lexer = new Lexer();

    const tokens = lexer.tokenize('let a\nif b');

    expect(tokens).toEqual([
      { type: 'KEYWORD', value: 'let', line: 1, column: 1 },
      { type: 'WHITESPACE', value: ' ', line: 1, column: 4 },
      { type: 'IDENTIFIER', value: 'a', line: 1, column: 5 },
      { type: 'WHITESPACE', value: '\n', line: 1, column: 6 },
      { type: 'KEYWORD', value: 'if', line: 2, column: 1 },
      { type: 'WHITESPACE', value: ' ', line: 2, column: 3 },
      { type: 'IDENTIFIER', value: 'b', line: 2, column: 4 },
    ]);
  });

  it('retorna array vazio quando o codigo esta vazio', () => {
    const lexer = new Lexer();

    expect(lexer.tokenize('')).toEqual([]);
  });
});
