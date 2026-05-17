import { useEditor } from '../context/EditorContext'

export default function ContentPanel() {
  const { state, actions } = useEditor()
  const { preset, fields } = state

  if (!preset) return null

  return (
    <div className="space-y-3">
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
              className="w-full bg-editor-input border border-editor-input-border rounded-lg px-2 py-1.5 text-editor-text placeholder-text-muted text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 resize-none"
            />
          ) : (
            <input
              type="text"
              value={fields[field.key] ?? field.defaultValue}
              onChange={e => actions.setField(field.key, e.target.value)}
              placeholder={field.placeholder}
              maxLength={field.maxLength}
              className="w-full bg-editor-input border border-editor-input-border rounded-lg px-2 py-1.5 text-editor-text placeholder-text-muted text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
            />
          )}
        </div>
      ))}
    </div>
  )
}
