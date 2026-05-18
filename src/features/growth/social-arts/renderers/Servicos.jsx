import { LogoOrInitial, CTAButton, RectBlocks, DecorativeShapes } from '../components/shared'
import { getSegmentLabel } from '../utils/segments'
import { resolveBackground, resolveOverlay } from '../utils/background'

export default function Servicos({ company, fields, background, uploadedPhoto, elementOffset, decorativeShapes, layoutSpacing, rectBlocks, ctaButton }) {
  const name = company?.name || 'Sua Empresa'
  const phone = company?.phone || '(00) 00000-0000'
  const segment = getSegmentLabel(company?.segment)
  const primary = company?.primaryColor || '#1A5276'
  const secondary = company?.secondaryColor || '#E87722'
  const logo = company?.logoUrl || null

  const sectionTitle = fields.sectionTitle || 'Nossos Serviços'
  const tagline = fields.tagline || ''

  const bgStyle = resolveBackground(background, company)
  const overlayStyle = resolveOverlay(background)

  return (
    <div className="w-full h-full relative flex flex-col" style={bgStyle}>
      {overlayStyle && <div style={overlayStyle} />}

      <RectBlocks rectBlocks={rectBlocks} primary={primary} />
      <DecorativeShapes shapes={decorativeShapes} primary={primary} secondary={secondary} />

      <div
        className="relative z-10 flex-1 flex flex-col p-10"
        style={{
          transform: `translate(${elementOffset.x}px, ${elementOffset.y}px)`,
          gap: `${layoutSpacing}px`,
        }}
      >
        <div className="flex items-center gap-3">
          <LogoOrInitial logo={logo} name={name} secondary={secondary} size="md" className="bg-white/10 p-1" />
          <div>
            <h2 className="text-white font-black text-xl">{name}</h2>
            <p className="text-white/60 text-sm">{segment}</p>
          </div>
        </div>
        
        <div className="text-white/50 text-xs uppercase tracking-widest">{sectionTitle}</div>
        
        <div className="space-y-4 flex-1">
          {[fields.service1, fields.service2, fields.service3].filter(Boolean).map((svc, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                style={{ background: secondary }}>
                {i + 1}
              </div>
              <span className="text-white text-sm font-medium break-words" style={{ wordBreak: 'break-word' }}>{svc}</span>
            </div>
          ))}
        </div>
        
        <CTAButton ctaButton={ctaButton} alignment="center" />

        <div className="pt-4 border-t border-white/10">
          <p className="text-white/70 text-sm italic break-words" style={{ wordBreak: 'break-word' }}>{tagline}</p>
          <p className="text-white/50 text-xs mt-1">{phone}</p>
        </div>
      </div>
    </div>
  )
}
