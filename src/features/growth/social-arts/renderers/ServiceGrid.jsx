import { LogoOrInitial, CTAButton, RectBlocks, DecorativeShapes, ExtraTextsRenderer } from '../components/shared'
import { getSegmentLabel } from '../utils/segments'
import { resolveBackground, resolveOverlay } from '../utils/background'

export default function ServiceGrid({ company, fields, background, uploadedPhoto, elementOffset, decorativeShapes, decorationItems = [], layoutSpacing, rectBlocks, ctaButton, extraTexts = [] }) {
  const name = company?.name || 'Sua Empresa'
  const phone = company?.phone || '(00) 00000-0000'
  const segment = getSegmentLabel(company?.segment)
  const primary = company?.primaryColor || '#1A5276'
  const secondary = company?.secondaryColor || '#E87722'
  const logo = company?.logoUrl || null

  const services = [fields.service1, fields.service2, fields.service3].filter(Boolean)
  const tagline = fields.tagline || ''

  const bgStyle = resolveBackground(background, company)
  const overlayStyle = resolveOverlay(background)

  return (
    <div className="w-full h-full relative flex flex-col" style={bgStyle}>
      {overlayStyle && <div style={overlayStyle} />}

      <RectBlocks rectBlocks={rectBlocks} primary={primary} />
      <DecorativeShapes shapes={decorativeShapes} items={decorationItems} primary={primary} secondary={secondary} />

      <div
        className="relative z-10 flex flex-col p-10"
        style={{
          transform: `translate(${elementOffset.x}px, ${elementOffset.y}px)`,
          gap: `${layoutSpacing}px`,
        }}
      >
        <div className="flex items-center gap-3">
          <LogoOrInitial logo={logo} name={name} secondary={secondary} size="md" className="border-2 border-white/30" />
          <div>
            <h2 className="text-white font-black text-2xl">{name}</h2>
            <p className="text-white/60 text-xs uppercase tracking-widest">{segment}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 flex-1">
          {services.map((svc, i) => (
            <div key={i} className="backdrop-blur-sm bg-white/10 border-2 border-white/30 rounded-lg p-4 flex flex-col items-center justify-center text-center">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-black text-sm mb-2">
                {i + 1}
              </div>
              <p className="text-white font-bold text-sm break-words" style={{ wordBreak: 'break-word' }}>{svc}</p>
            </div>
          ))}
        </div>
        
        <div className="pt-4 border-t-2 border-white/20">
          <p className="text-white/70 text-xs font-semibold mb-3 break-words" style={{ wordBreak: 'break-word' }}>{tagline}</p>
          <ExtraTextsRenderer extraTexts={extraTexts} />

          <CTAButton ctaButton={ctaButton} alignment="center" />
        </div>
      </div>
    </div>
  )
}
