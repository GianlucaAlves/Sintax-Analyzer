import type { IParser, SyntaxError, Token } from "../contracts.js";
import { Stack } from "./Stack.js";

export class Parser implements IParser {
  validate(tokens: Token[]): SyntaxError[] {
    const MAX_ERRORS = 3;
    const errors: SyntaxError[] = [];
    const stack = new Stack<Token>();
    let index = 0;

    while (index < tokens.length) {
      if (errors.length >= MAX_ERRORS) {
        break;
      }

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
        index = this.recoverIndex(tokens, index + 1);
        continue;
      }

      const top = stack.peek();
      if (top === undefined) {
        index += 1;
        continue;
      }

      if (top.value === expectedOpen) {
        stack.pop();
        index += 1;
        continue;
      }

      if (top.value !== expectedOpen) {
        // Distinguish between "crossed closing" and "extra closing".
        // Example:
        // - "[ )"       -> crossed (expected ']')
        // - "print())"  -> extra ')' without matching opening.
        const hasExpectedPending = this.hasOpeningPending(stack, expectedOpen);
        if (!hasExpectedPending && this.isLikelyExtraClosing(tokens, index, token.value)) {
          errors.push({
            line: token.line,
            column: token.column,
            char: token.value,
            message: `Fechamento '${token.value}' sem abertura correspondente.`,
          });
          index = this.recoverIndex(tokens, index + 1);
          continue;
        }

        // Crossed closing: consume the mismatched opening to improve recovery.
        const mismatchedOpen = stack.pop();
        if (!mismatchedOpen) {
          index += 1;
          continue;
        }

        const expectedClose = this.getExpectedCloseDelimiter(mismatchedOpen.value);
        errors.push({
          line: token.line,
          column: token.column,
          char: token.value,
          message: `Esperado '${expectedClose}' para fechar '${mismatchedOpen.value}' (aberto na Linha ${mismatchedOpen.line}, Coluna ${mismatchedOpen.column}), mas encontrado '${token.value}'.`,
        });
        index = this.recoverIndex(tokens, index + 1);
        continue;
      }

      index += 1;
    }

    while (!stack.isEmpty() && errors.length < MAX_ERRORS) {
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
    if (value === ")") return "(";
    if (value === "]") return "[";
    if (value === "}") return "{";
    return null;
  }

  private getExpectedCloseDelimiter(value: string): string {
    if (value === "(") return ")";
    if (value === "[") return "]";
    return "}";
  }

  private hasOpeningPending(stack: Stack<Token>, opening: string): boolean {
    const buffer: Token[] = [];
    let found = false;

    while (!stack.isEmpty()) {
      const current = stack.pop();
      if (!current) {
        break;
      }

      buffer.push(current);
      if (current.value === opening) {
        found = true;
        break;
      }
    }

    while (buffer.length > 0) {
      const token = buffer.pop();
      if (token) {
        stack.push(token);
      }
    }

    return found;
  }

  private isLikelyExtraClosing(tokens: Token[], currentIndex: number, closing: string): boolean {
    let i = currentIndex - 1;
    while (i >= 0) {
      const token = tokens[i];
      if (token.type === "WHITESPACE") {
        i -= 1;
        continue;
      }

      if (token.type === "SYMBOL") {
        return token.value === closing;
      }

      return false;
    }

    return false;
  }

  private recoverIndex(tokens: Token[], startIndex: number): number {
    let i = startIndex;
    while (i < tokens.length) {
      const token = tokens[i];
      if (token.type === "WHITESPACE" && token.value === "\n") {
        return i + 1;
      }

      if (token.type === "SYMBOL" && token.value === ";") {
        return i + 1;
      }

      // Preserve block structure during recovery.
      // If we find a brace, resume from it (do not skip).
      if (token.type === "SYMBOL" && (token.value === "{" || token.value === "}")) {
        return i;
      }

      i += 1;
    }

    return i;
  }
}
