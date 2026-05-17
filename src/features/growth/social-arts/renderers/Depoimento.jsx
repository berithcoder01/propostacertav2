import { LogoOrInitial } from '../components/shared'

const SEGMENT_LABELS = { ELETRICA: 'Elétrica', HIDRAULICA: 'Hidráulica', PINTURA: 'Pintura', CONSTRUCAO_CIVIL: 'Construção Civil', AR_CONDICIONADO: 'Ar Condicionado', SERVICOS: 'Serviços', OUTRO: 'Serviços' }

export default function Depoimento({ company, fields, uploadedPhoto, elementOffset, decorativeShapes, layoutSpacing, rectBlocks, ctaButton }) {
  const name = company?.name || 'Sua Empresa'
  const phone = company?.phone || '(00) 00000-0000'
  const primary = company?.primaryColor || '#1A5276'
  const secondary = company?.secondaryColor || '#E87722'
  const logo = company?.logoUrl || null

  return (
    <div className="w-full h-full flex flex-col justify-between p-10"
      style={{ background: `linear-gradient(160deg, ${primary}dd, ${primary})` }}>
      <div className="flex gap-1 mb-4">
        {[1,2,3,4,5].map(i => <span key={i} style={{ color: secondary }} className="text-xl">★</span>)}
      </div>
      <div className="flex-1 flex flex-col justify-center">
        <div className="text-5xl mb-4 opacity-20 text-text-primary font-serif leading-none">"</div>
        <p className="text-text-primary text-lg italic leading-relaxed break-words" style={{ wordBreak: 'break-word' }}>{fields.mainText}</p>
        <div className="text-5xl text-right mt-4 opacity-20 text-text-primary font-serif leading-none">"</div>
      </div>
      <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-text-primary font-bold">
            {(fields.clientName || 'C').charAt(0)}
          </div>
          <div>
            <p className="text-text-primary font-bold text-sm">{fields.clientName || 'Cliente Satisfeito'}</p>
            <p className="text-muted text-xs">via {name}</p>
          </div>
        </div>
        <LogoOrInitial logo={logo} name={name} secondary={secondary} size="sm" className="opacity-70" />
      </div>
    </div>
  )
}
