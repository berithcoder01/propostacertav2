import { useEditor } from '../context/EditorContext'
import { ContentPanel, PhotoPanel, LayoutPanel, DecorationPanel, CTAPanel } from '../panels'

const PANEL_MAP = {
  content: ContentPanel,
  photo: PhotoPanel,
  layout: LayoutPanel,
  decoration: DecorationPanel,
  cta: CTAPanel,
}

const PANEL_TITLES = {
  content: 'Conteúdo',
  photo: 'Foto',
  layout: 'Layout',
  decoration: 'Decoração',
  cta: 'CTA',
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
    </div>
  )
}
