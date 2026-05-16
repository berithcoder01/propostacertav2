import { motion } from 'framer-motion'
import { Rocket, Calendar, Target, TrendingUp } from 'lucide-react'

export default function ChallengeStartScreen({ onStart, loading }) {
  const benefits = [
    { icon: Calendar, text: '30 dias de tarefas práticas e objetivas' },
    { icon: Target, text: 'Personalizado para seu segmento de negócio' },
    { icon: TrendingUp, text: 'Aumente sua visibilidade e clientes' },
    { icon: Rocket, text: 'Comece hoje - apenas 15-30 min por dia' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <Rocket className="w-8 h-8 text-emerald-500" />
          </div>

          <h2 className="text-3xl font-bold text-white mb-3">Desafio 30 Dias</h2>
          <p className="text-gray-400 mb-8">
            Transforme seu negócio com ações práticas de marketing digital. 
            Uma tarefa por dia, resultados reais.
          </p>

          <div className="space-y-4 mb-8 text-left">
            {benefits.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-700/30"
              >
                <item.icon className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span className="text-gray-300">{item.text}</span>
              </motion.div>
            ))}
          </div>

          <button
            onClick={onStart}
            disabled={loading}
            className="w-full py-4 px-6 rounded-xl bg-emerald-600 text-white font-semibold text-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Rocket className="w-5 h-5" />
            {loading ? 'Iniciando...' : 'Iniciar Desafio'}
          </button>

          <p className="text-gray-500 text-sm mt-4">
            Você pode pular tarefas se precisar. O importante é não desistir!
          </p>
        </div>
      </motion.div>
    </div>
  )
}
