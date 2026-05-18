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
      title: 'Vamos conhecer seu negócio?',
      subtitle: 'Responda algumas perguntas para personalizarmos seu desafio',
      fields: [
        { key: 'hasInstagram', label: 'Tem Instagram?', icon: Instagram, type: 'boolean' },
        { key: 'hasWhatsappBiz', label: 'Usa WhatsApp Business?', icon: MessageSquare, type: 'boolean' },
        { key: 'hasGoogleBusiness', label: 'Tem perfil no Google Meu Negócio?', icon: Globe, type: 'boolean' }
      ]
    },
    {
      title: 'Sua presença digital',
      subtitle: 'Isso nos ajuda a sugerir as melhores estratégias',
      fields: [
        { key: 'hasWebsite', label: 'Tem site ou página online?', icon: Globe, type: 'boolean' },
        { key: 'hasPaidAds', label: 'Já investiu em anúncios pagos?', icon: Target, type: 'boolean' }
      ]
    },
    {
      title: 'Seu tempo e objetivos',
      subtitle: 'Vamos ajustar o desafio à sua realidade',
      fields: [
        { key: 'dailyTimeMinutes', label: 'Minutos por dia para marketing', icon: Clock, type: 'number', options: [15, 30, 45, 60] },
        { key: 'monthlyGoalLeads', label: 'Quantos clientes novos quer por mês?', icon: Users, type: 'number', options: [3, 5, 10, 20, 30] }
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
    <div className="min-h-screen bg-bg dark:bg-dark-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="bg-surface dark:bg-dark-surface backdrop-blur-sm border border-border dark:border-dark-border rounded-2xl p-8 shadow-lg">
          <div className="flex items-center gap-2 mb-6">
            <div className="flex gap-1">
              {questions.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 w-8 rounded-full transition-colors ${
                    i <= step ? 'bg-accent' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              ))}
            </div>
          </div>

          <h2 className="text-2xl font-bold text-text-primary mb-2">{currentQuestion.title}</h2>
          <p className="text-text-secondary mb-8">{currentQuestion.subtitle}</p>

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
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-700'
                        : 'border-border dark:border-dark-border bg-gray-50 dark:bg-gray-800 hover:border-border-strong dark:hover:border-gray-600'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${formData[field.key] ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted'}`} />
                    <span className="text-text-primary flex-1 text-left">{field.label}</span>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      formData[field.key] ? 'border-emerald-500 bg-emerald-500' : 'border-border dark:border-dark-border'
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
                      <Icon className="w-5 h-5 text-muted dark:text-gray-400" />
                      <span className="text-text-primary dark:text-gray-200">{field.label}</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {field.options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => handleSelect(field.key, opt)}
                          className={`px-4 py-2 rounded-lg border transition-all ${
                            formData[field.key] === opt
                              ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                              : 'border-border dark:border-dark-border text-text-secondary dark:text-gray-400 hover:border-border-strong dark:hover:border-gray-600'
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
                className="flex-1 py-3 px-4 rounded-xl border border-border dark:border-dark-border text-text-secondary dark:text-gray-400 hover:border-border-strong dark:hover:border-gray-600 transition-colors"
              >
                Voltar
              </button>
            )}
            <button
              onClick={isLastStep ? handleSubmit : () => setStep(step + 1)}
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-xl bg-accent text-white font-medium hover:bg-accent-hover transition-colors disabled:opacity-50 shadow-sm"
            >
              {loading ? 'Salvando...' : isLastStep ? 'Começar Desafio' : 'Próximo'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
