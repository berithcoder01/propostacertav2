import { useState } from 'react'
import { useActiveChallenge } from '../hooks/useActiveChallenge'
import ChallengeOnboarding from './ChallengeOnboarding'
import ChallengeStartScreen from './ChallengeStartScreen'
import TaskDetailPage from './TaskDetailPage'
import DashboardChallengeBlock from './DashboardChallengeBlock'

export default function ChallengeTab() {
  const [view, setView] = useState('block')
  const [selectedTask, setSelectedTask] = useState(null)
  const [selectedDayNumber, setSelectedDayNumber] = useState(null)
  const { markDone, markSkipped, startChallenge, loading } = useActiveChallenge()

  const handleNavigateToOnboarding = () => setView('onboarding')
  const handleNavigateToStart = () => setView('start')
  const handleNavigateToTask = (task, dayNumber) => {
    setSelectedTask(task)
    setSelectedDayNumber(dayNumber)
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

  if (view === 'onboarding') {
    return <ChallengeOnboarding onComplete={handleProfileComplete} />
  }

  if (view === 'start') {
    return <ChallengeStartScreen onStart={handleChallengeStart} loading={loading} />
  }

  if (view === 'task' && selectedTask) {
    return (
      <TaskDetailPage
        task={selectedTask}
        dayNumber={selectedDayNumber}
        onBack={handleBackToBlock}
        onMarkDone={handleTaskDone}
        onSkip={handleTaskSkip}
        loading={loading}
      />
    )
  }

  return (
    <DashboardChallengeBlock
      onNavigateToTask={handleNavigateToTask}
      onNavigateToOnboarding={handleNavigateToOnboarding}
      onNavigateToStart={handleNavigateToStart}
    />
  )
}
