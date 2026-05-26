import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search } from 'lucide-react'
import { bannerPresets } from '../data/bannerPresets'
import { useEditor } from '../context/EditorContext'
import PresetCard from './PresetCard'

const CATEGORIES = ['Todos', ...Array.from(new Set(bannerPresets.map(p => p.category)))]

export default function PresetGallery() {
  const { actions } = useEditor()
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    return bannerPresets.filter(preset => {
      const matchCategory =
        activeCategory === 'Todos' || preset.category === activeCategory
      const q = query.toLowerCase().trim()
      const matchQuery =
        !q ||
        [preset.name, preset.category, ...(preset.tags || [])].some(s =>
          s.toLowerCase().includes(q)
        )
      return matchCategory && matchQuery
    })
  }, [activeCategory, query])

  return (
    <div className="flex flex-col gap-6">

      <div className="flex flex-col gap-3">
        <div>
          <h3 className="text-lg font-bold text-text-primary dark:text-white">Escolha um modelo</h3>
          <p className="text-text-secondary dark:text-white/40 text-sm mt-0.5">
            {bannerPresets.length} templates · PNG em alta resolução
          </p>
        </div>

        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/40 dark:text-white/30" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar por nome, estilo ou formato..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl
                       bg-surface dark:bg-[#1f1f2a]
                       border border-border dark:border-[rgba(255,255,255,0.08)]
                       text-text-primary dark:text-white
                       text-sm placeholder-text-secondary/50 dark:placeholder-white/25
                       focus:outline-none focus:border-accent dark:focus:border-blue-500/50
                       focus:ring-1 focus:ring-accent/20 dark:focus:ring-blue-500/20
                       transition-all"
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap
                        flex-shrink-0 transition-all border
              ${activeCategory === cat
                ? 'bg-accent text-white border-accent shadow-sm'
                : 'bg-surface dark:bg-[#1f1f2a] text-text-secondary dark:text-white/50 hover:text-text-primary dark:hover:text-white/80 border-border dark:border-[rgba(255,255,255,0.08)]'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-16 text-center text-text-secondary/40 dark:text-white/30 text-sm"
          >
            Nenhum template encontrado para "{query}"
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-3"
          >
            {filtered.map((preset, i) => (
              <div
                key={preset.id}
                className="break-inside-avoid mb-3"
              >
                <PresetCard
                  preset={preset}
                  index={i}
                  onClick={() => actions.selectPreset(preset)}
                />
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
