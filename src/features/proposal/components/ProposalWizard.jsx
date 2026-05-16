import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Plus, ListChecks, Share2, RefreshCw, X, Settings } from 'lucide-react';
import Stepper from '../../../shared/Stepper';
import Button from '../../../shared/Button';
import { useToast } from '../../../shared/context/ToastContext';
import { saveProposal, updateProposal, fetchCompany, fetchProposalById, fetchNextProposalNumber, createTemplate, fetchTemplates, updateCompany } from '../../../shared/services/api';
import SegmentSelector from './SegmentSelector';
import BlockConfigurator from './BlockConfigurator';
import { SEGMENTS } from '../constants';
import ProposalTemplateWizard from './ProposalTemplateWizard';
import ProposalTemplatePicker from './ProposalTemplatePicker';
import PdfGenerator from './PdfGenerator';

// ── Code-split step components (loaded on demand) ────────────────────────────────
const StepCliente = React.lazy(() => import('./StepCliente'));
const StepServicosCondicoes = React.lazy(() => import('./StepServicosCondicoes'));
const StepRevisao = React.lazy(() => import('./StepRevisao'));
const ShareButton = React.lazy(() => import('./ShareButton'));
const AiChatWidget = React.lazy(() => import('./AiChatWidget'));

const STEPS = ['Cliente', 'Serviços & Condições', 'Revisão'];
const DRAFT_KEY = '@propostacerta:draft';

const timeAgo = (iso) => {
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60) return 'agora mesmo';
  if (diff < 3600) return `${Math.floor(diff / 60)} min atrás`;
  return `${Math.floor(diff / 3600)}h atrás`;
};

