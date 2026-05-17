import { LogoOrInitial, PhoneDisplay, CTAButton } from '../components/shared'

const SEGMENT_LABELS = { ELETRICA: 'Elétrica', HIDRAULICA: 'Hidráulica', PINTURA: 'Pintura', CONSTRUCAO_CIVIL: 'Construção Civil', AR_CONDICIONADO: 'Ar Condicionado', SERVICOS: 'Serviços', OUTRO: 'Serviços' }

export default function NeoBrutalism({ company, fields, uploadedPhoto, elementOffset, decorativeShapes, layoutSpacing, rectBlocks, ctaButton }) {
  const name = company?.name || 'Sua Empresa'
  const phone = company?.phone || '(00) 00000-0000'
  const segment = SEGMENT_LABELS[company?.segment] || 'Serviços'
  const primary = company?.primaryColor || '#1A5276'
  const secondary = company?.secondaryColor || '#E87722'
  const logo = company?.logoUrl || null

  return (
    <div className="w-full h-full flex flex-col p-10 gap-8" style={{ background: primary }}>
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-text-primary font-black text-4xl leading-none mb-3 break-words" style={{ wordBreak: 'break-word' }}>{fields.mainText.split(' ')[0]}</h2>
          <p className="text-text-secondary text-sm font-bold uppercase tracking-widest">{segment}</p>
        </div>
        <LogoOrInitial logo={logo} name={name} secondary={secondary} size="lg" className="border-4" style={{ borderColor: secondary }} />
      </div>
      <div className="flex-1 flex items-end">
        <div className="w-full border-4" style={{ borderColor: secondary, borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>
          <p className="text-text-secondary text-sm font-bold py-4 break-words" style={{ wordBreak: 'break-word' }}>{fields.mainText}</p>
        </div>
      </div>
      <div className={`pt-6 border-t-4 space-y-3 ${ctaButton.alignment === 'left' ? 'text-left' : ctaButton.alignment === 'right' ? 'text-right' : 'text-center'}`} style={{ borderColor: secondary }}>
        <PhoneDisplay phone={phone} className="block font-black text-lg" />
        <CTAButton ctaButton={ctaButton} alignment={ctaButton.alignment} className="inline-block" />
        {!ctaButton.enabled && (
          <div className="px-4 py-2 font-black text-white" style={{ background: secondary }}>
            CONTATO
          </div>
        )}
      </div>
    </div>
  )
}
