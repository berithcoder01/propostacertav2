import { motion } from 'framer-motion'
import { Check, X, Circle } from 'lucide-react'
import { getWeekNumber, getWeekLabel } from '../challenge/utils/challengeUtils'

export default function ProgressCalendar({ tasks }) {
  if (!tasks || tasks.length === 0) return null

  const weeks = [1, 2, 3, 4]

  return (
    <div className="space-y-4">
      {weeks.map((week) => {
        const weekTasks = tasks.filter(t => getWeekNumber(t.day) === week)
        return (
          <div key={week}>
            <h4 className="text-sm text-text-secondary mb-2">
              Semana {week}: {getWeekLabel(week)}
            </h4>
            <div className="grid grid-cols-7 gap-1">
              {weekTasks.map((task) => (
                <motion.div
                  key={task.id}
                  whileHover={{ scale: 1.1 }}
                  className={`aspect-square rounded-lg flex items-center justify-center text-xs font-medium ${
                    task.status === 'DONE'
                      ? 'bg-emerald-100 text-emerald-700'
                      : task.status === 'SKIPPED'
                      ? 'bg-gray-100 text-gray-400'
                      : 'bg-gray-50 text-gray-500'
                  }`}
                  title={`Dia ${task.day}: ${task.status}`}
                >
                  {task.status === 'DONE' ? (
                    <Check className="w-3 h-3" />
                  ) : task.status === 'SKIPPED' ? (
                    <X className="w-3 h-3" />
                  ) : (
                    <span>{task.day}</span>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
