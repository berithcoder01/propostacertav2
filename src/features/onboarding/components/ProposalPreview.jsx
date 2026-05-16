import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { FileText, ImageIcon, RefreshCw } from 'lucide-react';

// Gera um hash simples da string para cor de fundo
const hashColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 40%, 25%)`;
};

const ProposalPreview = ({ formData, segment, primaryColor, secondaryColor, logoUrl, logoType, logoRenderer, proposalTheme }) => {
  const companyName = formData?.name || '';
  const slogan = formData?.slogan || '';
  const phone = formData?.phone || '';
  const city = formData?.city || '';
  const state = formData?.state || '';
  const footerText = formData?.footerText || '';

  const initials = companyName
    ? companyName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()
    : '?';

  const bgColor = useMemo(() => hashColor(companyName), [companyName]);

  // Segmento para ícone
  const segmentIcons = {
    ELETRICA: '⚡',
    CONSTRUCAO_CIVIL: '🏗️',
    HIDRAULICA: '🔧',
    PINTURA: '🎨',
    AR_CONDICIONADO: '❄️',
    OUTRO: '🔨',
  };

  const getLogo = () => {
    if (logoRenderer) return logoRenderer;
    
    if (logoUrl && (logoType === 'uploaded' || logoType === 'generated')) {
      return <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />;
    }
    return (
      <div
        className="w-full h-full flex items-center justify-center font-black text-white"
        style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
      >
        <span className="text-4xl">{initials}</span>
      </div>
    );
  };

  // Estilos baseados no tema (simplificado para o preview)
  const themeStyles = {
    professional: { borderLeft: `4px solid ${primaryColor}`, borderRadius: '0px' },
    modern: { borderRadius: '16px', background: `${primaryColor}05` },
    elegant: { fontFamily: 'serif', fontStyle: 'italic' },
    bold: { fontWeight: '900', textTransform: 'uppercase' },
    minimal: { border: 'none', background: 'transparent' }
  };

  const currentThemeStyle = themeStyles[proposalTheme] || themeStyles.professional;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="hidden lg:block sticky top-6"
    >
      <div 
        className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xl transition-all duration-500"
        style={proposalTheme === 'modern' ? { borderRadius: '24px' } : {}}
      >
        {/* Cabeçalho do preview */}
        <div 
          className="p-4 border-b border-border transition-all" 
          style={{ 
            borderBottomColor: primaryColor + '30',
            ...currentThemeStyle
          }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg flex-shrink-0 overflow-hidden"
              style={{ background: logoRenderer ? 'transparent' : `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
            >
              {getLogo()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-text-primary truncate" style={{ color: primaryColor }}>
                {companyName || 'Nome da Empresa'}
              </p>
              <div className="flex items-center gap-1 text-[10px] text-muted">
                <span>{segmentIcons[segment] || '🔧'}</span>
                <span>{segment || 'Segmento'}</span>
                {city && <span>· {city}</span>}
                {state && <span>{state}</span>}
              </div>
            </div>
          </div>

          {slogan && (
            <p className="text-[10px] text-muted italic text-center" style={{ color: primaryColor + 'cc' }}>
              "{slogan}"
            </p>
          )}
        </div>

        {/* Corpo do preview — miniatura da proposta */}
        <div className="p-4 space-y-3 bg-gradient-to-b from-transparent to-white/5">
          {/* Linha de status */}
          <div className="flex items-center justify-between text-[10px] text-muted">
            <span className="flex items-center gap-1">
              <FileText size={12} /> Proposta Comercial
            </span>
            <span className="bg-overlay px-1.5 py-0.5 rounded text-[8px] font-bold">TEMA: {proposalTheme?.toUpperCase()}</span>
          </div>

          {/* Resumo visual */}
          <div className="space-y-2">
            <div className="flex justify-between text-[10px]">
              <span className="text-muted">Cliente:</span>
              <span className="text-text-primary">Fulano da Silva</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-muted">Serviço:</span>
              <span className="text-text-primary">Reforma Residencial</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-muted">Condição:</span>
              <span className="text-accent2 font-bold">20% entrada</span>
            </div>
          </div>

          {/* Separador */}
          <div className="border-t" style={{ borderColor: primaryColor + '20' }} />

          {/* Footer preview */}
          <div className="flex items-center justify-between">
            <div className="text-[9px] text-muted">
              {city && state && `${city} - ${state}`}
              <br />
              {phone}
            </div>
            <button
              className="px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all shadow-lg hover:scale-105"
              style={{
                background: primaryColor,
                color: '#fff',
                opacity: 0.9,
              }}
            >
              VER MODELO
            </button>
          </div>
        </div>

        {/* Footer com cores */}
        <div
          className="h-1 flex"
          style={{ background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})` }}
        />
      </div>

      {/* Info adicional */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-3 text-center text-[10px] text-muted"
      >
        <RefreshCw size={12} className="inline mr-1 animate-spin-slow" />
        Sincronizado com Identidade Visual
      </motion.div>
    </motion.div>
  );
};

export default ProposalPreview;