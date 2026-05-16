import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  XCircle, Info, Percent, DollarSign, Shield, Star
} from 'lucide-react';
import { aiAnalyzeProfitability } from '../../../shared/services/api';

const ProfitabilityAnalysis = ({ proposalId, proposal, visible = true }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!proposalId || !visible) return;
    loadAnalysis();
  }, [proposalId, visible]);

  const loadAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await aiAnalyzeProfitability(proposalId);
      setAnalysis(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getBarColor = (value, max = 50) => {
    if (value >= 30) return 'bg-success';
    if (value >= 20) return 'bg-accent';
    if (value >= 10) return 'bg-gold';
    return 'bg-danger';
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-danger/20 border-danger/40 text-danger';
      case 'medium': return 'bg-gold/20 border-gold/40 text-gold';
      default: return 'bg-muted/20 border-muted/40 text-muted';
    }
  };

  const scoreColor = analysis?.score >= 70 ? 'text-success' :
    analysis?.score >= 50 ? 'text-accent' :
    analysis?.score >= 30 ? 'text-gold' : 'text-danger';

  if (loading) {
    return (
      <div className="p-6 rounded-2xl bg-surface border border-border">
        <div className="flex items-center gap-3 text-muted">
          <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          Analisando lucratividade...
        </div>
      </div>
    );
  }

  // Se não tem analysis (preview), mostra dados estimados do proposal
  const data = analysis || {
    total: proposal?.total || 0,
    margemBruta: 0,
    margemLiquida: 0,
    alertas: [],
    score: 0,
    classificacao: 'Sem análise',
    totalItens: proposal?.items?.length || 0,
    analiseItens: proposal?.items?.map(i => ({
      label: i.label || i.description,
      quantity: i.quantity,
      unit: i.unit,
      unitPrice: i.unitPrice,
      subtotal: i.quantity * i.unitPrice,
      margemItem: 40
    })) || []
  };

  return (
    <motion.div
      initial={!visible ? { opacity: 0, height: 0 } : {}}
      animate={visible ? { opacity: 1, height: 'auto' } : { opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden"
    >
      <div className="bg-surface border border-border rounded-2xl p-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={20} className="text-accent2" />
            <h3 className="text-lg font-bold font-display text-text-primary">Análise de Lucratividade</h3>
          </div>
          <button
            onClick={loadAnalysis}
            className="text-xs text-accent hover:underline flex items-center gap-1"
          >
            <TrendingUp size={12} /> Atualizar
          </button>
        </div>

        {error && (
          <div className="bg-danger/10 border border-danger/30 text-danger p-3 rounded-xl text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Score */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="card p-4">
            <div className="text-[10px] text-muted uppercase font-bold tracking-wider mb-1">Score</div>
            <div className={`text-2xl font-black ${scoreColor}`}>
              {data.score}<span className="text-[12px] text-muted">/100</span>
            </div>
            <div className="text-[10px] text-muted mt-0.5">{data.classificacao}</div>
          </div>

          <div className="card p-4">
            <div className="text-[10px] text-muted uppercase font-bold tracking-wider mb-1">Total Proposta</div>
            <div className="text-xl font-black text-text-primary">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(data.total)}
            </div>
            <div className="text-[10px] text-muted mt-0.5">{data.totalItens} itens</div>
          </div>

          <div className="card p-4">
            <div className="text-[10px] text-muted uppercase font-bold tracking-wider mb-1">Margem Bruta</div>
            <div className={`text-xl font-black ${getBarColor(data.margemBruta, 40)}`}>
              {data.margemBruta.toFixed(1)}%
            </div>
            <div className="text-[10px] text-muted mt-0.5">
              {data.margemBruta >= 25 ? '✅ Boa' : data.margemBruta >= 15 ? '⚠️ Atenção' : '🔴 Critica'}
            </div>
          </div>

          <div className="card p-4">
            <div className="text-[10px] text-muted uppercase font-bold tracking-wider mb-1">Margem Líquida</div>
            <div className={`text-xl font-black ${getBarColor(data.margemLiquida, 25)}`}>
              {data.margemLiquida.toFixed(1)}%
            </div>
            <div className="text-[10px] text-muted mt-0.5">
              Estimada (após encargos)
            </div>
          </div>
        </div>

        {/* Barra de margem visual */}
        <div className="space-y-2">
          <div className="flex justify-between text-[11px] text-muted">
            <span>Margem Bruta</span>
            <span>{data.margemBruta.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-bg rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(data.margemBruta, 100)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`h-full rounded-full ${getBarColor(data.margemBruta, 40)}`}
            />
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-muted">Limite ideal:</span>
            <span className="text-accent2">20-35%</span>
          </div>
        </div>

        {/* Alertas */}
        <AnimatePresence>
          {data.alertas && data.alertas.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-2"
            >
              <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <AlertTriangle size={14} className="text-gold" />
                Alertas
              </h4>
              {data.alertas.map((alerta, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl border text-sm ${getSeverityColor(alerta.severidade)}`}
                >
                  {alerta.tipo === 'danger' ? <XCircle size={14} className="inline mr-1" /> :
                    alerta.tipo === 'warning' ? <AlertTriangle size={14} className="inline mr-1" /> :
                    <Info size={14} className="inline mr-1" />}
                  {alerta.mensagem}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Detalhamento por item */}
        {data.analiseItens && data.analiseItens.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <Star size={14} className="text-accent2" />
              Detalhamento por Item
            </h4>
            <div className="space-y-1 max-h-[250px] overflow-y-auto">
              {data.analiseItens.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-bg rounded-lg border border-border/50 text-xs">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white truncate">{item.label}</div>
                    <div className="text-muted">{item.quantity} {item.unit} × {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.unitPrice)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-accent2 font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.subtotal)}</div>
                    <div className={`text-[10px] ${item.margemItem >= 35 ? 'text-success' : 'text-gold'}`}>
                      Margem: {item.margemItem}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Benchmarks */}
        {data.benchmarks && (
          <div className="bg-bg rounded-xl p-3 space-y-2">
            <h4 className="text-[10px] font-bold text-muted uppercase tracking-wider">Benchmarks do Mercado</h4>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-muted">Markup recomendado:</span>
                <span className="text-accent2 font-bold ml-1">{data.benchmarks.markupRecomendado}</span>
              </div>
              <div>
                <span className="text-muted">Margem bruta:</span>
                <span className="text-accent2 font-bold ml-1">{data.benchmarks.margemBrutaRecomendada}</span>
              </div>
              <div>
                <span className="text-muted">Encargos:</span>
                <span className="text-accent2 font-bold ml-1">{data.benchmarks.taxaEncargosMedia}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProfitabilityAnalysis;