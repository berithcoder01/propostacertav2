import React, { useState } from 'react';
import { Phone, MessageCircle, Copy, Check, Link as LinkIcon } from 'lucide-react';
import { shareProposal } from '../../../shared/services/api';
import { useToast } from '../../../shared/context/ToastContext';
import { fmt } from '../constants';

// NOTA: fetchClients NÃO é usado neste componente. Se necessário, adicionar ao api.js.

const QuickProposal = ({ proposal, className }) => {
  const [isSharing, setIsSharing] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const { toast } = useToast();

  const clientPhone = proposal?.clientPhone?.replace(/\D/g, '');
  const clientName = proposal?.clientName || 'Cliente';
  const proposalNumber = proposal?.number || '';
  const total = proposal?.total || 0;
  const object = proposal?.object || 'serviços';

  // Gera o link direto do WhatsApp com mensagem pré-formatada
  const generateWhatsAppLink = () => {
    const msg = `Olá${proposal?.clientContact ? `, ${proposal.clientContact}` : ''}!\n\nSegue a proposta comercial nº ${proposalNumber} referente a ${object},\nno valor de ${fmt(total)}.\n\nAcesse pelo link abaixo para visualizar:\n${proposal?.shareUrl || window.location.href}\n\nQualquer dúvida, estou à disposição!`;
    const encodedMsg = encodeURIComponent(msg);
    if (clientPhone) {
      return `https://wa.me/55${clientPhone}?text=${encodedMsg}`;
    }
    return `https://wa.me/?text=${encodedMsg}`;
  };

  // Gera link público da proposta (se disponível)
  const generateShareLink = async () => {
    if (proposal?.id) {
      try {
        setIsSharing(true);
        const result = await shareProposal(proposal.id);
        if (result.shareUrl) {
          return result.shareUrl;
        }
      } catch (err) {
        console.error('Erro ao gerar link:', err.message);
      } finally {
        setIsSharing(false);
      }
    }
    return window.location.href;
  };

  // Abre WhatsApp direto
  const handleWhatsAppClick = async () => {
    const link = await generateShareLink();
    const shareUrl = link;

    const msg = `Olá${proposal?.clientContact ? `, ${proposal.clientContact}` : ''}!\n\nSegue a proposta comercial nº ${proposalNumber} referente a ${object},\nno valor de ${fmt(total)}.\n\n📎 Acesse aqui: ${shareUrl}\n\nQualquer dúvida, estou à disposição!`;
    const encodedMsg = encodeURIComponent(msg);

    let waUrl;
    if (clientPhone) {
      waUrl = `https://wa.me/55${clientPhone}?text=${encodedMsg}`;
    } else {
      waUrl = `https://wa.me/?text=${encodedMsg}`;
    }

    window.open(waUrl, '_blank');
    toast({ message: 'WhatsApp aberto com sucesso!', type: 'success' });
  };

  // Copia o link de compartilhamento
  const handleCopyLink = async () => {
    const link = await generateShareLink();
    try {
      await navigator.clipboard.writeText(link);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
      toast({ message: 'Link copiado!', type: 'success' });
    } catch {
      toast({ message: 'Erro ao copiar link', type: 'error' });
    }
  };

  const shareUrl = proposal?.shareUrl || '';

  return (
    <div className={`bg-surface border-2 border-border rounded-2xl p-5 space-y-4 ${className || ''}`}>
      <div className="flex items-center gap-2 text-sm font-bold text-white">
        <LinkIcon size={16} className="text-accent" />
        Compartilhar Proposta
      </div>

      {/* Link público */}
      {shareUrl && (
        <div className="flex items-center gap-2 bg-bg/50 border border-border rounded-xl p-2">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 bg-transparent text-xs text-muted outline-none"
          />
          <button
            onClick={handleCopyLink}
            className="p-2 rounded-lg bg-accent/20 text-accent hover:bg-accent/30 transition-colors"
            title="Copiar link"
          >
            {copiedLink ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
      )}

      {/* Botões de ação */}
      <div className="flex gap-3">
        <button
          onClick={handleWhatsAppClick}
          disabled={isSharing}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] font-bold text-sm hover:bg-[#25D366]/30 transition-colors disabled:opacity-50"
        >
          {isSharing ? (
            <span className="w-4 h-4 border-2 border-[#25D366]/50 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Phone size={16} />
          )}
          WhatsApp
        </button>

        <button
          onClick={() => {
            const msg = `Proposta nº ${proposalNumber} - ${fmt(total)} - ${object}`;
            const encodedMsg = encodeURIComponent(msg);
            const smsUrl = clientPhone ? `sms:+55${clientPhone}?body=${encodedMsg}` : `sms:?body=${encodedMsg}`;
            window.open(smsUrl, '_blank');
          }}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-surface/50 border border-border text-muted font-bold text-sm hover:text-white hover:border-accent transition-colors"
        >
          <MessageCircle size={16} />
          SMS
        </button>
      </div>

      {/* Info */}
      <p className="text-[10px] text-muted text-center">
        O cliente receberá o link da proposta e poderá visualizá-la no navegador.
      </p>
    </div>
  );
};

export default QuickProposal;