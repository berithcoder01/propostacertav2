import { motion } from 'framer-motion'

export default function PresetCard({ preset, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="rounded-2xl overflow-hidden text-left border border-border hover:border-gray-300 transition-all shadow-sm group bg-white"
    >
      <div
        className="h-28 flex flex-col items-center justify-center gap-2 relative overflow-hidden"
        style={{ background: preset.theme.cardGradient }}
      >
        <span className="text-4xl">{preset.icon}</span>
        <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary px-3 py-0.5 rounded-full bg-white/80">
          {preset.category}
        </span>
      </div>

      <div className="p-4">
        <h4 className="text-text-primary font-bold text-sm group-hover:text-emerald-600 transition-colors">
          {preset.name}
        </h4>
        <p className="text-text-secondary text-xs mt-1 leading-relaxed line-clamp-2">
          {preset.description}
        </p>
        <div className="flex gap-2 mt-3 flex-wrap">
          {preset.sizes.map(size => (
            <span key={size} className="text-[9px] px-2 py-0.5 bg-gray-100 rounded-full text-text-muted font-mono">
              {size}
            </span>
          ))}
          {preset.requiresPhoto && (
            <span className="text-[9px] px-2 py-0.5 bg-emerald-100 rounded-full text-emerald-700 font-medium">
              📷 Com foto
            </span>
          )}
        </div>
      </div>
    </motion.button>
  )
}
