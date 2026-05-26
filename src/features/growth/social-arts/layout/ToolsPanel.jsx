import { useEditor } from '../context/EditorContext'

const TOOLS = [
  { id: 'content', icon: 'T', label: 'Texto' },
  { id: 'background', icon: '🎨', label: 'Fundo' },
  { id: 'layout', icon: '⬛', label: 'Layout' },
  { id: 'decoration', icon: '✨', label: 'Deco' },
  { id: 'cta', icon: '📞', label: 'Contato' },
]

export default function ToolsPanel() {
  const { state, actions } = useEditor()
  const { activeTool } = state

  return (
    <div className="w-[80px] flex-shrink-0 bg-editor-panel border border-editor-border rounded-xl p-2 flex flex-col items-center gap-1 shadow-editor">
      {TOOLS.map(tool => {
        const isActive = activeTool === tool.id
        return (
          <button
            key={tool.id}
            onClick={() => actions.setActiveTool(tool.id)}
            className={`w-full flex flex-col items-center gap-1.5 py-2.5 rounded-lg transition-all ${
              isActive
                ? 'bg-accent text-white font-bold shadow-sm'
                : 'text-text-secondary dark:text-white/50 hover:text-text-primary dark:hover:text-white/80 hover:bg-surface/50 dark:hover:bg-[#1a1a24]/50'
            }`}
          >
            <span className="text-lg leading-none">{tool.icon}</span>
            <span className="text-[10px] font-bold tracking-wide">{tool.label}</span>
          </button>
        )
      })}
    </div>
  )
}
