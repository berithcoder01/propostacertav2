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

  // Calcular quais features estão habilitadas baseado no businessType
  const features = useMemo(
    () => ({
      // Funcionalidades de Serviços
      showServices: businessType === 'SERVICE_ONLY' || businessType === 'HYBRID',
      showServiceCatalog: businessType === 'SERVICE_ONLY' || businessType === 'HYBRID',
      showServiceTemplates: businessType === 'SERVICE_ONLY' || businessType === 'HYBRID',

      // Funcionalidades de Produtos
      showProducts: businessType === 'PRODUCT_ONLY' || businessType === 'HYBRID',
      showProductCatalog: businessType === 'PRODUCT_ONLY' || businessType === 'HYBRID',
      showInventory: businessType === 'PRODUCT_ONLY' || businessType === 'HYBRID',
      showStockAlerts: businessType === 'PRODUCT_ONLY' || businessType === 'HYBRID',

      // Funcionalidades Híbridas
      showHybridProposals: businessType === 'HYBRID',
      showMixedItems: businessType === 'HYBRID',

      // Funcionalidades Gerais (sempre ativas)
      showProposals: true,
      showClients: true,
      showDashboard: true,
      showSettings: true,
      showAI: true,

      // Metadata
      businessType,
      isServiceOnly: businessType === 'SERVICE_ONLY',
      isProductOnly: businessType === 'PRODUCT_ONLY',
      isHybrid: businessType === 'HYBRID',
    }),
    [businessType]
  );

  return (
    <FeatureFlagsContext.Provider value={features}>
      {children}
    </FeatureFlagsContext.Provider>
  );
};

export default FeatureFlagsContext;
