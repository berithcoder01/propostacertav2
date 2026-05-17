import { LogoOrInitial } from '../components/shared'

const SEGMENT_LABELS = { ELETRICA: 'Elétrica', HIDRAULICA: 'Hidráulica', PINTURA: 'Pintura', CONSTRUCAO_CIVIL: 'Construção Civil', AR_CONDICIONADO: 'Ar Condicionado', SERVICOS: 'Serviços', OUTRO: 'Serviços' }

export default function Dica({ company, fields, uploadedPhoto, elementOffset, decorativeShapes, layoutSpacing, rectBlocks, ctaButton }) {
  const name = company?.name || 'Sua Empresa'
  const phone = company?.phone || '(00) 00000-0000'
  const primary = company?.primaryColor || '#1A5276'
  const secondary = company?.secondaryColor || '#E87722'
  const logo = company?.logoUrl || null

  return (
    <div className="w-full h-full flex flex-col justify-between p-10"
      style={{ background: `linear-gradient(135deg, #0c0c0c, ${primary}44)` }}>
      <div className="flex items-center gap-2 mb-6">
        <div className="px-3 py-1 rounded-full text-white text-xs font-bold uppercase tracking-wider"
          style={{ background: secondary }}>
          💡 Dica do Profissional
        </div>
      </div>
      <div className="flex-1 flex items-center">
        <p className="text-text-primary text-xl font-semibold leading-relaxed break-words" style={{ wordBreak: 'break-word' }}>{fields.mainText}</p>
      </div>
      <div className="flex items-center gap-3 pt-6 border-t border-border">
        <LogoOrInitial logo={logo} name={name} secondary={secondary} size="sm" />
        <div>
          <p className="text-text-primary font-bold text-sm">{name}</p>
          <p className="text-muted text-xs">{phone}</p>
        </div>
      </div>
    </div>
  )
}
