import { PhotoBackground, RectBlocks, LogoOrInitial, CTAButton } from '../components/shared'

const SEGMENT_LABELS = { ELETRICA: 'Elétrica', HIDRAULICA: 'Hidráulica', PINTURA: 'Pintura', CONSTRUCAO_CIVIL: 'Construção Civil', AR_CONDICIONADO: 'Ar Condicionado', SERVICOS: 'Serviços', OUTRO: 'Serviços' }

export default function StoryPromo({ company, fields, uploadedPhoto, elementOffset, decorativeShapes, layoutSpacing, rectBlocks, ctaButton }) {
  const name = company?.name || 'Sua Empresa'
  const phone = company?.phone || '(00) 00000-0000'
  const secondary = company?.secondaryColor || '#E87722'
  const logo = company?.logoUrl || null

  return (
    <div className="w-full h-full relative flex flex-col" style={{ background: '#111' }}>
      <PhotoBackground uploadedPhoto={uploadedPhoto} overlay="bg-gradient-to-t from-black/95 via-black/40 to-black/20" />
      <RectBlocks rectBlocks={rectBlocks} primary={company?.primaryColor || '#1A5276'} />

      <div className="relative z-10 p-8 pt-10" style={{ marginBottom: layoutSpacing }}>
        <div className="flex items-center gap-2">
          <LogoOrInitial logo={logo} name={name} secondary={secondary} size="sm" />
          <span className="text-text-secondary text-sm font-bold">{name}</span>
        </div>
      </div>
      <div className="relative z-10 flex-1 flex items-center justify-center px-8" style={{ gap: layoutSpacing }}>
        <div className="text-center w-full flex flex-col items-center" style={{ gap: layoutSpacing / 2 }}>
          <p className="text-text-primary font-black text-2xl leading-snug break-words" style={{ wordBreak: 'break-word' }}>{fields.mainText}</p>
          {fields.subtitle && <p className="text-text-secondary text-sm break-words" style={{ wordBreak: 'break-word' }}>{fields.subtitle}</p>}
        </div>
      </div>
      <div className={`relative z-10 p-8 pb-10 ${ctaButton.alignment === 'left' ? 'text-left' : ctaButton.alignment === 'right' ? 'text-right' : 'text-center'}`} style={{ marginTop: layoutSpacing }}>
        <CTAButton ctaButton={ctaButton} alignment={ctaButton.alignment} className="inline-block" />
        {!ctaButton.enabled && (
          <div className="inline-block px-6 py-3 rounded-full text-text-primary font-bold text-sm" style={{ background: secondary }}>
            📞 {phone}
          </div>
        )}
      </div>
    </div>
  )
}
