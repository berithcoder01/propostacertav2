import { useEditor } from '../context/EditorContext'

const SHAPES = [
  { id: 'circle-tl', icon: '●', label: 'Canto Sup' },
  { id: 'circle-br', icon: '●', label: 'Canto Inf' },
  { id: 'line-top', icon: '━', label: 'Linha Topo' },
  { id: 'line-bottom', icon: '━', label: 'Linha Base' },
  { id: 'badge', icon: '⬤', label: 'Badge' },
  { id: 'dots', icon: '⋮', label: 'Pontos' },
  { id: 'corner', icon: '◤', label: 'Canto' },
  { id: 'star', icon: '★', label: 'Estrela' },
]

export default function DecorationPanel() {
  const { state, actions } = useEditor()
  const { shapes } = state.decoration

  return (
    <div className="grid grid-cols-4 gap-1">
      {SHAPES.map(shape => (
        <button
          key={shape.id}
          onClick={() => actions.toggleShape(shape.id)}
          className={`flex flex-col items-center gap-0.5 p-1.5 rounded border transition-all ${
            shapes.includes(shape.id)
              ? 'bg-emerald-100 border-emerald-500/50 text-emerald-700'
              : 'bg-gray-100 border-border text-text-muted hover:border-gray-300'
          }`}
        >
          <span className="text-sm">{shape.icon}</span>
          <span className="text-[8px]">{shape.label}</span>
        </button>
      ))}
    </div>
  )
}
