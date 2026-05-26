import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Plus, Search, CheckCircle, XCircle, Send,
  Clock, AlertTriangle, Download, Loader, Edit, ChevronDown, Calendar, Trash2, Copy
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../shared/Button';
import { fetchProposals, updateProposalStatus, deleteProposal, fetchCompany, duplicateProposal } from '../../shared/services/api';
import { fmt } from './constants';
import PdfGenerator from './components/PdfGenerator';
import ShareButton from './components/ShareButton';
import RemindersWidget from './components/RemindersWidget';
import { ListSkeleton } from '../../shared/components/Skeleton';
import { useToast } from '../../shared/context/ToastContext';

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_LABELS = { DRAFT: 'Rascunho', SENT: 'Enviada', APPROVED: 'Aprovada', REJECTED: 'Recusada', EXPIRED: 'Expirada' };
const STATUS_ICONS  = { DRAFT: Clock, SENT: Send, APPROVED: CheckCircle, REJECTED: XCircle, EXPIRED: AlertTriangle };
const STATUS_COLORS = {
  APPROVED: 'bg-success/20 text-success border-success/30',
  SENT:     'bg-blue-500/20 text-blue-400 border-blue-500/30',
  REJECTED: 'bg-danger/20 text-danger border-danger/30',
  EXPIRED:  'bg-gold/20 text-gold border-gold/30',
  DRAFT:    'bg-muted/20 text-muted border-muted/30',
};
const STATUS_FILTER_ORDER = ['ALL', 'DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'EXPIRED'];

// ─── StatusBadge (inline, reutilizável) ──────────────────────────────────────
const StatusBadge = ({ status, proposalId, onChange }) => {
  const [open, setOpen] = useState(false);
  const Icon = STATUS_ICONS[status] || Clock;
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${STATUS_COLORS[status] || STATUS_COLORS.DRAFT}`}
      >
        <Icon size={11} />
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
              className="absolute right-0 top-full mt-2 bg-surface dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl overflow-hidden shadow-2xl z-50 w-44"
            >
              {STATUS_FILTER_ORDER.slice(1).map(val => {
                const Ic = STATUS_ICONS[val] || Clock;
                return (
                  <button key={val} onClick={() => { onChange(proposalId, val); setOpen(false); }}
                    className={`flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-white/5 dark:hover:bg-white/10 transition-colors text-left ${status === val ? 'text-accent2 font-bold' : 'text-text-primary dark:text-white'}`}
                  >
                    <Ic size={14} className="text-muted" /> {STATUS_LABELS[val]}
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
const ProposalCard = ({ p, onPdf, onStatusChange, onDelete, onDuplicate, isGenerating, isDuplicating }) => {
  const navigate = useNavigate();
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="bg-surface dark:bg-dark-surface border border-border dark:border-dark-border rounded-2xl p-4 flex flex-col gap-3"
    >
      <div className="flex justify-between items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-text-primary dark:text-white font-bold text-base leading-tight truncate">{p.clientName}</div>
          <div className="text-muted dark:text-gray-500 text-xs mt-0.5">
            {p.number}
            {p.clientLocation && <span className="ml-1 text-muted/60 dark:text-gray-600">· {p.clientLocation}</span>}
          </div>
          <div className="text-accent2 dark:text-gray-400 font-black font-display text-lg mt-1">{fmt(p.total)}</div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <StatusBadge status={p.status} proposalId={p.id} onChange={onStatusChange} />
          <div className="text-muted dark:text-gray-500 text-[10px] flex items-center gap-1">
            <Calendar size={9} />
            {new Date(p.createdAt).toLocaleDateString('pt-BR')}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => onPdf(p)} disabled={!!isGenerating}
          className="flex-1 py-2.5 rounded-xl bg-bg dark:bg-dark-bg border border-border dark:border-dark-border text-muted dark:text-gray-400 text-xs font-bold flex items-center justify-center gap-1.5 active:bg-accent/10 active:text-accent2 transition-colors disabled:opacity-40"
        >
          {isGenerating ? <Loader size={12} className="animate-spin" /> : <Download size={13} />} PDF
        </button>
        <button onClick={() => navigate(`/propostas/editar/geral/${p.id}`)}
          className="flex-1 py-2.5 rounded-xl bg-accent/10 border border-accent/30 text-accent2 dark:text-gray-400 text-xs font-bold flex items-center justify-center gap-1.5 active:bg-accent/20 transition-colors"
        >
          <Edit size={13} /> Editar
        </button>
        <button onClick={() => onDuplicate(p.id)} disabled={isDuplicating}
          className="py-2.5 px-3 rounded-xl border border-border dark:border-dark-border text-muted dark:text-gray-500 text-xs font-bold flex items-center justify-center hover:text-text-primary dark:hover:text-white hover:border-accent/30 transition-colors disabled:opacity-50"
          title="Duplicar Proposta"
        >
          {isDuplicating ? <Loader size={13} className="animate-spin" /> : <Copy size={13} />}
        </button>
        <ShareButton proposalId={p.id} variant="icon" />
        <button onClick={() => onDelete(p.id)}
          className="py-2.5 px-3 rounded-xl border border-border dark:border-dark-border text-muted dark:text-gray-500 text-xs font-bold flex items-center justify-center hover:text-danger hover:border-danger/30 transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </motion.div>
  );
};

// ─── ProposalsList ────────────────────────────────────────────────────────────
const ProposalsList = () => {
  const navigate = useNavigate();
  const { toast, confirm } = useToast();
  const [proposals, setProposals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [companyData, setCompanyData] = useState(null);
  const [generatingProposal, setGeneratingProposal] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [proposalsList, c] = await Promise.all([
        fetchProposals({ page: 1, limit: 100 }),
        fetchCompany().catch(() => null),
      ]);
      setProposals((proposalsList || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setCompanyData(c);
    } catch {
      toast({ message: 'Erro ao carregar propostas', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = useCallback(async (id, newStatus) => {
    try {
      await updateProposalStatus(id, newStatus);
      setProposals(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
      toast({ message: `Status: ${STATUS_LABELS[newStatus]}`, type: 'success' });
    } catch {
      toast({ message: 'Falha ao atualizar status', type: 'error' });
    }
  }, [toast]);

  const handleDelete = useCallback(async (id) => {
    const ok = await confirm({
      title: 'Excluir proposta?',
      description: 'Esta ação não pode ser desfeita.',
      confirmLabel: 'Excluir',
      cancelLabel: 'Cancelar',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await deleteProposal(id);
      setProposals(prev => prev.filter(p => p.id !== id));
      toast({ message: 'Proposta excluída', type: 'success' });
    } catch {
      toast({ message: 'Erro ao excluir proposta', type: 'error' });
    }
  }, [confirm, toast]);

  const [duplicatingId, setDuplicatingId] = useState(null);

  const handleDuplicate = useCallback(async (id) => {
    setDuplicatingId(id);
    try {
      const copy = await duplicateProposal(id);
      setProposals(prev => [copy, ...prev].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      toast({ message: 'Proposta duplicada com sucesso!', type: 'success' });
    } catch (err) {
      toast({ message: err.message || 'Erro ao duplicar proposta', type: 'error' });
    } finally {
      setDuplicatingId(null);
    }
  }, [toast]);

  const handleDownloadPdf = (p) => {
    // Normalize the proposal object from Prisma/API format to PdfGenerator format
    const normalized = {
      ...p,
      number: p.number,
      clientName: p.clientName,
      clientContact: p.clientContact || '',
      clientRole: p.clientRole || '',
      clientLocation: p.clientLocation || '',
      clientPhone: p.clientPhone || '',
      object: p.object || '',
      // Map items from Prisma format to expected format
      items: (p.items || []).map(i => ({
        label: i.label,
        unit: i.unit || 'un',
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
      // conditions comes as a single object from Prisma (not array)
      conditions: p.conditions ? [p.conditions] : [],
      total: p.total,
    };
    setGeneratingProposal(normalized);
  };

  // ── Counters per status ──────────────────────────────────────────────────
  const counts = proposals.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {});

  const filtered = proposals.filter(p => {
    const matchSearch = (p.clientName || '').toLowerCase().includes(search.toLowerCase()) || (p.number || '').includes(search);
    const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const exportToExcel = () => {
    if (proposals.length === 0) {
      toast({ message: 'Não há propostas para exportar.', type: 'warning' });
      return;
    }

    // Usamos delimitador ";" e BOM UTF-8 para compatibilidade perfeita com Excel em português
    const headers = ['Número', 'Empresa / Cliente', 'Objeto / Descrição', 'Valor Total (R$)', 'Status', 'Data de Criação'];
    
    const rows = proposals.map(p => {
      // Formata o valor total substituindo ponto por vírgula para o Excel reconhecer como número
      const formattedTotal = String(p.total || 0).replace('.', ',');
      return [
        `"${(p.number || '').replace(/"/g, '""')}"`,
        `"${(p.clientName || '').replace(/"/g, '""')}"`,
        `"${(p.object || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`, // remove quebras de linha para não quebrar o layout
        `"${formattedTotal}"`,
        `"${STATUS_LABELS[p.status] || p.status}"`,
        `"${new Date(p.createdAt).toLocaleDateString('pt-BR')}"`
      ];
    });

    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.join(';'))
    ].join('\n');

    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `propostas-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ message: 'Planilha de propostas exportada com sucesso!', type: 'success' });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">

      {/* Novo motor de PDF unificado */}
      {generatingProposal && (
        <PdfGenerator 
          proposal={generatingProposal} 
          triggerDownload={true}
          onDone={() => setGeneratingProposal(null)}
        />
      )}

      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-display text-text-primary dark:text-white">Propostas</h1>
          <p className="text-muted dark:text-gray-500 text-sm">{proposals.length} no total</p>
        </div>
        <div className="hidden md:flex gap-2">
          <Button variant="ghost" onClick={exportToExcel} className="flex items-center gap-2 px-4">
            <Download size={16} /> Planilha
          </Button>
          <Button onClick={() => navigate('/propostas/nova')} className="flex items-center gap-2 px-5">
            <Plus size={16} /> Nova
          </Button>
        </div>
      </div>

      <RemindersWidget />

      {/* ── Search ────────────────────────────────────────────────────── */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16} />
        <input
          type="text"
          placeholder="Buscar por cliente ou número..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-base pl-10"
        />
      </div>

      {/* ── Status chips with counters ─────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4">
        {STATUS_FILTER_ORDER.map(s => {
          const count = s === 'ALL' ? proposals.length : (counts[s] || 0);
          const isActive = statusFilter === s;
          return (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all border-2 whitespace-nowrap ${
                isActive ? 'bg-accent border-accent text-white shadow-lg shadow-accent/20' : 'bg-surface dark:bg-dark-surface border-border dark:border-dark-border text-muted dark:text-gray-500 hover:border-accent/50'
              }`}
            >
              {s === 'ALL' ? 'Todas' : STATUS_LABELS[s]}
              <span className={`px-1.5 py-0.5 rounded-md text-[9px] ${isActive ? 'bg-white/20 text-white' : 'bg-white/5 dark:bg-white/10 text-muted dark:text-gray-500'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── List ──────────────────────────────────────────────────────── */}
      {isLoading ? (
        <ListSkeleton />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted dark:text-gray-500 border-2 border-dashed border-border dark:border-dark-border rounded-3xl bg-surface/30 dark:bg-dark-surface/30">
          <FileText size={48} className="mb-4 opacity-20" />
          <p className="font-bold text-text-primary dark:text-white">Nenhuma proposta encontrada</p>
          <p className="text-sm">Tente mudar o filtro ou buscar outro termo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map(p => (
              <ProposalCard
                key={p.id}
                p={p}
                onPdf={handleDownloadPdf}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
                isGenerating={generatingProposal?.id === p.id}
                isDuplicating={duplicatingId === p.id}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default ProposalsList;
