import { ILexer, IParser, IAnalyzer, AnalysisResult } from '../contracts.js';

export class AnalyzerService implements IAnalyzer {
  constructor(
    private readonly lexer: ILexer,
    private readonly parser: IParser
  ) {}

  analyze(sourceCode: string): AnalysisResult {
    const tokens = this.lexer.tokenize(sourceCode);
    const syntaxErrors = this.parser.validate(tokens);
    return { tokens, syntaxError: syntaxErrors };
  }
}