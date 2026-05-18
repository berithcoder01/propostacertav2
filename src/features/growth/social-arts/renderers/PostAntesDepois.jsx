import { CTAButton, RectBlocks, DecorativeShapes } from '../components/shared'
import { resolveBackground, resolveOverlay } from '../utils/background'

export default function PostAntesDepois({ company, fields, background, uploadedPhoto, uploadedPhotoAlt, elementOffset, decorativeShapes, layoutSpacing, rectBlocks, ctaButton }) {
  const name = company?.name || 'Sua Empresa'
  const phone = company?.phone || '(00) 00000-0000'
  const primary = company?.primaryColor || '#1A5276'
  const secondary = company?.secondaryColor || '#E87722'

  const mainText = fields.mainText || ''
  const subtitle = fields.subtitle || ''

  const hasBefore = uploadedPhotoAlt
  const hasAfter = uploadedPhoto

  const bgStyle = resolveBackground(background, company)
  const overlayStyle = resolveOverlay(background)

  return (
    <div className="w-full h-full relative flex flex-col" style={bgStyle}>
      {overlayStyle && <div style={overlayStyle} />}

      <RectBlocks rectBlocks={rectBlocks} primary={primary} />
      <DecorativeShapes shapes={decorativeShapes} primary={primary} secondary={secondary} />

      <div
        className="relative z-10 flex flex-col h-full"
        style={{
          transform: `translate(${elementOffset.x}px, ${elementOffset.y}px)`,
          gap: `${layoutSpacing}px`,
        }}
      >
        <div className="flex-1 grid grid-cols-2 gap-3 p-6 pb-3">
          {/* ANTES */}
          {hasBefore ? (
            <div className="rounded-xl overflow-hidden relative">
              <img src={uploadedPhotoAlt} alt="Antes" className="w-full h-full object-cover" />
              <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/70 rounded text-[10px] text-white font-bold">ANTES</div>
            </div>
          ) : hasAfter ? (
            <div className="rounded-xl overflow-hidden relative">
              <img src={uploadedPhoto} alt="Antes (simulado)" className="w-full h-full object-cover grayscale opacity-60" />
              <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/70 rounded text-[10px] text-white font-bold">ANTES</div>
            </div>
          ) : (
            <div className="bg-gray-800 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-500">
              <span className="text-2xl">📷</span>
              <span className="text-[10px] uppercase tracking-widest font-bold">Antes</span>
            </div>
          )}

          {/* DEPOIS */}
          {hasAfter ? (
            <div className="rounded-xl overflow-hidden relative">
              <img src={uploadedPhoto} alt="Depois" className="w-full h-full object-cover" />
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] text-white font-bold" style={{ background: secondary }}>DEPOIS</div>
            </div>
          ) : (
            <div className="rounded-xl flex flex-col items-center justify-center gap-2 border-2 text-white"
              style={{ background: `${primary}33`, borderColor: secondary }}>
              <span className="text-2xl">✨</span>
              <span className="text-[10px] uppercase tracking-widest font-bold">Depois</span>
            </div>
          )}
        </div>

        <div className="p-6 text-center" style={{ background: `linear-gradient(to right, ${primary}, ${secondary})` }}>
          <h3 className="text-white font-black text-lg">{name}</h3>
          <p className="text-white/80 text-sm mt-1 break-words" style={{ wordBreak: 'break-word' }}>{mainText}</p>
          {subtitle && <p className="text-white/60 text-xs mt-1 break-words" style={{ wordBreak: 'break-word' }}>{subtitle}</p>}

          <CTAButton ctaButton={ctaButton} alignment="center" />

          <p className="text-white/50 text-xs mt-2">{phone}</p>
        </div>
      </div>
    </div>
  )
}
