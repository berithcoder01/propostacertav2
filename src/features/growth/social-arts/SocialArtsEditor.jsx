import { AnimatePresence, motion } from 'framer-motion'
import { useEditor } from './context/EditorContext'
import { EditorHeader, ToolsPanel, CanvasPanel, PropertiesPanel } from './layout'
import { PresetGallery } from './gallery'

export default function SocialArtsEditor({ company }) {
  const { state, actions } = useEditor()
  const { preset } = state

  if (!preset) {
    return <PresetGallery />
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="editor"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        className="flex flex-col md:h-[calc(100vh-190px)] h-auto overflow-hidden"
      >
        <EditorHeader onBack={actions.backToGallery} />

        {/* Desktop Layout: 3-column */}
        <div className="hidden md:flex flex-1 gap-3 p-3 overflow-hidden" style={{ background: 'var(--editor-bg, #e8e8e6)' }}>
          <ToolsPanel />
          <CanvasPanel company={company} />
          <PropertiesPanel />
        </div>

        {/* Mobile Layout: Canvas + Bottom Tool Drawer */}
        <div className="flex-1 md:hidden flex flex-col overflow-hidden" style={{ background: 'var(--editor-bg, #e8e8e6)' }}>
          <div className="flex-1 overflow-hidden">
            <CanvasPanel company={company} />
          </div>
          
          {/* Mobile Tools Bar */}
          <div className="bg-editor-panel border-t border-editor-border p-2">
            <MobileToolsPanel />
          </div>
          
          {/* Mobile Properties Panel (shown when tool is active) */}
          {state.activeTool && (
            <div className="max-h-[40vh] overflow-auto border-t border-editor-border">
              <PropertiesPanel />
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// Mobile-specific compact tools panel
function MobileToolsPanel() {
  const { state, actions } = useEditor()
  const { activeTool } = state

  const TOOLS = [
    { id: 'content', icon: 'T', label: 'Texto' },
    { id: 'background', icon: '🎨', label: 'Fundo' },
    { id: 'layout', icon: '⬛', label: 'Layout' },
    { id: 'decoration', icon: '✨', label: 'Deco' },
    { id: 'cta', icon: '📞', label: 'Contato' },
  ]

  return (
    <div className="flex items-center justify-around">
      {TOOLS.map(tool => {
        const isActive = activeTool === tool.id
        return (
          <button
            key={tool.id}
            onClick={() => actions.setActiveTool(isActive ? null : tool.id)}
            className={`flex flex-col items-center gap-1.5 py-2 px-3 rounded-lg transition-all ${
              isActive
                ? 'bg-accent text-white font-bold shadow-sm'
                : 'text-text-secondary dark:text-white/50 hover:text-text-primary dark:hover:text-white/80'
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
