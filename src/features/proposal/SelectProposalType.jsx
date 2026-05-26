import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Settings, ArrowRight, Calendar, Sparkles, Lock } from 'lucide-react';
import { useAuth } from '../../shared/context/AuthContext';

const SelectProposalType = () => {
  const navigate = useNavigate();
  const { checkPlanLimit } = useAuth();
  const aiEnabled = checkPlanLimit('ai');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-black font-display text-text-primary">Selecione o Tipo de Orçamento</h1>
        <p className="text-text-secondary text-lg max-w-2xl mx-auto">
          Escolha o modelo adequado para iniciar a estruturação da sua proposta comercial.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Opção: Geral */}
        <button
          onClick={() => navigate('/propostas/nova/geral')}
          className="bg-surface dark:bg-dark-surface border-2 border-border dark:border-dark-border p-8 rounded-3xl text-left hover:border-accent hover:bg-accent/5 dark:hover:bg-accent/10 transition-all group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-bl-full -z-10 group-hover:bg-accent/20 transition-colors" />
          <div className="w-16 h-16 bg-bg dark:bg-dark-bg border-2 border-border dark:border-dark-border rounded-2xl flex items-center justify-center mb-6 group-hover:border-accent transition-colors">
            <Settings className="text-accent2" size={32} />
          </div>
          <h2 className="text-xl font-bold font-display text-text-primary mb-3">Geral / Padrão</h2>
          <p className="text-text-secondary text-sm mb-6 leading-relaxed">Orçamento flexível com mão de obra e materiais.</p>
          <div className="flex items-center gap-2 font-bold text-accent2 text-[10px] uppercase tracking-widest group-hover:translate-x-2 transition-transform">
            Iniciar Geral <ArrowRight size={14} />
          </div>
        </button>

        {/* Opção: Serviço Contínuo */}
        <button
          onClick={() => navigate('/propostas/nova/geral?tipo=servico_continuo')}
          className="bg-surface dark:bg-dark-surface border-2 border-border dark:border-dark-border p-8 rounded-3xl text-left hover:border-gold hover:bg-gold/5 dark:hover:bg-gold/10 transition-all group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-bl-full -z-10 group-hover:bg-gold/20 transition-colors" />
          <div className="w-16 h-16 bg-bg dark:bg-dark-bg border-2 border-border dark:border-dark-border rounded-2xl flex items-center justify-center mb-6 group-hover:border-gold transition-colors">
            <Calendar className="text-gold" size={32} />
          </div>
          <h2 className="text-xl font-bold font-display text-text-primary mb-3">Serviço Contínuo</h2>
          <p className="text-text-secondary text-sm mb-6 leading-relaxed">Manutenção ou serviços recorrentes.</p>
          <div className="flex items-center gap-2 font-bold text-gold text-[10px] uppercase tracking-widest group-hover:translate-x-2 transition-transform">
            Iniciar Contínuo <ArrowRight size={14} />
          </div>
        </button>

        {/* Opção: IA Geradora — controlada por plano */}
        <button
          onClick={() => aiEnabled ? navigate('/propostas/nova/ai') : navigate('/plans')}
          className={`bg-surface dark:bg-dark-surface border-2 p-8 rounded-3xl text-left transition-all group relative overflow-hidden
            ${aiEnabled
              ? 'border-border dark:border-dark-border hover:border-accent2 hover:bg-accent2/5 dark:hover:bg-accent2/10 cursor-pointer'
              : 'border-border/40 dark:border-dark-border/40 opacity-60 cursor-not-allowed'}`}
        >
          <div className={`absolute top-0 right-0 w-32 h-32 rounded-bl-full -z-10 transition-colors
            ${aiEnabled ? 'bg-accent2/10 group-hover:bg-accent2/20' : 'bg-muted/5'}`} />
          <div className={`w-16 h-16 bg-bg dark:bg-dark-bg border-2 rounded-2xl flex items-center justify-center mb-6 transition-colors
            ${aiEnabled ? 'border-border dark:border-dark-border group-hover:border-accent2' : 'border-border/40 dark:border-dark-border/40'}`}>
            {aiEnabled
              ? <Sparkles className="text-accent" size={32} />
              : <Lock className="text-muted" size={32} />}
          </div>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-xl font-bold font-display text-text-primary">Gerar com IA</h2>
            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter
              ${aiEnabled ? 'bg-accent/20 text-accent' : 'bg-muted/20 text-muted'}`}>
              {aiEnabled ? 'ENTERPRISE' : 'PRO'}
            </span>
          </div>
          <p className="text-text-secondary text-sm mb-6 leading-relaxed">
            {aiEnabled
              ? 'Descreva o projeto e a IA montará tudo para você.'
              : 'Disponível nos planos PRO e ENTERPRISE.'}
          </p>
          <div className={`flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest transition-transform
            ${aiEnabled ? 'text-accent group-hover:translate-x-2' : 'text-muted'}`}>
            {aiEnabled ? <><span>Iniciar com IA</span><ArrowRight size={14} /></> : 'Ver Planos →'}
          </div>
        </button>
      </div>
    </motion.div>
  );
};

export default SelectProposalType;
