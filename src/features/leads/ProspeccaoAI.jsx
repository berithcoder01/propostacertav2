import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, Phone, Mail, MessageCircle, Copy, X, 
  Send, Loader, Filter, RefreshCw, ChevronRight,
  Building2, MapPin, TrendingUp, CheckCircle
} from 'lucide-react'
import { useAuth } from '../../shared/context/AuthContext'
import { useToast } from '../../shared/context/ToastContext'
import { fetchProspectingProfile, saveProspectingProfile, API_URL } from '../../shared/services/api'

// Service functions
const getAuthHeaders = () => {
  const token = localStorage.getItem('@narogestor:token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  }
}

const fetchCuratedLeads = async (filters = {}) => {
  const params = new URLSearchParams()
  if (filters.segment) params.append('segment', filters.segment)
  if (filters.city) params.append('city', filters.city)
  if (filters.minScore) params.append('minScore', filters.minScore)
  
  const response = await fetch(`${API_URL}/leads/curated?${params}`, { headers: getAuthHeaders() })
  if (!response.ok) throw new Error('Falha ao buscar leads curados')
  return response.json()
}

const fetchLeadDetail = async (id) => {
  const response = await fetch(`${API_URL}/leads/${id}`, { headers: getAuthHeaders() })
  if (!response.ok) throw new Error('Falha ao buscar detalhes do lead')
  return response.json()
}

const updateLeadStatus = async (id, status) => {
  const response = await fetch(`${API_URL}/leads/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status })
  })
  if (!response.ok) throw new Error('Falha ao atualizar status')
  return response.json()
}

const sendChatMessage = async (message, context = {}) => {
  const response = await fetch(`${API_URL}/leads/ai/chat`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ message, ...context })
  })
  if (!response.ok) throw new Error('Falha na resposta da IA')
  return response.json()
}

// Score badge component
const ScoreBadge = ({ score }) => {
  const level = score >= 85 ? 'high' : score >= 70 ? 'med' : 'low'
  const colors = {
    high: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    med: 'bg-amber-100 text-amber-700 border-amber-200',
    low: 'bg-gray-100 text-gray-600 border-gray-200'
  }
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${colors[level]}`}>
      {score}% match
    </span>
  )
}

// ── Profile Setup Chat (inline) ──────────────────────────────────────────────
const PROFILE_STEPS = [
  { id: 'segment', question: 'Qual é o ramo de atuação dos seus clientes?', icon: '🏗️', options: ['Residencial (Casas/Apartamentos)', 'Comercial (Lojas/Escritórios)', 'Condomínios', 'Indústrias', 'Imobiliárias', 'Órgãos Públicos'] },
  { id: 'scope', question: 'Qual é o alcance do seu negócio?', icon: '', options: ['Local (minha cidade e região)', 'Nacional (todo o Brasil)'] },
  { id: 'baseCity', question: 'Qual é a cidade base da sua empresa?', icon: '📍', placeholder: 'Ex.: Maringá, São Paulo, Curitiba...' },
  { id: 'services', question: 'Quais serviços você oferece?', icon: '🔧', options: ['Instalação', 'Manutenção Preventiva', 'Reforma/Reparo', 'Projetos', 'Consultoria', 'Emergência 24h'] },
  { id: 'audience', question: 'Descreva brevemente seu público-alvo (opcional)', icon: '', placeholder: 'Ex.: Condomínios de médio porte em Maringá...' },
]

