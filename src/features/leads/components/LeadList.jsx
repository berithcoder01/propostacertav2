import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowUpDown, Eye, Trash2, Phone, Mail, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import LeadCard from './LeadCard';

const LeadList = ({ leads, total, page, limit, totalPages, onPageChange, onDelete, onStatusChange, onWhatsApp, onSelectLead }) => {
  const [sortField, setSortField] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkChannel, setBulkChannel] = useState('whatsapp');

  const sortedLeads = [...leads].sort((a, b) => {
    const valA = a[sortField] || '';
    const valB = b[sortField] || '';
    if (typeof valA === 'string') {
      return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    if (valA instanceof Date) {
      return sortDir === 'asc' ? valA - valB : valB - valA;
    }
    return sortDir === 'asc' ? (valA || 0) - (valB || 0) : (valB || 0) - (valA || 0);
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const selectAll = () => {
    if (selectedIds.length === leads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(leads.map(l => l.id));
    }
  };

  const handleBulkAction = () => {
    if (selectedIds.length === 0) return;
    selectedIds.forEach(id => {
      if (bulkChannel === 'whatsapp') {
        onWhatsApp(leads.find(l => l.id === id));
      }
    });
    setSelectedIds([]);
  };

  return (
    <div className="space-y-4">
      {/* Barra de ações */}
      {selectedIds.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface border border-accent/30 rounded-2xl p-3 flex items-center justify-between gap-4"
        >
          <span className="text-sm font-bold text-accent">{selectedIds.length} selecionados</span>
          <div className="flex gap-2">
            <select
              value={bulkChannel}
              onChange={e => setBulkChannel(e.target.value)}
              className="bg-bg border border-border rounded-lg px-3 py-1.5 text-xs text-white outline-none"
            >
              <option value="whatsapp">WhatsApp</option>
              <option value="email">E-mail</option>
            </select>
            <button
              onClick={handleBulkAction}
              className="px-4 py-1.5 rounded-lg bg-accent text-white text-xs font-bold hover:bg-accent/80 transition-colors"
            >
              Enviar ({bulkChannel === 'whatsapp' ? 'WA' : 'Email'})
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 rounded-lg bg-bg border border-border text-xs text-muted hover:text-white transition-colors"
            >
              Cancelar
            </button>
          </div>
        </motion.div>
      )}

      {/* Lista de leads */}
      <AnimatePresence>
        {sortedLeads.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed border-border rounded-2xl text-muted"
          >
            <AlertTriangle size={40} className="mb-4 opacity-50" />
            <p className="text-sm font-bold">Nenhum lead encontrado</p>
            <p className="text-[10px] mt-1">Tente ajustar os filtros ou criar um novo lead</p>
          </motion.div>
        ) : (
          sortedLeads.map(lead => (
            <motion.div
              key={lead.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <LeadCard
                lead={lead}
                compact
                onAction={(action, l) => {
                  if (action === 'whatsapp') onWhatsApp(l);
                  if (action === 'email') onEmail(l);
                  if (action === 'select') onSelectLead(l);
                }}
              />
            </motion.div>
          ))
        )}
      </AnimatePresence>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <span className="text-[10px] text-muted">
            Mostrando {(page - 1) * limit + 1}–{Math.min(page * limit, total)} de {total} leads
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => onPageChange(prev => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg bg-surface border border-border text-muted hover:text-white disabled:opacity-50 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 py-2 text-sm font-bold text-white bg-accent/20 rounded-lg">
              {page}/{totalPages}
            </span>
            <button
              onClick={() => onPageChange(prev => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg bg-surface border border-border text-muted hover:text-white disabled:opacity-50 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadList;