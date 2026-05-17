import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Lightbulb, SkipForward, CheckCircle, Clock, Forward } from 'lucide-react'
import TaskStep from './TaskStep'
import { getCategoryIcon } from '../utils/challengeUtils'

export default function TaskDetailPage({ task, dayNumber, onBack, onMarkDone, onSkip, loading, currentDay }) {
  const [showConfetti, setShowConfetti] = useState(false)
  const content = task?.content || task

  const isFutureDay = currentDay && dayNumber > currentDay

  const handleMarkDone = async () => {
    const success = await onMarkDone(task.id)
    if (success) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 2000)
    }
  }

  const categoryIcon = getCategoryIcon(content?.category || 'presenca')

  return (
    <div className="w-full max-w-3xl mx-auto">
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
          >
            <div className="text-6xl">🎉</div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white backdrop-blur-sm border border-border rounded-2xl overflow-hidden shadow-sm"
        >
          <div className={`p-6 ${isFutureDay ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-accent to-emerald-600'}`}>
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm text-white">
                Dia {dayNumber} de 30
              </span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm text-white capitalize">
                {content?.category || 'Geral'}
              </span>
              {isFutureDay && (
                <span className="px-3 py-1 bg-blue-300/30 rounded-full text-xs text-blue-100 font-bold flex items-center gap-1">
                  <Forward className="w-3 h-3" /> Adiantando
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">{content?.title || 'Tarefa do Dia'}</h1>
            <p className="text-white/90">{content?.subtitle || ''}</p>
          </div>

          <div className="p-6">
            {content?.motivation && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <p className="text-emerald-700 text-sm italic">{content.motivation}</p>
              </div>
            )}

            {content?.estimatedMinutes && (
              <div className="flex items-center gap-2 mb-6 text-text-secondary">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Tempo estimado: {content.estimatedMinutes} minutos</span>
              </div>
            )}

            <div className="space-y-3 mb-6">
              {(content?.steps || []).map((step, i) => (
                <TaskStep key={i} step={step} index={i} />
              ))}
            </div>

            {content?.tip && (
              <div className="flex gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
                <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-amber-700 text-sm">{content.tip}</p>
              </div>
            )}

            {content?.actionLabel && content?.actionUrl && (
              <a
                href={content.actionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-3 px-4 mb-4 rounded-xl bg-blue-600 text-white text-center font-medium hover:bg-blue-700 transition-colors shadow-sm"
              >
                {content.actionLabel}
              </a>
            )}

            <div className="flex gap-3">
              <button
                onClick={onSkip}
                disabled={loading}
                className="flex-1 py-3 px-4 rounded-xl border border-border text-text-secondary hover:border-border-strong transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <SkipForward className="w-4 h-4" />
                Pular
              </button>
              <button
                onClick={handleMarkDone}
                disabled={loading || task?.status === 'DONE'}
                className="flex-1 py-3 px-4 rounded-xl bg-accent text-white font-medium hover:bg-accent-hover transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
              >
                <CheckCircle className="w-4 h-4" />
                {task?.status === 'DONE' ? 'Concluída!' : 'Marcar como feito'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
