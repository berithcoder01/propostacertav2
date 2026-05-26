import { useEditor } from '../context/EditorContext'

const FONT_SIZES = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36]
const ALIGN_OPTIONS = [
  { value: 'left', icon: '◀' },
  { value: 'center', icon: '▬' },
  { value: 'right', icon: '▶' },
]

function ExtraTextItem({ item, onUpdate, onRemove }) {
  return (
    <div className="p-2.5 rounded-xl bg-editor-input border border-editor-input-border space-y-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[9px] font-bold text-accent uppercase tracking-wider">
          ✏️ Texto Extra
        </span>
        <button
          onClick={onRemove}
          className="text-text-muted hover:text-red-400 text-xs transition-colors"
          title="Remover texto"
        >
          ✕
        </button>
      </div>

      {/* Campo de texto */}
      <textarea
        value={item.text}
        onChange={e => onUpdate({ text: e.target.value })}
        placeholder="Digite seu texto aqui..."
        rows={2}
        className="w-full bg-editor-panel border border-editor-input-border rounded-lg px-2 py-1.5 text-editor-text placeholder-text-muted text-xs focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 resize-none transition-all"
      />

      {/* Tamanho + Cor */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <label className="text-[9px] text-text-secondary mb-0.5 block">Tamanho</label>
          <select
            value={item.fontSize}
            onChange={e => onUpdate({ fontSize: Number(e.target.value) })}
            className="w-full bg-editor-panel border border-editor-input-border rounded px-1.5 py-1 text-[10px] text-editor-text focus:outline-none focus:border-accent"
          >
            {FONT_SIZES.map(s => (
              <option key={s} value={s}>{s}px</option>
            ))}
          </select>
        </div>

        <div className="flex-shrink-0">
          <label className="text-[9px] text-text-secondary mb-0.5 block">Cor</label>
          <input
            type="color"
            value={item.color}
            onChange={e => onUpdate({ color: e.target.value })}
            className="w-8 h-7 rounded cursor-pointer border border-editor-input-border bg-editor-panel"
          />
        </div>
      </div>

      {/* Alinhamento + Bold */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {ALIGN_OPTIONS.map(a => (
            <button
              key={a.value}
              onClick={() => onUpdate({ align: a.value })}
              className={`px-2 py-1 rounded text-[10px] border transition-all ${
                item.align === a.value
                  ? 'bg-accent text-white border-accent'
                  : 'bg-editor-panel border-editor-input-border text-text-secondary hover:text-editor-text'
              }`}
            >
              {a.icon}
            </button>
          ))}
        </div>
        <button
          onClick={() => onUpdate({ bold: !item.bold })}
          className={`px-3 py-1 rounded text-[11px] font-black border transition-all ${
            item.bold
              ? 'bg-accent text-white border-accent'
              : 'bg-editor-panel border-editor-input-border text-text-secondary hover:text-editor-text'
          }`}
        >
          B
        </button>
      </div>
    </div>
  )
}

export default function ContentPanel() {
  const { state, actions } = useEditor()
  const { preset, fields, extraTexts } = state

  if (!preset) return null

  return (
    <div className="space-y-4">
      {/* Campos do preset */}
      <div className="space-y-3">
        <label className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">
          Campos do Template
        </label>
        {preset.fields.map(field => (
          <div key={field.key} className="space-y-1">
            <label className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
              {field.label}
            </label>
            {field.multiline ? (
              <textarea
                value={fields[field.key] ?? field.defaultValue}
                onChange={e => actions.setField(field.key, e.target.value)}
                placeholder={field.placeholder}
                maxLength={field.maxLength}
                rows={2}
                className="w-full bg-editor-input border border-editor-input-border rounded-lg px-2 py-1.5 text-editor-text placeholder-text-muted text-xs focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 resize-none"
              />
            ) : (
              <input
                type="text"
                value={fields[field.key] ?? field.defaultValue}
                onChange={e => actions.setField(field.key, e.target.value)}
                placeholder={field.placeholder}
                maxLength={field.maxLength}
                className="w-full bg-editor-input border border-editor-input-border rounded-lg px-2 py-1.5 text-editor-text placeholder-text-muted text-xs focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
              />
            )}
            {field.maxLength && (
              <div className="text-right text-[8px] text-text-muted">
                {(fields[field.key] ?? field.defaultValue ?? '').length}/{field.maxLength}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Divisor */}
      <div className="border-t border-border/40 dark:border-white/5 pt-3 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">
            Textos Extras ({extraTexts.length})
          </label>
          <button
            onClick={() => actions.addExtraText('')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-accent text-white text-[10px] font-bold hover:bg-accent/90 transition-all shadow-sm"
          >
            <span>+</span> Adicionar texto
          </button>
        </div>

        {extraTexts.length === 0 && (
          <p className="text-[10px] text-text-secondary/60 dark:text-white/30 italic text-center py-2">
            Adicione textos extras que aparecerão na arte
          </p>
        )}

        <div className="space-y-2">
          {extraTexts.map(item => (
            <ExtraTextItem
              key={item.id}
              item={item}
              onUpdate={updates => actions.updateExtraText(item.id, updates)}
              onRemove={() => actions.removeExtraText(item.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
