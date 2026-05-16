import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Plus, Trash2, Edit2, Check, X, ImageIcon, Upload, Sparkles } from 'lucide-react';
import Input from '../../shared/Input';
import Button from '../../shared/Button';
import { useAuth } from '../../shared/context/AuthContext';
import { fetchCompany, updateCompany, fetchCatalog, createCatalogItem, updateCatalogItem, deleteCatalogItem, API_URL } from '../../shared/services/api';
import { fmt } from '../proposal/constants';
import ProposalModelSelector from '../../shared/components/ProposalModelSelector';

const SEGMENTS = [
  { value: 'ELETRICA', label: 'Elétrica' },
  { value: 'CONSTRUCAO_CIVIL', label: 'Construção Civil' },
  { value: 'HIDRAULICA', label: 'Hidráulica' },
  { value: 'PINTURA', label: 'Pintura' },
  { value: 'AR_CONDICIONADO', label: 'Ar Condicionado' },
  { value: 'OUTRO', label: 'Outro' },
];

const CATEGORIES = [
  { value: 'SERVICO', label: 'Serviço' },
  { value: 'MATERIAL', label: 'Material' },
  { value: 'EQUIPAMENTO', label: 'Equipamento' },
  { value: 'MO', label: 'Mão de Obra' },
  { value: 'ADMINISTRATIVO', label: 'Administrativo' },
];

