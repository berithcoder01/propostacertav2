import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader, Plus, ThumbsUp, X, Lock } from 'lucide-react';
import Button from '../../../shared/Button';
import { useUpgrade } from '../../../shared/context/UpgradeContext';
import { aiSuggestItems } from '../../../shared/services/api';

const AiSuggestionsWidget = ({ currentItems = [], onAddItem, disabled = false, aiEnabled = true }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [lastQuery, setLastQuery] = useState('');
  const { openUpgrade } = useUpgrade();

  // Debounce timer
  let debounceTimer = null;

  const fetchSuggestions = async (items) => {
    if (items.length === 0) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const data = await aiSuggestItems(items);
      if (data.suggestions && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
        setExpanded(true);
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      console.warn('IA suggestions não disponível:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Dispara busca quando itens mudam (com debounce)
  useEffect(() => {
    if (disabled || !aiEnabled) return;

    clearTimeout(debounceTimer);
    const query = currentItems.map(i => i.label).join(', ');

    if (query === lastQuery) return;
    setLastQuery(query);

    debounceTimer = setTimeout(() => {
      if (currentItems.length >= 1) {
        fetchSuggestions(currentItems);
      }
    }, 2000); // Espera 2s após última alteração

    return () => clearTimeout(debounceTimer);
  }, [currentItems, disabled, aiEnabled, lastQuery]);

  const handleAdd = (suggestion) => {
    if (onAddItem) {
      onAddItem({
        catalogId: suggestion.id || null,
        label: suggestion.label,
        unit: suggestion.unit || 'UNID.',
        qty: suggestion.quantity || 1,
        price: suggestion.unitPrice || 0,
        category: 'SERVICO',
      });
    }
    // Marcar como usada
    setSuggestions(prev => prev.filter(s => s !== suggestion));
  };

  // Se IA desabilitada, mostrar mensagem de upgrade
  if (!aiEnabled) {
    return (
      <div className="mt-4 border-2 border-dashed border-border/50 rounded-2xl p-5 text-center">
        <Lock size={20} className="text-muted mx-auto mb-2" />
        <p className="text-sm text-muted">
          Sugestões de IA disponíveis no plano{' '}
          <button
            onClick={openUpgrade}
            className="text-accent font-bold hover:underline"
          >
            PRO
          </button>
        </p>
      </div>
    );
  }

  if (disabled) return null;
  if (!expanded && suggestions.length === 0 && !loading) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="mt-4 relative"
      >
        {/* Header do widget */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm group"
          disabled={loading}
        >
          {loading ? (
            <Loader size={14} className="animate-spin text-accent" />
          ) : (
            <Sparkles size={14} className="text-accent group-hover:text-accent2 transition-colors" />
          )}
          <span className={`text-xs font-bold ${expanded ? 'text-accent' : 'text-muted'}`}>
            {loading ? 'Analisando escopo com IA...' : expanded ? 'Ocultar sugestões da IA' : `Sugestões da IA (${suggestions.length})`}
          </span>
        </button>

        {/* Lista de sugestões */}
        <AnimatePresence>
          {expanded && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 space-y-2"
            >
              <p className="text-[10px] text-muted mb-1">
                Baseado nos itens já incluídos no escopo:
              </p>
              <AnimatePresence>
                {suggestions.map((s, idx) => (
                  <motion.div
                    key={`${s.id || idx}-${s.label}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center gap-3 bg-surface/50 border border-border/50 rounded-xl p-3 hover:border-accent/30 transition-colors group/item"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-white truncate">{s.label}</div>
                      <div className="text-[10px] text-muted">
                        {s.quantity} {s.unit} · {typeof s.unitPrice === 'number' ? s.unitPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '—'}
                      </div>
                      {s.reason && (
                        <div className="text-[9px] text-accent2 mt-0.5 italic">
                          💡 {s.reason}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleAdd(s)}
                        className="p-1.5 bg-accent/20 text-accent rounded-lg hover:bg-accent/30 transition-colors"
                        title="Adicionar ao escopo"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Estado vazio */}
        {expanded && suggestions.length === 0 && !loading && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[10px] text-muted mt-2 italic"
          >
            Nenhuma sugestão adicional com base no escopo atual.
          </motion.p>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default AiSuggestionsWidget;