const ProfileSetupChat = ({ onComplete }) => {
  const { company, setProspectingProfileConfigured } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [started, setStarted] = useState(false)
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', content: `Olá! 👋 Bem-vindo à **Prospecção Inteligente**.\n\nPara eu encontrar os melhores leads para a **${company?.name || 'sua empresa'}**, preciso entender seu negócio. Vamos fazer uma rápida entrevista de 5 passos?` },
  ])
  const [userInput, setUserInput] = useState('')
  const [selectedOptions, setSelectedOptions] = useState([])
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [answers, setAnswers] = useState({})
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])
  useEffect(() => { if (!loading && started) inputRef.current?.focus() }, [currentStep, loading, started])

  const addMessage = (role, content) => {
    setMessages(prev => [...prev, { id: prev.length + 1, role, content }])
  }

  const handleStart = () => {
    setStarted(true)
    const firstStep = PROFILE_STEPS[0]
    addMessage('assistant', `${firstStep.icon} **${firstStep.question}**`)
  }

  const handleOptionSelect = (option) => {
    const step = PROFILE_STEPS[currentStep]
    if (step.options) {
      setSelectedOptions(prev => prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option])
    } else {
      setSelectedOptions([option])
    }
  }

  const handleSend = async () => {
    const text = userInput.trim()
    const step = PROFILE_STEPS[currentStep]
    if (step.options && selectedOptions.length === 0 && !text) return
    if (!step.options && !text && step.id !== 'audience') return

    const answer = text || (step.options ? selectedOptions.join(', ') : '')
    setUserInput('')
    setSelectedOptions([])
    setShowCustomInput(false)
    addMessage('user', answer)
    setAnswers(prev => ({ ...prev, [step.id]: answer }))

    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    setLoading(false)

    if (currentStep < PROFILE_STEPS.length - 1) {
      const nextStep = PROFILE_STEPS[currentStep + 1]
      addMessage('assistant', `Entendi! ${nextStep.icon} **${nextStep.question}**`)
      setCurrentStep(prev => prev + 1)
    } else {
      addMessage('assistant', 'Perfeito! Salvando seu perfil de prospecção...')
      setCurrentStep(prev => prev + 1)
      setSaving(true)
      try {
        const profileData = {
          idealCustomerTypes: answers.segment || '',
          businessScope: answers.scope || 'LOCAL',
          baseCity: answers.baseCity || '',
          serviceTypes: answers.services || '',
          targetAudienceDesc: answers.audience || null,
          autoProspecting: true,
          existingProfile: false
        }
        await saveProspectingProfile(profileData)
        setProspectingProfileConfigured(true)
        addMessage('assistant', '✅ **Perfil configurado com sucesso!**\n\n🔍 O LeadsOn já está buscando leads compatíveis com seu negócio. Aguarde alguns minutos...')
        setTimeout(() => onComplete(), 1500)
      } catch (err) {
        addMessage('assistant', ' Houve um erro ao salvar. Tente novamente.')
      }
      setSaving(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading && !saving && !PROFILE_STEPS[currentStep]?.options) handleSend()
  }

  const isDone = currentStep >= PROFILE_STEPS.length
  const currentStepData = PROFILE_STEPS[currentStep]
  const canProceed = started && !isDone && (currentStepData?.options ? (selectedOptions.length > 0 || userInput.trim()) : (userInput.trim() || currentStepData?.id === 'audience'))

  return (
    <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl h-full flex flex-col bg-surface border border-border rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Sparkles size={20} className="text-accent" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary">Configurar Perfil de Prospecção</h2>
              <p className="text-xs text-text-secondary">{isDone ? 'Concluindo...' : started ? `Passo ${currentStep + 1} de ${PROFILE_STEPS.length}` : 'Entrevista rápida'}</p>
            </div>
          </div>
          {started && (
            <div className="mt-3 h-1.5 bg-overlay rounded-full overflow-hidden">
              <motion.div className="h-full rounded-full bg-accent" initial={{ width: '0%' }} animate={{ width: `${(currentStep / PROFILE_STEPS.length) * 100}%` }} transition={{ duration: 0.4 }} />
            </div>
          )}
        </div>

        {/* Chat */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 bg-accent text-white">P</div>
                )}
                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-accent text-white rounded-br-md' : 'bg-overlay text-text-primary rounded-bl-md'}`}>
                  {msg.content.split('\n').map((line, i) => (
                    <p key={i} className={i > 0 ? 'mt-1' : ''}>
                      {line.split(/(\*\*[^*]+\*\*)/).map((part, j) => part.startsWith('**') && part.endsWith('**') ? <strong key={j}>{part.slice(2, -2)}</strong> : part)}
                    </p>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {(loading || saving) && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5 justify-start">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-accent text-white"><Loader size={14} className="animate-spin" /></div>
              <div className="bg-overlay rounded-2xl rounded-bl-md px-4 py-2.5 flex gap-1.5">{[0, 0.15, 0.3].map((d, i) => (<div key={i} className="w-2 h-2 rounded-full bg-muted animate-bounce" style={{ animationDelay: `${d}s` }} />))}</div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Start button */}
        {!started && (
          <div className="px-5 pb-5">
            <button onClick={handleStart} className="w-full py-3 rounded-xl bg-accent text-white font-semibold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2">
              Vamos começar <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Options */}
        {started && currentStepData?.options && !isDone && (
          <div className="px-5 pb-3 grid grid-cols-2 gap-2">
            {currentStepData.options.map((opt) => (
              <button key={opt} onClick={() => handleOptionSelect(opt)} className={`p-3 rounded-xl text-xs font-medium border transition-all ${selectedOptions.includes(opt) ? 'border-accent bg-accent/10 text-accent' : 'border-border hover:border-border-strong'}`}>{opt}</button>
            ))}
            <button onClick={() => { setSelectedOptions([]); setShowCustomInput(true); setTimeout(() => inputRef.current?.focus(), 100) }} className={`col-span-2 p-3 rounded-xl text-xs font-medium border border-dashed transition-all ${showCustomInput ? 'border-accent bg-accent/5 text-accent' : 'border-border text-muted hover:border-border-strong'}`}>
              {showCustomInput && userInput.trim() ? `✏️ ${userInput}` : '✏️ Outra opção (digite)'}
            </button>
          </div>
        )}

        {/* Input */}
        {started && !isDone && (!currentStepData?.options || showCustomInput) && (
          <div className="px-5 pb-4 flex gap-2 bg-overlay border border-border rounded-2xl mx-5 mb-4 p-2">
            <input ref={inputRef} type="text" value={userInput} onChange={e => setUserInput(e.target.value)} onKeyPress={handleKeyPress} placeholder={currentStepData?.placeholder || 'Digite sua resposta...'} className="flex-1 bg-transparent text-text-primary placeholder-muted outline-none text-sm px-2" disabled={loading || saving} />
            <button onClick={handleSend} disabled={!userInput.trim() && PROFILE_STEPS[currentStep]?.id !== 'audience' || loading || saving} className="p-2 rounded-xl bg-accent text-white disabled:opacity-40 transition-all"><Send size={16} /></button>
          </div>
        )}

        {/* Confirm button for options steps */}
        {started && currentStepData?.options && !isDone && (
          <div className="px-5 pb-5">
            <button onClick={handleSend} disabled={(selectedOptions.length === 0 && !userInput.trim()) || loading || saving} className="w-full py-3 rounded-xl bg-accent text-white font-semibold text-sm disabled:opacity-40 transition-all flex items-center justify-center gap-2">
              Confirmar <ChevronRight size={16} />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

// Lead Card component
const LeadCard = ({ lead, isSelected, onClick }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border rounded-2xl p-4 cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'border-accent bg-accent/5 shadow-sm' 
          : 'border-border hover:border-border-strong bg-surface'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-text-primary truncate pr-2">{lead.nome_limpo || lead.nome}</h3>
        <ScoreBadge score={lead.score || 75} />
      </div>
      <p className="text-xs text-text-secondary mb-2">{lead.segmento || lead.segment}</p>
      <div className="flex items-center gap-3 text-xs text-muted mb-2">
        {lead.whatsapp && (
          <span className="flex items-center gap-1">
            <Phone size={12} />
            {lead.whatsapp.replace('55', '')}
          </span>
        )}
        {lead.cidade && (
          <span className="flex items-center gap-1">
            <MapPin size={12} />
            {lead.cidade}
          </span>
        )}
      </div>
      {lead.descricao || lead.motivo_match && (
        <p className="text-xs text-text-secondary border-t border-border pt-2 mt-1 line-clamp-2">
          {lead.descricao || lead.motivo_match}
        </p>
      )}
    </motion.div>
  )
}

// Detail Panel component
const DetailPanel = ({ lead, onClose, onAction }) => {
  const [copying, setCopying] = useState(false)

  const handleCopy = () => {
    if (lead.mensagem_personalizada) {
      navigator.clipboard.writeText(lead.mensagem_personalizada)
      setCopying(true)
      setTimeout(() => setCopying(false), 2000)
    }
  }

  const handleWhatsApp = () => {
    const phone = (lead.whatsapp || '').replace(/\D/g, '')
    const message = encodeURIComponent(lead.mensagem_personalizada || '')
    window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${message}`, '_blank')
    onAction?.('whatsapp', lead)
  }

  const handleConvert = () => {
    onAction?.('convert', lead)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className="fixed inset-y-0 right-0 w-full md:w-[420px] bg-bg border-l border-border z-50 overflow-y-auto shadow-2xl"
    >
      {/* Header */}
      <div className="sticky top-0 bg-bg/95 backdrop-blur-sm border-b border-border px-6 py-4 flex items-center justify-between">
        <h3 className="text-base font-bold text-text-primary">{lead.nome_limpo || lead.nome}</h3>
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <X size={18} className="text-muted" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-5">
        {/* Score & Segment */}
        <div className="flex items-center gap-3">
          <ScoreBadge score={lead.score || 75} />
          <span className="text-sm text-text-secondary">{lead.segmento || lead.segment}</span>
        </div>

        {/* Contact Info */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <Phone size={16} className="text-accent" />
            <span className="text-text-primary">{lead.whatsapp || 'Não informado'}</span>
          </div>
          {lead.email && (
            <div className="flex items-center gap-3 text-sm">
              <Mail size={16} className="text-accent" />
              <span className="text-text-primary">{lead.email}</span>
            </div>
          )}
          {lead.cidade && (
            <div className="flex items-center gap-3 text-sm">
              <MapPin size={16} className="text-accent" />
              <span className="text-text-primary">{lead.cidade}{lead.estado ? ` - ${lead.estado}` : ''}</span>
            </div>
          )}
        </div>

        {/* Why this lead */}
        {(lead.descricao || lead.motivo_match) && (
          <div className="bg-surface border border-border rounded-xl p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted mb-2">Por que este lead?</h4>
            <p className="text-sm text-text-secondary leading-relaxed">{lead.descricao || lead.motivo_match}</p>
          </div>
        )}

        {/* AI Message */}
        {lead.mensagem_personalizada && (
          <div className="bg-surface border border-accent/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-1.5">
                <Sparkles size={12} /> Mensagem gerada pela IA
              </h4>
              <button 
                onClick={handleCopy}
                className="text-xs text-muted hover:text-text-primary flex items-center gap-1 transition-colors"
              >
                {copying ? <CheckCircle size={12} className="text-emerald-500" /> : <Copy size={12} />}
                {copying ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
            <p className="text-sm text-text-primary leading-relaxed whitespace-pre-line italic">
              {lead.mensagem_personalizada}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleWhatsApp}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500 text-white font-semibold text-sm hover:bg-emerald-600 transition-colors"
          >
            <MessageCircle size={16} />
            WhatsApp
          </button>
          <button
            onClick={handleConvert}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-border text-text-primary font-semibold text-sm hover:bg-surface transition-colors"
          >
            <TrendingUp size={16} />
            Converter
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// Chat Message component
const ChatMessage = ({ message, isUser }) => (
  <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
    <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
      isUser 
        ? 'bg-surface border border-border text-text-primary rounded-br-md' 
        : 'bg-accent/10 text-text-primary rounded-bl-md'
    }`}>
      {message}
    </div>
  </div>
)

// Main Component
export default function ProspeccaoAI() {
  const { company, prospectingProfileConfigured, setProspectingProfileConfigured } = useAuth()
  const { toast } = useToast()
  const chatEndRef = useRef(null)

  // Profile check state
  const [profileChecked, setProfileChecked] = useState(false)
  const [showSetup, setShowSetup] = useState(false)

  // State
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedLead, setSelectedLead] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [justConfigured, setJustConfigured] = useState(false)
  
  // Chat state
  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', text: `Olá! Analisei o perfil da ${company?.name || 'sua empresa'} e preparei leads curados na sua região. São empresas que costumam contratar seus serviços e ainda não têm fornecedor fixo.` }
  ])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  // Filters from chat
  const [filters, setFilters] = useState({})

  // Check profile on mount
  useEffect(() => {
    const checkProfile = async () => {
      if (prospectingProfileConfigured !== null) {
        setShowSetup(!prospectingProfileConfigured)
        setProfileChecked(true)
        return
      }
      try {
        const profile = await fetchProspectingProfile()
        const configured = profile?.configured ?? false
        setProspectingProfileConfigured(configured)
        setShowSetup(!configured)
      } catch {
        setShowSetup(true)
      } finally {
        setProfileChecked(true)
      }
    }
    checkProfile()
  }, [])

  const handleSetupComplete = () => {
    setShowSetup(false)
    setJustConfigured(true)
    loadLeads()
    setTimeout(() => setJustConfigured(false), 5 * 60 * 1000)
  }

  // Load leads
  const loadLeads = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true)
      else setLoading(true)
      
      try {
        await fetch(`${API_URL}/leads/sync`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({})
        })
      } catch (syncErr) {
        console.warn('Sync com LeadsOn falhou, usando dados locais:', syncErr.message)
      }
      
      const data = await fetchCuratedLeads(filters)
      setLeads(data.leads || [])
    } catch (err) {
      toast({ message: err.message, type: 'error' })
      setLeads([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { if (profileChecked && !showSetup) loadLeads() }, [profileChecked, showSetup])

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  // Send chat message
  const handleSendChat = async () => {
    if (!chatInput.trim()) return
    
    const userMsg = chatInput.trim()
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }])
    setChatInput('')
    setChatLoading(true)

    try {
      const response = await sendChatMessage(userMsg, {
        companySegment: company?.segment,
        companyCity: company?.city
      })
      
      // Process AI response - might include filter updates
      if (response.filters) {
        setFilters(prev => ({ ...prev, ...response.filters }))
      }
      
      setChatMessages(prev => [...prev, { 
        role: 'ai', 
        text: response.message || 'Vou considerar isso na próxima curadoria de leads.' 
      }])
      
      // Reload leads with new filters
      if (response.filters) {
        loadLeads()
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { 
        role: 'ai', 
        text: 'Entendi! Vou considerar isso na próxima rodada de prospecção.' 
      }])
    } finally {
      setChatLoading(false)
    }
  }

  // Handle lead action
  const handleLeadAction = async (action, lead) => {
    if (action === 'whatsapp') {
      await updateLeadStatus(lead.id, 'CONTACTED')
      toast({ message: 'Lead marcado como contatado!', type: 'success' })
    }
    if (action === 'convert') {
      await updateLeadStatus(lead.id, 'CONVERTED')
      toast({ message: 'Lead convertido! 🎉', type: 'success' })
      setSelectedLead(null)
    }
  }

  // Last update time
  const lastUpdate = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  // Show setup chat if no profile
  if (showSetup) {
    return <ProfileSetupChat onComplete={handleSetupComplete} />
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-black font-display text-text-primary">Prospecção Inteligente</h1>
          <p className="text-sm text-text-secondary mt-1">Leads curados pela IA · Atualizados às {lastUpdate}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
            <Sparkles size={12} />
            {leads.length} prontos
          </span>
          <button
            onClick={() => loadLeads(true)}
            disabled={refreshing}
            className="p-2 rounded-xl border border-border hover:bg-surface transition-colors"
          >
            <RefreshCw size={16} className={`text-muted ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4 min-h-0">
        
        {/* Left: AI Chat Sidebar */}
        <div className="flex flex-col bg-surface border border-border rounded-2xl overflow-hidden">
          {/* Chat Header */}
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center">
                <Sparkles size={16} className="text-accent" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text-primary">Assistente de Prospecção</h3>
                <p className="text-[10px] text-muted">
                  Baseado em: {company?.name || 'seu perfil'}
                </p>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.map((msg, i) => (
              <ChatMessage key={i} message={msg.text} isUser={msg.role === 'user'} />
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-accent/10 px-4 py-3 rounded-2xl rounded-bl-md">
                  <Loader size={14} className="animate-spin text-accent" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div className="px-3 py-3 border-t border-border flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendChat()}
              placeholder="Pergunte sobre os leads..."
              className="flex-1 bg-bg border border-border rounded-xl px-3 py-2 text-sm text-text-primary outline-none focus:border-accent placeholder-muted"
            />
            <button
              onClick={handleSendChat}
              disabled={!chatInput.trim() || chatLoading}
              className="px-3 py-2 rounded-xl bg-accent text-white disabled:opacity-40 transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        </div>

        {/* Right: Leads List */}
        <div className="flex flex-col bg-surface border border-border rounded-2xl overflow-hidden">
          {/* List Header */}
          <div className="px-5 py-3 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-text-primary">Leads curados para você</h2>
            <div className="flex items-center gap-2">
              <button className="p-1.5 rounded-lg hover:bg-bg transition-colors">
                <Filter size={14} className="text-muted" />
              </button>
            </div>
          </div>

          {/* Leads */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader size={24} className="animate-spin text-accent" />
              </div>
            ) : leads.length === 0 ? (
              justConfigured ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12 px-6"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center">
                    <Sparkles size={28} className="text-accent animate-pulse" />
                  </div>
                  <h3 className="text-base font-bold text-text-primary mb-2">Estamos garimpando oportunidades para você!</h3>
                  <p className="text-sm text-text-secondary max-w-sm mx-auto leading-relaxed">
                    Em instantes, uma lista personalizada de empresas que combinam com seu perfil vai aparecer aqui. 
                    Enquanto isso, sinta-se à vontade para explorar o painel.
                  </p>
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted">
                    <Loader size={12} className="animate-spin" />
                    Buscando na sua região...
                  </div>
                </motion.div>
              ) : (
                <div className="text-center py-12">
                  <Building2 size={40} className="mx-auto text-muted mb-3" />
                  <p className="text-sm text-muted">Nenhum lead encontrado</p>
                  <p className="text-xs text-muted mt-1">Tente ajustar os filtros no chat</p>
                </div>
              )
            ) : (
              leads.map(lead => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  isSelected={selectedLead?.id === lead.id}
                  onClick={() => setSelectedLead(lead)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Detail Panel Overlay */}
      <AnimatePresence>
        {selectedLead && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setSelectedLead(null)}
            />
            <DetailPanel
              lead={selectedLead}
              onClose={() => setSelectedLead(null)}
              onAction={handleLeadAction}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
