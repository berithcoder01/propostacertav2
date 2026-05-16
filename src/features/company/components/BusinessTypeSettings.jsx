import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';
import Button from '../../../shared/Button';
import { updateCompany } from '../../../shared/services/api';
import { useAuth } from '../../../shared/context/AuthContext';

/**
 * BusinessTypeSettings
 * Componente para gerenciar o tipo de negócio (Serviços, Produtos, Híbrido)
 * e habilitar/desabilitar funcionalidades relacionadas nas configurações da empresa
 */
const BusinessTypeSettings = ({ company, onUpdate }) => {
  const { refreshCompany } = useAuth();
  const [businessType, setBusinessType] = useState(company?.businessType || 'SERVICE_ONLY');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  // Estados de habilitação de funcionalidades
  const [features, setFeatures] = useState({
    enableServices: businessType === 'SERVICE_ONLY' || businessType === 'HYBRID',
    enableProducts: businessType === 'PRODUCT_ONLY' || businessType === 'HYBRID',
  });

  // Sincroniza features com businessType
  useEffect(() => {
    setFeatures({
      enableServices: businessType === 'SERVICE_ONLY' || businessType === 'HYBRID',
      enableProducts: businessType === 'PRODUCT_ONLY' || businessType === 'HYBRID',
    });
  }, [businessType]);

  const handleBusinessTypeChange = (newType) => {
    setBusinessType(newType);
    setSaved(false);
    setError(null);
  };

  const handleFeatureToggle = (feature) => {
    setFeatures((prev) => ({
      ...prev,
      [feature]: !prev[feature],
    }));
    setSaved(false);
    setError(null);
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSaved(false);

    try {
      const updated = await updateCompany({ businessType });

      // Atualiza o AuthContext para o Layout/Sidebar refletir a mudança
      await refreshCompany();

      if (onUpdate) {
        onUpdate(updated);
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message || 'Erro ao salvar configurações');
    } finally {
      setLoading(false);
    }
  };

  const businessTypeOptions = [
    {
      value: 'SERVICE_ONLY',
      label: 'Apenas Serviços',
      description: 'Seu negócio oferece principalmente serviços (mão de obra, consultoria, etc.)',
      icon: '🔧',
    },
    {
      value: 'PRODUCT_ONLY',
      label: 'Apenas Produtos',
      description: 'Seu negócio vende principalmente produtos (materiais, equipamentos, etc.)',
      icon: '📦',
    },
    {
      value: 'HYBRID',
      label: 'Serviços + Produtos',
      description: 'Seu negócio oferece tanto serviços quanto produtos',
      icon: '🔄',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Cabeçalho */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold font-display text-text-primary">
          Tipo de Negócio
        </h2>
        <p className="text-text-secondary">
          Defina como seu negócio funciona e quais funcionalidades você deseja habilitar
        </p>
      </div>

      {/* Mensagens de Status */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-4 bg-danger/20 border border-danger/30 rounded-xl text-danger"
          >
            <AlertCircle size={20} />
            <span className="text-sm font-medium">{error}</span>
          </motion.div>
        )}

        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-4 bg-success/20 border border-success/30 rounded-xl text-success"
          >
            <CheckCircle size={20} />
            <span className="text-sm font-medium">Configurações salvas com sucesso!</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Seleção de Tipo de Negócio */}
      <div className="space-y-3">
        <label className="text-sm font-bold uppercase tracking-wider text-muted">
          Selecione o Tipo de Negócio
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {businessTypeOptions.map((option) => (
            <motion.button
              key={option.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleBusinessTypeChange(option.value)}
              className={`p-4 rounded-2xl border-2 transition-all text-left space-y-3
                ${businessType === option.value
                  ? 'border-accent bg-accent/10 shadow-lg shadow-accent/20'
                  : 'border-border bg-surface hover:border-border-strong'}`}
            >
              <div className="flex items-start justify-between">
                <span className="text-3xl">{option.icon}</span>
                {businessType === option.value && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-5 h-5 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold"
                  >
                    ✓
                  </motion.div>
                )}
              </div>
              <div>
                <h3 className="font-bold text-text-primary">{option.label}</h3>
                <p className="text-xs text-muted mt-1">{option.description}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Funcionalidades Habilitadas */}
      <div className="space-y-4 bg-surface border border-border rounded-2xl p-6">
        <h3 className="font-bold text-text-primary">Funcionalidades Habilitadas</h3>
        <p className="text-sm text-muted">
          Baseado no tipo de negócio selecionado, as seguintes funcionalidades estarão disponíveis:
        </p>

        <div className="space-y-3">
          {/* Serviços */}
          <motion.div
            layout
            className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all
              ${features.enableServices
                ? 'bg-success/10 border-success/30'
                : 'bg-overlay border-border'}`}
          >
            <div className="space-y-1">
              <h4 className="font-semibold text-text-primary">Aba de Serviços</h4>
              <p className="text-xs text-muted">
                Gerenciar tipos de serviços que você presta
              </p>
            </div>
            <div className="flex items-center gap-2">
              {features.enableServices && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-success text-sm font-bold"
                >
                  ✓ Ativo
                </motion.span>
              )}
            </div>
          </motion.div>

          {/* Produtos */}
          <motion.div
            layout
            className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all
              ${features.enableProducts
                ? 'bg-success/10 border-success/30'
                : 'bg-overlay border-border'}`}
          >
            <div className="space-y-1">
              <h4 className="font-semibold text-text-primary">Aba de Produtos</h4>
              <p className="text-xs text-muted">
                Gerenciar catálogo de produtos e estoque
              </p>
            </div>
            <div className="flex items-center gap-2">
              {features.enableProducts && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-success text-sm font-bold"
                >
                  ✓ Ativo
                </motion.span>
              )}
            </div>
          </motion.div>

          {/* Propostas Híbridas */}
          {businessType === 'HYBRID' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center justify-between p-4 rounded-xl border-2 bg-accent/10 border-accent/30"
            >
              <div className="space-y-1">
                <h4 className="font-semibold text-text-primary">Propostas Híbridas</h4>
                <p className="text-xs text-muted">
                  Combinar serviços e produtos na mesma proposta
                </p>
              </div>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-accent text-sm font-bold"
              >
                ✓ Ativo
              </motion.span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Informações Adicionais */}
      <div className="bg-overlay/50 border border-border rounded-2xl p-4 space-y-2">
        <p className="text-xs font-semibold text-muted uppercase tracking-wider">
          💡 Dica
        </p>
        <p className="text-sm text-text-secondary">
          {businessType === 'SERVICE_ONLY'
            ? 'Você pode adicionar produtos ao seu catálogo a qualquer momento. Altere para "Serviços + Produtos" quando estiver pronto.'
            : businessType === 'PRODUCT_ONLY'
            ? 'Você pode oferecer serviços relacionados aos seus produtos. Altere para "Serviços + Produtos" para habilitar essa funcionalidade.'
            : 'Você tem acesso a todas as funcionalidades. Gerencie tanto serviços quanto produtos nas abas correspondentes.'}
        </p>
      </div>

      {/* Botão de Salvar */}
      <div className="flex gap-3 justify-end pt-4">
        <Button
          variant="ghost"
          onClick={() => {
            setBusinessType(company?.businessType || 'SERVICE_ONLY');
            setError(null);
          }}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          disabled={loading || businessType === company?.businessType}
          className="flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader size={16} className="animate-spin" />
              Salvando...
            </>
          ) : (
            'Salvar Alterações'
          )}
        </Button>
      </div>
    </motion.div>
  );
};

export default BusinessTypeSettings;
