export type TokenType =
  | 'KEYWORD'
  | 'IDENTIFIER'
  | 'NUMBER'
  | 'STRING'
  | 'SYMBOL'
  | 'WHITESPACE'
  | 'UNKNOWN';

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

export interface SyntaxError {
  line: number;
  column: number;
  char: string;
  message: string;
}

export interface AnalysisResult {
  tokens: Token[];
  syntaxError: SyntaxError[]; // lista de erros (vazia = sem erros)
}

export interface AnalyzeRequestBody {
  sourceCode: string;
}

export interface AnalyzeResponseBody {
  status: 'success' | 'error';
  tokens: Token[];
  syntaxError: SyntaxError[];
}

export interface IStack<T> {
  push(item: T): void;
  pop(): T | undefined;
  peek(): T | undefined;
  isEmpty(): boolean;
  size(): number;
}

export interface ILexer {
  tokenize(sourceCode: string): Token[];
}

export interface IParser {
  validate(tokens: Token[]): SyntaxError[];
}

export interface IAnalyzer {
  analyze(sourceCode: string): AnalysisResult;
}
