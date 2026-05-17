import { useEditor } from '../context/EditorContext'
import { ToggleSwitch, ColorPickerRow, SliderControl, AlignmentButtons } from '../components/ui'

export default function CTAPanel() {
  const { state, actions } = useEditor()
  const { cta } = state

  return (
    <div className="space-y-3">
      <ToggleSwitch enabled={cta.enabled} onChange={v => actions.setCta({ enabled: v })} label="Botão CTA" />

      {cta.enabled && (
        <>
          <input
            type="text"
            value={cta.text}
            onChange={e => actions.setCta({ text: e.target.value })}
            className="w-full px-2 py-1 rounded bg-editor-input border border-editor-input-border text-editor-text text-xs focus:border-blue-500 focus:outline-none"
          />
          <div className="flex gap-2">
            <ColorPickerRow label="Cor" value={cta.color} onChange={v => actions.setCta({ color: v })} />
            <ColorPickerRow label="Texto" value={cta.textColor} onChange={v => actions.setCta({ textColor: v })} />
          </div>
          <SliderControl
            label="Arredondamento"
            value={cta.borderRadius === 9999 ? 24 : cta.borderRadius}
            min={0}
            max={24}
            step={2}
            onChange={v => actions.setCta({ borderRadius: v === 24 ? 9999 : v })}
            unit=""
          />
          <div>
            <label className="text-[9px] text-text-secondary">Alinhamento</label>
            <AlignmentButtons value={cta.alignment} onChange={v => actions.setCta({ alignment: v })} />
          </div>
        </>
      )}
    </div>
  )
}
