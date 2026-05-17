import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Layers } from 'lucide-react'
import { bannerPresets } from '../data/bannerPresets'
import { useEditor } from '../context/EditorContext'
import PresetCard from './PresetCard'

const CATEGORY_ORDER = ['WhatsApp Status', 'Instagram Stories', 'Instagram Feed', 'Prova Social', 'Autoridade', 'Portfólio']

const STYLE_VIBES = [
  { id: 'all', label: 'Todos', icon: '🎨' },
  { id: 'modern', label: 'Moderno', icon: '✨' },
  { id: 'bold', label: 'Impactante', icon: '⚡' },
  { id: 'professional', label: 'Profissional', icon: '💼' },
  { id: 'social', label: 'Social', icon: '👥' },
]

export default function PresetGallery() {
  const { actions } = useEditor()
  const [selectedVibe, setSelectedVibe] = useState('all')

  const filteredPresets = selectedVibe === 'all'
    ? bannerPresets
    : bannerPresets.filter(p => p.vibe === selectedVibe)

  const categorized = filteredPresets.reduce((acc, preset) => {
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
              <h3 className="text-xl font-bold text-text-primary mb-1">Artes para Redes Sociais</h3>
              <p className="text-text-secondary text-sm">
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
                    : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
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
              <div className="flex items-center gap-3 mb-4">
                <Layers size={14} className="text-emerald-600" />
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                  {category}
                </span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {presets.map(preset => (
                  <PresetCard
                    key={preset.id}
                    preset={preset}
                    onClick={() => actions.selectPreset(preset)}
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
