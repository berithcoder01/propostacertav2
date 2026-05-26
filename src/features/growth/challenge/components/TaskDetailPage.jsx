import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowLeft, 
  Lightbulb, 
  SkipForward, 
  CheckCircle, 
  Clock, 
  Forward, 
  Target, 
  BookOpen, 
  AlertTriangle, 
  TrendingUp, 
  Award, 
  Link2, 
  Zap, 
  Brain, 
  HelpCircle,
  Play
} from 'lucide-react'
import { getCategoryIcon } from '../utils/challengeUtils'

export default function TaskDetailPage({ task, dayNumber, onBack, onMarkDone, onSkip, loading, currentDay }) {
  const [showConfetti, setShowConfetti] = useState(false)
  const content = task?.content || task

  const isFutureDay = currentDay && dayNumber > currentDay
  const hasRichContent = !!content?.strategicObjective

  const handleMarkDone = async () => {
    const success = await onMarkDone(task.id)
    if (success) {
      setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 2000)
    }
  }

  const categoryIcon = getCategoryIcon(content?.category || 'presenca')

  return (
    <div className="w-full px-4 py-6">
      <AnimatePresence>
        {showConfetti && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center bg-black/10 backdrop-blur-[2px]"
          >
            <div className="text-8xl animate-bounce">🎉</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Barra superior de navegação */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface dark:bg-dark-surface border border-border dark:border-dark-border text-text-secondary dark:text-gray-400 hover:text-text-primary dark:hover:text-white hover:border-accent/40 dark:hover:border-accent/40 hover:bg-gray-50 dark:hover:bg-dark-surface/60 transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Voltar aos Desafios</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-full bg-accent/10 dark:bg-accent/20 text-accent dark:text-accent-hover text-xs font-semibold uppercase tracking-wider">
            Dia {dayNumber} de 30
          </span>
          {content?.difficulty && (
            <span className="px-3.5 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-text-secondary dark:text-gray-400 text-xs font-semibold uppercase tracking-wider">
              {content.difficulty}
            </span>
          )}
        </div>
      </div>

      {/* Header do Desafio (Aula) */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 p-8 rounded-3xl bg-gradient-to-br from-accent/90 via-emerald-600/90 to-emerald-800/90 dark:from-accent/80 dark:via-emerald-950/50 dark:to-emerald-950/80 border border-emerald-500/20 dark:border-emerald-500/10 shadow-lg text-white relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="p-2.5 bg-white/20 rounded-xl text-white backdrop-blur-md">
              {categoryIcon}
            </span>
            <span className="px-3.5 py-1.5 bg-white/15 rounded-full text-xs font-medium backdrop-blur-md uppercase tracking-wider">
              {content?.category || 'Presença Digital'}
            </span>
            {isFutureDay && (
              <span className="px-3 py-1 bg-blue-500/30 border border-blue-400/30 rounded-full text-xs text-blue-200 font-bold flex items-center gap-1 backdrop-blur-md">
                <Forward className="w-3 h-3" /> Adiantando
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-3">
            {content?.title || 'Aula do Dia'}
          </h1>
          <p className="text-lg text-emerald-50/95 max-w-3xl leading-relaxed">
            {content?.subtitle || ''}
          </p>
        </div>
      </motion.div>

      {/* Grid Principal - Dois Column Layout se tiver conteúdo expandido */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Coluna da Esquerda (2/3) - Conhecimento & Execução */}
        <div className="lg:col-span-2 space-y-8">
          
          {hasRichContent && (
            <>
              {/* Card de Foco Estratégico e Conceito */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-surface dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 space-y-6"
              >
                <div>
                  <div className="flex items-center gap-2.5 text-accent font-bold text-sm uppercase tracking-wider mb-2">
                    <Target className="w-4 h-4" />
                    Objetivo Estratégico
                  </div>
                  <p className="text-text-primary dark:text-gray-100 text-base leading-relaxed font-medium">
                    {content.strategicObjective}
                  </p>
                </div>

                <div className="h-px bg-border dark:bg-dark-border" />

                <div>
                  <div className="flex items-center gap-2.5 text-blue-500 dark:text-blue-400 font-bold text-sm uppercase tracking-wider mb-3">
                    <BookOpen className="w-4 h-4" />
                    Conceito Chave
                  </div>
                  <div className="p-4 bg-blue-50/40 dark:bg-blue-950/10 border-l-4 border-blue-500 dark:border-blue-400 rounded-r-xl">
                    <p className="text-blue-950 dark:text-blue-100 text-base italic leading-relaxed font-semibold">
                      {content.concept}
                    </p>
                  </div>
                </div>
              </motion.div>
            </>
          )}

          {/* Seção do Passo a Passo (Stepper) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-surface dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-text-primary dark:text-white flex items-center gap-2">
                <Play className="w-5 h-5 text-accent fill-accent/10" />
                Plano de Ação Prática
              </h3>
              {content?.estimatedMinutes && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-border dark:border-dark-border text-text-secondary dark:text-gray-400 text-xs font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{content.estimatedMinutes} min estimados</span>
                </div>
              )}
            </div>

            {/* Stepper Visual */}
            <div className="relative border-l border-gray-200 dark:border-gray-800 pl-6 ml-3 space-y-8 my-4">
              {(content?.steps || []).map((step, i) => (
                <div key={i} className="relative group">
                  {/* Círculo indicador com número */}
                  <span className="absolute -left-[37px] top-0.5 flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 dark:border-gray-800 bg-white dark:bg-dark-surface text-xs font-bold text-text-secondary dark:text-gray-400 shadow-sm group-hover:border-accent/40 group-hover:text-accent transition-all duration-300">
                    {i + 1}
                  </span>
                  <div>
                    <h4 className="font-bold text-text-primary dark:text-white text-base transition-colors group-hover:text-accent duration-300">
                      {step.text.split(' — ')[0].includes('Passo') ? step.text.split(' — ')[0] : `Etapa ${i + 1}`}
                    </h4>
                    <p className="text-text-secondary dark:text-gray-300 mt-1.5 leading-relaxed text-sm">
                      {step.text.includes(' — ') ? step.text.split(' — ').slice(1).join(' — ') : step.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Dica do Dia ou Alerta de Erros Comuns */}
          {(content?.commonError || content?.tip) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {content?.commonError && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50/20 dark:bg-red-950/10 border border-red-200/40 dark:border-red-950/50 rounded-2xl p-5"
                >
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-sm uppercase tracking-wider mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    Erro Mais Comum
                  </div>
                  <p className="text-red-950 dark:text-red-200 text-sm leading-relaxed">
                    {content.commonError}
                  </p>
                </motion.div>
              )}

              {content?.tip && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-amber-50/20 dark:bg-amber-950/10 border border-amber-200/40 dark:border-amber-950/50 rounded-2xl p-5"
                >
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm uppercase tracking-wider mb-2">
                    <Lightbulb className="w-4 h-4" />
                    Dica de Sucesso
                  </div>
                  <p className="text-amber-950 dark:text-amber-200 text-sm leading-relaxed">
                    {content.tip}
                  </p>
                </motion.div>
              )}
            </div>
          )}

          {/* Legado - Caixa de Motivação se não houver conteúdo expandido */}
          {!hasRichContent && content?.motivation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-5 bg-emerald-50/30 dark:bg-emerald-950/10 border border-emerald-200/30 dark:border-emerald-950/50 rounded-2xl"
            >
              <h4 className="font-bold text-emerald-800 dark:text-emerald-400 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Target className="w-4 h-4" />
                Por que fazer esse desafio hoje?
              </h4>
              <p className="text-emerald-900 dark:text-emerald-200 text-base italic leading-relaxed">
                {content.motivation}
              </p>
            </motion.div>
          )}

        </div>

        {/* Coluna da Direita (1/3) - Acompanhamento & Metadados */}
        <div className="space-y-6 lg:sticky lg:top-6">
          
          {hasRichContent && (
            <>
              {/* Card de Impacto (Por Que Importa) */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-surface dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center gap-2 text-text-primary dark:text-white font-bold text-sm uppercase tracking-wider mb-3">
                  <HelpCircle className="w-4.5 h-4.5 text-accent" />
                  Por Que Isso Importa?
                </div>
                <p className="text-text-secondary dark:text-gray-300 text-sm leading-relaxed">
                  {content.whyItMatters}
                </p>
              </motion.div>

              {/* Card de Sucesso (Resultado & Métrica) */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-surface dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 space-y-4"
              >
                <div>
                  <div className="flex items-center gap-2 text-accent font-bold text-xs uppercase tracking-wider mb-1.5">
                    <Award className="w-4 h-4" />
                    Resultado Esperado
                  </div>
                  <p className="text-text-secondary dark:text-gray-300 text-sm leading-relaxed">
                    {content.expectedResult}
                  </p>
                </div>

                <div className="h-px bg-border dark:bg-dark-border" />

                <div>
                  <div className="flex items-center gap-2 text-blue-500 dark:text-blue-400 font-bold text-xs uppercase tracking-wider mb-1.5">
                    <TrendingUp className="w-4 h-4" />
                    Métricas de Sucesso
                  </div>
                  <p className="text-text-secondary dark:text-gray-300 text-sm leading-relaxed">
                    {content.evolutionMetric}
                  </p>
                </div>
              </motion.div>
            </>
          )}

          {/* Card de Desafio Bônus e Reflexão */}
          {hasRichContent && (content?.bonusChallenge || content?.reflection) && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-surface dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 space-y-4"
            >
              {content?.bonusChallenge && (
                <div>
                  <div className="flex items-center gap-2 text-indigo-500 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider mb-1.5">
                    <Zap className="w-4 h-4 fill-indigo-500/10" />
                    Desafio Bônus
                  </div>
                  <p className="text-text-secondary dark:text-gray-300 text-sm leading-relaxed">
                    {content.bonusChallenge}
                  </p>
                </div>
              )}

              {content?.bonusChallenge && content?.reflection && (
                <div className="h-px bg-border dark:bg-dark-border" />
              )}

              {content?.reflection && (
                <div>
                  <div className="flex items-center gap-2 text-purple-500 dark:text-purple-400 font-bold text-xs uppercase tracking-wider mb-1.5">
                    <Brain className="w-4 h-4" />
                    Reflexão do Dia
                  </div>
                  <p className="text-text-secondary dark:text-gray-300 text-sm italic leading-relaxed">
                    "{content.reflection}"
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Dependências Futuras */}
          {content?.futureDependencies && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-50/50 dark:bg-gray-800/10 border border-border dark:border-dark-border rounded-2xl p-5"
            >
              <div className="flex items-center gap-2 text-text-primary dark:text-white font-bold text-xs uppercase tracking-wider mb-2">
                <Link2 className="w-4 h-4 text-text-secondary" />
                Como será útil depois?
              </div>
              <p className="text-text-secondary dark:text-gray-400 text-xs leading-relaxed">
                {content.futureDependencies}
              </p>
            </motion.div>
          )}

          {/* Bloco de Ações e Finalização */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl p-6 shadow-sm space-y-4"
          >
            {content?.actionLabel && content?.actionUrl && (
              <a
                href={content.actionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 duration-300 cursor-pointer text-center"
              >
                Executar na Prática
                <Forward className="w-4 h-4" />
              </a>
            )}

            <div className="flex gap-3">
              <button
                onClick={onSkip}
                disabled={loading}
                className="flex-1 py-3 px-4 rounded-xl border border-border dark:border-dark-border text-text-secondary dark:text-gray-400 hover:border-border-strong dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-dark-surface/40 transition-colors flex items-center justify-center gap-2 text-sm font-semibold disabled:opacity-50"
              >
                <SkipForward className="w-4 h-4" />
                Pular
              </button>
              <button
                onClick={handleMarkDone}
                disabled={loading || task?.status === 'DONE'}
                className="flex-1 py-3 px-4 rounded-xl bg-accent text-white hover:bg-accent-hover transition-all flex items-center justify-center gap-2 text-sm font-semibold disabled:opacity-50 shadow-sm hover:shadow-md hover:-translate-y-0.5 duration-300"
              >
                <CheckCircle className="w-4 h-4" />
                {task?.status === 'DONE' ? 'Concluído!' : 'Feito'}
              </button>
            </div>
          </motion.div>

        </div>
        
      </div>
    </div>
  )
}

