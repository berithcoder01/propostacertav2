import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Filter, MapPin, RefreshCw, BarChart2, TrendingUp, Users, AlertCircle, CheckCircle, Clock, XCircle, Send, Eye, Map, Navigation } from 'lucide-react';
import { fetchLeads, fetchLeadsSummary, deleteLead, updateLeadStatus, fetchWeeklyReport, dispatchWhatsApp, aiSearchPlaces, scrapeWebsite, createProposalFromLead } from './services/leadService';
import { useToast } from '../../shared/context/ToastContext';
import { useAuth } from '../../shared/context/AuthContext';
import { useUpgrade } from '../../shared/context/UpgradeContext';
import LeadCard from './components/LeadCard';
import LeadList from './components/LeadList';
import LeadPipeline from './components/LeadPipeline';
import LeadMap from './components/LeadMap';
import LeadHeatmap from './components/LeadHeatmap';
import WeeklyReport from './components/WeeklyReport';
import MessageTemplateWidget from './components/MessageTemplateWidget';
import NewLeadModal from './components/NewLeadModal';

const ProspectionDashboard = () => {
  const { checkPlanLimit } = useAuth();
  const { openUpgrade } = useUpgrade();
  const { toast } = useToast();
  const aiEnabled = checkPlanLimit('ai');

  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [segmentFilter, setSegmentFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  // Dados
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState(null);
  const [weeklyReport, setWeeklyReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals / Panels
  const [selectedLead, setSelectedLead] = useState(null);
  const [showTemplate, setShowTemplate] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showNewLead, setShowNewLead] = useState(false);
  const [activeView, setActiveView] = useState('list'); // 'list' | 'pipeline' | 'map' | 'heatmap'

  // Busca de oportunidades
  const [searchingPlaces, setSearchingPlaces] = useState(false);
  const [searchPlaceQuery, setSearchPlaceQuery] = useState('');
  
  // Scraping
  const [scraping, setScraping] = useState(false);
  const [scrapeUrl, setScrapeUrl] = useState('');
  const [scrapeSegment, setScrapeSegment] = useState('RESIDENCIAL');

  const loadLeads = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchLeads({
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        segment: segmentFilter !== 'ALL' ? segmentFilter : undefined,
        page,
        limit,
      });
      setLeads(data.leads || []);
      setTotal(data.total || 0);
    } catch (err) {
      toast({ message: 'Erro ao carregar leads: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter, segmentFilter, page, limit, toast]);

  const handleScrapeWebsite = async () => {
    if (!scrapeUrl.trim()) return;
    setScraping(true);
    try {
      const result = await scrapeWebsite(scrapeUrl, scrapeSegment, 10);
      if (result.created && result.created > 0) {
        toast({ message: `${result.created} leads criados a partir do scraping!`, type: 'success' });
        loadLeads(); // Recarregar a lista de leads
      } else {
        toast({ message: 'Nenhum lead foi criado a partir do scraping', type: 'warning' });
      }
    } catch (err) {
      toast({ message: 'Erro ao realizar scraping: ' + err.message, type: 'error' });
    } finally {
      setScraping(false);
    }
  };

  const loadSummary = useCallback(async () => {
    try {
      const data = await fetchLeadsSummary();
      setSummary(data);
    } catch (err) {
      console.warn('Erro ao carregar resumo:', err.message);
    }
  }, []);

  const loadWeeklyReport = useCallback(async () => {
    try {
      const data = await fetchWeeklyReport();
      setWeeklyReport(data);
      setShowReport(true);
    } catch (err) {
      toast({ message: 'Erro ao carregar relatório: ' + err.message, type: 'error' });
    }
  }, [toast]);

  useEffect(() => { loadLeads(); }, [loadLeads]);
  useEffect(() => { loadSummary(); }, [loadSummary]);

  const handleDelete = async (id) => {
    if (!window.confirm('Excluir este lead permanentemente?')) return;
    try {
      await deleteLead(id);
      setLeads(prev => prev.filter(l => l.id !== id));
      setTotal(prev => prev - 1);
      toast({ message: 'Lead excluído', type: 'success' });
    } catch (err) {
      toast({ message: 'Erro ao excluir lead: ' + err.message, type: 'error' });
    }
  };

   const handleStatusChange = async (id, newStatus) => {
     try {
       await updateLeadStatus(id, newStatus);
       setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
       toast({ message: `Lead atualizado para ${newStatus}`, type: 'success' });
     } catch (err) {
       toast({ message: 'Erro ao atualizar status: ' + err.message, type: 'error' });
     }
   };

   const handleCreateProposal = async (lead) => {
     try {
       const proposal = await createProposalFromLead(lead.id);
       toast({ message: 'Proposta criada a partir do lead!', type: 'success' });
       // Atualizar lead para NEGOTIATING
       await updateLeadStatus(lead.id, 'NEGOTIATING');
       // Recarregar leads
       loadLeads();
     } catch (err) {
       toast({ message: 'Erro ao criar proposta: ' + err.message, type: 'error' });
     }
   };

  const handleWhatsApp = async (lead) => {
    try {
      const result = await dispatchWhatsApp(lead.id, '');
      if (result.waUrl) {
        window.open(result.waUrl, '_blank');
        toast({ message: 'WhatsApp aberto!', type: 'success' });
        loadLeads();
      }
    } catch (err) {
      toast({ message: 'Erro ao abrir WhatsApp: ' + err.message, type: 'error' });
    }
  };

  const handleSearchPlaces = async () => {
    if (!searchPlaceQuery.trim()) return;
    setSearchingPlaces(true);
    try {
      const result = await aiSearchPlaces(searchPlaceQuery);
      if (result.results && result.results.length > 0) {
        toast({ message: `${result.results.length} oportunidades encontradas!`, type: 'success' });
      } else {
        toast({ message: 'Nenhuma oportunidade encontrada', type: 'warning' });
      }
    } catch (err) {
      toast({ message: 'Erro ao buscar oportunidades: ' + err.message, type: 'error' });
    } finally {
      setSearchingPlaces(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  // Cards de estatística
  const statsCards = summary ? [
    { title: 'Total de Leads', value: summary.total, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { title: 'Taxa de Conversão', value: `${summary.conversionRate}%`, icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-400/10' },
    { title: 'Leads Ativos', value: summary.activeLeads, icon: AlertCircle, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { title: 'Convertidos', value: summary.converted, icon: CheckCircle, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  ] : [];

  // Opções de visualização
  const viewOptions = [
    { key: 'list', label: 'Lista', icon: Eye },
    { key: 'pipeline', label: 'Pipeline', icon: TrendingUp },
    { key: 'map', label: 'Mapa', icon: Map },
    { key: 'heatmap', label: 'Calor', icon: MapPin },
  ];

  return (
    <motion.div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black font-display text-white">Prospecção</h1>
          <p className="text-muted text-sm mt-1">Encontre e gerencie leads qualificados para sua empresa</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadWeeklyReport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface/50 border border-border text-sm font-bold text-muted hover:text-white hover:border-accent transition-colors"
          >
            <BarChart2 size={16} /> Relatório Semanal
          </button>
          <button
            onClick={() => setShowNewLead(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white text-sm font-bold hover:bg-accent/90 transition-colors"
          >
            <Plus size={16} /> Novo Lead
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsCards.map((stat, idx) => (
          <div key={idx} className={`${stat.bg} border border-border rounded-2xl p-4 space-y-1`}>
            <stat.icon size={20} className={stat.color} />
            <div className="text-2xl font-black font-display text-white">{stat.value}</div>
            <div className="text-[10px] text-muted uppercase tracking-wider">{stat.title}</div>
          </div>
        ))}
      </div>

      {/* Filtros e Busca */}
      <div className="bg-surface border-2 border-border rounded-2xl p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Buscar lead por nome, empresa, cidade..."
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
              className="w-full bg-bg border border-border rounded-xl px-10 py-2.5 text-sm text-white outline-none focus:border-accent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-bg border border-border rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-accent"
          >
            <option value="ALL">Todos Status</option>
            <option value="NEW">Novo</option>
            <option value="CONTACTED">Contatado</option>
            <option value="NEGOTIATING">Em Negociação</option>
            <option value="DISCARDED">Descartado</option>
            <option value="CONVERTED">Convertido</option>
          </select>
          <select
            value={segmentFilter}
            onChange={e => { setSegmentFilter(e.target.value); setPage(1); }}
            className="bg-bg border border-border rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-accent"
          >
            <option value="ALL">Todos Segmentos</option>
            <option value="RESIDENCIAL">Residencial</option>
            <option value="COMERCIAL">Comercial</option>
            <option value="INDUSTRIAL">Industrial</option>
            <option value="CONDOMINIO">Condomínio</option>
          </select>
          <button
            onClick={() => { setRefreshing(true); loadLeads(); }}
            className="p-2.5 rounded-xl bg-surface text-muted hover:text-accent border border-border transition-colors"
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Busca de Oportunidades por IA */}
        <div className="flex gap-2 items-center">
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Buscar oportunidades por IA (ex.: condomínios em Maringá)..."
              value={searchPlaceQuery}
              onChange={e => setSearchPlaceQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearchPlaces()}
              className="w-full bg-bg border border-border rounded-xl pl-9 pr-4 py-2 text-sm text-white outline-none focus:border-accent"
            />
          </div>
          <button
            onClick={handleSearchPlaces}
            disabled={searchingPlaces || !searchPlaceQuery.trim()}
            className="px-4 py-2 rounded-xl bg-accent text-white text-sm font-bold hover:bg-accent/90 disabled:opacity-40 transition-colors flex items-center gap-1.5"
          >
            {searchingPlaces ? <Clock size={14} className="animate-spin" /> : <Navigation size={14} />}
            Buscar Oportunidades
          </button>
        </div>

        {/* Scraping de Website */}
        <div className="flex gap-2 items-center mt-4">
          <div className="relative flex-1 max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="URL para scraping (ex.: https://exemplo.com/empresas)"
              value={scrapeUrl}
              onChange={e => setScrapeUrl(e.target.value)}
              className="w-full bg-bg border border-border rounded-xl pl-9 pr-4 py-2 text-sm text-white outline-none focus:border-accent"
            />
          </div>
          <div className="relative flex-1 max-w-xs">
            <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <select
              value={scrapeSegment}
              onChange={e => setScrapeSegment(e.target.value)}
              className="bg-bg border border-border rounded-xl pl-9 pr-4 py-2 text-sm text-white outline-none focus:border-accent w-full"
            >
              <option value="RESIDENCIAL">Residencial</option>
              <option value="COMERCIAL">Comercial</option>
              <option value="INDUSTRIAL">Industrial</option>
              <option value="CONDOMINIO">Condomínio</option>
            </select>
          </div>
          <button
            onClick={handleScrapeWebsite}
            disabled={scraping || !scrapeUrl.trim()}
            className="px-4 py-2 rounded-xl bg-accent text-white text-sm font-bold hover:bg-accent/90 disabled:opacity-40 transition-colors flex items-center gap-1.5"
          >
            {scraping ? <Clock size={14} className="animate-spin" /> : <MapPin size={14} />}
            Fazer Scraping
          </button>
        </div>

        {/* Toggle View */}
        <div className="flex gap-1 p-1 bg-bg rounded-xl">
          {viewOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.key}
                onClick={() => setActiveView(opt.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeView === opt.key
                    ? 'bg-accent text-white shadow-sm'
                    : 'text-muted hover:text-white'
                }`}
              >
                <Icon size={12} />
                <span className="hidden sm:inline">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Conteúdo */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : activeView === 'list' ? (
        <LeadList
          leads={leads}
          total={total}
          page={page}
          limit={limit}
          totalPages={totalPages}
          onPageChange={setPage}
          onDelete={handleDelete}
          onStatusChange={handleStatusChange}
          onWhatsApp={handleWhatsApp}
          onSelectLead={setSelectedLead}
        />
      ) : activeView === 'pipeline' ? (
        <LeadPipeline
          leads={leads}
          onStatusChange={handleStatusChange}
          onSelectLead={setSelectedLead}
        />
      ) : activeView === 'map' ? (
        <LeadMap
          leads={leads}
          onLeadSelect={setSelectedLead}
          selectedLeadId={selectedLead?.id}
        />
      ) : (
        <LeadHeatmap
          leads={leads}
          onRegionClick={(region) => {
            const regionLeads = leads.filter(l => l.city === region.city && l.state === region.state);
            if (regionLeads.length === 1) {
              setSelectedLead(regionLeads[0]);
            }
          }}
        />
      )}

      {/* Weekly Report Modal */}
      <AnimatePresence>
        {showReport && weeklyReport && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowReport(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-surface border-2 border-border rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold font-display text-white">Relatório Semanal</h3>
                <button onClick={() => setShowReport(false)} className="text-muted hover:text-white"><XCircle size={20} /></button>
              </div>
              <WeeklyReport data={weeklyReport} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

       {/* Lead Detail Modal */}
       <AnimatePresence>
         {selectedLead && (
           <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedLead(null)}>
             <motion.div
               initial={{ opacity: 0, scale: 0.95, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="bg-surface border-2 border-border rounded-2xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto"
               onClick={e => e.stopPropagation()}
             >
               <LeadCard lead={selectedLead} compact={false} onClose={() => setSelectedLead(null)} onAction={(action, lead) => {
                 if (action === 'whatsapp') handleWhatsApp(lead);
                 if (action === 'create-proposal') handleCreateProposal(lead);
               }} />
             </motion.div>
           </div>
         )}
       </AnimatePresence>

      {/* Novo Lead Modal */}
      <NewLeadModal
        isOpen={showNewLead}
        onClose={() => setShowNewLead(false)}
        onLeadCreated={(newLead) => {
          setLeads(prev => [newLead, ...prev]);
          setTotal(prev => prev + 1);
        }}
      />

      {/* Message Template Widget */}
      <AnimatePresence>
        {showTemplate && selectedLead && (
          <MessageTemplateWidget
            lead={selectedLead}
            onClose={() => setShowTemplate(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProspectionDashboard;