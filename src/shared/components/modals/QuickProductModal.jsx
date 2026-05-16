import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Package2, X } from 'lucide-react';
import Input from '../../Input';
import Button from '../../Button';
import { createCatalogItem } from '../../../shared/services/api';

const QuickProductModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    label: '',
    unit: '',
    category: 'SERVICO',
    price: '',
    isProduct: false,
    stockQuantity: 0,
    minStock: 5,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const itemData = {
        description: formData.label,
        unit: formData.unit,
        category: formData.category,
        defaultPrice: parseFloat(formData.price) || 0,
        isProduct: formData.isProduct,
        stockQuantity: parseInt(formData.stockQuantity) || 0,
        minStock: parseInt(formData.minStock) || 5,
      };
      await createCatalogItem(itemData);
      setLoading(false);
      onClose();
      onSuccess && onSuccess();
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Erro ao criar produto');
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center px-4 sm:px-0"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative w-full max-w-lg bg-surface border-t border-border rounded-t-3xl sm:rounded-2xl p-6 space-y-6 z-10 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-muted hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold font-display text-white">
            Novo Produto/Serviço
          </h3>
          <p className="text-sm text-muted">
            Cadastre rapidamente um novo item para o seu catálogo.
          </p>
        </div>

        {/* Tipo toggle */}
        <div className="flex gap-2 p-1 bg-bg rounded-xl">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, isProduct: false })}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              !formData.isProduct ? 'bg-gold text-white' : 'text-muted'
            }`}
          >
            Serviço
          </button>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, isProduct: true })}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
              formData.isProduct ? 'bg-accent text-white' : 'text-muted'
            }`}
          >
            Produto
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome do Item *"
            placeholder="Descrição do produto ou serviço"
            value={formData.label}
            onChange={(e) => setFormData({ ...formData, label: e.target.value })}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Unidade *"
              placeholder="Ex.: m², unidade, hora"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              required
            />
            <Input
              label="Categoria"
              placeholder="Ex.: SERVICO, MATERIAL"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value || 'SERVICO' })}
            />
          </div>
          <Input
            label="Preço Unitário (R$)"
            placeholder="0,00"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
          />

          {formData.isProduct && (
            <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl space-y-4">
              <h4 className="text-xs font-bold text-accent uppercase tracking-wider">Controle de Estoque</h4>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Quantidade"
                  type="number"
                  value={formData.stockQuantity}
                  onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                />
                <Input
                  label="Estoque Mínimo"
                  type="number"
                  value={formData.minStock}
                  onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="bg-danger/10 border border-danger/30 rounded-md p-3 text-sm text-danger">
              {error}
            </div>
          )}
          <Button
            type="submit"
            loading={loading}
            className="w-full"
          >
            Criar Item
          </Button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default QuickProductModal;
