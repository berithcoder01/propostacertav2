import { motion } from 'framer-motion'
import { Lightbulb, RefreshCw } from 'lucide-react'
import { getDailyTip, dailyTips } from '../data/dailyTips'

export default function DailyTipCard() {
  const tip = getDailyTip()

  const iconMap = {
    Camera: '📸',
    Star: '⭐',
    Image: '🖼️',
    Search: '🔍',
    Video: '🎬',
    Clock: '⏰',
    MessageSquare: '💬',
    Phone: '📞',
    Hash: '#️⃣',
    ShoppingBag: '🛍️',
    ThumbsUp: '👍',
    Heart: '❤️',
    BarChart: '📊',
    Folder: '📁',
    Megaphone: '📢'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-5 shadow-sm"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
          <span className="text-lg">{iconMap[tip.icon] || '💡'}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Dica do Dia</span>
          </div>
          <p className="text-text-primary dark:text-gray-200 text-sm leading-relaxed">{tip.tip}</p>
        </div>
      </div>
    </motion.div>
  )
}
