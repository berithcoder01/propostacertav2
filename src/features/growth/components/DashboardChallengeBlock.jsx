import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Rocket, CheckCircle, Clock, ArrowRight, Trophy, Calendar } from 'lucide-react'
import { useActiveChallenge } from '../hooks/useActiveChallenge'
import StreakBadge from './StreakBadge'
import ProgressCalendar from './ProgressCalendar'

export default function DashboardChallengeBlock({ onNavigateToTask, onNavigateToOnboarding, onNavigateToStart }) {
  const { challenge, todayTask, dayNumber, streak, loading, error, startChallenge } = useActiveChallenge()
  const [showCalendar, setShowCalendar] = useState(false)

  if (loading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-48 mb-4"></div>
        <div className="h-4 bg-gray-700 rounded w-64 mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-32"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm border border-red-500/30 rounded-2xl p-6">
        <p className="text-red-400">Erro ao carregar desafio: {error}</p>
      </div>
    )
  }

  if (!challenge && !todayTask) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-600/20 to-emerald-700/20 border border-emerald-500/30 rounded-2xl p-6"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <Rocket className="w-6 h-6 text-emerald-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2">Desafio 30 Dias</h3>
            <p className="text-gray-300 mb-4">
              Transforme seu neg\u00f3cio com tarefas pr\u00e1ticas de marketing. 
              30 dias para aumentar sua visibilidade e conquistar mais clientes.
            </p>
            <button
              onClick={onNavigateToStart || onNavigateToOnboarding}
              className="py-2.5 px-5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2"
            >
              Come\u00e7ar agora
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  if (challenge?.status === 'COMPLETED') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-600/20 to-purple-700/20 border border-purple-500/30 rounded-2xl p-6"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
            <Trophy className="w-6 h-6 text-purple-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2">Desafio Conclu\u00eddo! 🎉</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-400">{challenge.totalDone}</p>
                <p className="text-sm text-gray-400">Tarefas feitas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-400">{challenge.totalSkipped}</p>
                <p className="text-sm text-gray-400">Puladas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-400">{Math.round(challenge.completionPct)}%</p>
                <p className="text-sm text-gray-400">Conclus\u00e3o</p>
              </div>
            </div>
            <button
              onClick={onNavigateToStart}
              className="py-2.5 px-5 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              Iniciar pr\u00f3ximo ciclo
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
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
      className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl overflow-hidden"
    >
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-white" />
            <h3 className="text-lg font-semibold text-white">Desafio 30 Dias</h3>
          </div>
          <StreakBadge streak={streak} />
        </div>
      </div>

      <div className="p-4">
        {isTaskDone ? (
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-5 h-5 text-emerald-500" />
            <span className="text-emerald-400 font-medium">Tarefa do dia conclu\u00edda!</span>
          </div>
        ) : isTaskSkipped ? (
          <div className="flex items-center gap-3 mb-3">
            <Clock className="w-5 h-5 text-gray-400" />
            <span className="text-gray-400">Tarefa pulada hoje</span>
          </div>
        ) : (
          <div className="mb-3">
            <span className="text-sm text-gray-400">Dia {dayNumber} de 30</span>
            <h4 className="text-white font-medium mt-1">{todayTask?.content?.title || 'Tarefa do dia'}</h4>
            <p className="text-gray-400 text-sm mt-1">{todayTask?.content?.subtitle || ''}</p>
          </div>
        )}

        <div className="flex gap-2">
          {!isTaskDone && !isTaskSkipped && todayTask && (
            <button
              onClick={() => onNavigateToTask?.(todayTask, dayNumber)}
              className="flex-1 py-2 px-4 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
            >
              Ver tarefa
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className="py-2 px-4 rounded-lg bg-gray-700/50 text-gray-300 hover:bg-gray-700/70 transition-colors text-sm"
          >
            {showCalendar ? 'Fechar' : 'Ver progresso'}
          </button>
        </div>

        <AnimatePresence>
          {showCalendar && challenge?.tasks && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 pt-4 border-t border-gray-700 overflow-hidden"
            >
              <ProgressCalendar tasks={challenge.tasks} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
