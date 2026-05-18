import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader, ArrowRight, Building2, CheckCircle } from 'lucide-react';
import Button from '../../shared/Button';

const OnboardingConversacional = ({ onNext, onBack, formData, update }) => {
  const [turn, setTurn] = useState('name'); // 'name' | 'done'
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'Olá! 👋 Bem-vindo ao PropostaCerta.',
    },
    {
      id: 2,
      role: 'assistant',
      content: '**Qual é o nome da sua empresa?**',
    },
  ]);

  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (turn === 'name') {
      inputRef.current?.focus();
    }
  }, [turn]);

  const addMessage = (role, content) => {
    setMessages(prev => [...prev, { id: prev.length + 1, role, content }]);
  };

  const handleSend = async () => {
    const text = userInput.trim();
    if (!text || loading) return;

    setUserInput('');
    addMessage('user', text);

    if (turn === 'name') {
      update('name', text);
      update('segment', 'GERAL'); // Define segmento padrão já que unificamos a plataforma
      
      setLoading(true);
      await new Promise(r => setTimeout(r, 600)); // pequeno delay para simular processamento
      setLoading(false);
      
      addMessage('assistant', `Excelente, **${text}** registrada com sucesso! 🏢\n\nSua plataforma está pronta. Pode continuar para personalizar as cores da sua marca. 🎨`);
      setTurn('done');
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
          {turn === 'name' ? 'Passo único — Nome da empresa' : 'Configuração concluída ✅'}
        </p>
        <div className="h-1 bg-overlay rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'var(--primary)' }}
            initial={{ width: '0%' }}
            animate={{ width: turn === 'name' ? '50%' : '100%' }}
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

      {/* Input */}
      {turn !== 'done' && (
        <div className="flex gap-2 bg-overlay border border-border rounded-2xl p-2.5">
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ex.: Auto Peças São João..."
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
