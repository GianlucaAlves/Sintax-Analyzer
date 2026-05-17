```markdown
# PRJ.ED.9 — Web Syntax Analyzer
### Documentação de Produto & Arquitetura de Software

**Versão:** 1.0.0 | **Data:** 17/05/2026 | **Status:** Pronto para Sprint

---

## Visão Geral do Produto

O **Web Syntax Analyzer** é um editor web de código-fonte para uma linguagem fictícia simples, com capacidade de análise léxica e sintática implementadas do zero em Vanilla TypeScript. O sistema oferece realce de sintaxe em tempo real e validação de delimitadores com localização precisa de erros (linha e coluna).

---

## A) Product Backlog

| ID | Épico | Feature | Prioridade | Domínio |
|---|---|---|---|---|
| EP-01 | Core Engine | Estrutura de dados `Stack` manual | Must Have | Core |
| EP-02 | Core Engine | Analisador Léxico (Lexer) char-by-char | Must Have | Core |
| EP-03 | Core Engine | Analisador Sintático (Parser) com validação de delimitadores | Must Have | Core |
| EP-04 | Backend Infra | Configuração do servidor Express + tipagens globais | Must Have | Backend |
| EP-05 | Backend Infra | Endpoint POST `/api/analyze` com injeção de dependência | Must Have | Backend |
| EP-06 | Backend Infra | Estruturação da Response (tokens + erros) | Must Have | Backend |
| EP-07 | Frontend UI | Editor de código (textarea customizada) | Must Have | Frontend |
| EP-08 | Frontend UI | Componente de Syntax Highlighting baseado em tokens | Must Have | Frontend |
| EP-09 | Frontend UI | Console de erros com linha/coluna | Must Have | Frontend |
| EP-10 | Qualidade | Testes unitários do Core Engine | Should Have | Core |
| EP-11 | UX | Debounce na requisição (análise ao parar de digitar) | Should Have | Frontend |
| EP-12 | Qualidade | Tratamento de erros HTTP e edge cases da API | Should Have | Backend |

---

## B) User Stories

### US-01 — Entrada de Código-Fonte

**Como** desenvolvedor utilizando o editor web,
**quero** digitar ou colar um trecho de código na interface,
**para que** o sistema possa analisá-lo automaticamente sem precisar mudar de ferramenta.

**Critérios de Aceitação:**
- **Dado** que acesso a URL raiz do sistema, **quando** a página carrega, **então** devo ver uma área de edição de texto visível e focável.
- **Dado** que digito código multilinha, **quando** pressiono Enter, **então** a quebra de linha deve ser preservada corretamente no envio ao backend.
- **Dado** que colo um bloco de código com mais de 500 caracteres, **quando** o texto é inserido, **então** o sistema não deve travar ou perder caracteres.
- **Dado** que paro de digitar por 500ms (debounce), **quando** o timer expira, **então** a requisição de análise é disparada automaticamente.

---

### US-02 — Realce de Sintaxe (Syntax Highlighting)

**Como** desenvolvedor utilizando o editor,
**quero** ver as palavras reservadas da linguagem destacadas em cores diferentes,
**para que** eu consiga identificar visualmente a estrutura do código de forma rápida.

**Critérios de Aceitação:**
- **Dado** que o backend retorna um array de tokens, **quando** o componente renderiza, **então** cada token do tipo `KEYWORD` deve ter uma cor CSS distinta dos tokens do tipo `IDENTIFIER` e `SYMBOL`.
- **Dado** que o código contém a palavra `if` no meio de um identificador como `differ`, **quando** o Lexer processa, **então** apenas a palavra reservada isolada deve ser marcada como `KEYWORD`.
- **Dado** que o código está vazio, **quando** a análise é executada, **então** o array de tokens deve ser vazio e nenhum erro de highlight deve ocorrer.
- **Dado** que o Lexer percorre o código, **quando** encontra uma quebra de linha `\n`, **então** o contador de linha deve ser incrementado e o de coluna resetado para 1.

---

### US-03 — Validação de Delimitadores

**Como** desenvolvedor utilizando o editor,
**quero** ser avisado quando parênteses, colchetes ou chaves estiverem desbalanceados,
**para que** eu encontre e corrija o erro de sintaxe rapidamente.

**Critérios de Aceitação:**
- **Dado** que o código tem `( [ ) ]`, **quando** o Parser processa com a Stack, **então** o sistema deve retornar erro na linha e coluna do `)` que fecha o `[` incorretamente.
- **Dado** que o código tem `{([])}`, **quando** o Parser processa, **então** o resultado deve ser `{ status: "success" }` sem erros.
- **Dado** que o código tem `((( `, **quando** o Parser termina o texto, **então** a Stack não estará vazia e o erro deve apontar para o primeiro `(` não fechado (linha e coluna).
- **Dado** que o código tem `)`, **quando** o Parser encontra um fechamento sem correspondente na Stack, **então** o erro deve apontar exatamente para a coluna desse `)`.
- **Dado** que há delimitadores aninhados como `{ [ ( ) ] }`, **quando** o Parser finaliza, **então** deve retornar sucesso pois o aninhamento é válido.

---

### US-04 — Console de Erros

**Como** desenvolvedor utilizando o editor,
**quero** ver uma área de log indicando a linha e coluna exata do erro,
**para que** eu não precise procurar manualmente onde está o problema.

**Critérios de Aceitação:**
- **Dado** que a análise retorna um erro, **quando** o componente de console renderiza, **então** deve exibir a mensagem no formato: `❌ Erro sintático: caractere 'X' inesperado na Linha 3, Coluna 7`.
- **Dado** que a análise retorna sucesso, **quando** o console renderiza, **então** deve exibir `✅ Análise concluída sem erros`.
- **Dado** que uma nova análise é disparada, **quando** a requisição está em progresso, **então** o console deve exibir um estado de carregamento.

---

## C) Contratos Globais

> Definir este arquivo antes do início da Sprint. Responsabilidade conjunta Dev 1 + Dev 2.

```typescript
// /shared/contracts.ts

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
  line: number;    // 1-indexed
  column: number;  // 1-indexed
}

export interface SyntaxError {
  line: number;
  column: number;
  char: string;
  message: string;
}

export interface AnalysisResult {
  tokens: Token[];
  syntaxError: SyntaxError | null; // null = sem erros
}

export interface AnalyzeRequestBody {
  sourceCode: string;
}

export interface AnalyzeResponseBody {
  status: 'success' | 'error';
  tokens: Token[];
  syntaxError: SyntaxError | null;
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
  validate(tokens: Token[]): SyntaxError | null;
}

export interface IAnalyzer {
  analyze(sourceCode: string): AnalysisResult;
}
```

---

## D) Divisão de Tasks

### Dev 1 — Core Engine (Algoritmos Puros)

**Stack:** TypeScript puro + Vitest/Jest. Sem Express, sem React, sem dependências externas.

---

#### Task 1.1 — Implementar `Stack<T>` Manual

```typescript
// /core/Stack.ts
import { IStack } from '../shared/contracts';

export class Stack<T> implements IStack<T> {
  private readonly items: T[] = [];

  push(item: T): void {
    this.items.push(item);
  }

  pop(): T | undefined {
    return this.items.pop();
  }

  peek(): T | undefined {
    return this.items[this.items.length - 1];
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  size(): number {
    return this.items.length;
  }
}
```

**Definition of Done:**
- `push` adiciona ao topo; `pop` remove e retorna o topo; `peek` retorna sem remover.
- `isEmpty()` retorna `true` quando `items.length === 0`.
- Genérico: `Stack<number>` e `Stack<Token>` compilam sem erros.
- 100% dos métodos cobertos por testes unitários (incluindo `pop` em stack vazia retornando `undefined`).

---

#### Task 1.2 — Implementar `Lexer` (Analisador Léxico)

```typescript
// /core/Lexer.ts
import { ILexer, Token, TokenType } from '../shared/contracts';

const RESERVED_WORDS = new Set([
  'if', 'else', 'while', 'for', 'return',
  'let', 'const', 'fn', 'true', 'false', 'null'
]);

export class Lexer implements ILexer {
  tokenize(sourceCode: string): Token[] {
    const tokens: Token[] = [];
    let line = 1;
    let column = 1;
    let i = 0;

    while (i < sourceCode.length) {
      const char = sourceCode[i];

      if (char === '\n') {
        tokens.push({ type: 'WHITESPACE', value: '\n', line, column });
        line++;
        column = 1;
        i++;
        continue;
      }

      if (char === ' ' || char === '\t') {
        tokens.push({ type: 'WHITESPACE', value: char, line, column });
        column++;
        i++;
        continue;
      }

      // Identificador ou palavra reservada
      if (this.isLetter(char)) {
        const startCol = column;
        let word = '';
        while (i < sourceCode.length && this.isAlphanumeric(sourceCode[i])) {
          word += sourceCode[i];
          i++;
          column++;
        }
        const type: TokenType = RESERVED_WORDS.has(word) ? 'KEYWORD' : 'IDENTIFIER';
        tokens.push({ type, value: word, line, column: startCol });
        continue;
      }

      // Número
      if (this.isDigit(char)) {
        const startCol = column;
        let num = '';
        while (i < sourceCode.length && this.isDigit(sourceCode[i])) {
          num += sourceCode[i];
          i++;
          column++;
        }
        tokens.push({ type: 'NUMBER', value: num, line, column: startCol });
        continue;
      }

      // String literal
      if (char === '"' || char === "'") {
        const quote = char;
        const startCol = column;
        let str = quote;
        i++;
        column++;
        while (i < sourceCode.length && sourceCode[i] !== quote) {
          str += sourceCode[i];
          i++;
          column++;
        }
        str += quote;
        i++;
        column++;
        tokens.push({ type: 'STRING', value: str, line, column: startCol });
        continue;
      }

      // Símbolo
      tokens.push({ type: 'SYMBOL', value: char, line, column });
      i++;
      column++;
    }

    return tokens;
  }

  private isLetter(c: string): boolean {
    return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_';
  }

  private isDigit(c: string): boolean {
    return c >= '0' && c <= '9';
  }

  private isAlphanumeric(c: string): boolean {
    return this.isLetter(c) || this.isDigit(c);
  }
}
```

**Definition of Done:**
- Percorre `sourceCode` caractere por caractere — sem `RegExp` ou biblioteca externa.
- Ao encontrar `\n`, incrementa `line` e reseta `column` para 1.
- Palavra reservada dentro de identificador (ex: `differ`) **não** é marcada como `KEYWORD`.
- Cada `Token` contém `{ type, value, line, column }` com posição de início do token.
- Testes cobrem: keyword isolada, keyword dentro de identifier, números, strings, símbolos `()[]{}`, código multilinha.

---

#### Task 1.3 — Implementar `Parser` (Analisador Sintático)

```typescript
// /core/Parser.ts
import { IParser, Token, SyntaxError } from '../shared/contracts';
import { Stack } from './Stack';

const OPEN_DELIMITERS  = new Set(['(', '[', '{']);
const CLOSE_DELIMITERS = new Map([[')', '('], [']', '['], ['}', '{']]);

export class Parser implements IParser {
  validate(tokens: Token[]): SyntaxError | null {
    const stack = new Stack<Token>();

    for (const token of tokens) {
      if (token.type !== 'SYMBOL') continue;

      if (OPEN_DELIMITERS.has(token.value)) {
        stack.push(token);
        continue;
      }

      const expectedOpen = CLOSE_DELIMITERS.get(token.value);
      if (expectedOpen !== undefined) {
        if (stack.isEmpty()) {
          return {
            line: token.line,
            column: token.column,
            char: token.value,
            message: `Fechamento '${token.value}' sem abertura correspondente.`
          };
        }

        const top = stack.pop()!;
        if (top.value !== expectedOpen) {
          return {
            line: token.line,
            column: token.column,
            char: token.value,
            message: `Esperado fechamento de '${top.value}' (aberto na Linha ${top.line}, Coluna ${top.column}), mas encontrado '${token.value}'.`
          };
        }
      }
    }

    if (!stack.isEmpty()) {
      const unclosed = stack.peek()!;
      return {
        line: unclosed.line,
        column: unclosed.column,
        char: unclosed.value,
        message: `'${unclosed.value}' aberto na Linha ${unclosed.line}, Coluna ${unclosed.column} nunca foi fechado.`
      };
    }

    return null;
  }
}
```

**Definition of Done:**
- Usa exclusivamente `Stack<Token>` da Task 1.1 (sem array nativo como pilha direta).
- Retorna `null` para código sintaticamente válido.
- Retorna o **primeiro** `SyntaxError` com `line`, `column`, `char` e `message` corretos.
- Testes cobrem: `{[()]}` (válido), `([)]` (cruzado), `(((` (abertura sem fechamento), `)` (fechamento sem abertura).

---

### Dev 2 — Backend Infra & Contratos

**Stack:** Node.js + Express + TypeScript. Consome classes do Dev 1 via injeção de dependência.

---

#### Task 2.1 — Configurar Servidor Express

```typescript
// /backend/server.ts
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { analyzeRouter } from './routes/analyze.routes';

const app = express();
const PORT = process.env.PORT ?? 3333;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.use('/api', analyzeRouter);

app.listen(PORT, () => console.log(`Server running on :${PORT}`));
```

```typescript
// /backend/routes/analyze.routes.ts
import { Router } from 'express';
import { analyzeController } from '../container';

const analyzeRouter = Router();
analyzeRouter.post('/analyze', (req, res) => analyzeController.handle(req, res));

export { analyzeRouter };
```

**Definition of Done:**
- `tsconfig.json` com `strict: true` e path alias para `@shared` apontando para `/shared`.
- CORS habilitado para `localhost:5173`.
- Variáveis de ambiente via `dotenv` (porta, `NODE_ENV`).
- Servidor sobe sem erros de compilação TypeScript.

---

#### Task 2.2 — Criar Controller `/api/analyze`

```typescript
// /backend/controllers/analyze.controller.ts
import { Request, Response } from 'express';
import { AnalyzeRequestBody, AnalyzeResponseBody } from '../../shared/contracts';
import { AnalyzerService } from '../services/analyzer.service';

export class AnalyzeController {
  constructor(private readonly analyzerService: AnalyzerService) {}

  handle(req: Request, res: Response): void {
    try {
      const { sourceCode } = req.body as AnalyzeRequestBody;

      if (typeof sourceCode !== 'string') {
        res.status(400).json({ error: 'Campo "sourceCode" deve ser uma string.' });
        return;
      }

      const result = this.analyzerService.analyze(sourceCode);

      const response: AnalyzeResponseBody = {
        status: result.syntaxError ? 'error' : 'success',
        tokens: result.tokens,
        syntaxError: result.syntaxError,
      };

      res.status(200).json(response);
    } catch (err) {
      res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  }
}
```

**Definition of Done:**
- Valida body antes de chamar o service.
- HTTP `400` para body inválido; HTTP `200` para análise (mesmo com erro sintático); HTTP `500` para exceção inesperada.
- Response sempre conforma o shape de `AnalyzeResponseBody`.

---

#### Task 2.3 — `AnalyzerService` com DIP + Container

```typescript
// /backend/services/analyzer.service.ts
import { IAnalyzer, ILexer, IParser, AnalysisResult } from '../../shared/contracts';

export class AnalyzerService implements IAnalyzer {
  constructor(
    private readonly lexer: ILexer,
    private readonly parser: IParser
  ) {}

  analyze(sourceCode: string): AnalysisResult {
    const tokens = this.lexer.tokenize(sourceCode);
    const syntaxError = this.parser.validate(tokens);
    return { tokens, syntaxError };
  }
}
```

```typescript
// /backend/container.ts
import { Lexer } from '../core/Lexer';
import { Parser } from '../core/Parser';
import { AnalyzerService } from './services/analyzer.service';
import { AnalyzeController } from './controllers/analyze.controller';

const lexer    = new Lexer();
const parser   = new Parser();
const service  = new AnalyzerService(lexer, parser);

export const analyzeController = new AnalyzeController(service);
```

**Definition of Done:**
- `AnalyzerService` depende de `ILexer` e `IParser` (interfaces), nunca das classes concretas diretamente (Dependency Inversion Principle).
- Composição acontece **exclusivamente** em `container.ts`.
- Service é testável com mocks de `ILexer` e `IParser` independentemente do Dev 1.

---

### Dev 3 — Frontend UI/UX

**Stack:** React + TypeScript + Vite. Consome `AnalyzeResponseBody` da API.

---

#### Task 3.1 — Componente `CodeEditor`

```typescript
// /frontend/components/CodeEditor.tsx
interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  isLoading: boolean;
}

export function CodeEditor({ value, onChange, isLoading }: CodeEditorProps) {
  return (
    <textarea
      aria-label="Editor de código-fonte"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      spellCheck={false}
      style={{
        fontFamily: 'monospace',
        fontSize: '14px',
        width: '100%',
        minHeight: '300px',
        resize: 'vertical',
        cursor: isLoading ? 'wait' : 'text',
        backgroundColor: '#1e1e1e',
        color: '#d4d4d4',
        padding: '12px',
        border: '1px solid #333',
        borderRadius: '4px',
        lineHeight: '1.6',
      }}
    />
  );
}
```

**Definition of Done:**
- Fonte monospace, scroll horizontal desabilitado.
- Dispara `onChange` a cada keystroke; debounce de 500ms fica no `App.tsx`.
- Cursor `wait` quando `isLoading === true`.
- `aria-label` presente para acessibilidade.

---

#### Task 3.2 — Componente `HighlightedCode`

```typescript
// /frontend/components/HighlightedCode.tsx
import { Token, TokenType } from '../../shared/contracts';

interface HighlightedCodeProps {
  tokens: Token[];
}

const TOKEN_COLORS: Record<TokenType, string> = {
  KEYWORD:    '#569cd6',
  IDENTIFIER: '#9cdcfe',
  NUMBER:     '#b5cea8',
  STRING:     '#ce9178',
  SYMBOL:     '#ffd700',
  WHITESPACE: 'inherit',
  UNKNOWN:    '#f44747',
};

export function HighlightedCode({ tokens }: HighlightedCodeProps) {
  if (tokens.length === 0) return <div style={{ minHeight: '300px' }} />;

  return (
    <pre
      style={{
        fontFamily: 'monospace',
        fontSize: '14px',
        backgroundColor: '#1e1e1e',
        padding: '12px',
        borderRadius: '4px',
        overflowX: 'auto',
        margin: 0,
        lineHeight: '1.6',
      }}
    >
      {tokens.map((token, idx) => {
        if (token.value === '\n') return <br key={idx} />;
        return (
          <span key={idx} style={{ color: TOKEN_COLORS[token.type] }}>
            {token.value}
          </span>
        );
      })}
    </pre>
  );
}
```

**Definition of Done:**
- Um `<span>` por token com a cor correta via `TOKEN_COLORS`.
- `\n` renderiza como `<br />`.
- `tokens` vazio não causa erro de runtime.
- Mesma fonte e tamanho do `CodeEditor` para alinhamento visual.

---

#### Task 3.3 — Componente `ErrorConsole`

```typescript
// /frontend/components/ErrorConsole.tsx
import { SyntaxError } from '../../shared/contracts';

type AnalysisStatus = 'idle' | 'loading' | 'success' | 'error';

interface ErrorConsoleProps {
  syntaxError: SyntaxError | null;
  analysisStatus: AnalysisStatus;
}

const STATUS_STYLES: Record<AnalysisStatus, { bg: string; color: string }> = {
  idle:    { bg: '#2a2a2a', color: '#888' },
  loading: { bg: '#2a2a2a', color: '#aaa' },
  success: { bg: '#1a3a1a', color: '#4ec94e' },
  error:   { bg: '#3a1a1a', color: '#f44747' },
};

export function ErrorConsole({ syntaxError, analysisStatus }: ErrorConsoleProps) {
  const { bg, color } = STATUS_STYLES[analysisStatus];

  const getMessage = () => {
    if (analysisStatus === 'idle')    return '— Aguardando análise...';
    if (analysisStatus === 'loading') return '🔄 Analisando...';
    if (analysisStatus === 'success') return '✅ Nenhum erro encontrado.';
    if (syntaxError) {
      return `❌ Erro na Linha ${syntaxError.line}, Coluna ${syntaxError.column}: ${syntaxError.message}`;
    }
    return '❌ Erro desconhecido.';
  };

  return (
    <div
      role="log"
      aria-live="polite"
      style={{
        fontFamily: 'monospace',
        fontSize: '13px',
        padding: '12px',
        borderRadius: '4px',
        backgroundColor: bg,
        color,
        minHeight: '48px',
        marginTop: '8px',
        border: '1px solid #333',
        transition: 'background-color 0.2s, color 0.2s',
      }}
    >
      {getMessage()}
    </div>
  );
}
```

**Definition of Done:**
- `idle`: mensagem neutra.
- `loading`: spinner textual.
- `success`: mensagem verde.
- `error`: mensagem vermelha com linha, coluna e descrição do erro.
- `aria-live="polite"` para acessibilidade com leitores de tela.

---

#### App.tsx — Orquestração Geral

```typescript
// /frontend/App.tsx
import { useState, useEffect, useRef } from 'react';
import { AnalyzeResponseBody } from '../shared/contracts';
import { CodeEditor } from './components/CodeEditor';
import { HighlightedCode } from './components/HighlightedCode';
import { ErrorConsole } from './components/ErrorConsole';

type AnalysisStatus = 'idle' | 'loading' | 'success' | 'error';

export function App() {
  const [sourceCode, setSourceCode]       = useState('');
  const [result, setResult]               = useState<AnalyzeResponseBody | null>(null);
  const [analysisStatus, setStatus]       = useState<AnalysisStatus>('idle');
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!sourceCode.trim()) { setStatus('idle'); return; }

    debounceRef.current = setTimeout(async () => {
      setStatus('loading');
      try {
        const res = await fetch('http://localhost:3333/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sourceCode }),
        });
        const data: AnalyzeResponseBody = await res.json();
        setResult(data);
        setStatus(data.status);
      } catch {
        setStatus('error');
      }
    }, 500);
  }, [sourceCode]);

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '0 20px' }}>
      <h1 style={{ color: '#d4d4d4', fontFamily: 'monospace' }}>
        🔍 Web Syntax Analyzer
      </h1>
      <CodeEditor
        value={sourceCode}
        onChange={setSourceCode}
        isLoading={analysisStatus === 'loading'}
      />
      <ErrorConsole
        syntaxError={result?.syntaxError ?? null}
        analysisStatus={analysisStatus}
      />
      {result && result.tokens.length > 0 && (
        <>
          <h2 style={{ color: '#888', fontFamily: 'monospace', fontSize: '14px', marginTop: '24px' }}>
            Preview com Syntax Highlighting
          </h2>
          <HighlightedCode tokens={result.tokens} />
        </>
      )}
    </div>
  );
}
```

---

## E) Diagrama de Dependências

```
[Frontend: CodeEditor / HighlightedCode / ErrorConsole]
        │ POST /api/analyze { sourceCode: string }
        ▼
