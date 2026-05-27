import type { ILexer, ProgrammingLanguage, Token, TokenType } from "../contracts.js";
import { DEFAULT_LANGUAGE, RESERVED_WORDS_BY_LANGUAGE, normalizeLanguage } from "./ReservedWords.js";

export class Lexer implements ILexer {
  tokenize(sourceCode: string, language: ProgrammingLanguage = DEFAULT_LANGUAGE): Token[] {
    const tokens: Token[] = [];
    const reservedWords = RESERVED_WORDS_BY_LANGUAGE[normalizeLanguage(language)];
    let line = 1;
    let column = 1;
    let index = 0;

    while (index < sourceCode.length) {
      const char = sourceCode[index];

      if (char === "\n") {
        this.addToken(tokens, {
          type: "WHITESPACE",
          value: "\n",
          line,
          column,
        });
        line += 1;
        column = 1;
        index += 1;
        continue;
      }

      if (char === " " || char === "\t") {
        this.addToken(tokens, {
          type: "WHITESPACE",
          value: char,
          line,
          column,
        });
        column += 1;
        index += 1;
        continue;
      }

      if (this.isLetter(char)) {
        const startColumn = column;
        let value = "";

        while (
          index < sourceCode.length &&
          this.isAlphanumeric(sourceCode[index])
        ) {
          value += sourceCode[index];
          index += 1;
          column += 1;
        }

        const type: TokenType = reservedWords.has(value)
          ? "KEYWORD"
          : "IDENTIFIER";
        this.addToken(tokens, {
          type,
          value,
          line,
          column: startColumn,
        });
        continue;
      }

      if (this.isDigit(char)) {
        const startColumn = column;
        let value = "";

        while (index < sourceCode.length && this.isDigit(sourceCode[index])) {
          value += sourceCode[index];
          index += 1;
          column += 1;
        }

        this.addToken(tokens, {
          type: "NUMBER",
          value,
          line,
          column: startColumn,
        });
        continue;
      }

      if (char === '"' || char === "'") {
        const quote = char;
        const startColumn = column;
        let value = quote;

        index += 1;
        column += 1;

        while (index < sourceCode.length) {
          const current = sourceCode[index];
          value += current;
          index += 1;
          column += 1;

          if (current === quote) {
            break;
          }
        }

        this.addToken(tokens, {
          type: "STRING",
          value,
          line,
          column: startColumn,
        });
        continue;
      }

      this.addToken(tokens, {
        type: "SYMBOL",
        value: char,
        line,
        column,
      });
      index += 1;
      column += 1;
    }

    return tokens;
  }

  private isLetter(char: string): boolean {
    return (
      (char >= "a" && char <= "z") ||
      (char >= "A" && char <= "Z") ||
      char === "_"
    );
  }

  private isDigit(char: string): boolean {
    return char >= "0" && char <= "9";
  }

  private isAlphanumeric(char: string): boolean {
    return this.isLetter(char) || this.isDigit(char);
  }

  private addToken(tokens: Token[], token: Token): void {
    tokens[tokens.length] = token;
  }
}
