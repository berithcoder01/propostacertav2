import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, Eye } from 'lucide-react';

/**
 * ProposalModelSelector
 * Componente para seleção do modelo de design da proposta (6 modelos HTML)
 */
const PROPOSAL_MODELS = [
  {
    id: 'industrial_bold',
    name: 'Industrial Bold',
    group: 'Industrial',
    description: 'Marinho profundo + laranja. Space Grotesk, faixa de total impactante. Para empresas de engenharia, elétrica e construção.',
    colors: ['#0F1E3C', '#E85A1A'],
  },
  {
    id: 'industrial_tech',
    name: 'Industrial Tech',
    group: 'Industrial',
    description: 'Grafite + ciano elétrico, tipografia JetBrains Mono. Estética de painel técnico para automação e TI.',
    colors: ['#1C2333', '#00C9B1'],
  },
  {
    id: 'industrial_classic',
    name: 'Industrial Classic',
    group: 'Industrial',
    description: 'Playfair Display, ornamentos editoriais dourados, fundo off-white. Seriedade com toque clássico.',
    colors: ['#1A1A1A', '#8B4513'],
  },
  {
    id: 'industrial_modern',
    name: 'Industrial Modern',
    group: 'Industrial',
    description: 'Barlow Condensed, preto + vermelho intenso, impacto máximo. Para obras, reformas e serviços pesados.',
    colors: ['#0A0A0A', '#C62828'],
  },
  {
    id: 'clean_champagne',
    name: 'Clean Champagne',
    group: 'Clean',
    description: 'Cormorant Garamond, fundo creme, dourado. Luxo discreto para consultoras, moda e decoração.',
    colors: ['#F5EFE2', '#C4A35A'],
  },
  {
    id: 'clean_salmon',
    name: 'Clean Salmon',
    group: 'Clean',
    description: 'DM Serif Display, salmão quente + marrom suave. Acolhedor e feminino para serviços e bem-estar.',
    colors: ['#FDF0EB', '#E8896A'],
  },
  {
    id: 'clean_elegant',
    name: 'Clean Elegant',
    group: 'Clean',
    description: 'Libre Baskerville, linhas douradas, editorial clássico. Consultórios, advocacia e serviços premium.',
    colors: ['#F9F6F2', '#7B6B5C'],
  },
  {
    id: 'clean_minimal',
    name: 'Clean Minimal',
    group: 'Clean',
    description: 'Manrope ultra-leve, espaçamento máximo, peso 200 e 800. Para quem deixa o trabalho falar por si.',
    colors: ['#0D0D0D', '#777777'],
  },
  {
    id: 'clean_tech',
    name: 'Clean Tech',
    group: 'Clean',
    description: 'IBM Plex Mono + Sans, estética de repositório de código, verde esmeralda. Para startups e tech.',
    colors: ['#161B22', '#0D9373'],
  },
];

