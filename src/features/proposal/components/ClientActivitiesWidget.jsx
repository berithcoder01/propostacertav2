import React, { useState, useEffect } from 'react';
import { MessageSquare, Phone, Mail, Users, Plus, X, Loader, Calendar } from 'lucide-react';
import { fetchClientActivities, createClientActivity } from '../../../shared/services/api';
import { useToast } from '../../../shared/context/ToastContext';
import Button from '../../../shared/Button';

const TYPE_ICONS = {
  NOTE: <MessageSquare size={16} />,
  CALL: <Phone size={16} />,
  EMAIL: <Mail size={16} />,
  MEETING: <Users size={16} />
};

const TYPE_LABELS = {
  NOTE: 'Anotação',
  CALL: 'Ligação',
  EMAIL: 'E-mail',
  MEETING: 'Reunião'
};

export default function ClientActivitiesWidget({ client, onClose }) {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [type, setType] = useState('NOTE');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadActivities();
  }, [client.id]);

  const loadActivities = async () => {
    try {
      setLoading(true);
      const data = await fetchClientActivities(client.id);
      setActivities(data);
    } catch (err) {
      toast({ message: 'Erro ao carregar atividades', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      const newAct = await createClientActivity(client.id, { type, content });
      setActivities([newAct, ...activities]);
      setContent('');
      toast({ message: 'Atividade registrada!', type: 'success' });
    } catch (err) {
      toast({ message: 'Erro ao registrar', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-border flex justify-between items-center bg-bg rounded-t-2xl">
          <div>
            <h2 className="text-white font-bold font-display flex items-center gap-2">
              <Calendar size={18} className="text-accent2" /> Atividades CRM
            </h2>
            <p className="text-xs text-muted mt-1">{client.name}</p>
          </div>
          <button onClick={onClose} className="p-2 text-muted hover:text-white rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Input Form */}
        <div className="p-4 bg-white/5 border-b border-border">
          <form onSubmit={handleAdd} className="flex flex-col gap-3">
            <div className="flex gap-2">
              {Object.entries(TYPE_LABELS).map(([k, label]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setType(k)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                    type === k 
                      ? 'bg-accent/20 border-accent text-accent2' 
                      : 'bg-transparent border-border text-muted hover:border-muted'
                  }`}
                >
                  {TYPE_ICONS[k]} {label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Detalhes da atividade..."
                value={content}
                onChange={e => setContent(e.target.value)}
                className="flex-1 bg-bg border border-border rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-accent"
              />
              <Button type="submit" disabled={submitting || !content.trim()} className="px-4">
                {submitting ? <Loader size={16} className="animate-spin" /> : <Plus size={16} />}
              </Button>
            </div>
          </form>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 relative">
          {loading ? (
            <div className="flex justify-center py-8"><Loader className="animate-spin text-muted" /></div>
          ) : activities.length === 0 ? (
            <div className="text-center text-muted text-sm py-8">Nenhuma atividade registrada ainda.</div>
          ) : (
            <div className="absolute left-7 top-4 bottom-4 w-px bg-border/50 z-0" />
          )}

          {!loading && activities.map(act => (
            <div key={act.id} className="relative z-10 flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-accent2 mt-1">
                {TYPE_ICONS[act.type]}
              </div>
              <div className="flex-1 bg-bg border border-border rounded-xl p-3">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-bold text-muted">{TYPE_LABELS[act.type]}</span>
                  <span className="text-[10px] text-muted">{new Date(act.createdAt).toLocaleString('pt-BR')}</span>
                </div>
                <p className="text-sm text-white">{act.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
