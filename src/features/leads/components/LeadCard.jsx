import React from 'react';
import { Phone, Mail, MapPin, Clock, CheckCircle, XCircle, AlertCircle, TrendingUp, Send, MessageCircle } from 'lucide-react';
import { fmt } from '../../../features/proposal/constants';

const statusConfig = {
  NEW: { label: 'Novo', color: 'text-blue-400', bg: 'bg-blue-400/15', icon: Clock },
  CONTACTED: { label: 'Contatado', color: 'text-yellow-400', bg: 'bg-yellow-400/15', icon: CheckCircle },
  NEGOTIATING: { label: 'Em Negociação', color: 'text-orange-400', bg: 'bg-orange-400/15', icon: TrendingUp },
  DISCARDED: { label: 'Descartado', color: 'text-red-400', bg: 'bg-red-400/15', icon: XCircle },
  CONVERTED: { label: 'Convertido', color: 'text-green-400', bg: 'bg-green-400/15', icon: CheckCircle },
};

const segmentConfig = {
  RESIDENCIAL: { label: 'Residencial', color: 'text-blue-300', bg: 'bg-blue-500/10' },
  COMERCIAL: { label: 'Comercial', color: 'text-amber-300', bg: 'bg-amber-500/10' },
  INDUSTRIAL: { label: 'Industrial', color: 'text-orange-300', bg: 'bg-orange-500/10' },
  CONDOMINIO: { label: 'Condomínio', color: 'text-purple-300', bg: 'bg-purple-500/10' },
};

const LeadCard = ({ lead, compact = true, onClose, onAction }) => {
  if (!lead) return null;

  const statusInfo = statusConfig[lead.status] || statusConfig.NEW;
  const segmentInfo = segmentConfig[lead.segment] || segmentConfig.RESIDENCIAL;
  const StatusIcon = statusInfo.icon;

  const handleWhatsApp = (e) => {
    e.stopPropagation();
    if (onAction) onAction('whatsapp', lead);
  };

  const handleEmail = (e) => {
    e.stopPropagation();
    if (onAction) onAction('email', lead);
  };

  if (compact) {
    return (
      <div
        className="flex items-center justify-between p-4 border-b border-border/50 hover:bg-accent/5 transition-colors cursor-pointer group"
        onClick={() => onAction?.('select', lead)}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${segmentInfo.bg}`}>
            <span className="text-sm font-bold text-white">{lead.name?.charAt(0)?.toUpperCase()}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold text-white truncate">{lead.name}</div>
            <div className="text-[10px] text-muted truncate">
              {lead.city && `${lead.city}${lead.state ? ` - ${lead.state}` : ''}`}
              {lead.phone && ` · ${lead.phone}`}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${segmentInfo.bg} ${segmentInfo.color}`}>
            {segmentInfo.label}
          </span>
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 ml-1">
            {lead.whatsapp || lead.phone ? (
              <button onClick={handleWhatsApp} className="p-1 rounded-lg hover:bg-accent/20 text-muted hover:text-[#25D366]" title="WhatsApp">
                <MessageCircle size={14} />
              </button>
            ) : null}
            {lead.email ? (
              <button onClick={handleEmail} className="p-1 rounded-lg hover:bg-accent/20 text-muted hover:text-accent" title="E-mail">
                <Mail size={14} />
              </button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  // Full card view
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface border-2 border-border rounded-2xl p-6 space-y-5"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${segmentInfo.bg}`}>
            <span className="text-2xl font-black text-white">{lead.name?.charAt(0)?.toUpperCase()}</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{lead.name}</h3>
            <div className="flex gap-2 mt-1">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${segmentInfo.bg} ${segmentInfo.color}`}>
                {segmentInfo.label}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-xl bg-bg text-muted hover:text-white transition-colors">
          <XCircle size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        {lead.email && (
          <div className="flex items-center gap-2 text-muted">
            <Mail size={16} className="text-accent" />
            <span>{lead.email}</span>
          </div>
        )}
        {lead.phone && (
          <div className="flex items-center gap-2 text-muted">
            <Phone size={16} className="text-accent" />
            <span>{lead.phone}</span>
          </div>
        )}
        {lead.whatsapp && (
          <div className="flex items-center gap-2 text-muted">
            <MessageCircle size={16} className="text-[#25D366]" />
            <span>{lead.whatsapp}</span>
          </div>
        )}
        {(lead.city || lead.state) && (
          <div className="flex items-center gap-2 text-muted">
            <MapPin size={16} className="text-accent" />
            <span>{[lead.city, lead.state].filter(Boolean).join(' - ')}</span>
          </div>
        )}
        {lead.distanceKm && (
          <div className="flex items-center gap-2 text-muted">
            <TrendingUp size={16} className="text-accent" />
            <span>{lead.distanceKm} km de distância</span>
          </div>
        )}
        {lead.source && (
          <div className="flex items-center gap-2 text-muted">
            <AlertCircle size={16} className="text-accent" />
            <span className="capitalize">Fonte: {lead.source.toLowerCase().replace('_', ' ')}</span>
          </div>
        )}
      </div>

      {lead.address && (
        <div className="bg-bg border border-border rounded-xl p-3 text-sm text-muted">
          <strong className="text-white">Endereço:</strong> {lead.address}
        </div>
      )}

      {lead.notes && (
        <div className="bg-bg border border-border rounded-xl p-3 text-sm text-muted">
          <strong className="text-white">Notas:</strong> {lead.notes}
        </div>
      )}

       <div className="flex gap-2 pt-2">
         {(lead.whatsapp || lead.phone) && (
           <button
             onClick={handleWhatsApp}
             className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#25D366]/20 border border-[#25D366]/30 text-[#25D366] font-bold text-sm hover:bg-[#25D366]/30 transition-colors"
           >
             <MessageCircle size={16} /> WhatsApp
           </button>
         )}
         {lead.email && (
           <button
             onClick={handleEmail}
             className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-surface border border-border text-muted font-bold text-sm hover:text-white hover:border-accent transition-colors"
           >
             <Mail size={16} /> E-mail
           </button>
         )}
         {/* Botão para criar proposta a partir do lead */}
         <button
           onClick={(e) => {
             e.stopPropagation();
             if (onAction) onAction('create-proposal', lead);
           }}
           className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-500 font-bold text-sm hover:bg-indigo-500/30 transition-colors"
         >
           <Send size={16} /> Criar Proposta
         </button>
       </div>
    </motion.div>
  );
};

export default LeadCard;