const ProposalModelSelector = ({
  currentModel = 'industrial_bold',
  onSelect,
  showDescription = true,
  company = null,
}) => {
  const [selectedModel, setSelectedModel] = useState(currentModel);
  const [previewModel, setPreviewModel] = useState(null);
  const [previewHtml, setPreviewHtml] = useState('');
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  // Sync when the prop changes (e.g. after data loads from the API)
  useEffect(() => {
    if (currentModel && currentModel !== selectedModel) {
      setSelectedModel(currentModel);
    }
  }, [currentModel]);

  useEffect(() => {
    if (previewModel) {
      loadPreview(previewModel);
    }
  }, [previewModel, company]);

  const loadPreview = async (modelId) => {
    setIsPreviewLoading(true);
    try {
      const response = await fetch(`/modelos/${modelId}.html`);
      let html = await response.text();

      // Dados para o preview (reais da empresa ou dummy)
      const data = {
        LOGO_URL: company?.logoUrl || 'https://via.placeholder.com/200x80?text=Logo',
        COMPANY_NAME: company?.name || 'Sua Empresa Profissional',
        COMPANY_ADDRESS: company?.address || 'Av. Paulista, 1000 - São Paulo/SP',
        COMPANY_PHONE: company?.phone || '(11) 98888-7777',
        COMPANY_CNPJ: company?.cnpj || '00.000.000/0001-00',
        COMPANY_EMAIL: company?.email || 'contato@suaempresa.com.br',
        COMPANY_WEBSITE: company?.website || 'www.suaempresa.com.br',
        COMPANY_SLOGAN: company?.slogan || 'Qualidade e Compromisso com você.',
        PROPOSAL_NUM: '2024.042',
        PROPOSAL_DATE: new Date().toLocaleDateString('pt-BR'),
        CLIENT_NOME: 'Cliente Exemplo S/A',
        CLIENT_CONTATO: 'João Silva (Diretor)',
        CLIENT_LOCAL: 'Curitiba - PR',
        CLIENT_OBJETO: 'Implementação de sistema de monitoramento e automação industrial conforme levantamento técnico realizado anteriormente.',
        COND_VALIDADE: company?.defaultValidityDays || '15',
        COND_PRAZO_EXEC: company?.defaultExecutionPeriod || '30 dias úteis',
        COND_ENTRADA: company?.defaultDownPaymentPct || '20',
        COND_PRAZO_ENTRADA: company?.defaultDownPaymentDays || '0',
        COND_FORMA_PAGAMENTO: company?.defaultPaymentMethod || 'Depósito ou PIX',
        TOTAL_AMOUNT: 'R$ 12.500,00',
        PIX_KEY: company?.pixKey || 'pix@suaempresa.com.br',
      };

      // Substituição de placeholders
      Object.entries(data).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        html = html.replace(regex, value || '');
      });

      // Mock de itens
      const itemsHtml = `
        <tr><td>01</td><td>Instalação de Sensores</td><td style="text-align:center">10</td><td style="text-align:right">R$ 5.000,00</td></tr>
        <tr><td>02</td><td>Configuração de Painel</td><td style="text-align:center">01</td><td style="text-align:right">R$ 7.500,00</td></tr>
      `;
      html = html.replace('<!-- ITEMS_START -->', itemsHtml).replace('<!-- ITEMS_END -->', '');
      
      // Condicionais simples
      html = html.replace(/<!-- IF_PAGAMENTO -->[\s\S]*?<!-- ENDIF_PAGAMENTO -->/g, (match) => match.replace(/<!--.*?-->/g, ''));
      html = html.replace(/<!-- IF_PIX -->[\s\S]*?<!-- ENDIF_PIX -->/g, (match) => company?.pixKey ? match.replace(/<!--.*?-->/g, '') : '');

      setPreviewHtml(html);
    } catch (err) {
      console.error('Erro ao carregar preview:', err);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleSelect = (modelId) => {
    setSelectedModel(modelId);
    if (onSelect) {
      onSelect(modelId);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.08, delayChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    visible: { opacity: 1, scale: 1, y: 0 },
    selected: { scale: 1.02 },
  };



  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <div className="space-y-2 mb-4">
        <h3 className="text-lg font-bold font-display text-text-primary">
          Modelo de Design da Proposta
        </h3>
        <p className="text-sm text-muted">
          Escolha o modelo visual padrão para suas propostas. Você pode alterar a qualquer momento.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!previewModel ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {PROPOSAL_MODELS.map((model) => (
              <motion.div
                key={model.id}
                variants={itemVariants}
                animate={selectedModel === model.id ? 'selected' : 'visible'}
                className={`relative rounded-2xl border-2 transition-all overflow-hidden cursor-pointer group
                  ${selectedModel === model.id
                    ? 'border-accent bg-accent/5 shadow-lg shadow-accent/10'
                    : 'border-border bg-surface hover:border-border-strong'}`}
                onClick={() => handleSelect(model.id)}
              >
                {/* Preview de cores */}
                <div className="h-16 flex">
                  <div className="flex-1" style={{ backgroundColor: model.colors[0] }} />
                  <div className="flex-1" style={{ backgroundColor: model.colors[1] }} />
                </div>

                <div className="p-4 flex flex-col h-[calc(100%-4rem)]">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h5 className="font-bold text-text-primary text-sm group-hover:text-accent transition-colors">
                        {model.name}
                      </h5>
                      {showDescription && (
                        <p className="text-[10px] text-muted mt-1 leading-relaxed line-clamp-2">
                          {model.description}
                        </p>
                      )}
                    </div>
                    {selectedModel === model.id && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-2 w-6 h-6 rounded-full bg-accent flex items-center justify-center text-white flex-shrink-0">
                        <Check size={14} />
                      </motion.div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-auto pt-3">
                    <button
                      className={`flex-1 py-2 px-3 rounded-lg text-[10px] font-bold transition-all
                        ${selectedModel === model.id ? 'bg-accent text-white' : 'bg-bg text-muted hover:bg-bg/80'}`}
                    >
                      {selectedModel === model.id ? 'Selecionado' : 'Selecionar'}
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setPreviewModel(model.id); }}
                      className="py-2 px-3 rounded-lg text-xs font-bold bg-bg border border-border text-muted hover:text-white hover:border-accent transition-all flex items-center gap-1"
                      title="Visualizar modelo"
                    >
                      <Eye size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-surface border-2 border-accent/20 rounded-2xl overflow-hidden shadow-2xl"
          >
            <div className="flex justify-between items-center p-4 border-b border-border bg-black/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/20 rounded-lg">
                  <Eye size={16} className="text-accent" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">
                    Preview: {PROPOSAL_MODELS.find(m => m.id === previewModel)?.name}
                  </h4>
                  <p className="text-[10px] text-muted">Visualização realista com seus dados</p>
                </div>
              </div>
              <button
                onClick={() => setPreviewModel(null)}
                className="p-2 hover:bg-white/5 rounded-full text-muted hover:text-danger transition-all"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 bg-bg/50">
              <div className="aspect-[210/297] w-full max-w-2xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden border border-border relative">
                {isPreviewLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-white">
                    <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <iframe
                    srcDoc={previewHtml}
                    className="w-full h-full border-none"
                    title={`Preview ${previewModel}`}
                  />
                )}
              </div>
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => { handleSelect(previewModel); setPreviewModel(null); }}
                  className="px-8 py-3 bg-accent text-white font-bold rounded-xl shadow-lg shadow-accent/20 hover:scale-105 transition-all flex items-center gap-2"
                >
                  <Check size={18} /> Usar este Modelo
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProposalModelSelector;