import { useEffect, useState } from 'react';

export const useTheme = () => {
  const [theme, setThemeState] = useState({
    primary: getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#10B981',
    primaryHover: getComputedStyle(document.documentElement).getPropertyValue('--primary-hover').trim() || '#059669',
    secondary: getComputedStyle(document.documentElement).getPropertyValue('--secondary').trim() || '#1A5276',
    brandName: localStorage.getItem('@narogestor:companyName') || '',
    logoUrl: localStorage.getItem('@narogestor:logoUrl') || '',
    logoType: localStorage.getItem('@narogestor:logoType') || '',
    slogan: localStorage.getItem('@narogestor:slogan') || '',
  });

  useEffect(() => {
    const updateTheme = () => {
      const root = getComputedStyle(document.documentElement);
      setThemeState({
        primary: root.getPropertyValue('--primary').trim() || '#10B981',
        primaryHover: root.getPropertyValue('--primary-hover').trim() || '#059669',
        secondary: root.getPropertyValue('--secondary').trim() || '#1A5276',
        brandName: localStorage.getItem('@narogestor:companyName') || '',
        logoUrl: localStorage.getItem('@narogestor:logoUrl') || '',
        logoType: localStorage.getItem('@narogestor:logoType') || '',
        slogan: localStorage.getItem('@narogestor:slogan') || '',
      });
    };

    // Observer para detectar mudanças dinâmicas
    const observer = new MutationObserver(() => updateTheme());
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style', 'class'] });

    // Listener para storage events (abas paralelas)
    window.addEventListener('storage', updateTheme);

    updateTheme();

    return () => {
      observer.disconnect();
      window.removeEventListener('storage', updateTheme);
    };
  }, []);

  const setTheme = (companyData) => {
    const root = document.documentElement;
    root.style.setProperty('--primary', companyData.primaryColor || '#10B981');
    root.style.setProperty('--primary-hover', companyData.primaryColor ? adjustBrightness(companyData.primaryColor, -20) : '#059669');
    root.style.setProperty('--secondary', companyData.secondaryColor || '#1A5276');

    localStorage.setItem('@narogestor:primaryColor', companyData.primaryColor || '#10B981');
    localStorage.setItem('@narogestor:secondaryColor', companyData.secondaryColor || '#1A5276');
    if (companyData.logoUrl) localStorage.setItem('@narogestor:logoUrl', companyData.logoUrl);
    if (companyData.logoType) localStorage.setItem('@narogestor:logoType', companyData.logoType);
    if (companyData.name) localStorage.setItem('@narogestor:companyName', companyData.name);
    if (companyData.slogan) localStorage.setItem('@narogestor:slogan', companyData.slogan);

    setThemeState({
      primary: companyData.primaryColor || '#10B981',
      primaryHover: companyData.primaryColor ? adjustBrightness(companyData.primaryColor, -20) : '#059669',
      secondary: companyData.secondaryColor || '#1A5276',
      brandName: companyData.name || '',
      logoUrl: companyData.logoUrl || '',
      logoType: companyData.logoType || '',
      slogan: companyData.slogan || '',
    });
  };

  return { theme, setTheme };
};

function adjustBrightness(hex, amount) {
  if (!hex) return '#059669';
  hex = hex.replace('#', '');
  const num = parseInt(hex, 16);
  let r = Math.min(255, Math.max(0, (num >> 16) + amount));
  let g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
  let b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}