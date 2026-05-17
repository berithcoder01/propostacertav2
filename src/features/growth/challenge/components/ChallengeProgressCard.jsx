import { motion } from 'framer-motion'
import { Target, Trophy, Flame, Calendar } from 'lucide-react'

export default function ChallengeProgressCard({ challenge, dayNumber, streak }) {
  if (!challenge) return null

  const totalTasks = challenge.tasks?.length || 30
  const doneCount = challenge.tasks?.filter(t => t.status === 'DONE').length || 0
  const skippedCount = challenge.tasks?.filter(t => t.status === 'SKIPPED').length || 0
  const pendingCount = totalTasks - doneCount - skippedCount
  const progressPct = Math.round((doneCount / totalTasks) * 100)

  return (
    <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-text-primary">Progresso do Desafio</h3>
        {challenge.status === 'COMPLETED' ? (
          <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-bold">Concluído</span>
        ) : (
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">Em andamento</span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-gray-50 rounded-xl">
          <Calendar className="w-5 h-5 text-accent mx-auto mb-1" />
          <p className="text-2xl font-bold text-text-primary">{dayNumber || 0}</p>
          <p className="text-[10px] text-muted uppercase tracking-wider">Dia atual</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-xl">
          <Target className="w-5 h-5 text-info mx-auto mb-1" />
          <p className="text-2xl font-bold text-text-primary">{doneCount}</p>
          <p className="text-[10px] text-muted uppercase tracking-wider">Concluídas</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-xl">
          <Flame className="w-5 h-5 text-warning mx-auto mb-1" />
          <p className="text-2xl font-bold text-text-primary">{streak}</p>
          <p className="text-[10px] text-muted uppercase tracking-wider">Sequência</p>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-xl">
          <Trophy className="w-5 h-5 text-gold mx-auto mb-1" />
          <p className="text-2xl font-bold text-text-primary">{progressPct}%</p>
          <p className="text-[10px] text-muted uppercase tracking-wider">Progresso</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-text-secondary">
          <span>Progresso geral</span>
          <span>{doneCount} de {totalTasks} tarefas</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-accent to-emerald-400 rounded-full"
          />
        </div>
        <div className="flex gap-4 text-[10px] text-muted pt-1">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-accent" /> Feitas ({doneCount})
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-gray-400" /> Puladas ({skippedCount})
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-gray-300" /> Pendentes ({pendingCount})
          </span>
        </div>
      </div>
    </div>
  )
}
