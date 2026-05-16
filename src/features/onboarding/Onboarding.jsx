// PropostaCerta - Onboarding com Design System v2
import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Palette, CheckCircle, ArrowRight, ArrowLeft,
  Loader, Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Input from '../../shared/Input';
import Button from '../../shared/Button';
import { useAuth } from '../../shared/context/AuthContext';
import { fetchPlans, refreshToken } from '../../shared/services/api';
import Stepper from '../../shared/components/Stepper';

// Lazy load pesados com auto-reload em caso de chunk invalidation (entre deploys)
const lazyWithReload = (factory) => lazy(() =>
  factory().catch(() => { window.location.reload(); return { default: () => null }; })
);
const OnboardingConversacional = lazyWithReload(() => import('./OnboardingConversacional'));
const ProposalPreview = lazyWithReload(() => import('./components/ProposalPreview'));
const BrandGenerator = lazyWithReload(() => import('../../shared/components/BrandGenerator'));
const ThemeSelector = lazyWithReload(() => import('../../shared/components/ThemeSelector'));

const SEGMENTS = [
  { value: 'ELETRICA', label: 'Elétrica', emoji: '⚡' },
  { value: 'CONSTRUCAO_CIVIL', label: 'Construção Civil', emoji: '🏗️' },
  { value: 'HIDRAULICA', label: 'Hidráulica', emoji: '🔧' },
  { value: 'PINTURA', label: 'Pintura', emoji: '🎨' },
  { value: 'AR_CONDICIONADO', label: 'Ar Condicionado', emoji: '❄️' },
  { value: 'OUTRO', label: 'Outro', emoji: '🔨' },
];

// Helper: calcula classe CSS do segmento ativo
function getSegmentClass(isActive) {
  if (isActive) return 'border-white';
  return 'border-border bg-surface text-text-secondary hover:border-border-strong';
}

// Máscaras de input
const masks = {
  cnpj: (v) => {
    v = v.replace(/\D/g, '');
    return v
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .substring(0, 18);
  },
  phone: (v) => {
    v = v.replace(/\D/g, '');
    if (v.length <= 10) {
      return v.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2').substring(0, 14);
    }
    return v.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').substring(0, 15);
  },
  pix: (v) => {
    const clean = v.replace(/\D/g, '');
    if (!clean || v.includes('@')) return v; // Provável e-mail
    if (clean.length <= 11) {
      // CPF ou Telefone
      if (clean.length === 11 && !clean.startsWith('0')) return masks.phone(clean);
      return clean.replace(/^(\d{3})(\d)/, '$1.$2').replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/(\d{3})(\d)/, '$1-$2').substring(0, 14);
    }
    return masks.cnpj(clean);
  }
};

