import { LogoOrInitial, CTAButton, RectBlocks, DecorativeShapes, ExtraTextsRenderer } from '../components/shared'
import { getSegmentLabel } from '../utils/segments'
import { resolveBackground, resolveOverlay } from '../utils/background'

export default function Promocao({ company, fields, background, uploadedPhoto, elementOffset, decorativeShapes, decorationItems = [], layoutSpacing, rectBlocks, ctaButton, extraTexts = [] }) {
  const name = company?.name || 'Sua Empresa'
  const phone = company?.phone || '(00) 00000-0000'
  const segment = getSegmentLabel(company?.segment)
  const primary = company?.primaryColor || '#1A5276'
  const secondary = company?.secondaryColor || '#E87722'
  const logo = company?.logoUrl || null

  const mainText = fields.mainText || ''
  const subtitle = fields.subtitle || ''

  const bgStyle = resolveBackground(background, company)
  const overlayStyle = resolveOverlay(background)

  return (
    <div className="w-full h-full relative flex flex-col" style={bgStyle}>
      {overlayStyle && <div style={overlayStyle} />}

      <RectBlocks rectBlocks={rectBlocks} primary={primary} />
      <DecorativeShapes shapes={decorativeShapes} items={decorationItems} primary={primary} secondary={secondary} />

      <div
        className="relative z-10 flex-1 flex flex-col items-center justify-center p-10 text-center"
        style={{
          transform: `translate(${elementOffset.x}px, ${elementOffset.y}px)`,
          gap: `${layoutSpacing}px`,
        }}
      >
        <LogoOrInitial logo={logo} name={name} secondary={secondary} size="lg" className="mb-4 bg-white/20 p-2" />
        <h2 className="text-3xl font-black text-white mb-1">{name}</h2>
        <p className="text-white/70 text-sm mb-4 uppercase tracking-widest">{segment}</p>
        
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-8 py-5 mb-4 border border-white/20 w-full mx-2">
          <p className="text-gray-900 font-bold text-xl leading-snug break-words" style={{ wordBreak: 'break-word' }}>{mainText}</p>
          {subtitle && <p className="text-gray-600 text-sm mt-2 break-words" style={{ wordBreak: 'break-word' }}>{subtitle}</p>}
        </div>
        
        <ExtraTextsRenderer extraTexts={extraTexts} />

        
        <CTAButton ctaButton={ctaButton} alignment="center" />

        <div className="flex items-center gap-2 text-white/70 text-sm mt-2">
          <span>📞</span>
          <span>{phone}</span>
        </div>
      </div>
    </div>
  )
}
