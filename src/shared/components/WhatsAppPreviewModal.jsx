/**
 * WhatsAppPreviewModal.jsx
 * Modal que exibe o preview da mensagem WhatsApp antes de abrir o app.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, ExternalLink, CheckCheck, Smartphone } from 'lucide-react';
import { useToast } from '../context/ToastContext';

// ─── Simulador de bolha WhatsApp ─────────────────────────────────────────────

/**
 * Converte o texto formatado WhatsApp para JSX visual.
 * Reconhece: *negrito*, _itálico_, `monospace`, quebras de linha.
 */
function renderWhatsAppText(text) {
  if (!text) return null;

  return text.split('\n').map((line, lineIdx) => {
    // Bloco monospace (``` ... ```) — detecta linhas entre delimitadores
    if (line === '```') return null; // delimitador oculto

    // Aplica formatação inline
    const parts = [];
    let remaining = line;
    let key = 0;

    while (remaining.length > 0) {
      // *negrito*
      const boldMatch = remaining.match(/^\*([^*]+)\*/);
      if (boldMatch) {
        parts.push(<strong key={key++}>{boldMatch[1]}</strong>);
        remaining = remaining.slice(boldMatch[0].length);
        continue;
      }
      // _itálico_
      const italicMatch = remaining.match(/^_([^_]+)_/);
      if (italicMatch) {
        parts.push(<em key={key++}>{italicMatch[1]}</em>);
        remaining = remaining.slice(italicMatch[0].length);
        continue;
      }
      // `mono`
      const monoMatch = remaining.match(/^`([^`]+)`/);
      if (monoMatch) {
        parts.push(
          <code key={key++} style={{ fontFamily: 'monospace', background: 'rgba(0,0,0,0.06)', padding: '1px 4px', borderRadius: 3, fontSize: '0.9em' }}>
            {monoMatch[1]}
          </code>
        );
        remaining = remaining.slice(monoMatch[0].length);
        continue;
      }
      // Texto normal (consome até o próximo caractere especial)
      const normalMatch = remaining.match(/^[^*_`]+/);
      if (normalMatch) {
        parts.push(<span key={key++}>{normalMatch[0]}</span>);
        remaining = remaining.slice(normalMatch[0].length);
        continue;
      }
      // Fallback: consome 1 char
      parts.push(<span key={key++}>{remaining[0]}</span>);
      remaining = remaining.slice(1);
    }

    return (
      <div key={lineIdx} style={{ minHeight: line === '' ? '0.6em' : undefined }}>
        {parts}
      </div>
    );
  }).filter(Boolean);
}

/**
 * Renderiza o texto com blocos monospace corretamente agrupados.
 */
function WhatsAppBubble({ msg }) {
  if (!msg) return null;

  // Separa blocos mono (entre ```) do resto
  const segments = [];
  let isMono = false;
  let buffer = [];

  msg.split('\n').forEach((line) => {
    if (line === '```') {
      if (isMono) {
        segments.push({ type: 'mono', lines: buffer });
        buffer = [];
      } else {
        if (buffer.length > 0) {
          segments.push({ type: 'text', lines: buffer });
          buffer = [];
        }
      }
      isMono = !isMono;
    } else {
      buffer.push(line);
    }
  });
  if (buffer.length > 0) segments.push({ type: isMono ? 'mono' : 'text', lines: buffer });

  return (
    <div style={{
      background: '#DCF8C6',
      borderRadius: '12px 12px 0 12px',
      padding: '10px 14px',
      maxWidth: '100%',
      fontSize: 13,
      lineHeight: 1.5,
      color: '#111',
      boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
      wordBreak: 'break-word',
    }}>
      {segments.map((seg, i) => {
        if (seg.type === 'mono') {
          return (
            <pre key={i} style={{
              fontFamily: "'Courier New', monospace",
              fontSize: 11,
              background: 'rgba(0,0,0,0.06)',
              borderRadius: 6,
              padding: '6px 8px',
              margin: '6px 0',
              overflowX: 'auto',
              whiteSpace: 'pre',
              lineHeight: 1.4,
            }}>
              {seg.lines.join('\n')}
            </pre>
          );
        }
        return (
          <div key={i}>
            {seg.lines.map((line, j) => (
              <div key={j} style={{ minHeight: line === '' ? '0.5em' : undefined }}>
                {renderWhatsAppText(line)}
              </div>
            ))}
          </div>
        );
      })}
      {/* Horário simulado */}
      <div style={{ textAlign: 'right', fontSize: 10, color: '#666', marginTop: 4 }}>
        {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        {' '}
        <CheckCheck size={12} style={{ display: 'inline', color: '#53BDEB' }} />
      </div>
    </div>
  );
}

// ─── Modal Principal ──────────────────────────────────────────────────────────

export default function WhatsAppPreviewModal({ msg, waUrl, clientName, onClose }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(msg);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ message: 'Mensagem copiada!', type: 'success' });
    } catch {
      toast({ message: 'Não foi possível copiar.', type: 'error' });
    }
  };

  const handleOpen = () => {
    window.open(waUrl, '_blank');
    onClose();
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-end justify-center px-3"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
      >
        {/* Overlay */}
        <motion.div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Painel */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 380, damping: 36 }}
          className="relative w-full max-w-lg z-10 flex flex-col"
          style={{ maxHeight: '88vh' }}
        >
          {/* Header do painel */}
          <div className="bg-[#075E54] rounded-t-2xl px-4 py-3 flex items-center gap-3">
            {/* Avatar simulado */}
            <div style={{
              width: 38, height: 38, borderRadius: '50%',
              background: '#25D366',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Smartphone size={18} color="#fff" />
            </div>
            <div className="flex-1 min-w-0">
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>
                {clientName || 'Cliente'}
              </div>
              <div style={{ color: '#A8D5B5', fontSize: 11 }}>Preview da mensagem</div>
            </div>
            <button onClick={onClose} style={{ color: '#A8D5B5' }}>
              <X size={20} />
            </button>
          </div>

          {/* Área de chat simulada */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              background: `#E5DDD5 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='400' height='400' fill='%23e5ddd5'/%3E%3C/svg%3E")`,
              padding: '16px 12px',
            }}
          >
            <WhatsAppBubble msg={msg} />
          </div>

          {/* Barra de ações */}
          <div className="bg-[#F0F0F0] rounded-b-2xl px-4 py-3 flex gap-3">
            <button
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all shadow-sm"
              style={{
                background: copied ? '#25D366' : '#fff',
                color: copied ? '#fff' : '#333',
                border: '1.5px solid #ddd',
              }}
            >
              <Copy size={15} />
              {copied ? 'Copiado!' : 'Copiar texto'}
            </button>
            <button
              onClick={handleOpen}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95"
              style={{ background: '#25D366', color: '#fff' }}
            >
              <ExternalLink size={15} />
              Abrir WhatsApp
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
