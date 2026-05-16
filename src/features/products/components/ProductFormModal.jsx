import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, X, Plus } from 'lucide-react';
import Input from '../../../shared/Input';
import Button from '../../../shared/Button';
import { createProduct, updateProduct } from '../services/productService';
import { useToast } from '../../../shared/context/ToastContext';

const CATEGORIES = ['SERVICO', 'MATERIAL', 'EQUIPAMENTO', 'MAO_DE_OBRA'];
const UNITS = ['UNID.', 'M2', 'M3', 'ML', 'KG', 'L', 'HRS', 'DIA', 'PT', 'CJ', 'MTS', 'VB', 'G'];

const ProductFormModal = ({ isOpen, onClose, onSuccess, editItem }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    unit: 'UNID.',
    category: 'SERVICO',
    defaultPrice: '',
    code: '',
    notes: '',
    isProduct: false,
    stockQuantity: 0,
    minStock: 5,
    imageUrl: '',
  });

  useEffect(() => {
    if (editItem) {
      setFormData({
        description: editItem.description || '',
        unit: editItem.unit || 'UNID.',
        category: editItem.category || 'SERVICO',
        defaultPrice: editItem.defaultPrice?.toString() || '',
        code: editItem.code || '',
        notes: editItem.notes || '',
        isProduct: editItem.isProduct || false,
        stockQuantity: editItem.stockQuantity || 0,
        minStock: editItem.minStock || 5,
        imageUrl: editItem.imageUrl || '',
      });
    } else {
      setFormData({
        description: '',
        unit: 'UNID.',
        category: 'SERVICO',
        defaultPrice: '',
        code: '',
        notes: '',
        isProduct: false,
        stockQuantity: 0,
        minStock: 5,
        imageUrl: '',
      });
    }
  }, [editItem, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.description.trim() || !formData.unit.trim()) {
      toast({ message: 'Descrição e unidade são obrigatórios', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const data = {
        ...formData,
        defaultPrice: formData.defaultPrice ? parseFloat(formData.defaultPrice) : null,
        stockQuantity: parseInt(formData.stockQuantity) || 0,
        minStock: parseInt(formData.minStock) || 5,
      };

      if (editItem) {
        await updateProduct(editItem.id, data);
        toast({ message: 'Item atualizado com sucesso!', type: 'success' });
      } else {
        await createProduct(data);
        toast({ message: 'Item criado com sucesso!', type: 'success' });
      }

      setLoading(false);
      onSuccess?.();
      onClose();
    } catch (err) {
      toast({ message: err.message || 'Erro ao salvar item', type: 'error' });
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center px-4 sm:px-0"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="relative w-full max-w-lg bg-surface border-t sm:border-2 border-border rounded-t-3xl sm:rounded-2xl p-6 space-y-6 z-10 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={onClose} className="absolute top-4 right-4 p-2 text-muted hover:text-white transition-colors">
              <X size={20} />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
                <Package size={20} className="text-accent" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-display text-white">
                  {editItem ? 'Editar Item' : 'Novo Item'}
                </h3>
                <p className="text-xs text-muted">
                  {editItem ? 'Atualize os dados do item' : 'Cadastre um produto ou serviço no catálogo'}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Tipo */}
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

              <Input
                label="Descrição *"
                placeholder="Nome do produto ou serviço"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted mb-1.5 block">Unidade *</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-accent"
                  >
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-muted mb-1.5 block">Categoria</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-accent"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <Input
                label="Preço Unitário (R$)"
                placeholder="0,00"
                type="number"
                step="0.01"
                value={formData.defaultPrice}
                onChange={(e) => setFormData({ ...formData, defaultPrice: e.target.value })}
              />

              <Input
                label="Código (opcional)"
                placeholder="Ex.: PROD-001"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />

              {/* Stock fields for products */}
              {formData.isProduct && (
                <div className="p-4 bg-accent/5 border border-accent/20 rounded-xl space-y-4">
                  <h4 className="text-xs font-bold text-accent uppercase tracking-wider">Controle de Estoque</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Quantidade em Estoque"
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
                  <Input
                    label="URL da Imagem (opcional)"
                    placeholder="https://..."
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted mb-1.5 block">Observações</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notas adicionais..."
                  className="w-full bg-bg border border-border rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-accent resize-none"
                />
              </div>

              <Button type="submit" loading={loading} className="w-full">
                <Plus size={16} className="mr-2" />
                {editItem ? 'Atualizar' : 'Criar Item'}
              </Button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProductFormModal;
