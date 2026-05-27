import { useEffect, useState } from 'react';
import type { SyntaxError } from '@shared/contracts';

type AnalysisStatus = 'idle' | 'loading' | 'success' | 'error';

interface ErrorConsoleProps {
  syntaxError: SyntaxError[] | null;
  analysisStatus: AnalysisStatus;
  onGotoLine?: (line: number, column?: number) => void;
}

const STATUS_STYLES: Record<AnalysisStatus, { bg: string; color: string }> = {
  idle: { bg: '#2a2a2a', color: '#888' },
  loading: { bg: '#2a2a2a', color: '#aaa' },
  success: { bg: '#1a3a1a', color: '#4ec94e' },
  error: { bg: '#3a1a1a', color: '#f44747' },
};

const INITIAL_VISIBLE_ERRORS = 3;

export function ErrorConsole({ syntaxError, analysisStatus, onGotoLine }: ErrorConsoleProps) {
  const { bg, color } = STATUS_STYLES[analysisStatus];
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setShowAll(false);
  }, [syntaxError]);

  const renderContent = () => {
    if (analysisStatus === 'idle') return '-- Aguardando analise...';
    if (analysisStatus === 'loading') return 'Analisando...';
    if (analysisStatus === 'success') return 'Nenhum erro encontrado.';

    if (syntaxError && syntaxError.length > 0) {
      const visibleErrors = showAll
        ? syntaxError
        : syntaxError.slice(0, INITIAL_VISIBLE_ERRORS);
      const hiddenCount = syntaxError.length - visibleErrors.length;

      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <strong>
            {syntaxError.length === 1
              ? '1 erro encontrado'
              : `${syntaxError.length} erros encontrados`}
          </strong>

          {visibleErrors.map((err, i) => (
            <div
              key={`${err.line}-${err.column}-${i}`}
              onClick={() => onGotoLine?.(err.line, err.column)}
              style={{ whiteSpace: 'pre-wrap', cursor: 'pointer' }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onGotoLine?.(err.line, err.column);
                }
              }}
            >
              {`[ERRO] Linha ${err.line}, Coluna ${err.column} : ${err.message}`}
            </div>
          ))}

          {syntaxError.length > INITIAL_VISIBLE_ERRORS && (
            <button
              type="button"
              onClick={() => setShowAll((current) => !current)}
              style={{ alignSelf: 'flex-start', marginTop: 4 }}
            >
              {showAll ? 'Mostrar menos' : `Mostrar mais ${hiddenCount}`}
            </button>
          )}
        </div>
      );
    }

    return 'Erro desconhecido.';
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
      {renderContent()}
    </div>
  );
}
