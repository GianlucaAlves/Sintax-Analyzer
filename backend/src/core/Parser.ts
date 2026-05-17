import type { IParser, SyntaxError, Token } from "../contracts.js";
import { Stack } from "./Stack.js";

export class Parser implements IParser {
  validate(tokens: Token[]): SyntaxError | null {
    const stack = new Stack<Token>();
    let index = 0;

    while (index < tokens.length) {
      const token = tokens[index];

      if (token.type !== "SYMBOL") {
        index += 1;
        continue;
      }

      if (this.isOpenDelimiter(token.value)) {
        stack.push(token);
        index += 1;
        continue;
      }

      const expectedOpen = this.getExpectedOpenDelimiter(token.value);
      if (expectedOpen === null) {
        index += 1;
        continue;
      }

      if (stack.isEmpty()) {
        return {
          line: token.line,
          column: token.column,
          char: token.value,
          message: `Fechamento '${token.value}' sem abertura correspondente.`,
        };
      }

      const top = stack.pop();
      if (top === undefined || top.value !== expectedOpen) {
        return {
          line: token.line,
          column: token.column,
          char: token.value,
          message: `Esperado fechamento de '${top?.value ?? expectedOpen}' (aberto na Linha ${top?.line ?? token.line}, Coluna ${top?.column ?? token.column}), mas encontrado '${token.value}'.`,
        };
      }

      index += 1;
    }

    if (!stack.isEmpty()) {
      let firstUnclosed = stack.pop();
      while (!stack.isEmpty()) {
        firstUnclosed = stack.pop();
      }

      if (firstUnclosed !== undefined) {
        return {
          line: firstUnclosed.line,
          column: firstUnclosed.column,
          char: firstUnclosed.value,
          message: `'${firstUnclosed.value}' aberto na Linha ${firstUnclosed.line}, Coluna ${firstUnclosed.column} nunca foi fechado.`,
        };
      }
    }

    return null;
  }

  private isOpenDelimiter(value: string): boolean {
    return value === "(" || value === "[" || value === "{";
  }

  private getExpectedOpenDelimiter(value: string): string | null {
    if (value === ")") {
      return "(";
    }

    if (value === "]") {
      return "[";
    }

    if (value === "}") {
      return "{";
    }

    return null;
  }
}
