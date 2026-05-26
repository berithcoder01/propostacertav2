import { useEditor } from '../context/EditorContext'
import { useExport } from '../hooks/useExport'
import { ContentPanel, BackgroundPanel, LayoutPanel, DecorationPanel, CTAPanel } from '../panels'

const PANEL_MAP = {
  content: ContentPanel,
  background: BackgroundPanel,
  layout: LayoutPanel,
  decoration: DecorationPanel,
  cta: CTAPanel,
}

const PANEL_TITLES = {
  content: 'Conteúdo',
  background: 'Fundo',
  layout: 'Layout',
  decoration: 'Decoração',
  cta: 'Contato',
}

function DownloadButton() {
  const { state, canvasRef } = useEditor()
  const { preset } = state
  const { generating, downloaded, error, handleDownload } = useExport()

  if (!preset) return null

  return (
    <div className="pt-3 border-t border-editor-border space-y-2">
      <button
        onClick={() => handleDownload(canvasRef, preset)}
        disabled={generating}
        className={`w-full py-2.5 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all text-sm
          ${downloaded
            ? 'bg-emerald-700 text-white'
            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
          } disabled:opacity-50`}
      >
        {generating ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Gerando...
          </>
        ) : downloaded ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
            Baixado!
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Baixar PNG
          </>
        )}
      </button>
      {error && (
        <p className="text-[10px] text-red-400 text-center font-medium">{error}</p>
      )}
      {!error && (
        <p className="text-[10px] text-text-muted text-center">
          PNG · 2x resolução · Pronto para publicar
        </p>
      )}
    </div>
  )
}

export default function PropertiesPanel() {
  const { state } = useEditor()
  const { activeTool } = state

  const Panel = PANEL_MAP[activeTool] || ContentPanel

  return (
    <div className="w-[280px] flex-shrink-0 bg-editor-panel border border-editor-border rounded-xl p-4 flex flex-col shadow-editor">
      <h3 className="text-[11px] font-bold text-text-secondary uppercase tracking-widest mb-3">
        {PANEL_TITLES[activeTool]}
      </h3>

      <div className="flex-1 overflow-y-auto space-y-4">
        <Panel />
      </div>

      <DownloadButton />
    </div>
  )
}
