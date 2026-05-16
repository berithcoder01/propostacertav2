import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Download, AlertCircle, Loader } from 'lucide-react';
import PdfGenerator from './components/PdfGenerator';
import Button from '../../shared/Button';

export default function PublicProposal() {
  const { token } = useParams();
  const [proposal, setProposal] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [triggerDownload, setTriggerDownload] = useState(false);

  useEffect(() => {
    const fetchProposal = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const res = await fetch(`${apiUrl}/public/proposals/${token}`);
        
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Proposta não encontrada.');
        }
        
        const data = await res.json();
        setProposal(data);
        if (data.status === 'APPROVED') setAccepted(true);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProposal();
  }, [token]);

  const handleDownload = () => {
    if (!proposal) return;
    setIsGenerating(true);
    setTriggerDownload(true);
  };

  const onDownloadDone = () => {
    setIsGenerating(false);
    setTriggerDownload(false);
  };

  const handleAccept = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const res = await fetch(`${apiUrl}/public/proposals/${token}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: proposal.clientContact || proposal.clientName })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao aceitar proposta');
      }

      setAccepted(true);
      alert('Obrigado! O fornecedor foi notificado sobre o seu aceite.');
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle size={48} className="text-danger mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Ops!</h1>
        <p className="text-muted">{error || 'Proposta não encontrada.'}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      {/* Navbar flutuante */}
      <div className="fixed top-0 left-0 right-0 bg-surface/80 backdrop-blur-md border-b border-border z-50 px-4 py-3 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="font-bold text-sm">Proposta {proposal.number}</span>
          <span className="text-[10px] text-muted">{proposal.company?.name}</span>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" className="px-3 py-2 text-sm" onClick={handleDownload} disabled={isGenerating}>
            {isGenerating ? <Loader size={16} className="animate-spin mr-2 inline" /> : <Download size={16} className="mr-2 inline" />}
            Baixar PDF
          </Button>
          {!accepted ? (
            <Button variant="success" className="px-4 py-2 text-sm font-bold" onClick={handleAccept}>
              <Check size={16} className="mr-2 inline" /> Aceitar Proposta
            </Button>
          ) : (
            <div className="bg-success/20 text-success px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
              <Check size={16} /> Aceita
            </div>
          )}
        </div>
      </div>

      {/* Container principal */}
      <div className="pt-20 pb-10 px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#e8e8e8] rounded-xl overflow-hidden shadow-2xl relative"
        >
          {/* Usamos o novo PdfGenerator em modo preview */}
          <div className="p-4 sm:p-8">
            <PdfGenerator 
                proposal={proposal} 
                isPreview={true}
                triggerDownload={triggerDownload}
                onDone={onDownloadDone}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
