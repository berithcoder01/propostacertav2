import { LogoOrInitial, CTAButton, RectBlocks, DecorativeShapes, ExtraTextsRenderer } from '../components/shared'
import { resolveBackground, resolveOverlay } from '../utils/background'

export default function Depoimento({ company, fields, background, uploadedPhoto, elementOffset, decorativeShapes, decorationItems = [], layoutSpacing, rectBlocks, ctaButton, extraTexts = [] }) {
  const name = company?.name || 'Sua Empresa'
  const phone = company?.phone || '(00) 00000-0000'
  const primary = company?.primaryColor || '#1A5276'
  const secondary = company?.secondaryColor || '#E87722'
  const logo = company?.logoUrl || null

  const mainText = fields.mainText || ''
  const clientName = fields.clientName || 'Cliente Satisfeito'

  const bgStyle = resolveBackground(background, company)
  const overlayStyle = resolveOverlay(background)

  return (
    <div className="w-full h-full relative flex flex-col" style={bgStyle}>
      {overlayStyle && <div style={overlayStyle} />}

      <RectBlocks rectBlocks={rectBlocks} primary={primary} />
      <DecorativeShapes shapes={decorativeShapes} items={decorationItems} primary={primary} secondary={secondary} />

      <div
        className="relative z-10 flex-1 flex flex-col justify-between p-10"
        style={{
          transform: `translate(${elementOffset.x}px, ${elementOffset.y}px)`,
          gap: `${layoutSpacing}px`,
        }}
      >
        <div className="flex gap-1">
          {[1,2,3,4,5].map(i => <span key={i} style={{ color: secondary }} className="text-xl">★</span>)}
        </div>
        
        <div className="flex-1 flex flex-col justify-center">
          <div className="text-5xl mb-4 opacity-20 text-white font-serif leading-none">"</div>
          <p className="text-white text-lg italic leading-relaxed break-words" style={{ wordBreak: 'break-word' }}>{mainText}</p>
          <div className="text-5xl text-right mt-4 opacity-20 text-white font-serif leading-none">"</div>
        </div>
        
        <ExtraTextsRenderer extraTexts={extraTexts} />

        
        <CTAButton ctaButton={ctaButton} alignment="center" />

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
              {clientName.charAt(0)}
            </div>
            <div>
              <p className="text-white font-bold text-sm">{clientName}</p>
              <p className="text-white/60 text-xs">via {name}</p>
            </div>
          </div>
          <LogoOrInitial logo={logo} name={name} secondary={secondary} size="sm" className="opacity-70" />
        </div>
      </div>
    </div>
  )
}
