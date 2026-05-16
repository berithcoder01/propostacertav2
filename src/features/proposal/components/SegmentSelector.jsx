import React from 'react';
import { motion } from 'framer-motion';
import { Wrench, Package, HardHat, Sparkles, Heart, Monitor, Check } from 'lucide-react';
import { SEGMENTS } from '../constants';

const ICON_MAP = {
  Wrench,
  Package,
  HardHat,
  Sparkles,
  Heart,
  Monitor,
};

const SegmentSelector = ({ selected, onChange }) => {
  return (
    <div className="space-y-3">
      <label className="text-xs font-bold uppercase tracking-wider text-muted">Segmento da Proposta</label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {Object.entries(SEGMENTS).map(([key, seg]) => {
          const Icon = ICON_MAP[seg.icon];
          const isActive = selected === key;
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={`relative p-3 rounded-xl border-2 transition-all text-left ${
                isActive
                  ? 'border-accent bg-accent/10'
                  : 'border-border bg-bg hover:border-accent/30'
              }`}
            >
              {isActive && (
                <div className="absolute top-2 right-2">
                  <Check size={14} className="text-accent" />
                </div>
              )}
              <Icon size={20} className={`mb-2 ${isActive ? 'text-accent' : 'text-muted'}`} />
              <div className={`text-xs font-bold ${isActive ? 'text-white' : 'text-muted'}`}>{seg.label}</div>
              <div className="text-[9px] text-muted mt-0.5 line-clamp-2">{seg.description}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SegmentSelector;
