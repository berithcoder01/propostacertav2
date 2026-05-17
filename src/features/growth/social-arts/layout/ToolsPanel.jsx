import { useEditor } from '../context/EditorContext'

const TOOLS = [
  { id: 'content', icon: 'T', label: 'Texto' },
  { id: 'photo', icon: '🖼', label: 'Foto' },
  { id: 'layout', icon: '⬛', label: 'Layout' },
  { id: 'decoration', icon: '✨', label: 'Deco' },
  { id: 'cta', icon: '📞', label: 'CTA' },
]

export default function ToolsPanel({ showPhoto }) {
  const { state, actions } = useEditor()
  const { activeTool } = state

  const tools = showPhoto ? TOOLS : TOOLS.filter(t => t.id !== 'photo')

  return (
    <div className="w-[80px] flex-shrink-0 bg-editor-panel border border-editor-border rounded-xl p-2 flex flex-col items-center gap-1 shadow-editor">
      {tools.map(tool => {
        const isActive = activeTool === tool.id
        return (
          <button
            key={tool.id}
            onClick={() => actions.setActiveTool(tool.id)}
            className={`w-full flex flex-col items-center gap-0.5 py-2 rounded-lg transition-all ${
              isActive
                ? 'bg-blue-600 text-white'
                : 'opacity-45 hover:opacity-70'
            }`}
          >
            <span className="text-lg">{tool.icon}</span>
            <span className={`text-[10px] font-medium ${isActive ? 'text-white' : ''}`}>{tool.label}</span>
          </button>
        )
      })}
    </div>
  )
}
