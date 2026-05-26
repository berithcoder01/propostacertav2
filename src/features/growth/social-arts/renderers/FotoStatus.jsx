import { Camera } from 'lucide-react'
import { RectBlocks, DecorativeShapes, LogoOrInitial, PhoneDisplay, CTAButton, ExtraTextsRenderer } from '../components/shared'
import { resolveBackground, resolveOverlay } from '../utils/background'

const SEGMENT_LABELS = { ELETRICA: 'Elétrica', HIDRAULICA: 'Hidráulica', PINTURA: 'Pintura', CONSTRUCAO_CIVIL: 'Construção Civil', AR_CONDICIONADO: 'Ar Condicionado', SERVICOS: 'Serviços', OUTRO: 'Serviços' }

export default function FotoStatus({ company, fields, background, uploadedPhoto, elementOffset, decorativeShapes, decorationItems = [], layoutSpacing, rectBlocks, ctaButton, extraTexts = [] }) {
  const name = company?.name || 'Sua Empresa'
  const phone = company?.phone || '(00) 00000-0000'
  const segment = SEGMENT_LABELS[company?.segment] || 'Serviços'
  const primary = company?.primaryColor || '#1A5276'
  const secondary = company?.secondaryColor || '#E87722'
  const logo = company?.logoUrl || null

  const bgStyle = resolveBackground(background, company)
  const overlayStyle = resolveOverlay(background)

  return (
    <div className="w-full h-full relative flex flex-col" style={bgStyle}>
      {overlayStyle && <div style={overlayStyle} />}

      <RectBlocks rectBlocks={rectBlocks} primary={primary} />
      <DecorativeShapes shapes={decorativeShapes} items={decorationItems} primary={primary} secondary={secondary} />

      <div
        className="relative z-10 flex-1 flex flex-col justify-end p-8 pb-10"
        style={{
          transform: `translate(${elementOffset.x}px, ${elementOffset.y}px)`,
          gap: `${layoutSpacing}px`,
        }}
      >
        <div style={{ marginBottom: layoutSpacing / 2 }}>
          <LogoOrInitial logo={logo} name={name} secondary={secondary} size="sm" />
        </div>

        <p className="text-text-primary font-bold text-xl leading-snug break-words" style={{ wordBreak: 'break-word', maxWidth: '100%' }}>
          {fields.mainText}
        </p>

        {fields.subtitle && (
          <p className="text-text-secondary text-sm break-words" style={{ wordBreak: 'break-word', maxWidth: '100%' }}>
            {fields.subtitle}
          </p>
        )}

        <div className="pt-2 space-y-3" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <PhoneDisplay phone={phone} className="block" />
          <ExtraTextsRenderer extraTexts={extraTexts} />

          <CTAButton ctaButton={ctaButton} alignment={ctaButton.alignment} />
        </div>
      </div>
    </div>
  )
}
