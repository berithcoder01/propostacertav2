import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, User, Plus, ArrowRight, X, ChevronRight, DollarSign } from 'lucide-react';
import { fetchClients, fetchCompany, saveProposal, fetchTemplates } from '../../shared/services/api';
import { useToast } from '../../shared/context/ToastContext';

// ─── helpers ─────────────────────────────────────────────────────────────────
const parseCurrency = (str) => {
  if (!str) return 0;
  return parseFloat(String(str).replace(/\./g, '').replace(',', '.')) || 0;
};

const formatCurrency = (str) => {
  const nums = String(str).replace(/\D/g, '');
  if (!nums) return '';
  const value = (parseInt(nums, 10) / 100).toFixed(2);
  return value.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const maskPhone = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
};

// ─── NewClientModal ───────────────────────────────────────────────────────────
const NewClientModal = ({ onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center px-4"
      style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
    >
      <motion.div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        className="relative bg-surface border border-border rounded-3xl p-6 w-full max-w-sm space-y-5 z-10"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-text-primary font-bold text-lg font-display">Novo cliente</h3>
          <button onClick={onClose} className="text-muted hover:text-white"><X size={18} /></button>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-muted font-bold uppercase tracking-widest">Nome *</label>
            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nome da empresa ou pessoa"
              className="input-base"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-muted font-bold uppercase tracking-widest">Telefone</label>
            <input
              value={phone}
              onChange={e => setPhone(maskPhone(e.target.value))}
              placeholder="(00) 0 0000-0000"
              inputMode="tel"
              className="input-base"
            />
          </div>
        </div>

        <button
          disabled={!name.trim()}
          onClick={() => onCreate({ name: name.trim(), phone })}
          className="w-full py-4 rounded-2xl bg-accent text-white font-bold text-sm disabled:opacity-40 active:opacity-80 transition-opacity"
        >
          Adicionar cliente
        </button>
      </motion.div>
    </motion.div>
  );
};

