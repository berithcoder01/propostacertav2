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
        className="flex flex-col h-full"
      >
        <EditorHeader onBack={actions.backToGallery} />

        <div className="flex-1 flex gap-3 p-3 overflow-hidden" style={{ background: 'var(--editor-bg, #e8e8e6)' }}>
          <ToolsPanel showPhoto={preset?.requiresPhoto} />
          <CanvasPanel company={company} />
          <PropertiesPanel />
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
