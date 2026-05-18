import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, ArrowRight, Loader, Sparkles, Building2, Shield, Users, Heart } from 'lucide-react';
import { useAuth } from '../../shared/context/AuthContext';
import { useThemeMode } from '../../shared/context/ThemeContext';
import { fetchPlans, fetchSubscription, createCheckoutSession } from '../../shared/services/api';

const FEATURES = [
  'Propostas ilimitadas',
  'Clientes ilimitados',
  'Catálogo de serviços e produtos',
  'Compartilhamento via WhatsApp',
  'Assistente IA',
  'Relatórios básicos',
  'Aplicativo mobile',
  'Logo personalizada',
  'Dashboard premium',
];

const PLANS_PAGE = () => {
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [currentPlanName, setCurrentPlanName] = useState(null);
  const { subscription: sub } = useAuth();
  const { setLight } = useThemeMode();

  useEffect(() => { setLight(); }, [setLight]);
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const subData = await fetchSubscription().catch(() => null);
      if (subData?.subscription?.plan) {
        setCurrentPlanName(subData.subscription.plan.name);
      }
    } catch (e) {
      console.error('Erro ao carregar assinatura:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTrial = async () => {
    setProcessing(true);
    try {
      const plans = await fetchPlans();
      const plan = (plans.plans || plans).find(p => p.name === 'PRO') || (plans.plans || plans)[0];
      if (plan?.stripePriceId) {
        const result = await createCheckoutSession(plan.stripePriceId);
        if (result.checkoutUrl) {
          window.location.href = result.checkoutUrl;
        }
      }
    } catch (err) {
      console.error('Erro ao iniciar teste:', err);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size={32} className="animate-spin text-emerald-500" />
      </div>
    );
  }

  const isCurrent = currentPlanName === 'PRO' || currentPlanName === 'STANDARD' || currentPlanName === 'ENTERPRISE';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">

      {/* Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-ambient-glow opacity-40 pointer-events-none" />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-emerald-400/20"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-lg">

        {/* Logo + Brand */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2.5 mb-8">
              <div className="w-10 h-10 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-glow">
                <Building2 size={20} className="text-white" />
              </div>
              <span className="font-display font-bold text-lg text-text-primary tracking-tight">
                PropostaCerta
              </span>
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 mb-6">
              <Sparkles size={14} className="text-emerald-500" />
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                7 dias grátis
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-black font-display text-text-primary mb-4 leading-tight">
              O jeito mais simples de criar{' '}
              <span className="text-gradient-brand">propostas profissionais</span>
            </h1>

            {/* Subtitle */}
            <p className="text-text-secondary text-base md:text-lg max-w-md mx-auto leading-relaxed">
              Ideal para MEIs, prestadores de serviço e pequenos negócios que querem vender mais pelo WhatsApp.
            </p>
          </motion.div>
        </div>

        {/* Main Plan Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="relative"
        >
          {/* Glow behind card */}
          <div
            className="absolute -inset-1 rounded-3xl opacity-30 blur-xl"
            style={{
              background: 'linear-gradient(135deg, #10B981, #059669)',
            }}
          />

          <div className="relative bg-white/80 backdrop-blur-xl border-2 border-emerald-200 rounded-3xl overflow-hidden shadow-xl shadow-emerald-100/50">
            {/* "Mais Escolhido" badge */}
            <div className="absolute -top-px left-1/2 -translate-x-1/2 z-10">
              <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-b-xl text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white shadow-lg shadow-emerald-200">
                <Zap size={12} /> Mais Escolhido
              </div>
            </div>

            <div className="p-8 pt-10 space-y-6">
              {/* Plan name */}
              <div className="text-center">
                <h3 className="text-sm font-black font-display text-emerald-600 uppercase tracking-widest mb-3">
                  Plano Profissional
                </h3>

                {/* Price */}
                <div className="flex items-end justify-center gap-1 mb-1">
                  <span className="text-sm text-muted mb-2">R$</span>
                  <span className="text-5xl font-black font-display text-text-primary">
                    24
                  </span>
                  <span className="text-2xl font-black font-display text-text-primary">
                    ,90
                  </span>
                  <span className="text-sm text-muted mb-1.5">/mês</span>
                </div>
                <p className="text-xs text-emerald-600 font-semibold">
                  7 dias grátis • Sem cartão
                </p>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100" />

              {/* Features */}
              <ul className="space-y-3">
                {FEATURES.map((feature, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className="flex items-center gap-3 text-sm text-gray-600"
                  >
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <Check size={12} className="text-emerald-600" />
                    </div>
                    <span>{feature}</span>
                  </motion.li>
                ))}
              </ul>

              {/* CTA Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleStartTrial}
                disabled={isCurrent || processing}
                className={`w-full py-4 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  isCurrent
                    ? 'bg-gray-100 text-gray-400 cursor-default'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-200/50'
                } ${processing ? 'opacity-50 cursor-wait' : ''}`}
              >
                {processing ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Processando...
                  </>
                ) : isCurrent ? (
                  <>
                    <Check size={16} /> Plano Ativo
                  </>
                ) : (
                  <>
                    Começar Teste Grátis
                    <ArrowRight size={16} />
                  </>
                )}
              </motion.button>

              {/* Sub-CTA text */}
              <p className="text-center text-xs text-muted">
                Sem cartão • Cancele quando quiser
              </p>
            </div>
          </div>
        </motion.div>

        {/* Trust Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-10 space-y-4"
        >
          <div className="flex items-center justify-center gap-6 text-xs text-muted">
            <div className="flex items-center gap-1.5">
              <Users size={14} className="text-emerald-400" />
              <span>+2.500 profissionais</span>
            </div>
            <div className="w-px h-4 bg-gray-200" />
            <div className="flex items-center gap-1.5">
              <Shield size={14} className="text-emerald-400" />
              <span>Feito para pequenos negócios</span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted">
            <Heart size={14} className="text-emerald-400" />
            <span>Suporte humanizado</span>
          </div>
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-muted">
            PropostaCerta © {new Date().getFullYear()} — Sua marca, sua autoridade.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PLANS_PAGE;
