import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Bot, Loader, Check, X, ArrowRight } from 'lucide-react';
import Input from '../../shared/Input';
import Button from '../../shared/Button';
import { createClient } from '../../shared/services/api';
import { useToast } from '../../shared/context/ToastContext';

const ClientQuickAddAi = ({ onClose, onCreated }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    phone: '',
    email: '',
    location: '',
    role: '',
  });
  const [error, setError] = useState(null);

  const update = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError('Nome é obrigatório');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createClient({
        name: formData.name,
        contact: formData.contact || formData.name,
        phone: formData.phone,
        email: formData.email,
        location: formData.location,
        role: formData.role,
        address: formData.location,
      });

      toast?.({ message: 'Cliente criado com sucesso!', type: 'success' }) ||
        alert('Cliente criado com sucesso!');

      setStep(2);
      if (onCreated) onCreated();
    } catch (err) {
      setError(err.message || 'Erro ao criar cliente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center px-4"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
          className="relative bg-surface border border-border rounded-3xl p-6 w-full max-w-sm space-y-4 z-10"
        >
          {/* Header */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center">
                <UserPlus size={20} className="text-accent" />
              </div>
              <div>
                <h3 className="text-text-primary font-bold text-lg">Novo Cliente</h3>
                <p className="text-[10px] text-muted">Cadastro rápido com IA</p>
              </div>
            </div>
            <button onClick={onClose} className="text-muted hover:text-white">
              <X size={18} />
            </button>
          </div>

          {step === 1 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {error && (
                <div className="bg-danger/20 border border-danger/30 text-danger text-sm font-bold p-3 rounded-xl">
                  {error}
                </div>
              )}

              <Input
                label="Nome *"
                placeholder="Nome da empresa ou pessoa"
                value={formData.name}
                onChange={e => update('name', e.target.value)}
                autoFocus
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Telefone"
                  placeholder="(00) 99999-9999"
                  value={formData.phone}
                  onChange={e => update('phone', e.target.value)}
                />
                <Input
                  label="Cargo"
                  placeholder="Responsável"
                  value={formData.role}
                  onChange={e => update('role', e.target.value)}
                />
              </div>

              <Input
                label="E-mail"
                type="email"
                placeholder="contato@empresa.com"
                value={formData.email}
                onChange={e => update('email', e.target.value)}
              />

              <Input
                label="Cidade/Localização"
                placeholder="Ex.: Marialva - PR"
                value={formData.location}
                onChange={e => update('location', e.target.value)}
              />

              <Button
                onClick={handleSubmit}
                disabled={loading || !formData.name.trim()}
                className="w-full flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader size={18} className="animate-spin" /> Salvando...
                  </>
                ) : (
                  <>
                    <Check size={18} /> Cadastrar Cliente
                  </>
                )}
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6 space-y-4"
            >
              <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto text-success text-3xl">
                ✓
              </div>
              <h4 className="text-xl font-bold font-display text-text-primary">Cliente Criado!</h4>
              <p className="text-muted text-sm">
                <strong>{formData.name}</strong> foi adicionado ao sistema.
              </p>
              <div className="bg-surface border border-border rounded-xl p-3 text-left text-sm space-y-1">
                {formData.phone && <p><span className="text-muted">Tel:</span> {formData.phone}</p>}
                {formData.email && <p><span className="text-muted">Email:</span> {formData.email}</p>}
                {formData.location && <p><span className="text-muted">Local:</span> {formData.location}</p>}
              </div>
              <Button onClick={onClose} className="w-full flex items-center gap-2">
                Fechar <ArrowRight size={16} />
              </Button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ClientQuickAddAi;