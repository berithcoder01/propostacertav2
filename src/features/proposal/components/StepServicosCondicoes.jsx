import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Building2, Search, Bot, Wallet, Shield, FileText, RefreshCw, Plus, Trash2, Package2, Package, Wrench, AlertTriangle, Settings2, X } from 'lucide-react';
import { fmt } from '../constants';
import Button from '../../../shared/Button';
import Input from '../../../shared/Input';
import { fetchCatalog, fetchClients, aiSearch, createCatalogItem } from '../../../shared/services/api';
import { useAuth } from '../../../shared/context/AuthContext';
import { useUpgrade } from '../../../shared/context/UpgradeContext';
import AiSuggestionsWidget from './AiSuggestionsWidget';
import QuickProductModal from '../../../shared/components/modals/QuickProductModal';
import { commercialConditionsConfig } from '../../../config/commercialConditionsConfig';
import { useProposalSuggestions } from '../../../hooks/useProposalSuggestions';

const StepServicosCondicoes = ({
  items, onChangeItems,
  cond, onChangeCond,
  tipoProposta, onTipoChange,
  onNext, onBack
}) => {
   const [catalog, setCatalog] = useState([]);
   const [catalogLoading, setCatalogLoading] = useState(true);
   const [showCatalogSearch, setShowCatalogSearch] = useState(false);
   const [searchQuery, setSearchQuery] = useState('');
   const [clients, setClients] = useState([]);
   const [showClientSearch, setShowClientSearch] = useState(false);
   const [clientSearch, setClientSearch] = useState('');
   const [showAiSearch, setShowAiSearch] = useState(false);
   const [semanticLoading, setSemanticLoading] = useState(false);
   const [semanticResults, setSemanticResults] = useState([]);
     const [activeTab, setActiveTab] = useState('servicos');
     const [showQuickProductModal, setShowQuickProductModal] = useState(false);
     const [catalogType, setCatalogType] = useState('all'); // 'all' | 'product' | 'service'
     const [showCustomFields, setShowCustomFields] = useState(false);
     const [newCustomField, setNewCustomField] = useState({ title: '', value: '' });

  const { checkPlanLimit, user } = useAuth();
  const { openUpgrade } = useUpgrade();
  const aiEnabled = checkPlanLimit('ai');

  const businessType = user?.company?.businessType || 'SERVICE_ONLY';
  const segment = user?.company?.segment || 'OUTRO';
  const baseConfig = commercialConditionsConfig[businessType] || commercialConditionsConfig['SERVICE_ONLY'];
  const suggestions = useProposalSuggestions(businessType, segment);
  const config = {
    ...baseConfig,
    sections: { ...baseConfig.sections, ...suggestions.visibleSections },
    wording: { ...baseConfig.wording, ...suggestions.wording },
    defaults: { ...baseConfig.defaults, ...suggestions.suggestedDefaults },
  };

  useEffect(() => {
    fetchCatalog()
      .then(data => setCatalog(data))
      .catch(() => {})
      .finally(() => setCatalogLoading(false));
    fetchClients().then(setClients).catch(() => {});
  }, []);

  useEffect(() => {
    if (!cond.isInitialized) {
      onChangeCond({
        ...cond,
        entrada: config.defaults.entrada !== undefined ? String(config.defaults.entrada) : cond.entrada,
        prazoEntrada: config.defaults.downPaymentDays !== undefined ? String(config.defaults.downPaymentDays) : cond.prazoEntrada,
        medicao: config.defaults.measurementDays !== undefined ? String(config.defaults.measurementDays) : cond.medicao,
        warrantyPeriod: config.defaults.warrantyPeriod,
        warrantyType: config.defaults.warrantyType || 'ANOS',
        isInitialized: true,
      });

      if (!tipoProposta) {
        onTipoChange(suggestions.suggestedProposalType);
      }
    }
  }, [businessType, segment, cond, onChangeCond, config, suggestions, tipoProposta, onTipoChange]);

  const filteredCatalog = catalog.filter(c => {
    const matchesSearch = c.description.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (catalogType === 'product') return c.isProduct === true;
    if (catalogType === 'service') return c.isProduct !== true;
    return true;
  });

const addItem = () => {
  const newId = `ITEM.${String(items.length + 1).padStart(2, '0')}`;
  
  let unit = 'UNID.';
  let category = 'SERVICO';
  let isProduct = false;
  
  if (items.length > 0) {
    const lastItem = items[items.length - 1];
    unit = lastItem.unit || unit;
    category = lastItem.category || category;
    isProduct = lastItem.isProduct || false;
  }
  
  const suggestedPrice = getSuggestedPrice('', unit, category);
  
  onChangeItems([...items, { id: newId, catalogId: null, label: '', unit, qty: 1, price: suggestedPrice, category, isProduct }]);
};

// Função auxiliar para encontrar preço sugerido com base em itens similares no catálogo
const getSuggestedPrice = (label, unit, category) => {
  if (!catalog || catalog.length === 0) return 0;
  
  // Busca por itens com mesma unidade e categoria
  const similarItems = catalog.filter(item => 
    (item.unit === unit || unit === 'UNID.') && 
    item.category === category
  );
  
  if (similarItems.length > 0) {
    // Retorna a média dos preços dos itens similares
    const totalPrice = similarItems.reduce((sum, item) => sum + (item.defaultPrice || 0), 0);
    return totalPrice / similarItems.length;
  }
  
  // Busca por correspondência parcial na descrição (case insensitive)
  const partialMatches = catalog.filter(item => 
    item.description.toLowerCase().includes(label.toLowerCase()) && 
    item.defaultPrice > 0
  );
  
  if (partialMatches.length > 0) {
    const totalPrice = partialMatches.reduce((sum, item) => sum + (item.defaultPrice || 0), 0);
    return totalPrice / partialMatches.length;
  }
  
  return 0;
};

// Função para sugerir unidade e categoria baseado no rótulo
const suggestUnitAndCategory = (label) => {
  if (!label || label.trim() === '') return { unit: 'UNID.', category: 'SERVICO' };
  
  const lowerLabel = label.toLowerCase();
  
  // Padrões para detectar unidades e categorias baseado no texto
  const unitPatterns = [
    { regex: /(kg|quilograma|quilo)/i, unit: 'KG' },
    { regex: /(g|grama)/i, unit: 'G' },
    { regex: /(l|litro)/i, unit: 'L' },
    { regex: /(ml|mililitro)/i, unit: 'ML' },
    { regex: /(m|metro)/i, unit: 'M' },
    { regex: /(m2|metro\s*quadrado|quadrado)/i, unit: 'M2' },
    { regex: /(m3|metro\s*cubico|cubico)/i, unit: 'M3' },
    { regex: /(h|hora|hrs)/i, unit: 'HRS' },
    { regex: /(dia|dias)/i, unit: 'DIA' },
    { regex: /(unidade|unidades|peca|pecas|unid)/i, unit: 'UNID.' }
  ];
  
  const categoryPatterns = [
    { regex: /(cimento|areia|cascalho|brita|bloco|tijolo|concreto|argamassa)/i, category: 'MATERIAL' },
    { regex: /(fio|cabo|disjuntor|breaker|tomada|interruptor|luminaria|lampada)/i, category: 'MATERIAL' },
    { regex: /(tinta|verniz|selante|masa)/i, category: 'MATERIAL' },
    { regex: /(mão\s*de\s*obra|obra|serviço|servico|instalação|montagem)/i, category: 'SERVICO' },
    { regex: /(aluguel|locacao|equipamento|betoneira|guindaste)/i, category: 'EQUIPAMENTO' }
  ];
  
  let suggestedUnit = 'UNID.';
  let suggestedCategory = 'SERVICO';
  
  // Detecta unidade baseado no rótulo
  for (const pattern of unitPatterns) {
    if (pattern.regex.test(lowerLabel)) {
      suggestedUnit = pattern.unit;
      break;
    }
  }
  
  // Detecta categoria baseado no rótulo
  for (const pattern of categoryPatterns) {
    if (pattern.regex.test(lowerLabel)) {
      suggestedCategory = pattern.category;
      break;
    }
  }
  
  return { unit: suggestedUnit, category: suggestedCategory };
};

const addFromCatalog = (catItem) => {
  const existing = items.find(i => i.catalogId === catItem.id);
  if (existing) return;
  const newId = `ITEM.${String(items.length + 1).padStart(2, '0')}`;
  
  // Inteligência: sugerir quantidade padrão baseado no tipo de item
  let suggestedQty = 1;
  if (catItem.category === 'EQUIPAMENTO') {
    // Para equipamentos, geralmente só se precisa de uma unidade
    suggestedQty = 1;
  } else if (catItem.unit === 'HRS' || catItem.unit === 'DIA') {
    // Para horas ou dias, pode ser uma quantidade padrão maior para serviços
    suggestedQty = 8; // 8 horas ou 1 dia de trabalho
  } else if (catItem.category === 'MATERIAL' && 
             (catItem.unit === 'M2' || catItem.unit === 'M3' || 
              catItem.unit === 'KG' || catItem.unit === 'L')) {
    // Para materiais medidos em área/volume/peso, quantidade padrão pode variar
    // Mantemos 1 como padrão, mas o usuário pode ajustar
    suggestedQty = 1;
  }
  
  onChangeItems([...items, {
    id: newId, 
    catalogId: catItem.id,
    label: catItem.description, 
    unit: catItem.unit,
    qty: suggestedQty, 
    price: catItem.defaultPrice || 0,
    category: catItem.category || 'SERVICO',
    isProduct: catItem.isProduct || false,
  }]);
  setShowCatalogSearch(false);
  setSearchQuery('');
  setSemanticResults([]);
};

  const removeItem = (id) => {
    onChangeItems(items.filter(i => i.id !== id));
  };

  const updateItem = (id, field, val) => {
    onChangeItems(items.map(i => i.id === id ? { ...i, [field]: val } : i));
  };

  const total = items.reduce((s, i) => s + (parseFloat(i.qty) || 0) * (parseFloat(i.price) || 0), 0);

  const handleSemanticSearch = async (query) => {
    if (!query.trim() || !aiEnabled) return;
    setSemanticLoading(true);
    try {
      const data = await aiSearch(query);
      setSemanticResults(data.results || []);
    } catch (err) {
      console.warn('Busca semântica falhou:', err.message);
      setSemanticResults([]);
    } finally {
      setSemanticLoading(false);
    }
  };

  const update = (field, val) => onChangeCond({ ...cond, [field]: val });

  const customFields = cond.customFields || [];

  const addCustomField = () => {
    if (!newCustomField.title.trim()) return;
    const fieldId = `custom_${Date.now()}`;
    const updatedFields = [...customFields, { id: fieldId, title: newCustomField.title.trim(), value: newCustomField.value }];
    onChangeCond({ ...cond, customFields: updatedFields });
    setNewCustomField({ title: '', value: '' });
  };

  const removeCustomField = (id) => {
    onChangeCond({ ...cond, customFields: customFields.filter(f => f.id !== id) });
  };

  const updateCustomField = (id, field, val) => {
    onChangeCond({
      ...cond,
      customFields: customFields.map(f => f.id === id ? { ...f, [field]: val } : f),
    });
  };

  const isContinuous = tipoProposta === 'servico_continuo';
  const isFormValid = items.length > 0 && cond.entrada && cond.prazoEntrada;

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 bg-surface/50 border border-border rounded-2xl p-1">
        <button
          onClick={() => setActiveTab('servicos')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'servicos' ? 'bg-accent text-white shadow-lg' : 'text-muted hover:text-white'
          }`}
        >
          📋 Serviços &amp; Escopo
        </button>
        <button
          onClick={() => setActiveTab('condicoes')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'condicoes' ? 'bg-accent text-white shadow-lg' : 'text-muted hover:text-white'
          }`}
        >
          ⚙️ Condições Comerciais
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* ── ABA: SERVIÇOS E ESCOPO ── */}
        {activeTab === 'servicos' && (
          <motion.div key="servicos" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h2 className="text-2xl font-extrabold font-display mb-2">Escopo de Fornecimento</h2>
                <p className="text-muted text-sm">Adicione os serviços e materiais que farão parte desta proposta.</p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => { setShowCatalogSearch(!showCatalogSearch); setSemanticResults([]); }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-2 ${
                    showCatalogSearch ? 'bg-accent/20 border-accent text-accent2' : 'bg-bg border-border text-muted hover:text-white'
                  }`}
                >
                  <Search size={14} className="inline mr-1.5" /> Buscar Catálogo
                </button>
                <button
                  onClick={() => setShowClientSearch(!showClientSearch)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-2 ${
                    showClientSearch ? 'bg-accent/20 border-accent text-accent2' : 'bg-bg border-border text-muted hover:text-white'
                  }`}
                >
                  <Building2 size={14} className="inline mr-1.5" /> Buscar Cliente
                </button>
                <button
                  onClick={() => { if (!aiEnabled) { openUpgrade(); return; } setShowAiSearch(!showAiSearch); }}
                  disabled={!aiEnabled}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-2 ${
                    aiEnabled
                      ? showAiSearch ? 'bg-accent/20 border-accent text-accent2' : 'bg-bg border-border text-muted hover:text-white'
                      : 'bg-bg border-border text-muted/40 cursor-not-allowed opacity-50'
                  }`}
                  title={!aiEnabled ? 'Disponível no plano PRO' : undefined}
                >
                  <Bot size={14} className="inline mr-1.5" /> Assistente IA {!aiEnabled && '(PRO)'}
                </button>
                <div className="bg-surface border-2 border-border p-1 rounded-xl flex gap-1">
                  <button onClick={() => onTipoChange('valor_fechado')} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${!isContinuous ? 'bg-accent text-white shadow-lg' : 'text-muted hover:text-white'}`}>Valor Fechado</button>
                  <button onClick={() => onTipoChange('servico_continuo')} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${isContinuous ? 'bg-accent text-white shadow-lg' : 'text-muted hover:text-white'}`}>Serviço Contínuo</button>
                </div>
              </div>
            </div>

            {/* Client Search */}
            {showClientSearch && (
              <div className="bg-surface border-2 border-accent/30 rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Building2 size={16} className="text-accent" />
                  <input type="text" placeholder="Buscar cliente..." value={clientSearch} onChange={e => setClientSearch(e.target.value)} className="flex-1 bg-bg border border-border rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-accent" />
                </div>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {clients.filter(c => (c.name || '').toLowerCase().includes(clientSearch.toLowerCase())).slice(0, 8).map(c => (
                    <button key={c.id} onClick={() => { setShowClientSearch(false); setClientSearch(''); }} className="w-full flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-accent/10 text-left" type="button">
                      <Building2 size={14} className="text-muted" />
                      <div><div className="text-sm font-bold text-white">{c.name}</div><div className="text-[10px] text-muted">{c.location}</div></div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* AI Research Widget (inline) */}
            {showAiSearch && <div className="bg-surface border-2 border-accent/30 rounded-2xl p-4"><AiSuggestionsWidget currentItems={items} onAddItem={(s) => { const nid = `ITEM.${String(items.length + 1).padStart(2, '0')}`; onChangeItems([...items, { id: nid, catalogId: s.id || null, label: s.label, unit: s.unit || 'UNID.', qty: s.qty || 1, price: s.unitPrice || 0, category: s.category || 'SERVICO' }]); }} disabled={!aiEnabled} aiEnabled={aiEnabled} /></div>}

            {/* Catalog Search with Semantic AI */}
            {showCatalogSearch && (
              <div className="bg-surface border-2 border-accent/30 rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Search size={16} className="text-accent flex-shrink-0" />
                  <input type="text" placeholder="Buscar no catálogo ou descrever o que precisa..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && searchQuery.trim() && aiEnabled) handleSemanticSearch(searchQuery); }} className="flex-1 bg-bg border border-border rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-accent" />
                  {aiEnabled && <button onClick={() => searchQuery.trim() && handleSemanticSearch(searchQuery)} className={`p-2 rounded-lg transition-colors flex-shrink-0 ${semanticLoading ? 'animate-pulse text-accent' : 'text-muted hover:text-accent hover:bg-accent/10'}`} title="Buscar com IA"><RefreshCw size={16} className={semanticLoading ? 'animate-spin' : ''} /></button>}
                </div>

                {/* Type filter toggle */}
                <div className="flex gap-1 p-1 bg-bg rounded-xl mb-3">
                  <button onClick={() => setCatalogType('all')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${catalogType === 'all' ? 'bg-accent text-white' : 'text-muted'}`}>Todos</button>
                  <button onClick={() => setCatalogType('service')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${catalogType === 'service' ? 'bg-gold text-white' : 'text-muted'}`}>Serviços</button>
                  <button onClick={() => setCatalogType('product')} className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${catalogType === 'product' ? 'bg-accent2 text-white' : 'text-muted'}`}>Produtos</button>
                </div>

                {semanticLoading && <div className="text-center py-4 text-muted text-sm"><RefreshCw size={16} className="animate-spin inline mr-2" /> Buscando itens semelhantes com IA...</div>}
                {!semanticLoading && semanticResults.length > 0 && (
                  <div className="mb-3 p-2 bg-accent/5 rounded-xl border border-accent/20">
                    <p className="text-[10px] font-bold text-accent uppercase tracking-wider mb-2">✨ Sugestões da IA</p>
                    <div className="space-y-1">
                      {semanticResults.map((item, idx) => (
                        <button key={`semantic-${idx}`} onClick={() => { addFromCatalog(item); }} className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-accent/10 text-left transition-colors" type="button">
                          <div>
                            <div className="flex items-center gap-2">
                              {item.isProduct ? <Package size={12} className="text-accent2" /> : <Wrench size={12} className="text-gold" />}
                              <span className="text-sm font-bold text-white">{item.description}</span>
                            </div>
                            <div className="text-[10px] text-muted">{item.category || 'SERVICO'} · {item.unit || 'UNID.'} · {typeof item.defaultPrice === 'number' ? fmt(item.defaultPrice) : '—'}</div>
                          </div>
                          <Plus size={14} className="text-accent opacity-50" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {!semanticLoading && semanticResults.length === 0 && searchQuery.length > 2 && aiEnabled && <div className="mb-2 text-[10px] text-muted italic">Sem sugestões semânticas. Tente termos mais específicos ou busque no catálogo abaixo.</div>}
                {catalogLoading ? <div className="text-center py-6 text-muted text-sm">Carregando catálogo...</div> : filteredCatalog.length === 0 ? <div className="text-center py-6 text-muted text-sm">Nenhum item encontrado.</div> : (
                  <div className="max-h-48 overflow-y-auto space-y-1 mt-2">
                    {filteredCatalog.map(item => {
                      const alreadyAdded = items.some(i => i.catalogId === item.id);
                      const isLowStock = item.isProduct && item.stockQuantity <= item.minStock;
                      return (
                        <button key={item.id} onClick={() => !alreadyAdded && addFromCatalog(item)} disabled={alreadyAdded} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all ${alreadyAdded ? 'bg-bg/50 text-muted cursor-not-allowed opacity-50' : 'hover:bg-accent/10 text-white'}`} type="button">
                          <div>
                            <div className="flex items-center gap-2">
                              {item.isProduct ? <Package size={12} className="text-accent2" /> : <Wrench size={12} className="text-gold" />}
                              <span className="text-sm font-bold">{item.description}</span>
                              {isLowStock && <AlertTriangle size={10} className="text-danger" />}
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-muted">
                              <span>{item.category}</span>
                              <span>·</span>
                              <span>{item.unit}</span>
                              {item.isProduct && <span>· Estoque: {item.stockQuantity}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-3"><span className="text-sm font-bold text-accent2">{item.defaultPrice ? fmt(item.defaultPrice) : '—'}</span>{!alreadyAdded && <Plus size={14} className="text-accent" />}{alreadyAdded && <span className="text-[10px] text-muted">Já adicionado</span>}</div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Items list */}
            <div className="space-y-4">
              <AnimatePresence>
                {items.map((item, index) => {
                  const catalogItem = catalog.find(c => c.id === item.catalogId);
                  const isProduct = item.isProduct || catalogItem?.isProduct;
                  const stockInfo = catalogItem?.isProduct ? { current: catalogItem.stockQuantity, min: catalogItem.minStock } : null;
                  const isLowStock = stockInfo && stockInfo.current <= stockInfo.min;
                  return (
                  <motion.div key={item.id || `item-${index}`} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="border-2 border-accent bg-accent/5 rounded-2xl overflow-hidden">
                    <div className="flex justify-between items-center p-4 border-b-2 border-border bg-black/20">
                      <div className="text-sm font-bold text-white flex items-center gap-3">
                        <span className="text-accent2 font-display text-lg">{index + 1}</span>
                        {isProduct ? (
                          <span className="text-[10px] bg-accent2/20 text-accent2 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                            <Package size={10} /> Produto
                          </span>
                        ) : item.catalogId ? (
                          <span className="text-[10px] bg-gold/20 text-gold px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                            <Wrench size={10} /> Serviço
                          </span>
                        ) : (
                          'Item do Escopo'
                        )}
                        {isLowStock && (
                          <span className="text-[10px] bg-danger/20 text-danger px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                            <AlertTriangle size={10} /> Estoque: {stockInfo.current}
                          </span>
                        )}
                      </div>
                      <Button variant="ghost" className="text-danger hover:text-danger hover:bg-danger/10 px-3 py-1 flex items-center gap-2" onClick={() => removeItem(item.id)}><Trash2 size={16} /> Remover</Button>
                    </div>
                    <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <Input label="Descrição Curta (Título) *" placeholder="Ex.: Reconstrução de taludes" value={item.label} onChange={e => updateItem(item.id, "label", e.target.value)} />
                      <Input label="Unidade de Medida" placeholder="Ex.: UNID., HRS, M²" value={item.unit} onChange={e => updateItem(item.id, "unit", e.target.value)} />
                    </div>
                    <div className="border-t-2 border-border p-5 bg-black/20"><div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <Input inputMode="decimal" pattern="[0-9]*" label="Qtd" value={item.qty} onChange={e => updateItem(item.id, "qty", e.target.value)} onFocus={e => e.target.select()} />
                      <Input inputMode="decimal" pattern="[0-9]*" step="0.01" label="Valor Unit. (R$)" value={item.price} onChange={e => updateItem(item.id, "price", e.target.value)} onFocus={e => e.target.select()} />
                      <div className="flex flex-col gap-1.5"><label className="text-xs font-bold uppercase tracking-wider text-muted">Subtotal</label><div className="bg-bg border-2 border-border rounded-xl px-4 py-3 text-sm font-bold text-accent2 flex items-center">{fmt((parseFloat(item.qty) || 0) * (parseFloat(item.price) || 0))}</div></div>
                    </div></div>
                  </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* AI Suggestions */}
            <AiSuggestionsWidget
              currentItems={items} onAddItem={(s) => { const nid = `ITEM.${String(items.length + 1).padStart(2, '0')}`; onChangeItems([...items, { id: nid, catalogId: s.id || null, label: s.label, unit: s.unit || 'UNID.', qty: s.qty || 1, price: s.unitPrice || 0, category: s.category || 'SERVICO' }]); }}
              disabled={!aiEnabled} aiEnabled={aiEnabled}
            />

            {/* Total and actions */}
            <div className="pt-4 pb-6">
              <div className="flex gap-3">
                <Button onClick={addItem} className="flex-1 border-dashed border-2 bg-transparent hover:bg-accent/10 border-accent/50 text-accent2 py-4 text-lg">+ Adicionar Item ao Escopo</Button>
                <button
                  onClick={() => setShowQuickProductModal(true)}
                  className="px-4 rounded-xl border-2 border-dashed border-accent/50 bg-transparent hover:bg-accent/10 text-accent2 transition-colors"
                  title="Cadastro Rápido de Produto"
                >
                  <Package2 size={20} />
                </button>
              </div>
            </div>

            <div className="sticky bottom-0 bg-surface/90 backdrop-blur-xl border-2 border-border p-6 rounded-2xl flex sm:flex-row items-center justify-between gap-6 shadow-2xl z-10">
              {!isContinuous ? <div className="text-center sm:text-left"><div className="text-[10px] text-muted font-bold uppercase tracking-widest mb-1">Total Estimado</div><div className="text-3xl font-black font-display text-gold">{fmt(total)}</div></div> : <div className="text-center sm:text-left"><div className="text-[10px] text-accent font-bold uppercase tracking-widest mb-1">Modelo de Precificação</div><div className="text-xl font-black font-display text-white">Valor por Medição</div></div>}
              <div className="flex gap-4 w-full sm:w-auto">
                <Button variant="ghost" onClick={onBack} className="flex-1 sm:flex-none flex items-center justify-center gap-2"><ArrowLeft size={18} /> Voltar</Button>
                <Button onClick={() => { activeTab === 'condicoes' ? onNext() : setActiveTab('condicoes'); }} disabled={!isFormValid} className="flex-1 sm:flex-none flex items-center justify-center gap-2">
                  {activeTab === 'condicoes' ? <>Próximo <ArrowRight size={18} /></> : 'Ver Condições'}
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── ABA: CONDIÇÕES COMERCIAIS ── */}
        {activeTab === 'condicoes' && (
          <motion.div key="condicoes" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-2xl font-bold font-display text-white">Condições Comerciais</h2>
                <p className="text-muted text-sm mt-1">Configure pagamento, garantias e prazos.</p>
              </div>
              <button onClick={() => setActiveTab('servicos')} className="text-sm text-muted hover:text-white transition-colors">← Voltar para Serviços</button>
            </div>

            {/* Tipo de Proposta */}
            <div className="bg-surface border-2 border-border p-6 rounded-2xl space-y-4">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Modelo de Precificação</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button type="button" onClick={() => onTipoChange('valor_fechado')} className={`p-4 rounded-xl border-2 transition-all text-left ${tipoProposta === 'valor_fechado' ? 'border-accent bg-accent/10' : 'border-border bg-bg hover:border-accent/30'}`}>
                  <div className={`font-bold text-sm mb-1 ${tipoProposta === 'valor_fechado' ? 'text-white' : 'text-muted'}`}>Valor Fechado</div>
                  <div className="text-[11px] text-muted">Escopo e quantidades fixas.</div>
                </button>
                <button type="button" onClick={() => onTipoChange('servico_continuo')} className={`p-4 rounded-xl border-2 transition-all text-left ${tipoProposta === 'servico_continuo' ? 'border-accent bg-accent/10' : 'border-border bg-bg hover:border-accent/30'}`}>
                  <div className={`font-bold text-sm mb-1 ${tipoProposta === 'servico_continuo' ? 'text-white' : 'text-muted'}`}>Medição / Contínuo</div>
                  <div className="text-[11px] text-muted">Faturamento baseado na execução real.</div>
                </button>
              </div>
            </div>

            {/* Tipo Proposta: VALOR FECHADO — Condições */}
            {tipoProposta === 'valor_fechado' && (
              <div className="space-y-4">
                <div className={`bg-surface border-2 rounded-2xl transition-all duration-300 overflow-hidden ${cond.showPagamento !== false ? 'border-accent/40 shadow-lg shadow-accent/5' : 'border-border opacity-70'}`}>
                  <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors" onClick={() => update('showPagamento', cond.showPagamento === false)}>
                    <div className="flex items-center gap-3"><input type="checkbox" checked={cond.showPagamento !== false} readOnly className="w-5 h-5 rounded border-border text-accent focus:ring-accent bg-bg" /><div><h3 className="font-bold text-white text-sm">Condições de Pagamento</h3><p className="text-[10px] text-muted uppercase tracking-wider">Entrada, Medição e Prazos</p></div></div>
                    <div className={`transition-transform duration-300 ${cond.showPagamento !== false ? 'rotate-90' : ''}`}><Wallet size={18} className="text-muted" /></div>
                  </div>
                  {cond.showPagamento !== false && (
                    <div className="p-6 pt-2 border-t border-border bg-black/10 space-y-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Input label="Entrada (%)" inputMode="decimal" pattern="[0-9]*" value={cond.entrada} onChange={e => update('entrada', e.target.value)} onFocus={e => e.target.select()} suffix="%" />
                        <Input label="Prazo Entrada" inputMode="decimal" pattern="[0-9]*" value={cond.prazoEntrada} onChange={e => update('prazoEntrada', e.target.value)} onFocus={e => e.target.select()} suffix="dias" />
                        {config.sections.measurementDays && (
                          <Input label="Medição a cada" inputMode="decimal" pattern="[0-9]*" value={cond.medicao} onChange={e => update('medicao', e.target.value)} onFocus={e => e.target.select()} suffix="dias" />
                        )}
                        <Input label="Prazo Pagto NF" inputMode="decimal" pattern="[0-9]*" value={cond.prazoNF} onChange={e => update('prazoNF', e.target.value)} onFocus={e => e.target.select()} suffix="dias" />
                      </div>
                      <div className="flex flex-col gap-1.5"><label className="text-[10px] font-bold uppercase tracking-widest text-muted ml-1">Detalhes da Forma de Pagamento</label><textarea rows={2} value={cond.formaPagamento} onChange={e => update('formaPagamento', e.target.value)} placeholder="Ex.: Depósito bancário, PIX, boleto..." className="bg-bg border-2 border-border rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-accent transition-all h-24 resize-none" /></div>
                    </div>
                  )}
                </div>

                {/* Garantias */}
                {suggestions.visibleSections.guarantees && (
                <div className={`bg-surface border-2 rounded-2xl transition-all duration-300 overflow-hidden ${cond.showGarantias !== false ? 'border-accent/40 shadow-lg shadow-accent/5' : 'border-border opacity-70'}`}>
                  <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors" onClick={() => update('showGarantias', cond.showGarantias === false)}>
                    <div className="flex items-center gap-3"><input type="checkbox" checked={cond.showGarantias !== false} readOnly className="w-5 h-5 rounded border-border text-accent focus:ring-accent bg-bg" /><div><h3 className="font-bold text-white text-sm">{config.wording.warrantyLabel}</h3><p className="text-[10px] text-muted uppercase tracking-wider">Prazos contra defeitos e acidentes</p></div></div>
                    <div className={`transition-transform duration-300 ${cond.showGarantias !== false ? 'rotate-90' : ''}`}><Shield size={18} className="text-muted" /></div>
                  </div>
                  {cond.showGarantias !== false && (
                    <div className="p-6 pt-2 border-t border-border bg-black/10 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div><Input label={`Período de ${config.wording.warrantyLabel}`} inputMode="decimal" pattern="[0-9]*" value={cond.warrantyPeriod || ''} onChange={e => update('warrantyPeriod', e.target.value)} suffix="períodos" /><select value={cond.warrantyType || 'ANOS'} onChange={e => update('warrantyType', e.target.value)} className="mt-2 w-full bg-bg border-2 border-border rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-accent"><option value="DIAS">Dias</option><option value="MESES">Meses</option><option value="ANOS">Anos</option></select></div>
                      <div className="flex flex-col gap-1.5"><label className="text-[10px] font-bold uppercase tracking-widest text-muted ml-1">Detalhes (Opcional)</label><textarea rows={2} value={cond.warrantyDetails || ''} onChange={e => update('warrantyDetails', e.target.value)} placeholder={config.wording.warrantyDetailsPlaceholder} className="bg-bg border-2 border-border rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-accent transition-all h-24 resize-none" /></div>
                    </div>
                  )}
                </div>
                )}
              </div>
            )}

            {/* Tipo Proposta: SERVICO_CONTINUO — Condições Simplificadas */}
            {tipoProposta === 'servico_continuo' && (
              <div className="space-y-4">
                <div className="bg-surface border-2 border-border p-6 rounded-2xl space-y-4">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Condições do Serviço Contínuo</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Faturamento a cada" inputMode="decimal" pattern="[0-9]*" value={cond.medicao} onChange={e => update('medicao', e.target.value)} placeholder="Ex.: 15" suffix="dias" />
                    <Input label="Prazo Pagto NF" inputMode="decimal" pattern="[0-9]*" value={cond.prazoNF} onChange={e => update('prazoNF', e.target.value)} placeholder="Ex.: 30" suffix="dias" />
                  </div>
                  <div className="flex flex-col gap-1.5"><label className="text-[10px] font-bold uppercase tracking-widest text-muted ml-1">Forma de Pagamento</label><textarea rows={2} value={cond.formaPagamento} onChange={e => update('formaPagamento', e.target.value)} placeholder="Ex.: PIX mensal, boleto, transferência..." className="bg-bg border-2 border-border rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-accent transition-all h-20 resize-none" /></div>
                </div>
              </div>
            )}



            {config.sections.executionAndValidity && (
            <div className="bg-surface border-2 border-border p-6 rounded-2xl space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label={config.wording.executionPeriodLabel} value={cond.prazoExec} onChange={e => update('prazoExec', e.target.value)} placeholder="Ex.: 30 dias úteis" />
                <Input label="Validade da Proposta" inputMode="decimal" pattern="[0-9]*" value={cond.validade} onChange={e => update('validade', e.target.value)} onFocus={e => e.target.select()} suffix="dias" />
              </div>
              <div className="flex flex-col gap-1.5"><label className="text-[10px] font-bold uppercase tracking-widest text-muted ml-1">Observações Gerais</label><textarea rows={3} value={cond.obs} onChange={e => update('obs', e.target.value)} placeholder="Notas adicionais..." className="bg-bg border-2 border-border rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-accent transition-all h-32 resize-none" /></div>
            </div>
            )}

            {/* Campos Personalizados */}
            <div className="space-y-4">
              {!showCustomFields && customFields.length === 0 && (
                <button
                  onClick={() => setShowCustomFields(true)}
                  className="w-full py-3 rounded-xl border-2 border-dashed border-border/50 text-muted/60 hover:text-accent hover:border-accent/30 hover:bg-accent/5 transition-all text-sm flex items-center justify-center gap-2"
                >
                  <Settings2 size={14} />
                  Adicionar campo personalizado?
                </button>
              )}

              {showCustomFields && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-surface border-2 border-accent/20 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Settings2 size={16} className="text-accent" />
                      Campos Personalizados
                    </h3>
                    {customFields.length === 0 && (
                      <button onClick={() => setShowCustomFields(false)} className="text-muted hover:text-white transition-colors">
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Input label="Título do Campo" value={newCustomField.title} onChange={e => setNewCustomField({ ...newCustomField, title: e.target.value })} placeholder="Ex.: Condição especial" />
                    <Input label="Valor" value={newCustomField.value} onChange={e => setNewCustomField({ ...newCustomField, value: e.target.value })} placeholder="Ex.: Aprovado até 48h" />
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted ml-1">&nbsp;</label>
                      <button onClick={addCustomField} disabled={!newCustomField.title.trim()} className="w-full bg-accent/20 hover:bg-accent/30 disabled:opacity-40 disabled:cursor-not-allowed text-accent font-bold text-sm py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                        <Plus size={14} /> Adicionar
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {customFields.length > 0 && (
                <div className="space-y-3">
                  {customFields.map((field) => (
                    <motion.div key={field.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-surface border-2 border-border rounded-2xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={field.title}
                            onChange={e => updateCustomField(field.id, 'title', e.target.value)}
                            className="w-full bg-transparent text-xs font-bold uppercase tracking-wider text-accent outline-none border-b border-transparent focus:border-accent/30 pb-1"
                            placeholder="Título do campo"
                          />
                          <input
                            type="text"
                            value={field.value}
                            onChange={e => updateCustomField(field.id, 'value', e.target.value)}
                            className="w-full bg-transparent text-sm text-white outline-none border-b border-transparent focus:border-accent/30 pb-1"
                            placeholder="Valor ou descrição"
                          />
                        </div>
                        <button onClick={() => removeCustomField(field.id)} className="text-muted hover:text-danger transition-colors p-1" title="Remover campo">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </motion.div>
                  ))}

                  {customFields.length > 0 && (
                    <button
                      onClick={() => setShowCustomFields(!showCustomFields)}
                      className="w-full py-2 rounded-xl border-2 border-dashed border-border/50 text-muted/60 hover:text-accent hover:border-accent/30 hover:bg-accent/5 transition-all text-xs flex items-center justify-center gap-2"
                    >
                      <Plus size={12} />
                      Adicionar outro campo
                    </button>
                  )}
                </div>
              )}
            </div>

             {/* Navegação */}
             <div className="flex justify-between pt-4">
               <Button variant="ghost" onClick={onBack} className="flex items-center gap-2"><ArrowLeft size={18} /> Voltar</Button>
               <Button onClick={onNext} className="flex items-center gap-2">Revisar proposta <ArrowRight size={18} /></Button>
             </div>
           </motion.div>
         )}
       </AnimatePresence>
     </motion.div>
     
     {/* Quick Product Modal */}
     <QuickProductModal
       isOpen={showQuickProductModal}
       onClose={() => setShowQuickProductModal(false)}
       onSuccess={() => {
         // Optionally refresh catalog or select the newly created item
         // For now, we'll just close the modal and let the user search for the new item
       }}
      />
    </>
  );
};

export default StepServicosCondicoes;