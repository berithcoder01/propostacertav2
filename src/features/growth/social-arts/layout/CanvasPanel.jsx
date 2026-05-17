import { useRef } from 'react'
import { useEditor } from '../context/EditorContext'
import { useExport } from '../hooks/useExport'
import { getRenderer } from '../renderers'

export default function CanvasPanel({ company }) {
  const { state } = useEditor()
  const { preset, fields, photo, layout, decoration, cta } = state
  const previewRef = useRef(null)
  const { generating, downloaded, handleDownload } = useExport()

  if (!preset) return null

  const Renderer = getRenderer(preset.id)
  if (!Renderer) return <div className="flex items-center justify-center h-full text-text-muted text-sm">Preview indisponível</div>

  const sizeLabel = preset.sizes.includes('1080x1920') ? 'aspect-[9/16]' : 'aspect-square'
  const maxWidth = preset.sizes.includes('1080x1920') ? 260 : 320

  return (
    <div className="flex-1 bg-editor-panel border border-editor-border rounded-xl p-4 flex flex-col shadow-editor">
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        <div className={`bg-white rounded-xl overflow-hidden shadow-lg ${sizeLabel}`} style={{ maxWidth, maxHeight: '100%' }}>
          <div ref={previewRef} className="w-full h-full">
            <Renderer
              company={company}
              fields={fields}
              uploadedPhoto={photo}
              elementOffset={layout.offset}
              decorativeShapes={decoration.shapes}
              layoutSpacing={layout.spacing}
              rectBlocks={layout.rectBlocks}
              ctaButton={cta}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-2 mt-3 mb-3">
        {preset.sizes.map(size => (
          <span key={size} className="text-[10px] px-2 py-0.5 bg-gray-100 rounded-full text-text-secondary font-mono">
            {size}
          </span>
        ))}
      </div>

      <button
        onClick={() => handleDownload(previewRef, preset)}
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
            Baixado com sucesso!
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Baixar PNG
          </>
        )}
      </button>

      <p className="text-[10px] text-text-muted text-center mt-1">
        PNG · 2x resolução · Pronto para publicar
      </p>
    </div>
  )
}
