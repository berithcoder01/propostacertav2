import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';
import ProductList from './components/ProductList';
import ProductFormModal from './components/ProductFormModal';
import StockAlert from './components/StockAlert';
import { fetchProducts, fetchLowStockProducts, fetchProductStats, updateStock, deleteProduct } from './services/productService';
import { useToast } from '../../shared/context/ToastContext';

const ProductsPage = () => {
  const { toast } = useToast();

  // Data
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState(null);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Modal
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const filters = { page, limit };

      if (activeTab === 'product') filters.isProduct = true;
      else if (activeTab === 'service') filters.isProduct = false;
      else if (activeTab === 'low-stock') filters.lowStock = true;

      if (search) filters.search = search;

      const data = await fetchProducts(filters);
      setItems(data.items || []);
      setTotal(data.total || 0);
    } catch (err) {
      toast({ message: 'Erro ao carregar produtos: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [activeTab, search, page, limit, toast]);

  const loadStats = useCallback(async () => {
    try {
      const data = await fetchProductStats();
      setStats(data);
    } catch (err) {
      console.warn('Erro ao carregar stats:', err.message);
    }
  }, []);

  const loadLowStock = useCallback(async () => {
    try {
      const data = await fetchLowStockProducts();
      setLowStockItems(data.items || []);
    } catch (err) {
      console.warn('Erro ao carregar estoque baixo:', err.message);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { loadLowStock(); }, [loadLowStock]);

  const handleStockChange = async (id, quantity, operation) => {
    try {
      await updateStock(id, quantity, operation);
      toast({ message: 'Estoque atualizado', type: 'success' });
      loadData();
      loadLowStock();
    } catch (err) {
      toast({ message: 'Erro ao atualizar estoque: ' + err.message, type: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Excluir este item permanentemente?')) return;
    try {
      await deleteProduct(id);
      toast({ message: 'Item excluído', type: 'success' });
      loadData();
    } catch (err) {
      toast({ message: 'Erro ao excluir: ' + err.message, type: 'error' });
    }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    loadData();
    loadLowStock();
    setEditItem(null);
  };

  const totalPages = Math.ceil(total / limit);

  const statCards = stats ? [
    { title: 'Total Produtos', value: stats.totalProducts, icon: Package, color: 'text-accent', bg: 'bg-accent/10' },
    { title: 'Total Serviços', value: stats.totalServices, icon: TrendingUp, color: 'text-gold', bg: 'bg-gold/10' },
    { title: 'Estoque Baixo', value: stats.lowStockCount, icon: AlertTriangle, color: 'text-danger', bg: 'bg-danger/10' },
    { title: 'Valor em Estoque', value: `R$ ${stats.totalStockValue.toFixed(0)}`, icon: DollarSign, color: 'text-success', bg: 'bg-success/10' },
  ] : [];

  return (
    <motion.div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black font-display text-text-primary dark:text-white">Produtos & Catálogo</h1>
          <p className="text-muted dark:text-gray-500 text-sm mt-1">Gerencie produtos, serviços e controle de estoque</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <div key={idx} className={`${stat.bg} dark:bg-opacity-20 border border-border dark:border-dark-border rounded-2xl p-4 space-y-1`}>
            <stat.icon size={20} className={stat.color} />
            <div className="text-2xl font-black font-display text-text-primary dark:text-white">{stat.value}</div>
            <div className="text-[10px] text-muted dark:text-gray-500 uppercase tracking-wider">{stat.title}</div>
          </div>
        ))}
      </div>

      {/* Stock Alert */}
      <StockAlert
        items={lowStockItems}
        onNavigate={() => setActiveTab('low-stock')}
      />

      {/* Product List */}
      <ProductList
        items={items}
        total={total}
        page={page}
        limit={limit}
        totalPages={totalPages}
        search={search}
        activeTab={activeTab}
        onSearchChange={(val) => { setSearch(val); setPage(1); }}
        onTabChange={(val) => { setActiveTab(val); setPage(1); }}
        onPageChange={setPage}
        onAdd={() => { setEditItem(null); setShowForm(true); }}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStockChange={handleStockChange}
        loading={loading}
      />

      {/* Form Modal */}
      <ProductFormModal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditItem(null); }}
        onSuccess={handleFormSuccess}
        editItem={editItem}
      />
    </motion.div>
  );
};

export default ProductsPage;
