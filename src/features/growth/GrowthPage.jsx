import { useState } from 'react'
import { motion } from 'framer-motion'
import { Rocket, Image, BookOpen } from 'lucide-react'
import ChallengeTab from './challenge/ChallengeTab'
import SocialArtsTab from './social-arts/SocialArtsTab'
import TutorialsTab from './tutorials/TutorialsTab'

const tabs = [
  { id: 'challenge', label: 'Desafio 30 Dias', icon: Rocket },
  { id: 'arts', label: 'Artes para Redes', icon: Image },
  { id: 'tutorials', label: 'Tutoriais', icon: BookOpen }
]

export default function GrowthPage() {
  const [activeTab, setActiveTab] = useState('challenge')

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black font-display text-text-primary dark:text-white mb-2">Meu Negócio</h1>
          <p className="text-text-secondary dark:text-gray-400">Ferramentas para alavancar seu negócio nas redes sociais.</p>
        </div>

        <div className="relative flex bg-bg dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl p-1">
          {tabs.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative z-10 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors whitespace-nowrap ${
                  isActive
                    ? 'text-accent dark:text-accent'
                    : 'text-text-secondary dark:text-gray-500 hover:text-text-primary dark:hover:text-gray-300'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-xl bg-accent/10 dark:bg-accent/20"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className="w-4 h-4 relative z-10" />
                <span className="relative z-10 hidden lg:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {activeTab === 'challenge' && <ChallengeTab />}
      {activeTab === 'arts' && <SocialArtsTab />}
      {activeTab === 'tutorials' && <TutorialsTab />}
    </motion.div>
  )
}
