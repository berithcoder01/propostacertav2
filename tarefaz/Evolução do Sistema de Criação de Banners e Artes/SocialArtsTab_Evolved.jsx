import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Edit2, Check, X, ChevronLeft, Layers, Upload, ImagePlus, Trash2, Camera, Sparkles, Zap, Users, Briefcase } from 'lucide-react'
import html2canvas from 'html2canvas'
import { useAuth } from '../../../shared/context/AuthContext'
import { bannerPresets, getInitialFields } from '../data/bannerPresets'

const SEGMENT_LABELS = {
  ELETRICA: 'Elétrica',
  HIDRAULICA: 'Hidráulica',
  PINTURA: 'Pintura',
  CONSTRUCAO_CIVIL: 'Construção Civil',
  AR_CONDICIONADO: 'Ar Condicionado',
  SERVICOS: 'Serviços',
  OUTRO: 'Serviços',
}

const CATEGORY_ORDER = ['WhatsApp Status', 'Instagram Stories', 'Instagram Feed', 'Prova Social', 'Autoridade', 'Portfólio', 'Moderno', 'Impactante']

const STYLE_VIBES = [
  { id: 'all', label: 'Todos', icon: '🎨' },
  { id: 'modern', label: 'Moderno', icon: '✨' },
  { id: 'bold', label: 'Impactante', icon: '⚡' },
  { id: 'professional', label: 'Profissional', icon: '💼' },
  { id: 'social', label: 'Social', icon: '👥' },
]

// ─── UTILITY FUNCTIONS ────────────────────────────────────────────────────────────

const getContrastColor = (hexColor) => {
  const hex = hexColor.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000
  return brightness > 128 ? '#000000' : '#FFFFFF'
}

const lightenColor = (color, percent) => {
  const num = parseInt(color.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = (num >> 16) + amt
  const G = (num >> 8 & 0x00FF) + amt
  const B = (num & 0x0000FF) + amt
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255))
    .toString(16).slice(1)
}

// ─── BANNER RENDERS ────────────────────────────────────────────────────────────────

