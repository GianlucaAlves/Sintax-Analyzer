import type { IParser, SyntaxError, Token } from "../contracts.js";
import { Stack } from "./Stack.js";

export class Parser implements IParser {
  validate(tokens: Token[]): SyntaxError[] {
    const errors: SyntaxError[] = [];
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
        errors.push({
          line: token.line,
          column: token.column,
          char: token.value,
          message: `Fechamento '${token.value}' sem abertura correspondente.`,
        });
        index += 1;
        continue;
      }

      const top = stack.pop();
      if (top === undefined) {
        index += 1;
        continue;
      }

      if (top.value !== expectedOpen) {
        errors.push({
          line: token.line,
          column: token.column,
          char: token.value,
          message: `Esperado fechamento de '${top.value}' (aberto na Linha ${top.line}, Coluna ${top.column}), mas encontrado '${token.value}'.`,
        });
        index += 1;
        continue;
      }

      index += 1;
    }

    // any unclosed openings left in stack -> report each
    while (!stack.isEmpty()) {
      const unclosed = stack.pop();
      if (unclosed) {
        errors.push({
          line: unclosed.line,
          column: unclosed.column,
          char: unclosed.value,
          message: `'${unclosed.value}' aberto na Linha ${unclosed.line}, Coluna ${unclosed.column} nunca foi fechado.`,
        });
      }
    }

    return errors;
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
