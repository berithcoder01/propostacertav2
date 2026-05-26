import { RectBlocks, LogoOrInitial, CTAButton, DecorativeShapes, ExtraTextsRenderer } from '../components/shared'
import { resolveBackground, resolveOverlay } from '../utils/background'

export default function StoryPromo({ company, fields, background, uploadedPhoto, elementOffset, decorativeShapes, decorationItems = [], layoutSpacing, rectBlocks, ctaButton, extraTexts = [] }) {
  const name = company?.name || 'Sua Empresa'
  const phone = company?.phone || '(00) 00000-0000'
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
        className="relative z-10 flex flex-col h-full"
        style={{
          transform: `translate(${elementOffset.x}px, ${elementOffset.y}px)`,
          gap: `${layoutSpacing}px`,
        }}
      >
        <div className="p-8 pt-10">
          <div className="flex items-center gap-2">
            <LogoOrInitial logo={logo} name={name} secondary={secondary} size="sm" />
            <span className="text-white/70 text-sm font-bold">{name}</span>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center px-8">
          <div className="text-center w-full flex flex-col items-center" style={{ gap: `${layoutSpacing / 2}px` }}>
            <p className="text-white font-black text-2xl leading-snug break-words" style={{ wordBreak: 'break-word' }}>{mainText}</p>
            {subtitle && <p className="text-white/70 text-sm break-words" style={{ wordBreak: 'break-word' }}>{subtitle}</p>}
          </div>
        </div>
        
        <div className={`p-8 pb-10 ${ctaButton.alignment === 'left' ? 'text-left' : ctaButton.alignment === 'right' ? 'text-right' : 'text-center'}`}>
          <ExtraTextsRenderer extraTexts={extraTexts} />

          <CTAButton ctaButton={ctaButton} alignment={ctaButton.alignment} className="inline-block" />
        </div>
      </div>
    </div>
  )
}