function BannerRender({ preset, company, fields, uploadedPhoto }) {
  const name = company?.name || 'Sua Empresa'
  const phone = company?.phone || '(00) 00000-0000'
  const segment = SEGMENT_LABELS[company?.segment] || 'Serviços'
  const primary = company?.primaryColor || '#1A5276'
  const secondary = company?.secondaryColor || '#E87722'
  const logo = company?.logoUrl || null

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

  // ── PHOTO-BASED PRESETS ───────────────────────────────────────────────────

  if (preset.id === 'foto-status') {
    return (
      <div className="w-full h-full relative flex flex-col" style={{ background: '#111' }}>
        {uploadedPhoto ? (
          <img src={uploadedPhoto} alt="Foto" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600">
            <Camera className="w-12 h-12 mb-2" />
            <span className="text-xs">Sua foto aqui</span>
          </div>
        )}
        {uploadedPhoto && <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />}
        <div className="relative z-10 flex-1 flex flex-col justify-end p-6 pb-8">
          <LogoOrInitial size="sm" className="mb-3" />
          <p className="text-white font-bold text-xl leading-tight mb-2">{fields.mainText}</p>
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-sm">{phone}</span>
            <span className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ background: secondary }}>
              {fields.ctaText}
            </span>
          </div>
        </div>
      </div>
    )
  }

  if (preset.id === 'story-promo') {
    return (
      <div className="w-full h-full relative flex flex-col" style={{ background: '#111' }}>
        {uploadedPhoto ? (
          <img src={uploadedPhoto} alt="Foto" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600">
            <Camera className="w-12 h-12 mb-2" />
            <span className="text-xs">Sua foto aqui</span>
          </div>
        )}
        {uploadedPhoto && <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/20" />}
        <div className="relative z-10 p-6 pt-8">
          <div className="flex items-center gap-2">
            <LogoOrInitial size="sm" />
            <span className="text-white/80 text-sm font-bold">{name}</span>
          </div>
        </div>
        <div className="relative z-10 flex-1 flex items-center justify-center px-6">
          <div className="text-center">
            <p className="text-white font-black text-2xl leading-tight">{fields.mainText}</p>
          </div>
        </div>
        <div className="relative z-10 p-6 pb-8 text-center">
          <div className="inline-block px-6 py-3 rounded-full text-white font-bold text-sm" style={{ background: secondary }}>
            📞 {phone}
          </div>
        </div>
      </div>
    )
  }

  if (preset.id === 'post-antes-depois') {
    return (
      <div className="w-full h-full flex flex-col" style={{ background: '#111' }}>
        <div className="flex-1 grid grid-cols-2 gap-2 p-4 pb-2">
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
              <div className="bg-gray-800 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-500">
                <span className="text-2xl">📷</span>
                <span className="text-[10px] uppercase tracking-widest font-bold">Antes</span>
              </div>
              <div className="rounded-xl flex flex-col items-center justify-center gap-2 border-2 text-white"
                style={{ background: `${primary}33`, borderColor: secondary }}>
                <span className="text-2xl">✨</span>
                <span className="text-[10px] uppercase tracking-widest font-bold">Depois</span>
              </div>
            </>
          )}
        </div>
        <div className="p-4 text-center" style={{ background: `linear-gradient(to right, ${primary}, ${secondary})` }}>
          <h3 className="text-white font-black text-lg">{name}</h3>
          <p className="text-white/80 text-sm mt-1">{fields.mainText}</p>
          <p className="text-white/50 text-xs mt-2">{phone}</p>
        </div>
      </div>
    )
  }

  // ── NOVO: MINIMAL GLASS ────────────────────────────────────────────────────

  if (preset.id === 'minimal-glass') {
    return (
      <div className="w-full h-full relative flex flex-col" style={{ background: '#111' }}>
        {uploadedPhoto ? (
          <img src={uploadedPhoto} alt="Foto" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600">
            <Camera className="w-12 h-12 mb-2" />
            <span className="text-xs">Sua foto aqui</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="relative z-10 flex-1 flex flex-col justify-end p-8 pb-10">
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl">
            <p className="text-white font-bold text-2xl leading-tight mb-3">{fields.mainText}</p>
            <div className="flex items-center gap-3">
              <LogoOrInitial size="sm" />
              <div>
                <p className="text-white font-semibold text-sm">{name}</p>
                <p className="text-white/70 text-xs">{phone}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── NOVO: NEO-BRUTALISM ────────────────────────────────────────────────────

  if (preset.id === 'neo-brutalism') {
    return (
      <div className="w-full h-full flex flex-col p-8 gap-6" style={{ background: primary }}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-white font-black text-4xl leading-none mb-2">{fields.mainText.split(' ')[0]}</h2>
            <p className="text-white/80 text-sm font-bold uppercase tracking-widest">{segment}</p>
          </div>
          <LogoOrInitial size="lg" className="border-4" style={{ borderColor: secondary }} />
        </div>
        <div className="flex-1 flex items-end">
          <div className="w-full border-4" style={{ borderColor: secondary, borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>
            <p className="text-white/70 text-sm font-bold py-4">{fields.mainText}</p>
          </div>
        </div>
        <div className="flex items-center justify-between pt-4 border-t-4" style={{ borderColor: secondary }}>
          <span className="text-white font-black text-lg">{phone}</span>
          <div className="px-4 py-2 font-black text-white" style={{ background: secondary }}>
            CONTATO
          </div>
        </div>
      </div>
    )
  }

  // ── NOVO: SERVICE GRID ────────────────────────────────────────────────────

  if (preset.id === 'service-grid') {
    const services = [fields.service1, fields.service2, fields.service3].filter(Boolean)
    return (
      <div className="w-full h-full flex flex-col p-8" style={{ background: `linear-gradient(135deg, ${primary}, ${lightenColor(primary, 20)})` }}>
        <div className="flex items-center gap-3 mb-6">
          <LogoOrInitial size="md" className="border-2 border-white/30" />
          <div>
            <h2 className="text-white font-black text-2xl">{name}</h2>
            <p className="text-white/70 text-xs uppercase tracking-widest">{segment}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 flex-1 mb-6">
          {services.map((svc, i) => (
            <div key={i} className="backdrop-blur-sm bg-white/10 border-2 border-white/30 rounded-lg p-4 flex flex-col items-center justify-center text-center">
              <div className="text-2xl mb-2">
                {['⚡', '🔧', '🛠️', '💡'][i % 4]}
              </div>
              <p className="text-white font-bold text-sm">{svc}</p>
            </div>
          ))}
        </div>
        <div className="pt-4 border-t-2 border-white/20">
          <p className="text-white/80 text-xs font-semibold mb-2">{fields.tagline}</p>
          <p className="text-white font-bold text-sm">{phone}</p>
        </div>
      </div>
    )
  }

  // ── NOVO: EXPERT PROFILE ────────────────────────────────────────────────────

  if (preset.id === 'expert-profile') {
    return (
      <div className="w-full h-full relative flex flex-col" style={{ background: '#111' }}>
        {uploadedPhoto ? (
          <img src={uploadedPhoto} alt="Profissional" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600">
            <Users className="w-12 h-12 mb-2" />
            <span className="text-xs">Sua foto aqui</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
        <div className="relative z-10 flex flex-col justify-between h-full p-8">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: secondary }} />
            <span className="text-secondary text-xs font-bold uppercase tracking-widest" style={{ color: secondary }}>Especialista Verificado</span>
          </div>
          <div>
            <h2 className="text-white font-black text-3xl mb-2">{fields.mainText}</h2>
            <p className="text-white/70 text-sm mb-4">{segment}</p>
            <div className="flex items-center gap-3 pt-4 border-t border-white/20">
              <LogoOrInitial size="md" />
              <div>
                <p className="text-white font-bold text-sm">{name}</p>
                <p className="text-white/50 text-xs">{phone}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── TEXT-ONLY PRESETS ─────────────────────────────────────────────────────

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

    case 'depoimento':
      return (
        <div className="w-full h-full flex flex-col justify-between p-8"
          style={{ background: `linear-gradient(160deg, ${primary}dd, ${primary})` }}>
          <div className="flex gap-1 mb-2">
            {[1, 2, 3, 4, 5].map(i => <span key={i} style={{ color: secondary }} className="text-xl">★</span>)}
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
      <div
        className="h-28 flex flex-col items-center justify-center gap-2 relative overflow-hidden"
        style={{ background: preset.theme.cardGradient }}
      >
        <span className="text-4xl">{preset.icon}</span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/60 px-3 py-0.5 rounded-full bg-black/20">
          {preset.category}
        </span>
      </div>

      <div className="p-4 bg-gray-800/60">
        <h4 className="text-white font-bold text-sm group-hover:text-emerald-400 transition-colors">
          {preset.name}
        </h4>
        <p className="text-gray-400 text-xs mt-1 leading-relaxed line-clamp-2">
          {preset.description}
        </p>
        <div className="flex gap-2 mt-3 flex-wrap">
          {preset.sizes.map(size => (
            <span key={size} className="text-[9px] px-2 py-0.5 bg-gray-700 rounded-full text-gray-400 font-mono">
              {size}
            </span>
          ))}
          {preset.requiresPhoto && (
            <span className="text-[9px] px-2 py-0.5 bg-emerald-900/50 rounded-full text-emerald-400 font-medium">
              📷 Com foto
            </span>
          )}
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
          className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 resize-none"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={e => onChange(field.key, e.target.value)}
          placeholder={field.placeholder}
          maxLength={field.maxLength}
          className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50"
        />
      )}
      <div className="text-[10px] text-gray-500 text-right">
        {value.length} / {field.maxLength}
      </div>
    </div>
  )
}

// ─── PHOTO UPLOADER ────────────────────────────────────────────────────────────

function PhotoUploader({ photo, onPhotoChange, onPhotoRemove }) {
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        onPhotoChange(event.target?.result)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="space-y-3">
      {photo ? (
        <div className="relative rounded-lg overflow-hidden border-2 border-emerald-500/50">
          <img src={photo} alt="Preview" className="w-full h-32 object-cover" />
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onPhotoRemove}
            className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-lg transition-colors"
          >
            <Trash2 size={14} />
          </motion.button>
        </div>
      ) : (
        <label className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-600 rounded-lg p-4 cursor-pointer hover:border-emerald-500 hover:bg-emerald-500/5 transition-all">
          <Upload size={16} className="text-gray-400" />
          <span className="text-sm text-gray-400">Clique para fazer upload</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      )}
    </div>
  )
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────────

export default function SocialArtsTab() {
  const { company } = useAuth()
  const [selectedPreset, setSelectedPreset] = useState(null)
  const [fieldValues, setFieldValues] = useState({})
  const [uploadedPhoto, setUploadedPhoto] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [downloaded, setDownloaded] = useState(false)
  const [selectedVibe, setSelectedVibe] = useState('all')
  const previewRef = useRef(null)

  const handleSelectPreset = (preset) => {
    setSelectedPreset(preset)
    setFieldValues(getInitialFields(preset))
    setUploadedPhoto(null)
    setDownloaded(false)
  }

  const handleFieldChange = (key, value) => {
    setFieldValues(prev => ({ ...prev, [key]: value }))
  }

  const handleDownload = async () => {
    if (!previewRef.current) return
    setGenerating(true)
    try {
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      })
      const link = document.createElement('a')
      link.href = canvas.toDataURL('image/png')
      link.download = `${selectedPreset.id}-${Date.now()}.png`
      link.click()
      setDownloaded(true)
      setTimeout(() => setDownloaded(false), 3000)
    } catch (error) {
      console.error('Erro ao gerar imagem:', error)
    } finally {
      setGenerating(false)
    }
  }

  if (!selectedPreset) {
    const categorized = bannerPresets.reduce((acc, preset) => {
      if (!acc[preset.category]) acc[preset.category] = []
      acc[preset.category].push(preset)
      return acc
    }, {})

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="gallery"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="space-y-8"
        >
          <div>
            <h2 className="text-white font-black text-2xl mb-4">Escolha o Estilo</h2>
            <div className="flex gap-2 overflow-x-auto pb-4">
              {STYLE_VIBES.map(vibe => (
                <motion.button
                  key={vibe.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedVibe(vibe.id)}
                  className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all ${
                    selectedVibe === vibe.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {vibe.icon} {vibe.label}
                </motion.button>
              ))}
            </div>
          </div>

          {CATEGORY_ORDER.map(category => {
            const presets = categorized[category] || []
            if (presets.length === 0) return null
            return (
              <div key={category}>
                <h3 className="text-gray-400 font-bold text-sm uppercase tracking-widest mb-4">{category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {presets.map(preset => (
                    <PresetCard
                      key={preset.id}
                      preset={preset}
                      onClick={() => handleSelectPreset(preset)}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </motion.div>
      </AnimatePresence>
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
        <button
          onClick={() => { setSelectedPreset(null); setDownloaded(false); setUploadedPhoto(null) }}
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

              {/* Photo upload (for presets that need it) */}
              {selectedPreset.requiresPhoto && (
                <div className="mb-5">
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 block">
                    Sua Foto
                  </label>
                  <PhotoUploader
                    photo={uploadedPhoto}
                    onPhotoChange={setUploadedPhoto}
                    onPhotoRemove={() => setUploadedPhoto(null)}
                  />
                </div>
              )}

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

              <div
                className={`bg-gray-900 rounded-xl overflow-hidden mb-4 shadow-2xl ${
                  selectedPreset.sizes.includes('1080x1920') ? 'aspect-[9/16]' : 'aspect-square'
                }`}
                style={{ maxWidth: selectedPreset.sizes.includes('1080x1920') ? 300 : 380, margin: '0 auto' }}
              >
                <div ref={previewRef} className="w-full h-full">
                  <BannerRender
                    preset={selectedPreset}
                    company={company}
                    fields={fieldValues}
                    uploadedPhoto={uploadedPhoto}
                  />
                </div>
              </div>

              <div className="flex justify-center gap-2 mb-4">
                {selectedPreset.sizes.map(size => (
                  <span key={size} className="text-[10px] px-2 py-0.5 bg-gray-700 rounded-full text-gray-400 font-mono">
                    {size}
                  </span>
                ))}
              </div>

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
                PNG · 2x resolução · Pronto para publicar
              </p>
            </div>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  )
}