[Backend: AnalyzeController]
        │ chama
        ▼
[Backend: AnalyzerService implements IAnalyzer]
        │ depende de interfaces (DIP)
        ├──► ILexer → Lexer    → percorre char-by-char
        └──► IParser → Parser  → usa Stack<Token>
                                      │
                                      └──► Stack<T> (Pilha manual)

Regra: A seta de dependência NUNCA sobe.
Core não conhece Backend. Backend não conhece Frontend.
```

---

## F) Definition of Done da Sprint

- [ ] Todo código compila com `tsc --strict` sem erros.
- [ ] Nenhuma `RegExp`, biblioteca de parsing ou AST externo usado no Core Engine.
- [ ] `Stack<T>` testada: push, pop, peek, isEmpty, pop em stack vazia.
- [ ] `Lexer` testado: keywords, identifiers, números, strings, multilinha.
- [ ] `Parser` testado: `{[()]}` ✅, `([)]` ❌, `(((` ❌, `)` ❌.
- [ ] API retorna `AnalyzeResponseBody` conforme `/shared/contracts.ts`.
- [ ] Frontend renderiza tokens sem erros de console.
- [ ] `ErrorConsole` exibe linha e coluna corretos visualmente.
- [ ] CORS configurado e frontend comunica com backend localmente.
```
Estrutura base do projeto: 

prj9-syntax-analyzer/
│
├── README.md
│
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env
│   └── src/
│       ├── server.ts
│       ├── container.ts
│       ├── core/
│       │   ├── Stack.ts
│       │   ├── Lexer.ts
│       │   ├── Parser.ts
│       │   └── __tests__/
│       │       ├── Stack.test.ts
│       │       ├── Lexer.test.ts
│       │       └── Parser.test.ts
│       ├── routes/
│       │   └── analyze.routes.ts
│       ├── controllers/
│       │   └── analyze.controller.ts
│       ├── services/
│       │   └── analyzer.service.ts
│       └── contracts.ts
│
└── frontend/
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── index.html
    └── src/
        ├── main.tsx
        ├── App.tsx
        └── components/
            ├── CodeEditor.tsx
            ├── HighlightedCode.tsx
            └── ErrorConsole.tsx