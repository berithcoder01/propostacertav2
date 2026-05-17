import { ChevronLeft } from 'lucide-react'
import { useEditor } from '../context/EditorContext'

export default function EditorHeader({ onBack }) {
  const { state } = useEditor()
  const { preset } = state

  if (!preset) return null

  const sizeLabel = preset.sizes.includes('1080x1920') ? '1080×1920' : '1080×1080'

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-editor-header border-b border-editor-border">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-text-secondary hover:text-text-primary transition-colors text-sm"
      >
        <ChevronLeft size={16} />
        Voltar
      </button>
      <div className="flex-1 min-w-0">
        <h2 className="text-editor-text font-bold text-sm truncate">{preset.icon} {preset.name}</h2>
        <p className="text-text-secondary text-[10px]">{sizeLabel}</p>
      </div>
    </div>
  )
}
