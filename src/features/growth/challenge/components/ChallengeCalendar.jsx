import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'

const WEEK_LABELS = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7']

const WEEK_THEMES = [
  { label: 'Alicerce', color: 'text-blue-400' },
  { label: 'Prova Social', color: 'text-purple-400' },
  { label: 'Networking', color: 'text-amber-400' },
  { label: 'Escala', color: 'text-emerald-400' }
]

export default function ChallengeCalendar({ tasks, currentDay, onDayClick }) {
  if (!tasks || tasks.length === 0) return null

  const sorted = [...tasks].sort((a, b) => a.day - b.day)

  const weeks = [
    sorted.slice(0, 7),
    sorted.slice(7, 14),
    sorted.slice(14, 21),
    sorted.slice(21, 30)
  ]

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] text-gray-600 w-8" />
        {WEEK_LABELS.map(d => (
          <span key={d} className="flex-1 text-center text-[9px] font-bold text-gray-600 uppercase">{d}</span>
        ))}
      </div>

      {weeks.map((week, wi) => {
        const theme = WEEK_THEMES[wi]
        return (
          <div key={wi} className="flex items-center gap-2 mb-1">
            <span className={`text-[9px] font-bold w-8 ${theme.color}`}>S{wi + 1}</span>
            {week.map((task) => {
              const isToday = task.day === currentDay
              const isDone = task.status === 'DONE'
              const isSkipped = task.status === 'SKIPPED'

              return (
                <motion.div
                  key={task.id}
                  whileHover={{ scale: onDayClick ? 1.2 : 1 }}
                  whileTap={onDayClick ? { scale: 0.9 } : {}}
                  onClick={() => onDayClick?.(task)}
                  className={`flex-1 aspect-square rounded flex items-center justify-center text-[10px] font-bold transition-all ${
                    onDayClick ? 'cursor-pointer' : 'cursor-default'
                  } ${
                    isDone
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : isSkipped
                      ? 'bg-gray-700/30 text-gray-600'
                      : isToday
                      ? 'bg-emerald-600 text-white ring-1 ring-emerald-400'
                      : 'bg-gray-800/30 text-gray-500 hover:bg-gray-700/40'
                  }`}
                >
                  {isDone ? (
                    <Check className="w-2.5 h-2.5" />
                  ) : isSkipped ? (
                    <X className="w-2 h-2" />
                  ) : (
                    <span>{task.day}</span>
                  )}
                </motion.div>
              )
            })}
          </div>
        )
      })}

      <div className="flex gap-3 mt-2 pt-2 border-t border-gray-700/40 text-[9px] text-gray-500">
        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-emerald-500/15" /> Feita</span>
        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-emerald-600" /> Hoje</span>
        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-gray-800/30" /> Pendente</span>
        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-gray-700/30 flex items-center justify-center"><X className="w-1.5 h-1.5 text-gray-600" /></div> Pulada</span>
      </div>
    </div>
  )
}
