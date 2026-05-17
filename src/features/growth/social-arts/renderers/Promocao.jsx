import { LogoOrInitial } from '../components/shared'

const SEGMENT_LABELS = { ELETRICA: 'Elétrica', HIDRAULICA: 'Hidráulica', PINTURA: 'Pintura', CONSTRUCAO_CIVIL: 'Construção Civil', AR_CONDICIONADO: 'Ar Condicionado', SERVICOS: 'Serviços', OUTRO: 'Serviços' }

export default function Promocao({ company, fields, uploadedPhoto, elementOffset, decorativeShapes, layoutSpacing, rectBlocks, ctaButton }) {
  const name = company?.name || 'Sua Empresa'
  const phone = company?.phone || '(00) 00000-0000'
  const segment = SEGMENT_LABELS[company?.segment] || 'Serviços'
  const primary = company?.primaryColor || '#1A5276'
  const secondary = company?.secondaryColor || '#E87722'
  const logo = company?.logoUrl || null

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-10 text-center"
      style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}>
      <LogoOrInitial logo={logo} name={name} secondary={secondary} size="lg" className="mb-6 bg-white/20 p-2" />
      <h2 className="text-3xl font-black text-text-primary mb-2">{name}</h2>
      <p className="text-text-secondary text-sm mb-6 uppercase tracking-widest">{segment}</p>
      <div className="bg-gray-50 backdrop-blur-sm rounded-2xl px-8 py-5 mb-6 border border-border w-full mx-2">
        <p className="text-text-primary font-bold text-xl leading-snug break-words" style={{ wordBreak: 'break-word' }}>{fields.mainText}</p>
        {fields.subtitle && <p className="text-text-secondary text-sm mt-3 break-words" style={{ wordBreak: 'break-word' }}>{fields.subtitle}</p>}
      </div>
      <div className="flex items-center gap-2 text-text-secondary text-sm">
        <span>📞</span>
        <span>{phone}</span>
      </div>
    </div>
  )
}
