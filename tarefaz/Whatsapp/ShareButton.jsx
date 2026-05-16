/**
 * ShareButton.jsx — versão atualizada (Fase 13)
 *
 * Adiciona um preview da mensagem WhatsApp antes de abrir o app.
 * Substitui o arquivo original em:
 *   app/src/features/proposal/components/ShareButton.jsx
 */

import React, { useState } from 'react';
import { Share2, Loader } from 'lucide-react';
import { shareProposal } from '../../../shared/services/api';
import { useToast } from '../../../shared/context/ToastContext';
import WhatsAppPreviewModal from './WhatsAppPreviewModal';

export default function ShareButton({ proposalId, clientName, className, variant = 'primary' }) {
  const [isSharing, setIsSharing] = useState(false);
  const [preview, setPreview] = useState(null); // { waUrl, msg }
  const { toast } = useToast();

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const { waUrl, msg } = await shareProposal(proposalId);
      // Exibe o preview em vez de abrir direto
      setPreview({ waUrl, msg });
    } catch (err) {
      toast({ message: err.message || 'Erro ao gerar mensagem WhatsApp.', type: 'error' });
      console.error(err);
    } finally {
      setIsSharing(false);
    }
  };

  const baseClasses = 'flex items-center justify-center gap-2 font-bold transition-all';
  const variants = {
    primary: 'w-full py-4 rounded-2xl bg-surface border-2 border-border text-white hover:border-accent/50',
    green: 'w-full py-4 rounded-2xl bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] hover:bg-[#25D366]/30',
    ghost: 'px-3 py-2 text-sm text-muted hover:text-white rounded-xl hover:bg-white/5',
    icon: 'py-2.5 px-3 rounded-xl bg-[#25D366]/10 border border-[#25D366]/30 text-[#25D366] hover:bg-[#25D366]/20',
  };

  return (
    <>
      <button
        onClick={handleShare}
        disabled={isSharing}
        className={`${baseClasses} ${variants[variant] || variants.primary} ${className || ''}`}
        title="Enviar via WhatsApp"
      >
        {isSharing
          ? <Loader size={13} className="animate-spin" />
          : <Share2 size={13} />
        }
        {(variant === 'primary' || variant === 'green') ? 'Enviar via WhatsApp'
          : variant === 'ghost' ? 'Compartilhar'
          : null}
      </button>

      {preview && (
        <WhatsAppPreviewModal
          msg={preview.msg}
          waUrl={preview.waUrl}
          clientName={clientName}
          onClose={() => setPreview(null)}
        />
      )}
    </>
  );
}
