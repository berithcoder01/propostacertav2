import React, { useState, useEffect } from 'react';
import { Bell, Check, Clock, Plus, Trash2 } from 'lucide-react';
import { fetchReminders, createReminder, updateReminder, deleteReminder } from '../../../shared/services/api';
import { useToast } from '../../../shared/context/ToastContext';

export default function RemindersWidget({ proposalId }) {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      setLoading(true);
      const data = await fetchReminders('pending');
      // Filtrar localmente se tiver proposalId, ou a API poderia suportar
      const filtered = proposalId ? data.filter(r => r.proposalId === proposalId) : data;
      setReminders(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title || !dueDate) return;
    try {
      const newReminder = await createReminder({ title, dueDate, proposalId });
      setReminders(prev => [...prev, newReminder].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)));
      setTitle('');
      setDueDate('');
      toast({ message: 'Lembrete adicionado!', type: 'success' });
    } catch (err) {
      toast({ message: 'Erro ao adicionar lembrete', type: 'error' });
    }
  };

  const handleToggle = async (id, currentStatus) => {
    try {
      await updateReminder(id, { isCompleted: !currentStatus });
      setReminders(prev => prev.filter(r => r.id !== id)); // Remove da lista de pendentes
      toast({ message: 'Lembrete concluído!', type: 'success' });
    } catch (err) {
      toast({ message: 'Erro ao atualizar lembrete', type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteReminder(id);
      setReminders(prev => prev.filter(r => r.id !== id));
      toast({ message: 'Lembrete excluído', type: 'success' });
    } catch (err) {
      toast({ message: 'Erro ao excluir', type: 'error' });
    }
  };

  return (
    <div className="bg-surface border border-border rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-4 text-white font-bold">
        <Bell size={18} className="text-accent2" />
        Lembretes {reminders.length > 0 && <span className="bg-accent/20 text-accent2 px-2 rounded-full text-xs">{reminders.length}</span>}
      </div>

      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <input 
          type="text" 
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Novo lembrete..."
          className="flex-1 bg-bg border border-border rounded-xl px-3 py-2 text-sm text-white"
        />
        <input 
          type="date" 
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          className="bg-bg border border-border rounded-xl px-2 py-2 text-sm text-white"
        />
        <button type="submit" className="bg-accent2 text-bg p-2 rounded-xl">
          <Plus size={16} />
        </button>
      </form>

      {loading ? (
        <div className="text-muted text-sm text-center py-4">Carregando...</div>
      ) : reminders.length === 0 ? (
        <div className="text-muted text-sm text-center py-4">Nenhum lembrete pendente.</div>
      ) : (
        <ul className="space-y-2">
          {reminders.map(r => {
            const isLate = new Date(r.dueDate) < new Date();
            return (
              <li key={r.id} className="flex items-center justify-between bg-bg border border-border rounded-xl p-3">
                <div className="flex items-center gap-3">
                  <button onClick={() => handleToggle(r.id, r.isCompleted)} className="text-muted hover:text-success transition-colors">
                    <Check size={18} />
                  </button>
                  <div>
                    <p className="text-white text-sm font-bold">{r.title}</p>
                    <div className="flex items-center gap-1 text-xs mt-0.5">
                      <Clock size={10} className={isLate ? 'text-danger' : 'text-muted'} />
                      <span className={isLate ? 'text-danger font-bold' : 'text-muted'}>
                        {new Date(r.dueDate).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>
                <button onClick={() => handleDelete(r.id)} className="text-muted hover:text-danger p-1">
                  <Trash2 size={14} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
