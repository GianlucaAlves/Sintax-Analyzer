import { ILexer, IParser, IAnalyzer, AnalysisResult, ProgrammingLanguage } from '../contracts.js';

export class AnalyzerService implements IAnalyzer {
  constructor(
    private readonly lexer: ILexer,
    private readonly parser: IParser
  ) {}

  analyze(sourceCode: string, language?: ProgrammingLanguage): AnalysisResult {
    const tokens = this.lexer.tokenize(sourceCode, language);
    const syntaxErrors = this.parser.validate(tokens);
    return { tokens, syntaxError: syntaxErrors };
  }
}
