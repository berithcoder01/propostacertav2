import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ArrowRight, X } from 'lucide-react';
import Button from '../../shared/Button';

const UpgradeModal = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center px-4 sm:px-0"
        onClick={onClose}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Sheet */}
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative w-full max-w-lg bg-surface border-t border-border rounded-t-3xl sm:rounded-2xl p-6 space-y-6 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-muted hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          {/* Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center">
              <Zap size={32} className="text-accent" />
            </div>
          </div>

          <div className="text-center space-y-2">
            <h3 className="text-xl font-bold font-display text-text-primary">
              Desbloqueie a Inteligência Artificial
            </h3>
            <p className="text-sm text-muted leading-relaxed">
              O plano <strong className="text-accent">PRO</strong> inclui acesso a ferramentas de IA que vão
              <br />
              revolucionar como você trabalha:
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3 bg-bg rounded-2xl p-4">
            {[
              '🤖 Geração automática de propostas com IA',
              '💡 Sugestões inteligentes de itens e serviços',
              '🔍 Pesquisa de preços com IA',
              '📋 Follow-up automático de propostas',
              '🏷️ White Label (logo + cores personalizadas)',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                </div>
                <span className="text-sm text-text-secondary">{feature}</span>
              </div>
            ))}
          </div>

          {/* Pricing note */}
          <div className="text-center bg-gold/10 border border-gold/20 rounded-2xl p-4">
            <p className="text-sm font-bold text-gold">
              Apenas R$ 29,90/mês
            </p>
            <p className="text-[10px] text-muted mt-1">
              Sem compromisso de fidelidade · Cancele quando quiser
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={onClose}
              className="flex-1"
            >
              Continuar sem IA
            </Button>
            <Button
              onClick={() => {
                onClose();
                window.location.href = '/plans';
              }}
              className="flex-1 flex items-center justify-center gap-2"
            >
              <ArrowRight size={16} />
              Fazer Upgrade
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UpgradeModal;