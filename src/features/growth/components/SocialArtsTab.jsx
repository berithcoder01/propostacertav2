import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Edit2, Check, X, ChevronLeft, Layers } from 'lucide-react'
import html2canvas from 'html2canvas'
import { useAuth } from '../../../shared/context/AuthContext'
import { bannerPresets, getInitialFields, getPresetsByCategory } from '../data/bannerPresets'

// ─── HELPERS ───────────────────────────────────────────────────────────────────

const SEGMENT_LABELS = {
  ELETRICA: 'Elétrica',
  HIDRAULICA: 'Hidráulica',
  PINTURA: 'Pintura',
  CONSTRUCAO_CIVIL: 'Construção Civil',
  AR_CONDICIONADO: 'Ar Condicionado',
  SERVICOS: 'Serviços',
  OUTRO: 'Serviços',
}

const CATEGORY_ORDER = ['Conversão', 'Prova Social', 'Portfólio', 'Autoridade']

// ─── BANNER RENDERS ────────────────────────────────────────────────────────────

function BannerRender({ preset, company, fields }) {
  const name    = company?.name         || 'Sua Empresa'
  const phone   = company?.phone        || '(00) 00000-0000'
  const segment = SEGMENT_LABELS[company?.segment] || 'Serviços'
  const primary = company?.primaryColor || '#1A5276'
  const secondary = company?.secondaryColor || '#E87722'
  const logo    = company?.logoUrl      || null

  const LogoOrInitial = ({ size = 'md', className = '' }) => {
    const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-12 h-12 text-base', lg: 'w-16 h-16 text-2xl' }
    if (logo) {
      return <img src={logo} alt={name} className={`${sizes[size]} object-contain rounded-lg ${className}`} />
    }
    return (
      <div className={`${sizes[size]} rounded-lg flex items-center justify-center font-black text-white ${className}`}
        style={{ background: secondary }}>
        {name.charAt(0)}
      </div>
    )
  }

  switch (preset.id) {

    case 'promocao':
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center"
          style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}>
          <LogoOrInitial size="lg" className="mb-5 bg-white/20 p-2" />
          <h2 className="text-3xl font-black text-white mb-1">{name}</h2>
          <p className="text-white/70 text-sm mb-5 uppercase tracking-widest">{segment}</p>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-6 py-4 mb-5 border border-white/30">
            <p className="text-white font-bold text-xl leading-snug">{fields.mainText}</p>
          </div>
          <div className="flex items-center gap-2 text-white/70 text-sm">
            <span>📞</span>
            <span>{phone}</span>
          </div>
        </div>
      )

    case 'antes-depois':
      return (
        <div className="w-full h-full flex flex-col" style={{ background: '#111' }}>
          <div className="flex-1 grid grid-cols-2 gap-2 p-4 pb-2">
            <div className="bg-gray-800 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-500">
              <span className="text-3xl">📷</span>
              <span className="text-xs uppercase tracking-widest font-bold">Antes</span>
            </div>
            <div className="rounded-xl flex flex-col items-center justify-center gap-2 border-2 text-white"
              style={{ background: `${primary}33`, borderColor: secondary }}>
              <span className="text-3xl">✨</span>
              <span className="text-xs uppercase tracking-widest font-bold">Depois</span>
            </div>
          </div>
          <div className="p-4 text-center" style={{ background: `linear-gradient(to right, ${primary}, ${secondary})` }}>
            <h3 className="text-white font-black text-lg">{name}</h3>
            <p className="text-white/80 text-sm mt-1">{fields.mainText}</p>
            <p className="text-white/50 text-xs mt-2">{phone}</p>
          </div>
        </div>
      )

    case 'depoimento':
      return (
        <div className="w-full h-full flex flex-col justify-between p-8"
          style={{ background: `linear-gradient(160deg, ${primary}dd, ${primary})` }}>
          <div className="flex gap-1 mb-2">
            {[1,2,3,4,5].map(i => <span key={i} style={{ color: secondary }} className="text-xl">★</span>)}
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <div className="text-5xl mb-3 opacity-30 text-white font-serif leading-none">"</div>
            <p className="text-white text-lg italic leading-relaxed">{fields.mainText}</p>
            <div className="text-5xl text-right opacity-30 text-white font-serif leading-none">"</div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
                {(fields.clientName || 'C').charAt(0)}
              </div>
              <div>
                <p className="text-white font-bold text-sm">{fields.clientName || 'Cliente Satisfeito'}</p>
                <p className="text-white/50 text-xs">via {name}</p>
              </div>
            </div>
            <LogoOrInitial size="sm" className="opacity-70" />
          </div>
        </div>
      )

    case 'dica':
      return (
        <div className="w-full h-full flex flex-col justify-between p-8"
          style={{ background: `linear-gradient(135deg, #0c0c0c, ${primary}44)` }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="px-3 py-1 rounded-full text-white text-xs font-bold uppercase tracking-wider"
              style={{ background: secondary }}>
              💡 Dica do Profissional
            </div>
          </div>
          <div className="flex-1 flex items-center">
            <p className="text-white text-xl font-semibold leading-relaxed">{fields.mainText}</p>
          </div>
          <div className="flex items-center gap-3 pt-4 border-t border-white/10">
            <LogoOrInitial size="sm" />
            <div>
              <p className="text-white font-bold text-sm">{name}</p>
              <p className="text-white/50 text-xs">{phone}</p>
            </div>
          </div>
        </div>
      )

    case 'servicos':
      return (
        <div className="w-full h-full flex flex-col p-8"
          style={{ background: `linear-gradient(145deg, ${primary}, #0a0a0a)` }}>
          <div className="flex items-center gap-3 mb-6">
            <LogoOrInitial size="md" className="bg-white/10 p-1" />
            <div>
              <h2 className="text-white font-black text-xl">{name}</h2>
              <p className="text-white/60 text-sm">{segment}</p>
            </div>
          </div>
          <div className="text-white/60 text-xs uppercase tracking-widest mb-3">Nossos Serviços</div>
          <div className="space-y-3 flex-1">
            {[fields.service1, fields.service2, fields.service3].filter(Boolean).map((svc, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                  style={{ background: secondary }}>
                  {i + 1}
                </div>
                <span className="text-white text-sm font-medium">{svc}</span>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t border-white/10">
            <p className="text-white/80 text-sm italic">{fields.tagline}</p>
            <p className="text-white/50 text-xs mt-1">{phone}</p>
          </div>
        </div>
      )

    case 'urgencia':
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center"
          style={{ background: 'linear-gradient(135deg, #dc2626, #7f1d1d)' }}>
          <div className="text-6xl mb-4 animate-pulse">🚨</div>
          <h2 className="text-3xl font-black text-white mb-2">
            Precisa de <br />{segment}?
          </h2>
          <p className="text-white/80 text-base mb-6">{fields.mainText}</p>
          <div className="bg-white rounded-2xl px-8 py-4 mb-4 shadow-2xl">
            <p className="font-black text-2xl text-gray-900">{phone}</p>
          </div>
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <LogoOrInitial size="sm" />
            <span>{name} — Atendimento Rápido</span>
          </div>
        </div>
      )

    default:
      return (
        <div className="flex items-center justify-center h-full text-gray-400 text-sm">
          Preview indisponível
        </div>
      )
  }
}

// ─── PRESET CARD ───────────────────────────────────────────────────────────────

function PresetCard({ preset, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="rounded-2xl overflow-hidden text-left border border-white/5 hover:border-white/20 transition-all shadow-lg group"
    >
      {/* Gradient preview area */}
      <div
        className="h-28 flex flex-col items-center justify-center gap-2 relative overflow-hidden"
        style={{ background: preset.theme.cardGradient }}
      >
        <div className="text-4xl">{preset.icon}</div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/60 px-3 py-0.5 rounded-full bg-black/20">
          {preset.category}
        </span>
      </div>

      {/* Info area */}
      <div className="p-4 bg-gray-800/60">
        <h4 className="text-white font-bold text-sm group-hover:text-emerald-400 transition-colors">
          {preset.name}
        </h4>
        <p className="text-gray-400 text-xs mt-1 leading-relaxed line-clamp-2">
          {preset.description}
        </p>
        <div className="flex gap-2 mt-3">
          {preset.sizes.map(size => (
            <span key={size} className="text-[9px] px-2 py-0.5 bg-gray-700 rounded-full text-gray-400 font-mono">
              {size}
            </span>
          ))}
        </div>
      </div>
    </motion.button>
  )
}

// ─── FIELD EDITOR ──────────────────────────────────────────────────────────────

function FieldEditor({ field, value, onChange }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
        {field.label}
      </label>
      {field.multiline ? (
        <textarea
          value={value}
          onChange={e => onChange(field.key, e.target.value)}
          placeholder={field.placeholder}
          maxLength={field.maxLength}
          rows={3}
          className="w-full bg-gray-700/60 border border-gray-600 rounded-xl px-3 py-2.5 text-white text-sm resize-none focus:outline-none focus:border-emerald-500 transition-colors"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={e => onChange(field.key, e.target.value)}
          placeholder={field.placeholder}
          maxLength={field.maxLength}
          className="w-full bg-gray-700/60 border border-gray-600 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
        />
      )}
      {field.maxLength && (
        <p className="text-right text-[10px] text-gray-600">
          {(value || '').length}/{field.maxLength}
        </p>
      )}
    </div>
  )
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────

export default function SocialArtsTab() {
  const { company } = useAuth()
  const [selectedPreset, setSelectedPreset] = useState(null)
  const [fieldValues, setFieldValues] = useState({})
  const [generating, setGenerating] = useState(false)
  const [downloaded, setDownloaded] = useState(false)
  const previewRef = useRef(null)

  const groupedPresets = Object.entries(
    bannerPresets.reduce((acc, p) => {
      if (!acc[p.category]) acc[p.category] = []
      acc[p.category].push(p)
      return acc
    }, {})
  ).sort(([a], [b]) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b))

  const handleSelectPreset = (preset) => {
    setSelectedPreset(preset)
    setFieldValues(getInitialFields(preset))
    setDownloaded(false)
  }

  const handleFieldChange = (key, val) => {
    setFieldValues(prev => ({ ...prev, [key]: val }))
  }

  const handleDownload = async () => {
    if (!previewRef.current) return
    setGenerating(true)
    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      })
      const link = document.createElement('a')
      link.download = `arte-${selectedPreset.id}-${Date.now()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      setDownloaded(true)
    } catch (err) {
      console.error('Erro ao gerar imagem:', err)
    } finally {
      setGenerating(false)
    }
  }

  // ── LIST VIEW ────────────────────────────────────────────────────────────────
  if (!selectedPreset) {
    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Artes para Redes Sociais</h3>
          <p className="text-gray-400 text-sm">
            Escolha um modelo, personalize os textos com seus dados e baixe em PNG pronto para publicar.
          </p>
        </div>

        {groupedPresets.map(([category, presets]) => (
          <div key={category}>
            <div className="flex items-center gap-3 mb-4">
              <Layers size={14} className="text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                {category}
              </span>
              <div className="flex-1 h-px bg-white/5" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {presets.map(preset => (
                <PresetCard
                  key={preset.id}
                  preset={preset}
                  onClick={() => handleSelectPreset(preset)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  // ── EDITOR VIEW ──────────────────────────────────────────────────────────────
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="editor"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        className="space-y-6"
      >
        {/* Back */}
        <button
          onClick={() => { setSelectedPreset(null); setDownloaded(false) }}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
        >
          <ChevronLeft size={16} />
          Voltar aos modelos
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── LEFT: CONTROLS ── */}
          <div className="space-y-4">
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-5">
                <span className="text-2xl">{selectedPreset.icon}</span>
                <div>
                  <h3 className="text-white font-bold">{selectedPreset.name}</h3>
                  <p className="text-gray-500 text-xs">{selectedPreset.description}</p>
                </div>
              </div>

              {/* Dynamic fields */}
              <div className="space-y-4">
                {selectedPreset.fields.map(field => (
                  <FieldEditor
                    key={field.key}
                    field={field}
                    value={fieldValues[field.key] ?? field.defaultValue}
                    onChange={handleFieldChange}
                  />
                ))}
              </div>
            </div>

            {/* Company data summary */}
            <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Dados da Empresa (automático)
              </h4>
              {[
                ['Nome', company?.name || 'Sua Empresa'],
                ['Telefone', company?.phone || '(00) 00000-0000'],
                ['Segmento', SEGMENT_LABELS[company?.segment] || 'Serviços'],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between text-xs">
                  <span className="text-gray-600">{label}</span>
                  <span className="text-gray-400 font-medium">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: PREVIEW + DOWNLOAD ── */}
          <div className="space-y-4">
            <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
                Pré-visualização
              </h3>

              {/* Preview canvas */}
              <div
                className="aspect-square bg-gray-900 rounded-xl overflow-hidden mb-4 shadow-2xl"
                style={{ maxWidth: 380, margin: '0 auto' }}
              >
                <div ref={previewRef} className="w-full h-full">
                  <BannerRender
                    preset={selectedPreset}
                    company={company}
                    fields={fieldValues}
                  />
                </div>
              </div>

              {/* Size chips */}
              <div className="flex justify-center gap-2 mb-4">
                {selectedPreset.sizes.map(size => (
                  <span key={size} className="text-[10px] px-2 py-0.5 bg-gray-700 rounded-full text-gray-400 font-mono">
                    {size}
                  </span>
                ))}
              </div>

              {/* Download button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleDownload}
                disabled={generating}
                className={`w-full py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all
                  ${downloaded
                    ? 'bg-emerald-700 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  } disabled:opacity-50`}
              >
                {generating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Gerando...
                  </>
                ) : downloaded ? (
                  <>
                    <Check size={16} />
                    Baixado com sucesso!
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    Baixar PNG (Alta Resolução)
                  </>
                )}
              </motion.button>

              <p className="text-[11px] text-gray-600 text-center mt-2">
                PNG · 2x de resolução · Pronto para stories e feed
              </p>
            </div>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  )
}
