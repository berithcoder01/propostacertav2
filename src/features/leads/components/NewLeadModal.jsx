import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Save, Loader2, MapPin, Phone, Mail, User, Hash, Info } from 'lucide-react';
import { createLead, aiSegmentLead, aiEnrichLead } from '../services/leadService';
import { useToast } from '../../../shared/context/ToastContext';

const NewLeadModal = ({ isOpen, onClose, onLeadCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    address: '',
    city: '',
    state: '',
    lat: '',
    lng: '',
    segment: 'RESIDENCIAL',
    source: 'MANUAL',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [autoDetecting, setAutoDetecting] = useState(false);
  const { toast } = useToast();

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const detectSegment = async () => {
    if (!formData.name && !formData.city) return;
    setAutoDetecting(true);
    try {
      const result = await aiSegmentLead(formData.name, '', formData.city, formData.state);
      if (result.segment) {
        setFormData(prev => ({ ...prev, segment: result.segment }));
        toast({ message: `Segmento detectado: ${result.segment} (${result.method})`, type: 'success' });
      }
    } catch (err) {
      toast({ message: 'Falha ao detectar segmento: ' + err.message, type: 'error' });
    } finally {
      setAutoDetecting(false);
    }
  };

  const enrichData = async () => {
    if (!formData.name) return;
    setAutoDetecting(true);
    try {
      const result = await aiEnrichLead(formData.name, formData.city, formData.state, formData.segment);
      if (result.suggestions) {
        setFormData(prev => ({
          ...prev,
          email: result.email || prev.email,
          phone: result.phone || prev.phone,
          whatsapp: result.whatsapp || prev.whatsapp
        }));
        toast({ message: 'Dados enriquecidos com IA!', type: 'success' });
      }
    } catch (err) {
      toast({ message: 'Falha ao enriquecer dados: ' + err.message, type: 'error' });
    } finally {
      setAutoDetecting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({ message: 'Nome do lead é obrigatório', type: 'warning' });
      return;
    }

    setLoading(true);
    try {
      const data = await createLead({
        name: formData.name.trim(),
        email: formData.email || null,
        phone: formData.phone || null,
        whatsapp: formData.whatsapp || null,
        address: formData.address || null,
        city: formData.city || null,
        state: formData.state || null,
        lat: formData.lat ? parseFloat(formData.lat) : null,
        lng: formData.lng ? parseFloat(formData.lng) : null,
        segment: formData.segment,
        source: formData.source,
        notes: formData.notes || null
      });
      toast({ message: `Lead "${data.name}" criado com sucesso!`, type: 'success' });
      onLeadCreated?.(data);
      setFormData({
        name: '', email: '', phone: '', whatsapp: '',
        address: '', city: '', state: '', lat: '', lng: '',
        segment: 'RESIDENCIAL', source: 'MANUAL', notes: ''
      });
      onClose();
    } catch (err) {
      toast({ message: 'Erro ao criar lead: ' + err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-surface border-2 border-border rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <User size={20} className="text-accent" />
                  <h3 className="text-xl font-bold font-display text-white">Novo Lead</h3>
                </div>
                <button onClick={onClose} className="p-2 rounded-xl bg-bg text-muted hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nome */}
                <div>
                  <label className="text-[10px] text-muted font-bold uppercase tracking-widest mb-1.5 block">
                    Nome / Empresa *
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => handleChange('name', e.target.value)}
                      placeholder="Nome da empresa ou pessoa"
                      className="w-full bg-bg border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none focus:border-accent"
                      required
                    />
                  </div>
                </div>

                {/* Segmento */}
                <div>
                  <label className="text-[10px] text-muted font-bold uppercase tracking-widest mb-1.5 block">
                    Segmento
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={formData.segment}
                      onChange={e => handleChange('segment', e.target.value)}
                      className="flex-1 bg-bg border border-border rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-accent"
                    >
                      <option value="RESIDENCIAL">Residencial</option>
                      <option value="COMERCIAL">Comercial</option>
                      <option value="INDUSTRIAL">Industrial</option>
                      <option value="CONDOMINIO">Condomínio</option>
                    </select>
                    <button
                      type="button"
                      onClick={detectSegment}
                      disabled={autoDetecting || !formData.name}
                      className="px-3 py-2.5 rounded-xl bg-accent/20 border border-accent/30 text-accent text-xs font-bold hover:bg-accent/30 disabled:opacity-40 transition-colors flex items-center gap-1"
                    >
                      {autoDetecting ? <Loader2 size={12} className="animate-spin" /> : <Info size={12} />}
                      IA
                    </button>
                  </div>
                </div>

                {/* Cidade / Estado */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-muted font-bold uppercase tracking-widest mb-1.5 block">
                      Cidade
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={e => handleChange('city', e.target.value)}
                      placeholder="Ex.: Maringá"
                      className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted font-bold uppercase tracking-widest mb-1.5 block">
                      Estado
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={e => handleChange('state', e.target.value)}
                      placeholder="Ex.: PR"
                      maxLength={2}
                      className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-accent text-center"
                    />
                  </div>
                </div>

                {/* Coordenadas */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-muted font-bold uppercase tracking-widest mb-1.5 block">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.lat}
                      onChange={e => handleChange('lat', e.target.value)}
                      placeholder="-23.123"
                      className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted font-bold uppercase tracking-widest mb-1.5 block">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.lng}
                      onChange={e => handleChange('lng', e.target.value)}
                      placeholder="-51.123"
                      className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-accent"
                    />
                  </div>
                </div>

                {/* Telefone / WhatsApp */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-muted font-bold uppercase tracking-widest mb-1.5 block">
                      Telefone
                    </label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={e => handleChange('phone', e.target.value)}
                        placeholder="(44) 9 9999-0000"
                        className="w-full bg-bg border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none focus:border-accent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-muted font-bold uppercase tracking-widest mb-1.5 block">
                      WhatsApp
                    </label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#25D366]" />
                      <input
                        type="tel"
                        value={formData.whatsapp}
                        onChange={e => handleChange('whatsapp', e.target.value)}
                        placeholder="(44) 9 99999-0000"
                        className="w-full bg-bg border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none focus:border-accent"
                      />
                    </div>
                  </div>
                </div>

                {/* E-mail */}
                <div>
                  <label className="text-[10px] text-muted font-bold uppercase tracking-widest mb-1.5 block">
                    E-mail
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={e => handleChange('email', e.target.value)}
                      placeholder="contato@empresa.com"
                      className="w-full bg-bg border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none focus:border-accent"
                    />
                  </div>
                </div>

                {/* Endereço */}
                <div>
                  <label className="text-[10px] text-muted font-bold uppercase tracking-widest mb-1.5 block">
                    Endereço
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={e => handleChange('address', e.target.value)}
                    placeholder="Rua Exemplo, 123"
                    className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-accent"
                  />
                </div>

                {/* Origem */}
                <div>
                  <label className="text-[10px] text-muted font-bold uppercase tracking-widest mb-1.5 block">
                    Origem
                  </label>
                  <select
                    value={formData.source}
                    onChange={e => handleChange('source', e.target.value)}
                    className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-accent"
                  >
                    <option value="MANUAL">Manual</option>
                    <option value="GOOGLE_PLACES">Google Places</option>
                    <option value="OSM">Open Street Map</option>
                    <option value="SCRAPING">Scraping</option>
                  </select>
                </div>

                {/* Notas */}
                <div>
                  <label className="text-[10px] text-muted font-bold uppercase tracking-widest mb-1.5 block">
                    Notas
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={e => handleChange('notes', e.target.value)}
                    placeholder="Observações sobre este lead..."
                    rows={3}
                    className="w-full bg-bg border border-border rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-accent resize-none"
                  />
                </div>

                {/* Enriquecer com IA */}
                <button
                  type="button"
                  onClick={enrichData}
                  disabled={autoDetecting || !formData.name}
                  className="w-full py-2.5 rounded-xl bg-surface/50 border border-border text-muted text-sm font-bold hover:text-white hover:border-accent transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {autoDetecting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  Enriquecer dados com IA
                </button>

                {/* Botão salvar */}
                <button
                  type="submit"
                  disabled={loading || !formData.name.trim()}
                  className="w-full py-3 rounded-xl bg-accent text-white font-black text-sm flex items-center justify-center gap-2 hover:bg-accent/90 disabled:opacity-40 transition-colors"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {loading ? 'Salvando...' : 'Salvar Lead'}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NewLeadModal;