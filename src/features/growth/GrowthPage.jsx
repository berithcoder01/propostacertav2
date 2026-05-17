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
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-black font-display text-white mb-2">Meu Negócio</h1>
        <p className="text-muted">Ferramentas para alavancar seu negócio nas redes sociais.</p>
      </div>

      <div className="flex gap-2 border-b border-gray-700 pb-1">
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-bold uppercase tracking-wider transition-all border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-500'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {activeTab === 'challenge' && <ChallengeTab />}
      {activeTab === 'arts' && <SocialArtsTab />}
      {activeTab === 'tutorials' && <TutorialsTab />}
    </motion.div>
  )
}
