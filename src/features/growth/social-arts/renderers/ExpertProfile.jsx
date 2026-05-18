import { Users } from 'lucide-react'
import { LogoOrInitial, CTAButton, RectBlocks, DecorativeShapes } from '../components/shared'
import { getSegmentLabel } from '../utils/segments'
import { resolveBackground, resolveOverlay } from '../utils/background'

export default function ExpertProfile({ company, fields, background, uploadedPhoto, elementOffset, decorativeShapes, layoutSpacing, rectBlocks, ctaButton }) {
  const name = company?.name || 'Sua Empresa'
  const phone = company?.phone || '(00) 00000-0000'
  const segment = getSegmentLabel(company?.segment)
  const primary = company?.primaryColor || '#1A5276'
  const secondary = company?.secondaryColor || '#E87722'
  const logo = company?.logoUrl || null

  const mainText = fields.mainText || ''
  const badge = fields.badge || 'Especialista Verificado'

  const bgStyle = resolveBackground(background, company)
  const overlayStyle = resolveOverlay(background)

  return (
    <div className="w-full h-full relative flex flex-col" style={bgStyle}>
      {overlayStyle && <div style={overlayStyle} />}

      <RectBlocks rectBlocks={rectBlocks} primary={primary} />
      <DecorativeShapes shapes={decorativeShapes} primary={primary} secondary={secondary} />

      <div
        className="relative z-10 flex flex-col justify-between h-full p-10"
        style={{
          transform: `translate(${elementOffset.x}px, ${elementOffset.y}px)`,
          gap: `${layoutSpacing}px`,
        }}
      >
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ background: secondary }} />
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: secondary }}>{badge}</span>
        </div>
        
        <div>
          <h2 className="text-white font-black text-3xl mb-2 break-words" style={{ wordBreak: 'break-word' }}>{mainText}</h2>
          <p className="text-white/60 text-sm mb-4">{segment}</p>
          
          <CTAButton ctaButton={ctaButton} alignment="left" />

          <div className="flex items-center gap-3 pt-4 border-t border-white/20">
            <LogoOrInitial logo={logo} name={name} secondary={secondary} size="md" />
            <div>
              <p className="text-white font-bold text-sm">{name}</p>
              <p className="text-white/60 text-xs">{phone}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
