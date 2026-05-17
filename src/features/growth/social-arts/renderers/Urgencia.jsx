import { LogoOrInitial } from '../components/shared'

const SEGMENT_LABELS = { ELETRICA: 'Elétrica', HIDRAULICA: 'Hidráulica', PINTURA: 'Pintura', CONSTRUCAO_CIVIL: 'Construção Civil', AR_CONDICIONADO: 'Ar Condicionado', SERVICOS: 'Serviços', OUTRO: 'Serviços' }

export default function Urgencia({ company, fields, uploadedPhoto, elementOffset, decorativeShapes, layoutSpacing, rectBlocks, ctaButton }) {
  const name = company?.name || 'Sua Empresa'
  const phone = company?.phone || '(00) 00000-0000'
  const segment = SEGMENT_LABELS[company?.segment] || 'Serviços'
  const secondary = company?.secondaryColor || '#E87722'
  const logo = company?.logoUrl || null

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-10 text-center"
      style={{ background: 'linear-gradient(135deg, #dc2626, #7f1d1d)' }}>
      <div className="text-6xl mb-6 animate-pulse">🚨</div>
      <h2 className="text-3xl font-black text-text-primary mb-3">
        Precisa de <br />{segment}?
      </h2>
      <p className="text-text-secondary text-base mb-8 break-words" style={{ wordBreak: 'break-word' }}>{fields.mainText}</p>
      <div className="bg-white rounded-2xl px-8 py-4 mb-6 shadow-lg border border-border">
        <p className="font-black text-2xl text-text-primary">{phone}</p>
      </div>
      <div className="flex items-center gap-2 text-muted text-sm">
        <LogoOrInitial logo={logo} name={name} secondary={secondary} size="sm" />
        <span>{name} — Atendimento Rápido</span>
      </div>
    </div>
  )
}
