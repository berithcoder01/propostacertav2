import React, { useEffect, useState } from 'react';
import { buildProposalRenderContext } from '../services/proposalRenderContext';
import { renderTemplate } from '../services/templateEngine';
import { htmlToPdf } from '../services/htmlToPdf';

/**
 * PdfGenerator component
 * Responsável por renderizar o template HTML e gerar o arquivo PDF.
 * Unifica o motor de geração de PDF usando modelos HTML.
 */
const PdfGenerator = ({ proposal, onDone, triggerDownload, isPreview }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewHtml, setPreviewHtml] = useState(null);

  // Helper function to build template data
  const getTemplateData = async () => {
    const ctx = await buildProposalRenderContext({ 
      proposal, 
      templateId: proposal?.templateId 
    });
    const modelo = ctx.modelo || 'industrial_bold';
    const templateData = {
      propNum: proposal?.number || ctx.propNum || '',
      todayDate: ctx.todayDate || new Date().toLocaleDateString('pt-BR', { 
        day: '2-digit', month: 'long', year: 'numeric' 
      }),
      cliente: ctx.cliente,
      companySettings: ctx.companySettings,
      cond: ctx.cond,
      items: ctx.items,
      total: ctx.total,
    };
    return { modelo, templateData };
  };

  useEffect(() => {
    if (isPreview && proposal) {
      loadPreview();
    }
  }, [isPreview, proposal]);

  const loadPreview = async () => {
    try {
      const { modelo, templateData } = await getTemplateData();
      const html = await renderTemplate(modelo, templateData);
      setPreviewHtml(html);
    } catch (error) {
      console.error('Erro ao carregar preview:', error);
      setPreviewHtml('<div style="padding:20px;color:red;font-family:sans-serif;">Erro ao carregar preview do modelo.</div>');
    }
  };

  useEffect(() => {
    if (triggerDownload && !isGenerating && proposal) {
      handleGenerate();
    }
  }, [triggerDownload, proposal]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const { modelo, templateData } = await getTemplateData();

      // Renderiza o HTML usando o modelo selecionado
      const html = await renderTemplate(modelo, templateData);
      if (!html) {
        throw new Error(`Modelo "${modelo}" não encontrado ou falha na renderização.`);
      }

      // Converte o HTML para PDF (Blob)
      const filename = `Proposta_${(proposal?.number || 'rascunho').replace(/\//g, '-')}_${(proposal?.clientName || 'cliente').replace(/\s+/g, '_')}.pdf`;
      const blob = await htmlToPdf(html, filename);
      
      if (!blob) {
        throw new Error('Falha ao gerar o arquivo PDF.');
      }

      // Lógica de Download / Compartilhamento (Web e Mobile)
      if (window.Capacitor && window.Capacitor.isNativePlatform()) {
        const { Filesystem, Directory } = await import('@capacitor/filesystem');
        const { Share } = await import('@capacitor/share');

        const reader = new FileReader();
        const base64Promise = new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result.split(',')[1]);
          reader.readAsDataURL(blob);
        });
        const base64Data = await base64Promise;

        const savedFile = await Filesystem.writeFile({
          path: filename,
          data: base64Data,
          directory: Directory.Cache
        });

        await Share.share({
          title: 'Abrir Proposta',
          text: `Proposta ${proposal?.number || ''}`,
          url: savedFile.uri,
          dialogTitle: 'Abrir com...'
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 100);
      }

    } catch (error) {
      console.error('Erro na geração do PDF:', error);
      alert('Erro ao gerar PDF: ' + error.message);
    } finally {
      setIsGenerating(false);
      if (onDone) onDone();
    }
  };

  if (isPreview) {
    if (!previewHtml) {
      return (
        <div className="flex items-center justify-center p-10 text-muted" style={{ width: '210mm', height: '297mm', background: 'white' }}>
          <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin mr-3" />
          <span className="font-bold">Montando documento...</span>
        </div>
      );
    }
    return (
      <iframe
        srcDoc={previewHtml}
        style={{ width: '210mm', height: '297mm', border: 'none', background: 'white', display: 'block', margin: '0 auto', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
        title="PDF Preview"
      />
    );
  }

  if (!isGenerating) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="bg-surface p-8 rounded-3xl border-2 border-border shadow-2xl flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-white font-bold">Gerando sua proposta...</p>
        <p className="text-muted text-xs">Aplicando modelo de design e preparando PDF</p>
      </div>
    </div>
  );
};

export default PdfGenerator;
