import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, TrendingUp, FileText, Download, Loader,
  CheckCircle, XCircle, Send, Clock, AlertTriangle,
  Edit, ChevronDown, Calendar, Archive, RotateCcw, Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../shared/Button';
import { fetchStats, fetchRecentProposals, fetchCompany, updateProposalStatus } from '../../shared/services/api';
import { fetchLeadsSummary } from '../../features/leads/services/leadService';
import { fmt } from '../proposal/constants';
import PdfGenerator from '../proposal/components/PdfGenerator';
import { DashboardSkeleton } from '../../shared/components/Skeleton';
import { useToast } from '../../shared/context/ToastContext';
import DashboardChallengeBlock from '../growth/dashboard/DashboardChallengeBlock';
import ThemeToggle from '../../shared/components/ThemeToggle';

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_LABELS = { APPROVED: 'Aprovada', SENT: 'Enviada', REJECTED: 'Recusada', EXPIRED: 'Expirada', DRAFT: 'Rascunho', ARCHIVED: 'Arquivada' };
const STATUS_ICONS  = { DRAFT: <Clock size={12} />, SENT: <Send size={12} />, APPROVED: <CheckCircle size={12} />, REJECTED: <XCircle size={12} />, EXPIRED: <AlertTriangle size={12} />, ARCHIVED: <Archive size={12} /> };
const STATUS_COLORS = {
  APPROVED: 'bg-success/10 text-success border-success/20',
  SENT:     'bg-accent/10 text-accent border-accent/20',
  REJECTED: 'bg-danger/10 text-danger border-danger/20',
  EXPIRED:  'bg-gold/10 text-gold border-gold/20',
  DRAFT:    'bg-white/5 text-muted border-white/10',
  ARCHIVED: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};
const STATUS_OPTIONS = [
  { value: 'DRAFT',    label: 'Rascunho',  icon: Clock },
  { value: 'SENT',     label: 'Enviada',   icon: Send },
  { value: 'APPROVED', label: 'Aprovada',  icon: CheckCircle },
  { value: 'REJECTED', label: 'Recusada',  icon: XCircle },
  { value: 'EXPIRED',  label: 'Expirada',  icon: AlertTriangle },
  { value: 'ARCHIVED', label: 'Arquivada', icon: Archive },
];

// ─── StatusBadge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status, proposalId, onChange }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider transition-opacity active:opacity-70 ${STATUS_COLORS[status] || STATUS_COLORS.DRAFT}`}
      >
        {STATUS_ICONS[status] || STATUS_ICONS.DRAFT}
        {STATUS_LABELS[status] || status}
        <ChevronDown size={9} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.12 }}
              className="absolute right-0 top-full mt-2 bg-surface border border-border rounded-2xl overflow-hidden shadow-2xl z-50 w-44"
            >
              {STATUS_OPTIONS.map(opt => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    onClick={() => { onChange(proposalId, opt.value); setOpen(false); }}
                    className={`flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-white/5 transition-colors text-left ${status === opt.value ? 'text-accent2 font-bold' : 'text-white'}`}
                  >
                    <Icon size={15} className="text-muted flex-shrink-0" />
                    {opt.label}
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── ProposalCard ─────────────────────────────────────────────────────────────
const ProposalCard = ({ p, onPdf, onStatusChange, isGenerating }) => {
  const navigate = useNavigate();
  const [dragX, setDragX] = useState(0);
  
  const triggerHaptic = () => {
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const handleDragEnd = (event, info) => {
    const threshold = 75;
    if (info.offset.x < -threshold) {
      triggerHaptic();
      onStatusChange(p.id, 'ARCHIVED');
    } else if (info.offset.x > threshold) {
      triggerHaptic();
      onStatusChange(p.id, 'SENT');
    }
    setDragX(0);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl">
      {/* Background action indicators */}
      <div className="absolute inset-y-0 left-0 right-0 flex transition-opacity duration-200" style={{ opacity: dragX !== 0 ? 1 : 0 }}>
        <div className="flex-1 bg-danger/20 flex items-center justify-start pl-4">
          <Archive size={20} className="text-danger" />
        </div>
        <div className="flex-1 bg-accent/20 flex items-center justify-end pr-4">
          <RotateCcw size={20} className="text-accent" />
        </div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.3}
        onDrag={(event, info) => setDragX(info.offset.x)}
        onDragEnd={handleDragEnd}
        style={{ x: dragX }}
        className="card p-5 flex flex-col gap-3 active:scale-[0.99] transition-transform relative z-10 bg-surface hover:shadow-card-hover"
      >
        <div className="flex justify-between items-start gap-3">
          <div className="min-w-0">
            <div className="text-text-primary font-bold text-base leading-tight truncate">{p.clientName}</div>
            <div className="text-text-secondary text-xs mt-0.5 font-medium">
              {p.number} · <span className="text-accent font-bold">{fmt(p.total)}</span>
            </div>
            <div className="text-text-secondary text-[10px] mt-1 flex items-center gap-1">
              <Calendar size={10} />
              {new Date(p.createdAt).toLocaleDateString('pt-BR')}
            </div>
          </div>
          <StatusBadge status={p.status} proposalId={p.id} onChange={onStatusChange} />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onPdf(p)}
            disabled={!!isGenerating}
            className="flex-1 py-2.5 rounded-xl bg-bg border border-border text-text-secondary text-xs font-bold flex items-center justify-center gap-1.5 active:bg-accent/10 active:text-accent transition-colors disabled:opacity-40"
          >
            {isGenerating ? <Loader size={12} className="animate-spin" /> : <Download size={13} />}
            PDF
          </button>
          <button
            onClick={() => navigate(`/propostas/editar/geral/${p.id}`)}
            className="flex-1 py-2.5 rounded-xl bg-accent/10 border border-accent/30 text-accent text-xs font-bold flex items-center justify-center gap-1.5 active:bg-accent/20 transition-colors"
          >
            <Edit size={13} /> Editar
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Greeting ─────────────────────────────────────────────────────────────────
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
};

const todayFmt = () => new Date().toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });

