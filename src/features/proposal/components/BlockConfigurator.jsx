import React from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { PROPOSAL_BLOCKS, SEGMENTS } from '../constants';

const BlockConfigurator = ({ segment, activeBlocks, onToggle }) => {
  const segmentConfig = SEGMENTS[segment];
  if (!segmentConfig) return null;

  return (
    <div className="space-y-3">
      <label className="text-xs font-bold uppercase tracking-wider text-muted">Blocos da Proposta</label>
      <div className="space-y-1.5">
        {Object.entries(PROPOSAL_BLOCKS).map(([key, block]) => {
          const isActive = activeBlocks.includes(key);
          const isDefault = segmentConfig.defaultBlocks.includes(key);
          return (
            <button
              key={key}
              onClick={() => !block.alwaysActive && onToggle(key)}
              disabled={block.alwaysActive}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                block.alwaysActive
                  ? 'bg-accent/10 border border-accent/20 cursor-default'
                  : isActive
                    ? 'bg-surface border border-border hover:border-accent/30'
                    : 'bg-bg/50 border border-border opacity-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-4 h-4 rounded flex items-center justify-center ${
                  isActive ? 'bg-accent' : 'bg-border'
                }`}>
                  {isActive && <Check size={10} className="text-white" />}
                </div>
                <span className={`text-xs font-bold ${isActive ? 'text-white' : 'text-muted'}`}>
                  {block.label}
                </span>
                {isDefault && !block.alwaysActive && (
                  <span className="text-[9px] text-accent bg-accent/10 px-1.5 py-0.5 rounded-full">Padrão</span>
                )}
              </div>
              {!block.alwaysActive && (
                <span className="text-[9px] text-muted">{isActive ? 'Ativo' : 'Oculto'}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BlockConfigurator;
