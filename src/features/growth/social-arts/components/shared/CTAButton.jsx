import { Phone, MapPin, ChevronRight } from 'lucide-react'

/**
 * Renderiza um ou mais itens de CTA conforme os tipos ativos.
 * Suporta multi-seleção: botão + telefone + endereço simultâneos.
 */
export default function CTAButton({ ctaButton, alignment = 'center', className = '' }) {
  if (!ctaButton?.enabled) return null

  // Suporte ao novo sistema multi-tipo
  const activeTypes = ctaButton.activeTypes || [ctaButton.type || 'button']
  const phoneValue   = ctaButton.phone    || '(00) 00000-0000'
  const addressValue = ctaButton.address  || 'Sua Cidade - UF'

  const justifyClass = alignment === 'left'
    ? 'justify-start'
    : alignment === 'right'
    ? 'justify-end'
    : 'justify-center'

  const btnStyle = {
    background: ctaButton.color,
    color: ctaButton.textColor,
    borderRadius: ctaButton.borderRadius,
  }

  return (
    <div className={`flex flex-col items-stretch gap-1.5 ${justifyClass} ${className}`}>
      {activeTypes.includes('button') && (
        <div className={`flex ${justifyClass}`}>
          <span
            className="px-5 py-2.5 text-sm font-bold flex items-center justify-center gap-2 border border-current shadow-sm"
            style={btnStyle}
          >
            {ctaButton.text || 'Saiba mais'}
            <ChevronRight size={14} style={{ strokeWidth: 3 }} />
          </span>
        </div>
      )}

      {activeTypes.includes('phone') && (
        <div className={`flex ${justifyClass}`}>
          <span
            className="px-4 py-2 text-sm font-bold flex items-center justify-center gap-2 border border-current shadow-sm"
            style={btnStyle}
          >
            <Phone size={13} className="flex-shrink-0" style={{ strokeWidth: 2.5 }} />
            <span>{phoneValue}</span>
          </span>
        </div>
      )}

      {activeTypes.includes('address') && (
        <div className={`flex ${justifyClass}`}>
          <span
            className="px-4 py-2 text-sm font-bold flex items-center justify-center gap-2 border border-current shadow-sm"
            style={btnStyle}
          >
            <MapPin size={13} className="flex-shrink-0" style={{ strokeWidth: 2.5 }} />
            <span>{addressValue}</span>
          </span>
        </div>
      )}
    </div>
  )
}
