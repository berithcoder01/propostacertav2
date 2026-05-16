import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, X, Minimize2, Maximize2, Loader } from 'lucide-react';
import { aiChat } from '../../../shared/services/api';
import { useToast } from '../../../shared/context/ToastContext';

export default function AiChatWidget({ proposalId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Olá! Sou seu assistente de orçamentos. Como posso ajudar com esta proposta hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await aiChat(newMessages, proposalId);
      setMessages([...newMessages, { role: 'assistant', content: response.content }]);
    } catch (err) {
      toast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-accent text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-50 border-4 border-surface"
      >
        <Bot size={28} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 md:w-96 h-[500px] bg-surface border border-border rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Header */}
      <div className="p-4 bg-bg border-b border-border flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Bot size={20} className="text-accent" />
          <span className="text-white font-bold font-display text-sm">Assistente IA</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-muted hover:text-white p-1">
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/5">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
              m.role === 'user' 
                ? 'bg-accent text-white rounded-tr-none' 
                : 'bg-bg border border-border text-white rounded-tl-none'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-bg border border-border text-white p-3 rounded-2xl rounded-tl-none animate-pulse">
              <Loader size={16} className="animate-spin" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 bg-bg border-t border-border flex gap-2">
        <input
          type="text"
          placeholder="Pergunte algo..."
          value={input}
          onChange={e => setInput(e.target.value)}
          className="flex-1 bg-surface border border-border rounded-xl px-3 py-2 text-sm text-white focus:border-accent outline-none"
        />
        <button 
          type="submit" 
          disabled={loading || !input.trim()}
          className="bg-accent2 text-bg p-2 rounded-xl disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
