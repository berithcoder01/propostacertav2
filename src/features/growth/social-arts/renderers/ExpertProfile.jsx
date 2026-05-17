import { Users } from 'lucide-react'
import { PhotoBackground, LogoOrInitial } from '../components/shared'

const SEGMENT_LABELS = { ELETRICA: 'Elétrica', HIDRAULICA: 'Hidráulica', PINTURA: 'Pintura', CONSTRUCAO_CIVIL: 'Construção Civil', AR_CONDICIONADO: 'Ar Condicionado', SERVICOS: 'Serviços', OUTRO: 'Serviços' }

export default function ExpertProfile({ company, fields, uploadedPhoto, elementOffset, decorativeShapes, layoutSpacing, rectBlocks, ctaButton }) {
  const name = company?.name || 'Sua Empresa'
  const phone = company?.phone || '(00) 00000-0000'
  const segment = SEGMENT_LABELS[company?.segment] || 'Serviços'
  const secondary = company?.secondaryColor || '#E87722'
  const logo = company?.logoUrl || null

  return (
    <div className="w-full h-full relative flex flex-col" style={{ background: '#111' }}>
      <PhotoBackground uploadedPhoto={uploadedPhoto} fallbackIcon={Users} overlay="bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
      <div className="relative z-10 flex flex-col justify-between h-full p-10">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ background: secondary }} />
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: secondary }}>Especialista Verificado</span>
        </div>
        <div>
          <h2 className="text-text-primary font-black text-3xl mb-3 break-words" style={{ wordBreak: 'break-word' }}>{fields.mainText}</h2>
          <p className="text-text-secondary text-sm mb-6">{segment}</p>
          <div className="flex items-center gap-3 pt-6 border-t border-border">
            <LogoOrInitial logo={logo} name={name} secondary={secondary} size="md" />
            <div>
              <p className="text-text-primary font-bold text-sm">{name}</p>
              <p className="text-muted text-xs">{phone}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
