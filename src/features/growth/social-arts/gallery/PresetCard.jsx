import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

const GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
  'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
  'linear-gradient(135deg, #f5576c 0%, #ff9a76 100%)',
  'linear-gradient(135deg, #667eea 0%, #43e97b 100%)',
  'linear-gradient(135deg, #0c3483 0%, #a2b6df 100%)',
  'linear-gradient(135deg, #c471f5 0%, #fa71cd 100%)',
]

const HEIGHTS = ['h-40', 'h-48', 'h-56', 'h-44', 'h-52', 'h-36']

export default function PresetCard({ preset, onClick, index }) {
  const [hovered, setHovered] = useState(false)
  const gradient = GRADIENTS[index % GRADIENTS.length]
  const heightClass = HEIGHTS[index % HEIGHTS.length]

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileTap={{ scale: 0.97 }}
      className="group relative flex flex-col rounded-2xl overflow-hidden text-left w-full
                 border border-border dark:border-[rgba(255,255,255,0.06)]
                 bg-surface dark:bg-[#15151c]
                 hover:border-border-strong dark:hover:border-[rgba(255,255,255,0.15)]
                 shadow-none hover:shadow-[0_8px_24px_rgba(110,88,69,0.12)] dark:hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]
                 transition-all duration-200"
    >
      {/* Color block */}
      <div
        className={`relative overflow-hidden ${heightClass}`}
        style={{ background: gradient }}
      >
        {/* Category badge */}
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full
                        bg-black/40 backdrop-blur-sm
                        text-[9px] font-semibold text-white/90">
          {preset.category}
        </div>

        {/* Hover overlay */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 bg-black/50 flex items-center justify-center"
            >
              <span className="px-4 py-2 rounded-full bg-white text-black text-xs font-bold tracking-wide">
                Usar template
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Info */}
      <div className="px-3 py-2.5">
        <p className="text-text-primary dark:text-white text-xs font-semibold leading-tight">
          {preset.name}
        </p>
        <p className="text-text-secondary dark:text-white/40 text-[10px] mt-1 leading-snug line-clamp-2">
          {preset.description}
        </p>
      </div>
    </motion.button>
  )
}
