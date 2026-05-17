import { describe, expect, it } from 'vitest';

import { Stack } from '../Stack.js';

describe('Stack', () => {
  it('push adiciona itens e size acompanha o total', () => {
    const stack = new Stack<number>();

    stack.push(10);
    stack.push(20);

    expect(stack.size()).toBe(2);
    expect(stack.peek()).toBe(20);
  });

  it('pop remove e retorna o item do topo', () => {
    const stack = new Stack<string>();

    stack.push('a');
    stack.push('b');

    expect(stack.pop()).toBe('b');
    expect(stack.pop()).toBe('a');
    expect(stack.size()).toBe(0);
  });

  it('peek retorna o topo sem remover', () => {
    const stack = new Stack<string>();

    stack.push('token');

    expect(stack.peek()).toBe('token');
    expect(stack.size()).toBe(1);
  });

  it('isEmpty reflete corretamente se a stack esta vazia', () => {
    const stack = new Stack<object>();

    expect(stack.isEmpty()).toBe(true);

    stack.push({});
    expect(stack.isEmpty()).toBe(false);

    stack.pop();
    expect(stack.isEmpty()).toBe(true);
  });

  it('pop em stack vazia retorna undefined', () => {
    const stack = new Stack<number>();

    expect(stack.pop()).toBeUndefined();
    expect(stack.peek()).toBeUndefined();
  });
});
