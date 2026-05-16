import React from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Plus } from 'lucide-react';
import ProductCard from './ProductCard';

const ProductList = ({
  items,
  total,
  page,
  limit,
  totalPages,
  search,
  activeTab,
  onSearchChange,
  onTabChange,
  onPageChange,
  onAdd,
  onEdit,
  onDelete,
  onStockChange,
  loading,
}) => {
  const tabs = [
    { key: 'all', label: 'Todos' },
    { key: 'product', label: 'Produtos' },
    { key: 'service', label: 'Serviços' },
    { key: 'low-stock', label: 'Estoque Baixo' },
  ];

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface border border-border rounded-xl">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === tab.key
                ? 'bg-accent text-white shadow-sm'
                : 'text-muted hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search + Add */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Buscar por nome ou código..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none focus:border-accent"
          />
        </div>
        <button
          onClick={onAdd}
          className="px-4 py-2 rounded-xl bg-accent text-white text-sm font-bold hover:bg-accent/90 transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Novo</span>
        </button>
      </div>

      {/* Items */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
            <Search size={24} className="text-muted" />
          </div>
          <p className="font-bold text-white mb-2">Nenhum item encontrado</p>
          <p className="text-sm text-muted">Cadastre produtos ou serviços para começar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map(item => (
            <ProductCard
              key={item.id}
              item={item}
              onEdit={onEdit}
              onDelete={onDelete}
              onStockChange={onStockChange}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <span className="text-xs text-muted">
            Mostrando {((page - 1) * limit) + 1}-{Math.min(page * limit, total)} de {total}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg bg-surface border border-border text-xs font-bold text-muted hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-lg bg-surface border border-border text-xs font-bold text-muted hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Próximo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
