import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Check, ExternalLink, Image as ImageIcon } from 'lucide-react';

// ─────────────────────────────────────────────
// RENDERERS DE LOGO SIMPLES (Fallback)
// Apenas a letra inicial com a cor do usuário
// ─────────────────────────────────────────────

const SimpleLogo = ({ initial, color, secondaryColor, shape }) => {
  let rx = "0";
  if (shape === 'rounded') rx = "40";
  if (shape === 'circle') rx = "100";
  const sec = secondaryColor || color;

  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id={`grad-${shape}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={sec} />
        </linearGradient>
      </defs>
      <rect width="200" height="200" rx={rx} fill={`url(#grad-${shape})`} />
      <text x="100" y="140" textAnchor="middle" fontFamily="Arial, sans-serif"
            fontWeight="900" fontSize="120" fill="#ffffff">
        {initial}
      </text>
    </svg>
  );
};

const SHAPES = [
  { id: 'square', label: 'Quadrado', shape: 'square' },
  { id: 'rounded', label: 'Arredondado', shape: 'rounded' },
  { id: 'circle', label: 'Círculo', shape: 'circle' },
];

const BrandGenerator = ({
  companyName,
  primaryColor = '#10B981',
  secondaryColor = '#4F6EF7',
  onSelect,
}) => {
  const [selectedId, setSelectedId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // Pega apenas a primeira letra da empresa, ou 'P' como fallback
  const initial = companyName ? companyName.trim().charAt(0).toUpperCase() : 'P';

  const handleShapeSelect = (shapeId, shapeType) => {
    setSelectedId(shapeId);
    setPreviewImage(null); // Limpa imagem se houver
    
    if (onSelect) {
      onSelect({
        id: shapeId,
        name: `Iniciais - ${shapeId}`,
        type: 'generated',
        color: primaryColor,
        renderer: <SimpleLogo initial={initial} color={primaryColor} secondaryColor={secondaryColor} shape={shapeType} />,
      });
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedId('upload');
      
      // Cria preview para mostrar na UI
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);

      // Envia pro componente pai
      if (onSelect) {
        onSelect({ 
          id: 'upload', 
          name: 'Upload Customizado', 
          type: 'uploaded', 
          file,
          // Mandamos um renderer de imagem para compatibilidade retroativa com o Preview
          renderer: <img src={URL.createObjectURL(file)} alt="Logo" className="w-full h-full object-contain" />
        });
      }
    }
  };

  return (
    <div className="space-y-8">
      
      {/* ── ÁREA PRINCIPAL: UPLOAD DE LOGO ── */}
      <div className="space-y-3">
        <label className="relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-2xl hover:border-accent hover:bg-accent/5 transition-all cursor-pointer overflow-hidden bg-surface group">
          {previewImage ? (
            <div className="absolute inset-0 w-full h-full p-4 flex items-center justify-center bg-black/20">
               <img src={previewImage} alt="Logo preview" className="w-full h-full object-contain drop-shadow-md" />
               <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white font-bold flex items-center gap-2"><Upload size={16}/> Trocar Imagem</p>
               </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
              <div className="w-12 h-12 rounded-full bg-overlay flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Upload size={24} className="text-muted group-hover:text-accent transition-colors" />
              </div>
              <p className="text-sm font-bold text-text-primary mb-1">
                Clique para fazer upload da sua logo
              </p>
              <p className="text-xs text-muted">
                Recomendado: Formato 1:1 (400x400px), fundo transparente. <br/> Aceita PNG ou SVG.
              </p>
            </div>
          )}
          <input type="file" accept="image/png, image/svg+xml, image/jpeg" className="hidden" onChange={handleFileUpload} />
        </label>

        {/* Link de ajuda para o Canva */}
        <div className="flex justify-center">
          <a 
            href="https://www.canva.com/pt_br/criar/logos/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-accent hover:text-accent-hover hover:underline transition-colors"
          >
            Precisa de ajuda para criar uma logo? Acesse o Canva <ExternalLink size={12} />
          </a>
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="px-2 bg-surface/50 text-[10px] uppercase tracking-widest text-muted font-bold">Ou use uma provisória</span>
        </div>
      </div>

      {/* ── OPÇÕES FALLBACK SIMPLES ── */}
      <div className="grid grid-cols-3 gap-4">
        {SHAPES.map(s => {
          const isSelected = selectedId === s.id;
          return (
            <motion.button
              key={s.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleShapeSelect(s.id, s.shape)}
              className={`relative w-full aspect-square rounded-xl overflow-hidden transition-all duration-200
                border-2 ${isSelected ? 'border-accent shadow-lg bg-accent/10' : 'border-border hover:border-border-strong bg-overlay/50'}`}
            >
              <div className="w-full h-full flex flex-col items-center justify-center p-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mb-2">
                   <SimpleLogo initial={initial} color={primaryColor} secondaryColor={secondaryColor} shape={s.shape} />
                </div>
                <p className={`text-[10px] font-bold ${isSelected ? 'text-accent' : 'text-muted'}`}>{s.label}</p>
              </div>

              {isSelected && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                  <Check size={11} color="white" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>

    </div>
  );
};

export default BrandGenerator;