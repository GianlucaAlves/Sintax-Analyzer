
import { useRef, useEffect } from 'react';

// Props: `value` é o texto do editor; `onChange` atualiza o texto; `isLoading` controla o cursor.
interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  isLoading: boolean;
  gotoPosition?: { line: number; column?: number } | null; // 1-based position to move cursor to
}

// CodeEditor: textarea com um gutter à esquerda mostrando os números de linha.
export function CodeEditor({ value, onChange, isLoading, gotoPosition }: CodeEditorProps) {
  // refs para o textarea e o gutter (sincronização de scroll/altura)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const gutterRef = useRef<HTMLDivElement | null>(null);
  

  // calcula quantas linhas renderizar no gutter
  const linesCount = value.split('\n').length || 1;

  // mantém o scroll do gutter alinhado com o textarea
  useEffect(() => {
    const ta = textareaRef.current;
    const gu = gutterRef.current;
    if (!ta || !gu) return;
    const sync = () => {
      gu.scrollTop = ta.scrollTop;
    };
   
    sync();
    ta.addEventListener('scroll', sync);
    return () => ta.removeEventListener('scroll', sync);
  }, []);

  // auto-ajusta a altura do textarea para caber o conteúdo e ajusta a altura do gutter
  useEffect(() => {
    const ta = textareaRef.current;
    const gu = gutterRef.current;
    if (!ta || !gu) return;
    
    ta.style.height = 'auto';
    const h = Math.max(120, ta.scrollHeight);
    ta.style.height = h + 'px';
    gu.style.height = h + 'px';
  }, [value]);

  // if `gotoPosition` prop changes, move the cursor to that line/column
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    if (gotoPosition == null) return;
    const line = Math.max(1, Math.floor(gotoPosition.line));
    const column = gotoPosition.column ? Math.max(1, Math.floor(gotoPosition.column)) : 1;

    // compute character index of start of that line
    let pos = 0;
    let currentLine = 1;
    while (currentLine < line && pos < value.length) {
      const idx = value.indexOf('\n', pos);
      if (idx === -1) { pos = value.length; break; }
      pos = idx + 1;
      currentLine += 1;
    }

    // add column offset (column is 1-based)
    pos = Math.min(value.length, pos + Math.max(0, column - 1));

    // ensure DOM updates applied before setting selection
    setTimeout(() => {
      try {
        ta.focus();
        ta.selectionStart = ta.selectionEnd = pos;
        // scroll approximate position into view
        const ratio = value.length > 0 ? pos / value.length : 0;
        ta.scrollTop = Math.max(0, Math.floor(ratio * ta.scrollHeight) - 40);
      } catch (e) {
        // ignore
      }
    }, 0);
  }, [gotoPosition, value]);

  

  return (
    // layout: gutter (números de linha) + textarea
    <div style={{ display: 'flex', alignItems: 'stretch', height: '100%' }}>
      <div
        ref={gutterRef}
        aria-hidden
        style={{
          minWidth: 44,
          padding: '12px 8px',
          background: '#0f0f0f',
          color: '#9aa1a6',
          fontFamily: 'monospace',
          fontSize: 14,
          textAlign: 'right',
          userSelect: 'none',
          border: '1px solid #333',
          borderRight: 'none',
          borderRadius: '4px 0 0 4px',
          overflow: 'hidden', 
          lineHeight: '1.6',
        }}
      >
        <pre style={{ margin: 0 }}>{Array.from({ length: linesCount }, (_, i) => i + 1).join('\n')}</pre>
      </div>

      <textarea
        ref={textareaRef}
        aria-label="Editor de código-fonte"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        style={{
          fontFamily: 'monospace',
          fontSize: '14px',
          width: '100%',
          minHeight: '300px',
          height: '100%',
          flex: 1,
          resize: 'vertical',
          cursor: isLoading ? 'wait' : 'text',
          backgroundColor: '#1e1e1e',
          color: '#d4d4d4',
          padding: '12px',
          border: '1px solid #333',
          borderRadius: '0 4px 4px 0',
          lineHeight: '1.6',
          outline: 'none',
        }}
      />
    </div>
  );
}