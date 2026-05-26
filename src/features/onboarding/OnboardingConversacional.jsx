import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader, ArrowRight, Building2, CheckCircle, MapPin, Users, Wrench } from 'lucide-react';
import Button from '../../shared/Button';

const STEPS = [
  { id: 'segment', question: 'Qual é o segmento principal da sua empresa?', icon: '🏗️', options: ['Elétrica', 'Construção Civil', 'Hidráulica', 'Pintura', 'Ar Condicionado', 'Outro'] },
  { id: 'idealCustomer', question: 'Quem é seu cliente ideal? (Selecione todos que se aplicam)', icon: '🎯', options: ['Residencial (Casas/Apartamentos)', 'Comercial (Lojas/Escritórios)', 'Condomínios', 'Indústrias', 'Imobiliárias'] },
  { id: 'radius', question: 'Qual é o raio de atuação da sua empresa?', icon: '📍', placeholder: 'Ex.: 10, 20, 50 km' },
  { id: 'services', question: 'Quais serviços você oferece? (Selecione os principais)', icon: '🔧', options: ['Instalação', 'Manutenção Preventiva', 'Reforma/Reparo', 'Projetos', 'Consultoria', 'Emergência 24h'] },
  { id: 'audience', question: 'Descreva brevemente seu público-alvo (opcional)', icon: '👥', placeholder: 'Ex.: Condomínios de médio porte em Maringá...' },
];

const OnboardingConversacional = ({ onNext, onBack, formData, update }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', content: 'Olá!  Bem-vindo ao PropostaCerta.\n\nPara eu encontrar os **melhores leads** para você, preciso entender seu negócio. Vamos fazer uma rápida entrevista?' },
  ]);

  const [userInput, setUserInput] = useState('');
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!loading) inputRef.current?.focus();
  }, [currentStep, loading]);

  const addMessage = (role, content) => {
    setMessages(prev => [...prev, { id: prev.length + 1, role, content }]);
  };

  const handleOptionSelect = (option) => {
    const step = STEPS[currentStep];
    if (step.options) {
      // Multi-select
      setSelectedOptions(prev => 
        prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]
      );
    } else {
      // Single select (radio style)
      setSelectedOptions([option]);
    }
  };

  const handleSend = async () => {
    const text = userInput.trim();
    const step = STEPS[currentStep];
    
    // Validation
    if (step.options && selectedOptions.length === 0 && !text) return;
    if (!step.options && !text) return;

    const answer = step.options ? selectedOptions.join(', ') : text;
    setUserInput('');
    setSelectedOptions([]);
    addMessage('user', answer);

    // Save to formData
    if (step.id === 'segment') update('segment', answer);
    if (step.id === 'idealCustomer') update('idealCustomerTypes', answer);
    if (step.id === 'radius') update('serviceRadiusKm', parseInt(text) || 10);
    if (step.id === 'services') update('serviceTypes', answer);
    if (step.id === 'audience') update('targetAudienceDesc', answer);

    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setLoading(false);

    if (currentStep < STEPS.length - 1) {
      const nextStep = STEPS[currentStep + 1];
      addMessage('assistant', `Entendi! ${nextStep.icon} **${nextStep.question}**`);
      setCurrentStep(prev => prev + 1);
    } else {
      addMessage('assistant', 'Perfeito! 🎉 Coletamos todas as informações necessárias.\n\nAgora vou gerar seu **Perfil de Prospecção** para encontrar leads que realmente combinam com seu negócio. Pode continuar para personalizar sua marca! 🎨');
      setCurrentStep(prev => prev + 1); // Done state
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading && !STEPS[currentStep]?.options) handleSend();
  };

  const isDone = currentStep >= STEPS.length;
  const currentStepData = STEPS[currentStep];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 h-full flex flex-col"
    >
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold font-display text-text-primary">Perfil de Prospecção</h2>
        <p className="text-xs text-text-secondary">
          {isDone ? 'Entrevista concluída ✅' : `Passo ${currentStep + 1} de ${STEPS.length}`}
        </p>
        <div className="h-1 bg-overlay rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'var(--primary)' }}
            initial={{ width: '0%' }}
            animate={{ width: `${(currentStep / STEPS.length) * 100}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 bg-surface border border-border rounded-2xl p-4 space-y-3 overflow-y-auto min-h-[240px]">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: 'var(--primary)', color: '#fff' }}>
                  P
                </div>
              )}
              <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                ? 'text-white rounded-br-none'
                : 'bg-overlay text-text-primary rounded-bl-none'
                }`}
                style={msg.role === 'user' ? { background: 'var(--primary)' } : {}}>
                {msg.content.split('\n').map((line, i) => (
                  <p key={i} className={i > 0 ? 'mt-1' : ''}>
                    {line.split(/(\*\*[^*]+\*\*)/).map((part, j) =>
                      part.startsWith('**') && part.endsWith('**')
                        ? <strong key={j}>{part.slice(2, -2)}</strong>
                        : part
                    )}
                  </p>
                ))}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 justify-start">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: 'var(--primary)', color: '#fff' }}>
              <Loader size={14} className="animate-spin" />
            </div>
            <div className="bg-overlay rounded-2xl rounded-bl-none px-3 py-2 flex gap-1">
              {[0, 0.15, 0.3].map((delay, i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-muted animate-bounce"
                  style={{ animationDelay: `${delay}s` }} />
              ))}
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Options Grid (if applicable) */}
      {currentStepData?.options && !isDone && (
        <div className="grid grid-cols-2 gap-2">
          {currentStepData.options.map((opt) => {
            const isSelected = selectedOptions.includes(opt);
            return (
              <button
                key={opt}
                onClick={() => handleOptionSelect(opt)}
                className={`p-2.5 rounded-xl text-xs font-medium border transition-all ${
                  isSelected 
                    ? 'border-accent bg-accent/10 text-accent' 
                    : 'border-border bg-surface text-text-secondary hover:border-border-strong'
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      )}

      {/* Input */}
      {!isDone && !currentStepData?.options && (
        <div className="flex gap-2 bg-overlay border border-border rounded-2xl p-2.5">
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={currentStepData?.placeholder || 'Digite sua resposta...'}
            className="flex-1 bg-transparent text-text-primary placeholder-muted outline-none text-sm px-1"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={!userInput.trim() || loading}
            className="p-1.5 rounded-lg text-white transition-all disabled:opacity-40"
            style={{ background: 'var(--primary)' }}
          >
            <Send size={16} />
          </button>
        </div>
      )}

      {/* Navegação */}
      <div className="flex justify-between pt-2 border-t border-border">
        <Button variant="ghost" onClick={onBack} disabled={loading}>
          Voltar
        </Button>
        <div className="flex gap-2">
          {isDone && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <Button onClick={onNext} className="flex items-center gap-2">
                Continuar <ArrowRight size={16} />
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default OnboardingConversacional;
