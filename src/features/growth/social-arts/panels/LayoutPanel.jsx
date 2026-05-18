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
        <div className="flex items-center justify-between mb-1">
          <label className="text-[10px] text-text-secondary">Posição do Texto</label>
          <button
            onClick={() => actions.setLayout({ offset: { x: 0, y: 0 } })}
            className="text-[9px] text-blue-400 hover:text-blue-300 transition-colors"
          >
            Centralizar
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <SliderControl label="X" value={layout.offset.x} min={-200} max={200} step={4} onChange={v => actions.setLayout({ offset: { ...layout.offset, x: v } })} unit="px" />
          <SliderControl label="Y" value={layout.offset.y} min={-200} max={200} step={4} onChange={v => actions.setLayout({ offset: { ...layout.offset, y: v } })} unit="px" />
        </div>
      </div>

      <div>
        <label className="text-[10px] text-text-secondary">Blocos Retangulares</label>
        <p className="text-[10px] text-text-secondary opacity-50 mt-1 mb-2">
          Blocos de cor sobre o fundo — úteis para criar faixas de contraste
        </p>
        <div className="grid grid-cols-2 gap-1">
          <button onClick={() => actions.addRectBlock('top')} className="px-2 py-1 rounded bg-editor-input border border-editor-input-border text-[10px] text-text-secondary hover:opacity-80 transition-opacity">+ Topo</button>
          <button onClick={() => actions.addRectBlock('bottom')} className="px-2 py-1 rounded bg-editor-input border border-editor-input-border text-[10px] text-text-secondary hover:opacity-80 transition-opacity">+ Base</button>
        </div>
        {layout.rectBlocks.map((block, idx) => (
          <div key={block.id} className="mt-2 p-2 rounded bg-editor-input border border-editor-input-border space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-text-secondary">Bloco {idx + 1} — {block.position === 'top' ? 'Topo' : 'Base'}</span>
              <button onClick={() => actions.removeRectBlock(block.id)} className="text-text-muted hover:text-red-400 text-xs">✕</button>
            </div>
            <button onClick={() => actions.updateRectBlock(block.id, { position: block.position === 'top' ? 'bottom' : 'top' })} className="w-full px-1 py-0.5 rounded bg-editor-input border border-editor-input-border text-[9px] text-text-secondary hover:opacity-80">{block.position === 'top' ? '↓ Base' : '↑ Topo'}</button>
            <SliderControl label="Altura" value={block.height} min={20} max={200} step={10} onChange={v => actions.updateRectBlock(block.id, { height: v })} />
            <SliderControl label="Opacidade" value={Math.round(block.opacity * 100)} min={5} max={100} step={5} onChange={v => actions.updateRectBlock(block.id, { opacity: v / 100 })} unit="%" />
          </div>
        ))}
      </div>
    </div>
  )
}
