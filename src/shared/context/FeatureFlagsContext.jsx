import React, { createContext, useContext, useMemo } from 'react';

/**
 * FeatureFlagsContext
 * Contexto global para gerenciar visibilidade de features baseado no tipo de negócio
 */
const FeatureFlagsContext = createContext();

export const useFeatureFlags = () => {
  const context = useContext(FeatureFlagsContext);
  if (!context) {
    throw new Error('useFeatureFlags deve ser usado dentro de FeatureFlagsProvider');
  }
  return context;
};

export const FeatureFlagsProvider = ({ children, company }) => {
  const businessType = company?.businessType || 'SERVICE_ONLY';

  const features = useMemo(
    () => ({
      // Todas as funcionalidades agora estão universalmente habilitadas
      showServices: true,
      showServiceCatalog: true,
      showServiceTemplates: true,

      showProducts: true,
      showProductCatalog: true,
      showInventory: true,
      showStockAlerts: true,

      showHybridProposals: true,
      showMixedItems: true,

      // Funcionalidades Gerais
      showProposals: true,
      showClients: true,
      showDashboard: true,
      showSettings: true,
      showAI: true,

      // Mantemos as chaves antigas com valores genéricos caso algum componente antigo dependa estritamente delas
      businessType: 'HYBRID',
      isServiceOnly: false,
      isProductOnly: false,
      isHybrid: true,
    }),
    []
  );

  return (
    <FeatureFlagsContext.Provider value={features}>
      {children}
    </FeatureFlagsContext.Provider>
  );
};

export default FeatureFlagsContext;
