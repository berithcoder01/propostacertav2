import { LogoOrInitial } from '../components/shared'

const SEGMENT_LABELS = { ELETRICA: 'Elétrica', HIDRAULICA: 'Hidráulica', PINTURA: 'Pintura', CONSTRUCAO_CIVIL: 'Construção Civil', AR_CONDICIONADO: 'Ar Condicionado', SERVICOS: 'Serviços', OUTRO: 'Serviços' }

export default function Servicos({ company, fields, uploadedPhoto, elementOffset, decorativeShapes, layoutSpacing, rectBlocks, ctaButton }) {
  const name = company?.name || 'Sua Empresa'
  const phone = company?.phone || '(00) 00000-0000'
  const segment = SEGMENT_LABELS[company?.segment] || 'Serviços'
  const primary = company?.primaryColor || '#1A5276'
  const secondary = company?.secondaryColor || '#E87722'
  const logo = company?.logoUrl || null

  return (
    <div className="w-full h-full flex flex-col p-10"
      style={{ background: `linear-gradient(145deg, ${primary}, #0a0a0a)` }}>
      <div className="flex items-center gap-3 mb-8">
        <LogoOrInitial logo={logo} name={name} secondary={secondary} size="md" className="bg-white/10 p-1" />
        <div>
          <h2 className="text-text-primary font-black text-xl">{name}</h2>
          <p className="text-text-secondary text-sm">{segment}</p>
        </div>
      </div>
      <div className="text-text-secondary text-xs uppercase tracking-widest mb-4">Nossos Serviços</div>
      <div className="space-y-4 flex-1">
        {[fields.service1, fields.service2, fields.service3].filter(Boolean).map((svc, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-black flex-shrink-0"
              style={{ background: secondary }}>
              {i + 1}
            </div>
            <span className="text-text-primary text-sm font-medium break-words" style={{ wordBreak: 'break-word' }}>{svc}</span>
          </div>
        ))}
      </div>
      <div className="pt-6 border-t border-white/10">
        <p className="text-text-secondary text-sm italic break-words" style={{ wordBreak: 'break-word' }}>{fields.tagline}</p>
        <p className="text-muted text-xs mt-2">{phone}</p>
      </div>
    </div>
  )
}
