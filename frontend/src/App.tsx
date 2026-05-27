import { useState, useEffect, useRef } from 'react';
import { AnalyzeResponseBody } from '@shared/contracts';
import { CodeEditor } from './components/CodeEditor';
import { HighlightedCode } from './components/HighlightedCode';
import { ErrorConsole } from './components/ErrorConsole';

type AnalysisStatus = 'idle' | 'loading' | 'success' | 'error';

export function App() {
  // estado: texto do editor
  const [sourceCode, setSourceCode] = useState('');
  const [gotoPosition, setGotoPosition] = useState<{ line: number; column?: number } | null>(null);

  // reset gotoLine after used so repeated clicks work
  useEffect(() => {
    if (gotoPosition == null) return;
    const t = window.setTimeout(() => setGotoPosition(null), 300);
    return () => clearTimeout(t);
  }, [gotoPosition]);

  // resultado da análise (tokens + erro)
  const [result, setResult] = useState<AnalyzeResponseBody | null>(null);
  // status da análise: idle/loading/success/error
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>('idle');
  // ref para timeout de debounce
  const debounceRef = useRef<number | null>(null);
  // milissegundos restantes do debounce (para indicador)
  const [debounceMs, setDebounceMs] = useState(0);
  // token selecionado na lista (index)
  const [selectedTokenIndex, setSelectedTokenIndex] = useState<number | null>(null);
  // (Todas as análises serão feitas no backend; o frontend apenas envia e exibe `result`.)
  // tempo de debounce em ms
  const DEBOUNCE_MS = 500;

  const analyzeNow = async (code?: string) => {
    // envia o código ao backend e atualiza `result` e `analysisStatus`
    const sc = code ?? sourceCode;
    if (!sc.trim()) {
      setResult(null);
      setAnalysisStatus('idle');
      return;
    }

    setAnalysisStatus('loading');
    try {
      const res = await fetch('http://localhost:3333/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceCode: sc }),
      });
      if (!res.ok) {
        setResult(null);
        setAnalysisStatus('error');
        return;
      }
      const data: AnalyzeResponseBody = await res.json();
      setResult(data);
      setAnalysisStatus(data.status);
    } catch (err) {
      setResult(null);
      setAnalysisStatus('error');
    }
  };

  useEffect(() => {
    // efeito: debounce para disparar análise 500ms após parar de digitar (apenas backend)
    if (debounceRef.current !== null) window.clearTimeout(debounceRef.current);
    if (!sourceCode.trim()) {
      setAnalysisStatus('idle');
      setResult(null);
      setDebounceMs(0);
      return;
    }

    setDebounceMs(500);
    const tick = setInterval(() => setDebounceMs((v) => {
      const nv = v - 100;
      return nv > 0 ? nv : 0;
    }), 100);

    debounceRef.current = window.setTimeout(() => {
      clearInterval(tick);
      setDebounceMs(0);
      analyzeNow(sourceCode);
    }, 500);

    return () => {
      if (debounceRef.current !== null) window.clearTimeout(debounceRef.current);
      clearInterval(tick);
    };
  }, [sourceCode]);

 return (
  <div style={{ maxWidth: 1200, margin: '32px auto', padding: '0 20px' }}>
    {/* header */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
      <h1 style={{ color: '#d4d4d4', fontFamily: 'monospace', margin: 0 }}>🔍 Web Syntax Analyzer</h1>
    </div>

    <div className="app-grid">
      {/* editor: área de edição do código */}
      <div className="card editor-card">
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <CodeEditor value={sourceCode} onChange={setSourceCode} isLoading={analysisStatus === 'loading'} gotoPosition={gotoPosition} />

          {/* Visualização com destaque: mostra os tokens retornados pelo backend */}
          <div className="highlight-window" style={{ marginTop: 12 }}>
            <div className="hw-header">
              <div className="hw-controls">
                <span className="dot red" />
                <span className="dot yellow" />
                <span className="dot green" />
              </div>
              <div className="hw-title">Visualização de código</div>
            </div>
            <div className="hw-body">
              <HighlightedCode
                tokens={result?.tokens ?? []}
                selectedIndex={selectedTokenIndex ?? undefined}
                onSelect={(idx) => setSelectedTokenIndex(idx)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* painel lateral: botões + indicador + console de erros */}
      <div className="card panel">
        <div className="preview">
          <div className="toolbar" style={{ marginBottom: 8 }}>
            {/* botão para limpar o editor */}
            <button onClick={() => { setSourceCode(''); setResult(null); }}>Limpar</button>

            {/* indicador de debounce (barra + texto) alinhado à direita */}
            <div className="debounce-wrapper">
              {debounceMs > 0 && (
                <>
                  <div className="debounce-progress" aria-hidden>
                    <div className="bar" style={{ width: `${Math.min(100, Math.max(0, Math.round(((DEBOUNCE_MS - debounceMs) / DEBOUNCE_MS) * 100)))}%` }} />
                  </div>
                  <div className="debounce-indicator">Análise em {(debounceMs / 1000).toFixed(1)}s</div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* console que mostra mensagens de erro/estado */}
        <div className="error-console card" style={{ padding: 10 }}>
          <ErrorConsole
            syntaxError={result?.syntaxError ?? null}
            analysisStatus={analysisStatus}
            onGotoLine={(l, c) => { setGotoPosition({ line: l, column: c ?? undefined }); }}
          />
        </div>

        {selectedTokenIndex !== null && result && result.tokens[selectedTokenIndex] && (
          <div style={{ marginTop: 8, fontFamily: 'monospace', fontSize: 13 }}>
            <strong>Token selecionado:</strong> {JSON.stringify(result.tokens[selectedTokenIndex])}
          </div>
        )}
      </div>
    </div>
  </div>
  );
}

export default App;