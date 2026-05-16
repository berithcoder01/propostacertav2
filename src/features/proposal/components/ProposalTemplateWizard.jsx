import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check, Plus, X, FileText, Settings2, Sparkles } from 'lucide-react';
import { useProposalSuggestions } from '../../../hooks/useProposalSuggestions';
import Button from '../../../shared/Button';

const ProposalTemplateWizard = ({ businessType, segment, company, onSave, onSkip }) => {
  const [step, setStep] = useState(0);
  const [level, setLevel] = useState('BASIC');
  const [templateName, setTemplateName] = useState('');
  const [activeSections, setActiveSections] = useState({});
  const [customFields, setCustomFields] = useState([]);
  const [newField, setNewField] = useState({ name: '', type: 'TEXT_SHORT', position: 'FOOTER' });

  const suggestions = useProposalSuggestions(businessType, segment);

  React.useEffect(() => {
    if (suggestions?.visibleSections) {
      setActiveSections(suggestions.visibleSections);
    }
  }, [suggestions]);

  const toggleSection = (key) => {
    setActiveSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const addCustomField = () => {
    if (!newField.name.trim()) return;
    setCustomFields([...customFields, { ...newField, id: `cf_${Date.now()}` }]);
    setNewField({ name: '', type: 'TEXT_SHORT', position: 'FOOTER' });
  };

  const removeCustomField = (id) => {
    setCustomFields(customFields.filter(f => f.id !== id));
  };

  const handleSave = async () => {
    const templateData = {
      name: templateName || (level === 'BASIC' ? 'Proposta Básica' : 'Modelo Personalizado'),
      level,
      isDefault: true,
      sections: level === 'CUSTOM' ? activeSections : {},
      customFields: level === 'CUSTOM' && customFields.length > 0 ? customFields : null,
      wording: level === 'CUSTOM' ? suggestions?.wording : null,
      defaults: level === 'CUSTOM' ? {
        downPaymentPct: suggestions?.suggestedDefaults?.downPaymentPct,
        downPaymentDays: suggestions?.suggestedDefaults?.downPaymentDays,
        measurementDays: suggestions?.suggestedDefaults?.measurementDays,
        warrantyPeriod: suggestions?.suggestedDefaults?.warrantyPeriod,
        warrantyType: suggestions?.suggestedDefaults?.warrantyType,
      } : null,
    };
    await onSave(templateData);
  };

  const sectionLabels = {
    paymentConditions: 'Condições de Pagamento',
    guarantees: 'Garantias',
    executionAndValidity: 'Prazo de Execução',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-surface border-2 border-border rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/20 rounded-xl">
              <FileText size={20} className="text-accent" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Como você quer sua proposta?</h2>
              <p className="text-sm text-muted">Configure uma vez e reutilize sempre.</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <button onClick={() => { setLevel('BASIC'); setStep(1); }} className={`w-full p-5 rounded-2xl border-2 transition-all text-left ${level === 'BASIC' ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/30'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${level === 'BASIC' ? 'border-accent bg-accent' : 'border-border'}`}>
                      {level === 'BASIC' && <Check size={12} className="text-white" />}
                    </div>
                    <div>
                      <div className="font-bold text-white">Básica</div>
                      <div className="text-xs text-muted">Só o essencial: cabeçalho, itens e rodapé padrão.</div>
                    </div>
                  </div>
                </button>

                <button onClick={() => { setLevel('CUSTOM'); setStep(1); }} className={`w-full p-5 rounded-2xl border-2 transition-all text-left ${level === 'CUSTOM' ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/30'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${level === 'CUSTOM' ? 'border-accent bg-accent' : 'border-border'}`}>
                      {level === 'CUSTOM' && <Check size={12} className="text-white" />}
                    </div>
                    <div>
                      <div className="font-bold text-white flex items-center gap-2">
                        <Sparkles size={14} className="text-accent" />
                        Personalizada
                      </div>
                      <div className="text-xs text-muted">Escolha quais seções incluir e salve como modelo.</div>
                    </div>
                  </div>
                </button>

                <div className="flex gap-3 pt-4">
                  <Button variant="ghost" onClick={onSkip} className="flex-1">Pular por enquanto</Button>
                </div>
              </motion.div>
            )}

            {step === 1 && level === 'CUSTOM' && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <h3 className="text-sm font-bold text-white mb-3">Quais seções incluir?</h3>
                <div className="space-y-2">
                  {Object.entries(sectionLabels).map(([key, label]) => (
                    <button key={key} onClick={() => toggleSection(key)} className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${activeSections[key] ? 'border-accent/40 bg-accent/5' : 'border-border hover:border-accent/20'}`}>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${activeSections[key] ? 'border-accent bg-accent' : 'border-border'}`}>
                        {activeSections[key] && <Check size={12} className="text-white" />}
                      </div>
                      <span className="text-sm text-white">{label}</span>
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Settings2 size={14} className="text-muted" />
                    <span className="text-xs font-bold text-muted uppercase tracking-wider">Campos personalizados</span>
                  </div>
                  <div className="flex gap-2">
                    <input type="text" value={newField.name} onChange={e => setNewField({ ...newField, name: e.target.value })} placeholder="Nome do campo" className="flex-1 bg-bg border border-border rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-accent" />
                    <select value={newField.type} onChange={e => setNewField({ ...newField, type: e.target.value })} className="bg-bg border border-border rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-accent">
                      <option value="TEXT_SHORT">Texto curto</option>
                      <option value="TEXT_LONG">Texto longo</option>
                      <option value="NUMBER">Número</option>
                      <option value="DATE">Data</option>
                    </select>
                    <button onClick={addCustomField} disabled={!newField.name.trim()} className="p-2 bg-accent/20 rounded-lg text-accent hover:bg-accent/30 disabled:opacity-40 disabled:cursor-not-allowed">
                      <Plus size={16} />
                    </button>
                  </div>
                  {customFields.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {customFields.map(f => (
                        <div key={f.id} className="flex items-center justify-between px-3 py-2 bg-bg rounded-lg">
                          <span className="text-xs text-white">{f.name} <span className="text-muted">({f.type})</span></span>
                          <button onClick={() => removeCustomField(f.id)} className="text-muted hover:text-danger"><X size={12} /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="ghost" onClick={() => setStep(0)} className="flex items-center gap-2"><ArrowLeft size={16} /> Voltar</Button>
                  <Button onClick={() => setStep(2)} className="flex items-center gap-2">Próximo <ArrowRight size={16} /></Button>
                </div>
              </motion.div>
            )}

            {step === 1 && level === 'BASIC' && (
              <motion.div key="step1basic" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl">
                  <p className="text-sm text-white font-bold mb-1">Modelo Básico selecionado</p>
                  <p className="text-xs text-muted">A proposta terá apenas cabeçalho, tabela de itens e rodapé padrão.</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="ghost" onClick={() => setStep(0)} className="flex items-center gap-2"><ArrowLeft size={16} /> Voltar</Button>
                  <Button onClick={() => setStep(2)} className="flex items-center gap-2">Próximo <ArrowRight size={16} /></Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <h3 className="text-sm font-bold text-white mb-3">Quer salvar esse modelo?</h3>
                <input type="text" value={templateName} onChange={e => setTemplateName(e.target.value)} placeholder={level === 'BASIC' ? 'Proposta Básica' : 'Ex.: Proposta Padrão Instalação'} className="w-full bg-bg border-2 border-border rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-accent" />
                <p className="text-xs text-muted">Este modelo será usado como padrão para novas propostas.</p>
                <div className="flex gap-3 pt-2">
                  <Button variant="ghost" onClick={onSkip} className="flex-1">Só continuar</Button>
                  <Button onClick={handleSave} className="flex-1 flex items-center justify-center gap-2"><Check size={16} /> Salvar e Continuar</Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default ProposalTemplateWizard;
