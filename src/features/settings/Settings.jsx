import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save } from 'lucide-react';
import Input from '../../shared/Input';
import Button from '../../shared/Button';
import { fetchSettings, updateSettings } from '../../shared/services/api';

const Settings = () => {
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const masks = {
    cnpj: (v) => {
      const d = v.replace(/\D/g, '').slice(0, 14);
      if (d.length <= 11) {
        return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4').replace(/-$/, '');
      }
      return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5').replace(/-$/, '');
    },
    phone: (v) => {
      const d = v.replace(/\D/g, '').slice(0, 11);
      if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
      return d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '');
    }
  };



  const [localMargin, setLocalMargin] = useState('15');

  const loadSettings = async () => {
    try {
      const data = await fetchSettings();

      setSettings(data);
      if (data.materialSafetyMargin) {
        setLocalMargin(Math.round((data.materialSafetyMargin - 1) * 100).toString());
      }
    } catch (error) {
      console.error('Erro ao carregar config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings(settings);
      alert('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Falha ao salvar configurações.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleMarginChange = (val) => {
    setLocalMargin(val);
    const numeric = parseFloat(val);
    if (!isNaN(numeric)) {
      handleChange('materialSafetyMargin', (numeric / 100) + 1);
    }
  };



  if (isLoading) return <div className="p-8 text-muted">Carregando configurações...</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold font-display text-text-primary mb-2">Configurações</h1>
          <p className="text-muted">Personalize os dados da sua empresa e padrões comerciais.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-6">
          <Save size={18} />
          {isSaving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Bloco: Dados da Empresa */}
        <div className="card p-6 space-y-6">
          <h2 className="text-xl font-bold font-display text-accent2 border-b border-border pb-2">Identidade Visual e Empresa</h2>
          <div className="space-y-4">
            <Input 
              label="Nome da Empresa" 
              value={settings?.companyName || ''} 
              onChange={e => handleChange('companyName', e.target.value)} 
            />
            <Input 
              label="CNPJ / CPF" 
              placeholder="00.000.000/0000-00"
              value={settings?.cnpj || ''} 
              onChange={e => handleChange('cnpj', masks.cnpj(e.target.value))} 
            />
            <Input 
              label="Endereço Completo" 
              value={settings?.address || ''} 
              onChange={e => handleChange('address', e.target.value)} 
            />
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Telefone" 
                placeholder="(00) 0 0000-0000"
                value={settings?.phone || ''} 
                onChange={e => handleChange('phone', masks.phone(e.target.value))} 
                inputMode="tel"
              />
              <Input 
                label="Cor Principal (HEX)" 
                value={settings?.primaryColor || ''} 
                onChange={e => handleChange('primaryColor', e.target.value)} 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="E-mail" 
                value={settings?.email || ''} 
                onChange={e => handleChange('email', e.target.value)} 
              />
              <Input 
                label="Site" 
                value={settings?.website || ''} 
                onChange={e => handleChange('website', e.target.value)} 
              />
            </div>
          </div>
        </div>

        {/* Bloco: Padrões Comerciais */}
        <div className="card p-6 space-y-6">
          <h2 className="text-xl font-bold font-display text-gold border-b border-border pb-2">Padrões Comerciais</h2>
          <p className="text-xs text-muted mb-4">Esses valores serão pré-preenchidos ao criar uma nova proposta.</p>
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Entrada Padrão (%)" 
              type="number"
              value={settings?.defaultEntrada || ''} 
              onChange={e => handleChange('defaultEntrada', e.target.value)} 
            />
            <Input 
              label="Prazo Entrada (dias)" 
              type="number"
              value={settings?.defaultPrazoEntrada || ''} 
              onChange={e => handleChange('defaultPrazoEntrada', e.target.value)} 
            />
            <Input 
              label="Medição a cada (dias)" 
              type="number"
              value={settings?.defaultMedicao || ''} 
              onChange={e => handleChange('defaultMedicao', e.target.value)} 
            />
            <Input 
              label="Prazo após NF (dias)" 
              type="number"
              value={settings?.defaultPrazoNF || ''} 
              onChange={e => handleChange('defaultPrazoNF', e.target.value)} 
            />
            <Input 
              label="Validade (dias)" 
              type="number"
              value={settings?.defaultValidade || ''} 
              onChange={e => handleChange('defaultValidade', e.target.value)} 
            />
            <Input 
              label="Margem de Segurança Material (%)" 
              type="number"
              value={localMargin} 
              onChange={e => handleMarginChange(e.target.value)} 
              placeholder="Ex: 15"
            />
          </div>
          <div className="space-y-4 pt-2">
            <Input 
              label="Forma de Pagamento Padrão" 
              value={settings?.defaultFormaPagamento || ''} 
              onChange={e => handleChange('defaultFormaPagamento', e.target.value)} 
              placeholder="Ex: depósito bancário, PIX"
            />
          </div>
        </div>
      </div>


    </motion.div>
  );
};

export default Settings;
