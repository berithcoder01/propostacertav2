import React from 'react';
import { motion } from 'framer-motion';
import { Package, Wrench, AlertTriangle, Edit, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

const ProductCard = ({ item, onEdit, onDelete, onStockChange }) => {
  const isLowStock = item.stockQuantity <= item.minStock;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border-2 rounded-2xl p-4 transition-all hover:border-accent/30 ${
        isLowStock ? 'border-danger/30 bg-danger/5 dark:bg-danger/10' : 'border-border dark:border-dark-border'
      } bg-surface dark:bg-dark-surface`}
    >
      <div className="flex items-start gap-4">
        {/* Icon / Image */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
          item.isProduct ? 'bg-accent/10 dark:bg-accent/20' : 'bg-gold/10 dark:bg-gold/20'
        }`}>
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.description} className="w-full h-full object-cover rounded-xl" />
          ) : item.isProduct ? (
            <Package size={20} className="text-accent" />
          ) : (
            <Wrench size={20} className="text-gold" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-text-primary dark:text-white text-sm truncate">{item.description}</h3>
            {item.isProduct && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-accent/20 text-accent uppercase">
                Produto
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-[10px] text-muted dark:text-gray-500">
            <span>{item.category}</span>
            <span>·</span>
            <span>{item.unit}</span>
            {item.code && (
              <>
                <span>·</span>
                <span>Cód: {item.code}</span>
              </>
            )}
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div className="text-sm font-bold text-accent2 dark:text-gray-400">
              R$ {item.defaultPrice?.toFixed(2) || '0,00'}
            </div>
            {item.isProduct && (
              <div className={`flex items-center gap-1 text-xs font-bold ${
                isLowStock ? 'text-danger' : 'text-success'
              }`}>
                {isLowStock && <AlertTriangle size={12} />}
                Estoque: {item.stockQuantity}
                {isLowStock && <span className="text-[10px] text-danger">(mín: {item.minStock})</span>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stock controls for products */}
      {item.isProduct && (
        <div className="mt-3 pt-3 border-t border-border dark:border-dark-border flex items-center gap-2">
          <button
            onClick={() => onStockChange?.(item.id, 1, 'remove')}
            className="p-1.5 rounded-lg bg-bg dark:bg-dark-bg border border-border dark:border-dark-border text-muted dark:text-gray-500 hover:text-danger hover:border-danger transition-colors"
            title="Remover 1 do estoque"
          >
            <ArrowDown size={14} />
          </button>
          <button
            onClick={() => onStockChange?.(item.id, 1, 'add')}
            className="p-1.5 rounded-lg bg-bg dark:bg-dark-bg border border-border dark:border-dark-border text-muted dark:text-gray-500 hover:text-success hover:border-success transition-colors"
            title="Adicionar 1 ao estoque"
          >
            <ArrowUp size={14} />
          </button>
          <div className="flex-1" />
          <button
            onClick={() => onEdit?.(item)}
            className="p-1.5 rounded-lg bg-bg dark:bg-dark-bg border border-border dark:border-dark-border text-muted dark:text-gray-500 hover:text-text-primary dark:hover:text-white hover:border-white transition-colors"
            title="Editar"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={() => onDelete?.(item.id)}
            className="p-1.5 rounded-lg bg-bg dark:bg-dark-bg border border-border dark:border-dark-border text-muted dark:text-gray-500 hover:text-danger hover:border-danger transition-colors"
            title="Excluir"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default ProductCard;
