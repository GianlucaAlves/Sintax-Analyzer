
import { SyntaxError } from '@shared/contracts';

// `syntaxError`: lista de erros retornada pelo backend (ou null)
type AnalysisStatus = 'idle' | 'loading' | 'success' | 'error';

interface ErrorConsoleProps {
  syntaxError: SyntaxError[] | null;
  analysisStatus: AnalysisStatus;
  onGotoLine?: (line: number, column?: number) => void;
}

// Mapeia estilos por estado (usado para indicar sucesso/erro/carregando)
const STATUS_STYLES: Record<AnalysisStatus, { bg: string; color: string }> = {
  idle:    { bg: '#2a2a2a', color: '#888' },
  loading: { bg: '#2a2a2a', color: '#aaa' },
  success: { bg: '#1a3a1a', color: '#4ec94e' },
  error:   { bg: '#3a1a1a', color: '#f44747' },
};

export function ErrorConsole({ syntaxError, analysisStatus, onGotoLine }: ErrorConsoleProps) {
  const { bg, color } = STATUS_STYLES[analysisStatus];

  const renderContent = () => {
    if (analysisStatus === 'idle') return '— Aguardando análise...';
    if (analysisStatus === 'loading') return '🔄 Analisando...';
    if (analysisStatus === 'success') return '✅ Nenhum erro encontrado.';

    // error status: show each syntax error on its own line
    if (syntaxError && syntaxError.length > 0) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {syntaxError.map((err, i) => {
            // remove possíveis menções embutidas de linha/coluna na mensagem para evitar duplicação
            const cleaned = err.message
              .replace(/,?\s*Linha\s*\d+,\s*Coluna\s*\d+/g, '')
              .replace(/,?\s*Coluna\s*\d+/g, '')
              .trim();
            return (
              <div
                key={i}
                onClick={() => onGotoLine?.(err.line, err.column)}
                style={{ whiteSpace: 'pre-wrap', cursor: 'pointer' }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onGotoLine?.(err.line, err.column); }}
              >
                {`[ERRO] Linha ${err.line}, Coluna ${err.column} : ${err.message}`}
              </div>
            );
          })}
        </div>
      );
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
      {renderContent()}
    </div>
  );
}