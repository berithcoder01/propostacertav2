import { useEditor } from '../context/EditorContext'
import { SliderControl } from '../components/ui'

export default function LayoutPanel() {
  const { state, actions } = useEditor()
  const { layout } = state

  return (
    <div className="space-y-4">
      <SliderControl
        label="Espaçamento"
        value={layout.spacing}
        min={8}
        max={40}
        step={4}
        onChange={v => actions.setLayout({ spacing: v })}
      />

      <div>
        <label className="text-[10px] text-text-secondary">Posição do Texto</label>
        <div className="grid grid-cols-2 gap-2 mt-1">
          <SliderControl label="X" value={layout.offset.x} min={-50} max={50} step={1} onChange={v => actions.setLayout({ offset: { ...layout.offset, x: v } })} unit="px" />
          <SliderControl label="Y" value={layout.offset.y} min={-50} max={50} step={1} onChange={v => actions.setLayout({ offset: { ...layout.offset, y: v } })} unit="px" />
        </div>
      </div>

      <div>
        <label className="text-[10px] text-text-secondary">Blocos Retangulares</label>
        <div className="grid grid-cols-2 gap-1 mt-1">
          <button onClick={() => actions.addRectBlock('top')} className="px-2 py-1 rounded bg-gray-100 text-[10px] text-text-secondary hover:bg-gray-200 transition-colors">+ Topo</button>
          <button onClick={() => actions.addRectBlock('bottom')} className="px-2 py-1 rounded bg-gray-100 text-[10px] text-text-secondary hover:bg-gray-200 transition-colors">+ Base</button>
        </div>
        {layout.rectBlocks.map((block, idx) => (
          <div key={block.id} className="mt-2 p-2 rounded bg-gray-50 border border-border space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-text-secondary">Bloco {idx + 1} — {block.position === 'top' ? 'Topo' : 'Base'}</span>
              <button onClick={() => actions.removeRectBlock(block.id)} className="text-text-muted hover:text-red-500 text-xs">✕</button>
            </div>
            <button onClick={() => actions.updateRectBlock(block.id, { position: block.position === 'top' ? 'bottom' : 'top' })} className="w-full px-1 py-0.5 rounded bg-gray-100 text-[9px] text-text-secondary">{block.position === 'top' ? '↓ Base' : '↑ Topo'}</button>
            <SliderControl label="Altura" value={block.height} min={20} max={200} step={10} onChange={v => actions.updateRectBlock(block.id, { height: v })} />
            <SliderControl label="Opacidade" value={Math.round(block.opacity * 100)} min={5} max={100} step={5} onChange={v => actions.updateRectBlock(block.id, { opacity: v / 100 })} unit="%" />
          </div>
        ))}
      </div>
    </div>
  )
}
