import { LogoOrInitial, CTAButton, RectBlocks, DecorativeShapes } from '../components/shared'
import { getSegmentLabel } from '../utils/segments'
import { resolveBackground, resolveOverlay } from '../utils/background'

export default function Urgencia({ company, fields, background, uploadedPhoto, elementOffset, decorativeShapes, layoutSpacing, rectBlocks, ctaButton }) {
  const name = company?.name || 'Sua Empresa'
  const phone = company?.phone || '(00) 00000-0000'
  const segment = getSegmentLabel(company?.segment)
  const primary = company?.primaryColor || '#1e3a5f'
  const secondary = company?.secondaryColor || '#E87722'
  const logo = company?.logoUrl || null

  const headline = fields.headline || `Precisa de ${segment}?`
  const emoji = fields.emoji || '🚨'
  const mainText = fields.mainText || ''

  const bgStyle = resolveBackground(background, company)
  const overlayStyle = resolveOverlay(background)

  return (
    <div className="w-full h-full relative flex flex-col" style={bgStyle}>
      {overlayStyle && <div style={overlayStyle} />}

      <RectBlocks rectBlocks={rectBlocks} primary={primary} />
      <DecorativeShapes shapes={decorativeShapes} primary={primary} secondary={secondary} />

      <div
        className="relative z-10 flex-1 flex flex-col items-center justify-center p-10 text-center"
        style={{
          transform: `translate(${elementOffset.x}px, ${elementOffset.y}px)`,
          gap: `${layoutSpacing}px`,
        }}
      >
        <div className="text-6xl mb-2">{emoji}</div>
        <h2 className="text-3xl font-black text-white mb-3">
          {headline}
        </h2>
        {mainText && <p className="text-white/90 text-base mb-4 break-words" style={{ wordBreak: 'break-word' }}>{mainText}</p>}
        
        <CTAButton ctaButton={ctaButton} alignment="center" />

        <div className="flex items-center gap-2 text-white/70 text-sm mt-4">
          <LogoOrInitial logo={logo} name={name} secondary={secondary} size="sm" />
          <span>{name} — Atendimento Rápido</span>
        </div>
      </div>
    </div>
  )
}
