import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Zap, Crown, Star, ArrowRight, Loader, Sparkles, Lock } from 'lucide-react';
import { useAuth } from '../../shared/context/AuthContext';
import { useTheme } from '../../hooks/useTheme';
import { fetchPlans, fetchSubscription, createCheckoutSession } from '../../shared/services/api';
import Button from '../../shared/Button';

const FEATURES = {
  FREE: [
    'Propostas ilimitadas',
    'Cadastro de clientes ilimitado',
    '50 MB de armazenamento',
    'Exportação PDF com marca d\'água',
    'Suporte por email (48h)',
  ],
  PRO: [
    'Tudo do FREE, incluso:',
    'IA: 50 requisições/dia',
    'Assistente de sugestões',
    'Pesquisa inteligente de preços',
    'White Label: logo + cores',
    '500 MB de armazenamento',
    'Exportação PDF sem marca d\'água',
    'Suporte por chat (12h)',
  ],
  STANDARD: [
    'Tudo do PRO, incluso:',
    'IA: uso ilimitado',
    'Agente Pro automático',
    'Follow-up automático por IA',
    'White Label completo',
    'Domínio customizado',
    '5 GB de armazenamento',
    'Suporte prioritário por telefone (4h)',
  ],
};

const PLAN_CONFIG = {
  FREE: { emoji: '🆓', color: '#6B7280', glow: 'rgba(107,114,128,0.3)' },
  PRO: { emoji: '⚡', color: '#10B981', glow: 'rgba(16,185,129,0.3)' },
  STANDARD: { emoji: '👑', color: '#F59E0B', glow: 'rgba(245,158,11,0.3)' },
};

const PlansPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [currentPlanName, setCurrentPlanName] = useState(null);
  const { checkPlanLimit, subscription: sub } = useAuth();
  const { theme } = useTheme();
  const hasAi = checkPlanLimit('ai');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [plansData, subData] = await Promise.all([
        fetchPlans(),
        fetchSubscription().catch(() => null),
      ]);
      setPlans(plansData.plans || plansData);
      setSubscription(subData?.subscription || null);
      if (subData?.subscription?.plan) {
        setCurrentPlanName(subData.subscription.plan.name);
      }
    } catch (e) {
      console.error('Erro ao carregar planos:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (plan) => {
    if (plan.name === currentPlanName) return;

    setProcessing(true);
    try {
      if (plan.stripePriceId) {
        const result = await createCheckoutSession(plan.stripePriceId);
        if (result.checkoutUrl) {
          window.location.href = result.checkoutUrl;
        }
      } else {
        // Modo dev: usa o endpoint de upgrade
        await fetchCheckout(plan.name);
        setCurrentPlanName(plan.name);
        await loadData();
      }
    } catch (err) {
      console.error('Erro ao processar plano:', err);
    } finally {
      setProcessing(false);
    }
  };

  const fetchCheckout = async (planName) => {
    const plansMap = { FREE: 'price_free', PRO: 'price_pro', STANDARD: 'price_standard' };
    const priceId = plansMap[planName] || 'price_free';
    try {
      await createCheckoutSession(priceId);
    } catch (e) {
      // Em dev, o mock retorna sucesso mesmo sem Stripe real
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader size={32} className="animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] opacity-30"
          style={{
            background: `radial-gradient(ellipse 70% 50% at 50% 0%, ${theme.primary || '#10B981'}, transparent 70%)`,
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface/80 border border-border mb-4"
          >
            <Sparkles size={14} className="text-accent" />
            <span className="text-xs font-bold text-accent2 uppercase tracking-wider">
              Planos e Assinaturas
            </span>
          </motion.div>
          <h1 className="text-4xl font-black font-display text-text-primary mb-4">
            Escolha seu <span className="text-gradient-brand">plano</span>
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Sem limite de propostas e clientes. O que muda é o acesso a ferramentas de IA e personalização.
          </p>
        </motion.div>

        {/* Current plan badge */}
        {currentPlanName && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mb-8"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/30 text-sm font-bold text-success">
              <Check size={14} />
              Plano atual: {currentPlanName}
            </span>
          </motion.div>
        )}

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, idx) => {
            const config = PLAN_CONFIG[plan.name] || PLAN_CONFIG.FREE;
            const isCurrent = plan.name === currentPlanName;
            const isPro = plan.name === 'PRO';
            const features = FEATURES[plan.name] || [];

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.15 }}
                className={`relative rounded-3xl border-2 overflow-hidden ${
                  isCurrent
                    ? 'border-white/40 bg-surface/60'
                    : isPro
                    ? 'border-accent/50 shadow-xl shadow-accent/10'
                    : 'border-border bg-surface'
                } ${processing ? 'pointer-events-none opacity-70' : ''}`}
                style={isPro ? { boxShadow: `0 0 40px ${config.glow}` } : {}}
              >
                {/* Poplar badge */}
                {isPro && !isCurrent && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-px left-1/2 -translate-x-1/2 z-10"
                  >
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-b-xl text-[10px] font-black uppercase tracking-wider bg-accent text-white">
                      <Zap size={12} /> Recomendado
                    </div>
                  </motion.div>
                )}

                {isCurrent && (
                  <div className="absolute top-3 right-3 z-10">
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-success/20 text-success border border-success/30">
                      <Check size={12} /> Atual
                    </div>
                  </div>
                )}

                <div className="p-6 space-y-5">
                  {/* Plan header */}
                  <div className="text-center">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3"
                      style={{
                        background: `linear-gradient(135deg, ${config.color}30, ${config.color}10)`,
                        color: config.color,
                      }}
                    >
                      {config.emoji}
                    </div>
                    <h3 className="text-xl font-black font-display text-text-primary mb-1">
                      {plan.name}
                    </h3>
                    <div className="flex items-end justify-center gap-1">
                      <span className="text-4xl font-black font-display">
                        R$ {plan.price.toFixed(2)}
                      </span>
                      <span className="text-sm text-muted mb-2">/mês</span>
                    </div>
                    {plan.name === 'FREE' && (
                      <p className="text-[10px] text-muted mt-1">Sem compromisso</p>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="border-t border-border" />

                  {/* Features list */}
                  <ul className="space-y-2.5">
                    {features.map((feature, i) => {
                      const isIncluded = !feature.startsWith('IA') || plan.name === 'PRO' || plan.name === 'STANDARD';
                      const isLocked = feature.includes('IA') && plan.name === 'FREE';

                      return (
                        <li
                          key={i}
                          className={`flex items-start gap-2 text-sm ${
                            isLocked ? 'text-muted/50' : 'text-text-secondary'
                          }`}
                        >
                          {isLocked ? (
                            <Lock size={14} className="mt-0.5 shrink-0" />
                          ) : (
                            <Check size={14} className="text-success shrink-0 mt-0.5" />
                          )}
                          <span>{feature}</span>
                        </li>
                      );
                    })}
                  </ul>

                  {/* CTA Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSelectPlan(plan)}
                    disabled={isCurrent || processing || plan.name === 'FREE'}
                    className={`w-full py-3.5 rounded-2xl text-sm font-bold transition-all mt-2 flex items-center justify-center gap-2 ${
                      isCurrent
                        ? 'bg-border text-muted cursor-default'
                        : isPro
                        ? 'bg-accent hover:bg-accent-hover text-white shadow-lg shadow-accent/20'
                        : 'bg-surface border-2 border-border text-text-secondary hover:border-border-strong hover:bg-white/5'
                    } ${processing ? 'opacity-50 cursor-wait' : ''}`}
                  >
                    {processing && plan.name === currentPlanName ? (
                      <>
                        <Loader size={16} className="animate-spin" />
                        Processando...
                      </>
                    ) : isCurrent ? (
                      <>
                        <Check size={16} /> Plano Atual
                      </>
                    ) : (
                      <>
                        {plan.name === 'FREE' ? (
                          <>
                            <Check size={16} /> Grátis
                          </>
                        ) : (
                          <>
                            <ArrowRight size={16} />
                            {plan.price === 0 ? 'Começar Grátis' : `Escolher ${plan.name}`}
                          </>
                        )}
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="max-w-3xl mx-auto mt-16"
        >
          <h3 className="text-lg font-bold font-display text-text-primary text-center mb-6">
            Perguntas Frequentes
          </h3>
          <div className="space-y-3">
            {[
              { q: 'Posso trocar de plano a qualquer momento?', a: 'Sim! Você pode fazer upgrade ou downgrade quando quiser. As mudanças são aplicadas imediatamente.' },
              { q: 'Meus dados são perdidos ao trocar de plano?', a: 'Não. Todos os seus dados — propostas, clientes, catálogo — são mantidos independentemente do plano.' },
              { q: 'O que acontece se eu cancelar meu plano pago?', a: 'Você retorna automaticamente para o plano FREE. Seus dados permanecem intactos, mas funcionalidades de IA e White Label são desativadas.' },
              { q: 'Preciso de cartão de crédito para o plano FREE?', a: 'Não. O plano FREE não exige nenhuma forma de pagamento.' },
            ].map((faq, i) => (
              <details
                key={i}
                className="bg-surface border border-border rounded-xl p-4 cursor-pointer group"
              >
                <summary className="font-bold text-sm text-text-primary list-none flex items-center justify-between py-1">
                  {faq.q}
                  <span className="text-muted group-open:rotate-180 transition-transform ml-2">▾</span>
                </summary>
                <p className="text-sm text-muted mt-2 pt-2 border-t border-border">{faq.a}</p>
              </details>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PlansPage;