// ===== ETAPA 0: Plano de Assinatura =====
const EtapaPlano = ({ onNext }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans()
      .then((data) => { setPlans(data.plans || data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-center py-10">
        <Loader size={24} className="animate-spin mx-auto text-accent" />
        <p className="text-muted mt-4">Carregando planos...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      className="text-center space-y-6 py-4"
    >
      <div className="space-y-2">
        <h1 className="text-2xl font-bold font-display text-text-primary">Escolha seu Plano</h1>
        <p className="text-text-secondary">Cada plano desbloqueia funcionalidades diferentes para seu negócio.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
        {plans.map((plan) => {
          const cardClass = plan.name === 'FREE'
            ? 'bg-surface border-border'
            : (plan.name === 'PRO'
              ? 'bg-surface border-accent/50 shadow-lg shadow-accent/10'
              : 'bg-surface border-gold/50 shadow-lg shadow-gold/10');

          let planColor = 'var(--text-secondary)';
          if (plan.name === 'PRO') planColor = 'var(--primary)';
          else if (plan.name === 'ENTERPRISE') planColor = 'var(--gold, #F59E0B)';

          const featuresList = typeof plan.features === 'string'
            ? JSON.parse(plan.features || '[]')
            : null;

          return (
            <motion.div
              key={plan.name}
              whileHover={{ scale: 1.03, y: -4 }}
              className={`rounded-2xl border-2 p-6 space-y-4 ${cardClass}`}
            >
              <div className="text-sm font-bold uppercase tracking-widest" style={{ color: planColor }}>
                {plan.name}
              </div>
              <div className="text-3xl font-black font-display">
                R$ {plan.price.toFixed(2)}
                <span className="text-sm text-muted font-normal">/mês</span>
              </div>
              <ul className="text-left text-sm space-y-1">
                {featuresList
                  ? featuresList.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-muted">
                      <CheckCircle size={14} className="text-success shrink-0" />
                      {' '}
                      <span>{f}</span>
                    </li>
                  ))
                  : <li className="text-muted">{plan.maxProposals} propostas/mês</li>}
              </ul>
              <Button onClick={() => onNext(plan)} className="w-full">
                {plan.price === 0 ? 'Começar Grátis' : `Escolher ${plan.name}`}
              </Button>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

// ===== ETAPA 1: Boas-vindas =====
const EtapaBemVindo = ({ onNext }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -30 }}
    className="text-center space-y-8 py-6"
  >
    <motion.div
      animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
      transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
      className="w-24 h-24 bg-gradient-brand rounded-2xl flex items-center justify-center font-bold text-4xl text-white mx-auto shadow-glow"
    >
      P
    </motion.div>
    <div className="space-y-3">
      <h1 className="text-3xl font-bold font-display text-text-primary">
        Bem-vindo ao <span className="text-gradient-brand">PropostaCerta</span>
      </h1>
      <p className="text-text-secondary text-lg">Sua jornada para propostas mais profissionais começa aqui!</p>
    </div>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
      <Button onClick={onNext} className="flex items-center gap-2 mx-auto">
        Começar <ArrowRight size={18} />
      </Button>
    </motion.div>
  </motion.div>
);

// ===== ETAPA 3: Identidade Visual (Logo, Cores, Temas) — Layout Reestruturado =====
const EtapaIdentidade = ({ formData, update, onNext, onBack, setLogoSelecionada, logoSelecionada }) => {
  const cores = ['#10B981', '#4F6EF7', '#8B5CF6', '#EC4899', '#F59E0B', '#EF4444', '#06B6D4', '#14B8A6', '#6366F1', '#84CC16'];

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      className="space-y-6"
    >
      {/* Cabeçalho */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
             style={{ background: `${formData.primaryColor}25`, color: formData.primaryColor }}>
          <Palette size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold font-display text-text-primary">Identidade Visual</h2>
          <p className="text-xs text-muted">Crie a marca e o estilo das suas propostas</p>
        </div>
      </div>

      {/* ── SEÇÃO 1: Gerador de Logo — largura total ── */}
      <div className="bg-surface/50 border border-border rounded-2xl p-5">
        <h3 className="text-xs font-bold uppercase tracking-widest text-accent mb-4 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center text-[10px] font-black">1</span>
          Escolha sua Logo Marca
        </h3>
        <Suspense fallback={<div className="h-48 flex items-center justify-center"><Loader className="animate-spin" /></div>}>
          <BrandGenerator
            companyName={formData.name}
            segment={formData.segment}
            primaryColor={formData.primaryColor}
            secondaryColor={formData.secondaryColor}
            onSelect={(logo) => setLogoSelecionada(logo)}
          />
        </Suspense>
      </div>

      {/* ── SEÇÕES 2 + 3: Cores e Tema — lado a lado ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 2. Cores e Slogan */}
        <div className="bg-surface/50 border border-border rounded-2xl p-5 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-accent flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center text-[10px] font-black">2</span>
            Cor e Slogan
          </h3>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted">Cor Principal</label>
            <div className="flex flex-wrap gap-2">
              {cores.map((c) => {
                const isActive = formData.primaryColor === c;
                return (
                  <motion.button
                    key={c}
                    whileHover={{ scale: 1.18 }}
                    whileTap={{ scale: 0.88 }}
                    onClick={() => update('primaryColor', c)}
                    className={`w-8 h-8 rounded-lg border-2 transition-all ${
                      isActive ? 'border-white scale-110 shadow-lg' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                );
              })}
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => update('primaryColor', e.target.value)}
                  className="w-9 h-8 rounded-lg border border-border cursor-pointer bg-transparent flex-shrink-0"
                />
                <Input
                  value={formData.primaryColor}
                  onChange={(e) => update('primaryColor', e.target.value)}
                  className="flex-1 text-xs"
                />
              </div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted pt-2 block border-t border-border/50">Cor Secundária (Opcional)</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  value={formData.secondaryColor || formData.primaryColor}
                  onChange={(e) => update('secondaryColor', e.target.value)}
                  className="w-9 h-8 rounded-lg border border-border cursor-pointer bg-transparent flex-shrink-0"
                />
                <Input
                  value={formData.secondaryColor || formData.primaryColor}
                  onChange={(e) => update('secondaryColor', e.target.value)}
                  className="flex-1 text-xs"
                />
              </div>
            </div>
          </div>
          <Input
            label="Slogan"
            placeholder="Ex.: Qualidade e confiança"
            value={formData.slogan}
            onChange={(e) => update('slogan', e.target.value)}
          />
        </div>

        {/* 3. Tema da Proposta */}
        <div className="bg-surface/50 border border-border rounded-2xl p-5">
          <h3 className="text-xs font-bold uppercase tracking-widest text-accent mb-4 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-accent text-white flex items-center justify-center text-[10px] font-black">3</span>
            Estilo da Proposta
          </h3>
          <Suspense fallback={<div className="h-20 flex items-center justify-center"><Loader className="animate-spin" /></div>}>
            <ThemeSelector
              segment={formData.segment}
              currentTheme={formData.proposalTheme || 'professional'}
              onSelect={(themeId) => update('proposalTheme', themeId)}
              showDescription={true}
            />
          </Suspense>
        </div>
      </div>

      {/* ── BANNER DE PREVIEW HORIZONTAL ── */}
      <div className="border border-border rounded-2xl overflow-hidden" style={{ borderColor: `${formData.primaryColor}30` }}>
        <div className="flex items-center gap-4 px-5 py-3"
             style={{ background: `linear-gradient(90deg, ${formData.primaryColor}18, transparent)` }}>
          {/* Logo preview compacta */}
          <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-[#0d0d14] flex items-center justify-center border border-border">
            {logoSelecionada?.renderer
              ? <div className="w-full h-full">{logoSelecionada.renderer}</div>
              : (
                <div className="w-full h-full flex items-center justify-center font-black text-white text-lg"
                     style={{ background: formData.primaryColor }}>
                  {(formData.name || 'PC').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()}
                </div>
              )
            }
          </div>
          {/* Informações */}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate" style={{ color: formData.primaryColor }}>
              {formData.name || 'Nome da Empresa'}
            </p>
            {formData.slogan && (
              <p className="text-[10px] text-muted italic truncate">"{formData.slogan}"</p>
            )}
            <div className="flex items-center gap-2 mt-1">
              <div className="w-3 h-3 rounded-full" style={{ background: formData.primaryColor }} />
              <span className="text-[10px] text-muted">{formData.primaryColor}</span>
              <span className="text-[10px] text-muted">·</span>
              <span className="text-[10px] text-accent capitalize">{formData.proposalTheme || 'professional'}</span>
              {logoSelecionada && (
                <>
                  <span className="text-[10px] text-muted">·</span>
                  <span className="text-[10px] text-accent">✓ {logoSelecionada.name}</span>
                </>
              )}
            </div>
          </div>
          {/* Barra de cor */}
          <div className="hidden sm:flex flex-col gap-1">
            <div className="w-16 h-2 rounded-full" style={{ background: formData.primaryColor }} />
            <div className="w-10 h-2 rounded-full" style={{ background: formData.secondaryColor || formData.primaryColor, opacity: 0.5 }} />
          </div>
        </div>
        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${formData.primaryColor}, ${formData.secondaryColor || formData.primaryColor})` }} />
      </div>

      {/* Navegação */}
      <div className="pt-2 flex justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft size={18} /> Voltar
        </Button>
        <Button onClick={onNext}>
          Próximo <ArrowRight size={18} />
        </Button>
      </div>
    </motion.div>
  );
};

// ===== ETAPA 4: Informações Comerciais =====
const EtapaComercial = ({ formData, update, onNext, onBack }) => {
  const valid = () => !!formData.name && !!formData.city && !!formData.state && !!formData.segment;

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'var(--primary)', opacity: 0.2, color: 'var(--primary)' }}>
          <Building2 size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold font-display text-text-primary">Dados Comerciais</h2>
          <p className="text-xs text-muted">Preencha com suas informações</p>
        </div>
      </div>
      <div className="space-y-4">
        <Input 
          label="CNPJ / CPF" 
          placeholder="00.000.000/0000-00" 
          value={formData.cnpj} 
          onChange={(e) => update('cnpj', masks.cnpj(e.target.value))} 
        />
        <div className="grid grid-cols-2 gap-4">
          <Input 
            label="Telefone" 
            placeholder="(00) 00000-0000" 
            value={formData.phone} 
            onChange={(e) => update('phone', masks.phone(e.target.value))} 
          />
          <Input label="E-mail" type="email" placeholder="contato@empresa.com" value={formData.email} onChange={(e) => update('email', e.target.value)} />
        </div>
        <Input label="Site (opcional)" placeholder="https://empresa.com.br" value={formData.website} onChange={(e) => update('website', e.target.value)} />
        <Input label="Endereço (opcional)" placeholder="Rua, número, bairro" value={formData.address} onChange={(e) => update('address', e.target.value)} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Cidade *" placeholder="Ex.: Marialva" value={formData.city} onChange={(e) => update('city', e.target.value)} />
          <Input label="Estado *" placeholder="Ex.: PR" maxLength={2} value={formData.state} onChange={(e) => update('state', e.target.value.toUpperCase())} />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-muted mb-2 block">Chave PIX (opcional)</label>
          <Input 
            label="Chave PIX" 
            placeholder="E-mail, CPF, CNPJ ou Telefone" 
            value={formData.pixKey} 
            onChange={(e) => update('pixKey', masks.pix(e.target.value))} 
          />
        </div>
      </div>
      <div className="pt-4 flex justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft size={18} /> Voltar
        </Button>
        <Button onClick={onNext} disabled={!valid()}>
          Próximo <ArrowRight size={18} />
        </Button>
      </div>
    </motion.div>
  );
};

// ===== ETAPA 5: Confirmação =====
const EtapaFinal = ({ formData, onBack, handleCreateCompany, isLoading, error }) => {
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (showSuccess) {
      const t = setTimeout(() => { window.location.href = '/'; }, 3000);
      return () => clearTimeout(t);
    }
  }, [showSuccess]);

  if (showSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6 py-10"
      >
        <motion.div
          animate={{ rotate: 360, scale: [0.5, 1] }}
          transition={{ duration: 0.6 }}
          className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto text-success text-5xl"
        >
          ✓
        </motion.div>
        <div className="space-y-3">
          <h2 className="text-2xl font-bold font-display text-text-primary">Parabéns! 🎉</h2>
          <p className="text-text-secondary">
            Sua empresa
            {' '}
            <strong className="text-accent2">{formData.name}</strong>
            {' '}
            foi criada!
          </p>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-surface border border-border rounded-xl p-4 text-left text-sm text-muted space-y-2"
        >
          <p>✅ Empresa cadastrada</p>
          <p>✅ Catálogo populado</p>
          <p>✅ Identidade visual configurada</p>
          {formData.pixKey && <p>✅ Chave PIX configurada</p>}
          <p>✅ Conta ativada</p>
        </motion.div>
        <p className="text-muted text-sm">Redirecionando para o dashboard em 3 segundos...</p>
        <Button
          onClick={() => { window.location.href = '/'; }}
          className="flex items-center gap-2 mx-auto"
        >
          Ir para o Dashboard <ArrowRight size={18} />
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-success/20 text-success rounded-2xl flex items-center justify-center">
          <Sparkles size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold font-display text-text-primary">Tudo Pronto!</h2>
          <p className="text-xs text-muted">Revise seus dados e crie sua empresa</p>
        </div>
      </div>
      {error && <div className="bg-danger/20 border border-danger/30 text-danger text-sm font-bold p-4 rounded-xl">{error}</div>}
      <div className="bg-surface border border-border rounded-xl p-5 space-y-3">
        <h3 className="font-bold text-sm text-text-primary mb-2">Resumo da Configuração</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-muted">Empresa:</span>
            {' '}
            <span className="text-text-primary font-medium">{formData.name || '-'}</span>
          </div>
          <div>
            <span className="text-muted">Segmento:</span>
            {' '}
            <span className="text-text-primary font-medium">
              {SEGMENTS.find((s) => s.value === formData.segment)?.label || '-'}
            </span>
          </div>
          <div>
            <span className="text-muted">Cidade:</span>
            {' '}
            <span className="text-text-primary font-medium">{formData.city || '-'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted">Cor:</span>
            <div className="w-4 h-4 rounded-full border border-border" style={{ backgroundColor: formData.primaryColor }} />
            <span className="font-mono text-text-secondary text-xs">{formData.primaryColor}</span>
          </div>
        </div>
      </div>
      {formData.pixKey && (
        <div className="text-sm">
          <span className="text-muted">PIX:</span>
          {' '}
          <span className="text-success font-medium">{formData.pixKey}</span>
        </div>
      )}
      <div className="space-y-2">
        {[
          '✅ Nome da empresa definido',
          '✅ Segmento selecionado',
          '✅ Cores personalizadas',
          '✅ Logo criada ou enviada',
          '✅ Dados comerciais informados',
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <CheckCircle size={16} className="text-success" />
            {' '}
            <span className="text-muted">{item}</span>
          </div>
        ))}
      </div>
      <div className="pt-6 flex justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft size={18} /> Voltar
        </Button>
        <Button
          onClick={handleCreateCompany}
          disabled={isLoading}
          className="flex items-center gap-2 bg-success hover:bg-success/90"
        >
          {isLoading
            ? (
              <>
                <Loader size={18} className="animate-spin" />
                {' '}
                Criando...
              </>
            )
            : (
              <>
                <Sparkles size={18} />
                {' '}
                Criar Empresa
              </>
            )}
        </Button>
      </div>
    </motion.div>
  );
};

// ===== COMPONENTE PRINCIPAL =====
const Onboarding = () => {
  const navigate = useNavigate();
  const { createCompany: apiCreateCompany, refreshCompany } = useAuth();
  const [step, setStep] = useState(0); // 0 = plano, 1-5 etapas
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [logoSelecionada, setLogoSelecionada] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    cnpj: '',
    phone: '',
    email: '',
    website: '',
    address: '',
    city: '',
    state: '',
    segment: 'CONSTRUCAO_CIVIL',
    primaryColor: '#10B981',
    secondaryColor: '#94A3B8',
    slogan: '',
    footerText: '',
    pixKey: '',
    defaultDownPaymentPct: 20,
    defaultDownPaymentDays: 45,
    defaultValidityDays: 60,
    defaultPaymentMethod: 'depósito bancário',
    defaultWarrantyPeriod: 5,
    defaultWarrantyType: 'ANOS',
    defaultExecutionPeriod: '',
    proposalTheme: 'professional',
    proposalAccent: '',
    proposalFont: 'sans',
    logoStyle: 'minimalista',
    logoIcon: '',
  });

  useEffect(() => {
    localStorage.setItem('@propostacerta:onboarding-data', JSON.stringify(formData));
    localStorage.setItem('@propostacerta:onboarding-step', step.toString());
  }, [formData, step]);

  useEffect(() => {
    const saved = localStorage.getItem('@propostacerta:onboarding-data');
    const savedStep = localStorage.getItem('@propostacerta:onboarding-step');
    if (saved) {
      try {
        setFormData((prev) => ({ ...prev, ...JSON.parse(saved) }));
      } catch (_e) { /* ignorar */ }
    }
    if (savedStep) {
      const s = parseInt(savedStep, 10);
      setStep(s === 0 && savedStep ? 0 : s);
    }
  }, []);

  const update = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  }, []);

  const handleCreateCompany = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let payload = { ...formData, planName: selectedPlan?.name };
      
      if (logoSelecionada) {
        if (logoSelecionada.type === 'uploaded' && logoSelecionada.file) {
           const base64Logo = await new Promise((resolve) => {
             const reader = new FileReader();
             reader.onloadend = () => resolve(reader.result);
             reader.readAsDataURL(logoSelecionada.file);
           });
           payload.logoUrl = base64Logo;
           payload.logoType = 'uploaded';
        } else if (logoSelecionada.type === 'generated') {
           payload.logoStyle = logoSelecionada.id;
           payload.logoType = 'generated';
        }
      }
      
      try {
        await apiCreateCompany(payload);
      } catch (e) {
        // Se o erro for que já possui empresa, significa que o passo anterior (que deu erro de body)
        // na verdade funcionou no banco de dados. Podemos prosseguir.
        if (!e.message.includes('já possui uma empresa cadastrada')) {
          throw e;
        }
      }

      const data = await refreshToken();
      localStorage.setItem('@propostacerta:token', data.token);
      await refreshCompany();
      localStorage.removeItem('@propostacerta:onboarding-data');
      localStorage.removeItem('@propostacerta:onboarding-step');
      
      // Mostrar tela de sucesso antes de navegar
      // (A EtapaFinal já cuida do redirecionamento se showSuccess for true)
      // Mas aqui estamos no componente pai. Vamos usar o navigate direto se necessário.
      navigate('/');
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const onboardingSteps = [
    { number: 1, label: 'Início' },
    { number: 2, label: 'Seu Negócio' },
    { number: 3, label: 'Cores' },
    { number: 4, label: 'Dados' },
    { number: 5, label: 'Concluir' },
  ];

  const renderStep = () => {
    if (step === 0) {
      return <EtapaPlano onNext={(plan) => { setSelectedPlan(plan); setStep(1); }} />;
    }
    switch (step) {
      case 1:
        return <EtapaBemVindo onNext={() => setStep(2)} />;
      case 2:
        // Chat coleta nome + detecta segmento + businessType
        return (
          <Suspense fallback={<div className="flex justify-center py-10"><Loader size={24} className="animate-spin text-accent" /></div>}>
            <OnboardingConversacional
              formData={formData}
              update={update}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          </Suspense>
        );
      case 3:
        return (
          <EtapaIdentidade
            formData={formData}
            update={update}
            onNext={() => setStep(4)}
            onBack={() => setStep(2)}
            logoSelecionada={logoSelecionada}
            setLogoSelecionada={setLogoSelecionada}
          />
        );
      case 4:
        return (
          <EtapaComercial
            formData={formData}
            update={update}
            onNext={() => setStep(5)}
            onBack={() => setStep(3)}
          />
        );
      case 5:
        return (
          <EtapaFinal
            formData={formData}
            onBack={() => setStep(4)}
            handleCreateCompany={handleCreateCompany}
            isLoading={isLoading}
            error={error}
          />
        );
      default:
        return null;
    }
  };

  const bgStyle = {
    background: `radial-gradient(ellipse 70% 50% at 50% 0%, ${formData.primaryColor}, transparent 65%)`,
  };

  const gradientStyle = {
    background: `linear-gradient(135deg, ${formData.primaryColor}, ${formData.secondaryColor})`,
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[300px] pointer-events-none" style={bgStyle} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-3xl text-white mx-auto shadow-glow"
            style={gradientStyle}
          >
            {formData.name ? formData.name[0].toUpperCase() : 'P'}
          </div>
        </div>
        <div className="mb-8 flex justify-center">
          <Stepper steps={step >= 1 ? onboardingSteps : []} currentStep={step} variant="onboarding" />
        </div>
        <div className="card overflow-hidden">
          <div className="p-8">
            <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
          </div>
        </div>
        <p className="text-center text-[10px] text-muted mt-6">
          PropostaCerta
          {' '}
          ©
          {' '}
          {new Date().getFullYear()}
          {' '}
          — Sua marca, sua autoridade.
        </p>
      </motion.div>
    </div>
  );
};

export default Onboarding;