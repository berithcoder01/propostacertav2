import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader, Mic, MicOff, ArrowRight, CheckCircle, Building2, Briefcase } from 'lucide-react';
import Button from '../../shared/Button';

const SEGMENT_LABELS = {
  ELETRICA: { label: 'Elétrica', emoji: '⚡' },
  CONSTRUCAO_CIVIL: { label: 'Construção Civil', emoji: '🏗️' },
  HIDRAULICA: { label: 'Hidráulica', emoji: '🔧' },
  PINTURA: { label: 'Pintura', emoji: '🎨' },
  AR_CONDICIONADO: { label: 'Ar Condicionado', emoji: '❄️' },
  OUTRO: { label: 'Outro', emoji: '🔨' },
};

const BUSINESS_TYPE_LABELS = {
  SERVICE_ONLY: { label: 'Prestação de Serviços', emoji: '🛠️' },
  PRODUCT_ONLY: { label: 'Venda de Produtos', emoji: '📦' },
  HYBRID: { label: 'Serviços + Produtos', emoji: '🔀' },
};

/**
 * OnboardingConversacional — Fluxo em 2 turnos:
 * 1. Pergunta o nome da empresa
 * 2. Pede descrição → IA classifica segmento + businessType
 */
const OnboardingConversacional = ({ onNext, onBack, formData, update }) => {
  const [turn, setTurn] = useState('name'); // 'name' | 'description' | 'done'
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'Olá! 👋 Bem-vindo ao PropostaCerta. Vamos configurar seu negócio em dois passos.',
    },
    {
      id: 2,
      role: 'assistant',
      content: '**Qual é o nome da sua empresa?**',
    },
  ]);

  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [detectedData, setDetectedData] = useState(null);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [turn]);

  // Web Speech API
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = 'pt-BR';
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.onresult = (e) => {
      setUserInput(Array.from(e.results).map(r => r[0].transcript).join(''));
      setIsListening(false);
    };
    recognitionRef.current.onerror = () => setIsListening(false);
    recognitionRef.current.onend = () => setIsListening(false);
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) { recognitionRef.current.stop(); setIsListening(false); }
    else { setUserInput(''); recognitionRef.current.start(); setIsListening(true); }
  };

  const addMessage = (role, content, extra = {}) => {
    setMessages(prev => [...prev, { id: prev.length + 1, role, content, ...extra }]);
  };

  const handleSend = async () => {
    const text = userInput.trim();
    if (!text || loading) return;

    setUserInput('');
    setError(null);
    addMessage('user', text);

    // Turno 1: captura o nome
    if (turn === 'name') {
      update('name', text);
      setLoading(true);
      await new Promise(r => setTimeout(r, 400)); // pequeno delay para UX
      setLoading(false);
      addMessage('assistant', `Ótimo, **${text}**! 🏢\n\nAgora descreva brevemente o que seu negócio faz. Por exemplo: *"instalação e manutenção de ar condicionado"*, *"venda de materiais elétricos"*, *"construção civil e reformas"*.`);
      setTurn('description');
      return;
    }

    // Turno 2: classifica segmento + businessType
    if (turn === 'description') {
      setLoading(true);
      try {
        const token = localStorage.getItem('@propostacerta:token');
        const response = await fetch('/api/ai/business-type/classify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ description: text }),
        });

        if (!response.ok) throw new Error('Erro ao classificar negócio');

        const result = await response.json();
        const { businessType, segment, confidence, reasoning } = result;

        // Salva no formData
        update('businessType', businessType);
        update('segment', segment || 'OUTRO');

        setDetectedData({ businessType, segment: segment || 'OUTRO', confidence, reasoning });

        const segInfo = SEGMENT_LABELS[segment] || SEGMENT_LABELS.OUTRO;
        const typeInfo = BUSINESS_TYPE_LABELS[businessType] || BUSINESS_TYPE_LABELS.SERVICE_ONLY;

        addMessage('assistant',
          `Perfeito! Identifiquei seu negócio como:\n\n${segInfo.emoji} **Segmento:** ${segInfo.label}\n${typeInfo.emoji} **Tipo:** ${typeInfo.label}\n\n${reasoning || 'Configuração personalizada aplicada!'}\n\nPode continuar para personalizar as cores da sua marca. 🎨`,
          { isResult: true, detectedData: { businessType, segment: segment || 'OUTRO', confidence } }
        );
        setTurn('done');
      } catch (err) {
        setError('Não consegui identificar automaticamente. Tente descrever de outra forma.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) handleSend();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 h-full flex flex-col"
    >
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold font-display text-text-primary">Seu Negócio</h2>
        <p className="text-xs text-text-secondary">
          {turn === 'name' && 'Passo 1 de 2 — Nome da empresa'}
          {turn === 'description' && 'Passo 2 de 2 — Descrição do negócio'}
          {turn === 'done' && 'Classificação concluída ✅'}
        </p>
        {/* Progress bar */}
        <div className="h-1 bg-overlay rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'var(--primary)' }}
            initial={{ width: '0%' }}
            animate={{ width: turn === 'name' ? '33%' : turn === 'description' ? '66%' : '100%' }}
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
              <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                ? 'text-white rounded-br-none'
                : 'bg-overlay text-text-primary rounded-bl-none'
                }`}
                style={msg.role === 'user' ? { background: 'var(--primary)' } : {}}>
                {/* Renderiza markdown básico: **negrito** */}
                {msg.content.split('\n').map((line, i) => (
                  <p key={i} className={i > 0 ? 'mt-1' : ''}>
                    {line.split(/(\*\*[^*]+\*\*)/).map((part, j) =>
                      part.startsWith('**') && part.endsWith('**')
                        ? <strong key={j}>{part.slice(2, -2)}</strong>
                        : part
                    )}
                  </p>
                ))}

                {/* Card de resultado */}
                {msg.isResult && msg.detectedData && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-3 pt-3 border-t border-white/20 grid grid-cols-2 gap-2"
                  >
                    <div className="bg-white/10 rounded-lg p-2 flex items-center gap-1.5">
                      <Building2 size={13} />
                      <span className="text-[11px] font-semibold">
                        {SEGMENT_LABELS[msg.detectedData.segment]?.label || 'Outro'}
                      </span>
                    </div>
                    <div className="bg-white/10 rounded-lg p-2 flex items-center gap-1.5">
                      <Briefcase size={13} />
                      <span className="text-[11px] font-semibold">
                        {BUSINESS_TYPE_LABELS[msg.detectedData.businessType]?.label || 'Serviços'}
                      </span>
                    </div>
                    <div className="col-span-2 bg-white/10 rounded-lg p-2 flex items-center gap-1.5">
                      <CheckCircle size={13} />
                      <span className="text-[11px]">
                        Confiança: {Math.round((msg.detectedData.confidence || 0) * 100)}%
                      </span>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Loading dots */}
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

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="text-sm text-danger bg-danger/10 border border-danger/20 rounded-xl px-3 py-2"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      {turn !== 'done' && (
        <div className="flex gap-2 bg-overlay border border-border rounded-2xl p-2.5">
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={turn === 'name' ? 'Ex.: Onix Instalações...' : 'Ex.: instalação de ar condicionado...'}
            className="flex-1 bg-transparent text-text-primary placeholder-muted outline-none text-sm px-1"
            disabled={loading}
          />
          {(window.SpeechRecognition || window.webkitSpeechRecognition) && (
            <button
              onClick={toggleListening}
              className={`p-1.5 rounded-lg transition-all ${isListening ? 'text-white' : 'text-muted hover:text-text-primary'}`}
              style={isListening ? { background: 'var(--primary)' } : {}}
              disabled={loading}
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
          )}
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
          {turn !== 'done' && (
            <Button variant="ghost" onClick={() => {
              update('name', formData.name || '');
              update('segment', 'OUTRO');
              update('businessType', 'SERVICE_ONLY');
              onNext();
            }} disabled={loading}>
              Pular
            </Button>
          )}
          {turn === 'done' && (
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
