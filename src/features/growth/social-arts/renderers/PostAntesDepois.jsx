const SEGMENT_LABELS = { ELETRICA: 'Elétrica', HIDRAULICA: 'Hidráulica', PINTURA: 'Pintura', CONSTRUCAO_CIVIL: 'Construção Civil', AR_CONDICIONADO: 'Ar Condicionado', SERVICOS: 'Serviços', OUTRO: 'Serviços' }

export default function PostAntesDepois({ company, fields, uploadedPhoto, elementOffset, decorativeShapes, layoutSpacing, rectBlocks, ctaButton }) {
  const name = company?.name || 'Sua Empresa'
  const phone = company?.phone || '(00) 00000-0000'
  const primary = company?.primaryColor || '#1A5276'
  const secondary = company?.secondaryColor || '#E87722'

  return (
    <div className="w-full h-full flex flex-col" style={{ background: '#111' }}>
      <div className="flex-1 grid grid-cols-2 gap-3 p-6 pb-3">
        {uploadedPhoto ? (
          <>
            <div className="rounded-xl overflow-hidden relative">
              <img src={uploadedPhoto} alt="Antes" className="w-full h-full object-cover grayscale opacity-60" />
              <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/70 rounded text-[10px] text-white font-bold">ANTES</div>
            </div>
            <div className="rounded-xl overflow-hidden relative">
              <img src={uploadedPhoto} alt="Depois" className="w-full h-full object-cover" />
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] text-white font-bold" style={{ background: secondary }}>DEPOIS</div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-gray-100 rounded-xl flex flex-col items-center justify-center gap-2 text-muted">
              <span className="text-2xl">📷</span>
              <span className="text-[10px] uppercase tracking-widest font-bold">Antes</span>
            </div>
            <div className="rounded-xl flex flex-col items-center justify-center gap-2 border-2 text-text-primary"
              style={{ background: `${primary}33`, borderColor: secondary }}>
              <span className="text-2xl">✨</span>
              <span className="text-[10px] uppercase tracking-widest font-bold">Depois</span>
            </div>
          </>
        )}
      </div>
      <div className="p-6 text-center" style={{ background: `linear-gradient(to right, ${primary}, ${secondary})` }}>
        <h3 className="text-text-primary font-black text-lg">{name}</h3>
        <p className="text-text-secondary text-sm mt-2 break-words" style={{ wordBreak: 'break-word' }}>{fields.mainText}</p>
        <p className="text-muted text-xs mt-3">{phone}</p>
      </div>
    </div>
  )
}
