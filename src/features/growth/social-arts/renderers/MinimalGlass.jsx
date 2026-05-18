import { LogoOrInitial, CTAButton, RectBlocks, DecorativeShapes } from '../components/shared'
import { resolveBackground, resolveOverlay } from '../utils/background'

export default function MinimalGlass({ company, fields, background, uploadedPhoto, elementOffset, decorativeShapes, layoutSpacing, rectBlocks, ctaButton }) {
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
      <DecorativeShapes shapes={decorativeShapes} primary={primary} secondary={secondary} />

      <div
        className="relative z-10 flex-1 flex flex-col justify-end p-8 pb-10"
        style={{
          transform: `translate(${elementOffset.x}px, ${elementOffset.y}px)`,
          gap: `${layoutSpacing}px`,
        }}
      >
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl">
          <p className="text-white font-bold text-2xl leading-snug mb-2 break-words" style={{ wordBreak: 'break-word' }}>{mainText}</p>
          {subtitle && <p className="text-white/70 text-sm mb-4 break-words" style={{ wordBreak: 'break-word' }}>{subtitle}</p>}
          
          <CTAButton ctaButton={ctaButton} alignment="center" />

          <div className="flex items-center gap-3 pt-3 border-t border-white/20">
            <LogoOrInitial logo={logo} name={name} secondary={secondary} size="sm" />
            <div>
              <p className="text-white font-semibold text-sm">{name}</p>
              <p className="text-white/60 text-xs">{phone}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
