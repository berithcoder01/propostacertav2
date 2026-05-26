import { useEditor } from '../context/EditorContext'
import { getRenderer } from '../renderers'

export default function CanvasPanel({ company }) {
  const { state, canvasRef } = useEditor()
  const { preset, fields, photo, photoAlt, layout, decoration, cta, background, extraTexts } = state

  if (!preset) return null

  const Renderer = getRenderer(preset.id)
  if (!Renderer) return <div className="flex items-center justify-center h-full text-text-muted text-sm">Preview indisponível</div>

  const sizeLabel = preset.sizes.includes('1080x1920') ? 'aspect-[9/16]' : 'aspect-square'
  
  // Responsive sizing: smaller on mobile, larger on desktop
  const maxWidth = preset.sizes.includes('1080x1920') 
    ? 'min(260px, 85vw)' 
    : 'min(320px, 85vw)'

  return (
    <div className="flex-1 bg-editor-panel border border-editor-border rounded-xl p-3 md:p-4 flex flex-col shadow-editor">
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        <div 
          className={`bg-white rounded-xl overflow-hidden shadow-lg ${sizeLabel} touch-none`} 
          style={{ maxWidth, maxHeight: '100%' }}
        >
          <div ref={canvasRef} className="w-full h-full">
            <Renderer
              company={company}
              fields={fields}
              uploadedPhoto={photo}
              uploadedPhotoAlt={photoAlt}
              background={background}
              elementOffset={layout.offset}
              decorativeShapes={decoration.shapes}
              decorationItems={decoration.items}
              layoutSpacing={layout.spacing}
              rectBlocks={layout.rectBlocks}
              ctaButton={cta}
              extraTexts={extraTexts}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-2 mt-2 md:mt-3">
        {preset.sizes.map(size => (
          <span key={size} className="text-[10px] px-2 py-0.5 bg-editor-input rounded-full text-text-secondary font-mono">
            {size}
          </span>
        ))}
      </div>
    </div>
  )
}
