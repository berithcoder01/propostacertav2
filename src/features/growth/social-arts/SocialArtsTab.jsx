import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, Check, ChevronLeft, ChevronDown, Layers, Upload, Trash2, Camera, Users } from 'lucide-react'
import html2canvas from 'html2canvas'
import { useAuth } from '../../../shared/context/AuthContext'
import { bannerPresets, getInitialFields } from './data/bannerPresets'

const SEGMENT_LABELS = {
  ELETRICA: 'Elétrica',
  HIDRAULICA: 'Hidráulica',
  PINTURA: 'Pintura',
  CONSTRUCAO_CIVIL: 'Construção Civil',
  AR_CONDICIONADO: 'Ar Condicionado',
  SERVICOS: 'Serviços',
  OUTRO: 'Serviços',
}

const CATEGORY_ORDER = ['WhatsApp Status', 'Instagram Stories', 'Instagram Feed', 'Prova Social', 'Autoridade', 'Portfólio']

const STYLE_VIBES = [
  { id: 'all', label: 'Todos', icon: '🎨' },
  { id: 'modern', label: 'Moderno', icon: '✨' },
  { id: 'bold', label: 'Impactante', icon: '⚡' },
  { id: 'professional', label: 'Profissional', icon: '💼' },
  { id: 'social', label: 'Social', icon: '👥' },
]

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

// ── SHARED ELEMENTS ────────────────────────────────────────────────────────────

