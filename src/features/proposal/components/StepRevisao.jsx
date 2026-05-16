import React, { useState, useEffect, Suspense } from 'react';
import { ArrowLeft, Download, Loader, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../../../shared/Button';
import PdfGenerator from './PdfGenerator';
import ShareButton from './ShareButton';
import { useToast } from '../../../shared/context/ToastContext';
import { buildProposalRenderContext } from '../services/proposalRenderContext';

const ProfitabilityAnalysis = React.lazy(() => import('./ProfitabilityAnalysis'));

const StepRevisao = ({
  cliente, items, cond, propNum, companySettings,
  onBack, onGenerate, proposalId, savedProposal,
  visible = true, segment, activeBlocks,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showProfitability, setShowProfitability] = useState(false);
  const [renderCtx, setRenderCtx] = useState(null);
  const [triggerDownload, setTriggerDownload] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (visible) setShowProfitability(true);
  }, [visible]);

  useEffect(() => {
    if (!visible) return;

    const conditionsFromForm = [{
      downPayment:     parseFloat(cond.entrada)      || 0,
      downPaymentDays: parseInt(cond.prazoEntrada)   || 0,
      measurementDays: parseInt(cond.medicao)        || 0,
      paymentNfDays:   parseInt(cond.prazoNF)        || 0,
      validityDays:    parseInt(cond.validade)       || 60,
      executionPeriod: cond.prazoExec                || '',
      paymentTerms:    cond.formaPagamento           || '',
      observations:    cond.obs                      || '',
      warrantyPeriod:  cond.warrantyPeriod           || '5',
      warrantyType:    cond.warrantyType             || 'ANOS',
      showWarranties:  cond.showGarantias            !== false,
      showPagamento:   cond.showPagamento            !== false,
      showTaxes:       cond.showImpostos             !== false,
      showMultas:      cond.showMultas               === true,
      impostoDAS:      cond.impostoDAS,
      impostoISS:      cond.impostoISS,
      impostoIPI:      cond.impostoIPI,
      impostoDIFAL:    cond.impostoDIFAL,
      multaDiaria:     cond.multaDiaria,
      multaLimite:     cond.multaLimite,
    }];

    const proposalForCtx = savedProposal
      ? { ...savedProposal, conditions: conditionsFromForm }
      : {
          conditions: conditionsFromForm,
          segmentData: { tipoProposta: cond.tipoProposta },
          metadata:    { tipoProposta: cond.tipoProposta },
          templateId: null,
        };

    buildProposalRenderContext({ proposal: proposalForCtx })
      .then(ctx => {
        setRenderCtx({
          ...ctx,
          cond: {
            ...ctx.cond,
            showPagamento:  cond.showPagamento  !== false,
            showWarranties: cond.showGarantias  !== false,
            showImpostos:   cond.showImpostos   !== false,
            showMultas:     cond.showMultas     === true,
            customFields:   cond.customFields   || [],
          },
        });
      })
      .catch(() => {
        setRenderCtx({
          companySettings,
          cond: {
            ...cond,
            showWarranties: cond.showGarantias !== false,
          },
          activeBlocks: activeBlocks || ['escopo', 'condicoes', 'garantia', 'observacoes'],
        });
      });
  }, [visible, savedProposal, cond, companySettings, activeBlocks]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await onGenerate();
      setTriggerDownload(true);
    } catch (err) {
      toast({ message: 'Erro ao salvar proposta: ' + (err.message || 'Tente novamente.'), type: 'error' });
      console.error(err);
      setIsGenerating(false);
    }
  };

  const onDownloadDone = () => {
    setIsGenerating(false);
    setTriggerDownload(false);
  };

  // Prepara objeto de proposta para o PdfGenerator
  const proposalForPdf = {
    number: propNum,
    clientName: cliente.nome,
    clientContact: cliente.contato,
    clientRole: cliente.cargo,
    clientLocation: cliente.local,
    clientPhone: cliente.tel,
    object: cliente.objeto,
    items: items.map(i => ({
      label: i.label,
      unit: i.unit,
      quantity: i.qty,
      unitPrice: i.price
    })),
    conditions: renderCtx?.cond ? [renderCtx.cond] : []
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      
      {/* Motor de PDF Unificado (Invisível no Preview, mas gera o PDF) */}
      <div style={{ position: 'fixed', left: '-9999px', top: 0, pointerEvents: 'none' }}>
        <PdfGenerator 
          proposal={proposalForPdf} 
          triggerDownload={triggerDownload} 
          onDone={onDownloadDone}
        />
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold font-display mb-2">Revisão da Proposta</h2>
          <p className="text-muted text-sm">
            Confira o documento abaixo — ele será gerado <strong className="text-white">exatamente assim</strong> em PDF.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowProfitability(!showProfitability)}
            className={`p-2 rounded-xl transition-colors ${
              showProfitability
                ? 'bg-accent/20 text-accent'
                : 'bg-surface text-muted hover:text-accent border border-border'
            }`}
            title="Análise de lucratividade"
          >
            <BarChart3 size={18} />
          </button>
        </div>
      </div>

      {/* Preview do documento usando o PdfGenerator em modo preview */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-border shadow-2xl">
        <div className="bg-surface px-4 py-2 border-b border-border flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-danger/70" />
          <div className="w-3 h-3 rounded-full bg-gold/70" />
          <div className="w-3 h-3 rounded-full bg-success/70" />
          <span className="ml-3 text-[10px] font-bold text-muted uppercase tracking-widest">
            Preview — Proposta {propNum}
          </span>
        </div>

        <div className="overflow-auto bg-[#e8e8e8] p-6" style={{ maxHeight: '70vh' }}>
          <div style={{ transform: 'scale(0.82)', transformOrigin: 'top center' }}>
             <PdfGenerator 
                proposal={proposalForPdf} 
                isPreview={true}
             />
          </div>
        </div>
      </div>

      {/* Análise de lucratividade */}
      {proposalId && (
        <Suspense fallback={<div className="text-center py-4 text-muted">Carregando análise...</div>}>
          {showProfitability && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <ProfitabilityAnalysis proposalId={proposalId} proposal={savedProposal} visible={showProfitability} />
              </motion.div>
            </AnimatePresence>
          )}
        </Suspense>
      )}

      {/* Ações */}
      <div className="flex flex-col gap-3 pt-2">
        <div className="flex justify-between items-center gap-3">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2" disabled={isGenerating}>
            <ArrowLeft size={18} /> Voltar
          </Button>

          <div className="flex gap-2">
            <ShareButton
              proposalId={proposalId}
              clientName={cliente.contato || cliente.nome}
              variant="icon"
            />

            <Button
              variant="success"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex items-center gap-3 px-10"
            >
              {isGenerating ? (
                <><Loader size={18} className="animate-spin" /> Gerando PDF...</>
              ) : (
                <><Download size={18} /> Baixar PDF</>
              )}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StepRevisao;
