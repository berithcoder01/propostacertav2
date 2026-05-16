import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, Mail, Phone, Loader, Sparkles } from 'lucide-react';
import { aiMessageTemplate, dispatchWhatsApp, dispatchEmail } from '../services/leadService';
import { useToast } from '../../../shared/context/ToastContext';

const MessageTemplateWidget = ({ lead, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState(null);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  const generateTemplates = async () => {
    if (!lead) return;
    setLoading(true);
    setError(null);
    try {
      const result = await aiMessageTemplate(
        lead.name,
        lead.segment,
        lead.companyName || 'Nossa Empresa',
        lead.city,
        'serviços especializados'
      );
      setTemplates(result);
    } catch (err) {
      setError('Erro ao gerar templates. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsApp = async () => {
    if (!templates?.whatsapp || !lead) return;
    try {
      const result = await dispatchWhatsApp(lead.id, templates.whatsapp);
      if (result.waUrl) {
        window.open(result.waUrl, '_blank');
        toast({ message: 'WhatsApp aberto com template!', type: 'success' });
        onClose();
      }
    } catch (err) {
      toast({ message: 'Erro ao abrir WhatsApp: ' + err.message, type: 'error' });
    }
  };

  const handleEmail = async () => {
    if (!templates?.email || !lead) return;
    try {
      const result = await dispatchEmail(lead.id, templates.email.subject, templates.email.body);
      if (result.mailtoUrl) {
        window.open(result.mailtoUrl, '_blank');
        toast({ message: 'E-mail aberto com template!', type: 'success' });
        onClose();
      }
    } catch (err) {
      toast({ message: 'Erro ao abrir e-mail: ' + err.message, type: 'error' });
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-surface border-2 border-border rounded-2xl p-6 max-w-md w-full max-h-[85vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Bot size={20} className="text-accent" />
              <h3 className="text-lg font-bold font-display text-white">Gerar Mensagem</h3>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl bg-bg text-muted hover:text-white transition-colors">
              ✕
            </button>
          </div>

          {/* Info do Lead */}
          {lead && (
            <div className="bg-bg border border-border rounded-xl p-3 mb-4">
              <p className="text-sm font-bold text-white">{lead.name}</p>
              <p className="text-[10px] text-muted">
                {lead.segment} · {lead.city || 'Sem cidade'} · {lead.status}
              </p>
            </div>
          )}

          {/* Botão gerar */}
          {!templates && !loading && !error && (
            <button
              onClick={generateTemplates}
              className="w-full py-3 rounded-xl bg-accent text-white font-bold flex items-center justify-center gap-2 hover:bg-accent/90 transition-colors"
            >
              <Sparkles size={18} />
              Gerar Template com IA
            </button>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center py-8">
              <Loader size={32} className="animate-spin text-accent mb-3" />
              <p className="text-sm text-muted">IA gerando mensagens personalizadas...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-danger/10 border border-danger/30 rounded-xl p-4 text-center">
              <p className="text-sm text-danger font-bold mb-2">{error}</p>
              <button onClick={generateTemplates} className="text-accent text-sm font-bold hover:underline">
                Tentar novamente
              </button>
            </div>
          )}

          {/* Templates gerados */}
          {templates && (
            <div className="space-y-4">
              {/* WhatsApp */}
              <div className="bg-bg border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-[#25D366]" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#25D366]">WhatsApp</span>
                  </div>
                  <button
                    onClick={handleWhatsApp}
                    className="px-3 py-1.5 rounded-lg bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] text-[10px] font-bold hover:bg-[#25D366]/30 transition-colors flex items-center gap-1"
                  >
                    <Send size={12} /> Enviar
                  </button>
                </div>
                <p className="text-sm text-muted bg-surface/50 rounded-lg p-3">{templates.whatsapp}</p>
              </div>

              {/* E-mail */}
              <div className="bg-bg border border-border rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-accent" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-accent">E-mail</span>
                  </div>
                  <button
                    onClick={handleEmail}
                    className="px-3 py-1.5 rounded-lg bg-accent/20 border border-accent/30 text-accent text-[10px] font-bold hover:bg-accent/30 transition-colors flex items-center gap-1"
                  >
                    <Send size={12} /> Enviar
                  </button>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-white">{templates.email?.subject}</p>
                  <p className="text-sm text-muted bg-surface/50 rounded-lg p-3">{templates.email?.body}</p>
                </div>
              </div>

              {/* Editar manualmente */}
              <div className="bg-surface/30 border border-border/50 rounded-xl p-4">
                <p className="text-[10px] text-muted mb-2">✏️ Personalize as mensagens acima antes de enviar.</p>
                <textarea
                  rows={3}
                  defaultValue={templates.whatsapp}
                  className="w-full bg-bg border border-border rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-accent resize-none"
                />
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MessageTemplateWidget;