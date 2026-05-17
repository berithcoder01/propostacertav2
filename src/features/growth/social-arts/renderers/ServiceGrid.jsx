import { lightenColor } from '../utils/color'
import { LogoOrInitial, PhoneDisplay } from '../components/shared'

const SEGMENT_LABELS = { ELETRICA: 'Elétrica', HIDRAULICA: 'Hidráulica', PINTURA: 'Pintura', CONSTRUCAO_CIVIL: 'Construção Civil', AR_CONDICIONADO: 'Ar Condicionado', SERVICOS: 'Serviços', OUTRO: 'Serviços' }

export default function ServiceGrid({ company, fields, uploadedPhoto, elementOffset, decorativeShapes, layoutSpacing, rectBlocks, ctaButton }) {
  const name = company?.name || 'Sua Empresa'
  const phone = company?.phone || '(00) 00000-0000'
  const segment = SEGMENT_LABELS[company?.segment] || 'Serviços'
  const primary = company?.primaryColor || '#1A5276'
  const secondary = company?.secondaryColor || '#E87722'
  const logo = company?.logoUrl || null

  const services = [fields.service1, fields.service2, fields.service3].filter(Boolean)
  return (
    <div className="w-full h-full flex flex-col p-10" style={{ background: `linear-gradient(135deg, ${primary}, ${lightenColor(primary, 20)})` }}>
      <div className="flex items-center gap-3 mb-8">
        <LogoOrInitial logo={logo} name={name} secondary={secondary} size="md" className="border-2 border-white/30" />
        <div>
          <h2 className="text-text-primary font-black text-2xl">{name}</h2>
          <p className="text-text-secondary text-xs uppercase tracking-widest">{segment}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 flex-1 mb-8">
        {services.map((svc, i) => (
          <div key={i} className="backdrop-blur-sm bg-white/10 border-2 border-white/30 rounded-lg p-4 flex flex-col items-center justify-center text-center">
            <div className="text-2xl mb-2">
              {['⚡', '', '🛠️', '💡'][i % 4]}
            </div>
            <p className="text-text-primary font-bold text-sm break-words" style={{ wordBreak: 'break-word' }}>{svc}</p>
          </div>
        ))}
      </div>
      <div className="pt-6 border-t-2 border-white/20">
        <p className="text-text-secondary text-xs font-semibold mb-3 break-words" style={{ wordBreak: 'break-word' }}>{fields.tagline}</p>
        <PhoneDisplay phone={phone} className="font-bold text-sm" />
      </div>
    </div>
  )
}
