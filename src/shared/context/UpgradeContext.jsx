import React, { createContext, useContext, useState } from 'react';
import UpgradeModal from '../../shared/components/UpgradeModal';

const UpgradeContext = createContext(null);

export const UpgradeProvider = ({ children }) => {
  const [showUpgrade, setShowUpgrade] = useState(false);

  return (
    <UpgradeContext.Provider value={{ openUpgrade: () => setShowUpgrade(true) }}>
      {children}
      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </UpgradeContext.Provider>
  );
};

export const useUpgrade = () => {
  const ctx = useContext(UpgradeContext);
  if (!ctx) throw new Error('useUpgrade must be used inside UpgradeProvider');
  return ctx;
};