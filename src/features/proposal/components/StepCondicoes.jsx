import React from 'react';
import { ChevronRight, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Input from '../../../shared/Input';
import Button from '../../../shared/Button';

const StepCondicoes = ({ data, onChange, onNext, onBack }) => {
  const update = (field, val) => onChange({ ...data, [field]: val });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-20"
    >
      <div className="mb-4">
        <h2 className="text-2xl font-bold font-display text-text-primary dark:text-white">Condições Comerciais</h2>
        <p className="text-muted text-sm mt-1">Configure o modelo de contrato, faturamento e visibilidade.</p>
      </div>

      {/* Tipo de Proposta */}
      <div className="bg-surface border-2 border-border p-6 rounded-2xl space-y-4">
        <label className="text-[10px] font-bold uppercase tracking-widest text-muted">Modelo de Precificação</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button 
            type="button"
            onClick={() => update('tipoProposta', 'valor_fechado')}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              data.tipoProposta === 'valor_fechado' ? 'border-accent bg-accent/10' : 'border-border bg-bg hover:border-accent/30'
            }`}
          >
            <div className={`font-bold text-sm mb-1 ${data.tipoProposta === 'valor_fechado' ? 'text-text-primary dark:text-white' : 'text-text-secondary dark:text-muted'}`}>Valor Fechado</div>
            <div className="text-[11px] text-muted">Escopo e quantidades fixas.</div>
          </button>
          <button 
            type="button"
            onClick={() => update('tipoProposta', 'servico_continuo')}
            className={`p-4 rounded-xl border-2 transition-all text-left ${
              data.tipoProposta === 'servico_continuo' ? 'border-accent bg-accent/10' : 'border-border bg-bg hover:border-accent/30'
            }`}
          >
            <div className={`font-bold text-sm mb-1 ${data.tipoProposta === 'servico_continuo' ? 'text-text-primary dark:text-white' : 'text-text-secondary dark:text-muted'}`}>Medição / Contínuo</div>
            <div className="text-[11px] text-muted">Faturamento baseado na execução real.</div>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* SEÇÃO: FORMA DE PAGAMENTO */}
        <div className={`bg-surface border-2 rounded-2xl transition-all duration-300 overflow-hidden ${data.showPagamento !== false ? 'border-accent/40 shadow-lg shadow-accent/5' : 'border-border opacity-70'}`}>
          <div 
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
            onClick={() => update('showPagamento', data.showPagamento === false)}
          >
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                checked={data.showPagamento !== false} 
                readOnly
                className="w-5 h-5 rounded border-border text-accent focus:ring-accent bg-bg"
              />
              <div>
                <h3 className="font-bold text-text-primary dark:text-white text-sm">Condições de Pagamento</h3>
                <p className="text-[10px] text-muted uppercase tracking-wider">Entrada, Medição e Prazos</p>
              </div>
            </div>
            <div className={`transition-transform duration-300 ${data.showPagamento !== false ? 'rotate-90' : ''}`}>
              <ChevronRight size={18} className="text-muted" />
            </div>
          </div>

          {data.showPagamento !== false && (
            <div className="p-6 pt-2 border-t border-border bg-black/10 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Input label="Entrada (%)" inputMode="decimal" pattern="[0-9]*" value={data.entrada} onChange={e => update('entrada', e.target.value)} onFocus={e => e.target.select()} suffix="%" />
                <Input label="Prazo Entrada" inputMode="decimal" pattern="[0-9]*" value={data.prazoEntrada} onChange={e => update('prazoEntrada', e.target.value)} onFocus={e => e.target.select()} suffix="dias" />
                <Input label="Medição a cada" inputMode="decimal" pattern="[0-9]*" value={data.medicao} onChange={e => update('medicao', e.target.value)} onFocus={e => e.target.select()} suffix="dias" />
                <Input label="Prazo Pagto NF" inputMode="decimal" pattern="[0-9]*" value={data.prazoNF} onChange={e => update('prazoNF', e.target.value)} onFocus={e => e.target.select()} suffix="dias" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted ml-1">Detalhes da Forma de Pagamento</label>
                <textarea 
                  rows={2} 
                  value={data.formaPagamento} 
                  onChange={e => update('formaPagamento', e.target.value)}
                  placeholder="Ex.: Depósito bancário, PIX, boleto..." 
                  className="input-base border-2 border-border h-24 resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* SEÇÃO: GARANTIAS */}
        <div className={`bg-surface border-2 rounded-2xl transition-all duration-300 overflow-hidden ${data.showGarantias !== false ? 'border-accent/40 shadow-lg shadow-accent/5' : 'border-border opacity-70'}`}>
          <div 
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
            onClick={() => update('showGarantias', data.showGarantias === false)}
          >
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                checked={data.showGarantias !== false} 
                readOnly
                className="w-5 h-5 rounded border-border text-accent focus:ring-accent bg-bg"
              />
              <div>
                <h3 className="font-bold text-text-primary dark:text-white text-sm">Garantias</h3>
                <p className="text-[10px] text-muted uppercase tracking-wider">Prazos contra defeitos e acidentes</p>
              </div>
            </div>
            <div className={`transition-transform duration-300 ${data.showGarantias !== false ? 'rotate-90' : ''}`}>
              <ChevronRight size={18} className="text-muted" />
            </div>
          </div>

          {data.showGarantias !== false && (
            <div className="p-6 pt-2 border-t border-border bg-black/10 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input label="Período de Garantia" inputMode="decimal" pattern="[0-9]*" value={data.warrantyPeriod || ''} onChange={e => update('warrantyPeriod', e.target.value)} suffix="períodos" />
                <select
                  value={data.warrantyType || 'ANOS'}
                  onChange={e => update('warrantyType', e.target.value)}
                  className="mt-2 input-base border-2 border-border"
                >
                  <option value="DIAS">Dias</option>
                  <option value="MESES">Meses</option>
                  <option value="ANOS">Anos</option>
                </select>
              </div>
              <div className="flex items-center justify-center">
                <p className="text-sm text-text-secondary italic text-center">Período e tipo simplificados conforme padrão da empresa.</p>
              </div>
            </div>
          )}
        </div>



        {/* SEÇÃO: PRAZOS E VALIDADE */}
        <div className="bg-surface border-2 border-border p-6 rounded-2xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Prazo de Execução" value={data.prazoExec} onChange={e => update('prazoExec', e.target.value)} placeholder="Ex.: 30 dias úteis" />
            <Input label="Validade da Proposta" inputMode="decimal" pattern="[0-9]*" value={data.validade} onChange={e => update('validade', e.target.value)} onFocus={e => e.target.select()} suffix="dias" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted ml-1">Observações Gerais</label>
            <textarea 
              rows={3} 
              value={data.obs} 
              onChange={e => update('obs', e.target.value)}
              placeholder="Notas adicionais..." 
              className="input-base border-2 border-border h-32 resize-none"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-8">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft size={18} /> Voltar
        </Button>
        <Button onClick={onNext} className="flex items-center gap-2">
          Revisar proposta <ArrowRight size={18} />
        </Button>
      </div>
    </motion.div>
  );
};

export default StepCondicoes;
