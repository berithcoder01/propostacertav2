import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Search, Filter, ChevronDown } from 'lucide-react';

// Gera cores em gradiente baseado na densidade
const getHeatColor = (count, maxCount) => {
  if (maxCount === 0) return 'bg-gray-800/30';
  const ratio = count / maxCount;
  if (ratio === 0) return 'bg-gray-800/20';
  if (ratio < 0.2) return 'bg-green-500/20';
  if (ratio < 0.4) return 'bg-green-400/30';
  if (ratio < 0.6) return 'bg-yellow-400/40';
  if (ratio < 0.8) return 'bg-orange-500/50';
  return 'bg-red-500/60';
};

const getTextColor = (count, maxCount) => {
  if (maxCount === 0) return 'text-muted';
  const ratio = count / maxCount;
  if (ratio < 0.4) return 'text-green-300';
  if (ratio < 0.6) return 'text-yellow-300';
  return 'text-red-300';
};

const LeadHeatmap = ({ leads, onRegionClick }) => {
  const [filterState, setFilterState] = useState('ALL');

  const filteredLeads = useMemo(() => {
    if (filterState === 'ALL') return leads;
    return leads.filter(l => l.state === filterState);
  }, [leads, filterState]);

  // Agrupa leads por cidade+estado
  const regionData = useMemo(() => {
    const map = {};
    filteredLeads.forEach(lead => {
      const key = `${lead.city || 'Sem cidade'} - ${lead.state || '--'}`;
      if (!map[key]) {
        map[key] = {
          city: lead.city || 'Sem cidade',
          state: lead.state || '--',
          count: 0,
          leads: [],
          lat: lead.lat,
          lng: lead.lng
        };
      }
      map[key].count++;
      map[key].leads.push(lead);
    });
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [filteredLeads]);

  const maxCount = useMemo(() => {
    return regionData.reduce((max, r) => Math.max(max, r.count), 0);
  }, [regionData]);

  // Agrupa por estado para filtro
  const states = useMemo(() => {
    const unique = [...new Set(leads.map(l => l.state).filter(Boolean))].sort();
    return unique;
  }, [leads]);

  // Estatísticas
  const totalLeads = filteredLeads.length;
  const citiesCount = regionData.length;
  const avgPerCity = citiesCount > 0 ? (totalLeads / citiesCount).toFixed(1) : 0;
  const topRegion = regionData[0];

  return (
    <motion.div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h3 className="text-sm font-bold font-display text-white">Mapa de Calor de Leads</h3>
          <p className="text-[10px] text-muted">Distribuição geográfica de leads por cidade</p>
        </div>
        <div className="flex gap-2 items-center">
          <select
            value={filterState}
            onChange={e => setFilterState(e.target.value)}
            className="bg-bg border border-border rounded-lg px-3 py-1.5 text-[10px] text-white outline-none focus:border-accent"
          >
            <option value="ALL">Todos estados</option>
            {states.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats rápidos */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-bg border border-border rounded-xl p-3 text-center">
          <div className="text-xl font-black font-display text-white">{totalLeads}</div>
          <div className="text-[9px] text-muted uppercase tracking-wider">Leads</div>
        </div>
        <div className="bg-bg border border-border rounded-xl p-3 text-center">
          <div className="text-xl font-black font-display text-white">{citiesCount}</div>
          <div className="text-[9px] text-muted uppercase tracking-wider">Cidades</div>
        </div>
        <div className="bg-bg border border-border rounded-xl p-3 text-center">
          <div className="text-xl font-black font-display text-white">{avgPerCity}</div>
          <div className="text-[9px] text-muted uppercase tracking-wider">Média/Cidade</div>
        </div>
      </div>

      {/* Top Region */}
      {topRegion && (
        <div className="bg-accent/5 border border-accent/30 rounded-xl p-3 flex items-center gap-3">
          <MapPin size={20} className="text-accent flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-white">
              {topRegion.city}, {topRegion.state}
            </p>
            <p className="text-[10px] text-muted">
              {topRegion.count} lead{topRegion.count > 1 ? 's' : ''} — maior concentração
            </p>
          </div>
        </div>
      )}

      {/* Grid de Calor */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto pr-1">
        {regionData.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted">
            <MapPin size={32} className="opacity-30 mb-2" />
            <p className="text-sm">Nenhum lead com localização</p>
          </div>
        ) : (
          regionData.map(region => (
            <motion.button
              key={`${region.city}-${region.state}`}
              onClick={() => onRegionClick?.(region)}
              className={`p-4 rounded-xl border transition-all text-left ${getHeatColor(region.count, maxCount)} ${getTextColor(region.count, maxCount)} hover:ring-2 hover:ring-accent/50`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-bold truncate">{region.city}</span>
                <span className="text-[10px] font-black bg-surface/50 px-1.5 py-0.5 rounded-full">
                  {region.count}
                </span>
              </div>
              <div className="text-[10px] opacity-70 truncate">
                {region.state}
              </div>
              {/* Barra de proporção */}
              <div className="mt-2 h-1.5 bg-surface/50 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.max((region.count / maxCount) * 100, 5)}%`,
                    background: 'var(--accent-color, #E87722)'
                  }}
                />
              </div>
            </motion.button>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default LeadHeatmap;