const ProposalWizard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const tipoFromUrl = new URLSearchParams(location.search).get('tipo');

  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(!!id);
  const [savedProposal, setSavedProposal] = useState(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [hasDraft, setHasDraft] = useState(null);
  const [company, setCompany] = useState(null);
  const [showTemplateWizard, setShowTemplateWizard] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);

  const [propNum, setPropNum] = useState('...');
  const [cliente, setCliente] = useState({ nome: '', contato: '', cargo: '', local: '', tel: '', objeto: '' });
  const [items, setItems] = useState([]);
  const [segment, setSegment] = useState('SERVICOS');
  const [activeBlocks, setActiveBlocks] = useState(['escopo', 'condicoes', 'garantia', 'observacoes']);
  const [showSegmentConfig, setShowSegmentConfig] = useState(false);
  const [cond, setCond] = useState({
    entrada: '20', prazoEntrada: '45', medicao: '10', prazoNF: '60',
    validade: '60', prazoExec: '', formaPagamento: '', obs: '',
    tipoProposta: tipoFromUrl || 'valor_fechado',
  });

  const refreshCompany = async () => {
    try {
      const data = await fetchCompany();
      setCompany(data);
      return data;
    } catch (err) {
      console.error(err);
    }
  };

  // ── Restore draft (only on new proposals) ─────────────────────────────────
  useEffect(() => {
    if (!id) {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        try {
          const draft = JSON.parse(raw);
          if (draft?.cliente?.nome) setHasDraft(draft);
        } catch {}
      }
    }
  }, []);

  // ── Auto-save draft on every step change ──────────────────────────────────
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (id || isFirstRender.current) { isFirstRender.current = false; return; }
    const draft = { cliente, items, cond, propNum, step, savedAt: new Date().toISOString() };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [step, cliente, items, cond]);

  // ── Load company defaults & proposal for editing ───────────────────────────
  useEffect(() => {
    refreshCompany().then(data => {
      if (data && !id && !hasDraft) {
        setCond(prev => ({
          ...prev,
          entrada: String(data.defaultDownPaymentPct ?? 20),
          prazoEntrada: String(data.defaultDownPaymentDays ?? 45),
          medicao: String(data.defaultMeasurementDays ?? 10),
          prazoNF: String(data.defaultPaymentNfDays ?? 60),
          validade: String(data.defaultValidityDays ?? 60),
          warrantyPeriod: String(data.defaultWarrantyPeriod ?? 5),
          warrantyType: data.defaultWarrantyType || 'ANOS',
          prazoExec: data.defaultExecutionPeriod || '',
          formaPagamento: data.defaultPaymentMethod || '',
        }));

        if (!data.templateOnboardingDone) {
          fetchTemplates().then(tpls => {
            setTemplates(tpls);
            if (tpls.length > 0) {
              setShowTemplatePicker(true);
            } else {
              setShowTemplateWizard(true);
            }
          }).catch(() => setShowTemplateWizard(true));
        }
      }
    });

    if (id) {
      fetchProposalById(id)
        .then(p => {
          setPropNum(p.number);
          setCliente({ nome: p.clientName || '', contato: p.clientContact || '', cargo: p.clientRole || '', local: p.clientLocation || '', tel: p.clientPhone || '', objeto: p.object || '' });
          setItems(p.items.map(it => ({ id: it.id || it.catalogId, catalogId: it.catalogId, label: it.label, unit: it.unit, qty: it.quantity, price: it.unitPrice, category: it.category })));
          const c = p.conditions;
          if (c) {
            setCond({ entrada: String(c.downPayment || ''), prazoEntrada: String(c.downPaymentDays || ''), medicao: String(c.measurementDays || ''), prazoNF: String(c.paymentNfDays || ''), validade: String(c.validityDays || ''), prazoExec: c.executionPeriod || '', formaPagamento: c.paymentTerms || '', obs: c.observations || '', tipoProposta: p.segmentData?.tipoProposta || 'valor_fechado' });
          }
          setIsLoading(false);
        })
        .catch(() => {
          toast({ message: 'Erro ao carregar proposta para edição', type: 'error' });
          navigate('/propostas');
        });
    } else {
      fetchNextProposalNumber()
        .then(num => {
          if (!hasDraft || !hasDraft.propNum) {
            setPropNum(num);
          }
        })
        .catch(() => setPropNum('ERR'))
        .finally(() => setIsLoading(false));
    }
  }, [id, hasDraft]);

  const restoreDraft = () => {
    const draft = hasDraft;
    setCliente(draft.cliente);
    setItems(draft.items || []);
    setCond(draft.cond);
    setPropNum(draft.propNum);
    setStep(draft.step || 0);
    setHasDraft(null);
  };

  const discardDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setHasDraft(null);
  };

  const handleTemplateWizardSave = async (templateData) => {
    try {
      const created = await createTemplate(templateData);
      setSelectedTemplateId(created.id);
      
      const newCond = {};
      if (templateData.sections) {
        newCond.showPagamento = !!templateData.sections.paymentConditions;
        newCond.showGarantias = !!templateData.sections.guarantees;
      }

      if (templateData.defaults) {
        const d = templateData.defaults;
        newCond.entrada = d.downPaymentPct !== undefined ? String(d.downPaymentPct) : undefined;
        newCond.prazoEntrada = d.downPaymentDays !== undefined ? String(d.downPaymentDays) : undefined;
        newCond.medicao = d.measurementDays !== undefined ? String(d.measurementDays) : undefined;
        newCond.warrantyPeriod = d.warrantyPeriod || undefined;
        newCond.warrantyType = d.warrantyType || undefined;
        newCond.tipoProposta = templateData.level === 'BASIC' ? 'valor_fechado' : undefined;
      }
      
      if (templateData.customFields && Array.isArray(templateData.customFields)) {
        // Mapeia 'name' do modelo para 'title' do form de propostas
        newCond.customFields = templateData.customFields.map(cf => ({
          id: cf.id || `cf_${Date.now()}_${Math.random()}`,
          title: cf.name,
          value: ''
        }));
      }
      
      setCond(prev => ({ ...prev, ...Object.fromEntries(Object.entries(newCond).filter(([_, v]) => v !== undefined)) }));
      
      await updateCompany({ ...company, templateOnboardingDone: true });
      await refreshCompany();
    } catch (err) {
      console.error('Erro ao salvar modelo:', err);
    }
    setShowTemplateWizard(false);
  };

  const handleTemplateWizardSkip = async () => {
    try {
      await updateCompany({ ...company, templateOnboardingDone: true });
      await refreshCompany();
    } catch (err) {
      console.error('Erro ao pular onboarding:', err);
    }
    setShowTemplateWizard(false);
  };

  const handleTemplatePickerSelect = (templateId) => {
    setSelectedTemplateId(templateId === '__basic__' ? null : templateId);
    const tpl = templates.find(t => t.id === templateId);
    if (tpl) {
      const newCond = {};
      if (tpl.sections) {
        const sectionMap = {
          paymentConditions: 'condicoes',
          guarantees: 'garantia',
          executionAndValidity: 'escopo',
          observations: 'observacoes',
          scope: 'escopo',
          cronograma: 'cronograma',
          beneficios: 'beneficios',
          entrega: 'entrega',
          suporte: 'suporte',
          normas: 'normas',
        };
        const activeBlocksFromSections = Object.entries(tpl.sections)
          .filter(([, v]) => v === true)
          .map(([k]) => sectionMap[k] || k);
        setActiveBlocks(activeBlocksFromSections);
        
        newCond.showPagamento = !!tpl.sections.paymentConditions;
        newCond.showGarantias = !!tpl.sections.guarantees;
      }
      
      if (tpl.defaults) {
        const d = tpl.defaults;
        newCond.entrada = d.downPaymentPct !== undefined ? String(d.downPaymentPct) : undefined;
        newCond.prazoEntrada = d.downPaymentDays !== undefined ? String(d.downPaymentDays) : undefined;
        newCond.medicao = d.measurementDays !== undefined ? String(d.measurementDays) : undefined;
        newCond.warrantyPeriod = d.warrantyPeriod || undefined;
        newCond.warrantyType = d.warrantyType || undefined;
      }
      if (tpl.customFields && Array.isArray(tpl.customFields)) {
        newCond.customFields = tpl.customFields;
      }
      
      setCond(prev => ({ ...prev, ...Object.fromEntries(Object.entries(newCond).filter(([_, v]) => v !== undefined)) }));
    }
    setShowTemplatePicker(false);
  };

  const handleTemplatePickerCreateNew = () => {
    setShowTemplatePicker(false);
    setShowTemplateWizard(true);
  };

  const triggerHaptic = () => {
    if (navigator.vibrate) {
      navigator.vibrate([50, 50, 50]);
    }
  };

  const handleGenerate = async () => {
    try {
      let saved;
      if (id) {
        saved = await updateProposal(id, { cliente, items, cond, propNum });
      } else {
        saved = await saveProposal({ cliente, items, cond, propNum, templateId: selectedTemplateId });
      }
      localStorage.removeItem(DRAFT_KEY);
      triggerHaptic();
      setSavedProposal({
        id: saved?.id || id,
        number: propNum,
        clientName: cliente.nome,
        clientContact: cliente.contato,
        clientPhone: cliente.tel,
        clientRole: cliente.cargo,
        clientLocation: cliente.local,
        object: cliente.objeto,
        items,
        conditions: [{
          downPayment: cond.entrada, downPaymentDays: cond.prazoEntrada,
          measurementDays: cond.medicao, paymentNfDays: cond.prazoNF,
          executionPeriod: cond.prazoExec, paymentTerms: cond.formaPagamento,
          observations: cond.obs,
          warrantyPeriod: cond.warrantyPeriod,
          warrantyType: cond.warrantyType,
          showPagamento: cond.showPagamento,
          showWarranties: cond.showGarantias
        }],
        metadata: { tipoProposta: cond.tipoProposta, segment, activeBlocks },
        total: items.reduce((s, i) => s + (parseFloat(i.qty) || 0) * (parseFloat(i.price) || 0), 0),
      });
    } catch (err) {
      toast({ message: 'Erro ao salvar proposta', type: 'error' });
      console.error(err);
    }
  };

  const reset = () => {
    setSavedProposal(null);
    setStep(0);
    setCliente({ nome: '', contato: '', cargo: '', local: '', tel: '', objeto: '' });
    setItems([]);
    setCond({ entrada: String(company?.defaultDownPaymentPct ?? 20), prazoEntrada: String(company?.defaultDownPaymentDays ?? 45), medicao: String(company?.defaultMeasurementDays ?? 10), prazoNF: String(company?.defaultPaymentNfDays ?? 60), validade: String(company?.defaultValidityDays ?? 60), prazoExec: '', formaPagamento: company?.defaultPaymentMethod || '', obs: '', tipoProposta: 'valor_fechado', customFields: [] });
    setPropNum(() => { const y = new Date().getFullYear(); const m = String(new Date().getMonth() + 1).padStart(2, '0'); return `${y}-${m}-${Math.floor(Math.random() * 900) + 100}`; });
  };

  const touchStart = useRef(null);
  const touchEnd = useRef(null);

  const handleTouchStart = useCallback((e) => {
    touchStart.current = e.changedTouches[0].screenX;
  }, []);

  const handleTouchEnd = useCallback((e) => {
    touchEnd.current = e.changedTouches[0].screenX;
    if (!touchStart.current || !touchEnd.current) return;
    const diff = touchStart.current - touchEnd.current;
    if (Math.abs(diff) < 50) return;
    if (diff > 0 && step < 2) setStep((s) => s + 1);
    if (diff < 0 && step > 0) setStep((s) => s - 1);
    touchStart.current = null;
    touchEnd.current = null;
  }, [step]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowRight' && step < 2) setStep((s) => s + 1);
      if (e.key === 'ArrowLeft' && step > 0) setStep((s) => s - 1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [step]);

  if (isLoading) return <div className="p-10 text-muted font-bold">Carregando proposta...</div>;

  if (showTemplateWizard && company) {
    return (
      <ProposalTemplateWizard
        businessType={company.businessType || 'SERVICE_ONLY'}
        segment={company.segment || 'OUTRO'}
        company={company}
        onSave={handleTemplateWizardSave}
        onSkip={handleTemplateWizardSkip}
      />
    );
  }

  if (savedProposal) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-sm mx-auto text-center py-10 space-y-6"
      >
        <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto">
          <span className="text-4xl">✓</span>
        </div>
        <div>
          <h2 className="text-2xl font-black font-display text-white">Proposta criada!</h2>
          <p className="text-muted text-sm mt-1">{savedProposal.number} · {savedProposal.clientName}</p>
        </div>

        <div className="space-y-3">
          {/* NOVO MOTOR DE PDF: PdfGenerator unificado */}
          <PdfGenerator 
            proposal={savedProposal} 
            onDone={() => setGeneratingPdf(false)}
            triggerDownload={generatingPdf}
          />
          
          <button
            onClick={() => setGeneratingPdf(true)}
            disabled={generatingPdf}
            className="w-full py-4 rounded-2xl bg-accent text-white font-bold flex items-center justify-center gap-3 text-sm active:opacity-80 transition-opacity disabled:opacity-60"
          >
            <Download size={18} /> {generatingPdf ? 'Gerando...' : 'Baixar PDF'}
          </button>

          <Suspense fallback={null}>
            <ShareButton proposalId={savedProposal.id} variant="green" />
          </Suspense>
          <button
            onClick={reset}
            className="w-full py-4 rounded-2xl bg-surface border-2 border-border text-muted font-bold flex items-center justify-center gap-3 text-sm hover:text-white transition-colors"
          >
            <Plus size={18} /> Nova proposta
          </button>
          <button
            onClick={() => navigate('/propostas')}
            className="w-full py-3 text-muted text-sm font-bold hover:text-white transition-colors flex items-center justify-center gap-2"
          >
            <ListChecks size={16} /> Ver todas as propostas
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div
      className="w-full max-w-4xl mx-auto"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <AnimatePresence>
        {hasDraft && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-accent/10 border border-accent/30 rounded-xl px-4 py-3 flex items-center justify-between mb-6"
          >
            <div className="flex items-center gap-2">
              <RefreshCw size={14} className="text-accent2" />
              <span className="text-accent2 text-sm font-bold">
                Rascunho salvo · {timeAgo(hasDraft.savedAt)}
              </span>
            </div>
            <div className="flex gap-3">
              <button onClick={restoreDraft} className="text-accent2 text-sm font-bold hover:underline">Continuar</button>
              <button onClick={discardDraft} className="text-muted text-sm hover:text-white">
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showTemplatePicker && (
        <ProposalTemplatePicker
          templates={templates}
          onSelect={handleTemplatePickerSelect}
          onCreateNew={handleTemplatePickerCreateNew}
        />
      )}

      <div className="mb-12">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center font-black text-xl">P</div>
            <div>
              <div className="font-display font-black text-lg leading-none">Proposta<span className="text-accent2">Certa</span></div>
              <div className="text-[9px] text-muted font-bold uppercase tracking-widest mt-1">Propostas Comerciais</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-[11px] font-bold text-muted bg-surface px-4 py-2 rounded-full border border-border">
              PROPOSTA: <span className="text-white ml-1">{propNum}</span>
            </div>
            <button
              onClick={() => setShowSegmentConfig(!showSegmentConfig)}
              className={`p-2 rounded-xl border-2 transition-colors ${showSegmentConfig ? 'border-accent bg-accent/10 text-accent' : 'border-border text-muted hover:text-white'}`}
              title="Configurar segmento e blocos"
            >
              <Settings size={18} />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showSegmentConfig && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 bg-surface border-2 border-border rounded-2xl p-4 space-y-4 overflow-hidden"
            >
              <SegmentSelector selected={segment} onChange={(seg) => {
                setSegment(seg);
                setActiveBlocks(SEGMENTS[seg]?.defaultBlocks || ['escopo', 'condicoes', 'observacoes']);
              }} />
              <div className="border-t border-border pt-4">
                <BlockConfigurator
                  segment={segment}
                  activeBlocks={activeBlocks}
                  onToggle={(block) => {
                    setActiveBlocks(prev =>
                      prev.includes(block) ? prev.filter(b => b !== block) : [...prev, block]
                    );
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Stepper current={step} steps={STEPS} onStepClick={(index) => setStep(index)} />
      </div>

      <div className="min-h-[400px]">
        <Suspense fallback={<div className="flex items-center justify-center py-10"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>}>
          {step === 0 && <StepCliente data={cliente} onChange={setCliente} onNext={() => setStep(1)} />}
          {step === 1 && (
            <StepServicosCondicoes
              items={items}
              onChangeItems={setItems}
              cond={cond}
              onChangeCond={setCond}
              tipoProposta={cond.tipoProposta}
              onTipoChange={val => setCond(prev => ({ ...prev, tipoProposta: val }))}
              onNext={() => setStep(2)}
              onBack={() => setStep(0)}
            />
          )}
          {step === 2 && <StepRevisao cliente={cliente} items={items} cond={cond} propNum={propNum} companySettings={company} savedProposal={savedProposal} onBack={() => setStep(1)} onGenerate={handleGenerate} proposalId={id || savedProposal?.id || null} visible={step === 2} segment={segment} activeBlocks={activeBlocks} />}
        </Suspense>
      </div>

      <Suspense fallback={null}>
        <AiChatWidget proposalId={id} />
      </Suspense>
    </div>
  );
};

export default ProposalWizard;
