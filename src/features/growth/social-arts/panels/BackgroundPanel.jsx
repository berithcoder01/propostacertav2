import { useEditor } from '../context/EditorContext'

export default function BackgroundPanel() {
  const { state, actions } = useEditor()
  const { background } = state

  const types = [
    { id: 'solid', label: 'Cor Sólida' },
    { id: 'gradient', label: 'Gradiente' },
    { id: 'image', label: 'Imagem' },
  ]

  return (
    <div className="space-y-4">
      {/* Type selector */}
      <div className="flex gap-1 p-1 bg-editor-input rounded-lg">
        {types.map(t => (
          <button
            key={t.id}
            onClick={() => actions.setBackground({ type: t.id })}
            className={`flex-1 py-1.5 rounded-md text-[10px] font-semibold transition-all ${
              background.type === t.id
                ? 'bg-blue-600 text-white'
                : 'text-text-secondary hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Solid */}
      {background.type === 'solid' && (
        <div className="space-y-2">
          <label className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
            Cor principal
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={background.color1 || '#1A5276'}
              onChange={e => actions.setBackground({ color1: e.target.value })}
              className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
            />
            <input
              type="text"
              value={background.color1 || '#1A5276'}
              onChange={e => actions.setBackground({ color1: e.target.value })}
              className="flex-1 bg-editor-input border border-editor-input-border rounded-lg px-2 py-1.5 text-editor-text text-xs font-mono focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      )}

      {/* Gradient */}
      {background.type === 'gradient' && (
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
              Cor 1
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={background.color1 || '#1A5276'}
                onChange={e => actions.setBackground({ color1: e.target.value })}
                className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
              />
              <input
                type="text"
                value={background.color1 || '#1A5276'}
                onChange={e => actions.setBackground({ color1: e.target.value })}
                className="flex-1 bg-editor-input border border-editor-input-border rounded-lg px-2 py-1.5 text-editor-text text-xs font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
              Cor 2
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={background.color2 || '#E87722'}
                onChange={e => actions.setBackground({ color2: e.target.value })}
                className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
              />
              <input
                type="text"
                value={background.color2 || '#E87722'}
                onChange={e => actions.setBackground({ color2: e.target.value })}
                className="flex-1 bg-editor-input border border-editor-input-border rounded-lg px-2 py-1.5 text-editor-text text-xs font-mono focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
                Ângulo
              </label>
              <span className="text-[10px] text-editor-text">{background.angle}°</span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              step="15"
              value={background.angle}
              onChange={e => actions.setBackground({ angle: Number(e.target.value) })}
              className="w-full accent-blue-500"
            />
          </div>
          {/* Preview */}
          <div
            className="h-12 rounded-lg border border-editor-input-border"
            style={{
              background: `linear-gradient(${background.angle}deg, ${background.color1 || '#1A5276'}, ${background.color2 || '#E87722'})`,
            }}
          />
        </div>
      )}

      {/* Image */}
      {background.type === 'image' && (
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
              Imagem de fundo
            </label>
            <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-editor-input-border rounded-lg cursor-pointer hover:border-blue-500/50 transition-colors">
              {background.imageUrl ? (
                <img src={background.imageUrl} alt="Preview" className="w-full h-full object-cover rounded-lg" />
              ) : (
                <>
                  <span className="text-2xl mb-1">🖼️</span>
                  <span className="text-[10px] text-text-secondary">Clique para upload</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) {
                    const reader = new FileReader()
                    reader.onload = (ev) => actions.setBackground({ imageUrl: ev.target.result })
                    reader.readAsDataURL(file)
                  }
                }}
              />
            </label>
          </div>
          {background.imageUrl && (
            <>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
                    Opacidade do overlay
                  </label>
                  <span className="text-[10px] text-editor-text">{Math.round(background.overlayOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={background.overlayOpacity}
                  onChange={e => actions.setBackground({ overlayOpacity: Number(e.target.value) })}
                  className="w-full accent-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider">
                  Cor do overlay
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={background.overlayColor || '#000000'}
                    onChange={e => actions.setBackground({ overlayColor: e.target.value })}
                    className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={background.overlayColor || '#000000'}
                    onChange={e => actions.setBackground({ overlayColor: e.target.value })}
                    className="flex-1 bg-editor-input border border-editor-input-border rounded-lg px-2 py-1.5 text-editor-text text-xs font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Reset */}
      <button
        onClick={actions.resetBackground}
        className="w-full py-2 rounded-lg text-[10px] font-semibold text-text-secondary border border-editor-input-border hover:text-white hover:border-white/20 transition-colors"
      >
        Restaurar padrão
      </button>
    </div>
  )
}
