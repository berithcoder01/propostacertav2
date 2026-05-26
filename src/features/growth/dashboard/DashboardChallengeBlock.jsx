import { motion } from 'framer-motion'
import { Rocket, ArrowRight, Lightbulb, Flame } from 'lucide-react'
import { useActiveChallenge } from '../challenge/hooks/useActiveChallenge'
import { getDailyTip } from '../challenge/data/dailyTips'

export default function DashboardChallengeBlock({ onNavigate }) {
  const { challenge, todayTask, dayNumber, streak, loading } = useActiveChallenge()
  const tip = getDailyTip()

  if (loading) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 border border-border dark:border-dark-border rounded-2xl p-5 animate-pulse">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-3"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
      </div>
    )
  }

  if (!challenge && !todayTask) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-50 to-emerald-100/50 dark:from-emerald-900/30 dark:to-emerald-800/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl overflow-hidden shadow-sm"
      >
        <div className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center flex-shrink-0">
              <Rocket className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-text-primary dark:text-white mb-1">Desafio 30 Dias</h3>
              <p className="text-text-secondary dark:text-gray-400 text-sm mb-3">Tarefas diárias para alavancar seu negócio nas redes sociais.</p>
              <button
                onClick={onNavigate}
                className="py-2 px-4 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors inline-flex items-center gap-1.5 shadow-sm"
              >
                Começar agora <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
        <div className="px-5 py-3 bg-amber-50 dark:bg-amber-900/20 border-t border-amber-200 dark:border-amber-800 flex items-center gap-2">
          <Lightbulb className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <p className="text-amber-700 dark:text-amber-300 text-xs">{tip.tip}</p>
        </div>
      </motion.div>
    )
  }

  if (challenge?.status === 'COMPLETED') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-50 to-purple-100/50 dark:from-purple-900/30 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800 rounded-2xl p-5 shadow-sm"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-text-primary dark:text-white">🏆 Desafio Concluído!</h3>
          <button
            onClick={onNavigate}
            className="py-2 px-4 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors inline-flex items-center gap-1.5 shadow-sm"
          >
            Novo ciclo <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex gap-4 text-sm">
          <span className="text-purple-600 dark:text-purple-400 font-bold">{challenge.totalDone}/30 feitas</span>
          <span className="text-muted dark:text-gray-500">•</span>
          <span className="text-text-secondary dark:text-gray-400">{Math.round(challenge.completionPct)}% concluído</span>
        </div>
      </motion.div>
    )
  }

  const isTaskDone = todayTask?.status === 'DONE'
  const isTaskSkipped = todayTask?.status === 'SKIPPED'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl overflow-hidden shadow-sm"
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
              <Rocket className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary dark:text-white">Desafio 30 Dias</h3>
              <span className="text-xs text-text-secondary dark:text-gray-400">Dia {dayNumber} de 30</span>
            </div>
          </div>
          {streak > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-100 dark:bg-orange-900/30 rounded-full">
              <Flame className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
              <span className="text-orange-600 dark:text-orange-400 text-xs font-bold">{streak}</span>
            </div>
          )}
        </div>

        {isTaskDone ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">Tarefa do dia concluída! ✓</p>
              <p className="text-muted dark:text-gray-500 text-xs mt-0.5">{todayTask.content?.title}</p>
            </div>
          </div>
        ) : isTaskSkipped ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-secondary dark:text-gray-400 text-sm">Tarefa pulada hoje</p>
              <p className="text-muted dark:text-gray-500 text-xs mt-0.5">{todayTask.content?.title}</p>
            </div>
            <button
              onClick={onNavigate}
              className="py-1.5 px-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-text-secondary dark:text-gray-400 text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Ver
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-primary dark:text-white text-sm font-medium">{todayTask?.content?.title || 'Tarefa do dia'}</p>
              <p className="text-text-secondary dark:text-gray-400 text-xs mt-0.5">{todayTask?.content?.subtitle || ''}</p>
            </div>
            <button
              onClick={onNavigate}
              className="py-2 px-4 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors inline-flex items-center gap-1.5 shadow-sm"
            >
              Ver tarefa <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      <div className="px-5 py-3 bg-amber-50 dark:bg-amber-900/20 border-t border-amber-200 dark:border-amber-800 flex items-center gap-2">
        <Lightbulb className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
        <p className="text-amber-700 dark:text-amber-300 text-xs">{tip.tip}</p>
      </div>
    </motion.div>
  )
}
