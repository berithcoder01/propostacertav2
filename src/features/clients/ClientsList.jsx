import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Trash2, MapPin, Phone, Building2, Edit2, X, Check, MessageSquare, Download } from 'lucide-react';
import { fetchClients, createClient, updateClient, deleteClient } from '../../shared/services/api';
import Button from '../../shared/Button';
import Input from '../../shared/Input';
import { useToast } from '../../shared/context/ToastContext';
import ClientActivitiesWidget from '../proposal/components/ClientActivitiesWidget';

const ClientsList = () => {
  const { toast, confirm } = useToast();
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activityClientId, setActivityClientId] = useState(null);
  const [formData, setFormData] = useState({ name: '', contact: '', location: '', phone: '' });

  const maskPhone = (v) => {
    const d = v.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
    return d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
  };

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setIsLoading(true);
    try {
      const data = await fetchClients();
      setClients(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.name && !formData.contact) {
        toast({ message: 'Preencha o nome da Empresa ou o Nome do Contato.', type: 'error' });
        return;
      }
      
      const payload = {
        ...formData,
        name: formData.name || formData.contact,
        contact: formData.contact || formData.name,
      };

      if (editingId) {
        await updateClient(editingId, payload);
        setEditingId(null);
      } else {
        await createClient(payload);
        setIsFormOpen(false);
      }
      setFormData({ name: '', contact: '', location: '', phone: '' });
      loadClients();
    } catch (error) {
      toast({ message: 'Erro ao salvar cliente: ' + error.message, type: 'error' });
    }
  };

  const startEdit = (client) => {
    setEditingId(client.id);
    setFormData({
      name: client.name || '',
      contact: client.contact || '',
      location: client.location || '',
      phone: client.phone || ''
    });
    setIsFormOpen(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({ name: '', contact: '', location: '', phone: '' });
  };

  const handleDelete = async (id) => {
    const ok = await confirm({
      title: 'Excluir cliente?',
      description: 'Esta ação não pode ser desfeita.',
      confirmLabel: 'Excluir',
      variant: 'danger',
    });
    if (!ok) return;
    try {
      await deleteClient(id);
      loadClients();
      toast({ message: 'Cliente excluído', type: 'success' });
    } catch {
      toast({ message: 'Erro ao deletar cliente.', type: 'error' });
    }
  };

  const exportToExcel = () => {
    if (clients.length === 0) {
      toast({ message: 'Não há clientes para exportar.', type: 'warning' });
      return;
    }

    // Usamos delimitador ";" e BOM UTF-8 para compatibilidade perfeita com Excel em português
    const headers = ['Empresa / Cliente', 'Nome do Contato', 'Telefone / WhatsApp', 'Localidade / Cidade'];
    const rows = clients.map(c => [
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${(c.contact || '').replace(/"/g, '""')}"`,
      `"${(c.phone || '').replace(/"/g, '""')}"`,
      `"${(c.location || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map(row => row.join(';'))
    ].join('\n');

    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `clientes-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast({ message: 'Planilha de clientes exportada com sucesso!', type: 'success' });
  };

  const filteredClients = clients.filter(c =>
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.contact || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-8"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black font-display text-text-primary dark:text-white mb-2">Clientes</h1>
          <p className="text-muted dark:text-gray-500">Gerencie sua base de clientes e contatos.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={exportToExcel} className="flex items-center gap-2 px-4">
            <Download size={16} /> Planilha
          </Button>
          {!isFormOpen && !editingId && (
            <Button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2 px-6">
              <Plus size={18} />
              Novo Cliente
            </Button>
          )}
        </div>
      </div>

      {isFormOpen && (
        <div className="bg-surface dark:bg-dark-surface border-2 border-accent/50 dark:border-accent/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-accent" />
          <h2 className="text-xl font-bold font-display text-text-primary dark:text-white mb-6">Cadastrar Cliente</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Empresa / Cliente" placeholder="Razão Social ou Nome Completo" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              <Input label="Nome do Contato" placeholder="Ex.: Carlos Silva" value={formData.contact} onChange={e => setFormData({ ...formData, contact: e.target.value })} />
              <Input label="Localidade *" placeholder="Ex.: Maringá, PR" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} required />
              <Input label="Telefone / WhatsApp" placeholder="(00) 0 0000-0000" value={formData.phone} onChange={e => setFormData({ ...formData, phone: maskPhone(e.target.value) })} inputMode="tel" />
            </div>
            <div className="flex justify-end gap-4 pt-4 border-t border-border">
              <Button type="button" variant="ghost" onClick={() => { setIsFormOpen(false); setFormData({ name: '', contact: '', location: '', phone: '' }); }}>Cancelar</Button>
              <Button type="submit">Salvar Cliente</Button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-surface dark:bg-dark-surface border-2 border-border dark:border-dark-border rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-border dark:border-dark-border flex gap-4">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted dark:text-gray-500">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Buscar clientes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-bg dark:bg-dark-bg border-2 border-border dark:border-dark-border rounded-xl pl-12 pr-4 py-3 text-sm text-text-primary dark:text-white outline-none transition-all focus:border-accent focus:ring-4 focus:ring-accent/15"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-bg dark:bg-dark-bg text-[10px] uppercase tracking-widest text-muted dark:text-gray-500">
                <th className="p-4 font-bold border-b border-border dark:border-dark-border">Empresa / Cliente</th>
                <th className="p-4 font-bold border-b border-border dark:border-dark-border">Contato</th>
                <th className="p-4 font-bold border-b border-border dark:border-dark-border">Localidade</th>
                <th className="p-4 font-bold border-b border-border dark:border-dark-border text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-muted dark:text-gray-500">Carregando...</td>
                </tr>
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-muted dark:text-gray-500">Nenhum cliente encontrado.</td>
                </tr>
              ) : (
                filteredClients.map(client => (
                  <tr key={client.id} className="border-b border-border dark:border-dark-border hover:bg-white/5 dark:hover:bg-white/10 transition-colors group">
                    {editingId === client.id ? (
                      <>
                        <td className="p-4" colSpan="4">
                          <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                              <Input placeholder="Empresa / Cliente" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} className="text-sm py-1" />
                              <Input placeholder="Contato" value={formData.contact} onChange={e => setFormData(p => ({ ...p, contact: e.target.value }))} className="text-sm py-1" />
                              <Input placeholder="Localidade *" value={formData.location} onChange={e => setFormData(p => ({ ...p, location: e.target.value }))} className="text-sm py-1" required />
                              <Input placeholder="Telefone" value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: maskPhone(e.target.value) }))} className="text-sm py-1" inputMode="tel" />
                            </div>
                            <div className="flex gap-2 justify-end">
                              <Button type="button" variant="ghost" onClick={cancelEdit} className="flex items-center gap-1 text-sm px-3 py-1.5"><X size={14} /> Cancelar</Button>
                              <Button type="submit" className="flex items-center gap-1 text-sm px-3 py-1.5"><Check size={14} /> Salvar</Button>
                            </div>
                          </form>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-accent/10 dark:bg-accent/20 text-accent flex items-center justify-center">
                              <Building2 size={20} />
                            </div>
                            <div className="font-bold text-text-primary dark:text-white text-sm">{client.name}</div>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-muted dark:text-gray-500">
                          <div className="text-text-primary dark:text-white font-medium mb-1">{client.contact}</div>
                          {client.phone && <div className="flex items-center gap-1.5 text-xs"><Phone size={12}/> {client.phone}</div>}
                        </td>
                        <td className="p-4 text-sm text-muted">
                          <div className="flex items-center gap-1.5"><MapPin size={14}/> {client.location}</div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setActivityClientId(client.id)}
                              className="p-2 text-muted hover:text-accent2 hover:bg-accent/10 rounded-lg transition-colors"
                              title="Ver Atividades (CRM)"
                            >
                              <MessageSquare size={16} />
                            </button>
                            <button
                              onClick={() => startEdit(client)}
                              className="p-2 text-muted hover:text-accent2 hover:bg-accent/10 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(client.id)}
                              className="p-2 text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                              title="Excluir"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {activityClientId && (
        <ClientActivitiesWidget
          client={clients.find(c => c.id === activityClientId)}
          onClose={() => setActivityClientId(null)}
        />
      )}
    </motion.div>
  );
};

export default ClientsList;