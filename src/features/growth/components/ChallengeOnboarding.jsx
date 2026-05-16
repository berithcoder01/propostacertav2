import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Instagram, MessageSquare, Globe, Target, Clock, Users } from 'lucide-react'
import { createOrUpdateMarketingProfile } from '../services/marketingApi'

export default function ChallengeOnboarding({ onComplete }) {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    hasInstagram: false,
    hasWhatsappBiz: false,
    hasPaidAds: false,
    hasWebsite: false,
    hasGoogleBusiness: false,
    dailyTimeMinutes: 30,
    monthlyGoalLeads: 5
  })

  const questions = [
    {
      title: 'Vamos conhecer seu neg\u00f3cio?',
      subtitle: 'Responda algumas perguntas para personalizarmos seu desafio',
      fields: [
        { key: 'hasInstagram', label: 'Tem Instagram?', icon: Instagram, type: 'boolean' },
        { key: 'hasWhatsappBiz', label: 'Usa WhatsApp Business?', icon: MessageSquare, type: 'boolean' },
        { key: 'hasGoogleBusiness', label: 'Tem perfil no Google Meu Neg\u00f3cio?', icon: Globe, type: 'boolean' }
      ]
    },
    {
      title: 'Sua presen\u00e7a digital',
      subtitle: 'Isso nos ajuda a sugerir as melhores estrat\u00e9gias',
      fields: [
        { key: 'hasWebsite', label: 'Tem site ou p\u00e1gina online?', icon: Globe, type: 'boolean' },
        { key: 'hasPaidAds', label: 'J\u00e1 investiu em an\u00fancios pagos?', icon: Target, type: 'boolean' }
      ]
    },
    {
      title: 'Seu tempo e objetivos',
      subtitle: 'Vamos ajustar o desafio \u00e0 sua realidade',
      fields: [
        { key: 'dailyTimeMinutes', label: 'Minutos por dia para marketing', icon: Clock, type: 'number', options: [15, 30, 45, 60] },
        { key: 'monthlyGoalLeads', label: 'Quantos clientes novos quer por m\u00eas?', icon: Users, type: 'number', options: [3, 5, 10, 20, 30] }
      ]
    }
  ]

  const handleToggle = (key) => {
    setFormData(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSelect = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const response = await createOrUpdateMarketingProfile(formData)
      if (response.success) {
        onComplete(response.data)
      }
    } catch (err) {
      console.error('Error saving profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const currentQuestion = questions[step]
  const isLastStep = step === questions.length - 1

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="flex gap-1">
              {questions.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 w-8 rounded-full transition-colors ${
                    i <= step ? 'bg-emerald-500' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">{currentQuestion.title}</h2>
          <p className="text-gray-400 mb-8">{currentQuestion.subtitle}</p>

          <div className="space-y-4">
            {currentQuestion.fields.map((field) => {
              const Icon = field.icon
              if (field.type === 'boolean') {
                return (
                  <button
                    key={field.key}
                    onClick={() => handleToggle(field.key)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                      formData[field.key]
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${formData[field.key] ? 'text-emerald-500' : 'text-gray-400'}`} />
                    <span className="text-white flex-1 text-left">{field.label}</span>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      formData[field.key] ? 'border-emerald-500 bg-emerald-500' : 'border-gray-500'
                    }`}>
                      {formData[field.key] && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </button>
                )
              }
              if (field.type === 'number' && field.options) {
                return (
                  <div key={field.key}>
                    <div className="flex items-center gap-4 mb-3">
                      <Icon className="w-5 h-5 text-gray-400" />
                      <span className="text-white">{field.label}</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {field.options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => handleSelect(field.key, opt)}
                          className={`px-4 py-2 rounded-lg border transition-all ${
                            formData[field.key] === opt
                              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500'
                              : 'border-gray-600 text-gray-300 hover:border-gray-500'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              }
              return null
            })}
          </div>

          <div className="flex gap-3 mt-8">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex-1 py-3 px-4 rounded-xl border border-gray-600 text-gray-300 hover:border-gray-500 transition-colors"
              >
                Voltar
              </button>
            )}
            <button
              onClick={isLastStep ? handleSubmit : () => setStep(step + 1)}
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Salvando...' : isLastStep ? 'Come\u00e7ar Desafio' : 'Pr\u00f3ximo'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
