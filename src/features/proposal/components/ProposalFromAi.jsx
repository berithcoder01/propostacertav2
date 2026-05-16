import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader, ArrowRight, Check, X, Wand2, Lock } from 'lucide-react';
import Button from '../../../shared/Button';
import { useToast } from '../../../shared/context/ToastContext';
import { useAuth } from '../../../shared/context/AuthContext';
import { useUpgrade } from '../../../shared/context/UpgradeContext';
import { fetchClients, fetchCatalog, saveProposal, fetchNextProposalNumber } from '../../../shared/services/api';
import { fmt } from '../constants';

const ProposalFromAi = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState('');
  const [clientData, setClientData] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    clientLocation: '',
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [clients, setClients] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const { checkPlanLimit } = useAuth();
  const { openUpgrade } = useUpgrade();
  const aiEnabled = checkPlanLimit('ai');

  // Bloqueia acesso direto se IA não está habilitada
  useEffect(() => {
    let mounted = true;
    if (!aiEnabled && mounted) {
      openUpgrade();
    }
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchClients().then(setClients).catch(() => {});
    fetchCatalog().then(setCatalog).catch(() => {});
  }, []);

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast({ message: 'Descreva o projeto para a IA', type: 'warning' });
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await fetch('/api/ai/generate-proposal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('@propostacerta:token')}`
        },
        body: JSON.stringify({ description, ...clientData })
      }).then(r => r.json());

      if (data.error) throw new Error(data.error);

      // Normalizar para formato compatível com saveProposal
      const normalized = {
        ...data,
        items: (data.items || []).map(item => ({
          ...item,
          qty: item.quantity,
          price: item.unitPrice,
          catalogId: item.catalogId || null,
        })),
        conditions: {
          ...data.conditions,
          entrada: String(data.conditions?.downPayment || ''),
          prazoEntrada: String(data.conditions?.downPaymentDays || ''),
          medicao: String(data.conditions?.measurementDays || ''),
          prazoNF: String(data.conditions?.paymentNfDays || ''),
          validade: String(data.conditions?.validityDays || '60'),
          formaPagamento: data.conditions?.paymentTerms || '',
          obs: data.conditions?.observations || '',
          tipoProposta: 'valor_fechado',
        },
      };

      setResult(normalized);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Erro ao gerar proposta com IA');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!result) return;

    setSaving(true);
    try {
      const propNum = await fetchNextProposalNumber();

      await saveProposal({
        cliente: {
          nome: result.clientName || clientData.clientName || '',
          contato: result.clientContact || clientData.clientPhone || '',
          cargo: '',
          local: result.clientLocation || clientData.clientLocation || '',
          tel: result.clientPhone || clientData.clientPhone || '',
          objeto: result.object || description,
        },
        items: result.items || [],
        cond: {
          entrada: String(result.conditions?.downPayment || result.conditions?.entrada || '20'),
          prazoEntrada: String(result.conditions?.downPaymentDays || result.conditions?.prazoEntrada || '45'),
          medicao: String(result.conditions?.measurementDays || result.conditions?.medicao || '10'),
          prazoNF: String(result.conditions?.paymentNfDays || result.conditions?.prazoNF || '60'),
          validade: String(result.conditions?.validityDays || result.conditions?.validade || '60'),
          prazoExec: result.conditions?.executionPeriod || '',
          formaPagamento: result.conditions?.paymentTerms || result.conditions?.formaPagamento || '',
          obs: result.conditions?.observations || result.conditions?.obs || '',
          tipoProposta: result.conditions?.tipoProposta || 'valor_fechado',
        },
        propNum,
      });

      toast({ message: 'Proposta criada com sucesso!', type: 'success' });
      setStep(3);
    } catch (err) {
      toast({ message: 'Erro ao salvar: ' + err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setResult(null);
    setError(null);
    setDescription('');
    setClientData({ clientName: '', clientPhone: '', clientEmail: '', clientLocation: '' });
  };

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {step === 1 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-surface border border-accent/30 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Wand2 size={18} className="text-accent" />
              <span className="font-bold text-accent2 text-sm">IA Geradora de Propostas</span>
            </div>
            <p className="text-[11px] text-muted leading-relaxed">
              Descreva o projeto em poucas palavras e a IA montará a proposta automaticamente com itens do seu catálogo, condições comerciais e dados do cliente.
            </p>
          </div>

          {/* Descrição do projeto */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted">Descrição do Projeto *</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Ex.: Reforma residencial completa - 3 quartos, sala, cozinha e banheiro. Inclui pintura, elétrica e hidráulica."
              className="w-full bg-bg border-2 border-border rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-accent resize-none h-28"
            />
          </div>

          {/* Dados do Cliente */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted">Nome do Cliente</label>
              <input
                type="text"
                value={clientData.clientName}
                onChange={e => setClientData(p => ({ ...p, clientName: e.target.value }))}
                placeholder="Nome ou empresa"
                className="input-base mt-1"
                list="clientes-list"
              />
              <datalist id="clientes-list">
                {clients.map(c => <option key={c.id} value={c.name} />)}
              </datalist>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted">Local / Cidade</label>
              <input
                type="text"
                value={clientData.clientLocation}
                onChange={e => setClientData(p => ({ ...p, clientLocation: e.target.value }))}
                placeholder="Ex.: Marialva - PR"
                className="input-base mt-1"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted">Telefone</label>
              <input
                type="text"
                value={clientData.clientPhone}
                onChange={e => setClientData(p => ({ ...p, clientPhone: e.target.value }))}
                placeholder="(00) 99999-9999"
                className="input-base mt-1"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted">E-mail</label>
              <input
                type="email"
                value={clientData.clientEmail}
                onChange={e => setClientData(p => ({ ...p, clientEmail: e.target.value }))}
                placeholder="contato@email.com"
                className="input-base mt-1"
              />
            </div>
          </div>

          {error && (
            <div className="bg-danger/20 border border-danger/30 text-danger text-sm font-bold p-3 rounded-xl">
              {error}
            </div>
          )}

          <Button onClick={handleGenerate} disabled={loading || !description.trim()} className="w-full flex items-center gap-2">
            {loading ? <><Loader size={18} className="animate-spin" /> Gerando...</> : <>
              <Sparkles size={18} /> Gerar Proposta com IA
            </>}
          </Button>
        </motion.div>
      )}

      {step === 2 && result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold font-display text-text-primary">Proposta Gerada</h2>
              <p className="text-xs text-muted">Revise e ajuste antes de salvar</p>
            </div>
            <Button variant="ghost" onClick={handleReset} className="flex items-center gap-1">
              <X size={16} /> Nova
            </Button>
          </div>

          {/* Cliente */}
          <div className="bg-surface border border-border rounded-xl p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted mb-2">Cliente</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-muted">Nome:</span> {result.clientName || '-'}</div>
              <div><span className="text-muted">Contato:</span> {result.clientContact || '-'}</div>
              <div><span className="text-muted">Local:</span> {result.clientLocation || '-'}</div>
              <div><span className="text-muted">Telefone:</span> {result.clientPhone || '-'}</div>
            </div>
          </div>

          {/* Itens */}
          <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Itens do Escopo</p>
            {result.items && result.items.length > 0 ? (
              result.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between bg-bg rounded-lg p-3 border border-border/50">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-white truncate">{item.label}</div>
                    <div className="text-[10px] text-muted">{item.quantity} {item.unit} · {item.category}</div>
                  </div>
                  <div className="font-bold text-accent2 ml-4">{fmt(item.quantity * item.unitPrice)}</div>
                </div>
              ))
            ) : (
              <p className="text-muted text-sm text-center py-2">Nenhum item gerado</p>
            )}
            {result.items && result.items.length > 0 && (
              <div className="flex justify-between items-center pt-2 border-t border-border">
                <span className="text-sm font-bold text-accent2">Total: {fmt(result.total)}</span>
              </div>
            )}
          </div>

          {/* Condições */}
          <div className="bg-surface border border-border rounded-xl p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted mb-2">Condições Comerciais</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <div><span className="text-muted">Entrada:</span> {result.conditions?.downPayment || '-'}%</div>
              <div><span className="text-muted">Prazo Entrada:</span> {result.conditions?.downPaymentDays || '-'} dias</div>
              <div><span className="text-muted">Medição:</span> {result.conditions?.measurementDays || '-'} dias</div>
              <div><span className="text-muted">Prazo NF:</span> {result.conditions?.paymentNfDays || '-'} dias</div>
              <div><span className="text-muted">Validade:</span> {result.conditions?.validityDays || '-'} dias</div>
              <div><span className="text-muted">Pagamento:</span> {result.conditions?.paymentTerms || '-'}</div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="ghost" onClick={handleReset} className="flex-1">
              Gerar Outra
            </Button>
            <Button onClick={handleSave} disabled={saving} className="flex-1 flex items-center gap-2">
              {saving ? <><Loader size={18} className="animate-spin" /> Salvando...</> : <>
                <Check size={18} /> Salvar Proposta
              </>}
            </Button>
          </div>
        </motion.div>
      )}

      {step === 3 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10 space-y-4">
          <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto text-success text-3xl">
            ✓
          </div>
          <h3 className="text-xl font-bold font-display text-text-primary">Proposta Salva!</h3>
          <p className="text-muted text-sm">A IA criou e salvou sua proposta automaticamente.</p>
          <Button onClick={handleReset} className="flex items-center gap-2 mx-auto">
            Gerar Outra Proposta <Sparkles size={16} />
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ProposalFromAi;