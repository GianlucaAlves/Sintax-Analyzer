import type { IStack } from "../contracts.js";

export class Stack<T> implements IStack<T> {
  private readonly items: Record<number, T> = {};
  private count = 0;

  push(item: T): void {
    this.items[this.count] = item;
    this.count += 1;
  }

  pop(): T | undefined {
    if (this.count === 0) {
      return undefined;
    }

    const topIndex = this.count - 1;
    const item = this.items[topIndex];

    delete this.items[topIndex];
    this.count -= 1;

    return item;
  }

  peek(): T | undefined {
    if (this.count === 0) {
      return undefined;
    }

    return this.items[this.count - 1];
  }

  isEmpty(): boolean {
    return this.count === 0;
  }

  size(): number {
    return this.count;
  }
}
