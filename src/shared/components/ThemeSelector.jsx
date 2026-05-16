import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight } from 'lucide-react';
import { getSegmentThemes } from '../../config/ProposalThemes';

/**
 * ThemeSelector
 * Componente para seleção de tema de proposta baseado no segmento
 */
const ThemeSelector = ({
  segment = 'OUTRO',
  currentTheme = 'professional',
  onSelect,
  showDescription = true,
}) => {
  const [selectedTheme, setSelectedTheme] = useState(currentTheme);
  const themes = getSegmentThemes(segment);

  const handleSelect = (themeId) => {
    setSelectedTheme(themeId);
    if (onSelect) {
      onSelect(themeId);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.1, delayChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 10 },
    visible: { opacity: 1, scale: 1, y: 0 },
    selected: { scale: 1.02 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      <div className="space-y-2 mb-6">
        <h3 className="text-lg font-bold font-display text-text-primary">
          Escolha o Tema da Proposta
        </h3>
        <p className="text-sm text-muted">
          Selecione um estilo visual que melhor represente seu negócio
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {themes.map((theme) => (
          <motion.button
            key={theme.id}
            variants={itemVariants}
            animate={selectedTheme === theme.id ? 'selected' : 'visible'}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect(theme.id)}
            className={`relative p-4 rounded-2xl border-2 transition-all text-left
              ${selectedTheme === theme.id
                ? 'border-accent bg-accent/10 shadow-lg shadow-accent/20'
                : 'border-border bg-surface hover:border-border-strong'}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-bold text-text-primary">{theme.name}</h4>
                {showDescription && (
                  <p className="text-xs text-muted mt-1">{theme.description}</p>
                )}
              </div>
              {selectedTheme === theme.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-2 w-6 h-6 rounded-full bg-accent flex items-center justify-center text-white flex-shrink-0"
                >
                  <Check size={16} />
                </motion.div>
              )}
            </div>

            {selectedTheme === theme.id && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-1 text-xs font-semibold text-accent"
              >
                Selecionado <ChevronRight size={12} />
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default ThemeSelector;
