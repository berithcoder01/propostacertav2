import React, { useState } from 'react';
import { Search, Loader, Bot, ExternalLink, MapPin } from 'lucide-react';
import { aiPriceResearch, aiFindSuppliers } from '../../../shared/services/api';
import { useToast } from '../../../shared/context/ToastContext';
import Button from '../../../shared/Button';

export default function AiResearchWidget({ defaultLocation = '' }) {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState(defaultLocation);
  const [activeTab, setActiveTab] = useState('price'); // 'price' | 'suppliers'
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { toast } = useToast();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      if (activeTab === 'price') {
        const res = await aiPriceResearch(query);
        setResult(res.results);
      } else {
        if (!location.trim()) {
          toast({ message: 'Informe a localização para buscar fornecedores', type: 'error' });
          setLoading(false);
          return;
        }
        const res = await aiFindSuppliers(query, location);
        setResult(res.results);
      }
    } catch (err) {
      toast({ message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface border border-accent/30 rounded-2xl p-4 shadow-lg">
      <div className="flex items-center gap-2 mb-4 text-white font-bold font-display">
        <Bot size={20} className="text-accent" /> Assistente IA
      </div>

      <div className="flex gap-2 mb-4 border-b border-border pb-2">
        <button
          onClick={() => { setActiveTab('price'); setResult(null); }}
          className={`text-sm font-bold pb-2 border-b-2 transition-colors ${activeTab === 'price' ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-white'}`}
        >
          Estimativa de Preço
        </button>
        <button
          onClick={() => { setActiveTab('suppliers'); setResult(null); }}
          className={`text-sm font-bold pb-2 border-b-2 transition-colors ${activeTab === 'suppliers' ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-white'}`}
        >
          Fornecedores Locais
        </button>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col gap-3">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={activeTab === 'price' ? "Ex: Telha galvanizada trapezoidal" : "Ex: Concreto usinado fck 25"}
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-bg border border-border rounded-xl px-3 py-2 text-sm text-white focus:border-accent outline-none"
          />
        </div>
        
        {activeTab === 'suppliers' && (
          <div className="flex gap-2 items-center">
            <MapPin size={16} className="text-muted" />
            <input
              type="text"
              placeholder="Localização (Ex: Curitiba, PR)"
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="flex-1 bg-bg border border-border rounded-xl px-3 py-2 text-sm text-white focus:border-accent outline-none"
            />
          </div>
        )}

        <Button type="submit" disabled={loading || !query.trim()} className="w-full flex justify-center items-center gap-2 mt-2">
          {loading ? <Loader size={16} className="animate-spin" /> : <Search size={16} />}
          Pesquisar com IA
        </Button>
      </form>

      {/* Resultados */}
      {result && (
        <div className="mt-4 p-4 bg-bg rounded-xl border border-border">
          {activeTab === 'price' && result.estimatedPriceRange ? (
            <div className="space-y-3">
              <h4 className="text-white font-bold">{result.item}</h4>
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-3">
                <span className="text-xs text-muted block mb-1">Preço Estimado</span>
                <div className="text-xl font-black text-accent2">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(result.estimatedPriceRange.min)}
                  <span className="text-sm font-normal text-muted mx-1">até</span>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(result.estimatedPriceRange.max)}
                  <span className="text-sm font-normal text-muted ml-1">/ {result.unit}</span>
                </div>
              </div>
              {result.notes && <p className="text-xs text-muted leading-relaxed">{result.notes}</p>}
            </div>
          ) : activeTab === 'suppliers' && result.suppliers ? (
            <div className="space-y-3">
              <h4 className="text-white font-bold text-sm mb-2">Possíveis Fornecedores:</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {result.suppliers.map((sup, idx) => (
                  <div key={idx} className="bg-surface p-3 rounded-lg border border-border">
                    <div className="font-bold text-white text-sm flex items-center justify-between">
                      {sup.name}
                      <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-muted">{sup.type}</span>
                    </div>
                    {sup.contactInfo && <div className="text-xs text-accent2 mt-1">{sup.contactInfo}</div>}
                    {sup.notes && <p className="text-[10px] text-muted mt-2">{sup.notes}</p>}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted">Resultado não pôde ser formatado adequadamente.</div>
          )}
        </div>
      )}
    </div>
  );
}
