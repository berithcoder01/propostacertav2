import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, Edit2, Trash2, Star, X, Check, Settings2 } from 'lucide-react';
import Button from '../../shared/Button';

const ProposalTemplateManager = ({ templates, loading, onCreate, onUpdate, onDelete, onSetDefault }) => {
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');

  const startEdit = (t) => {
    setEditingId(t.id);
    setEditName(t.name);
  };

  const saveEdit = () => {
    if (editName.trim()) {
      onUpdate(editingId, { name: editName.trim() });
    }
    setEditingId(null);
  };

  const handleCreate = () => {
    if (!newName.trim()) return;
    onCreate({
      name: newName.trim(),
      level: 'CUSTOM',
      isDefault: templates.length === 0,
      sections: { paymentConditions: true, guarantees: true, executionAndValidity: true },
    });
    setNewName('');
    setShowCreate(false);
  };

  if (loading) return <div className="text-center py-8 text-muted">Carregando modelos...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Modelos de Proposta</h2>
          <p className="text-sm text-muted">Gerencie os modelos usados nas suas propostas.</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="flex items-center gap-2"><Plus size={16} /> Novo Modelo</Button>
      </div>

      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-surface border-2 border-accent/30 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Novo Modelo</h3>
              <button onClick={() => setShowCreate(false)} className="text-muted hover:text-white"><X size={16} /></button>
            </div>
            <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Nome do modelo" className="w-full bg-bg border-2 border-border rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-accent" />
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setShowCreate(false)} className="flex-1">Cancelar</Button>
              <Button onClick={handleCreate} disabled={!newName.trim()} className="flex-1 flex items-center justify-center gap-2"><Check size={14} /> Criar</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {templates.length === 0 && !showCreate && (
          <div className="text-center py-12 text-muted">
            <FileText size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhum modelo criado ainda.</p>
            <button onClick={() => setShowCreate(true)} className="text-accent text-sm mt-2 hover:underline">Criar primeiro modelo</button>
          </div>
        )}

        {templates.map(t => (
          <div key={t.id} className="bg-surface border-2 border-border rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <FileText size={16} className="text-accent" />
              </div>
              <div className="flex-1">
                {editingId === t.id ? (
                  <input type="text" value={editName} onChange={e => setEditName(e.target.value)} onBlur={saveEdit} onKeyDown={e => e.key === 'Enter' && saveEdit()} className="bg-bg border border-border rounded-lg px-3 py-1 text-sm text-white outline-none focus:border-accent w-full" autoFocus />
                ) : (
                  <div className="font-bold text-white text-sm">{t.name}</div>
                )}
                <div className="text-[10px] text-muted">{t.level === 'BASIC' ? 'Básica' : 'Personalizada'} · Criado em {new Date(t.createdAt).toLocaleDateString('pt-BR')}</div>
              </div>
              {t.isDefault && <span className="text-[9px] bg-accent/20 text-accent px-2 py-0.5 rounded-full font-bold flex items-center gap-1"><Star size={8} /> PADRÃO</span>}
              <div className="flex items-center gap-1">
                {!t.isDefault && (
                  <button onClick={() => onSetDefault(t.id)} className="p-1.5 text-muted hover:text-accent transition-colors" title="Definir como padrão"><Star size={14} /></button>
                )}
                <button onClick={() => startEdit(t)} className="p-1.5 text-muted hover:text-white transition-colors" title="Editar nome"><Edit2 size={14} /></button>
                <button onClick={() => onDelete(t.id)} className="p-1.5 text-muted hover:text-danger transition-colors" title="Excluir"><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProposalTemplateManager;
