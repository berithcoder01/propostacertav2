import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Package } from 'lucide-react';

const StockAlert = ({ items, onNavigate }) => {
  if (!items || items.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-danger/10 border-2 border-danger/30 rounded-2xl p-4"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 bg-danger/20 rounded-lg flex items-center justify-center">
          <AlertTriangle size={16} className="text-danger" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-danger">Estoque Baixo</h3>
          <p className="text-[10px] text-muted">{items.length} {items.length === 1 ? 'item com' : 'itens com'} estoque abaixo do mínimo</p>
        </div>
      </div>

      <div className="space-y-2">
        {items.slice(0, 5).map(item => (
          <div key={item.id} className="flex items-center justify-between bg-bg/50 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2">
              <Package size={14} className="text-muted" />
              <span className="text-xs font-bold text-white truncate max-w-[200px]">{item.description}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-danger">{item.stockQuantity}</span>
              <span className="text-[10px] text-muted">/ mín {item.minStock}</span>
            </div>
          </div>
        ))}
        {items.length > 5 && (
          <button
            onClick={onNavigate}
            className="w-full text-xs font-bold text-accent hover:text-accent/80 transition-colors py-1"
          >
            Ver todos ({items.length})
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default StockAlert;
