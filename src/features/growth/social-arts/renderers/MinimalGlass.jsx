import { PhotoBackground, LogoOrInitial } from '../components/shared'

const SEGMENT_LABELS = { ELETRICA: 'Elétrica', HIDRAULICA: 'Hidráulica', PINTURA: 'Pintura', CONSTRUCAO_CIVIL: 'Construção Civil', AR_CONDICIONADO: 'Ar Condicionado', SERVICOS: 'Serviços', OUTRO: 'Serviços' }

export default function MinimalGlass({ company, fields, uploadedPhoto, elementOffset, decorativeShapes, layoutSpacing, rectBlocks, ctaButton }) {
  const name = company?.name || 'Sua Empresa'
  const phone = company?.phone || '(00) 00000-0000'
  const logo = company?.logoUrl || null
  const secondary = company?.secondaryColor || '#E87722'

  return (
    <div className="w-full h-full relative flex flex-col" style={{ background: '#111' }}>
      <PhotoBackground uploadedPhoto={uploadedPhoto} overlay="bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      <div className="relative z-10 flex-1 flex flex-col justify-end p-8 pb-10">
        <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl">
          <p className="text-text-primary font-bold text-2xl leading-snug mb-2 break-words" style={{ wordBreak: 'break-word' }}>{fields.mainText}</p>
          {fields.subtitle && <p className="text-text-secondary text-sm mb-4 break-words" style={{ wordBreak: 'break-word' }}>{fields.subtitle}</p>}
          <div className="flex items-center gap-3 pt-2 border-t border-border">
            <LogoOrInitial logo={logo} name={name} secondary={secondary} size="sm" />
            <div>
              <p className="text-text-primary font-semibold text-sm">{name}</p>
              <p className="text-text-secondary text-xs">{phone}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
