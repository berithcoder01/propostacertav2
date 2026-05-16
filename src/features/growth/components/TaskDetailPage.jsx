import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Lightbulb, SkipForward, CheckCircle, Clock } from 'lucide-react'
import TaskStep from './TaskStep'
import { getCategoryIcon } from '../utils/challengeUtils'

export default function TaskDetailPage({ task, dayNumber, onBack, onMarkDone, onSkip, loading }) {
  const [showConfetti, setShowConfetti] = useState(false)
  const content = task?.content || task

  const handleMarkDone = async () => {
    const success = await onMarkDone(task.id)
    if (success) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 2000)
    }
  }

  const categoryIcon = getCategoryIcon(content?.category || 'presenca')
  const IconComponent = {
    Camera: () => null,
    MessageSquare: () => null,
    Target: () => null,
    Search: () => null,
    Megaphone: () => null,
    Globe: () => null,
    Edit: () => null,
    Handshake: () => null,
    Circle: () => null
  }[categoryIcon] || (() => null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
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

      <div className="max-w-2xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Dashboard
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm text-white">
                Dia {dayNumber} de 30
              </span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm text-white capitalize">
                {content?.category || 'Geral'}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">{content?.title || 'Tarefa do Dia'}</h1>
            <p className="text-emerald-100">{content?.subtitle || ''}</p>
          </div>

          <div className="p-6">
            {content?.motivation && (
              <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <p className="text-emerald-300 text-sm italic">{content.motivation}</p>
              </div>
            )}

            {content?.estimatedMinutes && (
              <div className="flex items-center gap-2 mb-6 text-gray-400">
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
              <div className="flex gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-6">
                <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-amber-300 text-sm">{content.tip}</p>
              </div>
            )}

            {content?.actionLabel && content?.actionUrl && (
              <a
                href={content.actionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-3 px-4 mb-4 rounded-xl bg-blue-600 text-white text-center font-medium hover:bg-blue-700 transition-colors"
              >
                {content.actionLabel}
              </a>
            )}

            <div className="flex gap-3">
              <button
                onClick={onSkip}
                disabled={loading}
                className="flex-1 py-3 px-4 rounded-xl border border-gray-600 text-gray-300 hover:border-gray-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <SkipForward className="w-4 h-4" />
                Pular por hoje
              </button>
              <button
                onClick={handleMarkDone}
                disabled={loading || task?.status === 'DONE'}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                {task?.status === 'DONE' ? 'Conclu\u00edda!' : 'Marcar como feito'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
