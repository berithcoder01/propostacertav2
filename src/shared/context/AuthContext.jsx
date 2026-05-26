import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCurrentUser, login, register, fetchCompany, fetchCatalog, createCompany, fetchProspectingProfile } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [prospectingProfileConfigured, setProspectingProfileConfigured] = useState(null);

  const hasCompany = !!company;

  // Carrega tema da empresa no documento
  const applyTheme = useCallback((companyData) => {
    if (!companyData) return;
    const root = document.documentElement;
    root.style.setProperty('--primary', companyData.primaryColor || '#10B981');
    root.style.setProperty('--primary-hover', adjustBrightness(companyData.primaryColor, -20) || '#059669');
    root.style.setProperty('--secondary', companyData.secondaryColor || '#1A5276');
    root.style.setProperty('--accent2', '#94A3B8');
    root.style.setProperty('--brand-name', companyData.name || '');
    root.style.setProperty('--brand-logo', `url(${companyData.logoUrl || ''})`);

    // Persistir no localStorage para uso offline
    localStorage.setItem('@propostacerta:primaryColor', companyData.primaryColor || '#10B981');
    localStorage.setItem('@propostacerta:secondaryColor', companyData.secondaryColor || '#1A5276');
    localStorage.setItem('@propostacerta:companyName', companyData.name || '');
    localStorage.setItem('@propostacerta:logoUrl', companyData.logoUrl || '');
    localStorage.setItem('@propostacerta:logoType', companyData.logoType || '');
    localStorage.setItem('@propostacerta:slogan', companyData.slogan || '');
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('@propostacerta:token');
    if (token) {
      getCurrentUser()
        .then(userData => {
          setUser(userData);
          if (userData.companyId) {
            return Promise.all([
              fetchCompany().catch(() => null),
              fetchCatalog().catch(() => []),
              fetchProspectingProfile().catch(() => ({ configured: false }))
            ]);
          }
          return [null, [], { configured: false }];
        })
        .then(([co, catalog, profile]) => {
          if (co) {
            setCompany(co);
            applyTheme(co);
            if (co.subscription) setSubscription(co.subscription);
          }
          setProspectingProfileConfigured(profile?.configured ?? false);
        })
        .catch(() => {
          localStorage.removeItem('@propostacerta:token');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      const savedPrimary = localStorage.getItem('@propostacerta:primaryColor');
      if (savedPrimary) {
        document.documentElement.style.setProperty('--primary', savedPrimary);
      }
      setIsLoading(false);
    }
  }, []);

  const signIn = async (email, password) => {
    const data = await login(email, password);
    localStorage.setItem('@propostacerta:token', data.token);
    setUser(data.user);
    if (data.user.companyId) {
      const [co, catalog, profile] = await Promise.all([
        fetchCompany().catch(() => null),
        fetchCatalog().catch(() => []),
        fetchProspectingProfile().catch(() => ({ configured: false }))
      ]);
      setCompany(co);
      if (co) {
        applyTheme(co);
        if (co.subscription) setSubscription(co.subscription);
      }
      setProspectingProfileConfigured(profile?.configured ?? false);
    }
  };

  const signUp = async (name, email, password) => {
    // Limpa QUALQUER sessão anterior antes de criar a nova conta
    localStorage.removeItem('@propostacerta:token');
    setUser(null);
    setCompany(null);
    setSubscription(null);

    const data = await register(name, email, password);

    // Persiste imediatamente o token do novo usuário
    if (data.token) {
      localStorage.setItem('@propostacerta:token', data.token);
      setUser(data.user);
    }

    return data;
  };

  const createCompanyAccount = async (companyData) => {
    const data = await createCompany(companyData);
    setCompany(data);
    applyTheme(data);
    if (data.subscription) setSubscription(data.subscription);
    return data;
  };

  const signOut = () => {
    localStorage.removeItem('@propostacerta:token');
    localStorage.removeItem('@propostacerta:primaryColor');
    localStorage.removeItem('@propostacerta:secondaryColor');
    localStorage.removeItem('@propostacerta:companyName');
    localStorage.removeItem('@propostacerta:logoUrl');
    localStorage.removeItem('@propostacerta:slogan');
    setUser(null);
    setCompany(null);
    setSubscription(null);
    setProspectingProfileConfigured(null);
  };

  const refreshCompany = async () => {
    const [co, catalog, profile] = await Promise.all([
      fetchCompany().catch(() => null),
      fetchCatalog().catch(() => []),
      fetchProspectingProfile().catch(() => ({ configured: false }))
    ]);
    if (co) {
      setCompany(co);
      applyTheme(co);
      if (co.subscription) setSubscription(co.subscription);
    }
    setProspectingProfileConfigured(profile?.configured ?? false);
    return co;
  };

  const updateCompanyTheme = async (themeData) => {
    const updated = await fetchCompany();
    setCompany(updated);
    applyTheme(updated);
  };

  const checkPlanLimit = (feature) => {
    if (!subscription || !subscription.plan) return true;
    const plan = subscription.plan;
    if (feature === 'ai' && !plan.hasAi) return false;
    if (feature === 'whiteLabel' && !plan.hasWhiteLabel) return false;
    return true;
  };

  const getPlanLimits = () => {
    if (!subscription || !subscription.plan) return null;
    const { plan } = subscription;
    return {
      maxProposals: plan.maxProposals,
      maxClients: plan.maxClients,
      hasAi: plan.hasAi,
      hasWhiteLabel: plan.hasWhiteLabel,
      currentProposals: subscription.stats?.proposalCount || 0,
      currentClients: subscription.stats?.clientCount || 0,
      status: subscription.status
    };
  };

  return (
    <AuthContext.Provider value={{
      user, company, hasCompany, isLoading, subscription, prospectingProfileConfigured,
      signIn, signUp, signOut, refreshCompany, updateCompanyTheme,
      applyTheme, checkPlanLimit, getPlanLimits, createCompany: createCompanyAccount,
      setProspectingProfileConfigured
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Utility: ajustar brilho de uma cor hex
function adjustBrightness(hex, amount) {
  if (!hex) return null;
  hex = hex.replace('#', '');
  const num = parseInt(hex, 16);
  let r = Math.min(255, Math.max(0, (num >> 16) + amount));
  let g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
  let b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export const useAuth = () => useContext(AuthContext);