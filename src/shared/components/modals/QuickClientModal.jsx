import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, X, CheckCircle } from 'lucide-react';
import Input from '../../Input';
import Button from '../../Button';
import { createClient } from '../../../shared/services/api';

const QuickClientModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    location: '',
    phone: ''
  });

  const maskPhone = (v) => {
    const d = v.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
    return d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
  };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (!formData.name && !formData.contact) {
      setError('Preencha o nome da Empresa ou o Nome do Contato.');
      setLoading(false);
      return;
    }

    try {
      const clientName = formData.name || formData.contact;
      const clientContact = formData.contact || formData.name;

      const clientData = {
        name: clientName,
        contact: clientContact,
        location: formData.location,
        phone: formData.phone
      };
      await createClient(clientData);
      setLoading(false);
      onClose();
      onSuccess && onSuccess();
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Erro ao criar cliente');
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
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      {/* Sheet */}
      <motion.div
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative w-full max-w-lg bg-surface border-t border-border rounded-t-3xl sm:rounded-2xl p-6 space-y-6 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-muted hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        {/* Title */}
        <div className="text-center space-y-2">
          <h3 className="text-xl font-bold font-display text-text-primary">
            Novo Cliente
          </h3>
          <p className="text-sm text-muted">
            Preencha os dados para cadastrar rapidamente um novo cliente.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Empresa / Cliente"
            placeholder="Razão Social ou Nome Completo"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="Nome do Contato"
            placeholder="Nome da pessoa de contato"
            value={formData.contact}
            onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
          />
          <Input
            label="Local / Cidade"
            placeholder="Local da obra ou cidade"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
          <Input
            label="Telefone / WhatsApp"
            placeholder="(00) 0 0000-0000"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: maskPhone(e.target.value) })}
            inputMode="tel"
          />
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-600">
              {error}
            </div>
          )}
          <Button
            type="submit"
            loading={loading}
            className="w-full"
          >
            Criar Cliente
          </Button>
        </form>

        {/* Success message could be handled by onSuccess callback */}
      </motion.div>
    </motion.div>
  );
};

export default QuickClientModal;