import { motion } from 'framer-motion'
import { Rocket, ArrowRight, Lightbulb, Flame } from 'lucide-react'
import { useActiveChallenge } from '../challenge/hooks/useActiveChallenge'
import { getDailyTip } from '../challenge/data/dailyTips'

export default function DashboardChallengeBlock({ onNavigate }) {
  const { challenge, todayTask, dayNumber, streak, loading } = useActiveChallenge()
  const tip = getDailyTip()

  if (loading) {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-5 animate-pulse">
        <div className="h-5 bg-gray-700 rounded w-40 mb-3"></div>
        <div className="h-4 bg-gray-700 rounded w-64 mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-32"></div>
      </div>
    )
  }

  if (!challenge && !todayTask) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-600/15 to-emerald-700/10 border border-emerald-500/25 rounded-2xl overflow-hidden"
      >
        <div className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <Rocket className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-white mb-1">Desafio 30 Dias</h3>
              <p className="text-gray-400 text-sm mb-3">Tarefas diárias para alavancar seu negócio nas redes sociais.</p>
              <button
                onClick={onNavigate}
                className="py-2 px-4 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors inline-flex items-center gap-1.5"
              >
                Começar agora <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
        <div className="px-5 py-3 bg-amber-500/10 border-t border-amber-500/15 flex items-center gap-2">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
          <p className="text-amber-200/80 text-xs">{tip.tip}</p>
        </div>
      </motion.div>
    )
  }

  if (challenge?.status === 'COMPLETED') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600/15 to-purple-700/10 border border-purple-500/25 rounded-2xl p-5"
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-white">🏆 Desafio Concluído!</h3>
          <button
            onClick={onNavigate}
            className="py-2 px-4 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors inline-flex items-center gap-1.5"
          >
            Novo ciclo <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex gap-4 text-sm">
          <span className="text-purple-400 font-bold">{challenge.totalDone}/30 feitas</span>
          <span className="text-gray-500">•</span>
          <span className="text-gray-400">{Math.round(challenge.completionPct)}% concluído</span>
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
      className="bg-gray-800/50 border border-gray-700 rounded-2xl overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Rocket className="w-4 h-4 text-emerald-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Desafio 30 Dias</h3>
              <span className="text-xs text-gray-400">Dia {dayNumber} de 30</span>
            </div>
          </div>
          {streak > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-500/20 rounded-full">
              <Flame className="w-3.5 h-3.5 text-orange-500" />
              <span className="text-orange-400 text-xs font-bold">{streak}</span>
            </div>
          )}
        </div>

        {isTaskDone ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-400 text-sm font-medium">Tarefa do dia concluída! ✓</p>
              <p className="text-gray-500 text-xs mt-0.5">{todayTask.content?.title}</p>
            </div>
          </div>
        ) : isTaskSkipped ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Tarefa pulada hoje</p>
              <p className="text-gray-500 text-xs mt-0.5">{todayTask.content?.title}</p>
            </div>
            <button
              onClick={onNavigate}
              className="py-1.5 px-3 rounded-lg bg-gray-700 text-gray-300 text-xs font-medium hover:bg-gray-600 transition-colors"
            >
              Ver
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm font-medium">{todayTask?.content?.title || 'Tarefa do dia'}</p>
              <p className="text-gray-400 text-xs mt-0.5">{todayTask?.content?.subtitle || ''}</p>
            </div>
            <button
              onClick={onNavigate}
              className="py-2 px-4 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors inline-flex items-center gap-1.5"
            >
              Ver tarefa <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      <div className="px-5 py-3 bg-amber-500/10 border-t border-amber-500/15 flex items-center gap-2">
        <Lightbulb className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
        <p className="text-amber-200/80 text-xs">{tip.tip}</p>
      </div>
    </motion.div>
  )
}
