import React from 'react';
import { BarChart2, TrendingUp, Clock, Users, CheckCircle, AlertTriangle } from 'lucide-react';
import { fmt } from '../../../features/proposal/constants';

const WeeklyReport = ({ data }) => {
  if (!data) return null;

  const {
    period = {},
    totalNewLeads = 0,
    leadsBySegment = [],
    leadsByStatus = [],
    topLeads = []
  } = data;

  const statusColors = {
    NEW: 'bg-blue-400/15 text-blue-400',
    CONTACTED: 'bg-yellow-400/15 text-yellow-400',
    NEGOTIATING: 'bg-orange-400/15 text-orange-400',
    DISCARDED: 'bg-red-400/15 text-red-400',
    CONVERTED: 'bg-green-400/15 text-green-400',
  };

  const segmentColors = {
    RESIDENCIAL: 'bg-blue-500/10 text-blue-300',
    COMERCIAL: 'bg-amber-500/10 text-amber-300',
    INDUSTRIAL: 'bg-orange-500/10 text-orange-300',
    CONDOMINIO: 'bg-purple-500/10 text-purple-300',
  };

  return (
    <div className="space-y-5">
      {/* Período */}
      <div className="text-center">
        <h4 className="text-sm font-bold text-accent2">
          {new Date(period.from).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} —{' '}
          {new Date(period.to).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
        </h4>
      </div>

      {/* Total */}
      <div className="bg-bg border border-border rounded-xl p-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <BarChart2 size={20} className="text-accent" />
          <span className="text-3xl font-black font-display text-white">{totalNewLeads}</span>
        </div>
        <p className="text-[10px] text-muted uppercase tracking-wider mt-1">Novos Leads no Período</p>
      </div>

      {/* Por Segmento */}
      <div className="bg-bg border border-border rounded-xl p-4 space-y-3">
        <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Por Segmento</p>
        {leadsBySegment.length === 0 ? (
          <p className="text-sm text-muted text-center py-2">Sem dados</p>
        ) : (
          <div className="space-y-2">
            {leadsBySegment.map((item) => (
              <div key={item.segment} className="flex items-center justify-between">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${segmentColors[item.segment] || 'bg-bg text-muted'}`}>
                  {item.segment}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max((item.count / Math.max(totalNewLeads, 1)) * 100, 5)}%`,
                        background: 'var(--accent-color, #E87722)'
                      }}
                    />
                  </div>
                  <span className="text-sm font-bold text-white w-6 text-right">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Por Status */}
      <div className="bg-bg border border-border rounded-xl p-4 space-y-3">
        <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Por Status</p>
        {leadsByStatus.length === 0 ? (
          <p className="text-sm text-muted text-center py-2">Sem dados</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {leadsByStatus.map((item) => (
              <div key={item.status} className={`rounded-xl p-3 text-center ${statusColors[item.status] || 'bg-bg text-muted'}`}>
                <div className={`text-sm font-bold`}>{item.count}</div>
                <div className={`text-[9px] font-bold uppercase tracking-wider mt-0.5`}>{item.status}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top 5 Leads */}
      <div className="bg-bg border border-border rounded-xl p-4 space-y-3">
        <p className="text-[10px] font-bold text-muted uppercase tracking-wider flex items-center gap-2">
          <Users size={14} /> Top 5 Leads Recentes
        </p>
        {topLeads.length === 0 ? (
          <p className="text-sm text-muted text-center py-2">Nenhum lead recente</p>
        ) : (
          <div className="space-y-2">
            {topLeads.map((lead, idx) => (
              <div key={lead.id} className="flex items-center gap-3 p-2 rounded-lg bg-surface/50 border border-border">
                <span className="text-sm font-bold text-accent2 w-5">{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white truncate">{lead.name}</div>
                  <div className="text-[10px] text-muted">
                    {lead.segment} · {lead.city || 'Sem cidade'} · {lead.status}
                  </div>
                </div>
                <Clock size={14} className="text-muted flex-shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyReport;