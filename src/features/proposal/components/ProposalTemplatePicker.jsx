import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, Check, Settings2 } from 'lucide-react';

const ProposalTemplatePicker = ({ templates, onSelect, onCreateNew }) => {
  const [selectedId, setSelectedId] = useState(templates.find(t => t.isDefault)?.id || (templates.length > 0 ? templates[0].id : null));

  const allOptions = [
    { id: '__basic__', name: 'Proposta Básica', level: 'BASIC', isDefault: false },
    ...templates,
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-surface border-2 border-border rounded-3xl max-w-md w-full">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/20 rounded-xl">
              <FileText size={20} className="text-accent" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Escolha um modelo</h2>
              <p className="text-sm text-muted">Selecione como quer estruturar sua proposta.</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-3">
          {allOptions.map(opt => (
            <button key={opt.id} onClick={() => setSelectedId(opt.id)} className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${selectedId === opt.id ? 'border-accent bg-accent/10' : 'border-border hover:border-accent/30'}`}>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedId === opt.id ? 'border-accent bg-accent' : 'border-border'}`}>
                {selectedId === opt.id && <Check size={12} className="text-white" />}
              </div>
              <div className="flex-1">
                <div className="font-bold text-white text-sm">{opt.name}</div>
                <div className="text-[10px] text-muted">{opt.level === 'BASIC' ? 'Estrutura fixa e simples' : 'Modelo personalizado'}</div>
              </div>
              {opt.isDefault && <span className="text-[9px] bg-accent/20 text-accent px-2 py-0.5 rounded-full font-bold">PADRÃO</span>}
            </button>
          ))}

          <button onClick={onCreateNew} className="w-full flex items-center gap-3 p-4 rounded-2xl border-2 border-dashed border-border/50 text-muted hover:text-accent hover:border-accent/30 transition-all text-left">
            <Plus size={16} />
            <span className="text-sm">Criar novo modelo</span>
          </button>
        </div>

        <div className="p-6 pt-0 flex gap-3">
          <button onClick={() => onSelect(selectedId)} className="flex-1 bg-accent hover:bg-accent/80 text-white font-bold py-3 rounded-xl transition-all text-sm">
            Continuar
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ProposalTemplatePicker;
