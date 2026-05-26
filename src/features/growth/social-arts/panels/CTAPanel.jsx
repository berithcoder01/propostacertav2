import { useEditor } from '../context/EditorContext'
import { useAuth } from '../../../../shared/context/AuthContext'
import { ToggleSwitch, ColorPickerRow, SliderControl, AlignmentButtons } from '../components/ui'

const CTA_TYPES = [
  { id: 'button', label: 'Botão', icon: '🎯', desc: 'Botão de ação personalizado' },
  { id: 'phone', label: 'Telefone', icon: '📞', desc: 'Exibe número de contato' },
  { id: 'address', label: 'Endereço', icon: '📍', desc: 'Exibe localização' },
]

export default function CTAPanel() {
  const { state, actions } = useEditor()
  const { cta } = state
  const { company } = useAuth()

  const defaultPhone = company?.phone || '(00) 00000-0000'
  const defaultAddress = company?.address || 'Sua Cidade - UF'

  // activeTypes is now an array for multi-select
  const activeTypes = cta.activeTypes || [cta.type || 'button']

  const toggleType = (typeId) => {
    const current = [...activeTypes]
    const idx = current.indexOf(typeId)
    if (idx >= 0) {
      // Remove only if there's more than 1 active
      if (current.length > 1) {
        current.splice(idx, 1)
      }
    } else {
      current.push(typeId)
    }
    actions.setCta({ activeTypes: current })
  }

  const isActive = (typeId) => activeTypes.includes(typeId)

  return (
    <div className="space-y-4">
      {/* Explicativo e Switch */}
      <div className="space-y-2">
        <p className="text-[10px] text-text-secondary dark:text-white/50 leading-relaxed bg-surface/40 dark:bg-black/20 p-2.5 rounded-xl border border-border/40 dark:border-white/5">
          Adicione informações de contato na arte. Você pode combinar vários tipos ao mesmo tempo!
        </p>
        <ToggleSwitch
          enabled={cta.enabled}
          onChange={v => actions.setCta({ enabled: v })}
          label="Exibir informações de contato"
        />
      </div>

      {cta.enabled && (
        <div className="space-y-4 pt-1 border-t border-border/40 dark:border-white/5">
          {/* Seleção múltipla de tipos */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">
              Tipos de Contato (selecione quantos quiser)
            </label>
            <div className="space-y-1.5">
              {CTA_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => toggleType(type.id)}
                  className={`w-full flex items-center gap-2.5 py-2 px-3 rounded-xl text-left border transition-all
                    ${isActive(type.id)
                      ? 'bg-accent/10 border-accent text-accent dark:text-accent'
                      : 'bg-white dark:bg-[#1a1a24] text-text-secondary dark:text-white/50 border-border dark:border-white/5 hover:border-accent/40'
                    }`}
                >
                  <span className="text-base flex-shrink-0">{type.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className={`text-[11px] font-bold ${isActive(type.id) ? 'text-accent' : 'text-text-primary dark:text-white/80'}`}>
                      {type.label}
                    </div>
                    <div className="text-[9px] text-text-secondary dark:text-white/40 truncate">{type.desc}</div>
                  </div>
                  {/* Checkbox visual */}
                  <div className={`w-4 h-4 rounded flex items-center justify-center border flex-shrink-0 transition-all ${
                    isActive(type.id) ? 'bg-accent border-accent' : 'border-border dark:border-white/20'
                  }`}>
                    {isActive(type.id) && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <polyline points="1.5,5 4,7.5 8.5,2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Campos condicionais por tipo ativo */}
          <div className="space-y-3">
            {isActive('button') && (
              <div className="space-y-1.5 p-2.5 rounded-xl bg-surface/30 dark:bg-black/10 border border-border/30 dark:border-white/5">
                <label className="text-[9px] font-bold text-accent uppercase tracking-wider flex items-center gap-1">
                  🎯 Texto do Botão
                </label>
                <input
                  type="text"
                  value={cta.text}
                  onChange={e => actions.setCta({ text: e.target.value })}
                  placeholder="Ex: Peça seu orçamento!"
                  className="w-full px-3 py-2 rounded-xl bg-editor-input border border-editor-input-border text-editor-text text-xs focus:border-accent focus:ring-1 focus:ring-accent/20 focus:outline-none transition-all"
                />
              </div>
            )}

            {isActive('phone') && (
              <div className="space-y-1.5 p-2.5 rounded-xl bg-surface/30 dark:bg-black/10 border border-border/30 dark:border-white/5">
                <label className="text-[9px] font-bold text-accent uppercase tracking-wider flex items-center gap-1">
                  📞 Número de Telefone
                </label>
                <input
                  type="text"
                  value={cta.phone}
                  onChange={e => actions.setCta({ phone: e.target.value })}
                  placeholder={defaultPhone}
                  className="w-full px-3 py-2 rounded-xl bg-editor-input border border-editor-input-border text-editor-text text-xs focus:border-accent focus:ring-1 focus:ring-accent/20 focus:outline-none transition-all"
                />
                <p className="text-[9px] text-text-secondary/60 dark:text-white/30 italic">
                  Se deixado em branco, usará o telefone do perfil.
                </p>
              </div>
            )}

            {isActive('address') && (
              <div className="space-y-1.5 p-2.5 rounded-xl bg-surface/30 dark:bg-black/10 border border-border/30 dark:border-white/5">
                <label className="text-[9px] font-bold text-accent uppercase tracking-wider flex items-center gap-1">
                  📍 Endereço
                </label>
                <input
                  type="text"
                  value={cta.address}
                  onChange={e => actions.setCta({ address: e.target.value })}
                  placeholder={defaultAddress}
                  className="w-full px-3 py-2 rounded-xl bg-editor-input border border-editor-input-border text-editor-text text-xs focus:border-accent focus:ring-1 focus:ring-accent/20 focus:outline-none transition-all"
                />
                <p className="text-[9px] text-text-secondary/60 dark:text-white/30 italic">
                  Se deixado em branco, usará o endereço do perfil.
                </p>
              </div>
            )}
          </div>

          {/* Configurações visuais */}
          <div className="space-y-3 pt-2 border-t border-border/40 dark:border-white/5">
            <label className="text-[9px] font-bold text-text-secondary uppercase tracking-wider block">
              Aparência
            </label>
            <div className="flex gap-2">
              <ColorPickerRow label="Cor Fundo" value={cta.color} onChange={v => actions.setCta({ color: v })} />
              <ColorPickerRow label="Cor Texto" value={cta.textColor} onChange={v => actions.setCta({ textColor: v })} />
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
              <label className="text-[9px] text-text-secondary uppercase font-bold tracking-wider mb-1 block">Alinhamento</label>
              <AlignmentButtons value={cta.alignment} onChange={v => actions.setCta({ alignment: v })} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
