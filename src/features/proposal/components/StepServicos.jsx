import React, { useState, useEffect, useCallback } from 'react';
import { ArrowRight, ArrowLeft, Plus, Trash2, Search, Building2, Bot, RefreshCw, Package, Wrench } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fmt } from '../constants';
import Button from '../../../shared/Button';
import Input from '../../../shared/Input';
import { fetchCatalog, fetchClients, aiSearch } from '../../../shared/services/api';
import { useAuth } from '../../../shared/context/AuthContext';
import { useUpgrade } from '../../../shared/context/UpgradeContext';
import AiSuggestionsWidget from './AiSuggestionsWidget';
import AiResearchWidget from './AiResearchWidget';

const StepServicos = ({ items, onChange, tipoProposta, onTipoChange, onNext, onBack }) => {
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

  const { checkPlanLimit } = useAuth();
  const { openUpgrade } = useUpgrade();
  const aiEnabled = checkPlanLimit('ai');

  useEffect(() => {
    fetchCatalog()
      .then(data => setCatalog(data))
      .catch(() => {})
      .finally(() => setCatalogLoading(false));
    fetchClients().then(setClients).catch(() => {});
  }, []);

  const addItem = () => {
    const newId = `ITEM.${String(items.length + 1).padStart(2, '0')}`;
    onChange([...items, { id: newId, catalogId: null, label: '', unit: 'UNID.', qty: 1, price: 0, category: 'SERVICO' }]);
  };

  const addFromCatalog = (catItem) => {
    const existing = items.find(i => i.catalogId === catItem.id);
    if (existing) return;
    const newId = `ITEM.${String(items.length + 1).padStart(2, '0')}`;
    onChange([...items, {
      id: newId,
      catalogId: catItem.id,
      label: catItem.description,
      unit: catItem.unit,
      qty: 1,
      price: catItem.defaultPrice || 0,
      category: catItem.category || 'SERVICO',
      isProduct: catItem.isProduct || false,
    }]);
    setShowCatalogSearch(false);
    setSearchQuery('');
    setSemanticResults([]);
  };

  const removeItem = (id) => {
    onChange(items.filter(i => i.id !== id));
  };

  const updateItem = (id, field, val) => {
    onChange(items.map(i => i.id === id ? { ...i, [field]: val } : i));
  };

  const total = items.reduce((s, i) => s + (parseFloat(i.qty) || 0) * (parseFloat(i.price) || 0), 0);
  const isContinuous = tipoProposta === 'servico_continuo';

  const filteredCatalog = catalog.filter(c =>
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSemanticSearch = useCallback(async (query) => {
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
  }, [aiEnabled]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-extrabold font-display mb-2">Escopo de Fornecimento</h2>
          <p className="text-muted text-sm">Adicione os serviços e materiais que farão parte desta proposta comercial.</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => { setShowCatalogSearch(!showCatalogSearch); setSemanticResults([]); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-2 ${
              showCatalogSearch ? 'bg-accent/20 border-accent text-accent2' : 'bg-bg border-border text-muted hover:text-white'
            }`}
          >
            <Search size={14} className="inline mr-1.5" />
            Buscar Produtos
          </button>

          <button
            onClick={() => setShowClientSearch(!showClientSearch)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-2 ${
              showClientSearch ? 'bg-accent/20 border-accent text-accent2' : 'bg-bg border-border text-muted hover:text-white'
            }`}
          >
            <Building2 size={14} className="inline mr-1.5" />
            Buscar Cliente
          </button>

          <button
            onClick={() => {
              if (!aiEnabled) { openUpgrade(); return; }
              setShowAiSearch(!showAiSearch);
            }}
            disabled={!aiEnabled}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border-2 ${
              aiEnabled
                ? showAiSearch ? 'bg-accent/20 border-accent text-accent2' : 'bg-bg border-border text-muted hover:text-white'
                : 'bg-bg border-border text-muted/40 cursor-not-allowed opacity-50'
            }`}
            title={!aiEnabled ? 'Disponível no plano PRO' : undefined}
          >
            <Bot size={14} className="inline mr-1.5" />
            Assistente IA {!aiEnabled && '(PRO)'}
          </button>

          <div className="bg-surface border-2 border-border p-2 rounded-xl flex gap-1">
            <button
              onClick={() => onTipoChange('valor_fechado')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${!isContinuous ? 'bg-accent text-white shadow-lg' : 'text-muted hover:text-white'}`}
            >
              Valor Fechado
            </button>
            <button
              onClick={() => onTipoChange('servico_continuo')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${isContinuous ? 'bg-accent text-white shadow-lg' : 'text-muted hover:text-white'}`}
            >
              Serviço Contínuo
            </button>
          </div>
        </div>
      </div>

      {/* Client Search */}
      {showClientSearch && (
        <div className="bg-surface border-2 border-accent/30 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <Building2 size={16} className="text-accent" />
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={clientSearch}
              onChange={e => setClientSearch(e.target.value)}
              className="flex-1 bg-bg border border-border rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-accent"
            />
          </div>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {clients
              .filter(c => (c.name || '').toLowerCase().includes(clientSearch.toLowerCase()))
              .slice(0, 8)
              .map(c => (
                <button
                  key={c.id}
                  onClick={() => { setShowClientSearch(false); setClientSearch(''); }}
                  className="w-full flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-accent/10 text-left"
                >
                  <Building2 size={14} className="text-muted" />
                  <div>
                    <div className="text-sm font-bold text-white">{c.name}</div>
                    <div className="text-[10px] text-muted">{c.location}</div>
                  </div>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* AI Research Widget */}
      {showAiSearch && <AiResearchWidget />}

      {/* Catalog Search with Semantic AI */}
      {showCatalogSearch && (
        <div className="bg-surface border-2 border-accent/30 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <Search size={16} className="text-accent flex-shrink-0" />
            <input
              type="text"
              placeholder="Buscar no catálogo ou descrever o que precisa..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery.trim() && aiEnabled) {
                  handleSemanticSearch(searchQuery);
                }
              }}
              className="flex-1 bg-bg border border-border rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-accent"
            />
            {aiEnabled && (
              <button
                onClick={() => searchQuery.trim() && handleSemanticSearch(searchQuery)}
                className={`p-2 rounded-lg transition-colors flex-shrink-0 ${semanticLoading ? 'animate-pulse text-accent' : 'text-muted hover:text-accent hover:bg-accent/10'}`}
                title="Buscar com IA"
              >
                <RefreshCw size={16} className={semanticLoading ? 'animate-spin' : ''} />
              </button>
            )}
          </div>

          {/* Semantic search results */}
          {semanticLoading && (
            <div className="text-center py-4 text-muted text-sm">
              <RefreshCw size={16} className="animate-spin inline mr-2" />
              Buscando itens semelhantes com IA...
            </div>
          )}
          {!semanticLoading && semanticResults.length > 0 && (
            <div className="mb-3 p-2 bg-accent/5 rounded-xl border border-accent/20">
              <p className="text-[10px] font-bold text-accent uppercase tracking-wider mb-2">✨ Sugestões da IA</p>
              <div className="space-y-1">
                {semanticResults.map((item, idx) => (
                  <button
                    key={`semantic-${idx}`}
                    onClick={() => {
                      addFromCatalog(item);
                      setSemanticResults([]);
                      setSearchQuery('');
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-accent/10 text-left transition-colors"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {item.isProduct ? <Package size={12} className="text-accent flex-shrink-0" /> : <Wrench size={12} className="text-gold flex-shrink-0" />}
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-white truncate">{item.description}</div>
                        <div className="text-[10px] text-muted">
                          {item.category || 'SERVICO'} · {item.unit || 'UNID.'} · {typeof item.defaultPrice === 'number' ? fmt(item.defaultPrice) : '—'}
                        </div>
                      </div>
                    </div>
                    <Plus size={14} className="text-accent opacity-50 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
          {!semanticLoading && semanticResults.length === 0 && searchQuery.length > 2 && aiEnabled && (
            <div className="mb-2 text-[10px] text-muted italic">
              Sem sugestões semânticas. Tente termos mais específicos ou busque no catálogo abaixo.
            </div>
          )}

          {/* Traditional catalog */}
          {catalogLoading ? (
            <div className="text-center py-6 text-muted text-sm">Carregando catálogo...</div>
          ) : filteredCatalog.length === 0 ? (
            <div className="text-center py-6 text-muted text-sm">Nenhum item encontrado.</div>
          ) : (
            <div className="max-h-48 overflow-y-auto space-y-1 mt-2">
              {filteredCatalog.map(item => {
                const alreadyAdded = items.some(i => i.catalogId === item.id);
                const isLowStock = item.isProduct && item.stockQuantity <= item.minStock;
                return (
                  <button
                    key={item.id}
                    onClick={() => !alreadyAdded && addFromCatalog(item)}
                    disabled={alreadyAdded}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all ${
                      alreadyAdded
                        ? 'bg-bg/50 text-muted cursor-not-allowed opacity-50'
                        : 'hover:bg-accent/10 text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {item.isProduct ? <Package size={12} className="text-accent flex-shrink-0" /> : <Wrench size={12} className="text-gold flex-shrink-0" />}
                      <div className="min-w-0">
                        <div className="text-sm font-bold truncate">{item.description}</div>
                        <div className="text-[10px] text-muted">
                          {item.category} · {item.unit}
                          {item.isProduct && <> · Estoque: <span className={isLowStock ? 'text-danger' : 'text-success'}>{item.stockQuantity}</span></>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-sm font-bold text-accent2">
                        {item.defaultPrice ? fmt(item.defaultPrice) : '—'}
                      </span>
                      {!alreadyAdded && <Plus size={14} className="text-accent" />}
                      {alreadyAdded && <span className="text-[10px] text-muted">Já adicionado</span>}
                    </div>
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
          {items.map((item, index) => (
            <motion.div
              key={item.id || `item-${index}`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-2 border-accent bg-accent/5 rounded-2xl overflow-hidden"
            >
              <div className="flex justify-between items-center p-4 border-b-2 border-border bg-black/20">
                <div className="text-sm font-bold text-white flex items-center gap-3">
                  <span className="text-accent2 font-display text-lg">{index + 1}</span>
                  {item.catalogId ? <span className="text-[10px] bg-accent/20 text-accent2 px-2 py-0.5 rounded-full font-bold">Do Cadastro</span> : 'Item do Escopo'}
                </div>
                <Button variant="ghost" className="text-danger hover:text-danger hover:bg-danger/10 px-3 py-1 flex items-center gap-2" onClick={() => removeItem(item.id)}>
                  <Trash2 size={16} /> Remover
                </Button>
              </div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input
                  label="Descrição Curta (Título) *"
                  placeholder="Ex.: Reconstrução de taludes"
                  value={item.label}
                  onChange={e => updateItem(item.id, "label", e.target.value)}
                />
                <Input
                  label="Unidade de Medida"
                  placeholder="Ex.: UNID., HRS, M²"
                  value={item.unit}
                  onChange={e => updateItem(item.id, "unit", e.target.value)}
                />
              </div>
              <div className="border-t-2 border-border p-5 bg-black/20">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <Input
                    inputMode="decimal"
                    pattern="[0-9]*"
                    label="Qtd"
                    value={item.qty}
                    onChange={e => updateItem(item.id, "qty", e.target.value)}
                    onFocus={e => e.target.select()}
                  />
                  <Input
                    inputMode="decimal"
                    pattern="[0-9]*"
                    step="0.01"
                    label="Valor Unit. (R$)"
                    value={item.price}
                    onChange={e => updateItem(item.id, "price", e.target.value)}
                    onFocus={e => e.target.select()}
                  />
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted">Subtotal</label>
                    <div className="bg-bg border-2 border-border rounded-xl px-4 py-3 text-sm font-bold text-accent2 flex items-center">
                      {fmt((parseFloat(item.qty) || 0) * (parseFloat(item.price) || 0))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-border rounded-2xl text-muted text-center">
            <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-4">
              <Plus size={24} className="text-accent" />
            </div>
            <p className="font-bold text-white mb-2">Nenhum item adicionado</p>
            <p className="text-sm">Use "Buscar Produtos" para adicionar itens pré-cadastrados ou clique abaixo para adicionar manualmente.</p>
          </div>
        )}

        {/* AI Suggestions widget */}
        <AiSuggestionsWidget
          currentItems={items}
          onAddItem={(suggested) => {
            const newId = `ITEM.${String(items.length + 1).padStart(2, '0')}`;
            onChange([...items, {
              id: newId,
              catalogId: suggested.catalogId || null,
              label: suggested.label,
              unit: suggested.unit || 'UNID.',
              qty: suggested.qty || 1,
              price: suggested.price || 0,
              category: suggested.category || 'SERVICO',
              isProduct: suggested.isProduct || false,
            }]);
          }}
          disabled={!aiEnabled}
          aiEnabled={aiEnabled}
        />
      </div>

      {/* Total and actions */}
      <div className="pt-4 pb-6">
        <Button onClick={addItem} className="w-full border-dashed border-2 bg-transparent hover:bg-accent/10 border-accent/50 text-accent2 py-4 text-lg">
          + Adicionar Item ao Escopo
        </Button>
      </div>

      <div className="sticky bottom-0 bg-surface/90 backdrop-blur-xl border-2 border-border p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl z-10">
        {!isContinuous ? (
          <div className="text-center sm:text-left">
            <div className="text-[10px] text-muted font-bold uppercase tracking-widest mb-1">Total Estimado</div>
            <div className="text-3xl font-black font-display text-gold">{fmt(total)}</div>
          </div>
        ) : (
          <div className="text-center sm:text-left">
            <div className="text-[10px] text-accent font-bold uppercase tracking-widest mb-1">Modelo de Precificação</div>
            <div className="text-xl font-black font-display text-white">Valor por Medição</div>
          </div>
        )}
        <div className="flex gap-4 w-full sm:w-auto">
          <Button variant="ghost" onClick={onBack} className="flex-1 sm:flex-none flex items-center justify-center gap-2">
            <ArrowLeft size={18} /> Voltar
          </Button>
          <Button
            onClick={onNext}
            disabled={items.length === 0}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2"
          >
            Próximo <ArrowRight size={18} />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default StepServicos;