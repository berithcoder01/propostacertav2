import { LogoOrInitial, CTAButton, RectBlocks, DecorativeShapes, ExtraTextsRenderer } from '../components/shared'
import { resolveBackground, resolveOverlay } from '../utils/background'

export default function Dica({ company, fields, background, uploadedPhoto, elementOffset, decorativeShapes, decorationItems = [], layoutSpacing, rectBlocks, ctaButton, extraTexts = [] }) {
  const name = company?.name || 'Sua Empresa'
  const phone = company?.phone || '(00) 00000-0000'
  const primary = company?.primaryColor || '#1A5276'
  const secondary = company?.secondaryColor || '#E87722'
  const logo = company?.logoUrl || null

  const badge = fields.badge || '💡 Dica do Profissional'
  const mainText = fields.mainText || ''

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
        <div className="flex items-center gap-2">
          <div className="px-3 py-1 rounded-full text-white text-xs font-bold uppercase tracking-wider"
            style={{ background: secondary }}>
            {badge}
          </div>
        </div>
        
        <div className="flex-1 flex items-center">
          <p className="text-white text-xl font-semibold leading-relaxed break-words" style={{ wordBreak: 'break-word' }}>{mainText}</p>
        </div>
        
        <ExtraTextsRenderer extraTexts={extraTexts} />

        
        <CTAButton ctaButton={ctaButton} alignment="center" />

        <div className="flex items-center gap-3 pt-4 border-t border-white/20">
          <LogoOrInitial logo={logo} name={name} secondary={secondary} size="sm" />
          <div>
            <p className="text-white font-bold text-sm">{name}</p>
            <p className="text-white/60 text-xs">{phone}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
