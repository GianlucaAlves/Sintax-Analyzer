import type { IParser, SyntaxError, Token } from "../contracts.js";

export class Parser implements IParser {
  validate(tokens: Token[]): SyntaxError[] {
    const errors: SyntaxError[] = [];
    const stack: Token[] = [];
    const openingCounts: Record<string, number> = { "(": 0, "[": 0, "{": 0 };

    for (const token of tokens) {
      if (token.type !== "SYMBOL") continue;

      if (this.isOpeningDelimiter(token.value)) {
        stack.push(token);
        openingCounts[token.value] += 1;
        continue;
      }

      const expectedOpening = this.getExpectedOpeningDelimiter(token.value);
      if (expectedOpening === null) continue;

      const opening = stack[stack.length - 1];
      if (opening === undefined) {
        errors.push({
          line: token.line,
          column: token.column,
          char: token.value,
          message: `Fechamento '${token.value}' sem abertura correspondente.`,
        });
        continue;
      }

      if (opening.value === expectedOpening) {
        stack.pop();
        openingCounts[opening.value] -= 1;
        continue;
      }

      if (!this.hasOpeningInCurrentScope(stack, expectedOpening)) {
        errors.push({
          line: token.line,
          column: token.column,
          char: token.value,
          message: `Fechamento '${token.value}' sem abertura correspondente.`,
        });
        continue;
      }

      if (token.value === "}") {
        this.closeBlock(stack, openingCounts, errors);
        continue;
      }

      const expectedClosing = this.getExpectedClosingDelimiter(opening.value);
      errors.push({
        line: token.line,
        column: token.column,
        char: token.value,
        message: `Esperado '${expectedClosing}' para fechar '${opening.value}' (aberto na Linha ${opening.line}, Coluna ${opening.column}), mas encontrado '${token.value}'.`,
      });
      stack.pop();
      openingCounts[opening.value] -= 1;
    }

    while (stack.length > 0) {
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

  private hasOpeningInCurrentScope(stack: Token[], value: string): boolean {
    for (let i = stack.length - 1; i >= 0; i -= 1) {
      const token = stack[i];
      if (token.value === value) return true;
      if (token.value === "{") return value === "{";
    }

    return false;
  }

  private closeBlock(
    stack: Token[],
    openingCounts: Record<string, number>,
    errors: SyntaxError[],
  ): void {
    while (stack.length > 0) {
      const opening = stack.pop();
      if (!opening) return;

      openingCounts[opening.value] -= 1;

      if (opening.value === "{") return;

      errors.push({
        line: opening.line,
        column: opening.column,
        char: opening.value,
        message: `'${opening.value}' aberto na Linha ${opening.line}, Coluna ${opening.column} nunca foi fechado.`,
      });
    }
  }

  private isOpeningDelimiter(value: string): boolean {
    return value === "(" || value === "[" || value === "{";
  }

  private getExpectedOpeningDelimiter(value: string): string | null {
    if (value === ")") return "(";
    if (value === "]") return "[";
    if (value === "}") return "{";
    return null;
  }

  private getExpectedClosingDelimiter(value: string): string {
    if (value === "(") return ")";
    if (value === "[") return "]";
    return "}";
  }
}