const Company = () => {
  const { company: companyFromContext, refreshCompany } = useAuth();
  const [company, setCompany] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [addingItem, setAddingItem] = useState(false);
  const [newItem, setNewItem] = useState({ description: '', unit: 'UNID.', category: 'SERVICO', defaultPrice: '', notes: '' });
  // NOVA FEATURE: Preview de logo (White Label)
  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const masks = {
    cnpj: (v) => {
      const d = v.replace(/\D/g, '').slice(0, 14);
      if (d.length <= 11) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4').replace(/-$/, '');
      return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5').replace(/-$/, '');
    },
    phone: (v) => {
      const d = v.replace(/\D/g, '').slice(0, 11);
      if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
      return d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
    },
    pix: (v) => {
      const clean = v.replace(/\D/g, '');
      if (clean.length === 11) {
        // No Brasil, celulares (11 dígitos) sempre começam com 9 após o DDD.
        // Se o 3º dígito for 9, aplicamos máscara de telefone, senão CPF.
        if (clean[2] === '9') {
          return masks.phone(clean);
        } else {
          return masks.cnpj(clean);
        }
      }
      if (clean.length === 14) return masks.cnpj(clean);
      return v; // Para e-mail ou chaves aleatórias
    }
  };

  const loadData = async () => {
    try {
      const [co, cat] = await Promise.all([
        fetchCompany().catch(() => null),
        fetchCatalog().catch(() => [])
      ]);
      setCompany(co);
      setCatalog(cat);
      if (co?.logoUrl) setLogoPreview(co.logoUrl);
      if (co) refreshCompany();
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // NOVA FEATURE: Upload de logo
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validação
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setSaveError('Formato inválido. Use PNG, JPG ou SVG.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setSaveError('Arquivo muito grande. Máximo 5MB.');
      return;
    }

    try {
      // Converter para base64 no cliente
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Preview local imediato
      setLogoPreview(base64);

      // Salvar base64 diretamente na empresa via PUT (funciona em dev e produção)
      const updatedCompany = {
        ...company,
        logoUrl: base64,
        logoType: 'uploaded',
      };
      // Remove relações antes de salvar
      const { subscription: _s, user: _u, clients: _c, catalog: _cat,
              proposals: _p, templates: _t, reminders: _r, leads: _l,
              aiChats: _a, priceResearches: _pr, id: _id,
              createdAt: _ca, updatedAt: _ua, ...cleanData } = updatedCompany;

      await updateCompany({ ...cleanData, logoUrl: base64, logoType: 'uploaded' });

      // Atualiza estado local e contexto global
      setCompany(prev => ({ ...prev, logoUrl: base64, logoType: 'uploaded' }));
      await refreshCompany(); // <- atualiza Layout/Header também

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      setSaveError('Erro no upload da logo: ' + err.message);
    }
  };

  const parseNum = (v, fallback = 0) => {
    const n = parseFloat(v);
    return isNaN(n) ? fallback : n;
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const dataToSave = {
        ...company,
        defaultDownPaymentPct: parseNum(company.defaultDownPaymentPct, 20),
        defaultDownPaymentDays: parseInt(company.defaultDownPaymentDays) || 45,
        defaultMeasurementDays: parseInt(company.defaultMeasurementDays) || 10,
        defaultPaymentNfDays: parseInt(company.defaultPaymentNfDays) || 60,
        defaultValidityDays: parseInt(company.defaultValidityDays) || 60,
        defaultValidityDays: parseInt(company.defaultValidityDays) || 60,
        defaultWarrantyPeriod: parseInt(company.defaultWarrantyPeriod) || 5,
        defaultWarrantyType: company.defaultWarrantyType || 'ANOS',
        defaultExecutionPeriod: company.defaultExecutionPeriod || '',
        defaultPaymentMethod: company.defaultPaymentMethod || '',
      };
      // Remove relation fields that Prisma cannot update directly
      delete dataToSave.subscription;
      delete dataToSave.user;
      delete dataToSave.clients;
      delete dataToSave.catalog;
      delete dataToSave.proposals;
      delete dataToSave.templates;
      delete dataToSave.reminders;
      delete dataToSave.leads;
      delete dataToSave.aiChats;
      delete dataToSave.priceResearches;
      delete dataToSave.id;
      delete dataToSave.createdAt;
      delete dataToSave.updatedAt;
      await updateCompany(dataToSave);
      await refreshCompany();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      setSaveError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const update = (field, value) => {
    setCompany(prev => ({ ...prev, [field]: value }));
  };

  const technicalData = company?.technicalData || {};
  const updateTech = (field, value) => {
    setCompany(prev => ({
      ...prev,
      technicalData: { ...(prev.technicalData || {}), [field]: value }
    }));
  };

  if (isLoading) return <div className="p-8 text-muted">Carregando...</div>;
  if (!company) return <div className="p-8 text-muted">Empresa não encontrada.</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black font-display text-white mb-2">Configurações</h1>
          <p className="text-muted">Personalize os dados da sua empresa e gerencie o catálogo.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-6">
          <Save size={18} />
          {isSaving ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>

      {saveError && <div className="bg-danger/20 border border-danger/30 text-danger font-bold p-4 rounded-xl">{saveError}</div>}
      {saveSuccess && <div className="bg-success/20 border border-success/30 text-success font-bold p-4 rounded-xl">Salvo com sucesso!</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* ... dados da empresa ... */}

        {/* SEÇÃO WHITE LABEL — NOVA */}
        <div className="bg-surface border-2 border-border p-6 rounded-2xl space-y-6">
          <h2 className="text-xl font-bold font-display text-gold border-b-2 border-border pb-2">
            <ImageIcon className="inline mr-2" size={20} /> White Label & Marca
          </h2>
          <div className="space-y-4">
            {/* Upload de Logo */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted mb-2 block">Logotipo da Empresa</label>
              <div className="flex items-center gap-4">
                {/* Preview do logo */}
                <div className="w-20 h-20 rounded-xl border-2 border-border overflow-hidden bg-bg flex items-center justify-center relative group">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
                  ) : (
                    <span className="text-3xl text-muted">{company?.name?.charAt(0) || '?'}</span>
                  )}
                  {/* Overlay de upload */}
                  <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-xl">
                    <Upload size={24} className="text-white" />
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                  </label>
                </div>
                <div className="text-xs text-muted space-y-1">
                  <p>Formatos: PNG, JPG, SVG</p>
                  <p>Máximo: 5MB</p>
                  <p className="text-accent2">Recomendado: fundo transparente</p>
                </div>
              </div>
            </div>

            {/* Tipo de logo */}
            {company?.logoUrl && (
              <div className="text-[11px]">
                <span className="text-muted">Tipo:</span>
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                  company.logoType === 'generated'
                    ? 'bg-accent/20 text-accent'
                    : 'bg-gold/20 text-gold'
                }`}>
                  {company.logoType === 'generated' ? 'IA Gerada' : 'Upload Personalizado'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Configurações PIX — NOVA */}
        <div className="bg-surface border-2 border-border p-6 rounded-2xl space-y-6">
          <h2 className="text-xl font-bold font-display text-success border-b-2 border-border pb-2">
            💳 Pix & Pagamentos
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted mb-2 block">Chave Pix</label>
              <input
                type="text"
                value={company.pixKey || ''}
                onChange={e => update('pixKey', masks.pix(e.target.value))}
                placeholder="E-mail, CPF, CNPJ ou Telefone"
                className="input-base"
              />
              <p className="text-[10px] text-muted mt-1">Informe sua chave Pix para receber pagamentos via QR Code nas propostas.</p>
            </div>
          </div>
        </div>

        {/* Modelo de Design da Proposta — NOVO */}
        <div className="md:col-span-2 bg-surface border-2 border-border p-6 rounded-2xl space-y-6">
          <h2 className="text-xl font-bold font-display text-accent border-b-2 border-border pb-2">
            🎨 Modelo de Design da Proposta
          </h2>
          <ProposalModelSelector
            company={company}
            currentModel={company.proposalTheme || 'industrial_bold'}
            onSelect={(modelId) => {
              update('proposalTheme', modelId);
            }}
          />
        </div>



        {/* Inteligência Artificial — NOVA */}
        <div className="md:col-span-2 bg-surface border-2 border-border p-6 rounded-2xl space-y-6">
          <h2 className="text-xl font-bold font-display text-accent border-b-2 border-border pb-2 flex justify-between items-center">
            <div className="flex items-center">
              <Sparkles className="inline mr-2" size={20} /> Inteligência Artificial
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
              company.subscription?.plan?.hasAi ? 'bg-accent/20 text-accent' : 'bg-muted/20 text-muted'
            }`}>
              {company.subscription?.plan?.hasAi ? 'ATIVADO' : 'BLOQUEADO'}
            </span>
          </h2>
          <div className="space-y-4">
            <p className="text-xs text-muted leading-relaxed">
              Recursos de IA incluem: sugestão automática de itens, gerador de propostas via texto, pesquisa de mercado e chat técnico.
            </p>
            {!company.subscription?.plan?.hasAi && (
              <div className="bg-accent/10 border border-accent/20 p-4 rounded-xl space-y-3">
                <p className="text-[11px] font-bold text-accent2">O seu plano atual (FREE) não possui recursos de IA.</p>
                <Button 
                  variant="accent" 
                  className="w-full text-xs py-2 h-auto" 
                  onClick={async () => {
                    try {
                      const res = await fetch(`${API_URL}/dev-upgrade`, {
                        method: 'GET',
                        headers: { 
                          'Authorization': `Bearer ${localStorage.getItem('@propostacerta:token')}`
                        }
                      });
                      if (res.ok) {
                        await loadData();
                        await refreshCompany();
                      }
                    } catch (err) {
                      console.error('Erro ao fazer upgrade:', err);
                    }
                  }}
                >
                  Liberar Recursos IA (Modo Dev)
                </Button>
              </div>
            )}
            {company.subscription?.plan?.hasAi && (
              <div className="flex items-center gap-2 text-success text-[11px] font-bold">
                <Check size={14} /> Todos os recursos de IA estão liberados no seu plano {company.subscription?.plan?.name}.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ... restante do componente igual ... */}
      {/* Para manter o exemplo focado, a seção de catálogo e padrões comerciais permanece igual */}

      <div className="bg-surface border-2 border-border p-6 rounded-2xl space-y-6">
        <h2 className="text-xl font-bold font-display text-success border-b-2 border-border pb-2">Padrões Comerciais</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Input type="number" label="Entrada (%)" value={company.defaultDownPaymentPct ?? 20} onChange={e => update('defaultDownPaymentPct', parseFloat(e.target.value) || 0)} />
          <Input type="number" label="Prazo Entrada (dias)" value={company.defaultDownPaymentDays ?? 45} onChange={e => update('defaultDownPaymentDays', parseInt(e.target.value) || 0)} />
          <Input type="number" label="Validade (dias)" value={company.defaultValidityDays ?? 60} onChange={e => update('defaultValidityDays', parseInt(e.target.value) || 0)} />
          
          <div className="space-y-1">
            <Input type="number" label="Garantia Padrão" value={company.defaultWarrantyPeriod ?? 5} onChange={e => update('defaultWarrantyPeriod', parseInt(e.target.value) || 0)} />
            <select value={company.defaultWarrantyType || 'ANOS'} onChange={e => update('defaultWarrantyType', e.target.value)} className="w-full bg-bg border-2 border-border rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-accent">
              <option value="DIAS">Dias</option>
              <option value="MESES">Meses</option>
              <option value="ANOS">Anos</option>
            </select>
          </div>

          <Input label="Prazo de Execução" value={company.defaultExecutionPeriod || ''} onChange={e => update('defaultExecutionPeriod', e.target.value)} placeholder="Ex: 30 dias úteis" />
          
          <div className="col-span-2">
            <Input label="Forma de Pagamento Padrão" value={company.defaultPaymentMethod || ''} onChange={e => update('defaultPaymentMethod', e.target.value)} placeholder="Ex: Depósito Bancário / PIX" />
          </div>
        </div>
      </div>

      <div className="bg-surface border-2 border-border p-6 rounded-2xl space-y-4">
        <h2 className="text-xl font-bold font-display text-accent2 border-b-2 border-border pb-2">Configurações do PDF</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={company.showWarranties !== false} onChange={e => update('showWarranties', e.target.checked)} className="w-5 h-5 rounded border-border text-accent" />
            <span className="text-sm font-bold text-white">Exibir Garantias</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={company.showSpecialConditions === true} onChange={e => update('showSpecialConditions', e.target.checked)} className="w-5 h-5 rounded border-border text-accent" />
            <span className="text-sm font-bold text-white">Exibir Condições Especiais</span>
          </label>
        </div>
        {company.showSpecialConditions && (
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted mb-2 block">Texto de Condições Especiais</label>
            <textarea
              rows={3}
              value={company.specialConditionText || ''}
              onChange={e => update('specialConditionText', e.target.value)}
              placeholder="Texto que aparecerá na seção de condições especiais do PDF..."
              className="w-full bg-bg border-2 border-border rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-accent resize-none"
            />
          </div>
        )}
      </div>



      <div className="bg-surface border-2 border-border p-6 rounded-2xl space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold font-display text-accent2 border-b-2 border-border pb-2 flex-1">Catálogo</h2>
          <Button onClick={() => setAddingItem(true)} className="flex items-center gap-2 text-sm px-4 py-2">
            <Plus size={16} /> Novo Item
          </Button>
        </div>

        {addingItem && (
          <div className="bg-bg border border-accent/30 rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              <Input placeholder="Descrição" value={newItem.description} onChange={e => setNewItem(p => ({ ...p, description: e.target.value }))} className="sm:col-span-2" />
              <Input placeholder="Unidade" value={newItem.unit} onChange={e => setNewItem(p => ({ ...p, unit: e.target.value }))} />
              <Input type="number" step="0.01" placeholder="Preço Padrão" value={newItem.defaultPrice} onChange={e => setNewItem(p => ({ ...p, defaultPrice: e.target.value }))} />
              <Input placeholder="Observações" value={newItem.notes || ''} onChange={e => setNewItem(p => ({ ...p, notes: e.target.value }))} />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => { setAddingItem(false); setNewItem({ description: '', unit: 'UNID.', category: 'SERVICO', defaultPrice: '', notes: '' }); }} className="flex items-center gap-1 text-sm px-3 py-1.5"><X size={14} /> Cancelar</Button>
              <Button onClick={async () => {
                if (!newItem.description || !newItem.unit) return;
                try {
                  await createCatalogItem({ description: newItem.description, unit: newItem.unit, category: newItem.category, defaultPrice: parseFloat(newItem.defaultPrice) || 0, notes: newItem.notes });
                  const cat = await fetchCatalog();
                  setCatalog(cat);
                  setAddingItem(false);
                  setNewItem({ description: '', unit: 'UNID.', category: 'SERVICO', defaultPrice: '', notes: '' });
                } catch {
                  // mantém form aberto em caso de erro
                }
              }} className="flex items-center gap-1 text-sm px-3 py-1.5"><Check size={14} /> Adicionar</Button>
            </div>
          </div>
        )}

        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {catalog.length === 0 ? (
            <div className="text-center py-8 text-muted">Nenhum item no catálogo. Adicione o primeiro!</div>
          ) : (
            catalog.map(item => (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-bg rounded-xl border border-border hover:border-accent/30 transition-colors">
                {editingId === item.id ? (
                  <>
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      <Input value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} className="text-sm py-1" />
                      <Input value={editForm.unit} onChange={e => setEditForm(p => ({ ...p, unit: e.target.value }))} className="text-sm py-1" />
                      <Input type="number" step="0.01" value={editForm.defaultPrice} onChange={e => setEditForm(p => ({ ...p, defaultPrice: e.target.value }))} className="text-sm py-1" />
                    </div>
                    <button onClick={async () => { await updateCatalogItem(item.id, editForm); const cat = await fetchCatalog(); setCatalog(cat); setEditingId(null); }} className="p-2 text-success hover:bg-success/10 rounded-lg"><Check size={16} /></button>
                    <button onClick={() => setEditingId(null)} className="p-2 text-danger hover:bg-danger/10 rounded-lg"><X size={16} /></button>
                  </>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-white truncate">{item.description}</div>
                      <div className="text-[10px] text-muted">{item.category} · {item.unit}</div>
                    </div>
                    <div className="text-sm font-bold text-accent2">{item.defaultPrice ? fmt(item.defaultPrice) : '—'}</div>
                    <button onClick={() => { setEditingId(item.id); setEditForm({ description: item.description, unit: item.unit, defaultPrice: item.defaultPrice || '' }); }} className="p-2 text-muted hover:text-white hover:bg-surface rounded-lg"><Edit2 size={14} /></button>
                    <button onClick={async () => { await deleteCatalogItem(item.id); setCatalog(prev => prev.filter(c => c.id !== item.id)); }} className="p-2 text-muted hover:text-danger hover:bg-danger/10 rounded-lg"><Trash2 size={14} /></button>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Company;