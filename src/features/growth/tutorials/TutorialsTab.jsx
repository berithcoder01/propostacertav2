import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, ChevronDown, ChevronUp, Play, Filter } from 'lucide-react'
import { tutorials, tutorialCategories } from './data/tutorials'

export default function TutorialsTab() {
  const [selectedCategory, setSelectedCategory] = useState('Todos')
  const [expandedId, setExpandedId] = useState(null)
  const [completedSteps, setCompletedSteps] = useState({})

  const filtered = selectedCategory === 'Todos'
    ? tutorials
    : tutorials.filter(t => t.category === selectedCategory)

  const toggleStep = (tutorialId, stepIndex) => {
    setCompletedSteps(prev => {
      const key = `${tutorialId}-${stepIndex}`
      return { ...prev, [key]: !prev[key] }
    })
  }

  const getProgress = (tutorialId, totalSteps) => {
    let completed = 0
    for (let i = 0; i < totalSteps; i++) {
      if (completedSteps[`${tutorialId}-${i}`]) completed++
    }
    return totalSteps > 0 ? Math.round((completed / totalSteps) * 100) : 0
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-2">Tutoriais de Marketing Digital</h3>
        <p className="text-gray-400 mb-6">Aprenda passo a passo como alavancar seu negócio nas redes sociais.</p>

        <div className="flex gap-2 flex-wrap mb-6">
          {tutorialCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map(tutorial => {
            const isExpanded = expandedId === tutorial.id
            const progress = getProgress(tutorial.id, tutorial.steps.length)

            return (
              <motion.div
                key={tutorial.id}
                layout
                className={`border rounded-xl overflow-hidden transition-colors ${
                  isExpanded ? 'border-emerald-500/50 bg-gray-700/30' : 'border-gray-700 bg-gray-800/30 hover:bg-gray-700/20'
                }`}
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : tutorial.id)}
                  className="w-full p-4 flex items-center gap-4 text-left"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    progress === 100 ? 'bg-emerald-500/20' : 'bg-gray-700'
                  }`}>
                    {progress === 100 ? (
                      <span className="text-emerald-500 text-lg">✓</span>
                    ) : (
                      <Play className="w-4 h-4 text-gray-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] px-2 py-0.5 bg-gray-600 rounded-full text-gray-300">{tutorial.category}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        tutorial.level === 'Iniciante' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>{tutorial.level}</span>
                    </div>
                    <h4 className="text-white font-bold text-sm truncate">{tutorial.title}</h4>
                    <p className="text-gray-400 text-xs mt-0.5">{tutorial.description}</p>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <div className="flex items-center gap-1 text-gray-400 text-xs">
                        <Clock className="w-3 h-3" />
                        {tutorial.duration}
                      </div>
                      {progress > 0 && (
                        <div className="text-emerald-400 text-xs mt-0.5">{progress}% concluído</div>
                      )}
                    </div>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-3 border-t border-gray-700 pt-4">
                        {tutorial.steps.map((step, i) => {
                          const isCompleted = completedSteps[`${tutorial.id}-${i}`]
                          return (
                            <div key={i} className="flex gap-3">
                              <button
                                onClick={() => toggleStep(tutorial.id, i)}
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                                  isCompleted
                                    ? 'border-emerald-500 bg-emerald-500'
                                    : 'border-gray-600 hover:border-gray-500'
                                }`}
                              >
                                {isCompleted && <span className="text-white text-xs">✓</span>}
                              </button>
                              <div className={`flex-1 ${isCompleted ? 'opacity-50' : ''}`}>
                                <h5 className="text-white font-medium text-sm">{step.title}</h5>
                                <p className="text-gray-400 text-sm mt-1">{step.content}</p>
                              </div>
                            </div>
                          )
                        })}

                        {progress > 0 && progress < 100 && (
                          <div className="mt-4 pt-3 border-t border-gray-700">
                            <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                              <span>Progresso</span>
                              <span>{progress}%</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-emerald-500 h-2 rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Filter className="w-8 h-8 mx-auto mb-3 opacity-50" />
              <p>Nenhum tutorial nesta categoria ainda.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
