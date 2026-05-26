import { LogoOrInitial, CTAButton, RectBlocks, DecorativeShapes, ExtraTextsRenderer } from '../components/shared'
import { getSegmentLabel } from '../utils/segments'
import { resolveBackground, resolveOverlay } from '../utils/background'

export default function NeoBrutalism({ company, fields, background, uploadedPhoto, elementOffset, decorativeShapes, decorationItems = [], layoutSpacing, rectBlocks, ctaButton, extraTexts = [] }) {
  const name = company?.name || 'Sua Empresa'
  const phone = company?.phone || '(00) 00000-0000'
  const segment = getSegmentLabel(company?.segment)
  const primary = company?.primaryColor || '#1A5276'
  const secondary = company?.secondaryColor || '#E87722'
  const logo = company?.logoUrl || null

  const headline = fields.headline || 'QUALIDADE'
  const mainText = fields.mainText || ''

  const bgStyle = resolveBackground(background, company)
  const overlayStyle = resolveOverlay(background)

  return (
    <div className="w-full h-full relative flex flex-col p-10 gap-6" style={bgStyle}>
      {overlayStyle && <div style={overlayStyle} />}

      <RectBlocks rectBlocks={rectBlocks} primary={primary} />
      <DecorativeShapes shapes={decorativeShapes} items={decorationItems} primary={primary} secondary={secondary} />

      <div
        className="relative z-10 flex flex-col h-full"
        style={{
          transform: `translate(${elementOffset.x}px, ${elementOffset.y}px)`,
          gap: `${layoutSpacing}px`,
        }}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-white font-black text-4xl leading-none mb-2 break-words" style={{ wordBreak: 'break-word' }}>{headline}</h2>
            <p className="text-white/70 text-sm font-bold uppercase tracking-widest">{segment}</p>
          </div>
          <LogoOrInitial logo={logo} name={name} secondary={secondary} size="lg" className="border-4" style={{ borderColor: secondary }} />
        </div>
        
        <div className="flex-1 flex items-end">
          <div className="w-full border-b-4" style={{ borderColor: secondary }}>
            <p className="text-white/80 text-sm font-bold py-4 break-words" style={{ wordBreak: 'break-word' }}>{mainText}</p>
          </div>
        </div>
        
        <div className={`pt-4 border-t-4 space-y-3 ${ctaButton.alignment === 'left' ? 'text-left' : ctaButton.alignment === 'right' ? 'text-right' : 'text-center'}`} style={{ borderColor: secondary }}>
          <ExtraTextsRenderer extraTexts={extraTexts} />

          <CTAButton ctaButton={ctaButton} alignment={ctaButton.alignment} className="inline-block" />
        </div>
      </div>
    </div>
  )
}
