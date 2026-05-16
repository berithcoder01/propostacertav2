import React from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, AlertCircle, XCircle, TrendingUp, Send, Phone, ArrowRight } from 'lucide-react';
import { fmt } from '../../../features/proposal/constants';

const LeadPipeline = ({ leads, onStatusChange, onSelectLead }) => {
  const stages = [
    { key: 'NEW', label: 'Novo', icon: Clock, color: 'text-blue-400', bg: 'bg-blue-400/15' },
    { key: 'CONTACTED', label: 'Contatado', icon: CheckCircle, color: 'text-yellow-400', bg: 'bg-yellow-400/15' },
    { key: 'NEGOTIATING', label: 'Negociação', icon: TrendingUp, color: 'text-orange-400', bg: 'bg-orange-400/15' },
    { key: 'CONVERTED', label: 'Convertido', icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/15' },
    { key: 'DISCARDED', label: 'Descartado', icon: XCircle, color: 'text-red-400', bg: 'bg-red-400/15' },
  ];

  const getStageCounts = (stageKey) => {
    return leads.filter(l => l.status === stageKey).length;
  };

  const nextStageMap = {
    NEW: 'CONTACTED',
    CONTACTED: 'NEGOTIATING',
    NEGOTIATING: 'CONVERTED',
  };

  const prevStageMap = {
    CONTACTED: 'NEW',
    NEGOTIATING: 'CONTACTED',
    CONVERTED: 'NEGOTIATING',
    DISCARDED: 'NEW',
  };

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-max">
        {stages.map((stage, idx) => {
          const stageLeads = leads.filter(l => l.status === stage.key);
          return (
            <div key={stage.key} className="flex-shrink-0 w-72">
              {/* Cabeçalho da coluna */}
              <div className={`${stage.bg} border border-border rounded-xl p-3 mb-3`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <stage.icon size={16} className={stage.color} />
                    <span className="text-sm font-bold text-white">{stage.label}</span>
                  </div>
                  <span className="text-xs font-bold bg-surface/50 text-muted px-2 py-0.5 rounded-full">
                    {stageLeads.length}
                  </span>
                </div>
              </div>

              {/* Leads */}
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {stageLeads.length === 0 ? (
                  <div className="text-center py-6 text-muted text-xs">
                    Nenhum lead nesta etapa
                  </div>
                ) : (
                  stageLeads.map((lead) => (
                    <motion.div
                      key={lead.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-surface border border-border rounded-xl p-3 hover:border-accent/30 transition-colors cursor-pointer"
                      onClick={() => onSelectLead(lead)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-bold text-white truncate">{lead.name}</div>
                          {(lead.city || lead.state) && (
                            <div className="text-[10px] text-muted flex items-center gap-1 mt-0.5">
                              <ArrowRight size={10} />
                              {[lead.city, lead.state].filter(Boolean).join(' - ')}
                            </div>
                          )}
                          {lead.distanceKm && (
                            <div className="text-[9px] text-muted">
                              {lead.distanceKm} km
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-1 ml-2 flex-shrink-0">
                          {nextStageMap[lead.status] && (
                            <button
                              onClick={(e) => { e.stopPropagation(); onStatusChange(lead.id, nextStageMap[lead.status]); }}
                              className="p-1 rounded-lg bg-accent/20 text-accent hover:bg-accent/30 transition-colors"
                              title="Avançar"
                            >
                              <ArrowRight size={12} />
                            </button>
                          )}
                          {prevStageMap[lead.status] && lead.status !== 'CONVERTED' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); onStatusChange(lead.id, prevStageMap[lead.status]); }}
                              className="p-1 rounded-lg bg-bg text-muted hover:text-white transition-colors"
                              title="Voltar etapa"
                            >
                              <ArrowRight size={12} className="rotate-180" />
                            </button>
                          )}
                          {lead.whatsapp && (
                            <button
                              onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/55${lead.whatsapp.replace(/\D/g, '')}`, '_blank'); }}
                              className="p-1 rounded-lg bg-[#25D366]/20 text-[#25D366] hover:bg-[#25D366]/30 transition-colors"
                              title="WhatsApp"
                            >
                              <Phone size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LeadPipeline;