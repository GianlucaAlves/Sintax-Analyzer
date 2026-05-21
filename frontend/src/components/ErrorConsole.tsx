
import { SyntaxError } from '@shared/contracts';

// `syntaxError`: erro retornado pelo backend (ou null)
type AnalysisStatus = 'idle' | 'loading' | 'success' | 'error';

interface ErrorConsoleProps {
  syntaxError: SyntaxError | null;
  analysisStatus: AnalysisStatus;
}

// Mapeia estilos por estado (usado para indicar sucesso/erro/carregando)
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
      aria-live="polite" // ajuda leitores de tela a anunciar mudanças
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