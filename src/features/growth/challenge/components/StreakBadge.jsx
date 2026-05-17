import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'

export default function StreakBadge({ streak }) {
  if (!streak || streak === 0) return null

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-500/20 border border-orange-500/30 rounded-full"
    >
      <Flame className="w-4 h-4 text-orange-500" />
      <span className="text-orange-400 font-semibold text-sm">{streak} dia{streak > 1 ? 's' : ''}</span>
    </motion.div>
  )
}