// ─── QuickProposal ────────────────────────────────────────────────────────────
const QuickProposal = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [clients, setClients] = useState([]);
  const [company, setCompany] = useState(null);
  const [defaultTemplate, setDefaultTemplate] = useState(null);

  const [clientQuery, setClientQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [showClientList, setShowClientList] = useState(false);
  const [showNewClient, setShowNewClient] = useState(false);

  const [object, setObject] = useState('');
  const [rawValue, setRawValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const clientInputRef = useRef(null);

  useEffect(() => {
    fetchClients().then(setClients).catch(() => {});
    Promise.all([fetchCompany(), fetchTemplates()])
      .then(([comp, tpls]) => {
        setCompany(comp);
        const def = tpls.find(t => t.isDefault);
        if (def) setDefaultTemplate(def);
      })
      .catch(() => {});
  }, []);

  const filteredClients = clients.filter(c =>
    (c.name || '').toLowerCase().includes(clientQuery.toLowerCase())
  ).slice(0, 6);

  const handleSelectClient = (client) => {
    setSelectedClient(client);
    setClientQuery(client.name);
    setShowClientList(false);
  };

  const handleCreateClient = (newClient) => {
    const tempClient = { id: null, ...newClient };
    setSelectedClient(tempClient);
    setClientQuery(newClient.name);
    setShowNewClient(false);
    setShowClientList(false);
  };

  const handleValueInput = (e) => {
    const formatted = formatCurrency(e.target.value);
    setRawValue(formatted);
  };

  const buildDefaultCond = () => {
    const tpl = defaultTemplate;
    if (tpl && tpl.level === 'CUSTOM' && tpl.defaults) {
      const d = tpl.defaults;
      return {
        entrada: d.downPaymentPct !== undefined ? String(d.downPaymentPct) : String(company?.defaultDownPaymentPct ?? 20),
        prazoEntrada: d.downPaymentDays !== undefined ? String(d.downPaymentDays) : String(company?.defaultDownPaymentDays ?? 45),
        medicao: d.measurementDays !== undefined ? String(d.measurementDays) : String(company?.defaultMeasurementDays ?? 10),
        prazoNF: String(company?.defaultPaymentNfDays ?? 60),
        validade: String(company?.defaultValidityDays ?? 60),
        prazoExec: '',
        formaPagamento: company?.defaultPaymentMethod || '',
        obs: '',
        tipoProposta: 'valor_fechado',
      };
    }
    return {
      entrada: String(company?.defaultDownPaymentPct ?? 20),
      prazoEntrada: String(company?.defaultDownPaymentDays ?? 45),
      medicao: String(company?.defaultMeasurementDays ?? 10),
      prazoNF: String(company?.defaultPaymentNfDays ?? 60),
      validade: String(company?.defaultValidityDays ?? 60),
      prazoExec: '',
      formaPagamento: company?.defaultPaymentMethod || '',
      obs: '',
      tipoProposta: defaultTemplate?.level === 'BASIC' ? 'valor_fechado' : 'valor_fechado',
    };
  };

  const handleCreate = async () => {
    if (!selectedClient && !clientQuery.trim()) {
      toast({ message: 'Informe o cliente', type: 'warning' });
      return;
    }
    if (!object.trim()) {
      toast({ message: 'Informe o objeto do contrato', type: 'warning' });
      return;
    }

    const total = parseCurrency(rawValue);
    const clientName = selectedClient?.name || clientQuery.trim();

    const cond = buildDefaultCond();
    const items = total > 0 ? [{
      id: 'ITEM.01',
      catalogId: null,
      label: object,
      unit: 'UNID.',
      qty: 1,
      price: total,
      category: 'SERVICO',
    }] : [];

    setIsSaving(true);
    try {
      const saved = await saveProposal({
        cliente: {
          nome: clientName,
          contato: selectedClient?.contact || '',
          cargo: '',
          local: selectedClient?.location || '',
          tel: selectedClient?.phone || '',
          objeto: object,
        },
        items,
        cond,
        templateId: defaultTemplate?.id || null,
      });
      toast({ message: 'Proposta criada!', type: 'success' });
      navigate(`/propostas/editar/geral/${saved.id}`);
    } catch (err) {
      toast({ message: 'Erro ao criar proposta', type: 'error' });
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const canCreate = (selectedClient || clientQuery.trim()) && object.trim();

  return (
    <>
      <AnimatePresence>
        {showNewClient && (
          <NewClientModal onClose={() => setShowNewClient(false)} onCreate={handleCreateClient} />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg mx-auto px-0 pt-2 pb-10 space-y-6"
      >
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold font-display text-text-primary">⚡ Proposta Rápida</h1>
          <p className="text-muted text-sm mt-1">Crie uma proposta em segundos com os campos essenciais. Para mais detalhes, use o Formulário Completo.</p>
        </div>

        {/* ── Client field ──────────────────────────────────────────────── */}
        <div className="space-y-2">
          <label className="text-[10px] text-muted font-bold uppercase tracking-widest">Cliente *</label>
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
            <input
              ref={clientInputRef}
              value={clientQuery}
              onChange={e => {
                setClientQuery(e.target.value);
                setSelectedClient(null);
                setShowClientList(true);
              }}
              onFocus={() => setShowClientList(true)}
              placeholder="Buscar ou digitar nome..."
              className="input-base pl-10"
            />
            {clientQuery && (
              <button
                onClick={() => { setClientQuery(''); setSelectedClient(null); clientInputRef.current?.focus(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-white"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Client dropdown */}
          <AnimatePresence>
            {showClientList && clientQuery && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="bg-surface border border-border rounded-2xl overflow-hidden shadow-2xl"
              >
                {filteredClients.map(c => (
                  <button
                    key={c.id}
                    onClick={() => handleSelectClient(c)}
                    className="flex items-center gap-3 w-full px-4 py-3 hover:bg-white/5 transition-colors text-left border-b border-border/30 last:border-0"
                  >
                    <div className="w-8 h-8 bg-accent/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <User size={14} className="text-accent2" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{c.name}</div>
                      {c.location && <div className="text-[10px] text-muted">{c.location}</div>}
                    </div>
                    <ChevronRight size={14} className="text-muted ml-auto" />
                  </button>
                ))}

                {/* Create new option */}
                <button
                  onClick={() => { setShowClientList(false); setShowNewClient(true); }}
                  className="flex items-center gap-3 w-full px-4 py-3 hover:bg-accent/5 transition-colors text-left"
                >
                  <div className="w-8 h-8 bg-accent rounded-xl flex items-center justify-center flex-shrink-0">
                    <Plus size={14} className="text-white" />
                  </div>
                  <div className="text-sm font-bold text-accent2">
                    Criar "{clientQuery}"
                  </div>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Selected client indicator */}
          {selectedClient && (
            <div className="flex items-center gap-2 px-1">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span className="text-[11px] text-success font-bold">Cliente selecionado</span>
            </div>
          )}
        </div>

        {/* ── Object field ──────────────────────────────────────────────── */}
        <div className="space-y-2">
          <label className="text-[10px] text-muted font-bold uppercase tracking-widest">Objeto do contrato *</label>
          <input
            value={object}
            onChange={e => setObject(e.target.value)}
            placeholder="Ex.: Revestimento impermeável de piso industrial"
            className="input-base"
          />
        </div>

        {/* ── Value field ───────────────────────────────────────────────── */}
        <div className="space-y-2">
          <label className="text-[10px] text-muted font-bold uppercase tracking-widest">
            Valor total <span className="text-muted/50 normal-case font-normal">(opcional)</span>
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-bold text-sm pointer-events-none flex items-center gap-1">
              <DollarSign size={14} />
              R$
            </div>
            <input
              value={rawValue}
              onChange={handleValueInput}
              onFocus={e => e.target.select()}
              inputMode="decimal"
              pattern="[0-9]*"
              placeholder="0,00"
              className="input-base pl-14 text-xl font-bold text-right"
            />
          </div>
          <p className="text-[10px] text-muted px-1">Pode ser preenchido depois no formulário completo.</p>
        </div>

        {/* ── Create button ─────────────────────────────────────────────── */}
        <button
          onClick={handleCreate}
          disabled={!canCreate || isSaving}
          className="w-full py-5 rounded-2xl bg-accent text-white font-black text-base flex items-center justify-center gap-3 disabled:opacity-40 active:opacity-80 transition-all shadow-xl shadow-accent/30"
        >
          {isSaving ? 'Criando...' : <>Criar proposta <ArrowRight size={20} /></>}
        </button>

        {/* ── Full form link ────────────────────────────────────────────── */}
        <div className="text-center">
          <button
            onClick={() => navigate('/propostas/nova')}
            className="text-muted text-sm font-bold hover:text-white transition-colors"
          >
            Precisa de mais detalhes? → Formulário completo
          </button>
        </div>
      </motion.div>
    </>
  );
};

export default QuickProposal;