function SharedElements({ company, fields, uploadedPhoto, ctaButton, layoutSpacing, decorativeShapes, rectBlocks, elementOffset, preset }) {
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

  const CTAButton = ({ alignment = 'center', className = '' }) => {
    if (!ctaButton.enabled) return null
    return (
      <div className={`flex ${alignment === 'left' ? 'justify-start' : alignment === 'right' ? 'justify-end' : 'justify-center'} ${className}`}>
        <span
          className="px-6 py-2.5 text-sm font-bold"
          style={{
            background: ctaButton.color,
            color: ctaButton.textColor,
            borderRadius: ctaButton.borderRadius,
          }}
        >
          {ctaButton.text}
        </span>
      </div>
    )
  }

  const PhoneDisplay = ({ className = '' }) => (
    <span className={`text-white/70 text-sm ${className}`}>{phone}</span>
  )

  const DecorativeShapes = () => (
    <>
      {decorativeShapes.includes('circle-tl') && <div className="absolute top-6 left-6 w-16 h-16 rounded-full opacity-20 z-[6]" style={{ background: secondary }} />}
      {decorativeShapes.includes('circle-br') && <div className="absolute bottom-24 right-6 w-12 h-12 rounded-full opacity-20 z-[6]" style={{ background: primary }} />}
      {decorativeShapes.includes('line-top') && <div className="absolute top-0 left-0 right-0 h-1 z-[6]" style={{ background: `linear-gradient(to right, ${secondary}, transparent)` }} />}
      {decorativeShapes.includes('line-bottom') && <div className="absolute bottom-20 left-6 right-6 h-0.5 opacity-30 z-[6]" style={{ background: secondary }} />}
      {decorativeShapes.includes('badge') && <div className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold z-[6]" style={{ background: secondary }}>★</div>}
      {decorativeShapes.includes('dots') && <div className="absolute top-1/2 right-6 flex flex-col gap-1 z-[6]">{[1,2,3,4,5].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full opacity-30" style={{ background: secondary }} />)}</div>}
      {decorativeShapes.includes('corner') && <div className="absolute top-0 left-0 w-16 h-16 opacity-30 z-[6]" style={{ background: `linear-gradient(135deg, ${secondary}, transparent)` }} />}
      {decorativeShapes.includes('star') && <div className="absolute top-10 right-10 text-2xl opacity-40 z-[6]" style={{ color: secondary }}>★</div>}
    </>
  )

  const RectBlocks = () => (
    <>
      {rectBlocks.filter(b => b.position === 'top').map(block => (
        <div key={block.id} className="absolute left-0 right-0 z-[5]" style={{ top: 0, height: block.height, background: `linear-gradient(to bottom, ${primary}${Math.round(block.opacity * 255).toString(16).padStart(2, '0')}, transparent)` }} />
      ))}
      {rectBlocks.filter(b => b.position === 'bottom').map(block => (
        <div key={block.id} className="absolute left-0 right-0 z-[5]" style={{ bottom: 0, height: block.height, background: `linear-gradient(to top, ${primary}${Math.round(block.opacity * 255).toString(16).padStart(2, '0')}, transparent)` }} />
      ))}
    </>
  )

  const PhotoBackground = ({ fallbackIcon: Icon = Camera, fallbackText = 'Sua foto aqui', overlay = 'bg-gradient-to-t from-black/90 via-black/30 to-transparent' }) => (
    <>
      {uploadedPhoto ? (
        <img src={uploadedPhoto} alt="Foto" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600">
          <Icon className="w-12 h-12 mb-2" />
          <span className="text-xs">{fallbackText}</span>
        </div>
      )}
      {uploadedPhoto && <div className={`absolute inset-0 ${overlay}`} />}
    </>
  )

  return { LogoOrInitial, CTAButton, PhoneDisplay, DecorativeShapes, RectBlocks, PhotoBackground, name, phone, segment, primary, secondary }
}

// ─── BANNER RENDERS ────────────────────────────────────────────────────────────

function BannerRender({ preset, company, fields, uploadedPhoto, elementOffset = { x: 0, y: 0 }, decorativeShapes = [], layoutSpacing = 16, rectBlocks = [], ctaButton = { enabled: true, text: 'Peça seu orçamento!', color: '#E87722', textColor: '#ffffff', borderRadius: 9999, alignment: 'center' } }) {
  const { LogoOrInitial, CTAButton, PhoneDisplay, DecorativeShapes, RectBlocks, PhotoBackground, name, phone, segment, primary, secondary } = SharedElements({ company, fields, uploadedPhoto, ctaButton, layoutSpacing, decorativeShapes, rectBlocks, elementOffset, preset })

  // ── PHOTO-BASED PRESETS ───────────────────────────────────────────────────

  if (preset.id === 'foto-status') {
    return (
      <div className="w-full h-full relative flex flex-col" style={{ background: '#111' }}>
        <PhotoBackground />
        <RectBlocks />
        <DecorativeShapes />

        <div
          className="relative z-10 flex-1 flex flex-col justify-end p-8 pb-10"
          style={{
            transform: `translate(${elementOffset.x}px, ${elementOffset.y}px)`,
            gap: `${layoutSpacing}px`,
          }}
        >
          <div style={{ marginBottom: layoutSpacing / 2 }}>
            <LogoOrInitial size="sm" />
          </div>

          <p className="text-white font-bold text-xl leading-snug break-words" style={{ wordBreak: 'break-word', maxWidth: '100%' }}>
            {fields.mainText}
          </p>

          {fields.subtitle && (
            <p className="text-white/70 text-sm break-words" style={{ wordBreak: 'break-word', maxWidth: '100%' }}>
              {fields.subtitle}
            </p>
          )}

          <div className="pt-2 space-y-3" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <PhoneDisplay className="block" />
            <CTAButton alignment={ctaButton.alignment} />
          </div>
        </div>
      </div>
    )
  }

  if (preset.id === 'story-promo') {
    return (
      <div className="w-full h-full relative flex flex-col" style={{ background: '#111' }}>
        <PhotoBackground overlay="bg-gradient-to-t from-black/95 via-black/40 to-black/20" />
        <RectBlocks />

        <div className="relative z-10 p-8 pt-10" style={{ marginBottom: layoutSpacing }}>
          <div className="flex items-center gap-2">
            <LogoOrInitial size="sm" />
            <span className="text-white/80 text-sm font-bold">{name}</span>
          </div>
        </div>
        <div className="relative z-10 flex-1 flex items-center justify-center px-8" style={{ gap: layoutSpacing }}>
          <div className="text-center w-full flex flex-col items-center" style={{ gap: layoutSpacing / 2 }}>
            <p className="text-white font-black text-2xl leading-snug break-words" style={{ wordBreak: 'break-word' }}>{fields.mainText}</p>
            {fields.subtitle && <p className="text-white/70 text-sm break-words" style={{ wordBreak: 'break-word' }}>{fields.subtitle}</p>}
          </div>
        </div>
        <div className={`relative z-10 p-8 pb-10 ${ctaButton.alignment === 'left' ? 'text-left' : ctaButton.alignment === 'right' ? 'text-right' : 'text-center'}`} style={{ marginTop: layoutSpacing }}>
          <CTAButton alignment={ctaButton.alignment} className="inline-block" />
          {!ctaButton.enabled && (
            <div className="inline-block px-6 py-3 rounded-full text-white font-bold text-sm" style={{ background: secondary }}>
              📞 {phone}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (preset.id === 'post-antes-depois') {
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
        <div className="p-6 text-center" style={{ background: `linear-gradient(to right, ${primary}, ${secondary})` }}>
          <h3 className="text-white font-black text-lg">{name}</h3>
          <p className="text-white/80 text-sm mt-2 break-words" style={{ wordBreak: 'break-word' }}>{fields.mainText}</p>
          <p className="text-white/50 text-xs mt-3">{phone}</p>
        </div>
      </div>
    )
  }

  if (preset.id === 'minimal-glass') {
    return (
      <div className="w-full h-full relative flex flex-col" style={{ background: '#111' }}>
        <PhotoBackground overlay="bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="relative z-10 flex-1 flex flex-col justify-end p-8 pb-10">
          <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl">
            <p className="text-white font-bold text-2xl leading-snug mb-2 break-words" style={{ wordBreak: 'break-word' }}>{fields.mainText}</p>
            {fields.subtitle && <p className="text-white/70 text-sm mb-4 break-words" style={{ wordBreak: 'break-word' }}>{fields.subtitle}</p>}
            <div className="flex items-center gap-3 pt-2 border-t border-white/10">
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

  if (preset.id === 'neo-brutalism') {
    return (
      <div className="w-full h-full flex flex-col p-10 gap-8" style={{ background: primary }}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-white font-black text-4xl leading-none mb-3 break-words" style={{ wordBreak: 'break-word' }}>{fields.mainText.split(' ')[0]}</h2>
            <p className="text-white/80 text-sm font-bold uppercase tracking-widest">{segment}</p>
          </div>
          <LogoOrInitial size="lg" className="border-4" style={{ borderColor: secondary }} />
        </div>
        <div className="flex-1 flex items-end">
          <div className="w-full border-4" style={{ borderColor: secondary, borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>
            <p className="text-white/70 text-sm font-bold py-4 break-words" style={{ wordBreak: 'break-word' }}>{fields.mainText}</p>
          </div>
        </div>
        <div className={`pt-6 border-t-4 space-y-3 ${ctaButton.alignment === 'left' ? 'text-left' : ctaButton.alignment === 'right' ? 'text-right' : 'text-center'}`} style={{ borderColor: secondary }}>
          <PhoneDisplay className="block font-black text-lg" />
          <CTAButton alignment={ctaButton.alignment} className="inline-block" />
          {!ctaButton.enabled && (
            <div className="px-4 py-2 font-black text-white" style={{ background: secondary }}>
              CONTATO
            </div>
          )}
        </div>
      </div>
    )
  }

  if (preset.id === 'service-grid') {
    const services = [fields.service1, fields.service2, fields.service3].filter(Boolean)
    return (
      <div className="w-full h-full flex flex-col p-10" style={{ background: `linear-gradient(135deg, ${primary}, ${lightenColor(primary, 20)})` }}>
        <div className="flex items-center gap-3 mb-8">
          <LogoOrInitial size="md" className="border-2 border-white/30" />
          <div>
            <h2 className="text-white font-black text-2xl">{name}</h2>
            <p className="text-white/70 text-xs uppercase tracking-widest">{segment}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 flex-1 mb-8">
          {services.map((svc, i) => (
            <div key={i} className="backdrop-blur-sm bg-white/10 border-2 border-white/30 rounded-lg p-4 flex flex-col items-center justify-center text-center">
              <div className="text-2xl mb-2">
                {['⚡', '', '🛠️', '💡'][i % 4]}
              </div>
              <p className="text-white font-bold text-sm break-words" style={{ wordBreak: 'break-word' }}>{svc}</p>
            </div>
          ))}
        </div>
        <div className="pt-6 border-t-2 border-white/20">
          <p className="text-white/80 text-xs font-semibold mb-3 break-words" style={{ wordBreak: 'break-word' }}>{fields.tagline}</p>
          <PhoneDisplay className="font-bold text-sm" />
        </div>
      </div>
    )
  }

  if (preset.id === 'expert-profile') {
    return (
      <div className="w-full h-full relative flex flex-col" style={{ background: '#111' }}>
        <PhotoBackground fallbackIcon={Users} overlay="bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
        <div className="relative z-10 flex flex-col justify-between h-full p-10">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: secondary }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: secondary }}>Especialista Verificado</span>
          </div>
          <div>
            <h2 className="text-white font-black text-3xl mb-3 break-words" style={{ wordBreak: 'break-word' }}>{fields.mainText}</h2>
            <p className="text-white/70 text-sm mb-6">{segment}</p>
            <div className="flex items-center gap-3 pt-6 border-t border-white/20">
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
        <div className="w-full h-full flex flex-col items-center justify-center p-10 text-center"
          style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})` }}>
          <LogoOrInitial size="lg" className="mb-6 bg-white/20 p-2" />
          <h2 className="text-3xl font-black text-white mb-2">{name}</h2>
          <p className="text-white/70 text-sm mb-6 uppercase tracking-widest">{segment}</p>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-8 py-5 mb-6 border border-white/30 w-full mx-2">
            <p className="text-white font-bold text-xl leading-snug break-words" style={{ wordBreak: 'break-word' }}>{fields.mainText}</p>
            {fields.subtitle && <p className="text-white/70 text-sm mt-3 break-words" style={{ wordBreak: 'break-word' }}>{fields.subtitle}</p>}
          </div>
          <div className="flex items-center gap-2 text-white/70 text-sm">
            <span>📞</span>
            <span>{phone}</span>
          </div>
        </div>
      )

    case 'depoimento':
      return (
        <div className="w-full h-full flex flex-col justify-between p-10"
          style={{ background: `linear-gradient(160deg, ${primary}dd, ${primary})` }}>
          <div className="flex gap-1 mb-4">
            {[1,2,3,4,5].map(i => <span key={i} style={{ color: secondary }} className="text-xl">★</span>)}
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <div className="text-5xl mb-4 opacity-30 text-white font-serif leading-none">"</div>
            <p className="text-white text-lg italic leading-relaxed break-words" style={{ wordBreak: 'break-word' }}>{fields.mainText}</p>
            <div className="text-5xl text-right mt-4 opacity-30 text-white font-serif leading-none">"</div>
          </div>
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/20">
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
        <div className="w-full h-full flex flex-col justify-between p-10"
          style={{ background: `linear-gradient(135deg, #0c0c0c, ${primary}44)` }}>
          <div className="flex items-center gap-2 mb-6">
            <div className="px-3 py-1 rounded-full text-white text-xs font-bold uppercase tracking-wider"
              style={{ background: secondary }}>
              💡 Dica do Profissional
            </div>
          </div>
          <div className="flex-1 flex items-center">
            <p className="text-white text-xl font-semibold leading-relaxed break-words" style={{ wordBreak: 'break-word' }}>{fields.mainText}</p>
          </div>
          <div className="flex items-center gap-3 pt-6 border-t border-white/10">
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
        <div className="w-full h-full flex flex-col p-10"
          style={{ background: `linear-gradient(145deg, ${primary}, #0a0a0a)` }}>
          <div className="flex items-center gap-3 mb-8">
            <LogoOrInitial size="md" className="bg-white/10 p-1" />
            <div>
              <h2 className="text-white font-black text-xl">{name}</h2>
              <p className="text-white/60 text-sm">{segment}</p>
            </div>
          </div>
          <div className="text-white/60 text-xs uppercase tracking-widest mb-4">Nossos Serviços</div>
          <div className="space-y-4 flex-1">
            {[fields.service1, fields.service2, fields.service3].filter(Boolean).map((svc, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-black flex-shrink-0"
                  style={{ background: secondary }}>
                  {i + 1}
                </div>
                <span className="text-white text-sm font-medium break-words" style={{ wordBreak: 'break-word' }}>{svc}</span>
              </div>
            ))}
          </div>
          <div className="pt-6 border-t border-white/10">
            <p className="text-white/80 text-sm italic break-words" style={{ wordBreak: 'break-word' }}>{fields.tagline}</p>
            <p className="text-white/50 text-xs mt-2">{phone}</p>
          </div>
        </div>
      )

    case 'urgencia':
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-10 text-center"
          style={{ background: 'linear-gradient(135deg, #dc2626, #7f1d1d)' }}>
          <div className="text-6xl mb-6 animate-pulse">🚨</div>
          <h2 className="text-3xl font-black text-white mb-3">
            Precisa de <br />{segment}?
          </h2>
          <p className="text-white/80 text-base mb-8 break-words" style={{ wordBreak: 'break-word' }}>{fields.mainText}</p>
          <div className="bg-white rounded-2xl px-8 py-4 mb-6 shadow-2xl">
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

// ── PRESET CARD ───────────────────────────────────────────────────────────────

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

// ─── FIELD EDITOR ─────────────────────────────────────────────────────────────

function FieldEditor({ field, value, onChange }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
        {field.label}
      </label>
      {field.multiline ? (
        <textarea
          value={value}
          onChange={e => onChange(field.key, e.target.value)}
          placeholder={field.placeholder}
          maxLength={field.maxLength}
          rows={2}
          className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-2 py-1.5 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 resize-none"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={e => onChange(field.key, e.target.value)}
          placeholder={field.placeholder}
          maxLength={field.maxLength}
          className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-2 py-1.5 text-white text-xs placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50"
        />
      )}
    </div>
  )
}

// ── PHOTO UPLOADER ────────────────────────────────────────────────────────────

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
    <div className="space-y-2">
      {photo ? (
        <div className="relative rounded-lg overflow-hidden border border-emerald-500/50">
          <img src={photo} alt="Preview" className="w-full h-20 object-cover" />
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onPhotoRemove}
            className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded-md transition-colors"
          >
            <Trash2 size={12} />
          </motion.button>
        </div>
      ) : (
        <label className="flex items-center justify-center gap-2 border border-dashed border-gray-600 rounded-lg p-3 cursor-pointer hover:border-emerald-500 hover:bg-emerald-500/5 transition-all">
          <Upload size={14} className="text-gray-400" />
          <span className="text-xs text-gray-400">Upload</span>
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

// ─── COLLAPSIBLE SECTION ───────────────────────────────────────────────────────

function CollapsibleSection({ title, icon, defaultOpen = false, children }) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-gray-700/50 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-700/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">{icon}</span>
          <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">{title}</span>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={14} className="text-gray-500" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────

export default function SocialArtsTab() {
  const { company } = useAuth()
  const [selectedPreset, setSelectedPreset] = useState(null)
  const [fieldValues, setFieldValues] = useState({})
  const [uploadedPhoto, setUploadedPhoto] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [downloaded, setDownloaded] = useState(false)
  const [selectedVibe, setSelectedVibe] = useState('all')
  const [elementOffset, setElementOffset] = useState({ x: 0, y: 0 })
  const [decorativeShapes, setDecorativeShapes] = useState([])
  const [layoutSpacing, setLayoutSpacing] = useState(16)
  const [rectBlocks, setRectBlocks] = useState([])
  const [ctaButton, setCtaButton] = useState({
    enabled: true,
    text: 'Peça seu orçamento!',
    color: '#E87722',
    textColor: '#ffffff',
    borderRadius: 9999,
    alignment: 'center',
  })
  const previewRef = useRef(null)

  const handleSelectPreset = (preset) => {
    setSelectedPreset(preset)
    setFieldValues(getInitialFields(preset))
    setUploadedPhoto(null)
    setDownloaded(false)
    setElementOffset({ x: 0, y: 0 })
    setDecorativeShapes([])
    setLayoutSpacing(16)
    setRectBlocks([])
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

    const filteredPresets = selectedVibe === 'all'
      ? bannerPresets
      : bannerPresets.filter(p => p.vibe === selectedVibe)

    const filteredCategorized = filteredPresets.reduce((acc, preset) => {
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
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">Artes para Redes Sociais</h3>
                <p className="text-gray-400 text-sm">
                  Escolha um modelo, personalize e baixe em PNG. Fotos ficam apenas no seu navegador.
                </p>
              </div>
            </div>

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
            const presets = filteredCategorized[category] || []
            if (presets.length === 0) return null
            return (
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
      >
        <button
          onClick={() => { setSelectedPreset(null); setDownloaded(false); setUploadedPhoto(null) }}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm mb-4"
        >
          <ChevronLeft size={16} />
          Voltar aos modelos
        </button>

        <div className="flex gap-4 h-[calc(100vh-200px)]">
          {/* ── LEFT: COMPACT CONTROLS ─ */}
          <div className="w-96 flex-shrink-0 bg-gray-800/50 border border-gray-700 rounded-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-3 border-b border-gray-700/50">
              <div className="flex items-center gap-2">
                <span className="text-xl">{selectedPreset.icon}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold text-sm truncate">{selectedPreset.name}</h3>
                  <p className="text-gray-500 text-[10px] truncate">{selectedPreset.description}</p>
                </div>
              </div>
            </div>

            {/* Scrollable sections */}
            <div className="flex-1 overflow-y-auto">
              {/* Content Tab */}
              <CollapsibleSection title="Conteúdo" icon="📝" defaultOpen={true}>
                {selectedPreset.fields.map(field => (
                  <FieldEditor
                    key={field.key}
                    field={field}
                    value={fieldValues[field.key] ?? field.defaultValue}
                    onChange={handleFieldChange}
                  />
                ))}
              </CollapsibleSection>

              {/* Photo Tab */}
              {selectedPreset.requiresPhoto && (
                <CollapsibleSection title="Foto" icon="📷">
                  <PhotoUploader
                    photo={uploadedPhoto}
                    onPhotoChange={setUploadedPhoto}
                    onPhotoRemove={() => setUploadedPhoto(null)}
                  />
                </CollapsibleSection>
              )}

              {/* Style Tab */}
              <CollapsibleSection title="Estilo" icon="🎨">
                {/* CTA Button */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400">Botão CTA</span>
                    <button
                      onClick={() => setCtaButton(prev => ({ ...prev, enabled: !prev.enabled }))}
                      className={`w-8 h-4 rounded-full transition-colors relative ${ctaButton.enabled ? 'bg-emerald-500' : 'bg-gray-600'}`}
                    >
                      <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${ctaButton.enabled ? 'left-4' : 'left-0.5'}`} />
                    </button>
                  </div>

                  {ctaButton.enabled && (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={ctaButton.text}
                        onChange={e => setCtaButton(prev => ({ ...prev, text: e.target.value }))}
                        className="w-full px-2 py-1 rounded bg-gray-700/50 border border-gray-600 text-gray-300 text-xs focus:border-emerald-500 focus:outline-none"
                      />
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="text-[9px] text-gray-500">Cor</label>
                          <div className="flex items-center gap-1">
                            <input type="color" value={ctaButton.color} onChange={e => setCtaButton(prev => ({ ...prev, color: e.target.value }))} className="w-6 h-6 rounded cursor-pointer" />
                            <span className="text-[9px] text-gray-500 font-mono">{ctaButton.color}</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <label className="text-[9px] text-gray-500">Texto</label>
                          <div className="flex items-center gap-1">
                            <input type="color" value={ctaButton.textColor} onChange={e => setCtaButton(prev => ({ ...prev, textColor: e.target.value }))} className="w-6 h-6 rounded cursor-pointer" />
                            <span className="text-[9px] text-gray-500 font-mono">{ctaButton.textColor}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="text-[9px] text-gray-500">Arredondamento</label>
                        <input
                          type="range"
                          min="0"
                          max="24"
                          step="2"
                          value={ctaButton.borderRadius === 9999 ? 24 : ctaButton.borderRadius}
                          onChange={e => {
                            const val = parseInt(e.target.value)
                            setCtaButton(prev => ({ ...prev, borderRadius: val === 24 ? 9999 : val }))
                          }}
                          className="w-full accent-emerald-500 h-1"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-gray-500">Alinhamento</label>
                        <div className="flex gap-1 mt-1">
                          {['left', 'center', 'right'].map(align => (
                            <button
                              key={align}
                              onClick={() => setCtaButton(prev => ({ ...prev, alignment: align }))}
                              className={`flex-1 px-2 py-1 rounded text-[10px] transition-colors ${ctaButton.alignment === align ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-400'}`}
                            >
                              {align === 'left' ? '← Esq' : align === 'right' ? 'Dir →' : 'Centro'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Spacing */}
                <div className="pt-2 border-t border-gray-700/30">
                  <label className="text-[10px] text-gray-400">Espaçamento: {layoutSpacing}px</label>
                  <input
                    type="range"
                    min="8"
                    max="40"
                    step="4"
                    value={layoutSpacing}
                    onChange={e => setLayoutSpacing(parseInt(e.target.value))}
                    className="w-full accent-emerald-500 h-1"
                  />
                </div>

                {/* Position */}
                <div className="pt-2 border-t border-gray-700/30">
                  <label className="text-[10px] text-gray-400">Posição do Texto</label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] text-gray-500">X: {elementOffset.x}px</label>
                      <input type="range" min="-50" max="50" value={elementOffset.x} onChange={e => setElementOffset(prev => ({ ...prev, x: parseInt(e.target.value) }))} className="w-full accent-emerald-500 h-1" />
                    </div>
                    <div>
                      <label className="text-[9px] text-gray-500">Y: {elementOffset.y}px</label>
                      <input type="range" min="-50" max="50" value={elementOffset.y} onChange={e => setElementOffset(prev => ({ ...prev, y: parseInt(e.target.value) }))} className="w-full accent-emerald-500 h-1" />
                    </div>
                  </div>
                </div>

                {/* Rect Blocks */}
                <div className="pt-2 border-t border-gray-700/30">
                  <label className="text-[10px] text-gray-400">Blocos Retangulares</label>
                  <div className="grid grid-cols-2 gap-1 mt-1">
                    <button onClick={() => setRectBlocks(prev => [...prev, { id: Date.now(), position: 'top', height: 80, opacity: 0.3 }])} className="px-2 py-1 rounded bg-gray-700 text-[10px] text-gray-300 hover:bg-gray-600 transition-colors">+ Topo</button>
                    <button onClick={() => setRectBlocks(prev => [...prev, { id: Date.now(), position: 'bottom', height: 80, opacity: 0.3 }])} className="px-2 py-1 rounded bg-gray-700 text-[10px] text-gray-300 hover:bg-gray-600 transition-colors">+ Base</button>
                  </div>
                  {rectBlocks.map((block, idx) => (
                    <div key={block.id} className="mt-2 p-2 rounded bg-gray-700/30 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] text-gray-500">Bloco {idx + 1} — {block.position === 'top' ? 'Topo' : 'Base'}</span>
                        <button onClick={() => setRectBlocks(prev => prev.filter(b => b.id !== block.id))} className="text-gray-500 hover:text-red-400 text-xs">✕</button>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => setRectBlocks(prev => prev.map(b => b.id === block.id ? { ...b, position: b.position === 'top' ? 'bottom' : 'top' } : b))} className="flex-1 px-1 py-0.5 rounded bg-gray-600 text-[9px] text-gray-300">{block.position === 'top' ? '↓ Base' : '↑ Topo'}</button>
                      </div>
                      <div>
                        <label className="text-[9px] text-gray-500">Altura: {block.height}px</label>
                        <input type="range" min="20" max="200" value={block.height} onChange={e => setRectBlocks(prev => prev.map(b => b.id === block.id ? { ...b, height: parseInt(e.target.value) } : b))} className="w-full accent-emerald-500 h-1" />
                      </div>
                      <div>
                        <label className="text-[9px] text-gray-500">Opacidade: {Math.round(block.opacity * 100)}%</label>
                        <input type="range" min="5" max="100" value={Math.round(block.opacity * 100)} onChange={e => setRectBlocks(prev => prev.map(b => b.id === block.id ? { ...b, opacity: parseInt(e.target.value) / 100 } : b))} className="w-full accent-emerald-500 h-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>

              {/* Decoration Tab */}
              <CollapsibleSection title="Decoração" icon="✨">
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { id: 'circle-tl', icon: '●', label: 'Canto Sup' },
                    { id: 'circle-br', icon: '●', label: 'Canto Inf' },
                    { id: 'line-top', icon: '━', label: 'Linha Topo' },
                    { id: 'line-bottom', icon: '━', label: 'Linha Base' },
                    { id: 'badge', icon: '⬤', label: 'Badge' },
                    { id: 'dots', icon: '⋮', label: 'Pontos' },
                    { id: 'corner', icon: '◤', label: 'Canto' },
                    { id: 'star', icon: '★', label: 'Estrela' },
                  ].map(shape => (
                    <button
                      key={shape.id}
                      onClick={() => {
                        if (decorativeShapes.includes(shape.id)) {
                          setDecorativeShapes(prev => prev.filter(s => s !== shape.id))
                        } else {
                          setDecorativeShapes(prev => [...prev, shape.id])
                        }
                      }}
                      className={`flex flex-col items-center gap-0.5 p-1.5 rounded border transition-all ${
                        decorativeShapes.includes(shape.id)
                          ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-400'
                          : 'bg-gray-800/50 border-gray-700/50 text-gray-500 hover:border-gray-600'
                      }`}
                    >
                      <span className="text-sm">{shape.icon}</span>
                      <span className="text-[8px]">{shape.label}</span>
                    </button>
                  ))}
                </div>
              </CollapsibleSection>

              {/* Company Data */}
              <CollapsibleSection title="Empresa" icon="🏢">
                <div className="space-y-1">
                  {[
                    ['Nome', company?.name || 'Sua Empresa'],
                    ['Telefone', company?.phone || '(00) 00000-0000'],
                    ['Segmento', SEGMENT_LABELS[company?.segment] || 'Serviços'],
                  ].map(([label, val]) => (
                    <div key={label} className="flex justify-between text-[10px]">
                      <span className="text-gray-500">{label}</span>
                      <span className="text-gray-300 font-medium truncate ml-2">{val}</span>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            </div>
          </div>

          {/* ── RIGHT: PREVIEW + DOWNLOAD ── */}
          <div className="flex-1 bg-gray-800/50 border border-gray-700 rounded-2xl p-4 flex flex-col">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">
              Pré-visualização
            </h3>

            <div className="flex-1 flex items-center justify-center overflow-hidden">
              <div
                className={`bg-gray-900 rounded-xl overflow-hidden shadow-2xl ${
                  selectedPreset.sizes.includes('1080x1920') ? 'aspect-[9/16]' : 'aspect-square'
                }`}
                style={{ maxWidth: selectedPreset.sizes.includes('1080x1920') ? 260 : 320, maxHeight: '100%' }}
              >
                <div ref={previewRef} className="w-full h-full">
                  <BannerRender
                    preset={selectedPreset}
                    company={company}
                    fields={fieldValues}
                    uploadedPhoto={uploadedPhoto}
                    elementOffset={elementOffset}
                    decorativeShapes={decorativeShapes}
                    layoutSpacing={layoutSpacing}
                    rectBlocks={rectBlocks}
                    ctaButton={ctaButton}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-2 mt-3 mb-3">
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
              className={`w-full py-2.5 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all text-sm
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

            <p className="text-[10px] text-gray-600 text-center mt-1">
              PNG · 2x resolução · Pronto para publicar
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
