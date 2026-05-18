import { useEditor } from '../context/EditorContext'

const DECORATION_TYPES = [
  { id: 'accent-line', label: 'Linha', icon: '━' },
  { id: 'corner-fill', label: 'Canto', icon: '◤' },
  { id: 'glow-circle', label: 'Brilho', icon: '◉' },
  { id: 'dot-grid', label: 'Pontos', icon: '⋮' },
  { id: 'badge-seal', label: 'Selo', icon: '⬤' },
]

const POSITIONS = {
  'accent-line': ['top', 'bottom'],
  'corner-fill': ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
  'glow-circle': ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
  'dot-grid': ['top-right', 'bottom-left'],
  'badge-seal': ['top-left', 'top-right'],
}

function DecorationItem({ item, index, actions }) {
  const typeDef = DECORATION_TYPES.find(t => t.id === item.type)
  const positions = POSITIONS[item.type] || ['bottom']

  return (
    <div className="p-2 rounded bg-editor-input border border-editor-input-border space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-editor-text flex items-center gap-1">
          <span className="text-sm">{typeDef?.icon}</span>
          {typeDef?.label}
        </span>
        <button
          onClick={() => actions.removeDecoration(index)}
          className="text-text-muted hover:text-red-400 text-xs"
        >
          ✕
        </button>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <label className="text-[9px] text-text-secondary w-12">Posição</label>
          <select
            value={item.position}
            onChange={e => actions.updateDecoration(index, { position: e.target.value })}
            className="flex-1 bg-editor-panel border border-editor-input-border rounded px-1.5 py-1 text-[10px] text-editor-text focus:outline-none focus:border-blue-500"
          >
            {positions.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-[9px] text-text-secondary w-12">Cor</label>
          <div className="flex gap-1">
            {['primary', 'secondary'].map(c => (
              <button
                key={c}
                onClick={() => actions.updateDecoration(index, { color: c })}
                className={`w-5 h-5 rounded-full border-2 transition-all ${
                  item.color === c ? 'border-white scale-110' : 'border-transparent'
                }`}
                style={{ background: c === 'primary' ? 'var(--brand-primary, #10B981)' : 'var(--brand-secondary, #E87722)' }}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-[9px] text-text-secondary w-12">Opac</label>
          <input
            type="range"
            min="0.05"
            max="1"
            step="0.05"
            value={item.opacity}
            onChange={e => actions.updateDecoration(index, { opacity: Number(e.target.value) })}
            className="flex-1 accent-blue-500"
          />
          <span className="text-[9px] text-editor-text w-8 text-right">{Math.round(item.opacity * 100)}%</span>
        </div>
      </div>
    </div>
  )
}

export default function DecorationPanel() {
  const { state, actions } = useEditor()
  const { items } = state.decoration

  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-xs text-text-secondary opacity-60 mb-3">Adicione elementos visuais à arte</p>
        </div>
      ) : (
        <div className="space-y-2">
          <label className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
            Elementos ativos ({items.length})
          </label>
          {items.map((item, i) => (
            <DecorationItem key={item.id} item={item} index={i} actions={actions} />
          ))}
        </div>
      )}

      <div>
        <label className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
          Adicionar elemento
        </label>
        <div className="grid grid-cols-5 gap-1 mt-1">
          {DECORATION_TYPES.map(type => (
            <button
              key={type.id}
              onClick={() => actions.addDecoration(type.id)}
              className="flex flex-col items-center gap-0.5 p-1.5 rounded bg-editor-input border border-editor-input-border text-text-secondary hover:text-editor-text hover:border-blue-500/50 transition-all"
            >
              <span className="text-sm">{type.icon}</span>
              <span className="text-[8px]">{type.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
