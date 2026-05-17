import { useState } from 'react'
import { motion } from 'framer-motion'
import { Rocket, ArrowRight } from 'lucide-react'
import { useActiveChallenge } from './hooks/useActiveChallenge'
import ChallengeOnboarding from './components/ChallengeOnboarding'
import ChallengeStartScreen from './components/ChallengeStartScreen'
import TaskDetailPage from './components/TaskDetailPage'
import ChallengeCalendar from './components/ChallengeCalendar'
import ChallengeProgressCard from './components/ChallengeProgressCard'
import DailyTipCard from './components/DailyTipCard'

export default function ChallengeTab() {
  const [view, setView] = useState('block')
  const [selectedTask, setSelectedTask] = useState(null)
  const [selectedDayNumber, setSelectedDayNumber] = useState(null)
  const { challenge, todayTask, dayNumber, streak, markDone, markSkipped, startChallenge, loading } = useActiveChallenge()

  const handleNavigateToOnboarding = () => setView('onboarding')
  const handleNavigateToStart = () => setView('start')
  const handleNavigateToTask = (task, day) => {
    setSelectedTask(task)
    setSelectedDayNumber(day)
    setView('task')
  }
  const handleBackToBlock = () => {
    setView('block')
    setSelectedTask(null)
    setSelectedDayNumber(null)
  }
  const handleProfileComplete = () => setView('start')
  const handleChallengeStart = async () => {
    const success = await startChallenge()
    if (success) setView('block')
  }
  const handleTaskDone = async (taskId) => markDone(taskId)
  const handleTaskSkip = async (taskId) => markSkipped(taskId)

  const handleDayClick = (task) => {
    handleNavigateToTask(task, task.day)
  }

  if (view === 'onboarding') return <ChallengeOnboarding onComplete={handleProfileComplete} />
  if (view === 'start') return <ChallengeStartScreen onStart={handleChallengeStart} loading={loading} />
  if (view === 'task' && selectedTask) {
    return (
      <TaskDetailPage
        task={selectedTask}
        dayNumber={selectedDayNumber}
        currentDay={dayNumber}
        onBack={handleBackToBlock}
        onMarkDone={handleTaskDone}
        onSkip={handleTaskSkip}
        loading={loading}
      />
    )
  }

  if (!challenge && !todayTask) {
    return (
      <div className="space-y-6">
        <DailyTipCard />
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-border rounded-2xl p-8 text-center shadow-sm"
        >
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent/10 flex items-center justify-center">
            <Rocket className="w-8 h-8 text-accent" />
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-3">Desafio 30 Dias</h2>
          <p className="text-text-secondary mb-6 max-w-md mx-auto">
            Transforme seu negócio com tarefas práticas de marketing. 30 dias para aumentar sua visibilidade e conquistar mais clientes.
          </p>
          <button
            onClick={handleNavigateToStart}
            className="py-3 px-8 rounded-xl bg-accent text-white font-semibold hover:bg-accent-hover transition-colors inline-flex items-center gap-2 shadow-sm"
          >
            Começar agora <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>
    )
  }

  if (challenge?.status === 'COMPLETED') {
    return (
      <div className="space-y-6">
        <DailyTipCard />
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-purple-200 rounded-2xl p-8 text-center shadow-sm"
        >
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-purple-100 flex items-center justify-center">
            <span className="text-3xl">🏆</span>
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-3">Desafio Concluído!</h2>
          <div className="grid grid-cols-3 gap-4 mb-6 max-w-sm mx-auto">
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-2xl font-bold text-purple-600">{challenge.totalDone}</p>
              <p className="text-[10px] text-muted uppercase">Feitas</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-2xl font-bold text-muted">{challenge.totalSkipped}</p>
              <p className="text-[10px] text-muted uppercase">Puladas</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <p className="text-2xl font-bold text-accent">{Math.round(challenge.completionPct)}%</p>
              <p className="text-[10px] text-muted uppercase">Progresso</p>
            </div>
          </div>
          <button
            onClick={handleNavigateToStart}
            className="py-3 px-8 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition-colors inline-flex items-center gap-2 shadow-sm"
          >
            Iniciar novo ciclo <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
        {challenge.tasks && <ChallengeCalendar tasks={challenge.tasks} currentDay={30} />}
      </div>
    )
  }

  const isTaskDone = todayTask?.status === 'DONE'
  const isTaskSkipped = todayTask?.status === 'SKIPPED'

  return (
    <div className="space-y-6">
      <DailyTipCard />

      <ChallengeProgressCard challenge={challenge} dayNumber={dayNumber} streak={streak} />

      {todayTask && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl p-6 border ${
            isTaskDone
              ? 'bg-emerald-50 border-emerald-200'
              : isTaskSkipped
              ? 'bg-gray-50 border-border'
              : 'bg-gradient-to-r from-emerald-50 to-emerald-100/50 border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-xs text-muted uppercase tracking-wider">Tarefa do dia {dayNumber}</span>
              <h3 className="text-xl font-bold text-text-primary mt-1">{todayTask.content?.title || 'Tarefa do dia'}</h3>
              <p className="text-text-secondary text-sm mt-1">{todayTask.content?.subtitle || ''}</p>
            </div>
            {isTaskDone && (
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">Feita ✓</span>
            )}
          </div>

          {!isTaskDone && !isTaskSkipped && (
            <button
              onClick={() => handleNavigateToTask(todayTask, dayNumber)}
              className="py-2.5 px-6 rounded-xl bg-accent text-white font-medium hover:bg-accent-hover transition-colors inline-flex items-center gap-2 shadow-sm"
            >
              Ver tarefa completa <ArrowRight className="w-4 h-4" />
            </button>
          )}
          {isTaskSkipped && (
            <button
              onClick={() => handleNavigateToTask(todayTask, dayNumber)}
              className="py-2.5 px-6 rounded-xl bg-gray-600 text-white font-medium hover:bg-gray-500 transition-colors inline-flex items-center gap-2"
            >
              Ver tarefa <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      )}

      {challenge?.tasks && (
        <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-text-primary">Calendário do Desafio</h3>
            <span className="text-xs text-muted">Clique em qualquer dia para abrir a tarefa</span>
          </div>
          <ChallengeCalendar
            tasks={challenge.tasks}
            currentDay={dayNumber}
            onDayClick={handleDayClick}
          />
        </div>
      )}
    </div>
  )
}