// ─── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [leadsSummary, setLeadsSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [companyData, setCompanyData] = useState(null);
  const [generatingProposal, setGeneratingProposal] = useState(null);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [s, r, c, ls] = await Promise.all([
          fetchStats(),
          fetchRecentProposals(),
          fetchCompany().catch(() => null),
          fetchLeadsSummary(),
        ]);
        setStats(s);
        setRecent(r);
        setCompanyData(c);
        setLeadsSummary(ls);
        setUserName(c?.user?.name?.split(' ')[0] || '');
      } catch {
        toast({ message: 'Erro ao carregar dados do painel', type: 'error' });
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleStatusChange = useCallback(async (id, newStatus) => {
    try {
      await updateProposalStatus(id, newStatus);
      setRecent(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
      toast({ message: `Status atualizado: ${STATUS_LABELS[newStatus]}`, type: 'success' });
    } catch {
      toast({ message: 'Falha ao atualizar status', type: 'error' });
    }
  }, [toast]);

  const handleDownloadPdf = (p) => {
    setGeneratingProposal(p);
  };

  if (isLoading) return <DashboardSkeleton />;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 w-full">

      {/* Novo motor de PDF unificado */}
      {generatingProposal && (
        <PdfGenerator 
          proposal={generatingProposal} 
          triggerDownload={true}
          onDone={() => setGeneratingProposal(null)}
        />
      )}

       {/* ── Greeting ──────────────────────────────────────────────────── */}
       <div className="flex justify-between items-start">
         <div>
           <h1 className="text-3xl font-black font-display text-text-primary">
             {getGreeting()}{userName ? `, ${userName}` : ''}
           </h1>
           <p className="text-text-secondary text-sm capitalize mt-1">{todayFmt()}</p>
         </div>
         <div className="flex items-center gap-3">
           <ThemeToggle />
           <Button onClick={() => navigate('/propostas/nova/rapida')} className="hidden md:flex items-center gap-2 px-5 shadow-md">
             <Plus size={16} /> Nova Proposta
           </Button>
         </div>
       </div>


       {/* ── Desafio 30 Dias ───────────────────────────────────────────── */}
       <DashboardChallengeBlock onNavigate={() => navigate('/meu-negocio')} />

       {/* ── 3 Metric cards ────────────────────────────────────────────── */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="card p-6 hover:shadow-card-hover transition-all duration-300">
           <div className="flex items-center gap-3 mb-3">
             <div className="p-2 rounded-lg bg-accent/10 text-accent">
               <FileText size={18} />
             </div>
             <div className="text-xs text-text-secondary font-bold uppercase tracking-wider">Este mês</div>
           </div>
           <div className="text-4xl font-black font-display text-text-primary">{stats?.monthlyProposals ?? 0}</div>
           <div className="text-xs text-muted mt-2">{stats?.totalProposals ?? 0} total</div>
         </div>

         <div className="card p-6 hover:shadow-card-hover transition-all duration-300">
           <div className="flex items-center gap-3 mb-3">
             <div className="p-2 rounded-lg bg-success/10 text-success">
               <TrendingUp size={18} />
             </div>
             <div className="text-xs text-text-secondary font-bold uppercase tracking-wider">Aprovado</div>
           </div>
           <div className="text-3xl font-black font-display text-success leading-tight">{fmt(stats?.approvedValue ?? 0)}</div>
           <div className="text-xs text-muted mt-2">{stats?.approvedCount ?? 0} propostas</div>
         </div>

         <div className="card p-6 hover:shadow-card-hover transition-all duration-300">
           <div className="flex items-center gap-3 mb-3">
             <div className="p-2 rounded-lg bg-info/10 text-info">
               <Users size={18} />
             </div>
             <div className="text-xs text-text-secondary font-bold uppercase tracking-wider">Leads Novos</div>
           </div>
           <div className="text-4xl font-black font-display text-info">{leadsSummary?.activeLeads ?? 0}</div>
           <div className="text-xs text-muted mt-2">Leads ativos</div>
         </div>
       </div>

      {/* ── Recent proposals ──────────────────────────────────────────── */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-bold text-text-primary font-display text-lg">Atividade Recente</h2>
          <button onClick={() => navigate('/propostas')} className="text-accent text-sm font-bold hover:underline">
            Ver todas →
          </button>
        </div>

        {recent.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted border-2 border-dashed border-border rounded-2xl bg-surface">
            <FileText size={48} className="mb-4 text-border" />
            <p className="font-bold text-text-primary text-lg mb-2">Nenhuma proposta ainda</p>
            <p className="text-sm mb-6">Crie sua primeira proposta agora.</p>
            <Button onClick={() => navigate('/propostas/nova/rapida')} className="px-8 shadow-md">
              <Plus size={16} className="mr-2" /> Criar agora
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recent.map(p => (
              <ProposalCard 
                key={p.id} 
                p={p} 
                onPdf={handleDownloadPdf} 
                onStatusChange={handleStatusChange}
                isGenerating={generatingProposal?.id === p.id}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Dashboard;
