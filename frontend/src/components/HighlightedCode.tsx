

import { Token, TokenType } from '@shared/contracts';

// Props: `tokens` lista de tokens recebidos do backend; `selectedIndex` token marcado; `onSelect` callback ao clicar.
interface HighlightedCodeProps {
  tokens: Token[];
  selectedIndex?: number | null;
  onSelect?: (idx: number) => void;
}


// Mapa simples de cores por tipo de token (usado para realce)
const TOKEN_COLORS: Record<TokenType, string> = {
  KEYWORD:    '#00d30b',
  IDENTIFIER: '#9cdcfe',
  NUMBER:     '#b5cea8',
  STRING:     '#ce9178',
  SYMBOL:     '#ffd700',
  WHITESPACE: 'inherit',
  UNKNOWN:    '#f44747',
};



export function HighlightedCode({ tokens, selectedIndex = null, onSelect  }: HighlightedCodeProps) {
  // se não há tokens, reserva espaço mínimo
  if (tokens.length === 0) return <div style={{ minHeight: '300px' }} />;

  return (
    <pre
      style={{
        whiteSpace: 'pre-wrap',
        overflowWrap: 'anywhere',
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
        // preserva quebras de linha
        if (token.value === '\n') return <br key={idx} />;
        const isSelected = selectedIndex === idx;
        return (
          <span
            key={idx}
            onClick={() => onSelect?.(idx)}
            className={isSelected ? 'token-selected' : undefined}
            style={{ color: TOKEN_COLORS[token.type], cursor: 'pointer' }}
            title={`${token.type} — Linha ${token.line}, Col ${token.column}`}
          >
            {token.value}
          </span>
        );
      })}
    </pre>
  );
}